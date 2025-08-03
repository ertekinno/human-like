import { useState, useEffect, useRef, useCallback } from 'react';
import type { HumanLikeConfig, HumanLikeHookReturn, TypingState, MistakeInfo } from '../types';
import { TypingEngine } from '../utils/TypingEngine';

interface UseHumanLikeOptions {
  text: string;
  config?: Partial<HumanLikeConfig>;
  autoStart?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  cursorBlinkSpeed?: number;
  onStart?: () => void;
  onComplete?: () => void;
  onChar?: (char: string, index: number) => void;
  onMistake?: (mistake: MistakeInfo) => void;
  onBackspace?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStateChange?: (state: TypingState) => void;
}

export function useHumanLike(options: UseHumanLikeOptions): HumanLikeHookReturn {
  const {
    text,
    config = {},
    autoStart = false,
    showCursor: initialShowCursor = true,
    cursorBlinkSpeed = 530,
    onStart,
    onComplete,
    onChar,
    onMistake,
    onBackspace,
    onPause,
    onResume,
    onStateChange
  } = options;

  // Core state
  const [displayText, setDisplayText] = useState('');
  const [currentState, setCurrentState] = useState<TypingState>('idle');
  const [progress, setProgress] = useState(0);
  const [currentWPM, setCurrentWPM] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showCursor, setShowCursor] = useState(initialShowCursor);
  const [cursorCharState, setCursorCharState] = useState(options.cursorChar || '|');
  const [cursorBlinkSpeedState, setCursorBlinkSpeedState] = useState(cursorBlinkSpeed);

  // Refs
  const engineRef = useRef<TypingEngine | null>(null);
  const cursorIntervalRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Sync prop changes with internal state
  useEffect(() => {
    if (options.cursorChar !== undefined) {
      setCursorCharState(options.cursorChar || '|');
    }
  }, [options.cursorChar]);

  useEffect(() => {
    if (options.showCursor !== undefined) {
      setShowCursor(options.showCursor);
    }
  }, [options.showCursor]);

  useEffect(() => {
    if (cursorBlinkSpeed !== undefined) {
      setCursorBlinkSpeedState(cursorBlinkSpeed);
    }
  }, [cursorBlinkSpeed]);

  // Initialize typing engine once
  useEffect(() => {
    const typingEngine = new TypingEngine(text, config);
    engineRef.current = typingEngine;
    
    // Set up event listeners with optimized rendering
    typingEngine.onStateChangeListener((state) => {
      setCurrentState(state);
      onStateChange?.(state);
      
      // Handle state-specific logic
      if (state === 'typing' && !isInitializedRef.current) {
        onStart?.();
        isInitializedRef.current = true;
      } else if (state === 'completed') {
        onComplete?.();
      } else if (state === 'paused') {
        onPause?.();
      } else if (state === 'typing' && isInitializedRef.current) {
        onResume?.();
      }
    });

    // Optimize character updates to prevent flickering
    let updateTimeout: number | null = null;
    typingEngine.onCharacterListener((char, index) => {
      // Immediate update for better responsiveness
      setDisplayText(typingEngine.getDisplayText());
      onChar?.(char, index);
      
      // Clear any pending update to prevent double rendering
      if (updateTimeout) {
        clearTimeout(updateTimeout);
        updateTimeout = null;
      }
    });

    typingEngine.onMistakeListener((mistake) => {
      setMistakeCount(prev => prev + 1);
      onMistake?.(mistake);
    });

    // Optimize backspace updates
    typingEngine.onBackspaceListener(() => {
      // Use requestAnimationFrame for smoother backspace rendering
      requestAnimationFrame(() => {
        setDisplayText(typingEngine.getDisplayText());
      });
      onBackspace?.();
    });

    typingEngine.onProgressListener((progressValue) => {
      setProgress(progressValue);
    });

    // Auto-start if requested
    if (autoStart) {
      typingEngine.start();
    }

    // Cleanup on unmount or text/config change
    return () => {
      typingEngine.stop();
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [text, JSON.stringify(config), autoStart]);

  // Update WPM periodically only when typing
  useEffect(() => {
    let wpmInterval: number | null = null;
    
    if (currentState === 'typing' || currentState === 'correcting') {
      wpmInterval = window.setInterval(() => {
        if (engineRef.current) {
          const stats = engineRef.current.getStats();
          setCurrentWPM(stats.currentWPM);
        }
      }, 1000);
    }

    return () => {
      if (wpmInterval) {
        clearInterval(wpmInterval);
      }
    };
  }, [currentState]);

  // Cursor blinking effect - optimized to reduce re-renders
  useEffect(() => {
    // Clear any existing interval
    if (cursorIntervalRef.current) {
      clearInterval(cursorIntervalRef.current);
      cursorIntervalRef.current = null;
    }

    if (initialShowCursor && (currentState === 'typing' || currentState === 'paused' || currentState === 'correcting')) {
      // Start blinking
      setShowCursor(true);
      cursorIntervalRef.current = window.setInterval(() => {
        setShowCursor(prev => !prev);
      }, cursorBlinkSpeedState);
    } else if (currentState === 'completed') {
      // Hide cursor when completed
      setShowCursor(false);
    } else {
      // Show static cursor for other states
      setShowCursor(initialShowCursor);
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [currentState, initialShowCursor, cursorBlinkSpeedState]);

  // Control methods
  const start = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    isInitializedRef.current = false;
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const skip = useCallback(() => {
    engineRef.current?.skip();
    setDisplayText(text);
    setProgress(100);
  }, [text]);

  const rewind = useCallback(() => {
    engineRef.current?.reset();
    setDisplayText('');
    setProgress(0);
    setMistakeCount(0);
    setCurrentWPM(0);
    isInitializedRef.current = false;
  }, []);

  const reset = useCallback(() => {
    rewind();
  }, [rewind]);

  // Cursor control methods
  const setCursorVisible = useCallback((visible: boolean) => {
    setShowCursor(visible);
  }, []);

  const setCursorChar = useCallback((char: string) => {
    setCursorCharState(char || '|'); // Fallback to default if empty
  }, []);

  const setCursorBlinkSpeed = useCallback((speed: number) => {
    setCursorBlinkSpeedState(Math.max(100, speed)); // Minimum 100ms for sanity
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // Computed properties
  const isTyping = currentState === 'typing' || currentState === 'correcting';
  const isPaused = currentState === 'paused';
  const isCompleted = currentState === 'completed';

  return {
    displayText,
    isTyping,
    isPaused,
    isCompleted,
    currentState,
    progress,
    currentWPM,
    mistakeCount,
    showCursor: showCursor && initialShowCursor,
    cursorChar: cursorCharState,
    cursorBlinkSpeed: cursorBlinkSpeedState,
    start,
    stop,
    pause,
    resume,
    skip,
    rewind,
    reset,
    setCursorVisible,
    setCursorChar,
    setCursorBlinkSpeed
  };
}