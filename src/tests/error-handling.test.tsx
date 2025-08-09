/**
 * Error handling and callback safety tests
 * Ensures robust error handling without breaking the typing flow
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React, { useState } from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import type { KeyInfo, MistakeInfo, TypingState } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
  // Suppress console.warn for expected error tests
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Error Handling and Callback Safety', () => {
  describe('Callback Error Resilience', () => {
    it('should continue typing when onKey callback throws errors', async () => {
      const keyEvents: KeyInfo[] = [];
      const completionEvents: string[] = [];
      let errorCount = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Error resilience test',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            debug: true,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
              // Throw error on every 3rd key
              if (keyEvents.length % 3 === 0) {
                errorCount++;
                throw new Error(`Test error ${errorCount}`);
              }
            }
          },
          onComplete: () => {
            completionEvents.push('completed despite errors');
          }
        });
        
        return <div>Error Resilience</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Should complete despite callback errors
      expect(completionEvents).toHaveLength(1);
      expect(errorCount).toBeGreaterThan(0);
      expect(keyEvents.length).toBeGreaterThan(errorCount * 3);
      
      console.log(`Error resilience: ${errorCount} errors thrown, ${keyEvents.length} keys processed, completed successfully`);
    });

    it('should handle onComplete callback errors gracefully', async () => {
      const keyEvents: KeyInfo[] = [];
      const stateChanges: TypingState[] = [];
      let completionErrorCount = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Completion error test',
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onComplete: () => {
            completionErrorCount++;
            throw new Error('Completion callback error');
          },
          onStateChange: (event) => {
            stateChanges.push(event.currentState);
          }
        });
        
        return <div>Completion Error</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      
      expect(completionErrorCount).toBe(1);
      expect(keyEvents.length).toBeGreaterThan(0);
      expect(stateChanges).toContain('completed');
      
      console.log(`Completion error: Error thrown, ${keyEvents.length} keys processed, state properly updated`);
    });

    it('should handle multiple callback errors without state corruption', async () => {
      const events: { type: string, error?: boolean }[] = [];
      let errorCount = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Multiple callback errors',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0.2,
            onKey: (keyInfo) => {
              events.push({ type: 'key' });
              if (Math.random() < 0.3) {
                errorCount++;
                events.push({ type: 'key-error', error: true });
                throw new Error('Random onKey error');
              }
            }
          },
          onChar: (char) => {
            events.push({ type: 'char' });
            if (Math.random() < 0.2) {
              errorCount++;
              events.push({ type: 'char-error', error: true });
              throw new Error('Random onChar error');
            }
          },
          onMistake: (mistake) => {
            events.push({ type: 'mistake' });
            if (Math.random() < 0.4) {
              errorCount++;
              events.push({ type: 'mistake-error', error: true });
              throw new Error('Random onMistake error');
            }
          },
          onComplete: () => {
            events.push({ type: 'complete' });
          }
        });
        
        return <div>Multiple Errors</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      const completionEvents = events.filter(e => e.type === 'complete');
      expect(completionEvents).toHaveLength(1);
      expect(errorCount).toBeGreaterThan(0);
      
      console.log(`Multiple errors: ${errorCount} total errors, completed successfully`);
    });

    it('should handle null/undefined callback parameters gracefully', async () => {
      const events: any[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Null parameter test',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              // Test with potentially null keyInfo
              if (keyInfo === null || keyInfo === undefined) {
                events.push({ type: 'null-key', value: keyInfo });
                throw new Error('Received null keyInfo');
              }
              events.push({ type: 'valid-key', key: keyInfo.key });
            }
          },
          onChar: (char, index) => {
            // Test with potentially null parameters
            if (char === null || char === undefined || index === null || index === undefined) {
              events.push({ type: 'null-char', char, index });
              throw new Error('Received null char or index');
            }
            events.push({ type: 'valid-char', char, index });
          },
          onComplete: () => {
            events.push({ type: 'complete' });
          }
        });
        
        return <div>Null Parameters</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      const nullEvents = events.filter(e => e.type.startsWith('null-'));
      const validEvents = events.filter(e => e.type.startsWith('valid-'));
      const completionEvents = events.filter(e => e.type === 'complete');
      
      expect(nullEvents).toHaveLength(0); // Should not receive null parameters
      expect(validEvents.length).toBeGreaterThan(0);
      expect(completionEvents).toHaveLength(1);
      
      console.log(`Null parameters: ${nullEvents.length} null events, ${validEvents.length} valid events`);
    });
  });

  describe('Memory Management and Cleanup', () => {
    it('should clean up resources when component unmounts during typing', async () => {
      const events: string[] = [];
      let timerCountBeforeUnmount = 0;
      let timerCountAfterUnmount = 0;
      
      const TestComponent = ({ shouldRender }: { shouldRender: boolean }) => {
        if (!shouldRender) return null;
        
        useHumanLike({
          text: 'Cleanup test - this will be interrupted',
          autoStart: true,
          config: {
            speed: 100, // Slow to ensure interruption
            mistakeFrequency: 0,
            onKey: () => {
              events.push('key');
            }
          },
          onComplete: () => {
            events.push('complete');
          }
        });
        
        return <div>Cleanup Test</div>;
      };
      
      const { rerender } = render(<TestComponent shouldRender={true} />);
      
      // Let it start typing
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      timerCountBeforeUnmount = events.length;
      
      // Unmount component
      rerender(<TestComponent shouldRender={false} />);
      
      // Continue advancing time to check for leaks
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      timerCountAfterUnmount = events.length;
      
      // Should not have new events after unmount
      expect(timerCountAfterUnmount).toBe(timerCountBeforeUnmount);
      expect(events.filter(e => e === 'complete')).toHaveLength(0);
      
      console.log(`Cleanup: ${timerCountBeforeUnmount} events before unmount, no new events after`);
    });

    it('should handle rapid component recreation without memory leaks', async () => {
      const allEvents: { id: number, type: string }[] = [];
      let componentId = 0;
      
      const TestComponent = ({ componentKey }: { componentKey: number }) => {
        const [id] = useState(() => ++componentId);
        
        useHumanLike({
          text: `Component ${id}`,
          autoStart: true,
          config: {
            speed: 30,
            mistakeFrequency: 0,
            onKey: () => {
              allEvents.push({ id, type: 'key' });
            }
          },
          onComplete: () => {
            allEvents.push({ id, type: 'complete' });
          }
        });
        
        return <div>Component {id}</div>;
      };
      
      let currentKey = 0;
      const { rerender } = render(<TestComponent key={currentKey} componentKey={currentKey} />);
      
      // Rapidly recreate components
      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(500);
        });
        
        currentKey++;
        rerender(<TestComponent key={currentKey} componentKey={currentKey} />);
      }
      
      // Final time advance
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      // Should have events from multiple components
      const uniqueIds = new Set(allEvents.map(e => e.id));
      expect(uniqueIds.size).toBeGreaterThan(1);
      
      // Last component should complete
      const lastId = Math.max(...Array.from(uniqueIds));
      const lastComponentEvents = allEvents.filter(e => e.id === lastId);
      expect(lastComponentEvents.filter(e => e.type === 'complete').length).toBe(1);
      
      console.log(`Rapid recreation: ${uniqueIds.size} components created, ${allEvents.length} total events`);
    });

    it('should handle stop/reset operations without resource leaks', async () => {
      const events: string[] = [];
      let hookControls: any;
      
      const TestComponent = () => {
        const controls = useHumanLike({
          text: 'Stop/reset resource leak test',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.1,
            onKey: () => {
              events.push('key');
              
              // Stop and reset at random intervals
              if (events.length === 5) {
                setTimeout(() => controls.stop(), 10);
              } else if (events.length === 10) {
                setTimeout(() => controls.reset(), 10);
              } else if (events.length === 15) {
                setTimeout(() => controls.start(), 10);
              }
            }
          },
          onComplete: () => {
            events.push('complete');
          }
        });
        
        hookControls = controls;
        return <div>Stop/Reset Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Should handle all operations without crashing
      expect(events.length).toBeGreaterThan(15);
      
      console.log(`Stop/reset: ${events.length} events processed through multiple stop/reset cycles`);
    });
  });

  describe('Async Operation Safety', () => {
    it('should handle concurrent typing operations safely', async () => {
      const hook1Events: { id: string, type: string }[] = [];
      const hook2Events: { id: string, type: string }[] = [];
      
      const TestComponent = () => {
        // Two concurrent typing hooks
        useHumanLike({
          text: 'Concurrent operation 1',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0.05,
            onKey: () => {
              hook1Events.push({ id: 'hook1', type: 'key' });
              // Simulate async operation
              Promise.resolve().then(() => {
                hook1Events.push({ id: 'hook1', type: 'async-key' });
              });
            }
          },
          onComplete: () => {
            hook1Events.push({ id: 'hook1', type: 'complete' });
          }
        });
        
        useHumanLike({
          text: 'Concurrent operation 2',
          autoStart: true,
          config: {
            speed: 70,
            mistakeFrequency: 0.08,
            onKey: () => {
              hook2Events.push({ id: 'hook2', type: 'key' });
              // Simulate async operation with potential error
              Promise.resolve().then(() => {
                if (Math.random() < 0.1) {
                  throw new Error('Async error');
                }
                hook2Events.push({ id: 'hook2', type: 'async-key' });
              }).catch(() => {
                hook2Events.push({ id: 'hook2', type: 'async-error' });
              });
            }
          },
          onComplete: () => {
            hook2Events.push({ id: 'hook2', type: 'complete' });
          }
        });
        
        return <div>Concurrent Operations</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Both hooks should complete
      expect(hook1Events.filter(e => e.type === 'complete')).toHaveLength(1);
      expect(hook2Events.filter(e => e.type === 'complete')).toHaveLength(1);
      
      // Should have async operations
      expect(hook1Events.filter(e => e.type === 'async-key').length).toBeGreaterThan(0);
      expect(hook2Events.filter(e => e.type.startsWith('async-')).length).toBeGreaterThan(0);
      
      console.log(`Concurrent: Hook1 ${hook1Events.length} events, Hook2 ${hook2Events.length} events`);
    });

    it('should handle promise-based callback errors', async () => {
      const events: { type: string, hasError?: boolean }[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Promise error test',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              events.push({ type: 'key' });
              
              // Simulate promise-based async operation that might fail
              Promise.resolve().then(() => {
                if (events.length % 4 === 0) {
                  throw new Error('Async callback error');
                }
                events.push({ type: 'async-success' });
              }).catch((error) => {
                events.push({ type: 'async-error', hasError: true });
              });
            }
          },
          onComplete: () => {
            events.push({ type: 'complete' });
          }
        });
        
        return <div>Promise Errors</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      
      const completionEvents = events.filter(e => e.type === 'complete');
      const errorEvents = events.filter(e => e.hasError);
      const successEvents = events.filter(e => e.type === 'async-success');
      
      expect(completionEvents).toHaveLength(1);
      expect(errorEvents.length).toBeGreaterThan(0);
      expect(successEvents.length).toBeGreaterThan(0);
      
      console.log(`Promise errors: ${errorEvents.length} async errors, ${successEvents.length} successes, completed`);
    });
  });

  describe('Configuration Error Handling', () => {
    it('should handle invalid configuration gracefully', async () => {
      const events: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Invalid config test',
          autoStart: true,
          config: {
            speed: -50, // Invalid speed
            mistakeFrequency: 2.5, // Invalid frequency (>1)
            speedVariation: -10, // Invalid variation
            onKey: () => events.push('key')
          } as any,
          onComplete: () => events.push('complete')
        });
        
        return <div>Invalid Config</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should still work with fallback values
      expect(events.filter(e => e === 'complete')).toHaveLength(1);
      expect(events.length).toBeGreaterThan(1);
      
      console.log(`Invalid config: Handled gracefully, ${events.length} events`);
    });

    it('should handle null/undefined text gracefully', async () => {
      const events: string[] = [];
      
      const TestComponent = () => {
        const [text, setText] = useState<string | null>(null);
        
        const { displayText } = useHumanLike({
          text: text as any,
          autoStart: true,
          config: {
            onKey: () => events.push('key')
          },
          onComplete: () => {
            events.push('complete');
            // Switch to valid text
            if (text === null) {
              setTimeout(() => setText('Now valid text'), 100);
            }
          }
        });
        
        return <div data-testid="display">{displayText}</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Should complete null text, then handle valid text
      expect(events.filter(e => e === 'complete').length).toBeGreaterThanOrEqual(1);
      
      console.log(`Null text: Handled gracefully, ${events.length} events`);
    });

    it('should handle malformed callback configuration', async () => {
      const events: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Malformed callbacks test',
          autoStart: true,
          config: {
            speed: 50,
            onKey: 'not a function' as any,
            mistakeFrequency: 0
          },
          onComplete: 42 as any, // Not a function
          onChar: null as any,
          onMistake: undefined as any
        });
        
        return <div>Malformed Callbacks</div>;
      };
      
      // Should not crash during render
      expect(() => render(<TestComponent />)).not.toThrow();
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      // Should complete without crashing despite malformed callbacks
      console.log('Malformed callbacks: Handled without crashing');
    });
  });
});