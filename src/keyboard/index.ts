// Keyboard simulation exports

// Core classes
export { KeyboardAnalyzer } from './KeyboardAnalyzer';

// Types
export type {
  KeyboardMode,
  KeyType,
  KeyboardView,
  KeyInfo,
  KeySequence,
  KeyboardState,
  KeyboardLayoutDefinition,
  KeyboardAnalyzerConfig
} from './types';

// Layout definitions
export {
  MOBILE_LAYOUT,
  IOS_LAYOUT,
  ANDROID_LAYOUT,
  MOBILE_CHARACTER_TO_VIEW,
  MOBILE_SHORTCUTS
} from './mobile-layouts';

export {
  DESKTOP_QWERTY_LAYOUT,
  DESKTOP_KEY_MAPPING,
  DESKTOP_PHYSICAL_LAYOUT,
  DESKTOP_SHORTCUTS
} from './desktop-layouts';

// Timing profiles
export {
  MOBILE_TIMING_PROFILES,
  DESKTOP_TIMING_PROFILES,
  getDefaultTimingProfile,
  applyTimingProfile,
  calculateContextualTiming,
  type TimingProfile
} from './timing-profiles';