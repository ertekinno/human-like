import type { KeyboardLayoutDefinition } from './types';

/**
 * Standard US QWERTY desktop keyboard layout
 */
export const DESKTOP_QWERTY_LAYOUT: KeyboardLayoutDefinition = {
  views: {
    letters: [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'z', 'x', 'c', 'v', 'b', 'n', 'm'
    ],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    symbols: [
      '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=',
      '[', ']', '{', '}', '\\', '|', ';', ':', "'", '"', ',', '.', '<', '>', '/', '?'
    ]
  },
  
  viewSwitchers: {
    toNumbers: 'numbers',  // No view switching on desktop
    toSymbols: 'symbols',  // Symbols accessed via shift
    toLetters: 'letters'
  },
  
  modifiers: {
    shift: 'shift',
    caps: 'caps lock',
    space: 'space',
    enter: 'enter',
    backspace: 'backspace'
  },
  
  keyDurations: {
    letter: 70,       // Fast letter typing on desktop
    number: 85,       // Numbers require reaching up
    symbol: 95,       // Symbols often need shift
    modifier: 90,     // Modifier key press
    viewSwitch: 0,    // No view switching on desktop
    space: 60,        // Space bar
    enter: 80,        // Enter key
    backspace: 100    // Backspace key
  }
};

/**
 * Desktop key mappings - what physical key produces each character
 * Format: [key, requiresShift]
 */
export const DESKTOP_KEY_MAPPING: Record<string, [string, boolean]> = {
  // Letters (lowercase)
  'a': ['a', false], 'b': ['b', false], 'c': ['c', false], 'd': ['d', false], 'e': ['e', false],
  'f': ['f', false], 'g': ['g', false], 'h': ['h', false], 'i': ['i', false], 'j': ['j', false],
  'k': ['k', false], 'l': ['l', false], 'm': ['m', false], 'n': ['n', false], 'o': ['o', false],
  'p': ['p', false], 'q': ['q', false], 'r': ['r', false], 's': ['s', false], 't': ['t', false],
  'u': ['u', false], 'v': ['v', false], 'w': ['w', false], 'x': ['x', false], 'y': ['y', false],
  'z': ['z', false],
  
  // Letters (uppercase) - same key + shift
  'A': ['a', true], 'B': ['b', true], 'C': ['c', true], 'D': ['d', true], 'E': ['e', true],
  'F': ['f', true], 'G': ['g', true], 'H': ['h', true], 'I': ['i', true], 'J': ['j', true],
  'K': ['k', true], 'L': ['l', true], 'M': ['m', true], 'N': ['n', true], 'O': ['o', true],
  'P': ['p', true], 'Q': ['q', true], 'R': ['r', true], 'S': ['s', true], 'T': ['t', true],
  'U': ['u', true], 'V': ['v', true], 'W': ['w', true], 'X': ['x', true], 'Y': ['y', true],
  'Z': ['z', true],
  
  // Numbers (no shift)
  '1': ['1', false], '2': ['2', false], '3': ['3', false], '4': ['4', false], '5': ['5', false],
  '6': ['6', false], '7': ['7', false], '8': ['8', false], '9': ['9', false], '0': ['0', false],
  
  // Numbers with shift (top row symbols)
  '!': ['1', true], '@': ['2', true], '#': ['3', true], '$': ['4', true], '%': ['5', true],
  '^': ['6', true], '&': ['7', true], '*': ['8', true], '(': ['9', true], ')': ['0', true],
  
  // Other keys without shift
  '`': ['`', false], '-': ['-', false], '=': ['=', false], '[': ['[', false], ']': [']', false],
  '\\': ['\\', false], ';': [';', false], "'": ["'", false], ',': [',', false], '.': ['.', false],
  '/': ['/', false], ' ': ['space', false], '\n': ['enter', false], '\t': ['tab', false],
  
  // Other keys with shift
  '~': ['`', true], '_': ['-', true], '+': ['=', true], '{': ['[', true], '}': [']', true],
  '|': ['\\', true], ':': [';', true], '"': ["'", true], '<': [',', true], '>': ['.', true],
  '?': ['/', true]
};

/**
 * Desktop keyboard physical layout for visual representation
 */
export const DESKTOP_PHYSICAL_LAYOUT = {
  rows: [
    // Number row
    {
      keys: [
        { key: '`', shift: '~' },
        { key: '1', shift: '!' },
        { key: '2', shift: '@' },
        { key: '3', shift: '#' },
        { key: '4', shift: '$' },
        { key: '5', shift: '%' },
        { key: '6', shift: '^' },
        { key: '7', shift: '&' },
        { key: '8', shift: '*' },
        { key: '9', shift: '(' },
        { key: '0', shift: ')' },
        { key: '-', shift: '_' },
        { key: '=', shift: '+' }
      ]
    },
    
    // QWERTY row
    {
      keys: [
        { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
        { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' },
        { key: '[', shift: '{' },
        { key: ']', shift: '}' },
        { key: '\\', shift: '|' }
      ]
    },
    
    // ASDF row (home row)
    {
      keys: [
        { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
        { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' },
        { key: ';', shift: ':' },
        { key: "'", shift: '"' }
      ]
    },
    
    // ZXCV row
    {
      keys: [
        { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' }, { key: 'b' },
        { key: 'n' }, { key: 'm' },
        { key: ',', shift: '<' },
        { key: '.', shift: '>' },
        { key: '/', shift: '?' }
      ]
    },
    
    // Space row
    {
      keys: [
        { key: 'space', width: 'wide' }
      ]
    }
  ],
  
  modifiers: {
    left: ['shift', 'ctrl', 'alt', 'cmd'],
    right: ['shift', 'ctrl', 'alt', 'cmd']
  }
};

/**
 * Common desktop keyboard shortcuts and behaviors
 */
export const DESKTOP_SHORTCUTS = {
  // Copy/paste/cut
  COPY: ['cmd+c', 'ctrl+c'],
  PASTE: ['cmd+v', 'ctrl+v'],
  CUT: ['cmd+x', 'ctrl+x'],
  
  // Selection
  SELECT_ALL: ['cmd+a', 'ctrl+a'],
  SELECT_WORD: ['shift+alt+arrow', 'shift+ctrl+arrow'],
  
  // Navigation
  HOME: ['cmd+left', 'home'],
  END: ['cmd+right', 'end'],
  WORD_LEFT: ['alt+left', 'ctrl+left'],
  WORD_RIGHT: ['alt+right', 'ctrl+right'],
  
  // Deletion
  DELETE_WORD_LEFT: ['alt+backspace', 'ctrl+backspace'],
  DELETE_WORD_RIGHT: ['alt+delete', 'ctrl+delete'],
  DELETE_LINE: ['cmd+backspace', 'ctrl+u'],
  
  // Auto-behaviors
  AUTO_CAPITALIZE_SENTENCES: true,
  SMART_QUOTES: false, // Usually disabled for coding
  AUTO_CORRECTION: false // Usually disabled for coding
};