/**
 * Keyboard simulation accuracy and completeness tests
 * Ensures every character maps to correct key sequences
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import type { KeyInfo } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Keyboard Simulation Accuracy', () => {
  describe('Character to Key Mapping', () => {
    it('should generate accurate key sequences for uppercase letters', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'HELLO',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Uppercase Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should have shift keys for each uppercase letter
      const shiftKeys = keyEvents.filter(k => k.type === 'modifier' && k.key.toLowerCase().includes('shift'));
      const letterKeys = keyEvents.filter(k => k.type === 'letter');
      
      expect(shiftKeys.length).toBeGreaterThan(0);
      expect(letterKeys.length).toBe(5); // H, E, L, L, O
      
      // Each letter should be preceded by a shift key
      let shiftCount = 0;
      for (const event of keyEvents) {
        if (event.type === 'modifier' && event.key.toLowerCase().includes('shift')) {
          shiftCount++;
        } else if (event.type === 'letter') {
          expect(shiftCount).toBeGreaterThan(0); // Should have seen a shift key
        }
      }
      
      console.log(`Uppercase: ${shiftKeys.length} shift keys, ${letterKeys.length} letter keys`);
    });

    it('should generate correct sequences for numbers and symbols', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: '123!@#$',
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Numbers and Symbols</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      const numberKeys = keyEvents.filter(k => k.type === 'number');
      const symbolKeys = keyEvents.filter(k => k.type === 'symbol');
      const shiftKeys = keyEvents.filter(k => k.type === 'modifier' && k.key.toLowerCase().includes('shift'));
      
      expect(numberKeys.length).toBe(3); // 1, 2, 3
      expect(symbolKeys.length).toBe(4); // !, @, #, $
      expect(shiftKeys.length).toBeGreaterThan(0); // For symbols that require shift
      
      console.log(`Numbers/Symbols: ${numberKeys.length} numbers, ${symbolKeys.length} symbols, ${shiftKeys.length} shifts`);
    });

    it('should handle complex text with mixed case, numbers, and symbols', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Hello123!@User',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Complex Text</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      
      // Categorize all keys
      const keyTypes = {
        letter: keyEvents.filter(k => k.type === 'letter').length,
        number: keyEvents.filter(k => k.type === 'number').length,
        symbol: keyEvents.filter(k => k.type === 'symbol').length,
        modifier: keyEvents.filter(k => k.type === 'modifier').length,
        space: keyEvents.filter(k => k.type === 'space').length
      };
      
      expect(keyTypes.letter).toBeGreaterThan(0);
      expect(keyTypes.number).toBe(3);
      expect(keyTypes.symbol).toBe(2);
      expect(keyTypes.modifier).toBeGreaterThan(0);
      
      // Verify sequence makes sense
      const sequence = keyEvents.map(k => `${k.key}(${k.type})`).join(' → ');
      console.log(`Complex sequence: ${sequence}`);
      
      console.log('Key type distribution:', keyTypes);
    });

    it('should handle special characters and punctuation correctly', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: "Don't use \"quotes\" or (parentheses) here!",
          autoStart: true,
          config: {
            speed: 70,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Special Characters</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Should handle apostrophes, quotes, parentheses correctly
      const specialKeys = keyEvents.filter(k => 
        k.key.includes("'") || 
        k.key.includes('"') || 
        k.key.includes('(') || 
        k.key.includes(')')
      );
      
      expect(specialKeys.length).toBeGreaterThan(0);
      
      // All keys should have valid properties
      keyEvents.forEach(keyEvent => {
        expect(keyEvent.key).toBeDefined();
        expect(keyEvent.type).toBeDefined();
        expect(keyEvent.duration).toBeGreaterThan(0);
      });
      
      console.log(`Special chars: ${specialKeys.length} special keys out of ${keyEvents.length} total`);
    });
  });

  describe('Keyboard View Switching', () => {
    it('should switch keyboard views appropriately for mobile', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'abc123!@#ABC',
          autoStart: true,
          keyboardMode: 'mobile',
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>View Switching</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Check for keyboard view switching
      const viewSwitches = keyEvents.filter(k => k.keyboardView);
      expect(viewSwitches.length).toBeGreaterThan(0);
      
      // Should have different keyboard views
      const views = new Set(viewSwitches.map(k => k.keyboardView));
      expect(views.has('letters')).toBe(true);
      expect(views.size).toBeGreaterThan(1); // Should switch between views
      
      console.log(`View switching: ${views.size} different views used`);
    });

    it('should maintain view context for key sequences', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Test@123#Symbol',
          autoStart: true,
          keyboardMode: 'mobile',
          config: {
            speed: 40,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>View Context</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Group keys by sequence
      const sequences: KeyInfo[][] = [];
      let currentSequence: KeyInfo[] = [];
      
      keyEvents.forEach(keyEvent => {
        if (keyEvent.sequenceIndex === 0 || keyEvent.sequenceIndex === undefined) {
          if (currentSequence.length > 0) {
            sequences.push([...currentSequence]);
          }
          currentSequence = [keyEvent];
        } else {
          currentSequence.push(keyEvent);
        }
      });
      
      if (currentSequence.length > 0) {
        sequences.push(currentSequence);
      }
      
      // Verify each sequence has consistent context
      sequences.forEach(sequence => {
        if (sequence.length > 1) {
          const keyboardViews = new Set(sequence.map(k => k.keyboardView).filter(Boolean));
          // Each sequence should primarily use one keyboard view
          expect(keyboardViews.size).toBeLessThanOrEqual(2); // Allow for view switches within sequence
        }
      });
      
      console.log(`Sequences: ${sequences.length} key sequences with consistent views`);
    });
  });

  describe('Timing and Duration Accuracy', () => {
    it('should generate realistic key durations', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Testing realistic timing',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Timing Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Analyze duration distribution
      const durations = keyEvents.map(k => k.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      
      // Realistic bounds
      expect(minDuration).toBeGreaterThan(0);
      expect(maxDuration).toBeLessThan(1000); // Reasonable upper bound
      expect(avgDuration).toBeGreaterThan(10); // Should not be too fast
      expect(avgDuration).toBeLessThan(500); // Should not be too slow
      
      console.log(`Durations: min=${minDuration}ms, max=${maxDuration}ms, avg=${avgDuration.toFixed(1)}ms`);
    });

    it('should scale durations with speed configuration', async () => {
      const fastKeyEvents: KeyInfo[] = [];
      const slowKeyEvents: KeyInfo[] = [];
      
      const FastComponent = () => {
        useHumanLike({
          text: 'Speed test',
          autoStart: true,
          config: {
            speed: 20, // Very fast
            mistakeFrequency: 0,
            onKey: (keyInfo) => fastKeyEvents.push(keyInfo)
          }
        });
        return <div>Fast</div>;
      };
      
      const SlowComponent = () => {
        useHumanLike({
          text: 'Speed test',
          autoStart: true,
          config: {
            speed: 200, // Very slow
            mistakeFrequency: 0,
            onKey: (keyInfo) => slowKeyEvents.push(keyInfo)
          }
        });
        return <div>Slow</div>;
      };
      
      const { rerender } = render(<FastComponent />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      rerender(<SlowComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      const fastAvg = fastKeyEvents.reduce((sum, k) => sum + k.duration, 0) / fastKeyEvents.length;
      const slowAvg = slowKeyEvents.reduce((sum, k) => sum + k.duration, 0) / slowKeyEvents.length;
      
      expect(fastAvg).toBeLessThan(slowAvg);
      expect(slowAvg / fastAvg).toBeGreaterThan(5); // Should be significantly different
      
      console.log(`Speed scaling: fast avg=${fastAvg.toFixed(1)}ms, slow avg=${slowAvg.toFixed(1)}ms`);
    });

    it('should maintain timing consistency across identical texts', async () => {
      const run1Events: KeyInfo[] = [];
      const run2Events: KeyInfo[] = [];
      
      const TestComponent = ({ run }: { run: number }) => {
        const events = run === 1 ? run1Events : run2Events;
        
        useHumanLike({
          text: 'Consistent timing',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0,
            speedVariation: 0, // No variation for consistency test
            onKey: (keyInfo) => events.push(keyInfo)
          }
        });
        
        return <div>Run {run}</div>;
      };
      
      const { rerender } = render(<TestComponent run={1} />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      rerender(<TestComponent run={2} />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      // Both runs should have same number of keys
      expect(run1Events.length).toBe(run2Events.length);
      
      // Duration patterns should be similar (within reasonable variance)
      const run1Total = run1Events.reduce((sum, k) => sum + k.duration, 0);
      const run2Total = run2Events.reduce((sum, k) => sum + k.duration, 0);
      const difference = Math.abs(run1Total - run2Total);
      const avgTotal = (run1Total + run2Total) / 2;
      const variancePercent = (difference / avgTotal) * 100;
      
      expect(variancePercent).toBeLessThan(50); // Should be reasonably consistent
      
      console.log(`Consistency: Run1=${run1Total}ms, Run2=${run2Total}ms, variance=${variancePercent.toFixed(1)}%`);
    });
  });

  describe('Backspace and Correction Sequences', () => {
    it('should generate backspace key events during corrections', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Test mistakes',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0.4, // High mistake rate
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Backspace Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      const backspaceKeys = keyEvents.filter(k => 
        k.key.toLowerCase().includes('backspace') || 
        k.key.toLowerCase().includes('delete') ||
        k.type === 'backspace'
      );
      
      // With high mistake rate, should have some backspace events
      expect(backspaceKeys.length).toBeGreaterThan(0);
      
      // All backspace keys should have valid durations
      backspaceKeys.forEach(key => {
        expect(key.duration).toBeGreaterThan(0);
      });
      
      console.log(`Backspace: ${backspaceKeys.length} backspace events out of ${keyEvents.length} total`);
    });

    it('should maintain key sequence integrity during corrections', async () => {
      const keyEvents: KeyInfo[] = [];
      const characterEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Correction sequence test',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0.3,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onChar: (char) => {
            characterEvents.push(char);
          }
        });
        
        return <div>Correction Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      // Should have more key events than characters (due to corrections)
      expect(keyEvents.length).toBeGreaterThanOrEqual(characterEvents.length);
      
      // Should have backspace events for corrections
      const backspaceCount = keyEvents.filter(k => 
        k.key.toLowerCase().includes('backspace') || 
        k.type === 'backspace'
      ).length;
      
      expect(backspaceCount).toBeGreaterThan(0);
      
      console.log(`Correction integrity: ${keyEvents.length} keys, ${characterEvents.length} chars, ${backspaceCount} backspaces`);
    });
  });

  describe('Key Event Properties Validation', () => {
    it('should provide complete key information for all events', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Property validation test 123!@#',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0.1,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Validation Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Validate all key events have required properties
      keyEvents.forEach((keyEvent, index) => {
        expect(keyEvent).toBeDefined();
        expect(keyEvent.key).toBeDefined();
        expect(typeof keyEvent.key).toBe('string');
        expect(keyEvent.key.length).toBeGreaterThan(0);
        
        expect(keyEvent.type).toBeDefined();
        expect(typeof keyEvent.type).toBe('string');
        expect(['letter', 'number', 'symbol', 'modifier', 'space', 'backspace'].includes(keyEvent.type)).toBe(true);
        
        expect(keyEvent.duration).toBeDefined();
        expect(typeof keyEvent.duration).toBe('number');
        expect(keyEvent.duration).toBeGreaterThan(0);
        
        // Optional properties should be valid if present
        if (keyEvent.keyboardView) {
          expect(['letters', 'numbers', 'symbols'].includes(keyEvent.keyboardView)).toBe(true);
        }
        
        if (keyEvent.sequenceIndex !== undefined) {
          expect(typeof keyEvent.sequenceIndex).toBe('number');
          expect(keyEvent.sequenceIndex).toBeGreaterThanOrEqual(0);
        }
        
        if (keyEvent.sequenceLength !== undefined) {
          expect(typeof keyEvent.sequenceLength).toBe('number');
          expect(keyEvent.sequenceLength).toBeGreaterThan(0);
        }
      });
      
      console.log(`Validation: ${keyEvents.length} key events all have valid properties`);
    });

    it('should provide sequence information for complex inputs', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'A!2@B',
          autoStart: true,
          keyboardMode: 'mobile',
          config: {
            speed: 40,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Sequence Info</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should have sequence information for multi-key characters
      const keysWithSequenceInfo = keyEvents.filter(k => 
        k.sequenceIndex !== undefined && k.sequenceLength !== undefined
      );
      
      expect(keysWithSequenceInfo.length).toBeGreaterThan(0);
      
      // Validate sequence consistency
      keysWithSequenceInfo.forEach(keyEvent => {
        expect(keyEvent.sequenceIndex).toBeLessThan(keyEvent.sequenceLength!);
      });
      
      console.log(`Sequence info: ${keysWithSequenceInfo.length} keys with sequence data`);
    });
  });
});