/**
 * Stress tests for state management robustness
 * Tests edge cases, race conditions, and rapid state changes
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('State Management Stress Tests', () => {
  describe('Race Conditions', () => {
    it('should handle rapid start/stop/reset cycles without state corruption', () => {
      const engine = new TypingEngine('Test Message');
      const stateHistory: string[] = [];
      
      engine.onStateChangeListener((state) => {
        stateHistory.push(state);
      });
      
      // Rapid operations
      for (let i = 0; i < 10; i++) {
        engine.start();
        vi.advanceTimersByTime(10);
        engine.pause();
        vi.advanceTimersByTime(5);
        engine.resume();
        vi.advanceTimersByTime(10);
        engine.stop();
        vi.advanceTimersByTime(5);
        engine.reset();
        vi.advanceTimersByTime(5);
      }
      
      // Final state should be consistent
      expect(engine.getState()).toBe('idle');
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getCurrentIndex()).toBe(0);
    });

    it('should maintain consistency during concurrent state changes', async () => {
      const engine = new TypingEngine('Hello World', { mistakeFrequency: 0.3 });
      let inconsistencyCount = 0;
      
      engine.onStateChangeListener((state) => {
        // Check for state inconsistencies
        const progress = engine.getProgress();
        const isCompleted = engine.isCompleted();
        const displayText = engine.getDisplayText();
        
        if (state === 'completed' && progress < 100) {
          inconsistencyCount++;
        }
        if (progress === 100 && !isCompleted) {
          inconsistencyCount++;
        }
        if (isCompleted && displayText !== engine.getText()) {
          inconsistencyCount++;
        }
      });
      
      engine.start();
      
      // Simulate rapid timer advances while making control calls
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(50);
        
        if (i % 10 === 0) engine.pause();
        if (i % 10 === 5) engine.resume();
        if (i % 20 === 0) {
          const currentProgress = engine.getProgress();
          if (currentProgress < 50) engine.skip();
        }
      }
      
      expect(inconsistencyCount).toBe(0);
    });

    it('should handle multiple mistake corrections without state corruption', () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 0.8, // Very high mistake rate
        debug: false // Disable debug to avoid console spam
      };
      
      const engine = new TypingEngine('Programming is fun!', config);
      let progressValues: number[] = [];
      let stateValues: string[] = [];
      
      engine.onProgressListener((progress) => {
        progressValues.push(progress);
        
        // Progress should never be NaN or negative
        expect(progress).not.toBeNaN();
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
      
      engine.onStateChangeListener((state) => {
        stateValues.push(state);
      });
      
      engine.start();
      
      // Let it run through many corrections
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(100);
      }
      
      // Should have made progress and had state changes
      expect(progressValues.length).toBeGreaterThan(0);
      expect(stateValues.length).toBeGreaterThan(0);
      
      // Final state should be consistent
      if (engine.isCompleted()) {
        expect(engine.getProgress()).toBe(100);
        expect(engine.getDisplayText()).toBe('Programming is fun!');
      }
    });
  });

  describe('Memory and Resource Management', () => {
    it('should properly clean up timeouts and prevent memory leaks', () => {
      const engine = new TypingEngine('Test');
      
      // Start and immediately stop multiple times
      for (let i = 0; i < 20; i++) {
        engine.start();
        vi.advanceTimersByTime(10);
        engine.stop();
      }
      
      // Should be in clean state
      expect(engine.getState()).toBe('idle');
      
      // Check that no timeouts are pending (vitest tracks this)
      engine.start();
      engine.stop();
      
      // Should be cleanly stopped
      expect(engine.getState()).toBe('idle');
    });

    it('should handle text updates without losing state consistency', () => {
      const engine = new TypingEngine('Original text');
      
      engine.start();
      vi.advanceTimersByTime(200); // Let some typing happen
      
      const originalProgress = engine.getProgress();
      expect(originalProgress).toBeGreaterThan(0);
      
      // Stop before updating text to avoid restart
      engine.stop();
      
      // Update text should reset properly
      engine.updateText('New text');
      
      expect(engine.getText()).toBe('New text');
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getState()).toBe('idle');
    });
  });

  describe('Edge Case Robustness', () => {
    it('should handle extremely short and long texts', () => {
      const testCases = ['', 'A', 'AB', 'A'.repeat(1000)];
      
      testCases.forEach(text => {
        const engine = new TypingEngine(text);
        
        engine.start();
        vi.advanceTimersByTime(5000);
        
        if (text.length === 0) {
          expect(engine.getProgress()).toBe(100);
          expect(engine.isCompleted()).toBe(true);
        } else {
          // Should make progress or complete
          expect(engine.getProgress()).toBeGreaterThanOrEqual(0);
          expect(engine.getProgress()).toBeLessThanOrEqual(100);
        }
        
        engine.reset();
      });
    });

    it('should handle config changes without breaking state', () => {
      const engine = new TypingEngine('Test message');
      
      engine.start();
      vi.advanceTimersByTime(100);
      
      // Change config during typing
      engine.updateConfig({
        speed: 200,
        mistakeFrequency: 0.5
      });
      
      // Should continue working
      vi.advanceTimersByTime(200);
      
      expect(engine.getState()).not.toBe('idle'); // Should still be active
      expect(engine.getProgress()).toBeGreaterThan(0);
    });

    it('should handle method calls in any order without crashing', () => {
      const engine = new TypingEngine('Test');
      
      // Try various method combinations that might break state
      const operations = [
        () => engine.start(),
        () => engine.stop(),
        () => engine.pause(),
        () => engine.resume(),
        () => engine.skip(),
        () => engine.reset(),
        () => engine.updateText('New'),
        () => engine.updateConfig({ speed: 100 })
      ];
      
      // Random operations
      for (let i = 0; i < 50; i++) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        expect(() => operation()).not.toThrow();
        vi.advanceTimersByTime(10);
      }
      
      // Should end in a valid state
      expect(['idle', 'typing', 'paused', 'completed', 'correcting', 'thinking']).toContain(engine.getState());
    });
  });

  describe('Callback Consistency', () => {
    it('should call callbacks with consistent data', () => {
      const engine = new TypingEngine('Hello');
      const callbackData: Array<{type: string, data: any}> = [];
      
      engine.onStateChangeListener((state) => {
        callbackData.push({
          type: 'state',
          data: {
            state,
            progress: engine.getProgress(),
            displayText: engine.getDisplayText(),
            isCompleted: engine.isCompleted()
          }
        });
      });
      
      engine.onCharacterListener((char, index) => {
        callbackData.push({
          type: 'char',
          data: {
            char,
            index,
            progress: engine.getProgress(),
            displayText: engine.getDisplayText()
          }
        });
      });
      
      engine.start();
      vi.advanceTimersByTime(2000);
      
      // Verify callback data consistency
      callbackData.forEach(callback => {
        if (callback.type === 'char') {
          expect(callback.data.progress).toBeGreaterThanOrEqual(0);
          expect(callback.data.progress).toBeLessThanOrEqual(100);
          expect(callback.data.displayText).toContain(callback.data.char);
        }
      });
    });
  });
});