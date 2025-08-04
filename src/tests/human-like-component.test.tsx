/**
 * Comprehensive tests for HumanLike component
 * Tests component rendering, props, and integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { HumanLike } from '../components/HumanLike';

// Helper function to get the typewriter element
const getTypewriterElement = (container: HTMLElement) => {
  return container.querySelector('.human-like-typewriter') as HTMLElement;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('HumanLike Component', () => {
  describe('Basic Rendering', () => {
    it('should render with minimum required props', () => {
      const { container } = render(<HumanLike text="Hello World" />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('human-like-typewriter');
    });

    it('should render with custom className', () => {
      const { container } = render(<HumanLike text="Test" className="custom-class" />);
      const element = getTypewriterElement(container);
      
      expect(element).toHaveClass('human-like-typewriter');
      expect(element).toHaveClass('custom-class');
    });

    it('should render with custom styles', () => {
      const style = { fontSize: '24px', color: 'red' };
      const { container } = render(<HumanLike text="Test" style={style} />);
      const element = getTypewriterElement(container);
      
      expect(element).toHaveStyle('font-size: 24px');
      expect(element).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('should render with data-id attribute when id prop is provided', () => {
      const { container } = render(<HumanLike text="Test" id="test-typewriter" />);
      const element = getTypewriterElement(container);
      
      expect(element).toHaveAttribute('data-id', 'test-typewriter');
    });

    it('should not have data-id attribute when id prop is not provided', () => {
      const { container } = render(<HumanLike text="Test" />);
      const element = getTypewriterElement(container);
      
      expect(element).not.toHaveAttribute('data-id');
    });
  });

  describe('Cursor Display', () => {
    it('should show cursor by default', () => {
      const { container } = render(<HumanLike text="Test" />);
      const element = getTypewriterElement(container);
      const cursor = element.querySelector('.human-like-cursor');
      
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveTextContent('|');
    });

    it('should hide cursor when showCursor is false', () => {
      const { container } = render(<HumanLike text="Test" showCursor={false} />);
      const element = getTypewriterElement(container);
      const cursor = element.querySelector('.human-like-cursor');
      
      expect(cursor).not.toBeInTheDocument();
    });

    it('should use custom cursor character', () => {
      const { container } = render(<HumanLike text="Test" cursorChar="_" />);
      const element = getTypewriterElement(container);
      const cursor = element.querySelector('.human-like-cursor');
      
      expect(cursor).toHaveTextContent('_');
    });

    it('should handle empty cursor character', () => {
      const { container } = render(<HumanLike text="Test" cursorChar="" />);
      const element = getTypewriterElement(container);
      const cursor = element.querySelector('.human-like-cursor');
      
      expect(cursor).toHaveTextContent('|'); // Should fallback to default
    });

    it('should apply cursor blink speed', () => {
      const { container } = render(<HumanLike text="Test" cursorBlinkSpeed={1000} />);
      const element = getTypewriterElement(container);
      const cursor = element.querySelector('.human-like-cursor');
      
      expect(cursor).toBeInTheDocument();
      // Cursor blinking is handled by CSS animation
      expect(cursor).toHaveStyle('animation: human-like-cursor-blink 1000ms infinite');
    });
  });

  describe('Auto Start Behavior', () => {
    it('should start automatically by default', () => {
      const { container } = render(<HumanLike text="Hi" config={{ mistakeFrequency: 0 }} />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('H');
    });

    it('should not start automatically when autoStart is false', () => {
      const { container } = render(<HumanLike text="Hello" autoStart={false} />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).not.toContain('H'); // Should only have cursor
    });
  });

  describe('Configuration Props', () => {
    it('should accept speed prop', () => {
      const { container } = render(<HumanLike text="Fast" speed={5} config={{ mistakeFrequency: 0 }} />);
      
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent?.length).toBeGreaterThan(1); // Should type faster
    });

    it('should accept mistakeFrequency prop', () => {
      const { container } = render(<HumanLike text="Test" mistakeFrequency={0} />);
      
      vi.advanceTimersByTime(3000);
      
      const element = getTypewriterElement(container);
      // With 0 mistake frequency, should type cleanly
      expect(element).toBeInTheDocument();
    });

    it('should accept config object', () => {
      const config = {
        speed: 100,
        mistakeFrequency: 0,
        debug: false
      };
      
      const { container } = render(<HumanLike text="Config test" config={{ ...config, speed: 5 }} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('Config');
    });
  });

  describe('Event Callbacks', () => {
    it('should call onStart callback', () => {
      const onStart = vi.fn();
      
      render(<HumanLike text="Hello" onStart={onStart} />);
      
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      expect(onStart).toHaveBeenCalledWith(undefined);
    });

    it('should call onStart callback with id', () => {
      const onStart = vi.fn();
      
      render(<HumanLike text="Hello" id="test-id" onStart={onStart} />);
      
      vi.advanceTimersByTime(100);
      
      expect(onStart).toHaveBeenCalledWith('test-id');
    });

    it('should call onComplete callback', () => {
      const onComplete = vi.fn();
      
      render(<HumanLike text="Hi" onComplete={onComplete} config={{ mistakeFrequency: 0 }} />);
      
      vi.advanceTimersByTime(3000);
      
      expect(onComplete).toHaveBeenCalledWith(undefined);
    });

    it('should call onChar callback', () => {
      const onChar = vi.fn();
      
      render(<HumanLike text="AB" onChar={onChar} config={{ mistakeFrequency: 0 }} />);
      
      vi.advanceTimersByTime(2000);
      
      expect(onChar).toHaveBeenCalled();
      expect(onChar.mock.calls[0]).toEqual(['A', 0, undefined]);
    });

    it('should call onChar callback with id', () => {
      const onChar = vi.fn();
      
      render(<HumanLike text="A" id="char-test" onChar={onChar} config={{ mistakeFrequency: 0 }} />);
      
      vi.advanceTimersByTime(1000);
      
      expect(onChar).toHaveBeenCalledWith('A', 0, 'char-test');
    });

    it('should call onMistake callback', () => {
      const onMistake = vi.fn();
      
      render(<HumanLike 
        text="Hello" 
        onMistake={onMistake} 
        config={{ mistakeFrequency: 1.0, debug: false }} 
      />);
      
      vi.advanceTimersByTime(5000);
      
      expect(onMistake).toHaveBeenCalled();
      const mistakeCall = onMistake.mock.calls[0];
      expect(mistakeCall[0]).toHaveProperty('type');
      expect(mistakeCall[0]).toHaveProperty('originalChar');
      expect(mistakeCall[0]).toHaveProperty('mistakeChar');
      expect(mistakeCall[1]).toBeUndefined(); // id parameter
    });

    it('should call onBackspace callback', () => {
      const onBackspace = vi.fn();
      
      render(<HumanLike 
        text="Hi" 
        onBackspace={onBackspace} 
        config={{ mistakeFrequency: 1.0, debug: false }} 
      />);
      
      vi.advanceTimersByTime(10000);
      
      expect(onBackspace).toHaveBeenCalled();
      expect(onBackspace).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Text Updates', () => {
    it('should update when text prop changes', () => {
      const { container, rerender } = render(<HumanLike text="Original" config={{ mistakeFrequency: 0, speed: 5 }} />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('O');
      
      rerender(<HumanLike text="New text" config={{ mistakeFrequency: 0, speed: 5 }} />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(element.textContent).toContain('N');
    });

    it('should handle empty text', () => {
      const { container } = render(<HumanLike text="" />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      const { container } = render(<HumanLike text={longText} />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle special characters', () => {
      const { container } = render(<HumanLike text="Hello, World!" config={{ mistakeFrequency: 0, speed: 10 }} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('Hello');
    });

    it('should handle numbers and symbols', () => {
      const { container } = render(<HumanLike text="Price: $19.99" config={{ mistakeFrequency: 0, speed: 10 }} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('Price');
    });

    it('should handle unicode characters', () => {
      const { container } = render(<HumanLike text="Hello 世界 🌍" config={{ mistakeFrequency: 0, speed: 10 }} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('Hello');
    });

    it('should handle multiline text', () => {
      const { container } = render(<HumanLike text="Line 1\nLine 2" config={{ mistakeFrequency: 0, speed: 10 }} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const element = getTypewriterElement(container);
      expect(element.textContent).toContain('Line');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      const { container } = render(<HumanLike text="Accessible text" />);
      const element = getTypewriterElement(container);
      
      expect(element).toHaveClass('human-like-typewriter');
      
      const cursor = element.querySelector('.human-like-cursor');
      expect(cursor).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard accessible', () => {
      const { container } = render(<HumanLike text="Keyboard test" />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
      
      // Component should not interfere with keyboard navigation
      fireEvent.keyDown(element, { key: 'Tab' });
      expect(element).toBeInTheDocument();
    });

    it('should handle focus states', () => {
      const { container } = render(<HumanLike text="Focus test" />);
      const element = getTypewriterElement(container);
      
      fireEvent.focus(element);
      expect(element).toBe(document.activeElement);
      
      fireEvent.blur(element);
      expect(element).not.toBe(document.activeElement);
    });
  });

  describe('Performance', () => {
    it('should handle rapid re-renders', () => {
      const { container, rerender } = render(<HumanLike text="Performance test" />);
      
      // Rapid re-renders should not crash
      for (let i = 0; i < 10; i++) {
        rerender(<HumanLike text={`Performance test ${i}`} />);
        vi.advanceTimersByTime(10);
      }
      
      const element = getTypewriterElement(container);
      expect(element).toBeInTheDocument();
    });

    it('should handle prop changes during typing', () => {
      const { container, rerender } = render(
        <HumanLike text="Original" config={{ mistakeFrequency: 0 }} />
      );
      
      vi.advanceTimersByTime(500);
      
      // Change props during typing
      rerender(
        <HumanLike text="Original" cursorChar="_" config={{ mistakeFrequency: 0 }} />
      );
      
      vi.advanceTimersByTime(500);
      
      const element = getTypewriterElement(container);
      expect(element).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined text gracefully', () => {
      // TypeScript would prevent this, but testing runtime behavior
      const { container } = render(<HumanLike text={undefined as any} />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
    });

    it('should handle invalid config values', () => {
      const invalidConfig = {
        speed: -100,
        mistakeFrequency: 2.0, // Invalid (should be 0-1)
        debug: 'invalid' as any
      };
      
      const { container } = render(<HumanLike text="Error test" config={invalidConfig} />);
      const element = getTypewriterElement(container);
      
      expect(element).toBeInTheDocument();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = () => {
        throw new Error('Callback error');
      };
      
      // Should not crash the component
      expect(() => {
        render(<HumanLike text="Hi" onStart={errorCallback} />);
        vi.advanceTimersByTime(100);
      }).not.toThrow();
    });
  });

  describe('Integration with External Systems', () => {
    it('should work with React.StrictMode', () => {
      const { container } = render(
        <React.StrictMode>
          <HumanLike text="Strict mode test" />
        </React.StrictMode>
      );
      
      const element = getTypewriterElement(container);
      expect(element).toBeInTheDocument();
    });

    it('should work within other components', () => {
      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="wrapper">
          <h1>Test Page</h1>
          {children}
          <p>Footer</p>
        </div>
      );
      
      const { container, getByTestId } = render(
        <TestWrapper>
          <HumanLike text="Nested component" />
        </TestWrapper>
      );
      
      expect(getByTestId('wrapper')).toBeInTheDocument();
      expect(getTypewriterElement(container)).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('should set data attributes for state tracking', () => {
      const { container } = render(<HumanLike text="State test" config={{ mistakeFrequency: 0 }} />);
      const element = getTypewriterElement(container);
      
      expect(element).toHaveAttribute('data-typing');
      expect(element).toHaveAttribute('data-completed');
      expect(element).toHaveAttribute('data-state');
      
      vi.advanceTimersByTime(100);
      
      expect(element).toHaveAttribute('data-typing', 'true');
      expect(element).toHaveAttribute('data-completed', 'false');
      expect(element).toHaveAttribute('data-state', 'typing');
    });

    it('should update data attributes when state changes', () => {
      const { container } = render(<HumanLike text="Hi" config={{ mistakeFrequency: 0, speed: 1 }} />);
      const element = getTypewriterElement(container);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(element).toHaveAttribute('data-typing', 'false');
      expect(element).toHaveAttribute('data-completed', 'true');
      expect(element).toHaveAttribute('data-state', 'completed');
    });
  });
});