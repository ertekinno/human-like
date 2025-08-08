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


  const getKeyClasses = (keyValue: string, isModifier = false) => {
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
    
    let keyClasses = 'human-like-desktop-keyboard__key';
    
    // Add size-specific classes based on key type
    if (keyValue === 'tab') keyClasses += ' human-like-desktop-keyboard__key--tab';
    else if (keyValue === 'caps lock') keyClasses += ' human-like-desktop-keyboard__key--caps-lock';
    else if (keyValue === 'shift') keyClasses += ' human-like-desktop-keyboard__key--shift';
    else if (keyValue === 'enter') keyClasses += ' human-like-desktop-keyboard__key--enter';
    else if (keyValue === 'backspace') keyClasses += ' human-like-desktop-keyboard__key--backspace';
    else if (keyValue === 'space') keyClasses += ' human-like-desktop-keyboard__key--space';
    else if (['ctrl', 'alt', 'cmd'].includes(keyValue)) keyClasses += ' human-like-desktop-keyboard__key--ctrl';
    else if (isModifier) keyClasses += ' human-like-desktop-keyboard__key--function';
    else if (/^\d$/.test(keyValue)) keyClasses += ' human-like-desktop-keyboard__key--number';
    
    // Add state classes
    if (isActive) keyClasses += ' human-like-desktop-keyboard__key--active';
    
    return keyClasses;
  };

  // Remove inline styles - let CSS handle it

  return (
    <div className="human-like-desktop-keyboard" data-theme={keyboardMode}>
      
      {/* Number Row */}
      <div className="human-like-desktop-keyboard__row">
        {numberRow.map((keyData) => (
          <button
            key={keyData.key}
            className={getKeyClasses(keyData.key)}
            onClick={() => onKeyPress?.(keyData.key)}
          >
            <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{keyData.shift}</div>
              <div>{keyData.key}</div>
            </div>
          </button>
        ))}
        <button className={getKeyClasses('backspace', true)} onClick={() => onKeyPress?.('backspace')}>
          ⌫
        </button>
      </div>

      {/* Top Row */}
      <div className="human-like-desktop-keyboard__row">
        <button className={getKeyClasses('tab', true)} onClick={() => onKeyPress?.('tab')}>
          tab
        </button>
        {topRow.map((key) => (
          <button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
      </div>

      {/* Home Row */}
      <div className="human-like-desktop-keyboard__row">
        <button className={getKeyClasses('caps lock', true)} onClick={() => onKeyPress?.('caps lock')}>
          caps lock
        </button>
        {homeRow.map((key) => (
          <button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
        <button className={getKeyClasses('enter', true)} onClick={() => onKeyPress?.('enter')}>
          ↵
        </button>
      </div>

      {/* Bottom Row */}
      <div className="human-like-desktop-keyboard__row">
        <button className={getKeyClasses('shift', true)} onClick={() => onKeyPress?.('shift')}>
          shift
        </button>
        {bottomRow.map((key) => (
          <button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyPress?.(key)}
          >
            {getKeyDisplay(key)}
          </button>
        ))}
        <button className={getKeyClasses('shift', true)} onClick={() => onKeyPress?.('shift')}>
          shift
        </button>
      </div>

      {/* Space Row */}
      <div className="human-like-desktop-keyboard__row">
        <button className={getKeyClasses('ctrl', true)} onClick={() => onKeyPress?.('ctrl')}>
          ctrl
        </button>
        <button className={getKeyClasses('alt', true)} onClick={() => onKeyPress?.('alt')}>
          alt
        </button>
        <button className={getKeyClasses('cmd', true)} onClick={() => onKeyPress?.('cmd')}>
          cmd
        </button>
        <button className={getKeyClasses('space', false)} onClick={() => onKeyPress?.('space')}>
          space
        </button>
        <button className={getKeyClasses('cmd', true)} onClick={() => onKeyPress?.('cmd')}>
          cmd
        </button>
        <button className={getKeyClasses('alt', true)} onClick={() => onKeyPress?.('alt')}>
          alt
        </button>
        <button className={getKeyClasses('ctrl', true)} onClick={() => onKeyPress?.('ctrl')}>
          ctrl
        </button>
      </div>
    </div>
  );
};