import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { KeyboardView, ShiftState } from '../types';
import type { 
  KeyboardClasses, 
  LabelOverrides, 
  IconOverrides,
  ViewChangeEvent,
  ShiftChangeEvent
} from '../types';

export interface MobileKeyboardProps {
  currentView?: KeyboardView;
  onViewChange?: (event: ViewChangeEvent) => void;
  highlightedKey?: string;
  keyboardMode?: 'light' | 'dark';
  onKeyPress?: (key: string) => void;
  
  // New props for enhanced functionality
  showTitle?: boolean;
  title?: string;
  unstyled?: boolean;
  className?: string;
  classes?: KeyboardClasses;
  style?: React.CSSProperties;
  labelOverrides?: LabelOverrides;
  iconOverrides?: IconOverrides;
  uppercaseLettersWhenShifted?: boolean;
  shiftState?: ShiftState;
  onShiftStateChange?: (event: ShiftChangeEvent) => void;
}

export interface MobileKeyboardRef {
  resetKeyboard: () => void;
  setView: (view: KeyboardView) => void;
  setShift: (state: ShiftState) => void;
  highlightKey: (key: string) => void;
}

export const MobileKeyboard = forwardRef<MobileKeyboardRef, MobileKeyboardProps>(({
  currentView = KeyboardView.Letters,
  onViewChange,
  highlightedKey,
  keyboardMode = 'light',
  onKeyPress,
  showTitle = true,
  title = 'Mobile Keyboard',
  unstyled = false,
  className = '',
  classes = {},
  style = {},
  labelOverrides = {},
  iconOverrides = {},
  uppercaseLettersWhenShifted = true,
  shiftState = ShiftState.Off,
  onShiftStateChange
}, ref) => {
  const [activeKey, setActiveKey] = useState<string>('');
  const [internalView, setInternalView] = useState<KeyboardView>(currentView);
  const [internalShiftState, setInternalShiftState] = useState<ShiftState>(shiftState);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  // Sync props with internal state
  useEffect(() => {
    setInternalView(currentView);
  }, [currentView]);

  useEffect(() => {
    setInternalShiftState(shiftState);
  }, [shiftState]);

  // Auto-clear highlighted key after animation
  useEffect(() => {
    if (highlightedKey) {
      setActiveKey(highlightedKey);
      const timer = setTimeout(() => setActiveKey(''), 200);
      return () => clearTimeout(timer);
    }
  }, [highlightedKey]);

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    resetKeyboard: () => {
      setInternalView(KeyboardView.Letters);
      setInternalShiftState(ShiftState.Off);
      setActiveKey('');
    },
    setView: (view: KeyboardView) => {
      const previousView = internalView;
      setInternalView(view);
      onViewChange?.({ 
        previousView, 
        currentView: view, 
        timestamp: Date.now() 
      });
    },
    setShift: (state: ShiftState) => {
      const previousState = internalShiftState;
      setInternalShiftState(state);
      onShiftStateChange?.({ 
        previousState, 
        currentState: state, 
        timestamp: Date.now() 
      });
    },
    highlightKey: (key: string) => {
      setActiveKey(key);
      setTimeout(() => setActiveKey(''), 200);
    }
  }), [internalView, internalShiftState, onViewChange, onShiftStateChange]);

  const letters = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
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

  // Handle shift/caps logic for unified ⇧ key
  const handleShiftKey = () => {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTime;
    
    if (timeSinceLastTap < 300) {
      // Double tap - toggle caps lock
      const newState = internalShiftState === ShiftState.Locked ? ShiftState.Off : ShiftState.Locked;
      const previousState = internalShiftState;
      setInternalShiftState(newState);
      onShiftStateChange?.({ 
        previousState, 
        currentState: newState, 
        timestamp: currentTime 
      });
    } else {
      // Single tap - toggle shift
      const newState = internalShiftState === ShiftState.Off ? ShiftState.On : ShiftState.Off;
      const previousState = internalShiftState;
      setInternalShiftState(newState);
      onShiftStateChange?.({ 
        previousState, 
        currentState: newState, 
        timestamp: currentTime 
      });
    }
    
    setLastTapTime(currentTime);
  };

  const handleViewChange = (newView: KeyboardView) => {
    const previousView = internalView;
    setInternalView(newView);
    onViewChange?.({ 
      previousView, 
      currentView: newView, 
      timestamp: Date.now() 
    });
  };

  const getCurrentLayout = () => {
    let layout;
    switch (internalView) {
      case KeyboardView.Numbers: 
        layout = numbers;
        break;
      case KeyboardView.Symbols: 
        layout = symbols;
        break;
      default: 
        layout = letters;
        break;
    }

    // Apply uppercase rendering if shift/caps is active and uppercaseLettersWhenShifted is true
    if (internalView === KeyboardView.Letters && uppercaseLettersWhenShifted && 
        (internalShiftState === ShiftState.On || internalShiftState === ShiftState.Locked)) {
      return layout.map(row => 
        row.map(key => {
          // Only uppercase letter keys, not special keys
          if (key.length === 1 && /[a-z]/.test(key)) {
            return key.toUpperCase();
          }
          return key;
        })
      );
    }

    return layout;
  };

  const handleKeyPress = (key: string) => {
    if (key === '⇧') {
      handleShiftKey();
    } else if (key === '123') {
      handleViewChange(KeyboardView.Numbers);
    } else if (key === 'ABC') {
      handleViewChange(KeyboardView.Letters);
    } else if (key === '#+=') {
      handleViewChange(KeyboardView.Symbols);
    } else {
      onKeyPress?.(key);
    }
  };

  const getDisplayLabel = (key: string): React.ReactNode => {
    // Check for icon overrides first
    if (iconOverrides[key]) {
      return iconOverrides[key];
    }
    
    // Check for label overrides
    if (labelOverrides[key]) {
      return labelOverrides[key];
    }
    
    // Special handling for specific keys
    if (key === 'space') return 'space';
    if (key === 'return') return '↵';
    if (key === '⇧') {
      // Visual state for shift key
      if (internalShiftState === ShiftState.Locked) return '⇧'; // Could be styled differently
      if (internalShiftState === ShiftState.On) return '⇧';
      return '⇧';
    }
    
    return key;
  };

  const getKeyStyle = (key: string) => {
    // Better key matching - handle various key representations
    const normalizeKey = (k: string) => {
      if (k === '⇧') return '⇧';
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
    const isModifier = ['⇧', 'ABC', '123', '#+=', 'space', '⌫', 'return'].includes(key);
    const isShiftKey = key === '⇧';
    const isShiftActive = isShiftKey && (internalShiftState === ShiftState.On || internalShiftState === ShiftState.Locked);
    const isShiftLocked = isShiftKey && internalShiftState === ShiftState.Locked;
    
    // Calculate key width based on key type and position
    let keyWidth = '35px';
    if (key === 'space') keyWidth = '180px';
    else if (key === '⇧') keyWidth = '55px';
    else if (key === '⌫') keyWidth = '55px';
    else if (key === 'return') keyWidth = '80px';
    else if (['ABC', '123', '#+='].includes(key)) keyWidth = '50px';
    
    // Return minimal styling if unstyled mode
    if (unstyled) {
      return {
        minWidth: keyWidth,
        height: '42px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    }

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
        backgroundColor: isActive || isShiftActive ? '#0066cc' : 
                        isShiftLocked ? '#ff6b35' : 
                        isModifier ? '#4a4a4a' : '#2a2a2a',
        color: '#ffffff',
        boxShadow: isActive || isShiftActive ? '0 0 10px rgba(0, 102, 204, 0.5)' : '0 1px 3px rgba(0,0,0,0.3)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: isActive || isShiftActive ? '#007AFF' : 
                        isShiftLocked ? '#ff3b30' : 
                        isModifier ? '#d1d1d6' : '#ffffff',
        color: isActive || isShiftActive || isShiftLocked ? '#ffffff' : '#000000',
        boxShadow: isActive || isShiftActive ? '0 0 10px rgba(0, 122, 255, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        border: '1px solid #d1d1d6'
      };
    }
  };

  const getContainerClassName = () => {
    let classNames = '';
    if (classes.root) classNames += ` ${classes.root}`;
    if (className) classNames += ` ${className}`;
    return classNames.trim();
  };

  const getKeyClassName = (isActive: boolean, isModifier: boolean) => {
    let classNames = '';
    if (classes.key) classNames += ` ${classes.key}`;
    if (isActive && classes.keyActive) classNames += ` ${classes.keyActive}`;
    if (isModifier && classes.keyModifier) classNames += ` ${classes.keyModifier}`;
    return classNames.trim();
  };

  const containerStyle = unstyled ? {} : {
    padding: '20px',
    backgroundColor: keyboardMode === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    boxShadow: keyboardMode === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.6)' 
      : '0 8px 32px rgba(0,0,0,0.1)',
    maxWidth: '420px',
    margin: '0 auto',
    ...style
  };

  const rowStyle = unstyled ? {} : {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3px',
    gap: '1px'
  };

  const headerStyle = unstyled ? {} : {
    textAlign: 'center' as const,
    marginBottom: '15px',
    color: keyboardMode === 'dark' ? '#ffffff' : '#000000',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };

  const viewIndicatorStyle = unstyled ? {} : {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: keyboardMode === 'dark' ? '#0066cc' : '#007AFF',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '500'
  };

  return (
    <div 
      className={getContainerClassName()} 
      style={containerStyle}
    >
      {showTitle && (
        <div 
          className={classes.title} 
          style={headerStyle}
        >
          {title} - <span 
            className={classes.viewIndicator} 
            style={viewIndicatorStyle}
          >
            {internalView.toUpperCase()}
          </span>
        </div>
      )}
      {getCurrentLayout().map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={classes.row} 
          style={rowStyle}
        >
          {row.map((key) => {
            const normalizeKey = (k: string) => {
              if (k === '⇧') return '⇧';
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
            const isModifier = ['⇧', 'ABC', '123', '#+=', 'space', '⌫', 'return'].includes(key);
            
            return (
              <button
                key={key}
                className={getKeyClassName(isActive, isModifier)}
                style={getKeyStyle(key)}
                onClick={() => handleKeyPress(key)}
              >
                {getDisplayLabel(key)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

// Add display name for debugging
MobileKeyboard.displayName = 'MobileKeyboard';