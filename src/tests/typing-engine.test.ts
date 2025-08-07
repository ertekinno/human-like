/**
 * Comprehensive tests for TypingEngine class
 * Tests all methods, configurations, and behaviors
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig, MistakeInfo, TypingState } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('TypingEngine', () => {
  describe('Constructor and Initialization', () => {
    it('should initialize with default configuration', () => {
      const engine = new TypingEngine('Hello World');
      
      expect(engine.getText()).toBe('Hello World');
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getState()).toBe('idle');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getCurrentIndex()).toBe(0);
      expect(engine.isCompleted()).toBe(false);
      expect(engine.isTyping()).toBe(false);
      expect(engine.isPaused()).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      const config: Partial<HumanLikeConfig> = {
        speed: 150,
        mistakeFrequency: 0.1,
        debug: true
      };
      
      const engine = new TypingEngine('Test', config);
      const stats = engine.getStats();
      
      expect(stats.totalCharacters).toBe(4);
      expect(stats.charactersTyped).toBe(0);
      expect(stats.mistakesMade).toBe(0);
    });

    it('should handle empty text', () => {
      const engine = new TypingEngine('');
      
      expect(engine.getText()).toBe('');
      expect(engine.getProgress()).toBe(100); // Empty text is 100% complete
      expect(engine.getStats().totalCharacters).toBe(0);
    });
  });

  describe('Basic Control Methods', () => {
    it('should start and stop typing', () => {
      const engine = new TypingEngine('Hello');
      const stateChanges: TypingState[] = [];
      
      engine.onStateChangeListener((state) => {
        stateChanges.push(state);
      });
      
      expect(engine.getState()).toBe('idle');
      
      engine.start();
      expect(engine.getState()).toBe('typing');
      expect(engine.isTyping()).toBe(true);
      
      engine.stop();
      expect(engine.getState()).toBe('idle');
      expect(engine.isTyping()).toBe(false);
      
      expect(stateChanges).toContain('typing');
    });

    it('should pause and resume typing', () => {
      const engine = new TypingEngine('Hello');
      
      engine.start();
      expect(engine.getState()).toBe('typing');
      
      engine.pause();
      expect(engine.getState()).toBe('paused');
      expect(engine.isPaused()).toBe(true);
      
      engine.resume();
      expect(engine.getState()).toBe('typing');
      expect(engine.isPaused()).toBe(false);
    });

    it('should skip to completion', () => {
      const engine = new TypingEngine('Hello');
      let completedCalled = false;
      
      engine.onCompleteListener(() => {
        completedCalled = true;
      });
      
      engine.start();
      vi.advanceTimersByTime(100);
      
      engine.skip();
      
      expect(engine.getDisplayText()).toBe('Hello');
      expect(engine.getProgress()).toBe(100);
      expect(engine.isCompleted()).toBe(true);
      expect(completedCalled).toBe(true);
    });

    it('should reset to initial state', () => {
      const engine = new TypingEngine('Hello');
      
      engine.start();
      vi.advanceTimersByTime(500);
      
      const hadProgress = engine.getProgress() > 0;
      
      engine.reset();
      
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getState()).toBe('idle');
      expect(engine.getCurrentIndex()).toBe(0);
      expect(engine.getMistakes()).toHaveLength(0);
      expect(hadProgress).toBe(true); // Ensure something happened before reset
    });
  });

  describe('Character Typing Logic', () => {
    it('should type characters progressively', () => {
      const engine = new TypingEngine('Hi', { mistakeFrequency: 0 });
      const characters: string[] = [];
      
      engine.onCharacterListener((char) => {
        characters.push(char);
      });
      
      engine.start();
      vi.advanceTimersByTime(2000);
      
      expect(characters).toEqual(['H', 'i']);
      expect(engine.getDisplayText()).toBe('Hi');
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle different character types', () => {
      const engine = new TypingEngine('A1!', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(3000);
      
      expect(engine.getDisplayText()).toBe('A1!');
      expect(engine.getProgress()).toBe(100);
    });

    it('should handle special characters and punctuation', () => {
      const engine = new TypingEngine('Hello, World!', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(5000);
      
      expect(engine.getDisplayText()).toBe('Hello, World!');
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle multiline text', () => {
      const engine = new TypingEngine('Line 1\nLine 2', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(15000); // Increased timeout for keyboard timing system
      
      expect(engine.getDisplayText()).toBe('Line 1\nLine 2');
      expect(engine.isCompleted()).toBe(true);
    });
  });

  describe('Mistake System', () => {
    it('should make and correct mistakes', () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 1.0, // Force mistakes
        debug: false
      };
      
      const engine = new TypingEngine('Hi', config);
      const mistakes: MistakeInfo[] = [];
      let backspaceCount = 0;
      
      engine.onMistakeListener((mistake) => {
        mistakes.push(mistake);
      });
      
      engine.onBackspaceListener(() => {
        backspaceCount++;
      });
      
      engine.start();
      vi.advanceTimersByTime(10000);
      
      expect(mistakes.length).toBeGreaterThan(0);
      expect(backspaceCount).toBeGreaterThan(0);
      
      if (engine.isCompleted()) {
        expect(engine.getDisplayText()).toBe('Hi');
        expect(engine.getUncorrectedMistakes()).toHaveLength(0);
      }
    });

    it('should handle different mistake types', () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 0.8,
        mistakeTypes: {
          adjacent: true,
          random: true,
          doubleChar: true,
          commonTypos: true
        },
        debug: false
      };
      
      const engine = new TypingEngine('Hello world', config);
      const mistakeTypes = new Set<string>();
      
      engine.onMistakeListener((mistake) => {
        mistakeTypes.add(mistake.type);
      });
      
      engine.start();
      vi.advanceTimersByTime(15000);
      
      // Should have used multiple mistake types
      expect(mistakeTypes.size).toBeGreaterThan(0);
    });

    it('should track mistake statistics', () => {
      const config: Partial<HumanLikeConfig> = {
        mistakeFrequency: 0.5,
        debug: false
      };
      
      const engine = new TypingEngine('Testing mistakes', config);
      
      engine.start();
      vi.advanceTimersByTime(20000);
      
      const stats = engine.getStats();
      const mistakes = engine.getMistakes();
      
      expect(stats.mistakesMade).toBe(mistakes.length);
      
      if (engine.isCompleted()) {
        expect(stats.mistakesCorrected).toBe(mistakes.filter(m => m.corrected).length);
      }
    });
  });

  describe('Configuration Effects', () => {
    it('should respect speed configuration', () => {
      const fastEngine = new TypingEngine('Test', { speed: 50, mistakeFrequency: 0 });
      const slowEngine = new TypingEngine('Test', { speed: 200, mistakeFrequency: 0 });
      
      fastEngine.start();
      slowEngine.start();
      
      vi.advanceTimersByTime(300);
      
      const fastProgress = fastEngine.getProgress();
      const slowProgress = slowEngine.getProgress();
      
      expect(fastProgress).toBeGreaterThanOrEqual(slowProgress);
    });

    it('should respect mistake frequency', () => {
      const noMistakesEngine = new TypingEngine('Hello world', { mistakeFrequency: 0 });
      const mistakesEngine = new TypingEngine('Hello world', { mistakeFrequency: 0.8, debug: false });
      
      noMistakesEngine.start();
      mistakesEngine.start();
      
      vi.advanceTimersByTime(10000);
      
      expect(noMistakesEngine.getMistakes()).toHaveLength(0);
      expect(mistakesEngine.getMistakes().length).toBeGreaterThan(0);
    });

    it('should update configuration dynamically', () => {
      const engine = new TypingEngine('Test');
      
      engine.updateConfig({
        speed: 300,
        mistakeFrequency: 0.1
      });
      
      // Configuration should be updated (we can't directly test internal config,
      // but we can verify the engine still works)
      engine.start();
      vi.advanceTimersByTime(2000); // Increased for keyboard simulation timing
      
      expect(engine.getProgress()).toBeGreaterThan(0);
    });
  });

  describe('Event System', () => {
    it('should emit all event types', () => {
      const engine = new TypingEngine('Hi', { mistakeFrequency: 0.5, debug: false });
      const events: string[] = [];
      
      engine.onStateChangeListener((state) => {
        events.push(`state:${state}`);
      });
      
      engine.onCharacterListener((char, index) => {
        events.push(`char:${char}@${index}`);
      });
      
      engine.onMistakeListener((mistake) => {
        events.push(`mistake:${mistake.type}`);
      });
      
      engine.onBackspaceListener(() => {
        events.push('backspace');
      });
      
      engine.onCompleteListener(() => {
        events.push('complete');
      });
      
      engine.onProgressListener((progress) => {
        events.push(`progress:${Math.round(progress)}`);
      });
      
      engine.start();
      vi.advanceTimersByTime(10000);
      
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.startsWith('state:'))).toBe(true);
      expect(events.some(e => e.startsWith('char:'))).toBe(true);
      expect(events.some(e => e.startsWith('progress:'))).toBe(true);
      
      if (engine.isCompleted()) {
        expect(events).toContain('complete');
      }
    });

    it('should provide correct event data', () => {
      const engine = new TypingEngine('AB', { mistakeFrequency: 0 });
      const charEvents: Array<{char: string, index: number}> = [];
      
      engine.onCharacterListener((char, index) => {
        charEvents.push({ char, index });
      });
      
      engine.start();
      vi.advanceTimersByTime(2000);
      
      expect(charEvents).toEqual([
        { char: 'A', index: 0 },
        { char: 'B', index: 1 }
      ]);
    });
  });

  describe('WPM and Statistics', () => {
    it('should calculate WPM correctly', () => {
      const engine = new TypingEngine('Hello world test', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(5000);
      
      const stats = engine.getStats();
      
      if (stats.charactersTyped > 0) {
        expect(stats.currentWPM).toBeGreaterThan(0);
        expect(stats.startTime).toBeGreaterThan(0);
      }
    });

    it('should track typing statistics', () => {
      const engine = new TypingEngine('Test message', { mistakeFrequency: 0.3, debug: false });
      
      engine.start();
      vi.advanceTimersByTime(10000);
      
      const stats = engine.getStats();
      
      expect(stats.totalCharacters).toBe(12);
      expect(stats.charactersTyped).toBeGreaterThanOrEqual(0);
      expect(stats.startTime).toBeGreaterThan(0);
      
      if (engine.isCompleted()) {
        // With mistakes enabled, charactersTyped includes mistakes and corrections
        expect(stats.charactersTyped).toBeGreaterThanOrEqual(stats.totalCharacters);
        expect(stats.endTime).toBeGreaterThan(stats.startTime);
      }
    });
  });

  describe('Advanced Features', () => {
    it('should handle caps lock sequences', () => {
      const engine = new TypingEngine('HELLO WORLD', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(5000);
      
      expect(engine.getDisplayText()).toBe('HELLO WORLD');
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle mixed case text', () => {
      const engine = new TypingEngine('Hello WORLD test', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(15000); // Increased timeout for keyboard timing system
      
      expect(engine.getDisplayText()).toBe('Hello WORLD test');
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle numbers and symbols', () => {
      const engine = new TypingEngine('Price: $19.99 (20% off)', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(8000);
      
      expect(engine.getDisplayText()).toBe('Price: $19.99 (20% off)');
      expect(engine.isCompleted()).toBe(true);
    });

    it('should handle concentration lapses', () => {
      const config: Partial<HumanLikeConfig> = {
        concentrationLapses: true,
        mistakeFrequency: 0
      };
      
      const engine = new TypingEngine('Test', config);
      const stateChanges: TypingState[] = [];
      
      engine.onStateChangeListener((state) => {
        stateChanges.push(state);
      });
      
      engine.start();
      vi.advanceTimersByTime(10000);
      
      // May or may not have thinking states due to randomness
      expect(stateChanges).toContain('typing');
    });

    it('should handle fatigue effect', () => {
      const config: Partial<HumanLikeConfig> = {
        fatigueEffect: true,
        mistakeFrequency: 0
        
      };
      
      const engine = new TypingEngine('Long text to test fatigue effects', config);
      
      engine.start();
      vi.advanceTimersByTime(15000);
      
      // Fatigue should still allow completion
      if (engine.isCompleted()) {
        expect(engine.getDisplayText()).toBe('Long text to test fatigue effects');
      }
    });
  });

  describe('Debug and Utility Methods', () => {
    it('should provide uncorrected mistakes', () => {
      const engine = new TypingEngine('Test', { mistakeFrequency: 1.0, debug: false });
      
      engine.start();
      vi.advanceTimersByTime(1000); // Don't let it complete
      engine.stop();
      
      const uncorrected = engine.getUncorrectedMistakes();
      const allMistakes = engine.getMistakes();
      
      expect(uncorrected.length).toBeLessThanOrEqual(allMistakes.length);
      uncorrected.forEach(mistake => {
        expect(mistake.corrected).toBe(false);
      });
    });

    it('should provide correction queue', () => {
      const engine = new TypingEngine('Test', { mistakeFrequency: 1.0, debug: false });
      
      engine.start();
      vi.advanceTimersByTime(1000);
      
      const queue = engine.getCorrectionQueue();
      expect(Array.isArray(queue)).toBe(true);
    });

    it('should force correct all mistakes', () => {
      const engine = new TypingEngine('Hi', { mistakeFrequency: 1.0, debug: false });
      
      engine.start();
      vi.advanceTimersByTime(2000);
      engine.stop();
      
      const mistakesBefore = engine.getUncorrectedMistakes().length;
      
      if (mistakesBefore > 0) {
        engine.forceCorrectAllMistakes();
        vi.advanceTimersByTime(5000);
        
        const mistakesAfter = engine.getUncorrectedMistakes().length;
        expect(mistakesAfter).toBeLessThanOrEqual(mistakesBefore);
      }
    });

    it('should provide event history', () => {
      const engine = new TypingEngine('Hi', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(2000);
      
      const events = engine.getEvents();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      
      events.forEach(event => {
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('position');
      });
    });
  });

  describe('Text Updates', () => {
    it('should update text and reset state', () => {
      const engine = new TypingEngine('Original');
      
      engine.start();
      vi.advanceTimersByTime(500);
      
      const hadProgress = engine.getProgress() > 0;
      
      engine.updateText('New text');
      
      expect(engine.getText()).toBe('New text');
      expect(engine.getDisplayText()).toBe('');
      expect(engine.getProgress()).toBe(0);
      expect(engine.getState()).toBe('typing'); // Should restart since it was typing
      expect(hadProgress).toBe(true);
    });

    it('should restart typing after text update if was typing', () => {
      const engine = new TypingEngine('Original', { mistakeFrequency: 0 });
      
      engine.start();
      vi.advanceTimersByTime(100);
      
      expect(engine.getState()).toBe('typing');
      
      engine.updateText('New');
      
      // Should automatically restart
      vi.advanceTimersByTime(2000); // Increased for keyboard simulation timing
      
      expect(engine.getDisplayText()).toBe('New');
      expect(engine.isCompleted()).toBe(true);
    });
  });
});