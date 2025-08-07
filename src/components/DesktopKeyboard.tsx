import React, { useState, useEffect } from 'react';

interface DesktopKeyboardProps {
  highlightedKey?: string;
  keyboardMode?: 'light' | 'dark';
  onKeyPress?: (key: string) => void;
}

export const DesktopKeyboard: React.FC<DesktopKeyboardProps> = ({
  highlightedKey,
  keyboardMode = 'light',
  onKeyPress
}) => {
  const [activeKey, setActiveKey] = useState<string>('');
  const [shiftPressed, setShiftPressed] = useState(false);

  // Auto-clear highlighted key after animation
  useEffect(() => {
    if (highlightedKey) {
      setActiveKey(highlightedKey);
      
      // Handle shift key logic
      if (highlightedKey === 'shift') {
        setShiftPressed(true);
        setTimeout(() => setShiftPressed(false), 300);
      }
      
      const timer = setTimeout(() => setActiveKey(''), 200);
      return () => clearTimeout(timer);
    }
  }, [highlightedKey]);

  const numberRow = [
    { key: '`', shift: '~' },
    { key: '1', shift: '!' },
    { key: '2', shift: '@' },
    { key: '3', shift: '#' },
    { key: '4', shift: '$' },
    { key: '5', shift: '%' },
    { key: '6', shift: '^' },
    { key: '7', shift: '&' },
    { key: '8', shift: '*' },
    { key: '9', shift: '(' },
    { key: '0', shift: ')' },
    { key: '-', shift: '_' },
    { key: '=', shift: '+' }
  ];

  const topRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
  const homeRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const bottomRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  const getKeyDisplay = (keyData: any) => {
    if (typeof keyData === 'string') {
      return shiftPressed ? keyData.toUpperCase() : keyData;
    }
    return shiftPressed ? keyData.shift : keyData.key;
  };


  const getKeyStyle = (keyValue: string, isModifier = false, width = 45) => {
    // Better key matching - handle various key representations  
    const normalizeKey = (k: string) => {
      if (k === 'caps lock' || k === 'CAPS') return 'caps lock';
      if (k === 'caps') return 'caps lock';
      if (k === 'backspace' || k === '⌫') return 'backspace';
      if (k === 'space') return 'space';
      if (k === 'shift') return 'shift';
      if (k === 'enter' || k === 'return') return 'enter';
      return k.toLowerCase();
    };
    
    const isActive = normalizeKey(activeKey) === normalizeKey(keyValue) || 
                    normalizeKey(highlightedKey || '') === normalizeKey(keyValue) ||
                    (keyValue === 'shift' && shiftPressed);
    
    const baseStyle = {
      width: `${width}px`,
      height: '45px',
      margin: '2px',
      border: 'none',
      borderRadius: '6px',
      fontSize: isModifier ? '12px' : '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Times New Roman", monospace'
    };

    if (keyboardMode === 'dark') {
      return {
        ...baseStyle,
        backgroundColor: isActive ? '#0066cc' : isModifier ? '#4a4a4a' : '#2a2a2a',
        color: '#ffffff',
        boxShadow: isActive ? '0 0 12px rgba(0, 102, 204, 0.6)' : '0 2px 4px rgba(0,0,0,0.4)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        border: '1px solid #4a4a4a'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: isActive ? '#007AFF' : isModifier ? '#e5e5ea' : '#ffffff',
        color: isActive ? '#ffffff' : '#000000',
        boxShadow: isActive ? '0 0 12px rgba(0, 122, 255, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        border: '1px solid #d1d1d6'
      };
    }
  };

  const containerStyle = {
    padding: '25px',
    backgroundColor: keyboardMode === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    boxShadow: keyboardMode === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.6)' 
      : '0 8px 32px rgba(0,0,0,0.1)',
    maxWidth: '700px',
    margin: '0 auto'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '5px',
    gap: '1px'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '20px',
    color: keyboardMode === 'dark' ? '#ffffff' : '#000000',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        Desktop Keyboard (QWERTY)
      </div>
      
      {/* Number Row */}
      <div style={rowStyle}>
        {numberRow.map((keyData) => (
          <button
            key={keyData.key}
            style={getKeyStyle(keyData.key)}
            onClick={() => onKeyPress?.(keyData.key)}
          >
            <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{keyData.shift}</div>
              <div>{keyData.key}</div>
            </div>
          </button>
        ))}
        <button style={getKeyStyle('backspace', true, 80)} onClick={() => onKeyPress?.('backspace')}>
          ⌫
        </button>
      </div>

      {/* Top Row */}
      <div style={rowStyle}>
        <button style={getKeyStyle('tab', true, 60)} onClick={() => onKeyPress?.('tab')}>
          tab
        </button>
        {topRow.map((key) => (
          <button
            key={key}
            style={getKeyStyle(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
      </div>

      {/* Home Row */}
      <div style={rowStyle}>
        <button style={getKeyStyle('caps lock', true, 70)} onClick={() => onKeyPress?.('caps lock')}>
          caps lock
        </button>
        {homeRow.map((key) => (
          <button
            key={key}
            style={getKeyStyle(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
        <button style={getKeyStyle('enter', true, 80)} onClick={() => onKeyPress?.('enter')}>
          ↵
        </button>
      </div>

      {/* Bottom Row */}
      <div style={rowStyle}>
        <button style={getKeyStyle('shift', true, 90)} onClick={() => onKeyPress?.('shift')}>
          shift
        </button>
        {bottomRow.map((key) => (
          <button
            key={key}
            style={getKeyStyle(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
        <button style={getKeyStyle('shift', true, 90)} onClick={() => onKeyPress?.('shift')}>
          shift
        </button>
      </div>

      {/* Space Row */}
      <div style={rowStyle}>
        <button style={getKeyStyle('ctrl', true, 60)} onClick={() => onKeyPress?.('ctrl')}>
          ctrl
        </button>
        <button style={getKeyStyle('alt', true, 50)} onClick={() => onKeyPress?.('alt')}>
          alt
        </button>
        <button style={getKeyStyle('cmd', true, 50)} onClick={() => onKeyPress?.('cmd')}>
          cmd
        </button>
        <button style={getKeyStyle('space', false, 300)} onClick={() => onKeyPress?.('space')}>
          space
        </button>
        <button style={getKeyStyle('cmd', true, 50)} onClick={() => onKeyPress?.('cmd')}>
          cmd
        </button>
        <button style={getKeyStyle('alt', true, 50)} onClick={() => onKeyPress?.('alt')}>
          alt
        </button>
        <button style={getKeyStyle('ctrl', true, 60)} onClick={() => onKeyPress?.('ctrl')}>
          ctrl
        </button>
      </div>
    </div>
  );
};