import type { HumanLikeConfig } from '../types';

export const TIMING_CONSTANTS = {
  BASE_SPEED: 80,              // Average milliseconds per character
  SPEED_VARIATION: 40,         // Random timing variation (±40ms)
  MIN_CHAR_DELAY: 25,          // Minimum delay between characters
  
  // Punctuation and Structure
  SENTENCE_PAUSE: 500,         // Pause after . ! ?
  COMMA_PAUSE: 200,            // Pause after , ; :
  WORD_SPACE: 150,             // Pause between words
  LINE_BREAK: 800,             // Pause for new paragraphs
  
  // Mistake Handling
  REALIZATION_DELAY: 300,      // Time to notice mistake
  CORRECTION_PAUSE: 250,       // Pause before retyping
  BACKSPACE_SPEED: 60,         // Speed of corrections
  
  // Human Behavior
  THINKING_PAUSE: 400,         // Pause before complex words
  FATIGUE_INCREMENT: 0.5,      // Gradual slowdown per 100 chars
  BURST_SPEED_MULTIPLIER: 0.6, // Speed multiplier during bursts
  CONCENTRATION_PAUSE: 800,    // Duration of concentration lapses
  
  // Enhanced Realism
  SHIFT_HESITATION: 100,       // Extra delay for shift key characters (increased)
  CAPS_LOCK_ON_DELAY: 150,     // Delay when turning CAPS LOCK on
  CAPS_LOCK_OFF_DELAY: 100,    // Delay when turning CAPS LOCK off
  CAPS_SEQUENCE_THRESHOLD: 3,  // Min consecutive caps to trigger CAPS LOCK mode
  NUMBER_ROW_PENALTY: 35,      // Extra delay for number characters
  SYMBOL_BASE_PENALTY: 25,     // Base extra delay for symbols
  LOOK_AHEAD_CHANCE: 0.08,     // 8% chance of look-ahead typing
} as const;

export const BEHAVIOR_RATES = {
  MISTAKE_FREQUENCY: 0.03,     // 3% base mistake rate
  CONCENTRATION_LAPSE: 0.03,   // 3% random pause chance
  BURST_TYPING: 0.15,          // 15% rapid sequence chance
  FATIGUE_FACTOR: 0.0001,      // Gradual slowdown rate
  OVERCORRECTION_RATE: 0.2,    // 20% chance of making mistake while correcting
} as const;

// QWERTY keyboard layout for adjacent key mistakes
export const QWERTY_ADJACENT: Record<string, string[]> = {
  'q': ['w', 'a', 's'],
  'w': ['q', 'e', 'a', 's', 'd'],
  'e': ['w', 'r', 's', 'd', 'f'],
  'r': ['e', 't', 'd', 'f', 'g'],
  't': ['r', 'y', 'f', 'g', 'h'],
  'y': ['t', 'u', 'g', 'h', 'j'],
  'u': ['y', 'i', 'h', 'j', 'k'],
  'i': ['u', 'o', 'j', 'k', 'l'],
  'o': ['i', 'p', 'k', 'l', ';'],
  'p': ['o', '[', 'l', ';', "'"],
  '[': ['p', ']', ';', "'"],
  ']': ['[', '\\', "'"],
  
  'a': ['q', 'w', 's', 'z'],
  's': ['q', 'w', 'e', 'a', 'd', 'z', 'x'],
  'd': ['w', 'e', 'r', 's', 'f', 'x', 'c'],
  'f': ['e', 'r', 't', 'd', 'g', 'c', 'v'],
  'g': ['r', 't', 'y', 'f', 'h', 'v', 'b'],
  'h': ['t', 'y', 'u', 'g', 'j', 'b', 'n'],
  'j': ['y', 'u', 'i', 'h', 'k', 'n', 'm'],
  'k': ['u', 'i', 'o', 'j', 'l', 'm', ','],
  'l': ['i', 'o', 'p', 'k', ';', ',', '.'],
  ';': ['o', 'p', '[', 'l', "'", '.', '/'],
  "'": ['p', '[', ']', ';', '/', '.'],
  
  'z': ['a', 's', 'x'],
  'x': ['z', 's', 'd', 'c'],
  'c': ['x', 'd', 'f', 'v'],
  'v': ['c', 'f', 'g', 'b'],
  'b': ['v', 'g', 'h', 'n'],
  'n': ['b', 'h', 'j', 'm'],
  'm': ['n', 'j', 'k', ','],
  ',': ['m', 'k', 'l', '.'],
  '.': [',', 'l', ';', '/'],
  '/': ['.', ';', "'"],
  
  ' ': ['c', 'v', 'b', 'n', 'm'], // Space bar adjacent to bottom row
};

// Common words that are typed faster due to muscle memory
export const COMMON_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
  'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see',
  'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that',
  'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good',
  'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
  'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
]);

// Common typos that humans make
export const COMMON_TYPOS: Record<string, string> = {
  'the': 'teh',
  'and': 'adn',
  'for': 'fro',
  'you': 'yuo',
  'that': 'taht',
  'this': 'tihs',
  'with': 'wiht',
  'have': 'ahve',
  'from': 'form',
  'they': 'thye',
  'been': 'bene',
  'than': 'htan',
  'what': 'waht',
  'your': 'yuor',
  'when': 'wehn',
  'there': 'tehre',
  'their': 'thier',
  'would': 'woudl',
  'could': 'coudl',
  'should': 'shoudl',
  'through': 'trhough',
  'because': 'becasue',
  'before': 'beofre',
  'after': 'aftre',
  'where': 'whree',
  'which': 'whihc',
  'between': 'betwene',
  'different': 'differnet',
  'important': 'importnat',
  'example': 'exmaple',
  'without': 'withuot',
  'another': 'antoher',
  'development': 'developement',
  'environment': 'enviroment',
  'government': 'goverment',
  'management': 'managment',
  'information': 'infromation',
  'available': 'availabe',
  'business': 'buisness',
  'complete': 'compelte',
  'language': 'langauge',
  'experience': 'experiance',
  'position': 'postion',
  'question': 'quesiton',
  'remember': 'remeber',
  'separate': 'seperate',
  'something': 'somehting',
  'together': 'togehter',
  'understand': 'udnerstand'
};

// Special characters that typically take longer to type
export const SPECIAL_CHARS = new Set([
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=',
  '[', ']', '{', '}', '\\', '|', ';', ':', "'", '"', ',', '.', '<', '>',
  '/', '?', '`', '~'
]);

// Characters requiring shift key (capital letters and symbols)
export const SHIFT_CHARS = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}',
  '|', ':', '"', '<', '>', '?', '~'
]);

// Number row characters (inherently more difficult)
export const NUMBER_CHARS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

// Symbol characters with their complexity levels (1 = simple, 3 = complex)
export const SYMBOL_COMPLEXITY: Record<string, number> = {
  // Simple punctuation
  '.': 1, ',': 1, '?': 1, '!': 1, ';': 1, ':': 1, "'": 1, '"': 1,
  
  // Medium complexity
  '-': 2, '_': 2, '(': 2, ')': 2, '[': 2, ']': 2, '/': 2,
  
  // Complex symbols requiring precise finger movement
  '@': 3, '#': 3, '$': 3, '%': 3, '^': 3, '&': 3, '*': 3,
  '+': 3, '=': 3, '{': 3, '}': 3, '\\': 3, '|': 3, '`': 3, '~': 3,
  '<': 3, '>': 3
};

// Punctuation that affects timing
export const SENTENCE_ENDINGS = new Set(['.', '!', '?']);
export const CLAUSE_SEPARATORS = new Set([',', ';', ':']);

// Line break characters
export const LINE_BREAK_CHARS = new Set(['\n', '\r\n', '\r']);

// Default configuration
export const DEFAULT_CONFIG: HumanLikeConfig = {
  speed: TIMING_CONSTANTS.BASE_SPEED,
  speedVariation: TIMING_CONSTANTS.SPEED_VARIATION,
  mistakeFrequency: BEHAVIOR_RATES.MISTAKE_FREQUENCY,
  mistakeTypes: {
    adjacent: true,
    random: false,
    doubleChar: true,
    commonTypos: true,
  },
  fatigueEffect: true,
  concentrationLapses: true,
  overcorrection: true,
  sentencePause: TIMING_CONSTANTS.SENTENCE_PAUSE,
  wordPause: TIMING_CONSTANTS.WORD_SPACE,
  thinkingPause: TIMING_CONSTANTS.THINKING_PAUSE,
  minCharDelay: TIMING_CONSTANTS.MIN_CHAR_DELAY,
  backspaceSpeed: TIMING_CONSTANTS.BACKSPACE_SPEED,
  realizationDelay: TIMING_CONSTANTS.REALIZATION_DELAY,
  correctionPause: TIMING_CONSTANTS.CORRECTION_PAUSE,
};

// Letter frequency in English (affects typing speed)
export const LETTER_FREQUENCY: Record<string, number> = {
  'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0, 'n': 6.7, 's': 6.3, 'h': 6.1,
  'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8, 'u': 2.8, 'm': 2.4, 'w': 2.4, 'f': 2.2,
  'g': 2.0, 'y': 2.0, 'p': 1.9, 'b': 1.3, 'v': 1.0, 'k': 0.8, 'j': 0.15, 'x': 0.15,
  'q': 0.10, 'z': 0.07
};

// Vowels are typically typed faster
export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Hand mapping for alternating hand sequences (affects rhythm)
export const LEFT_HAND_KEYS = new Set([
  'q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b',
  '1', '2', '3', '4', '5', '!', '@', '#', '$', '%'
]);

export const RIGHT_HAND_KEYS = new Set([
  'y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', ';', 'n', 'm', ',', '.', '/',
  '6', '7', '8', '9', '0', '^', '&', '*', '(', ')', '[', ']', "'", '"'
]);