/**
 * Tests for constants and configuration
 * Validates all constant values and configuration defaults
 */

import { describe, it, expect } from 'vitest';
import {
  TIMING_CONSTANTS,
  BEHAVIOR_RATES,
  QWERTY_ADJACENT,
  COMMON_WORDS,
  COMMON_TYPOS,
  SPECIAL_CHARS,
  SHIFT_CHARS,
  NUMBER_CHARS,
  SYMBOL_COMPLEXITY,
  SENTENCE_ENDINGS,
  CLAUSE_SEPARATORS,
  LINE_BREAK_CHARS,
  LETTER_FREQUENCY,
  VOWELS,
  LEFT_HAND_KEYS,
  RIGHT_HAND_KEYS,
  DEFAULT_CONFIG
} from '../constants';

describe('Constants and Configuration', () => {
  describe('Timing Constants', () => {
    it('should have reasonable timing values', () => {
      expect(TIMING_CONSTANTS.BASE_SPEED).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.BASE_SPEED).toBeLessThan(1000);
      
      expect(TIMING_CONSTANTS.SPEED_VARIATION).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.MIN_CHAR_DELAY).toBeGreaterThan(0);
      
      expect(TIMING_CONSTANTS.SENTENCE_PAUSE).toBeGreaterThan(TIMING_CONSTANTS.COMMA_PAUSE);
      expect(TIMING_CONSTANTS.COMMA_PAUSE).toBeGreaterThan(TIMING_CONSTANTS.WORD_SPACE);
      expect(TIMING_CONSTANTS.LINE_BREAK).toBeGreaterThan(TIMING_CONSTANTS.SENTENCE_PAUSE);
    });

    it('should have logical correction timing', () => {
      expect(TIMING_CONSTANTS.REALIZATION_DELAY).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.CORRECTION_PAUSE).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.BACKSPACE_SPEED).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.BACKSPACE_SPEED).toBeLessThan(TIMING_CONSTANTS.BASE_SPEED);
    });

    it('should have realistic human behavior timing', () => {
      expect(TIMING_CONSTANTS.THINKING_PAUSE).toBeGreaterThan(TIMING_CONSTANTS.BASE_SPEED);
      expect(TIMING_CONSTANTS.FATIGUE_INCREMENT).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.BURST_SPEED_MULTIPLIER).toBeLessThan(1);
      expect(TIMING_CONSTANTS.CONCENTRATION_PAUSE).toBeGreaterThan(TIMING_CONSTANTS.THINKING_PAUSE);
    });

    it('should have proper caps lock timing', () => {
      expect(TIMING_CONSTANTS.SHIFT_HESITATION).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.CAPS_LOCK_ON_DELAY).toBeGreaterThan(TIMING_CONSTANTS.SHIFT_HESITATION);
      expect(TIMING_CONSTANTS.CAPS_LOCK_OFF_DELAY).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.CAPS_SEQUENCE_THRESHOLD).toBeGreaterThanOrEqual(3);
    });

    it('should have enhanced realism timing', () => {
      expect(TIMING_CONSTANTS.NUMBER_ROW_PENALTY).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.SYMBOL_BASE_PENALTY).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.LOOK_AHEAD_CHANCE).toBeGreaterThan(0);
      expect(TIMING_CONSTANTS.LOOK_AHEAD_CHANCE).toBeLessThan(1);
    });
  });

  describe('Behavior Rates', () => {
    it('should have probability values between 0 and 1', () => {
      expect(BEHAVIOR_RATES.MISTAKE_FREQUENCY).toBeGreaterThanOrEqual(0);
      expect(BEHAVIOR_RATES.MISTAKE_FREQUENCY).toBeLessThanOrEqual(1);
      
      expect(BEHAVIOR_RATES.CONCENTRATION_LAPSE).toBeGreaterThanOrEqual(0);
      expect(BEHAVIOR_RATES.CONCENTRATION_LAPSE).toBeLessThanOrEqual(1);
      
      expect(BEHAVIOR_RATES.BURST_TYPING).toBeGreaterThanOrEqual(0);
      expect(BEHAVIOR_RATES.BURST_TYPING).toBeLessThanOrEqual(1);
      
      expect(BEHAVIOR_RATES.OVERCORRECTION_RATE).toBeGreaterThanOrEqual(0);
      expect(BEHAVIOR_RATES.OVERCORRECTION_RATE).toBeLessThanOrEqual(1);
    });

    it('should have reasonable default rates', () => {
      expect(BEHAVIOR_RATES.MISTAKE_FREQUENCY).toBeLessThan(0.1); // Not too many mistakes
      expect(BEHAVIOR_RATES.CONCENTRATION_LAPSE).toBeLessThan(0.1); // Not too many lapses
      expect(BEHAVIOR_RATES.FATIGUE_FACTOR).toBeGreaterThan(0);
      expect(BEHAVIOR_RATES.FATIGUE_FACTOR).toBeLessThan(0.01); // Gradual fatigue
    });
  });

  describe('QWERTY Adjacent Keys', () => {
    it('should have adjacent keys for all letters', () => {
      const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      
      letters.forEach(letter => {
        expect(QWERTY_ADJACENT).toHaveProperty(letter);
        expect(Array.isArray(QWERTY_ADJACENT[letter])).toBe(true);
        expect(QWERTY_ADJACENT[letter].length).toBeGreaterThan(0);
      });
    });

    it('should have bidirectional adjacency', () => {
      // If 'a' is adjacent to 'q', then 'q' should be adjacent to 'a'
      Object.entries(QWERTY_ADJACENT).forEach(([key, adjacents]) => {
        adjacents.forEach(adjacent => {
          if (QWERTY_ADJACENT[adjacent]) {
            expect(QWERTY_ADJACENT[adjacent]).toContain(key);
          }
        });
      });
    });

    it('should have space bar adjacencies', () => {
      expect(QWERTY_ADJACENT[' ']).toBeDefined();
      expect(Array.isArray(QWERTY_ADJACENT[' '])).toBe(true);
      expect(QWERTY_ADJACENT[' '].length).toBeGreaterThan(0);
    });

    it('should have realistic keyboard layout', () => {
      // Test some known adjacencies
      expect(QWERTY_ADJACENT['q']).toContain('w');
      expect(QWERTY_ADJACENT['w']).toContain('q');
      expect(QWERTY_ADJACENT['w']).toContain('e');
      expect(QWERTY_ADJACENT['a']).toContain('s');
      expect(QWERTY_ADJACENT['z']).toContain('x');
    });
  });

  describe('Common Words', () => {
    it('should contain frequently used English words', () => {
      expect(COMMON_WORDS.has('the')).toBe(true);
      expect(COMMON_WORDS.has('and')).toBe(true);
      expect(COMMON_WORDS.has('for')).toBe(true);
      expect(COMMON_WORDS.has('are')).toBe(true);
      expect(COMMON_WORDS.has('but')).toBe(true);
    });

    it('should have reasonable size', () => {
      expect(COMMON_WORDS.size).toBeGreaterThan(50);
      expect(COMMON_WORDS.size).toBeLessThan(500);
    });

    it('should contain only lowercase words', () => {
      COMMON_WORDS.forEach(word => {
        expect(word).toBe(word.toLowerCase());
        expect(/^[a-z]+$/.test(word)).toBe(true);
      });
    });
  });

  describe('Common Typos', () => {
    it('should have typos for common words', () => {
      expect(COMMON_TYPOS['the']).toBe('teh');
      expect(COMMON_TYPOS['and']).toBe('adn');
      expect(COMMON_TYPOS['you']).toBe('yuo');
      expect(COMMON_TYPOS['that']).toBe('taht');
    });

    it('should have realistic typo patterns', () => {
      Object.entries(COMMON_TYPOS).forEach(([correct, typo]) => {
        // Typos should be different from correct word
        expect(typo).not.toBe(correct);
        
        // Typos should have similar length
        expect(Math.abs(typo.length - correct.length)).toBeLessThanOrEqual(2);
        
        // Should be strings
        expect(typeof correct).toBe('string');
        expect(typeof typo).toBe('string');
      });
    });

    it('should cover various word lengths', () => {
      const lengths = Object.keys(COMMON_TYPOS).map(word => word.length);
      const uniqueLengths = new Set(lengths);
      
      expect(uniqueLengths.size).toBeGreaterThan(5); // Various word lengths
      expect(Math.min(...lengths)).toBeGreaterThanOrEqual(2);
      expect(Math.max(...lengths)).toBeLessThanOrEqual(20);
    });
  });

  describe('Character Sets', () => {
    it('should have proper special characters', () => {
      expect(SPECIAL_CHARS.has('!')).toBe(true);
      expect(SPECIAL_CHARS.has('@')).toBe(true);
      expect(SPECIAL_CHARS.has('#')).toBe(true);
      expect(SPECIAL_CHARS.has('.')).toBe(true);
      expect(SPECIAL_CHARS.has(',')).toBe(true);
    });

    it('should have shift characters', () => {
      // Capital letters
      expect(SHIFT_CHARS.has('A')).toBe(true);
      expect(SHIFT_CHARS.has('Z')).toBe(true);
      
      // Symbols requiring shift
      expect(SHIFT_CHARS.has('!')).toBe(true);
      expect(SHIFT_CHARS.has('@')).toBe(true);
      expect(SHIFT_CHARS.has('?')).toBe(true);
      
      // Should not have lowercase letters
      expect(SHIFT_CHARS.has('a')).toBe(false);
      expect(SHIFT_CHARS.has('z')).toBe(false);
    });

    it('should have number characters', () => {
      for (let i = 0; i <= 9; i++) {
        expect(NUMBER_CHARS.has(i.toString())).toBe(true);
      }
      
      expect(NUMBER_CHARS.size).toBe(10);
    });

    it('should have sentence endings', () => {
      expect(SENTENCE_ENDINGS.has('.')).toBe(true);
      expect(SENTENCE_ENDINGS.has('!')).toBe(true);
      expect(SENTENCE_ENDINGS.has('?')).toBe(true);
    });

    it('should have clause separators', () => {
      expect(CLAUSE_SEPARATORS.has(',')).toBe(true);
      expect(CLAUSE_SEPARATORS.has(';')).toBe(true);
      expect(CLAUSE_SEPARATORS.has(':')).toBe(true);
    });

    it('should have line break characters', () => {
      expect(LINE_BREAK_CHARS.has('\n')).toBe(true);
      expect(LINE_BREAK_CHARS.has('\r\n')).toBe(true);
      expect(LINE_BREAK_CHARS.has('\r')).toBe(true);
    });
  });

  describe('Symbol Complexity', () => {
    it('should have complexity levels 1-3', () => {
      Object.values(SYMBOL_COMPLEXITY).forEach(complexity => {
        expect(complexity).toBeGreaterThanOrEqual(1);
        expect(complexity).toBeLessThanOrEqual(3);
        expect(Number.isInteger(complexity)).toBe(true);
      });
    });

    it('should have logical complexity assignments', () => {
      // Simple punctuation should have low complexity
      expect(SYMBOL_COMPLEXITY['.']).toBe(1);
      expect(SYMBOL_COMPLEXITY[',']).toBe(1);
      
      // Complex symbols should have high complexity
      expect(SYMBOL_COMPLEXITY['@']).toBe(3);
      expect(SYMBOL_COMPLEXITY['#']).toBe(3);
      expect(SYMBOL_COMPLEXITY['$']).toBe(3);
    });

    it('should cover various symbols', () => {
      const symbolCount = Object.keys(SYMBOL_COMPLEXITY).length;
      expect(symbolCount).toBeGreaterThan(10);
      
      // Should have symbols at each complexity level
      const complexities = Object.values(SYMBOL_COMPLEXITY);
      expect(complexities).toContain(1);
      expect(complexities).toContain(2);
      expect(complexities).toContain(3);
    });
  });

  describe('Letter Frequency', () => {
    it('should have frequencies for all letters', () => {
      const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      
      letters.forEach(letter => {
        expect(LETTER_FREQUENCY).toHaveProperty(letter);
        expect(typeof LETTER_FREQUENCY[letter]).toBe('number');
        expect(LETTER_FREQUENCY[letter]).toBeGreaterThan(0);
      });
    });

    it('should have realistic English letter frequencies', () => {
      // 'e' should be the most frequent
      const frequencies = Object.values(LETTER_FREQUENCY);
      const maxFreq = Math.max(...frequencies);
      expect(LETTER_FREQUENCY['e']).toBe(maxFreq);
      
      // 'z', 'q', 'x' should be among the least frequent
      expect(LETTER_FREQUENCY['z']).toBeLessThan(1);
      expect(LETTER_FREQUENCY['q']).toBeLessThan(1);
      expect(LETTER_FREQUENCY['x']).toBeLessThan(1);
      
      // Common letters should have high frequencies
      expect(LETTER_FREQUENCY['t']).toBeGreaterThan(5);
      expect(LETTER_FREQUENCY['a']).toBeGreaterThan(5);
      expect(LETTER_FREQUENCY['o']).toBeGreaterThan(5);
    });

    it('should have reasonable frequency range', () => {
      const frequencies = Object.values(LETTER_FREQUENCY);
      const min = Math.min(...frequencies);
      const max = Math.max(...frequencies);
      
      expect(min).toBeGreaterThan(0);
      expect(max).toBeLessThan(20);
      expect(max / min).toBeGreaterThan(10); // Significant variation
    });
  });

  describe('Vowels', () => {
    it('should contain all vowels', () => {
      expect(VOWELS.has('a')).toBe(true);
      expect(VOWELS.has('e')).toBe(true);
      expect(VOWELS.has('i')).toBe(true);
      expect(VOWELS.has('o')).toBe(true);
      expect(VOWELS.has('u')).toBe(true);
    });

    it('should have exactly 5 vowels', () => {
      expect(VOWELS.size).toBe(5);
    });

    it('should not contain consonants', () => {
      expect(VOWELS.has('b')).toBe(false);
      expect(VOWELS.has('c')).toBe(false);
      expect(VOWELS.has('z')).toBe(false);
    });
  });

  describe('Hand Key Mapping', () => {
    it('should have left and right hand keys', () => {
      expect(LEFT_HAND_KEYS.size).toBeGreaterThan(0);
      expect(RIGHT_HAND_KEYS.size).toBeGreaterThan(0);
    });

    it('should not overlap between hands', () => {
      LEFT_HAND_KEYS.forEach(key => {
        expect(RIGHT_HAND_KEYS.has(key)).toBe(false);
      });
      
      RIGHT_HAND_KEYS.forEach(key => {
        expect(LEFT_HAND_KEYS.has(key)).toBe(false);
      });
    });

    it('should have realistic hand assignments', () => {
      // Left hand keys
      expect(LEFT_HAND_KEYS.has('q')).toBe(true);
      expect(LEFT_HAND_KEYS.has('w')).toBe(true);
      expect(LEFT_HAND_KEYS.has('a')).toBe(true);
      expect(LEFT_HAND_KEYS.has('s')).toBe(true);
      
      // Right hand keys
      expect(RIGHT_HAND_KEYS.has('y')).toBe(true);
      expect(RIGHT_HAND_KEYS.has('u')).toBe(true);
      expect(RIGHT_HAND_KEYS.has('h')).toBe(true);
      expect(RIGHT_HAND_KEYS.has('j')).toBe(true);
    });

    it('should cover most common characters', () => {
      const totalKeys = LEFT_HAND_KEYS.size + RIGHT_HAND_KEYS.size;
      expect(totalKeys).toBeGreaterThan(40); // Should cover letters, numbers, symbols
    });
  });

  describe('Default Configuration', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_CONFIG.speed).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.speedVariation).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.mistakeFrequency).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CONFIG.mistakeFrequency).toBeLessThanOrEqual(1);
      
      expect(DEFAULT_CONFIG.sentencePause).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.wordPause).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.thinkingPause).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.minCharDelay).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.backspaceSpeed).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.realizationDelay).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.correctionPause).toBeGreaterThan(0);
    });

    it('should have proper mistake type configuration', () => {
      expect(typeof DEFAULT_CONFIG.mistakeTypes).toBe('object');
      expect(typeof DEFAULT_CONFIG.mistakeTypes.adjacent).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.mistakeTypes.random).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.mistakeTypes.doubleChar).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.mistakeTypes.commonTypos).toBe('boolean');
    });

    it('should have proper behavior flags', () => {
      expect(typeof DEFAULT_CONFIG.fatigueEffect).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.concentrationLapses).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.overcorrection).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.debug).toBe('boolean');
    });

    it('should have reasonable timing relationships', () => {
      expect(DEFAULT_CONFIG.sentencePause).toBeGreaterThan(DEFAULT_CONFIG.wordPause);
      expect(DEFAULT_CONFIG.backspaceSpeed).toBeLessThan(DEFAULT_CONFIG.speed);
      expect(DEFAULT_CONFIG.minCharDelay).toBeLessThan(DEFAULT_CONFIG.speed);
    });

    it('should match timing constants', () => {
      expect(DEFAULT_CONFIG.speed).toBe(TIMING_CONSTANTS.BASE_SPEED);
      expect(DEFAULT_CONFIG.speedVariation).toBe(TIMING_CONSTANTS.SPEED_VARIATION);
      expect(DEFAULT_CONFIG.mistakeFrequency).toBe(BEHAVIOR_RATES.MISTAKE_FREQUENCY);
      expect(DEFAULT_CONFIG.sentencePause).toBe(TIMING_CONSTANTS.SENTENCE_PAUSE);
      expect(DEFAULT_CONFIG.wordPause).toBe(TIMING_CONSTANTS.WORD_SPACE);
      expect(DEFAULT_CONFIG.thinkingPause).toBe(TIMING_CONSTANTS.THINKING_PAUSE);
    });

    it('should have debug disabled by default', () => {
      expect(DEFAULT_CONFIG.debug).toBe(false);
    });
  });

  describe('Data Integrity', () => {
    it('should have consistent character sets', () => {
      // Special chars that require shift should be in SHIFT_CHARS
      const specialShiftChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?', '~'];
      
      specialShiftChars.forEach(char => {
        if (SPECIAL_CHARS.has(char)) {
          expect(SHIFT_CHARS.has(char)).toBe(true);
        }
      });
    });

    it('should have no duplicate entries in sets', () => {
      // Sets should automatically handle duplicates, but let's verify sizes are reasonable
      expect(SPECIAL_CHARS.size).toBeGreaterThan(20);
      expect(SHIFT_CHARS.size).toBeGreaterThan(30);
      expect(NUMBER_CHARS.size).toBe(10);
      expect(SENTENCE_ENDINGS.size).toBe(3);
      expect(CLAUSE_SEPARATORS.size).toBe(3);
      expect(VOWELS.size).toBe(5);
    });

    it('should have valid object structures', () => {
      // QWERTY_ADJACENT should map strings to string arrays
      Object.entries(QWERTY_ADJACENT).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(Array.isArray(value)).toBe(true);
        value.forEach(adjacent => {
          expect(typeof adjacent).toBe('string');
        });
      });
      
      // COMMON_TYPOS should map strings to strings
      Object.entries(COMMON_TYPOS).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
      });
      
      // LETTER_FREQUENCY should map strings to numbers
      Object.entries(LETTER_FREQUENCY).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('number');
      });
    });
  });
});