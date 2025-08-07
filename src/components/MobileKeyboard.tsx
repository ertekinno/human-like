import React, { useState, useEffect } from 'react';

interface MobileKeyboardProps {
  currentView?: 'letters' | 'numbers' | 'symbols';
  highlightedKey?: string;
  keyboardMode?: 'light' | 'dark';
  onKeyPress?: (key: string) => void;
}

export const MobileKeyboard: React.FC<MobileKeyboardProps> = ({
  currentView = 'letters',
  highlightedKey,
  keyboardMode = 'light',
  onKeyPress
}) => {
  const [activeKey, setActiveKey] = useState<string>('');

  // Auto-clear highlighted key after animation
  useEffect(() => {
    if (highlightedKey) {
      setActiveKey(highlightedKey);
      const timer = setTimeout(() => setActiveKey(''), 200);
      return () => clearTimeout(timer);
    }
  }, [highlightedKey]);

  const letters = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['CAPS', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
    ['123', 'space', 'return']
  ];

  const numbers = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['#+=', '.', ',', '?', '!', "'", '⌫'],
    ['ABC', 'space', 'return']
  ];

  const symbols = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['123', '.', ',', '?', '!', "'", '⌫'],
    ['ABC', 'space', 'return']
  ];

  const getCurrentLayout = () => {
    switch (currentView) {
      case 'numbers': return numbers;
      case 'symbols': return symbols;
      default: return letters;
    }
  };

  const getKeyStyle = (key: string) => {
    // Better key matching - handle various key representations
    const normalizeKey = (k: string) => {
      if (k === 'caps lock' || k === 'CAPS') return 'CAPS';
      if (k === 'caps') return 'CAPS';
      if (k === 'backspace' || k === '⌫') return '⌫';
      if (k === 'space') return 'space';
      if (k === 'ABC') return 'ABC';
      if (k === '123') return '123';
      if (k === '#+=') return '#+=';
      if (k === 'return' || k === 'enter') return 'return';
      return k.toLowerCase();
    };
    
    const isActive = normalizeKey(activeKey) === normalizeKey(key) || 
                    normalizeKey(highlightedKey || '') === normalizeKey(key);
    const isModifier = ['CAPS', 'ABC', '123', '#+=', 'space', '⌫', 'return'].includes(key);
    
    // Calculate key width based on key type and position
    let keyWidth = '35px';
    if (key === 'space') keyWidth = '180px';
    else if (key === 'CAPS') keyWidth = '55px';
    else if (key === '⌫') keyWidth = '55px';
    else if (key === 'return') keyWidth = '80px';
    else if (['ABC', '123', '#+='].includes(key)) keyWidth = '50px';
    
    const baseStyle = {
      minWidth: keyWidth,
      height: '42px',
      margin: '1px',
      border: 'none',
      borderRadius: '6px',
      fontSize: key === 'space' ? '11px' : key === 'return' ? '11px' : isModifier ? '11px' : '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    };

    if (keyboardMode === 'dark') {
      return {
        ...baseStyle,
        backgroundColor: isActive ? '#0066cc' : isModifier ? '#4a4a4a' : '#2a2a2a',
        color: '#ffffff',
        boxShadow: isActive ? '0 0 10px rgba(0, 102, 204, 0.5)' : '0 1px 3px rgba(0,0,0,0.3)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: isActive ? '#007AFF' : isModifier ? '#d1d1d6' : '#ffffff',
        color: isActive ? '#ffffff' : '#000000',
        boxShadow: isActive ? '0 0 10px rgba(0, 122, 255, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        border: '1px solid #d1d1d6'
      };
    }
  };

  const containerStyle = {
    padding: '20px',
    backgroundColor: keyboardMode === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    boxShadow: keyboardMode === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.6)' 
      : '0 8px 32px rgba(0,0,0,0.1)',
    maxWidth: '420px',
    margin: '0 auto'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3px',
    gap: '1px'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '15px',
    color: keyboardMode === 'dark' ? '#ffffff' : '#000000',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };

  const viewIndicatorStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: keyboardMode === 'dark' ? '#0066cc' : '#007AFF',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        Mobile Keyboard - <span style={viewIndicatorStyle}>{currentView.toUpperCase()}</span>
      </div>
      {getCurrentLayout().map((row, rowIndex) => (
        <div key={rowIndex} style={rowStyle}>
          {row.map((key) => (
            <button
              key={key}
              style={getKeyStyle(key)}
              onClick={() => onKeyPress?.(key)}
            >
              {key === 'space' ? 'space' : key === 'return' ? '↵' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};