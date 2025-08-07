// Keyboard simulation types for human-like typing

export type KeyboardMode = 'mobile' | 'desktop';

export type KeyType = 'letter' | 'number' | 'symbol' | 'modifier' | 'view-switch' | 'space' | 'enter' | 'backspace';

export type KeyboardView = 'letters' | 'numbers' | 'symbols' | 'emoji';

export interface KeyInfo {
  /** The actual key being pressed (e.g., 'h', 'shift', '123', 'ABC') */
  key: string;
  
  /** The original character this key sequence produces (e.g., 'H', '@', '4') */
  character: string;
  
  /** Type of key being pressed */
  type: KeyType;
  
  /** Current keyboard view/layout */
  keyboardView: KeyboardView;
  
  /** Whether this is part of a caps lock sequence */
  isCapsLock: boolean;
  
  /** How long to highlight/hold this key (ms) */
  duration: number;
  
  /** Position in the key sequence (0-based) */
  sequenceIndex: number;
  
  /** Total keys in this character's sequence */
  sequenceLength: number;
}

export interface KeySequence {
  /** The character this sequence types */
  character: string;
  
  /** Array of keys to press in order */
  keys: KeyInfo[];
  
  /** Total time for the entire sequence */
  totalDuration: number;
  
  /** Whether this sequence uses caps lock detection */
  usesCapsLock: boolean;
}

export interface KeyboardState {
  /** Current keyboard view */
  currentView: KeyboardView;
  
  /** Whether caps lock is currently active */
  capsLockActive: boolean;
  
  /** Whether shift is currently held down */
  shiftActive: boolean;
  
  /** Sequence of recent characters for caps lock detection */
  recentCharacters: string[];
  
  /** Current keyboard mode */
  mode: KeyboardMode;
}

export interface KeyboardLayoutDefinition {
  /** Keys available in each view */
  views: {
    letters: string[];
    numbers: string[];
    symbols: string[];
    emoji?: string[];
  };
  
  /** View switching keys */
  viewSwitchers: {
    toNumbers: string;    // Usually '123'
    toSymbols: string;    // Usually '#+=', '#+='
    toLetters: string;    // Usually 'ABC'
    toEmoji?: string;     // Usually '😀'
  };
  
  /** Modifier keys */
  modifiers: {
    shift: string;        // Usually 'shift' or '⇧'
    caps: string;         // Usually 'caps' or 'caps lock'
    space: string;        // Usually 'space'
    enter: string;        // Usually 'return' or '↵'
    backspace: string;    // Usually '⌫'
  };
  
  /** Default key press durations by type (ms) */
  keyDurations: {
    letter: number;
    number: number;
    symbol: number;
    modifier: number;
    viewSwitch: number;
    space: number;
    enter: number;
    backspace: number;
  };
}

export interface KeyboardAnalyzerConfig {
  /** Keyboard mode to use */
  keyboardMode: KeyboardMode;
  
  /** Custom keyboard layout (optional) */
  customLayout?: KeyboardLayoutDefinition;
  
  /** Caps lock detection threshold */
  capsLockThreshold: number;
  
  /** Whether to use natural timing vs artificial delays */
  useNaturalTiming: boolean;
  
  /** Timing profile hint for auto-selection */
  typingSpeed?: 'slow' | 'average' | 'fast' | 'programmer' | 'gaming' | 'tablet';
  
  /** Debug logging */
  debug: boolean;
}