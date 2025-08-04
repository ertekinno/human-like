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
  id?: string;
  onStart?: (id?: string) => void;
  onComplete?: (id?: string) => void;
  onChar?: (char: string, index: number, id?: string) => void;
  onMistake?: (mistake: MistakeInfo, id?: string) => void;
  onBackspace?: (id?: string) => void;
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
    id,
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

  // Helper function to sync all state with engine
  const syncStateWithEngine = useCallback((engine: TypingEngine) => {
    setDisplayText(engine.getDisplayText());
    setProgress(engine.getProgress());
    setCurrentWPM(engine.getStats().currentWPM);
    setMistakeCount(engine.getMistakes().length);
    setCurrentState(engine.getState());
  }, []);

  // Initialize typing engine once
  useEffect(() => {
    const typingEngine = new TypingEngine(text, config);
    engineRef.current = typingEngine;
    
    // Initial state sync
    syncStateWithEngine(typingEngine);
    
    // Set up event listeners with optimized rendering
    typingEngine.onStateChangeListener((state) => {
      // Sync all state at once to avoid race conditions
      setCurrentState(state);
      setDisplayText(typingEngine.getDisplayText());
      setProgress(typingEngine.getProgress());
      setCurrentWPM(typingEngine.getStats().currentWPM);
      setMistakeCount(typingEngine.getMistakes().length);
      
      onStateChange?.(state);
      
      // Handle state-specific logic
      if (state === 'typing' && !isInitializedRef.current) {
        onStart?.(id);
        isInitializedRef.current = true;
      } else if (state === 'completed') {
        onComplete?.(id);
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
      setProgress(typingEngine.getProgress());
      
      // Update WPM more frequently during active typing
      const stats = typingEngine.getStats();
      setCurrentWPM(stats.currentWPM);
      
      onChar?.(char, index, id);
      
      // Clear any pending update to prevent double rendering
      if (updateTimeout) {
        clearTimeout(updateTimeout);
        updateTimeout = null;
      }
    });

    typingEngine.onMistakeListener((mistake) => {
      // Sync mistake count with engine's actual count
      setMistakeCount(typingEngine.getMistakes().length);
      onMistake?.(mistake, id);
    });

    // Optimize backspace updates
    typingEngine.onBackspaceListener(() => {
      // Immediate update for consistency with character updates
      setDisplayText(typingEngine.getDisplayText());
      setProgress(typingEngine.getProgress());
      onBackspace?.(id);
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

    // Only manage blinking if cursor should be visible
    const shouldShowCursor = options.showCursor !== undefined ? options.showCursor : initialShowCursor;
    
    if (shouldShowCursor && (currentState === 'typing' || currentState === 'paused' || currentState === 'correcting')) {
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
      setShowCursor(shouldShowCursor);
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [currentState, options.showCursor, initialShowCursor, cursorBlinkSpeedState]);

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
    if (engineRef.current) {
      engineRef.current.skip();
      // Let the engine's completion logic handle state updates
      // The onComplete callback will be triggered automatically
      setDisplayText(engineRef.current.getDisplayText());
      setProgress(engineRef.current.getProgress());
      setCurrentWPM(engineRef.current.getStats().currentWPM);
    }
  }, [text]);

  const rewind = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      // Sync all state with the reset engine
      setDisplayText(engineRef.current.getDisplayText());
      setProgress(engineRef.current.getProgress());
      setMistakeCount(engineRef.current.getMistakes().length);
      setCurrentWPM(engineRef.current.getStats().currentWPM);
      isInitializedRef.current = false;
    }
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