/**
 * Test suite for state management fixes
 * Tests the issues reported by the user:
 * 1. Progress reaching 100% while typing continues
 * 2. State showing "completed" while corrections are still happening
 * 3. Hook values getting out of sync
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

// Mock timers for deterministic testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('State Management Fixes', () => {
  describe('Progress Calculation', () => {
    it('should not reach 100% while corrections are pending', async () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 0.8, // High mistake rate to ensure corrections
        debug: true
      };
      
      const engine = new TypingEngine('Hello', config);
      const progressValues: number[] = [];
      
      engine.onProgressListener((progress) => {
        progressValues.push(progress);
      });
      
      engine.start();
      
      // Fast-forward through typing with mistakes
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(100);
      }
      
      // Check that progress never reaches 100% while corrections are pending
      const uncorrectedMistakes = engine.getUncorrectedMistakes();
      const queuedCorrections = engine.getCorrectionQueue();
      
      if (uncorrectedMistakes.length > 0 || queuedCorrections.length > 0) {
        const maxProgress = Math.max(...progressValues);
        expect(maxProgress).toBeLessThan(100);
      }
    });

    it('should reach 100% only when truly completed', async () => {
      const engine = new TypingEngine('Hi', { mistakeFrequency: 0 });
      let finalProgress = 0;
      let completedCalled = false;
      
      engine.onProgressListener((progress) => {
        finalProgress = progress;
      });
      
      engine.onCompleteListener(() => {
        completedCalled = true;
      });
      
      engine.start();
      
      // Wait for completion
      vi.advanceTimersByTime(5000);
      
      if (completedCalled) {
        expect(finalProgress).toBe(100);
        expect(engine.getUncorrectedMistakes()).toHaveLength(0);
        expect(engine.getCorrectionQueue()).toHaveLength(0);
      }
    });
  });

  describe('State Consistency', () => {
    it('should not report completed state while corrections are pending', async () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 0.5, // Medium mistake rate
        debug: true
      };
      
      const engine = new TypingEngine('Test', config);
      const stateChanges: string[] = [];
      
      engine.onStateChangeListener((state) => {
        stateChanges.push(state);
        
        // If state is completed, ensure no pending work
        if (state === 'completed') {
          const uncorrected = engine.getUncorrectedMistakes();
          const queued = engine.getCorrectionQueue();
          
          expect(uncorrected).toHaveLength(0);
          expect(queued).toHaveLength(0);
          expect(engine.getCurrentIndex()).toBe(engine.getText().length);
        }
      });
      
      engine.start();
      
      // Let it run through completion
      vi.advanceTimersByTime(10000);
      
      // Should have reached completed state eventually
      expect(stateChanges).toContain('completed');
    });

    it('should maintain accurate isTyping state', () => {
      const engine = new TypingEngine('Test');
      
      expect(engine.isTyping()).toBe(false);
      
      engine.start();
      expect(engine.isTyping()).toBe(true);
      
      engine.pause();
      expect(engine.isTyping()).toBe(false);
      
      engine.resume();
      expect(engine.isTyping()).toBe(true);
      
      engine.stop();
      expect(engine.isTyping()).toBe(false);
    });
  });

  describe('Engine Method Consistency', () => {
    it('should synchronize skip() method properly', () => {
      const engine = new TypingEngine('Hello World');
      let completedCalled = false;
      
      engine.onCompleteListener(() => {
        completedCalled = true;
      });
      
      engine.start();
      vi.advanceTimersByTime(100); // Start typing
      
      engine.skip();
      
      expect(engine.getDisplayText()).toBe('Hello World');
      expect(engine.getProgress()).toBe(100);
      expect(engine.isCompleted()).toBe(true);
      expect(completedCalled).toBe(true);
    });

    it('should synchronize reset() method properly', () => {
      const engine = new TypingEngine('Test');
      
      engine.start();
      vi.advanceTimersByTime(500); // Let some typing happen
      
      const beforeReset = {
        displayText: engine.getDisplayText(),
        progress: engine.getProgress(),
        mistakes: engine.getMistakes().length
      };
      
      engine.reset();
      
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getMistakes()).toHaveLength(0);
      expect(engine.getCurrentIndex()).toBe(0);
      expect(engine.getState()).toBe('idle');
      
      // Ensure something actually happened before reset
      expect(beforeReset.displayText.length > 0 || beforeReset.progress > 0).toBe(true);
    });
  });

  describe('Mistake Handling', () => {
    it('should handle corrections without breaking state', async () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 1.0, // Force mistakes
        debug: true
      };
      
      const engine = new TypingEngine('Hi', config);
      let mistakeCount = 0;
      let backspaceCount = 0;
      
      engine.onMistakeListener(() => {
        mistakeCount++;
      });
      
      engine.onBackspaceListener(() => {
        backspaceCount++;
      });
      
      engine.start();
      
      // Let typing and corrections happen
      vi.advanceTimersByTime(10000);
      
      // Should have made mistakes and corrections
      expect(mistakeCount).toBeGreaterThan(0);
      expect(backspaceCount).toBeGreaterThan(0);
      
      // Final state should be consistent
      if (engine.isCompleted()) {
        expect(engine.getDisplayText()).toBe('Hi');
        expect(engine.getProgress()).toBe(100);
        expect(engine.getUncorrectedMistakes()).toHaveLength(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text correctly', () => {
      const engine = new TypingEngine('');
      let completedCalled = false;
      
      engine.onCompleteListener(() => {
        completedCalled = true;
      });
      
      engine.start();
      vi.advanceTimersByTime(100);
      
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(100);
      expect(engine.isCompleted()).toBe(true);
      expect(completedCalled).toBe(true);
    });

    it('should handle single character text', () => {
      const engine = new TypingEngine('A');
      
      engine.start();
      vi.advanceTimersByTime(1000);
      
      expect(engine.getDisplayText()).toBe('A');
      expect(engine.getProgress()).toBe(100);
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle multiple rapid control method calls', () => {
      const engine = new TypingEngine('Test');
      
      // Rapid calls shouldn't break state
      engine.start();
      engine.pause();
      engine.resume();
      engine.pause();
      engine.resume();
      engine.stop();
      engine.reset();
      
      expect(engine.getState()).toBe('idle');
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
    });
  });
});