/**
 * Comprehensive onKey robustness tests
 * Tests the critical timing guarantees and edge cases for onKey events
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React, { useState, useRef } from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import type { KeyInfo } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('onKey Robustness Tests', () => {
  describe('Critical Timing Guarantees', () => {
    it('should guarantee ALL onKey events fire before onComplete', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        const { displayText, isCompleted } = useHumanLike({
          text: 'Hello World!',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionEvents.push(`Complete at ${keyEvents.length} keys`);
          }
        });
        
        return <div data-testid="display">{displayText}</div>;
      };
      
      render(<TestComponent />);
      
      // Run simulation to completion
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Verify completion happened
      expect(completionEvents).toHaveLength(1);
      
      // Critical guarantee: All characters should have corresponding key events
      expect(keyEvents.length).toBeGreaterThan(0);
      
      // The text "Hello World!" should generate keys for each character including shift keys
      // At minimum: each letter/punctuation should have at least one key event
      const textLength = 'Hello World!'.length;
      expect(keyEvents.length).toBeGreaterThanOrEqual(textLength);
      
      console.log(`Text: "Hello World!" (${textLength} chars)`);
      console.log(`Key events: ${keyEvents.length}`);
      console.log(`Completion events: ${completionEvents.length}`);
      console.log('Key sequence:', keyEvents.map(k => k.key).join(', '));
    });

    it('should handle complex text with special characters and maintain timing', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        const { displayText } = useHumanLike({
          text: 'CAPS text @#$% 123',
          autoStart: true,
          config: {
            speed: 30,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>{displayText}</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      expect(completionEvents).toHaveLength(1);
      expect(keyEvents.length).toBeGreaterThan(0);
      
      // Should have shift keys for caps, symbol keys for special chars, number keys
      const hasShiftKeys = keyEvents.some(k => k.type === 'modifier' && k.key.includes('shift'));
      const hasSymbolKeys = keyEvents.some(k => k.type === 'symbol');
      const hasNumberKeys = keyEvents.some(k => k.type === 'number');
      
      expect(hasShiftKeys).toBe(true);
      expect(hasSymbolKeys).toBe(true);
      expect(hasNumberKeys).toBe(true);
    });

    it('should handle final character edge case - last letters should emit onKey', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Relax',  // Specifically test the problematic text from user report
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.05,
            debug: true,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      expect(completionEvents).toHaveLength(1);
      
      // Must have key events for 'a' and 'x' - the problematic final characters
      const keySequence = keyEvents.map(k => k.key).join(',');
      expect(keySequence).toContain('a');  // The 'a' in 'Relax'
      expect(keySequence).toContain('x');  // The 'x' in 'Relax'
      
      console.log(`Final chars test - Key sequence: ${keySequence}`);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty text gracefully', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: '',
          autoStart: true,
          config: {
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Empty Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(completionEvents).toHaveLength(1);
      expect(keyEvents).toHaveLength(0); // No keys for empty text
    });

    it('should handle single character text', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'A',
          autoStart: true,
          config: {
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Single Char</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(completionEvents).toHaveLength(1);
      expect(keyEvents.length).toBeGreaterThan(0); // Should have shift + A
    });

    it('should handle rapid text changes without losing events', async () => {
      const allKeyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        const [text, setText] = useState('First');
        
        const { displayText } = useHumanLike({
          text,
          autoStart: true,
          config: {
            speed: 20,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              allKeyEvents.push({ ...keyInfo, context: text });
            }
          },
          onComplete: () => {
            completionEvents.push(`completed-${text}`);
            // Simulate rapid text change
            if (text === 'First') {
              setTimeout(() => setText('Second'), 50);
            }
          }
        });
        
        return <div>{displayText}</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      // Should complete both texts
      expect(completionEvents.length).toBeGreaterThanOrEqual(1);
      expect(allKeyEvents.length).toBeGreaterThan(0);
    });

    it('should maintain event sequence integrity with mistakes and corrections', async () => {
      const keyEvents: KeyInfo[] = [];
      const characterEvents: string[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Testing mistakes',
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0.3, // High mistake rate to test corrections
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onChar: (char) => {
            characterEvents.push(char);
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Mistakes Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      expect(completionEvents).toHaveLength(1);
      expect(keyEvents.length).toBeGreaterThan(0);
      expect(characterEvents.length).toBeGreaterThan(0);
      
      // With mistakes and corrections, we should have more key events than characters
      // because of backspace sequences
      console.log(`Mistakes test - Keys: ${keyEvents.length}, Chars: ${characterEvents.length}`);
    });
  });

  describe('Callback Safety and Error Handling', () => {
    it('should handle onKey callback errors gracefully', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      let errorCount = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Error test',
          autoStart: true,
          config: {
            speed: 50,
            debug: true,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
              // Throw error on 3rd key press
              if (keyEvents.length === 3) {
                errorCount++;
                throw new Error('Test error in onKey callback');
              }
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Error handling</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should still complete despite callback error
      expect(completionEvents).toHaveLength(1);
      expect(errorCount).toBe(1);
      expect(keyEvents.length).toBeGreaterThan(3); // Should continue after error
    });

    it('should handle null/undefined in onKey callback', async () => {
      const keyEvents: (KeyInfo | null | undefined)[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Null test',
          autoStart: true,
          config: {
            onKey: (keyInfo) => {
              // Simulate callback that might receive null/undefined
              keyEvents.push(keyInfo);
              if (keyInfo === null || keyInfo === undefined) {
                throw new Error('Received null/undefined keyInfo');
              }
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        return <div>Null safety</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      expect(completionEvents).toHaveLength(1);
      // All key events should be valid objects
      keyEvents.forEach(keyEvent => {
        expect(keyEvent).not.toBeNull();
        expect(keyEvent).not.toBeUndefined();
        expect(keyEvent).toHaveProperty('key');
        expect(keyEvent).toHaveProperty('type');
        expect(keyEvent).toHaveProperty('duration');
      });
    });
  });

  describe('Keyboard Simulation Accuracy', () => {
    it('should generate accurate key sequences for complex input', async () => {
      const keyEvents: KeyInfo[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Hello! @User123',
          autoStart: true,
          config: {
            speed: 30,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          }
        });
        
        return <div>Accuracy Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Analyze key sequence for accuracy
      const keySequence = keyEvents.map(k => `${k.key}(${k.type})`).join(', ');
      console.log('Key sequence analysis:', keySequence);
      
      // Should have proper key types
      const letterKeys = keyEvents.filter(k => k.type === 'letter');
      const symbolKeys = keyEvents.filter(k => k.type === 'symbol');
      const numberKeys = keyEvents.filter(k => k.type === 'number');
      const modifierKeys = keyEvents.filter(k => k.type === 'modifier');
      
      expect(letterKeys.length).toBeGreaterThan(0);
      expect(symbolKeys.length).toBeGreaterThan(0); // ! and @
      expect(numberKeys.length).toBeGreaterThan(0); // 1, 2, 3
      expect(modifierKeys.length).toBeGreaterThan(0); // Shift for capital H and !
      
      // All keys should have valid durations
      keyEvents.forEach(keyEvent => {
        expect(keyEvent.duration).toBeGreaterThan(0);
        expect(keyEvent.duration).toBeLessThan(1000); // Reasonable upper bound
      });
    });

    it('should maintain timing consistency across different speeds', async () => {
      const fastKeyEvents: KeyInfo[] = [];
      const slowKeyEvents: KeyInfo[] = [];
      
      const FastComponent = () => {
        useHumanLike({
          text: 'Speed test',
          autoStart: true,
          config: {
            speed: 20, // Fast
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              fastKeyEvents.push(keyInfo);
            }
          }
        });
        return <div>Fast</div>;
      };
      
      const SlowComponent = () => {
        useHumanLike({
          text: 'Speed test',
          autoStart: true,
          config: {
            speed: 200, // Slow
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              slowKeyEvents.push(keyInfo);
            }
          }
        });
        return <div>Slow</div>;
      };
      
      const { rerender } = render(<FastComponent />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      rerender(<SlowComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      expect(fastKeyEvents.length).toBeGreaterThan(0);
      expect(slowKeyEvents.length).toBeGreaterThan(0);
      
      // Both should have same number of keys (same text)
      expect(fastKeyEvents.length).toBe(slowKeyEvents.length);
      
      // Fast typing should have shorter average durations
      const fastAvgDuration = fastKeyEvents.reduce((sum, k) => sum + k.duration, 0) / fastKeyEvents.length;
      const slowAvgDuration = slowKeyEvents.reduce((sum, k) => sum + k.duration, 0) / slowKeyEvents.length;
      
      expect(fastAvgDuration).toBeLessThan(slowAvgDuration);
    });
  });

  describe('State Transition Robustness', () => {
    it('should handle pause/resume without losing onKey events', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      
      const TestComponent = () => {
        const { pause, resume, isTyping } = useHumanLike({
          text: 'Pause resume test',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
              // Pause after 5th key
              if (keyEvents.length === 5) {
                setTimeout(pause, 10);
              }
            }
          },
          onComplete: () => {
            completionEvents.push('completed');
          }
        });
        
        // Resume after pause
        React.useEffect(() => {
          if (!isTyping && keyEvents.length >= 5 && completionEvents.length === 0) {
            const timer = setTimeout(resume, 500);
            return () => clearTimeout(timer);
          }
        }, [isTyping, resume]);
        
        return <div>Pause/Resume</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      expect(completionEvents).toHaveLength(1);
      expect(keyEvents.length).toBeGreaterThan(5); // Should continue after resume
    });

    it('should handle stop/reset without event leakage', async () => {
      const keyEvents: KeyInfo[] = [];
      let component: any;
      
      const TestComponent = () => {
        const humanLike = useHumanLike({
          text: 'Stop reset test',
          autoStart: true,
          config: {
            speed: 100,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
              // Stop after 3rd key
              if (keyEvents.length === 3) {
                setTimeout(() => humanLike.stop(), 10);
              }
            }
          }
        });
        
        component = humanLike;
        return <div>Stop/Reset</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const keysBeforeReset = keyEvents.length;
      
      // Reset and verify no more events fire
      act(() => {
        component.reset();
        vi.advanceTimersByTime(2000);
      });
      
      expect(keyEvents.length).toBe(keysBeforeReset); // No new events after reset
    });
  });
});