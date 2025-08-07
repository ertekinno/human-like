import type { KeyboardLayoutDefinition } from './types';

/**
 * Platform-specific timing profiles for more realistic keyboard simulation
 */

export interface TimingProfile {
  name: string;
  description: string;
  baseMultiplier: number;
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
  // Additional behavioral modifiers
  viewSwitchDelay: number;    // Extra delay for view switching
  consecutiveKeyBonus: number; // Speed bonus for typing same-hand sequences
  complexSymbolPenalty: number; // Extra delay for complex symbols
  capsLockTransitionDelay: number; // Extra delay for caps lock on/off
}

/**
 * Mobile device timing profiles
 */
export const MOBILE_TIMING_PROFILES: Record<string, TimingProfile> = {
  // Standard smartphone typing
  MOBILE_CASUAL: {
    name: 'Mobile Casual',
    description: 'Average smartphone user, thumb typing',
    baseMultiplier: 1.0,
    keyDurations: {
      letter: 120,
      number: 140,
      symbol: 160,
      modifier: 180,
      viewSwitch: 150,
      space: 100,
      enter: 130,
      backspace: 150
    },
    viewSwitchDelay: 50,
    consecutiveKeyBonus: 0.9,
    complexSymbolPenalty: 40,
    capsLockTransitionDelay: 60
  },

  // Fast mobile typist
  MOBILE_FAST: {
    name: 'Mobile Fast',
    description: 'Experienced mobile user, swipe/predictive text habits',
    baseMultiplier: 0.7,
    keyDurations: {
      letter: 80,
      number: 95,
      symbol: 110,
      modifier: 120,
      viewSwitch: 100,
      space: 70,
      enter: 90,
      backspace: 110
    },
    viewSwitchDelay: 30,
    consecutiveKeyBonus: 0.85,
    complexSymbolPenalty: 25,
    capsLockTransitionDelay: 40
  },

  // Slow/careful mobile typing
  MOBILE_CAREFUL: {
    name: 'Mobile Careful',
    description: 'Deliberate mobile typing, hunt-and-peck style',
    baseMultiplier: 1.5,
    keyDurations: {
      letter: 180,
      number: 220,
      symbol: 280,
      modifier: 250,
      viewSwitch: 200,
      space: 150,
      enter: 180,
      backspace: 220
    },
    viewSwitchDelay: 80,
    consecutiveKeyBonus: 0.95,
    complexSymbolPenalty: 60,
    capsLockTransitionDelay: 100
  },

  // Tablet typing (larger screen, different hand position)
  TABLET: {
    name: 'Tablet',
    description: 'Tablet device, often landscape mode with more fingers',
    baseMultiplier: 0.8,
    keyDurations: {
      letter: 90,
      number: 110,
      symbol: 130,
      modifier: 140,
      viewSwitch: 120,
      space: 80,
      enter: 100,
      backspace: 130
    },
    viewSwitchDelay: 40,
    consecutiveKeyBonus: 0.8, // More fingers = better hand alternation
    complexSymbolPenalty: 30,
    capsLockTransitionDelay: 50
  }
};

/**
 * Desktop timing profiles
 */
export const DESKTOP_TIMING_PROFILES: Record<string, TimingProfile> = {
  // Standard desktop typing
  DESKTOP_AVERAGE: {
    name: 'Desktop Average',
    description: 'Average desktop user, ~40 WPM',
    baseMultiplier: 1.0,
    keyDurations: {
      letter: 80,
      number: 100,
      symbol: 120,
      modifier: 90,
      viewSwitch: 0, // No view switching on desktop
      space: 70,
      enter: 90,
      backspace: 100
    },
    viewSwitchDelay: 0,
    consecutiveKeyBonus: 0.85, // Good hand alternation on QWERTY
    complexSymbolPenalty: 30,
    capsLockTransitionDelay: 50
  },

  // Fast desktop typist
  DESKTOP_FAST: {
    name: 'Desktop Fast',
    description: 'Experienced typist, ~70+ WPM, touch typing',
    baseMultiplier: 0.6,
    keyDurations: {
      letter: 50,
      number: 65,
      symbol: 80,
      modifier: 60,
      viewSwitch: 0,
      space: 45,
      enter: 60,
      backspace: 70
    },
    viewSwitchDelay: 0,
    consecutiveKeyBonus: 0.8,
    complexSymbolPenalty: 15,
    capsLockTransitionDelay: 25
  },

  // Programming-focused typing
  DESKTOP_PROGRAMMER: {
    name: 'Desktop Programmer',
    description: 'Developer typing, frequent symbols and modifiers',
    baseMultiplier: 0.7,
    keyDurations: {
      letter: 60,
      number: 70,
      symbol: 75, // Programmers are fast with symbols
      modifier: 65,
      viewSwitch: 0,
      space: 50,
      enter: 70,
      backspace: 80
    },
    viewSwitchDelay: 0,
    consecutiveKeyBonus: 0.8,
    complexSymbolPenalty: 10, // Less penalty for complex symbols
    capsLockTransitionDelay: 30
  },

  // Hunt-and-peck desktop typing
  DESKTOP_SLOW: {
    name: 'Desktop Slow',
    description: 'Hunt-and-peck typing, looking at keyboard',
    baseMultiplier: 2.0,
    keyDurations: {
      letter: 160,
      number: 200,
      symbol: 250,
      modifier: 180,
      viewSwitch: 0,
      space: 140,
      enter: 160,
      backspace: 180
    },
    viewSwitchDelay: 0,
    consecutiveKeyBonus: 0.95, // Less benefit from hand alternation
    complexSymbolPenalty: 80,
    capsLockTransitionDelay: 120
  },

  // Gaming keyboard (mechanical, fast response)
  DESKTOP_GAMING: {
    name: 'Desktop Gaming',
    description: 'Mechanical keyboard, gaming-optimized typing',
    baseMultiplier: 0.5,
    keyDurations: {
      letter: 40,
      number: 50,
      symbol: 60,
      modifier: 45,
      viewSwitch: 0,
      space: 35,
      enter: 50,
      backspace: 60
    },
    viewSwitchDelay: 0,
    consecutiveKeyBonus: 0.75,
    complexSymbolPenalty: 10,
    capsLockTransitionDelay: 20
  }
};

/**
 * Auto-detect appropriate timing profile based on config
 */
export function getDefaultTimingProfile(keyboardMode: 'mobile' | 'desktop', userHint?: string): TimingProfile {
  if (keyboardMode === 'mobile') {
    if (userHint === 'fast') return MOBILE_TIMING_PROFILES.MOBILE_FAST;
    if (userHint === 'slow' || userHint === 'careful') return MOBILE_TIMING_PROFILES.MOBILE_CAREFUL;
    if (userHint === 'tablet') return MOBILE_TIMING_PROFILES.TABLET;
    return MOBILE_TIMING_PROFILES.MOBILE_CASUAL; // Default
  } else {
    if (userHint === 'fast') return DESKTOP_TIMING_PROFILES.DESKTOP_FAST;
    if (userHint === 'slow') return DESKTOP_TIMING_PROFILES.DESKTOP_SLOW;
    if (userHint === 'programmer' || userHint === 'developer') return DESKTOP_TIMING_PROFILES.DESKTOP_PROGRAMMER;
    if (userHint === 'gaming') return DESKTOP_TIMING_PROFILES.DESKTOP_GAMING;
    return DESKTOP_TIMING_PROFILES.DESKTOP_AVERAGE; // Default
  }
}

/**
 * Apply timing profile to keyboard layout
 */
export function applyTimingProfile(layout: KeyboardLayoutDefinition, profile: TimingProfile): KeyboardLayoutDefinition {
  return {
    ...layout,
    keyDurations: {
      ...profile.keyDurations
    }
  };
}

/**
 * Calculate dynamic timing adjustments based on context
 */
export function calculateContextualTiming(
  baseDelay: number, 
  profile: TimingProfile, 
  context: {
    isConsecutiveSameHand?: boolean;
    isComplexSymbol?: boolean;
    isViewSwitch?: boolean;
    isCapsLockTransition?: boolean;
  }
): number {
  let adjustedDelay = baseDelay * profile.baseMultiplier;

  // Apply profile-specific adjustments
  if (context.isConsecutiveSameHand) {
    adjustedDelay *= profile.consecutiveKeyBonus;
  }

  if (context.isComplexSymbol) {
    adjustedDelay += profile.complexSymbolPenalty;
  }

  if (context.isViewSwitch) {
    adjustedDelay += profile.viewSwitchDelay;
  }

  if (context.isCapsLockTransition) {
    adjustedDelay += profile.capsLockTransitionDelay;
  }

  return adjustedDelay;
}