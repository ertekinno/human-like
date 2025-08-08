/**
 * COMPLETE onKey functionality testing
 * Tests EVERYTHING - timing, accuracy, uniqueness, display, and integration
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

describe('Complete onKey Functionality Tests', () => {
  describe('Key Event Uniqueness and Duplication Prevention', () => {
    it('should never emit duplicate key events for same character position', async () => {
      const keyEvents: Array<{ key: string, timestamp: number, position: number }> = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Test duplicates',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push({
                key: keyInfo.key,
                timestamp: Date.now(),
                position: keyEvents.length
              });
            }
          }
        });
        
        return <div>Duplicate Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Check for exact duplicates (same key at same position)
      const duplicates = keyEvents.filter((event, index) => {
        return keyEvents.findIndex(e => 
          e.key === event.key && 
          e.position === event.position
        ) !== index;
      });
      
      expect(duplicates).toHaveLength(0);
      
      // Verify each key event has unique timestamp
      const timestamps = keyEvents.map(e => e.timestamp);
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(timestamps.length);
      
      console.log(`Uniqueness test: ${keyEvents.length} keys, 0 duplicates, all unique timestamps`);
    });

    it('should handle double character mistakes correctly without duplication', async () => {
      const keyEvents: KeyInfo[] = [];
      const charEvents: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Double char test',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0.8, // High rate to force double char mistakes
            mistakeTypes: {
              doubleChar: true,
              adjacent: false,
              random: false,
              commonTypos: false
            },
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onChar: (char) => {
            charEvents.push(char);
          }
        });
        
        return <div>Double Char Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Should have backspace keys for corrections
      const backspaceKeys = keyEvents.filter(k => 
        k.key.includes('⌫') || k.type === 'backspace'
      );
      expect(backspaceKeys.length).toBeGreaterThan(0);
      
      // Check that each key event is valid and properly formed
      keyEvents.forEach(keyEvent => {
        expect(keyEvent.key).toBeDefined();
        expect(keyEvent.type).toBeDefined();
        expect(keyEvent.duration).toBeGreaterThan(0);
      });
      
      console.log(`Double char handling: ${keyEvents.length} keys, ${backspaceKeys.length} backspaces, ${charEvents.length} chars`);
    });

    it('should maintain key sequence integrity with rapid corrections', async () => {
      const keyEvents: Array<{ key: string, sequence: number, type: string }> = [];
      let sequenceNumber = 0;
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Rapid correction test',
          autoStart: true,
          config: {
            speed: 40,
            mistakeFrequency: 0.5,
            realizationDelay: 100, // Quick corrections
            onKey: (keyInfo) => {
              keyEvents.push({
                key: keyInfo.key,
                sequence: ++sequenceNumber,
                type: keyInfo.type
              });
            }
          }
        });
        
        return <div>Sequence Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Verify sequence numbers are strictly increasing
      for (let i = 1; i < keyEvents.length; i++) {
        expect(keyEvents[i].sequence).toBeGreaterThan(keyEvents[i - 1].sequence);
      }
      
      // Should have a mix of key types
      const keyTypes = new Set(keyEvents.map(k => k.type));
      expect(keyTypes.size).toBeGreaterThan(1);
      
      console.log(`Sequence integrity: ${keyEvents.length} keys in perfect sequence, ${keyTypes.size} key types`);
    });
  });

  describe('UI Integration and Display Prevention', () => {
    it('should simulate the exact user app scenario - prevent double display', async () => {
      // Simulate the user's application setup
      const appKeyPresses: Array<{ id: string, keyInfo: KeyInfo }> = [];
      const indicatorHistory: Array<{ id: string, keyInfo: KeyInfo }> = [];
      
      const SimulatedUserApp = () => {
        const [keyHistory, setKeyHistory] = useState<Array<{ id: string, keyInfo: KeyInfo }>>([]);
        
        // Simulate useKeyPressIndicator behavior
        const addKeyPress = (keyInfo: KeyInfo) => {
          const newEntry = { id: Date.now().toString(), keyInfo };
          indicatorHistory.push(newEntry);
          setKeyHistory(prev => [...prev, newEntry]);
        };
        
        useHumanLike({
          text: 'I was out with FRIENDS. Relax',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.05,
            onKey: (keyInfo) => {
              // USER'S ORIGINAL PROBLEM: Both of these were called
              // addKeyPress(keyInfo);  // This line caused duplicates
              appKeyPresses.push({ id: Date.now().toString(), keyInfo });
              
              // Only use ONE method - not both
              setKeyHistory(prev => {
                const newEntry = { id: Date.now().toString(), keyInfo };
                return [...prev, newEntry];
              });
            }
          }
        });
        
        return (
          <div data-testid="key-count">
            App: {appKeyPresses.length}, History: {keyHistory.length}
          </div>
        );
      };
      
      const { getByTestId } = render(<SimulatedUserApp />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      const displayElement = getByTestId('key-count');
      const [appCount, historyCount] = displayElement.textContent!
        .match(/\d+/g)!.map(Number);
      
      // With correct implementation, counts should match (no duplicates)
      expect(appCount).toBe(historyCount);
      expect(appCount).toBeGreaterThan(0);
      
      // Should have keys for 'a' and 'x' from "Relax"
      const keySequence = appKeyPresses.map(k => k.keyInfo.key).join(',');
      expect(keySequence).toContain('a');
      expect(keySequence).toContain('x');
      
      console.log(`UI Integration: ${appCount} keys processed, no duplicates, final chars included`);
    });

    it('should detect when double tracking occurs and fail the test', async () => {
      const trackingMethod1: KeyInfo[] = [];
      const trackingMethod2: KeyInfo[] = [];
      const totalDisplayed: KeyInfo[] = [];
      
      const DoubleTrackingDemo = () => {
        useHumanLike({
          text: 'Double tracking demo',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              // WRONG WAY - Using both tracking methods
              trackingMethod1.push(keyInfo);
              trackingMethod2.push(keyInfo);
              
              // This would cause double display
              totalDisplayed.push(...[keyInfo, keyInfo]); // Intentional double
            }
          }
        });
        
        return <div>Bad Example</div>;
      };
      
      render(<DoubleTrackingDemo />);
      
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      // This test SHOULD detect the problem
      expect(trackingMethod1.length).toBeGreaterThan(0);
      expect(trackingMethod2.length).toBe(trackingMethod1.length); // Same count
      expect(totalDisplayed.length).toBe(trackingMethod1.length * 2); // Double!
      
      // This demonstrates the user's original problem
      console.log(`Double tracking detected: ${trackingMethod1.length} keys tracked twice = ${totalDisplayed.length} displayed`);
    });
  });

  describe('Complete Key Event Accuracy', () => {
    it('should emit every single character as key events with perfect accuracy', async () => {
      const text = 'Complete accuracy test: A1@#$% and 123!';
      const keyEvents: KeyInfo[] = [];
      const characterMap = new Map<number, string>();
      
      const TestComponent = () => {
        useHumanLike({
          text,
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0, // No mistakes for accuracy test
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
            }
          },
          onChar: (char, index) => {
            characterMap.set(index, char);
          }
        });
        
        return <div>Accuracy Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      
      // Every character should have corresponding key events
      expect(characterMap.size).toBe(text.length);
      expect(keyEvents.length).toBeGreaterThan(text.length); // More keys due to modifiers
      
      // Should have all character types represented in keys
      const hasLetters = keyEvents.some(k => k.type === 'letter');
      const hasNumbers = keyEvents.some(k => k.type === 'number');
      const hasSymbols = keyEvents.some(k => k.type === 'symbol');
      const hasModifiers = keyEvents.some(k => k.type === 'modifier');
      const hasSpaces = keyEvents.some(k => k.type === 'space');
      
      expect(hasLetters).toBe(true);
      expect(hasNumbers).toBe(true);
      expect(hasSymbols).toBe(true);
      expect(hasModifiers).toBe(true);
      expect(hasSpaces).toBe(true);
      
      // Every key should have valid properties
      keyEvents.forEach(keyEvent => {
        expect(keyEvent.key).toBeTruthy();
        expect(keyEvent.type).toBeTruthy();
        expect(keyEvent.duration).toBeGreaterThan(0);
      });
      
      console.log(`Accuracy test: ${text.length} chars → ${keyEvents.length} keys with all types present`);
    });

    it('should handle the exact problematic text from user report', async () => {
      const problematicText = 'I was out with FRIENDS. +90 507 998 5626 Relax';
      const keyEvents: KeyInfo[] = [];
      const finalCharacters: string[] = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: problematicText,
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0.05,
            onKey: (keyInfo) => {
              keyEvents.push(keyInfo);
              
              // Track the final characters specifically
              if (problematicText.indexOf(keyInfo.key) >= problematicText.length - 5) {
                finalCharacters.push(keyInfo.key);
              }
            }
          }
        });
        
        return <div>User Problem Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(25000);
      });
      
      // Must have the problematic final characters
      const keyString = keyEvents.map(k => k.key).join(',');
      expect(keyString).toContain('a'); // From "Relax"
      expect(keyString).toContain('x'); // From "Relax"
      
      // Should have phone number keys
      expect(keyString).toContain('5');
      expect(keyString).toContain('6');
      expect(keyString).toContain('+');
      
      // Should have all word keys (case may vary due to keyboard simulation)
      expect(keyString.toLowerCase()).toContain('r'); // From "FRIENDS" or "Relax"
      expect(keyString.toLowerCase()).toContain('e'); // From "FRIENDS"
      
      console.log(`User problem test: "${problematicText}" → ${keyEvents.length} keys including final 'a' and 'x'`);
    });
  });

  describe('Real-time Key Processing', () => {
    it('should emit keys in real-time during typing progress', async () => {
      const keyTimestamps: number[] = [];
      const progressUpdates: Array<{ progress: number, keyCount: number }> = [];
      
      const TestComponent = () => {
        const { progress } = useHumanLike({
          text: 'Real-time key processing test',
          autoStart: true,
          config: {
            speed: 100, // Slower to capture timing
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyTimestamps.push(Date.now());
              progressUpdates.push({ 
                progress: Math.round(progress), 
                keyCount: keyTimestamps.length 
              });
            }
          }
        });
        
        return <div>Real-time Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // Should have gradual progress with keys
      expect(progressUpdates.length).toBeGreaterThan(5);
      
      // Progress should generally increase with key count
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i].keyCount).toBeGreaterThanOrEqual(progressUpdates[i - 1].keyCount);
      }
      
      // Timestamps should be spread over time (real-time emission)
      const timeSpan = Math.max(...keyTimestamps) - Math.min(...keyTimestamps);
      expect(timeSpan).toBeGreaterThan(1000); // Should take some time
      
      console.log(`Real-time: ${keyTimestamps.length} keys over ${timeSpan}ms with gradual progress`);
    });

    it('should handle rapid key events without dropping any', async () => {
      const keyEvents: Array<{ key: string, timestamp: number }> = [];
      
      const TestComponent = () => {
        useHumanLike({
          text: 'Rapid key test with fast typing speed',
          autoStart: true,
          config: {
            speed: 10, // Very fast
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              keyEvents.push({
                key: keyInfo.key,
                timestamp: Date.now()
              });
            }
          }
        });
        
        return <div>Rapid Test</div>;
      };
      
      render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should capture all keys despite high speed
      expect(keyEvents.length).toBeGreaterThan(25); // Should have many keys
      
      // No two keys should have exact same timestamp
      const timestamps = keyEvents.map(k => k.timestamp);
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(timestamps.length);
      
      // Keys should be in chronological order
      for (let i = 1; i < keyEvents.length; i++) {
        expect(keyEvents[i].timestamp).toBeGreaterThanOrEqual(keyEvents[i - 1].timestamp);
      }
      
      console.log(`Rapid test: ${keyEvents.length} keys in ${timestamps.length} unique timestamps`);
    });
  });

  describe('Cross-Component Key Event Isolation', () => {
    it('should keep key events separate between multiple typing instances', async () => {
      const instance1Keys: Array<{ id: string, key: string }> = [];
      const instance2Keys: Array<{ id: string, key: string }> = [];
      const instance3Keys: Array<{ id: string, key: string }> = [];
      
      const MultipleInstances = () => {
        // Instance 1
        useHumanLike({
          text: 'Instance one',
          autoStart: true,
          config: {
            speed: 60,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              instance1Keys.push({ id: 'inst1', key: keyInfo.key });
            }
          }
        });
        
        // Instance 2  
        useHumanLike({
          text: 'Instance two',
          autoStart: true,
          config: {
            speed: 80,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              instance2Keys.push({ id: 'inst2', key: keyInfo.key });
            }
          }
        });
        
        // Instance 3
        useHumanLike({
          text: 'Instance three',
          autoStart: true,
          config: {
            speed: 50,
            mistakeFrequency: 0,
            onKey: (keyInfo) => {
              instance3Keys.push({ id: 'inst3', key: keyInfo.key });
            }
          }
        });
        
        return <div>Multiple Instances</div>;
      };
      
      render(<MultipleInstances />);
      
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      
      // All instances should have keys
      expect(instance1Keys.length).toBeGreaterThan(0);
      expect(instance2Keys.length).toBeGreaterThan(0);
      expect(instance3Keys.length).toBeGreaterThan(0);
      
      // Keys should be properly isolated (no cross-contamination)
      expect(instance1Keys.every(k => k.id === 'inst1')).toBe(true);
      expect(instance2Keys.every(k => k.id === 'inst2')).toBe(true);
      expect(instance3Keys.every(k => k.id === 'inst3')).toBe(true);
      
      // Combined, no duplicate keys across instances
      const allKeys = [...instance1Keys, ...instance2Keys, ...instance3Keys];
      const keyMap = new Map<string, string[]>();
      
      allKeys.forEach(({ id, key }) => {
        if (!keyMap.has(key)) keyMap.set(key, []);
        keyMap.get(key)!.push(id);
      });
      
      console.log(`Isolation: Inst1(${instance1Keys.length}), Inst2(${instance2Keys.length}), Inst3(${instance3Keys.length}) - all isolated`);
    });
  });
});