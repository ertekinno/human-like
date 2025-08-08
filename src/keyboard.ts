// Keyboard visualization components
export { MobileKeyboard } from './components/MobileKeyboard';
export { DesktopKeyboard } from './components/DesktopKeyboard';
export { KeyPressIndicator, useKeyPressIndicator } from './components/KeyPressIndicator';
export { KeyboardSimulationDemo } from './components/KeyboardSimulationDemo';

// Keyboard-specific types
export type { 
  MobileKeyboardProps, 
  MobileKeyboardRef 
} from './components/MobileKeyboard';

export type {
  KeyInfo,
  KeySequence,
  KeyboardMode,
  KeyPressEvent,
  KeyboardClasses,
  LabelOverrides,
  IconOverrides
} from './types';

// Export keyboard-specific enums
export { ShiftState, KeyboardView } from './types';

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
} from './keyboard/index';

// Keyboard-specific constants
export { 
  QWERTY_ADJACENT, 
  DESKTOP_ADJACENT, 
  MOBILE_ADJACENT, 
  getAdjacentKeys 
} from './constants';