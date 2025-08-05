/**
 * Integration tests for the entire human-like library
 * Tests how all components work together in real scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React, { useState, useRef, useEffect } from 'react';
import { HumanLike } from '../components/HumanLike';
import { useHumanLike } from '../hooks/useHumanLike';
import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig, MistakeInfo, TypingState } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Integration Tests', () => {
  describe('Component and Hook Integration', () => {
    it('should work together seamlessly', () => {
      const TestComponent = () => {
        const [text, setText] = useState('Hello World');
        const [completed, setCompleted] = useState(false);
        
        return (
          <div>
            <HumanLike
              text={text}
              config={{ mistakeFrequency: 0, speed: 5 }}
              onComplete={() => setCompleted(true)}
            />
            <button onClick={() => { setText('This is a longer new text that takes more time to type'); setCompleted(false); }}>
              Change Text
            </button>
            <div data-testid="status">
              {completed ? 'Completed' : 'Typing'}
            </div>
          </div>
        );
      };
      
      const { container, getByTestId, getByText } = render(<TestComponent />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(getByTestId('status')).toHaveTextContent('Completed');
      
      // Change text
      fireEvent.click(getByText('Change Text'));
      
      expect(getByTestId('status')).toHaveTextContent('Typing');
    });

    it('should handle multiple instances independently', () => {
      const MultipleInstances = () => {
        const [events, setEvents] = useState<string[]>([]);
        
        const addEvent = (event: string) => {
          setEvents(prev => [...prev, event]);
        };
        
        return (
          <div>
            <HumanLike
              text="First"
              id="first"
              config={{ mistakeFrequency: 0 }}
              onComplete={(id) => addEvent(`${id}-complete`)}
            />
            <HumanLike
              text="Second"
              id="second"
              config={{ mistakeFrequency: 0 }}
              onComplete={(id) => addEvent(`${id}-complete`)}
            />
            <div data-testid="events">
              {events.join(',')}
            </div>
          </div>
        );
      };
      
      const { getByTestId } = render(<MultipleInstances />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const events = getByTestId('events').textContent;
      expect(events).toContain('first-complete');
      expect(events).toContain('second-complete');
    });
  });

  describe('Custom Hook Integration', () => {
    it('should work with custom components', () => {
      const CustomTypewriter = () => {
        const {
          displayText,
          isTyping,
          isCompleted,
          progress,
          start,
          pause,
          resume,
          reset,
          skip
        } = useHumanLike({
          text: 'Custom hook test',
          config: { mistakeFrequency: 0 },
          autoStart: false
        });
        
        return (
          <div>
            <div data-testid="display">{displayText}</div>
            <div data-testid="progress">{Math.round(progress)}%</div>
            <div data-testid="status">
              {isCompleted ? 'done' : isTyping ? 'typing' : 'idle'}
            </div>
            <button onClick={start} data-testid="start">Start</button>
            <button onClick={pause} data-testid="pause">Pause</button>
            <button onClick={resume} data-testid="resume">Resume</button>
            <button onClick={reset} data-testid="reset">Reset</button>
            <button onClick={skip} data-testid="skip">Skip</button>
          </div>
        );
      };
      
      const { getByTestId } = render(<CustomTypewriter />);
      
      expect(getByTestId('status')).toHaveTextContent('idle');
      expect(getByTestId('progress')).toHaveTextContent('0%');
      
      fireEvent.click(getByTestId('start'));
      act(() => {
        vi.advanceTimersByTime(300); // Increased to ensure at least one character is typed
      });
      
      expect(getByTestId('status')).toHaveTextContent('typing');
      expect(parseInt(getByTestId('progress').textContent!)).toBeGreaterThan(0);
      
      fireEvent.click(getByTestId('pause'));
      expect(getByTestId('status')).toHaveTextContent('idle');
      
      fireEvent.click(getByTestId('resume'));
      expect(getByTestId('status')).toHaveTextContent('typing');
      
      fireEvent.click(getByTestId('skip'));
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      expect(getByTestId('status')).toHaveTextContent('done');
      expect(getByTestId('progress')).toHaveTextContent('100%');
      expect(getByTestId('display')).toHaveTextContent('Custom hook test');
    });

    it('should handle complex state interactions', () => {
      const ComplexComponent = () => {
        const [config, setConfig] = useState<Partial<HumanLikeConfig>>({
          mistakeFrequency: 0,
          speed: 100
        });
        
        const [text, setText] = useState('Initial text');
        const [stats, setStats] = useState<string[]>([]);
        
        const {
          displayText,
          currentWPM,
          mistakeCount,
          progress,
          currentState
        } = useHumanLike({
          text,
          config,
          autoStart: true, // Enable auto-start for this test
          onChar: (char, index) => {
            setStats(prev => [...prev, `char:${char}@${index}`]);
          },
          onComplete: () => {
            setStats(prev => [...prev, 'complete']);
          }
        });
        
        return (
          <div>
            <div data-testid="display">{displayText}</div>
            <div data-testid="state">{currentState}</div>
            <div data-testid="progress">{Math.round(progress)}</div>
            <div data-testid="wpm">{currentWPM}</div>
            <div data-testid="mistakes">{mistakeCount}</div>
            <div data-testid="stats">{stats.length}</div>
            
            <button 
              onClick={() => setConfig(prev => ({ ...prev, speed: 50 }))}
              data-testid="speed-up"
            >
              Speed Up
            </button>
            
            <button 
              onClick={() => setText('Changed text')}
              data-testid="change-text"
            >
              Change Text
            </button>
          </div>
        );
      };
      
      const { getByTestId } = render(<ComplexComponent />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(getByTestId('progress')).toHaveTextContent('100');
      expect(getByTestId('state')).toHaveTextContent('completed');
      expect(parseInt(getByTestId('stats').textContent!)).toBeGreaterThan(0);
      
      // Change configuration
      fireEvent.click(getByTestId('speed-up'));
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      // Change text
      fireEvent.click(getByTestId('change-text'));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(getByTestId('display')).toHaveTextContent('Changed text');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle a chat application scenario', () => {
      const ChatApp = () => {
        const [messages, setMessages] = useState<Array<{id: number, text: string, completed: boolean}>>([]);
        const [nextId, setNextId] = useState(1);
        
        const addMessage = (text: string) => {
          setMessages(prev => [...prev, { id: nextId, text, completed: false }]);
          setNextId(prev => prev + 1);
        };
        
        const markCompleted = (id: number) => {
          setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, completed: true } : msg
          ));
        };
        
        return (
          <div>
            <button 
              onClick={() => addMessage('Hello there!')}
              data-testid="add-message"
            >
              Add Message
            </button>
            
            <div data-testid="messages">
              {messages.map(message => (
                <div key={message.id} data-testid={`message-${message.id}`}>
                  <HumanLike
                    text={message.text}
                    id={`msg-${message.id}`}
                    config={{ mistakeFrequency: 0.02 }}
                    onComplete={(id) => markCompleted(message.id)}
                  />
                  <span data-testid={`status-${message.id}`}>
                    {message.completed ? ' ✓' : ' ...'}
                  </span>
                </div>
              ))}
            </div>
            
            <div data-testid="count">{messages.length}</div>
          </div>
        );
      };
      
      const { getByTestId } = render(<ChatApp />);
      
      fireEvent.click(getByTestId('add-message'));
      expect(getByTestId('count')).toHaveTextContent('1');
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(getByTestId('status-1')).toHaveTextContent('✓');
      
      fireEvent.click(getByTestId('add-message'));
      expect(getByTestId('count')).toHaveTextContent('2');
    });

    it('should handle a code editor scenario', () => {
      const CodeEditor = () => {
        const [code] = useState('const hello = "world";');
        const [lineNumbers, setLineNumbers] = useState<number[]>([]);
        
        const {
          displayText,
          progress,
          currentState,
          start,
          stop,
          reset
        } = useHumanLike({
          text: code,
          config: { 
            mistakeFrequency: 0.05,
            debug: false
          },
          autoStart: false,
          onChar: (char, index) => {
            if (char === '\n') {
              setLineNumbers(prev => [...prev, index]);
            }
          }
        });
        
        return (
          <div style={{ fontFamily: 'monospace' }}>
            <div data-testid="editor">
              <pre>{displayText}</pre>
            </div>
            
            <div data-testid="info">
              Progress: {Math.round(progress)}% | State: {currentState}
            </div>
            
            <div>
              <button onClick={start} data-testid="run">Run Code</button>
              <button onClick={stop} data-testid="stop">Stop</button>
              <button onClick={reset} data-testid="clear">Clear</button>
            </div>
          </div>
        );
      };
      
      const { getByTestId } = render(<CodeEditor />);
      
      fireEvent.click(getByTestId('run'));
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      
      expect(getByTestId('editor').textContent).toContain('const hello');
      expect(getByTestId('info')).toHaveTextContent('100%');
      
      fireEvent.click(getByTestId('clear'));
      expect(getByTestId('editor').textContent).toBe('');
    });

    it('should handle a typewriter game scenario', () => {
      const TypewriterGame = () => {
        const [currentText, setCurrentText] = useState('');
        const [score, setScore] = useState(0);
        const [gameActive, setGameActive] = useState(false);
        const [wpm, setWPM] = useState(0);
        
        const texts = [
          'The quick brown fox jumps over the lazy dog.',
          'Pack my box with five dozen liquor jugs.',
          'How vexingly quick daft zebras jump!'
        ];
        
        const startGame = () => {
          const randomText = texts[Math.floor(Math.random() * texts.length)];
          setCurrentText(randomText);
          setGameActive(true);
          setScore(0);
          // Start typing after setting the text - need to use setTimeout to ensure text is set
          setTimeout(() => start(), 0);
        };
        
        const {
          displayText,
          progress,
          currentWPM,
          mistakeCount,
          isCompleted,
          start
        } = useHumanLike({
          text: currentText,
          config: { 
            mistakeFrequency: 0.08,
            debug: false
          },
          onComplete: () => {
            setScore(prev => prev + Math.max(0, 100 - mistakeCount * 5));
            setGameActive(false);
          },
          onChar: () => {
            setWPM(currentWPM);
          }
        });
        
        return (
          <div>
            <div data-testid="game-status">
              {gameActive ? 'Playing' : 'Ready'}
            </div>
            
            <div data-testid="display" style={{ fontFamily: 'monospace', minHeight: '50px' }}>
              {displayText}
            </div>
            
            <div data-testid="stats">
              Progress: {Math.round(progress)}% | 
              WPM: {wpm} | 
              Mistakes: {mistakeCount} | 
              Score: {score}
            </div>
            
            <button 
              onClick={startGame} 
              disabled={gameActive}
              data-testid="start-game"
            >
              {gameActive ? 'Game Running' : 'Start Game'}
            </button>
          </div>
        );
      };
      
      const { getByTestId } = render(<TypewriterGame />);
      
      expect(getByTestId('game-status')).toHaveTextContent('Ready');
      
      fireEvent.click(getByTestId('start-game'));
      expect(getByTestId('game-status')).toHaveTextContent('Playing');
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      expect(getByTestId('game-status')).toHaveTextContent('Ready');
      expect(getByTestId('stats')).toHaveTextContent('100%');
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple concurrent instances', () => {
      const MultipleTypewriters = () => {
        const instances = Array.from({ length: 5 }, (_, i) => ({
          id: i,
          text: `Text for instance ${i + 1}`,
          completed: false
        }));
        
        const [completedCount, setCompletedCount] = useState(0);
        
        return (
          <div>
            {instances.map(instance => (
              <HumanLike
                key={instance.id}
                text={instance.text}
                id={`instance-${instance.id}`}
                config={{ mistakeFrequency: 0 }}
                onComplete={() => setCompletedCount(prev => prev + 1)}
              />
            ))}
            <div data-testid="completed-count">{completedCount}</div>
          </div>
        );
      };
      
      const { getByTestId } = render(<MultipleTypewriters />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      expect(getByTestId('completed-count')).toHaveTextContent('5');
    });

    it('should handle rapid component mounting/unmounting', () => {
      const DynamicTypewriters = () => {
        const [showTypewriter, setShowTypewriter] = useState(true);
        const [mountCount, setMountCount] = useState(0);
        
        const toggleTypewriter = () => {
          setShowTypewriter(prev => !prev);
          setMountCount(prev => prev + 1);
        };
        
        return (
          <div>
            {showTypewriter && (
              <HumanLike
                text="Dynamic typewriter"
                config={{ mistakeFrequency: 0 }}
              />
            )}
            
            <button onClick={toggleTypewriter} data-testid="toggle">
              Toggle
            </button>
            
            <div data-testid="mount-count">{mountCount}</div>
          </div>
        );
      };
      
      const { getByTestId } = render(<DynamicTypewriters />);
      
      // Rapidly mount/unmount
      for (let i = 0; i < 10; i++) {
        fireEvent.click(getByTestId('toggle'));
        act(() => {
          vi.advanceTimersByTime(50);
        });
      }
      
      expect(getByTestId('mount-count')).toHaveTextContent('10');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully in complex scenarios', () => {
      const ErrorProneComponent = () => {
        const [hasError, setHasError] = useState(false);
        
        const errorCallback = () => {
          setHasError(true);
          throw new Error('Intentional error');
        };
        
        const safeCallback = () => {
          setHasError(false);
        };
        
        return (
          <div>
            <HumanLike
              text="Error test"
              config={{ mistakeFrequency: 0 }}
              onStart={hasError ? errorCallback : safeCallback}
              onComplete={safeCallback}
            />
            
            <button 
              onClick={() => setHasError(!hasError)}
              data-testid="toggle-error"
            >
              Toggle Error
            </button>
            
            <div data-testid="error-status">
              {hasError ? 'Error Mode' : 'Safe Mode'}
            </div>
          </div>
        );
      };
      
      const { getByTestId } = render(<ErrorProneComponent />);
      
      expect(getByTestId('error-status')).toHaveTextContent('Safe Mode');
      
      fireEvent.click(getByTestId('toggle-error'));
      expect(getByTestId('error-status')).toHaveTextContent('Error Mode');
      
      // Component should still render despite callback errors
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(getByTestId('error-status')).toBeInTheDocument();
    });
  });

  describe('Memory Management Integration', () => {
    it('should properly clean up resources', () => {
      const CleanupTest = () => {
        const [instances, setInstances] = useState<number[]>([]);
        
        const addInstance = () => {
          setInstances(prev => [...prev, prev.length]);
        };
        
        const removeInstance = () => {
          setInstances(prev => prev.slice(0, -1));
        };
        
        return (
          <div>
            {instances.map(id => (
              <HumanLike
                key={id}
                text={`Instance ${id}`}
                config={{ mistakeFrequency: 0 }}
              />
            ))}
            
            <button onClick={addInstance} data-testid="add">Add</button>
            <button onClick={removeInstance} data-testid="remove">Remove</button>
            <div data-testid="count">{instances.length}</div>
          </div>
        );
      };
      
      const { getByTestId } = render(<CleanupTest />);
      
      // Add multiple instances
      for (let i = 0; i < 5; i++) {
        fireEvent.click(getByTestId('add'));
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }
      
      expect(getByTestId('count')).toHaveTextContent('5');
      
      // Remove all instances
      for (let i = 0; i < 5; i++) {
        fireEvent.click(getByTestId('remove'));
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }
      
      expect(getByTestId('count')).toHaveTextContent('0');
    });
  });
});