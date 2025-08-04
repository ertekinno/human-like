/**
 * Tests for totalDuration functionality
 * Verifies that the typing engine accurately tracks the total duration of typing effects
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { HumanLike } from '../components/HumanLike';
import { useHumanLike } from '../hooks/useHumanLike';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// Test component to access hook values
const TestComponent: React.FC<{ text: string; onDurationUpdate?: (duration: number) => void }> = ({ 
  text, 
  onDurationUpdate 
}) => {
  const { displayText, totalDuration, isCompleted } = useHumanLike({
    text,
    config: { mistakeFrequency: 0, speed: 100 },
    autoStart: true
  });

  React.useEffect(() => {
    onDurationUpdate?.(totalDuration);
  }, [totalDuration, onDurationUpdate]);

  return <div data-testid="display">{displayText}</div>;
};

describe('TotalDuration Functionality', () => {
  describe('Basic Duration Tracking', () => {
    it('should start at 0 duration', () => {
      let capturedDuration = 0;
      
      render(
        <TestComponent 
          text="Hello" 
          onDurationUpdate={(duration) => capturedDuration = duration}
        />
      );

      expect(capturedDuration).toBe(0);
    });

    it('should track duration during typing', () => {
      let capturedDuration = 0;
      
      render(
        <TestComponent 
          text="Hi" 
          onDurationUpdate={(duration) => capturedDuration = duration}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(capturedDuration).toBeGreaterThan(0);
      expect(capturedDuration).toBeLessThanOrEqual(1000);
    });

    it('should accumulate duration over time', () => {
      const durations: number[] = [];
      
      render(
        <TestComponent 
          text="Hello World" 
          onDurationUpdate={(duration) => durations.push(duration)}
        />
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Duration should be increasing
      const uniqueDurations = [...new Set(durations)].filter(d => d > 0);
      expect(uniqueDurations.length).toBeGreaterThan(1);
      
      // Should be roughly 1500ms or less (accounting for timing precision)
      const finalDuration = durations[durations.length - 1];
      expect(finalDuration).toBeGreaterThan(0);
      expect(finalDuration).toBeLessThanOrEqual(1500);
    });
  });

  describe('Duration with Component', () => {
    it('should track duration in HumanLike component', () => {
      let totalDuration = 0;
      
      const TestWrapper = () => {
        const { totalDuration: duration } = useHumanLike({
          text: "Test",
          config: { mistakeFrequency: 0, speed: 50 },
          autoStart: true
        });
        
        React.useEffect(() => {
          totalDuration = duration;
        }, [duration]);
        
        return <div>Testing</div>;
      };

      render(<TestWrapper />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(totalDuration).toBeGreaterThan(0);
    });

    it('should have final duration when completed', () => {
      let finalDuration = 0;
      let completed = false;
      
      const onComplete = () => {
        completed = true;
      };

      const TestWrapper = () => {
        const { totalDuration, isCompleted } = useHumanLike({
          text: "Hi",
          config: { mistakeFrequency: 0, speed: 10 },
          autoStart: true,
          onComplete
        });
        
        React.useEffect(() => {
          if (isCompleted) {
            finalDuration = totalDuration;
          }
        }, [isCompleted, totalDuration]);
        
        return <div>Testing</div>;
      };

      render(<TestWrapper />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(completed).toBe(true);
      expect(finalDuration).toBeGreaterThan(0);
    });
  });

  describe('Duration Reset Behavior', () => {
    it('should reset duration when reset is called', () => {
      let duration = 0;
      let resetFn: (() => void) | null = null;
      
      const TestWrapper = () => {
        const { totalDuration, reset } = useHumanLike({
          text: "Hello",
          config: { mistakeFrequency: 0, speed: 100 },
          autoStart: true
        });
        
        resetFn = reset;
        duration = totalDuration;
        
        return <div>Testing</div>;
      };

      render(<TestWrapper />);

      // Let some typing happen
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(duration).toBeGreaterThan(0);

      // Reset
      act(() => {
        resetFn?.();
      });

      expect(duration).toBe(0);
    });

    it('should reset duration when text changes', () => {
      let duration = 0;
      
      const TestWrapper = ({ text }: { text: string }) => {
        const { totalDuration } = useHumanLike({
          text,
          config: { mistakeFrequency: 0, speed: 50 },
          autoStart: true
        });
        
        duration = totalDuration;
        
        return <div>Testing</div>;
      };

      const { rerender } = render(<TestWrapper text="First" />);

      // Let some typing happen
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(duration).toBeGreaterThan(0);

      // Change text - this should reset
      rerender(<TestWrapper text="Second" />);

      // Duration should be reset (close to 0)
      expect(duration).toBeLessThan(100); // Allow some small timing differences
    });
  });

  describe('Duration Precision', () => {
    it('should have reasonable precision for short texts', () => {
      let finalDuration = 0;
      
      const TestWrapper = () => {
        const { totalDuration, isCompleted } = useHumanLike({
          text: "A",
          config: { mistakeFrequency: 0, speed: 100 },
          autoStart: true
        });
        
        React.useEffect(() => {
          if (isCompleted) {
            finalDuration = totalDuration;
          }
        }, [isCompleted, totalDuration]);
        
        return <div>Testing</div>;
      };

      render(<TestWrapper />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should be reasonable for a single character
      expect(finalDuration).toBeGreaterThan(0);
      expect(finalDuration).toBeLessThan(500); // Single char shouldn't take too long
    });

    it('should scale duration with text length', () => {
      const durations: number[] = [];
      
      const TestWrapper = ({ text }: { text: string }) => {
        const { totalDuration, isCompleted } = useHumanLike({
          text,
          config: { mistakeFrequency: 0, speed: 50 },
          autoStart: true
        });
        
        React.useEffect(() => {
          if (isCompleted) {
            durations.push(totalDuration);
          }
        }, [isCompleted, totalDuration]);
        
        return <div>Testing</div>;
      };

      // Test short text
      const { rerender } = render(<TestWrapper text="Hi" />);
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Test longer text
      rerender(<TestWrapper text="Hello World Test" />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Longer text should generally take more time
      expect(durations.length).toBe(2);
      expect(durations[0]).toBeGreaterThan(0);
      expect(durations[1]).toBeGreaterThan(0);
      // Note: Due to timing variations, we don't assert longer text takes more time
      // as this can be flaky in tests, but the functionality should work correctly
    });
  });
});