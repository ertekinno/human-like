export { HumanLike } from './components/HumanLike';
export { useHumanLike } from './hooks/useHumanLike';
export { TypingEngine } from './utils/TypingEngine';

// Keyboard visualization components
export { MobileKeyboard } from './components/MobileKeyboard';
export { DesktopKeyboard } from './components/DesktopKeyboard';
export { KeyPressIndicator, useKeyPressIndicator } from './components/KeyPressIndicator';
export { KeyboardSimulationDemo } from './components/KeyboardSimulationDemo';
export type {
  HumanLikeConfig,
  HumanLikeProps,
  MistakeInfo,
  TypingState,
  HumanLikeHookReturn,
  MistakeType,
  TypingEvent,
  KeyInfo,
  KeySequence,
  KeyboardMode
} from './types';
export { 
  TIMING_CONSTANTS, 
  BEHAVIOR_RATES, 
  QWERTY_ADJACENT, 
  DESKTOP_ADJACENT, 
  MOBILE_ADJACENT, 
  getAdjacentKeys 
} from './constants';

// Keyboard simulation exports
export {
  KeyboardAnalyzer,
  MOBILE_LAYOUT,
  DESKTOP_QWERTY_LAYOUT,
  MOBILE_TIMING_PROFILES,
  DESKTOP_TIMING_PROFILES,
  getDefaultTimingProfile,
  type TimingProfile,
  type KeyboardLayoutDefinition
} from './keyboard';