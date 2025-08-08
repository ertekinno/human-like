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

  // Handle shift/caps logic for unified ⇧ key (iOS-style behavior)
  const handleShiftKey = () => {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTime;
    
    if (timeSinceLastTap < 300) {
      // Double tap - toggle caps lock (iOS behavior)
      const newState = internalShiftState === ShiftState.Locked ? ShiftState.Off : ShiftState.Locked;
      const previousState = internalShiftState;
      setInternalShiftState(newState);
      onShiftStateChange?.({ 
        previousState, 
        currentState: newState, 
        timestamp: currentTime 
      });
    } else {
      // Single tap - cycle through states (iOS behavior)
      let newState;
      const previousState = internalShiftState;
      
      switch (internalShiftState) {
        case ShiftState.Off:
          newState = ShiftState.On;
          break;
        case ShiftState.On:
          newState = ShiftState.Off;
          break;
        case ShiftState.Locked:
          newState = ShiftState.Off;
          break;
        default:
          newState = ShiftState.On;
      }
      
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
      // iOS-style: Turn off shift after typing a letter (but not caps lock)
      if (internalShiftState === ShiftState.On && key.length === 1 && /[a-z]/i.test(key)) {
        const previousState = internalShiftState;
        setInternalShiftState(ShiftState.Off);
        onShiftStateChange?.({ 
          previousState, 
          currentState: ShiftState.Off, 
          timestamp: Date.now() 
        });
      }
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
    if (key === 'return') return 'return';
    if (key === '⇧') {
      // iOS-style visual states for shift key
      return '⇧';
    }
    
    return key;
  };

  const getKeyClasses = (key: string) => {
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
    const isShiftLocked = isShiftKey && internalShiftState === ShiftState.Locked;
    
    let keyClasses = 'human-like-mobile-keyboard__key';
    
    // Add size-specific classes
    if (key === 'space') keyClasses += ' human-like-mobile-keyboard__key--space';
    else if (key === '⇧') keyClasses += ' human-like-mobile-keyboard__key--shift';
    else if (key === '⌫') keyClasses += ' human-like-mobile-keyboard__key--backspace';
    else if (key === 'return') keyClasses += ' human-like-mobile-keyboard__key--return';
    else if (['ABC', '123', '#+='].includes(key)) keyClasses += ' human-like-mobile-keyboard__key--view-switch';
    else keyClasses += ' human-like-mobile-keyboard__key--regular';
    
    // Add state classes
    if (isActive) keyClasses += ' human-like-mobile-keyboard__key--active';
    if (isShiftKey) {
      if (isShiftLocked) keyClasses += ' human-like-mobile-keyboard__key--shift-locked';
      else if (internalShiftState === ShiftState.On) keyClasses += ' human-like-mobile-keyboard__key--shift-on';
    }
    if (isModifier) keyClasses += ' human-like-mobile-keyboard__key--modifier';
    
    return keyClasses;
  };

  const getKeyStyle = (key: string) => {
    // Return minimal styling if unstyled mode
    if (unstyled) {
      const keyWidth = key === 'space' ? '180px' : 
                     key === '⇧' || key === '⌫' ? '55px' : 
                     key === 'return' ? '80px' : 
                     ['ABC', '123', '#+='].includes(key) ? '50px' : '35px';
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
    
    return {}; // Let CSS classes handle the styling
  };

  const getContainerClassName = () => {
    let classNames = 'human-like-mobile-keyboard';
    if (classes.root) classNames += ` ${classes.root}`;
    if (className) classNames += ` ${className}`;
    return classNames.trim();
  };


  const containerStyle = unstyled ? style : style;

  return (
    <div 
      className={getContainerClassName()} 
      style={containerStyle}
      data-theme={keyboardMode}
    >
      {getCurrentLayout().map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`human-like-mobile-keyboard__row ${classes.row || ''}`}
        >
          {row.map((key) => {
            return (
              <button
                key={key}
                className={getKeyClasses(key)}
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