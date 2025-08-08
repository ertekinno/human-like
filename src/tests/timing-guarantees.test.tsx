/**
 * Critical timing guarantees test suite
 * Ensures onComplete never fires before all onKey events are complete
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

describe('Timing Guarantees', () => {
  describe('onComplete vs onKey Ordering', () => {
    it('should NEVER fire onComplete before all onKey events', async () => {
      const events: { type: 'key' | 'complete', timestamp: number, keyInfo?: KeyInfo }[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Critical timing test with CAPS and symbols! @#$',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.05,
            debug: true,
            onKey: (keyInfo) => {
              events.push({
                type: 'key',
                timestamp: Date.now(),
                keyInfo
              });
            }
          },
          onComplete: () => {
            events.push({
              type: 'complete',
              timestamp: Date.now()
            });
          }
        });
        
        return <div>Timing Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      // Find the completion event
      const completionEventIndex = events.findIndex(e => e.type === 'complete');
      expect(completionEventIndex).toBeGreaterThan(-1); // Must have completion
      
      // ALL events before completion must be key events
      for (let i = 0; i < completionEventIndex; i++) {
        expect(events[i].type).toBe('key');
      }
      
      // No key events should occur after completion
      for (let i = completionEventIndex + 1; i < events.length; i++) {
        expect(events[i].type).not.toBe('key');
      }
      
      const keyCount = events.filter(e => e.type === 'key').length;
      console.log(`Timing guarantee test: ${keyCount} key events before completion`);
    });

    it('should guarantee timing even with complex mistakes and corrections', async () => {
      const events: { type: 'key' | 'char' | 'backspace' | 'complete', timestamp: number, data?: any }[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Mistake heavy text for testing',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0.4, // Very high mistake rate
            debug: true,
            onKey: (keyInfo) => {
              events.push({ type: 'key', timestamp: Date.now(), data: keyInfo });
            }
          },
          onChar: (char) => {
            events.push({ type: 'char', timestamp: Date.now(), data: char });
          },
          onBackspace: () => {
            events.push({ type: 'backspace', timestamp: Date.now() });
          },
          onComplete: () => {
            events.push({ type: 'complete', timestamp: Date.now() });
          }
        });
        
        return <div>Complex Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      
      const completionIndex = events.findIndex(e => e.type === 'complete');
      expect(completionIndex).toBeGreaterThan(-1);
      
      // Verify no key events after completion
      const keyEventsAfterCompletion = events
        .slice(completionIndex + 1)
        .filter(e => e.type === 'key');
      
      expect(keyEventsAfterCompletion).toHaveLength(0);
      
      const totalKeyEvents = events.filter(e => e.type === 'key').length;
      console.log(`Complex timing: ${totalKeyEvents} keys, completion at index ${completionIndex}`);
    });

    it('should maintain timing guarantees with rapid successive typing sessions', async () => {
      const sessionEvents: { session: number, type: 'key' | 'complete', timestamp: number }[] = [];
      let currentSession = 1;
      
      const TestComponent = () => {
        const [text, setText] = React.useState('Session 1');
        
        const { isCompleted } = useHumanLike({
          text,
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0.1,
            onKey: (keyInfo) => {
              sessionEvents.push({
                session: currentSession,
                type: 'key',
                timestamp: Date.now()
              });
            }
          },
          onComplete: () => {
            sessionEvents.push({
              session: currentSession,
              type: 'complete',
              timestamp: Date.now()
            });
            
            // Start next session
            if (currentSession < 3) {
              currentSession++;
              setTimeout(() => setText(`Session ${currentSession}`), 100);
            }
          }
        });
        
        return <div>{text}</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Group events by session
      const sessionGroups = new Map<number, typeof sessionEvents>();
      sessionEvents.forEach(event => {
        if (!sessionGroups.has(event.session)) {
          sessionGroups.set(event.session, []);
        }
        sessionGroups.get(event.session)!.push(event);
      });
      
      // Verify each session maintains timing guarantees
      sessionGroups.forEach((events, sessionNum) => {
        const completionIndex = events.findIndex(e => e.type === 'complete');
        if (completionIndex > -1) {
          // All events before completion must be key events
          for (let i = 0; i < completionIndex; i++) {
            expect(events[i].type).toBe('key');
          }
          
          console.log(`Session ${sessionNum}: ${completionIndex} keys before completion`);
        }
      });
    });
  });

  describe('Event Ordering Consistency', () => {
    it('should maintain consistent event ordering under stress', async () => {
      const events: { type: string, sequence: number, timestamp: number }[] = [];
      let sequenceNumber = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Stress test with SYMBOLS! @#$%^&*()_+ and 12345',
          autoStart: true,
          config: {
            speed: 30, // Fast typing
            mistakeFrequency: 0.3,
            debug: true,
            onKey: (keyInfo) => {
              events.push({
                type: 'key',
                sequence: ++sequenceNumber,
                timestamp: Date.now()
              });
            }
          },
          onChar: (char) => {
            events.push({
              type: 'char',
              sequence: ++sequenceNumber,
              timestamp: Date.now()
            });
          },
          onBackspace: () => {
            events.push({
              type: 'backspace',
              sequence: ++sequenceNumber,
              timestamp: Date.now()
            });
          },
          onComplete: () => {
            events.push({
              type: 'complete',
              sequence: ++sequenceNumber,
              timestamp: Date.now()
            });
          }
        });
        
        return <div>Stress Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      // Verify events are in correct sequence order
      for (let i = 1; i < events.length; i++) {
        expect(events[i].sequence).toBeGreaterThan(events[i - 1].sequence);
      }
      
      // Verify completion is last
      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('complete');
      
      console.log(`Stress test: ${events.length} total events in correct sequence`);
    });

    it('should handle concurrent hooks without event mixing', async () => {
      const hook1Events: { id: string, type: string }[] = [];
      const hook2Events: { id: string, type: string }[] = [];
      
      const TestComponent = () => {
        // Two concurrent typing sessions
        useHumanLike({
          text: 'Hook 1 text',
          autoStart: true,
          config: {
            speed: 50,
            onKey: () => hook1Events.push({ id: 'hook1', type: 'key' })
          },
          onComplete: () => hook1Events.push({ id: 'hook1', type: 'complete' })
        });
        
        useHumanLike({
          text: 'Hook 2 different text',
          autoStart: true,
          config: {
            speed: 60,
            onKey: () => hook2Events.push({ id: 'hook2', type: 'key' })
          },
          onComplete: () => hook2Events.push({ id: 'hook2', type: 'complete' })
        });
        
        return <div>Concurrent Hooks</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Both hooks should complete
      expect(hook1Events.filter(e => e.type === 'complete')).toHaveLength(1);
      expect(hook2Events.filter(e => e.type === 'complete')).toHaveLength(1);
      
      // Each hook should have their completion as the last event
      const hook1LastEvent = hook1Events[hook1Events.length - 1];
      const hook2LastEvent = hook2Events[hook2Events.length - 1];
      
      expect(hook1LastEvent.type).toBe('complete');
      expect(hook2LastEvent.type).toBe('complete');
      
      console.log(`Concurrent: Hook1 ${hook1Events.length} events, Hook2 ${hook2Events.length} events`);
    });
  });

  describe('Edge Case Timing', () => {
    it('should handle immediate stop after start without event leakage', async () => {
      const events: string[] = [];
      let hookControls: any;
      
      const TestComponent = () => {
        const controls = useHumanLike({
          text: 'Immediate stop test',
          autoStart: true,
          config: {
            onKey: () => events.push('key')
          },
          onComplete: () => events.push('complete')
        });
        
        hookControls = controls;
        return <div>Stop Test</div>;
      };
      
      render(<TestComponent />);
      
      // Immediately stop
      act(() => {
        hookControls.stop();
        vi.advanceTimersByTime(5000);
      });
      
      // Should have no completion events
      expect(events.filter(e => e === 'complete')).toHaveLength(0);
      
      console.log(`Immediate stop: ${events.length} events (should be minimal)`);
    });

    it('should handle skip operation timing correctly', async () => {
      const events: { type: string, timestamp: number }[] = [];
      let hookControls: any;
      
      const TestComponent = () => {
        const controls = useHumanLike({
          text: 'Skip operation timing test',
          autoStart: true,
          config: {
            speed: 100, // Slow so we can skip
            onKey: () => events.push({ type: 'key', timestamp: Date.now() })
          },
          onComplete: () => events.push({ type: 'complete', timestamp: Date.now() })
        });
        
        hookControls = controls;
        return <div>Skip Test</div>;
      };
      
      render(<TestComponent />);
      
      // Let it start, then skip
      act(() => {
        vi.advanceTimersByTime(500); // Let some keys happen
      });
      
      const keysBeforeSkip = events.filter(e => e.type === 'key').length;
      
      act(() => {
        hookControls.skip();
        vi.advanceTimersByTime(100);
      });
      
      // Should have exactly one completion event after skip
      const completionEvents = events.filter(e => e.type === 'complete');
      expect(completionEvents).toHaveLength(1);
      
      // Skip should not generate additional key events
      const keysAfterSkip = events.filter(e => e.type === 'key').length;
      expect(keysAfterSkip).toBe(keysBeforeSkip);
      
      console.log(`Skip test: ${keysBeforeSkip} keys before skip, completion triggered`);
    });

    it('should maintain timing guarantees with null/undefined text handling', async () => {
      const events: string[] = [];
      
      const TestComponent = () => {
        const [text, setText] = React.useState<string | null>(null);
        
        useHumanLike({
          text: text || '',
          autoStart: true,
          config: {
            onKey: () => events.push('key')
          },
          onComplete: () => {
            events.push('complete');
            // Switch to real text
            if (!text) {
              setTimeout(() => setText('Real text now'), 100);
            }
          }
        });
        
        return <div>Null Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should handle null text gracefully and still complete normally
      expect(events.filter(e => e === 'complete').length).toBeGreaterThanOrEqual(1);
      
      console.log(`Null handling: ${events.length} total events`);
    });
  });
});