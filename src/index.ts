// Core typewriter functionality
export { HumanLike } from './components/HumanLike';
export { useHumanLike } from './hooks/useHumanLike';
export { TypingEngine } from './utils/TypingEngine';

// Core types
export type {
  HumanLikeConfig,
  HumanLikeProps,
  MistakeInfo,
  TypingState,
  HumanLikeHookReturn,
  MistakeType,
  TypingEvent,
  StateChangeEvent,
  ErrorEvent
} from './types';

// Core constants (essential for typing behavior)
export { 
  TIMING_CONSTANTS, 
  BEHAVIOR_RATES
} from './constants';