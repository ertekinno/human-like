import React, { useState } from 'react';
import type { KeyInfo } from '../types';

interface KeyPressEvent {
  keyInfo: KeyInfo;
  timestamp: number;
  id: string;
}

interface KeyPressIndicatorProps {
  keyboardMode?: 'light' | 'dark';
  maxHistory?: number;
}

export const KeyPressIndicator: React.FC<KeyPressIndicatorProps> = ({
  keyboardMode = 'light',
  maxHistory = 10
}) => {
  const [keyHistory, setKeyHistory] = useState<KeyPressEvent[]>([]);

  // This will be used by the parent component to add key presses
  const addKeyPress = (keyInfo: KeyInfo) => {
    const newEvent: KeyPressEvent = {
      keyInfo,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(7)
    };

    setKeyHistory(prev => {
      const updated = [newEvent, ...prev].slice(0, maxHistory);
      return updated;
    });
  };

  // Expose the addKeyPress method to parent components
  React.useImperativeHandle(React.createRef(), () => ({
    addKeyPress
  }));

  const getKeyTypeColor = (type: string) => {
    const colors = {
      letter: keyboardMode === 'dark' ? '#4CAF50' : '#34C759',
      number: keyboardMode === 'dark' ? '#FF9800' : '#FF9F0A',
      symbol: keyboardMode === 'dark' ? '#E91E63' : '#FF2D92',
      modifier: keyboardMode === 'dark' ? '#2196F3' : '#007AFF',
      'view-switch': keyboardMode === 'dark' ? '#9C27B0' : '#AF52DE',
      space: keyboardMode === 'dark' ? '#607D8B' : '#8E8E93',
      enter: keyboardMode === 'dark' ? '#607D8B' : '#8E8E93',
      backspace: keyboardMode === 'dark' ? '#FF5722' : '#FF3B30'
    };
    return colors[type as keyof typeof colors] || (keyboardMode === 'dark' ? '#666' : '#999');
  };

  const containerStyle = {
    backgroundColor: keyboardMode === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    padding: '20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    boxShadow: keyboardMode === 'dark' 
      ? '0 4px 16px rgba(0,0,0,0.6)' 
      : '0 4px 16px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    color: keyboardMode === 'dark' ? '#ffffff' : '#000000',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    textAlign: 'center' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };

  const keyEventStyle = (keyInfo: KeyInfo, age: number) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    marginBottom: '6px',
    backgroundColor: keyboardMode === 'dark' ? '#2c2c2e' : '#ffffff',
    borderRadius: '8px',
    border: `2px solid ${getKeyTypeColor(keyInfo.type)}`,
    opacity: Math.max(0.3, 1 - (age * 0.1)),
    transform: `scale(${Math.max(0.9, 1 - (age * 0.02))})`,
    transition: 'all 0.3s ease',
    boxShadow: keyboardMode === 'dark' 
      ? '0 1px 3px rgba(0,0,0,0.3)' 
      : '0 1px 3px rgba(0,0,0,0.1)'
  });

  const keyNameStyle = {
    fontWeight: '600',
    fontSize: '14px',
    color: keyboardMode === 'dark' ? '#ffffff' : '#000000',
    fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
  };

  const keyDetailsStyle = {
    fontSize: '12px',
    color: keyboardMode === 'dark' ? '#999999' : '#666666',
    textAlign: 'right' as const
  };

  const typeTagStyle = (type: string) => ({
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: getKeyTypeColor(type),
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    marginRight: '6px'
  });

  const formatKeyName = (key: string, type: string) => {
    if (type === 'view-switch') {
      return key.toUpperCase();
    }
    if (key === 'space') return 'SPACE';
    if (key === 'enter' || key === 'return') return 'ENTER';
    if (key === 'shift') return 'SHIFT';
    if (key === 'caps lock' || key === 'CAPS') return 'CAPS LOCK';
    if (key === 'backspace' || key === '⌫') return 'BACKSPACE';
    return key.toUpperCase();
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        🎹 Real-time Key Presses
      </div>
      
      {keyHistory.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: keyboardMode === 'dark' ? '#666666' : '#999999',
          fontSize: '14px',
          fontStyle: 'italic',
          padding: '20px'
        }}>
          Start typing to see key presses...
        </div>
      ) : (
        keyHistory.map((event, index) => (
          <div key={event.id} style={keyEventStyle(event.keyInfo, index)}>
            <div>
              <span style={typeTagStyle(event.keyInfo.type)}>
                {event.keyInfo.type}
              </span>
              <span style={keyNameStyle}>
                {formatKeyName(event.keyInfo.key, event.keyInfo.type)}
              </span>
            </div>
            <div style={keyDetailsStyle}>
              <div>{event.keyInfo.duration}ms</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {event.keyInfo.sequenceIndex + 1}/{event.keyInfo.sequenceLength}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Create a version that can be controlled externally
export const useKeyPressIndicator = () => {
  const [keyHistory, setKeyHistory] = useState<KeyPressEvent[]>([]);

  const addKeyPress = (keyInfo: KeyInfo) => {
    const newEvent: KeyPressEvent = {
      keyInfo,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(7)
    };

    setKeyHistory(prev => [newEvent, ...prev].slice(0, 10));
  };

  const clearHistory = () => setKeyHistory([]);

  return { keyHistory, addKeyPress, clearHistory };
};