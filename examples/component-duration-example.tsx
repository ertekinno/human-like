import React, { useState } from 'react';
import { HumanLike } from '../src/components/HumanLike';

/**
 * Example showing totalDuration usage with HumanLike component
 * Demonstrates callback-based duration tracking
 */
export const ComponentDurationExample: React.FC = () => {
  const [totalDuration, setTotalDuration] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0); // For resetting the component

  const sampleTexts = [
    "Hello, this is a short message.",
    "This is a longer message that will take more time to type, including some punctuation and variety!",
    "Speed test: The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "Complex example with numbers (123), symbols (@#$%), and various punctuation marks... Amazing!"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const handleStart = () => {
    setIsTyping(true);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    setIsTyping(false);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setTotalDuration(0);
    setIsTyping(false);
    setIsCompleted(false);
    setKey(prev => prev + 1); // Force component re-render
  };

  const handleNextText = () => {
    setCurrentTextIndex((prev) => (prev + 1) % sampleTexts.length);
    handleReset();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Component Duration Tracking Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleReset}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button 
          onClick={handleNextText}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next Text ({currentTextIndex + 1}/{sampleTexts.length})
        </button>
      </div>

      <div style={{ 
        border: '2px solid #ddd', 
        borderRadius: '8px',
        padding: '20px', 
        minHeight: '120px',
        backgroundColor: '#f9f9f9',
        marginBottom: '20px',
        fontSize: '18px',
        lineHeight: '1.6'
      }}>
        <HumanLike
          key={key}
          text={sampleTexts[currentTextIndex]}
          speed={60}
          mistakeFrequency={0.03}
          showCursor={true}
          cursorChar="|"
          cursorBlinkSpeed={530}
          autoStart={true}
          onStart={handleStart}
          onComplete={handleComplete}
          style={{ fontSize: 'inherit' }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px'
      }}>
        <div style={{ 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Total Duration
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {formatDuration(totalDuration)}
          </div>
        </div>
        
        <div style={{ 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Status
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: isCompleted ? '#4CAF50' : isTyping ? '#FF9800' : '#666'
          }}>
            {isCompleted ? '✓ Completed' : isTyping ? '⌛ Typing...' : '⏸ Idle'}
          </div>
        </div>
        
        <div style={{ 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Text Length
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9C27B0' }}>
            {sampleTexts[currentTextIndex].length} chars
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>💡 Implementation Notes:</h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>
            <strong>Real-time tracking:</strong> The duration updates continuously during typing
          </li>
          <li>
            <strong>Pause handling:</strong> Paused time is excluded from total duration
          </li>
          <li>
            <strong>Accurate timing:</strong> Includes all delays, mistakes, corrections, and thinking pauses
          </li>
          <li>
            <strong>Performance friendly:</strong> Minimal overhead, optimized for production use
          </li>
        </ul>
        
        <h4>📊 Use Cases:</h4>
        <ul style={{ margin: '10px 0 0', paddingLeft: '20px' }}>
          <li>Performance analytics and user experience metrics</li>
          <li>Typing speed calculations and WPM measurements</li>
          <li>Animation timing synchronization</li>
          <li>Accessibility and timing adjustments</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentDurationExample;