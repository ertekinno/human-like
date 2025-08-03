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
  sentencePause: number;
  wordPause: number;
  thinkingPause: number;
  minCharDelay: number;
  backspaceSpeed: number;
  realizationDelay: number;
  correctionPause: number;
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
  onStart?: () => void;
  onComplete?: () => void;
  onChar?: (char: string, index: number) => void;
  onMistake?: (mistake: MistakeInfo) => void;
  onBackspace?: () => void;
  onPause?: () => void;
  onResume?: () => void;
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
  showCursor: boolean;
  cursorChar: string;
  cursorBlinkSpeed: number;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  rewind: () => void;
  reset: () => void;
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