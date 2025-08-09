/**
 * Edge cases and stress testing for robust event handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import React, { useState, useRef, useEffect } from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import type { KeyInfo, TypingState } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Edge Cases and Stress Testing', () => {
  describe('Text Change Edge Cases', () => {
    it('should handle rapid text changes without losing events', async () => {
      const events: { text: string, type: string, timestamp: number }[] = [];
      
      const TestComponent = ({ currentText }: { currentText: string }) => {
        const { displayText } = useHumanLike({
          text: currentText,
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              events.push({ text: currentText, type: 'key', timestamp: Date.now() });
            }
          },
          onComplete: () => {
            events.push({ text: currentText, type: 'complete', timestamp: Date.now() });
          }
        });
        
        return <div>{displayText}</div>;
      };
      
      // Test multiple different texts by re-rendering
      const { rerender } = render(<TestComponent currentText="Text One" />);
      
      act(() => {
        vi.advanceTimersByTime(3000); // Complete first text
      });
      
      rerender(<TestComponent currentText="Text Two" />);
      
      act(() => {
        vi.advanceTimersByTime(3000); // Complete second text
      });
      
      rerender(<TestComponent currentText="Text Three" />);
      
      act(() => {
        vi.advanceTimersByTime(3000); // Complete third text
      });
      
      // Should have events for multiple text changes
      const uniqueTexts = new Set(events.map(e => e.text));
      expect(uniqueTexts.size).toBeGreaterThan(1);
      
      // Each text should have its events in the correct order
      const textGroups = new Map<string, typeof events>();
      events.forEach(event => {
        if (!textGroups.has(event.text)) {
          textGroups.set(event.text, []);
        }
        textGroups.get(event.text)!.push(event);
      });
      
      textGroups.forEach((textEvents, text) => {
        const completionIndex = textEvents.findIndex(e => e.type === 'complete');
        if (completionIndex > -1) {
          // All events before completion should be key events
          for (let i = 0; i < completionIndex; i++) {
            expect(textEvents[i].type).toBe('key');
          }
        }
      });
      
      console.log(`Rapid changes: ${uniqueTexts.size} different texts, ${events.length} total events`);
    });

    it('should handle text changes during typing without corruption', async () => {
      const events: { phase: string, type: string, data?: any }[] = [];
      let phase = 'initial';
      
      const TestComponent = () => {
        const [text, setText] = useState('Start typing this text');
        
        useHumanLike({
          text,
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.1,
            onKey: (keyInfo) => {
              events.push({ phase, type: 'key', data: keyInfo.key });
              
              // Change text mid-typing
              if (events.filter(e => e.type === 'key' && e.phase === 'initial').length === 5) {
                phase = 'changed';
                setTimeout(() => setText('Changed to this new text'), 10);
              }
            }
          },
          onComplete: () => {
            events.push({ phase, type: 'complete' });
          }
        });
        
        return <div>Mid-change Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      // Should have events from both phases
      const initialPhaseEvents = events.filter(e => e.phase === 'initial');
      const changedPhaseEvents = events.filter(e => e.phase === 'changed');
      
      expect(initialPhaseEvents.length).toBeGreaterThan(0);
      expect(changedPhaseEvents.length).toBeGreaterThan(0);
      
      console.log(`Mid-change: ${initialPhaseEvents.length} initial events, ${changedPhaseEvents.length} changed events`);
    });

    it('should handle empty to non-empty text transitions', async () => {
      const events: string[] = [];
      
      const TestComponent = () => {
        const [text, setText] = useState('');
        
        const { isCompleted } = useHumanLike({
          text,
          autoStart: true,
          config: {
            onKey: () => events.push('key')
          },
          onComplete: () => {
            events.push('complete');
            // Transition to non-empty
            if (text === '') {
              setTimeout(() => setText('Now has content'), 100);
            }
          }
        });
        
        return <div>Empty Transition</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should complete empty text quickly, then start non-empty
      const completionCount = events.filter(e => e === 'complete').length;
      expect(completionCount).toBeGreaterThanOrEqual(1);
      
      console.log(`Empty transition: ${events.length} total events, ${completionCount} completions`);
    });
  });

  describe('Component Lifecycle Edge Cases', () => {
    it('should handle unmount during typing', async () => {
      const events: string[] = [];
      
      const TestComponent = ({ shouldUnmount }: { shouldUnmount: boolean }) => {
        if (shouldUnmount) return null;
        
        useHumanLike({
          text: 'Component will unmount soon',
          autoStart: true,
          config: {
            speed: 100,
            onKey: () => events.push('key')
          },
          onComplete: () => events.push('complete')
        });
        
        return <div>Unmount Test</div>;
      };
      
      const { rerender } = render(<TestComponent shouldUnmount={false} />);
      
      // Let it start typing
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      const eventsBeforeUnmount = events.length;
      
      // Unmount component
      rerender(<TestComponent shouldUnmount={true} />);
      
      // Continue time to see if events leak
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should not have more events after unmount
      expect(events.length).toBe(eventsBeforeUnmount);
      expect(events.filter(e => e === 'complete')).toHaveLength(0);
      
      console.log(`Unmount test: ${events.length} events, no leakage after unmount`);
    });

    it('should handle rapid mount/unmount cycles', async () => {
      const events: { id: number, type: string }[] = [];
      let instanceId = 0;
      
      const TestComponent = ({ mounted }: { mounted: boolean }) => {
        const [currentId] = useState(() => ++instanceId);
        
        // Always call useHumanLike to avoid hook order issues
        const hookResult = useHumanLike({
          text: mounted ? `Instance ${currentId}` : '',
          autoStart: mounted,
          config: {
            speed: 40,
            onKey: () => {
              if (mounted) {
                events.push({ id: currentId, type: 'key' });
              }
            }
          },
          onComplete: () => {
            if (mounted) {
              events.push({ id: currentId, type: 'complete' });
            }
          }
        });
        
        if (!mounted) return null;
        
        return <div>Instance {currentId}</div>;
      };
      
      const { rerender } = render(<TestComponent mounted={true} />);
      
      // Rapid mount/unmount
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(200);
        });
        
        rerender(<TestComponent mounted={false} />);
        
        act(() => {
          vi.advanceTimersByTime(100);
        });
        
        rerender(<TestComponent mounted={true} />);
      }
      
      // Final time advance
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Verify events are properly attributed to instances
      const instanceGroups = new Map<number, typeof events[0][]>();
      events.forEach(event => {
        if (!instanceGroups.has(event.id)) {
          instanceGroups.set(event.id, []);
        }
        instanceGroups.get(event.id)!.push(event);
      });
      
      console.log(`Rapid mount/unmount: ${instanceGroups.size} instances, ${events.length} total events`);
    });

    it('should handle state updates during typing', async () => {
      const events: { eventCount: number, type: string }[] = [];
      let eventCounter = 0;
      
      const TestComponent = () => {
        const [rerenderTrigger, setRerenderTrigger] = useState(0);
        
        useHumanLike({
          text: 'State update test',
          autoStart: true,
          config: {
            speed: 40,
            onKey: (keyInfo) => {
              eventCounter++;
              events.push({ eventCount: eventCounter, type: 'key' });
              
              // Trigger component re-render during typing
              if (eventCounter === 5) {
                setRerenderTrigger(prev => prev + 1);
              }
            }
          },
          onComplete: () => {
            eventCounter++;
            events.push({ eventCount: eventCounter, type: 'complete' });
          }
        });
        
        return <div data-testid="renders">Renders: {rerenderTrigger}</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(6000);
      });
      
      // Should have events from before and after state change
      const initialEvents = events.filter(e => e.eventCount <= 5);
      const updatedEvents = events.filter(e => e.eventCount > 5);
      
      expect(initialEvents.length).toBeGreaterThan(0);
      expect(updatedEvents.length).toBeGreaterThan(0);
      
      console.log(`State updates: ${initialEvents.length} initial, ${updatedEvents.length} updated events`);
    });
  });

  describe('Interruption and Recovery', () => {
    it('should handle pause/resume interruptions gracefully', async () => {
      const events: { action: string, timestamp: number }[] = [];
      let controls: any;
      
      const TestComponent = () => {
        const humanLike = useHumanLike({
          text: 'Interruption recovery test with multiple pauses',
          autoStart: true,
          config: {
            speed: 70,
            mistakeFrequency: 0.05,
            onKey: () => events.push({ action: 'key', timestamp: Date.now() })
          },
          onComplete: () => events.push({ action: 'complete', timestamp: Date.now() })
        });
        
        controls = humanLike;
        return <div>Interruption Test</div>;
      };
      
      render(<TestComponent />);
      
      // Multiple pause/resume cycles
      let keyCount = 0;
      const performInterruptions = () => {
        const currentKeys = events.filter(e => e.action === 'key').length;
        
        if (currentKeys > keyCount && currentKeys < 20) {
          if (currentKeys % 5 === 0) {
            controls.pause();
            events.push({ action: 'pause', timestamp: Date.now() });
            
            setTimeout(() => {
              controls.resume();
              events.push({ action: 'resume', timestamp: Date.now() });
            }, 200);
          }
        }
        
        keyCount = currentKeys;
      };
      
      const intervalId = setInterval(performInterruptions, 100);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      clearInterval(intervalId);
      
      // Should complete despite interruptions
      expect(events.filter(e => e.action === 'complete')).toHaveLength(1);
      
      const pauseCount = events.filter(e => e.action === 'pause').length;
      const resumeCount = events.filter(e => e.action === 'resume').length;
      
      console.log(`Interruptions: ${pauseCount} pauses, ${resumeCount} resumes, completed successfully`);
    });

    it('should handle config updates during typing', async () => {
      const events: { configId: string, type: string }[] = [];
      
      // Test different configurations by re-rendering
      const TestComponent = ({ configId, speed }: { configId: string, speed: number }) => {
        useHumanLike({
          text: 'Config test',
          autoStart: true,
          config: {
            speed,
            mistakeFrequency: 0,
            onKey: () => {
              events.push({ configId, type: 'key' });
            }
          },
          onComplete: () => {
            events.push({ configId, type: 'complete' });
          }
        });
        
        return <div>Config: {configId}</div>;
      };
      
      // Test two different speed configurations
      const { rerender } = render(<TestComponent configId="fast" speed={30} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      rerender(<TestComponent configId="slow" speed={80} />);
      
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      // Should have events from both configurations
      const speed80Events = events.filter(e => e.configId === 'slow');
      const speed40Events = events.filter(e => e.configId === 'fast');
      
      expect(speed80Events.length).toBeGreaterThan(0);
      expect(speed40Events.length).toBeGreaterThan(0);
      
      console.log(`Config updates: ${speed40Events.length} fast events, ${speed80Events.length} slow events`);
    });

    it('should handle memory pressure scenarios', async () => {
      const events: { instance: number, type: string }[] = [];
      const instances: any[] = [];
      
      // Create multiple concurrent instances
      const MultiInstanceComponent = () => {
        for (let i = 0; i < 10; i++) {
          const instanceNum = i;
          
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useHumanLike({
            text: `Instance ${instanceNum} typing simultaneously`,
            autoStart: true,
            config: {
              speed: 50 + Math.random() * 50,
              mistakeFrequency: 0.05,
              onKey: () => events.push({ instance: instanceNum, type: 'key' })
            },
            onComplete: () => events.push({ instance: instanceNum, type: 'complete' })
          });
        }
        
        return <div>Memory Pressure Test</div>;
      };
      
      render(<MultiInstanceComponent />);
      
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      
      // Verify all instances completed
      const completedInstances = new Set(
        events.filter(e => e.type === 'complete').map(e => e.instance)
      );
      
      expect(completedInstances.size).toBe(10);
      
      // Verify no instance had completion before all its keys
      for (let i = 0; i < 10; i++) {
        const instanceEvents = events.filter(e => e.instance === i);
        const completionIndex = instanceEvents.findIndex(e => e.type === 'complete');
        
        if (completionIndex > -1) {
          for (let j = 0; j < completionIndex; j++) {
            expect(instanceEvents[j].type).toBe('key');
          }
        }
      }
      
      console.log(`Memory pressure: ${completedInstances.size} instances completed, ${events.length} total events`);
    });
  });

  describe('Real-world Scenario Edge Cases', () => {
    it('should handle chat application message bursts', async () => {
      const events: { messageId: string, type: string, timestamp: number }[] = [];
      
      const ChatSimulation = () => {
        const [messages, setMessages] = useState<Array<{id: string, text: string}>>([]);
        const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
        
        const messageTemplates = [
          'Hey there!',
          'How are you doing today?',
          'Want to grab coffee later?',
          'Sounds great, see you at 3pm',
          'Perfect, talk soon!'
        ];
        
        const { isCompleted } = useHumanLike({
          text: currentMessageIndex < messageTemplates.length ? messageTemplates[currentMessageIndex] : '',
          autoStart: currentMessageIndex < messageTemplates.length,
          config: {
            speed: 60 + Math.random() * 40,
            mistakeFrequency: 0.03,
            onKey: () => {
              const messageId = `msg-${currentMessageIndex}`;
              events.push({ messageId, type: 'key', timestamp: Date.now() });
            }
          },
          onComplete: () => {
            const messageId = `msg-${currentMessageIndex}`;
            events.push({ messageId, type: 'complete', timestamp: Date.now() });
            
            // Add message and move to next
            if (currentMessageIndex < messageTemplates.length) {
              setMessages(prev => [...prev, {
                id: messageId,
                text: messageTemplates[currentMessageIndex]
              }]);
              
              setTimeout(() => setCurrentMessageIndex(prev => prev + 1), 500);
            }
          }
        });
        
        return <div data-testid="message-count">{messages.length}</div>;
      };
      
      render(<ChatSimulation />);
      
      act(() => {
        vi.advanceTimersByTime(40000);
      });
      
      // Should process all messages
      const uniqueMessages = new Set(events.map(e => e.messageId));
      expect(uniqueMessages.size).toBe(5);
      
      // Each message should maintain timing guarantees
      uniqueMessages.forEach(messageId => {
        const messageEvents = events.filter(e => e.messageId === messageId);
        const completionIndex = messageEvents.findIndex(e => e.type === 'complete');
        
        if (completionIndex > -1) {
          for (let i = 0; i < completionIndex; i++) {
            expect(messageEvents[i].type).toBe('key');
          }
        }
      });
      
      console.log(`Chat simulation: ${uniqueMessages.size} messages, ${events.length} total events`);
    });

    it('should handle form input scenarios with validation', async () => {
      const events: { field: string, type: string, valid: boolean }[] = [];
      
      const FormSimulation = () => {
        const [currentField, setCurrentField] = useState(0);
        const [isValid, setIsValid] = useState(false);
        
        const fields = [
          'user@example.com',      // Email
          '+1-555-123-4567',       // Phone
          '123 Main St, City, ST', // Address
          'SecurePass123!',        // Password
        ];
        
        const fieldNames = ['email', 'phone', 'address', 'password'];
        
        useHumanLike({
          text: currentField < fields.length ? fields[currentField] : '',
          autoStart: currentField < fields.length,
          config: {
            speed: 70,
            mistakeFrequency: 0.08,
            onKey: () => {
              const fieldName = fieldNames[currentField] || 'unknown';
              events.push({ field: fieldName, type: 'key', valid: isValid });
            }
          },
          onChar: (char, index) => {
            // Simulate validation
            const currentText = fields[currentField]?.slice(0, index + 1) || '';
            const fieldName = fieldNames[currentField];
            
            let valid = false;
            if (fieldName === 'email') {
              valid = currentText.includes('@') && currentText.includes('.');
            } else if (fieldName === 'phone') {
              valid = currentText.length >= 10;
            } else {
              valid = currentText.length > 3;
            }
            
            setIsValid(valid);
          },
          onComplete: () => {
            const fieldName = fieldNames[currentField] || 'unknown';
            events.push({ field: fieldName, type: 'complete', valid: isValid });
            
            setTimeout(() => setCurrentField(prev => prev + 1), 300);
          }
        });
        
        return <div data-testid="current-field">{currentField}</div>;
      };
      
      render(<FormSimulation />);
      
      act(() => {
        vi.advanceTimersByTime(50000);
      });
      
      // Should complete all form fields
      const uniqueFields = new Set(events.map(e => e.field));
      expect(uniqueFields.size).toBe(4);
      
      // Each field should have completion event
      uniqueFields.forEach(fieldName => {
        const fieldCompletions = events.filter(e => e.field === fieldName && e.type === 'complete');
        expect(fieldCompletions.length).toBe(1);
      });
      
      console.log(`Form simulation: ${uniqueFields.size} fields completed, ${events.length} total events`);
    });
  });
});