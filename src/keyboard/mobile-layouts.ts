import type { KeyboardLayoutDefinition } from './types';

/**
 * Standard mobile keyboard layout (iOS/Android style)
 * Represents the most common mobile keyboard behavior
 */
export const MOBILE_LAYOUT: KeyboardLayoutDefinition = {
  views: {
    letters: [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'z', 'x', 'c', 'v', 'b', 'n', 'm'
    ],
    numbers: [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      '-', '/', ':', ';', '(', ')', '$', '&', '@', '"',
      '.', ',', '?', '!', "'", '[', ']', '{', '}', '#',
      '%', '^', '*', '+', '=', '_', '\\', '|', '~', '<',
      '>', '€', '£', '¥', '•', '...'
    ],
    symbols: [
      '[', ']', '{', '}', '#', '%', '^', '*', '+', '=',
      '_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•',
      '.', ',', '?', '!', "'", '"', '/', ':', ';', '(',
      ')', '$', '&', '@', '`', '§', '¿', '¡', '«', '»',
      '°', '†', '‡', '…', '‰', '′', '″', '‹', '›'
    ],
    emoji: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺', '😚',
      '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭'
    ]
  },
  
  viewSwitchers: {
    toNumbers: '123',
    toSymbols: '#+=', 
    toLetters: 'ABC',
    toEmoji: '😀'
  },
  
  modifiers: {
    shift: '⇧',
    caps: 'CAPS',
    space: 'space',
    enter: 'return',
    backspace: '⌫'
  },
  
  keyDurations: {
    letter: 80,       // Fast letter typing
    number: 90,       // Slightly slower for numbers
    symbol: 100,      // Slower for symbols
    modifier: 120,    // Shift/caps key press
    viewSwitch: 110,  // View switching (123, ABC, etc.)
    space: 75,        // Space bar
    enter: 90,        // Return key
    backspace: 110    // Backspace key
  }
};

/**
 * iOS-specific layout variations
 */
export const IOS_LAYOUT: KeyboardLayoutDefinition = {
  ...MOBILE_LAYOUT,
  
  viewSwitchers: {
    toNumbers: '.?123',
    toSymbols: '#+=',
    toLetters: 'ABC',
    toEmoji: '🙂'
  },
  
  modifiers: {
    shift: '⇧',
    caps: 'caps lock',
    space: 'space',
    enter: 'return',
    backspace: '⌫'
  }
};

/**
 * Android-specific layout variations
 */
export const ANDROID_LAYOUT: KeyboardLayoutDefinition = {
  ...MOBILE_LAYOUT,
  
  viewSwitchers: {
    toNumbers: '?123',
    toSymbols: '=\\<',
    toLetters: 'ABC',
    toEmoji: '😀'
  },
  
  modifiers: {
    shift: '⇧',
    caps: 'CAPS',
    space: 'space',
    enter: 'return',
    backspace: '⌫'
  }
};

/**
 * Map character to the view it belongs to
 */
export const MOBILE_CHARACTER_TO_VIEW: Record<string, 'letters' | 'numbers' | 'symbols'> = {
  // Letters (lowercase and uppercase)
  ...Object.fromEntries('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, 'letters' as const])),
  
  // Numbers and basic symbols on number view
  '1': 'numbers', '2': 'numbers', '3': 'numbers', '4': 'numbers', '5': 'numbers',
  '6': 'numbers', '7': 'numbers', '8': 'numbers', '9': 'numbers', '0': 'numbers',
  '-': 'numbers', '/': 'numbers', ':': 'numbers', ';': 'numbers', '(': 'numbers',
  ')': 'numbers', '$': 'numbers', '&': 'numbers', '@': 'numbers', '"': 'numbers',
  '.': 'numbers', ',': 'numbers', '?': 'numbers', '!': 'numbers', "'": 'numbers',
  
  // Complex symbols on symbol view
  '[': 'symbols', ']': 'symbols', '{': 'symbols', '}': 'symbols', '#': 'symbols',
  '%': 'symbols', '^': 'symbols', '*': 'symbols', '+': 'symbols', '=': 'symbols',
  '_': 'symbols', '\\': 'symbols', '|': 'symbols', '~': 'symbols', '<': 'symbols',
  '>': 'symbols', '€': 'symbols', '£': 'symbols', '¥': 'symbols', '•': 'symbols',
  '`': 'symbols', '§': 'symbols', '¿': 'symbols', '¡': 'symbols', '«': 'symbols',
  '»': 'symbols', '°': 'symbols', '†': 'symbols', '‡': 'symbols', '…': 'symbols',
  '‰': 'symbols', '′': 'symbols', '″': 'symbols', '‹': 'symbols', '›': 'symbols'
};

/**
 * Special mobile keyboard shortcuts and gestures
 */
export const MOBILE_SHORTCUTS = {
  // Double space = period + space (common mobile behavior)
  DOUBLE_SPACE_PERIOD: true,
  
  // Long press behaviors
  LONG_PRESS_ACCENTS: {
    'a': ['à', 'á', 'â', 'ä', 'æ', 'ã', 'å', 'ā'],
    'e': ['è', 'é', 'ê', 'ë', 'ē', 'ė', 'ę'],
    'i': ['î', 'ï', 'í', 'ī', 'į', 'ì'],
    'o': ['ô', 'ö', 'ò', 'ó', 'œ', 'ø', 'ō', 'õ'],
    'u': ['û', 'ü', 'ù', 'ú', 'ū'],
    'c': ['ç', 'ć', 'č'],
    'n': ['ñ', 'ń'],
    's': ['ś', 'š'],
    'z': ['ž', 'ź', 'ż']
  },
  
  // Auto-correction common patterns
  AUTO_CAPITALIZE_AFTER: ['.', '!', '?', '\n'],
  AUTO_SPACE_AFTER: ['.', ',', '!', '?', ':', ';']
};