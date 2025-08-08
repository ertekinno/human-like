export interface HumanLikeConfig {
  speed: number;
  speedVariation: number;
  mistakeFrequency: number;
  mistakeTypes: {
    adjacent: boolean;
    random: boolean;
    doubleChar: boolean;
    commonTypos: boolean;
  };
  fatigueEffect: boolean;
  concentrationLapses: boolean;
  overcorrection: boolean;
  debug: boolean;
  sentencePause: number;
  wordPause: number;
  thinkingPause: number;
  minCharDelay: number;
  backspaceSpeed: number;
  realizationDelay: number;
  correctionPause: number;
  // Keyboard simulation options
  keyboardMode?: 'mobile' | 'desktop';
  onKey?: (keyInfo: any) => void; // KeyInfo imported later
}

export interface HumanLikeProps {
  text: string;
  speed?: number;
  mistakeFrequency?: number;
  showCursor?: boolean;
  cursorChar?: string;
  cursorBlinkSpeed?: number;
  autoStart?: boolean;
  config?: Partial<HumanLikeConfig>;
  id?: string;
  onStart?: (id?: string) => void;
  onComplete?: (id?: string) => void;
  onChar?: (char: string, index: number, id?: string) => void;
  onMistake?: (mistake: MistakeInfo, id?: string) => void;
  onBackspace?: (id?: string) => void;
  onPause?: (id?: string) => void;
  onResume?: (id?: string) => void;
  // Keyboard simulation props
  keyboardMode?: 'mobile' | 'desktop';
  onKey?: (keyInfo: any, id?: string) => void; // Will be properly typed after re-export
  className?: string;
  style?: React.CSSProperties;
}

export type MistakeType = 'adjacent' | 'random' | 'doubleChar' | 'commonTypo';

export interface MistakeInfo {
  type: MistakeType;
  originalChar: string;
  mistakeChar: string;
  position: number;
  corrected: boolean;
  realizationTime: number;
}

export type TypingState = 'idle' | 'typing' | 'paused' | 'correcting' | 'thinking' | 'completed';

export interface TypingEvent {
  type: 'char' | 'backspace' | 'mistake' | 'correction' | 'pause';
  char?: string;
  position: number;
  timestamp: number;
  mistake?: MistakeInfo;
}

export interface HumanLikeHookReturn {
  displayText: string;
  isTyping: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentState: TypingState;
  progress: number;
  currentWPM: number;
  mistakeCount: number;
  totalDuration: number; // Total duration in milliseconds
  showCursor: boolean;
  cursorChar: string;
  cursorBlinkSpeed: number;
  // Stable control methods
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  rewind: () => void;
  reset: () => void;
  resetKeyboard: () => void;
  setCursorVisible: (visible: boolean) => void;
  setCursorChar: (char: string) => void;
  setCursorBlinkSpeed: (speed: number) => void;
}

export interface TypingStats {
  totalCharacters: number;
  charactersTyped: number;
  mistakesMade: number;
  mistakesCorrected: number;
  startTime: number;
  endTime?: number;
  currentWPM: number;
  averageCharDelay: number;
  totalDuration: number; // Total time in milliseconds for the entire typing effect
}

export interface CharacterTiming {
  char: string;
  delay: number;
  isMistake: boolean;
  isCorrection: boolean;
  timestamp: number;
}

export interface WordInfo {
  word: string;
  isCommon: boolean;
  difficulty: number;
  startIndex: number;
  endIndex: number;
}

// Enums and constants
export enum ShiftState {
  Off = 'off',
  On = 'on',
  Locked = 'locked'
}

export enum KeyboardView {
  Letters = 'letters',
  Numbers = 'numbers',
  Symbols = 'symbols'
}

// New event types
export interface KeyPressEvent {
  id: string;
  key: string;
  view: KeyboardView;
  timestamp: number;
}

export interface StateChangeEvent {
  previousState: TypingState;
  currentState: TypingState;
  timestamp: number;
}

export interface ViewChangeEvent {
  previousView: KeyboardView;
  currentView: KeyboardView;
  timestamp: number;
}

export interface ShiftChangeEvent {
  previousState: ShiftState;
  currentState: ShiftState;
  timestamp: number;
}

export interface ErrorEvent {
  code: string;
  message: string;
  timestamp: number;
}

// Class override types
export interface KeyboardClasses {
  root?: string;
  row?: string;
  key?: string;
  keyActive?: string;
  keyModifier?: string;
  title?: string;
  viewIndicator?: string;
}

// Label and icon override types
export type LabelOverrides = Record<string, string>;
export type IconOverrides = Record<string, React.ReactNode>;

// Re-export keyboard types for convenience
export type { KeyInfo, KeySequence, KeyboardMode } from '../keyboard/types';