import React from 'react';
import { useHumanLike } from '../src/hooks/useHumanLike';

/**
 * Example demonstrating totalDuration functionality
 * Shows how to track the total time taken for typing effects
 */
export const TotalDurationExample: React.FC = () => {
  const {
    displayText,
    totalDuration,
    isCompleted,
    currentWPM,
    start,
    reset
  } = useHumanLike({
    text: "This is a demonstration of totalDuration tracking. Watch how the duration increases as I type this message!",
    config: {
      speed: 80,
      mistakeFrequency: 0.05,
      debug: false
    },
    autoStart: false
  });

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatWPM = (wpm: number): string => {
    return wpm > 0 ? `${wpm} WPM` : 'Calculating...';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Total Duration Tracking Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={start} style={{ marginRight: '10px' }}>
          Start Typing
        </button>
        <button onClick={reset}>
          Reset
        </button>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '15px', 
        minHeight: '100px',
        backgroundColor: '#f9f9f9',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
          {displayText}
          <span style={{ 
            opacity: 0.7, 
            animation: 'blink 1s infinite' 
          }}>|</span>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '10px',
        fontSize: '14px'
      }}>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Total Duration:</strong><br />
          <span style={{ fontSize: '18px', color: '#2196F3' }}>
            {formatDuration(totalDuration)}
          </span>
        </div>
        
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Current WPM:</strong><br />
          <span style={{ fontSize: '18px', color: '#4CAF50' }}>
            {formatWPM(currentWPM)}
          </span>
        </div>
        
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Status:</strong><br />
          <span style={{ 
            fontSize: '18px', 
            color: isCompleted ? '#FF9800' : '#9C27B0' 
          }}>
            {isCompleted ? 'Completed!' : 'Typing...'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>
          <strong>How it works:</strong> The totalDuration tracks the actual time spent typing, 
          excluding any paused time. It includes all delays, thinking pauses, mistake corrections, 
          and realistic typing variations.
        </p>
        <p>
          <strong>Use cases:</strong> Performance analytics, typing speed measurement, 
          animation synchronization, user experience metrics, and accessibility timing adjustments.
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TotalDurationExample;