# Human-Like

A sophisticated React typewriter effect library that simulates realistic human typing behavior with intelligent mistakes, natural timing patterns, and advanced correction mechanics.

Note: This library is built with [Claude Code](https://claude.ai/code) - AI-powered development assistant


## ✨ Features

- 🎯 **Realistic Human Typing**: QWERTY-based finger slips and natural timing variations
- 🧠 **Smart Word Recognition**: Faster typing for common words, slower for complex vocabulary
- ⚡ **Advanced Mistake System**: Adjacent key errors, common typos, and overcorrection
- 🔐 **Shift Key Hesitation**: Realistic delays for capital letters and symbols
- 🔢 **Number Row Difficulty**: Increased typing difficulty and error rates for numbers
- 🎛️ **Symbol Complexity**: Different delays for simple (.) vs complex (@#$%) symbols
- 👀 **Look-Ahead Typing**: Occasional mistakes when anticipating word endings
- 🎨 **Highly Configurable**: Fine-tune every aspect of the typing behavior
- 📱 **React Native Compatible**: Works seamlessly across platforms
- 🔧 **TypeScript Support**: Full type definitions included
- 🎮 **Rich API**: Complete control with events and lifecycle methods
- ✅ **React 19 Compatible**: Fully optimized for React 19 with proper externalization

## 📦 Installation

```bash
npm install @ertekinno/human-like
# or
yarn add @ertekinno/human-like
```

## 🚀 Quick Start

```jsx
import React from 'react';
import { HumanLike } from '@ertekinno/human-like';

function App() {
  return (
    <HumanLike
      text="Hello, world! This looks like real human typing."
      speed={80}
      mistakeFrequency={0.05}
      onComplete={() => console.log('Typing complete!')}
    />
  );
}
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | **required** | Text to be typed |
| `speed` | `number` | `80` | Base typing speed in milliseconds |
| `mistakeFrequency` | `number` | `0.03` | Probability of making mistakes (0-1) |
| `showCursor` | `boolean` | `true` | Show blinking cursor |
| `cursorChar` | `string` | `\|` | Cursor character (can be any string) |
| `cursorBlinkSpeed` | `number` | `530` | Cursor blink speed in milliseconds |
| `autoStart` | `boolean` | `true` | Start typing automatically |
| `config` | `Partial<HumanLikeConfig>` | `{}` | Advanced configuration options |
| `onStart` | `() => void` | - | Called when typing starts |
| `onComplete` | `() => void` | - | Called when typing completes |
| `onChar` | `(char: string) => void` | - | Called after each character |
| `onMistake` | `(mistake: MistakeInfo) => void` | - | Called when a mistake occurs |
| `onBackspace` | `() => void` | - | Called when backspacing |
| `className` | `string` | - | CSS class for styling |
| `style` | `React.CSSProperties` | - | Inline styles |

### Configuration Options

```tsx
interface HumanLikeConfig {
  // Timing Configuration
  speed: number;                    // Base speed (50-200ms)
  speedVariation: number;           // Random variation (±30ms)
  
  // Mistake Configuration
  mistakeFrequency: number;         // Overall mistake rate (0-0.15)
  mistakeTypes: {
    adjacent: boolean;              // QWERTY adjacent key mistakes
    random: boolean;                // Random character mistakes
    doubleChar: boolean;            // Accidental key repetition
    commonTypos: boolean;           // Real-world typo patterns
  };
  
  // Human Behavior
  fatigueEffect: boolean;           // Gradual slowdown over time
  concentrationLapses: boolean;     // Random thinking pauses
  overcorrection: boolean;          // Mistakes while fixing mistakes
  
  // Advanced Timing
  sentencePause: number;            // Pause after sentences (400-600ms)
  wordPause: number;                // Pause between words (120-180ms)
  thinkingPause: number;            // Pause before complex words (300-500ms)
}
```

## 🎮 Control Methods

```jsx
import { useHumanLike } from '@ertekinno/human-like';

function ControlledTyping() {
  const { 
    start, stop, pause, resume, skip, rewind, reset,
    isTyping, showCursor, cursorChar, cursorBlinkSpeed,
    setCursorVisible, setCursorChar, setCursorBlinkSpeed 
  } = useHumanLike({
    text: "Your text here",
    onComplete: () => console.log('Done!')
  });

  return (
    <div>
      {/* Typing Controls */}
      <div>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={stop}>Stop</button>
        <button onClick={skip}>Skip</button>
        <button onClick={rewind}>Rewind</button>
        <button onClick={reset}>Reset</button>
      </div>
      
      {/* Cursor Controls */}
      <div>
        <button onClick={() => setCursorVisible(!showCursor)}>
          {showCursor ? 'Hide' : 'Show'} Cursor
        </button>
        <button onClick={() => setCursorChar('█')}>Block</button>
        <button onClick={() => setCursorChar('_')}>Underscore</button>
        <button onClick={() => setCursorChar('|')}>Pipe</button>
        <button onClick={() => setCursorBlinkSpeed(300)}>Fast Blink</button>
        <button onClick={() => setCursorBlinkSpeed(1000)}>Slow Blink</button>
      </div>
      
      <p>Status: {isTyping ? 'Typing...' : 'Idle'}</p>
      <p>Cursor: {showCursor ? cursorChar : 'Hidden'} ({cursorBlinkSpeed}ms)</p>
    </div>
  );
}
```

## 🧬 Advanced Features

Human-Like goes beyond simple character-by-character typing to simulate authentic human behavior patterns. Every aspect of real typing has been carefully analyzed and implemented.

### 🎯 Realistic Keyboard Physics

**QWERTY-Based Mistakes**: Finger slips happen on adjacent keys based on actual keyboard layout. When you mistype 'w', you're more likely to hit 'q', 'e', 'a', 's', or 'd' - just like real typing mistakes.

**Hand Alternation**: Switching between left and right hands is naturally faster than consecutive fingers on the same hand. The library tracks hand usage and adjusts timing accordingly.

**Muscle Memory for Common Words**: Frequently used words like "the", "and", "for" are typed with practiced fluency, while uncommon or technical terms require more deliberate, slower typing.

### ⌨️ Advanced Input Simulation

**Smart Capital Letter Handling**: Distinguishes between using SHIFT for single capitals versus CAPS LOCK for longer sequences. Short sequences use SHIFT key timing (+100ms per letter), while 3+ consecutive capitals simulate turning CAPS LOCK on/off with appropriate delays.

**Number Row Complexity**: Numbers are inherently harder to type than letters, requiring users to look up from the home row. This adds 35ms delay and increases mistake probability by 50%.

**Symbol Difficulty Tiers**: Different symbols have varying complexity levels:
- Simple: `.`, `,`, `'` (minimal delay)
- Medium: `-`, `/`, `;` (moderate delay) 
- Complex: `@`, `#`, `$`, `%`, `^`, `&`, `*` (significant delay)

### 🧠 Human Psychology Patterns

**Concentration Lapses**: Random 300-500ms thinking pauses occur 3% of the time, simulating moments when the mind wanders or the typist needs to think about what to write next.

**Fatigue Accumulation**: Typing speed gradually decreases over time as fingers get tired and concentration wavers. This effect is subtle but creates more realistic long-form typing.

**Look-Ahead Typing**: 8% chance of anticipating common word endings (like "-ing", "-tion", "-ly") and making mistakes when jumping ahead too quickly.

**Burst Typing**: 15% chance of rapid-fire character sequences when the typist gets "in the zone" and their fingers move faster than usual.

### 🔧 Intelligent Error Correction

**Realistic Mistake Detection**: Errors aren't immediately noticed. There's a 150-450ms realization delay before corrections begin, just like real typing.

**Context-Aware Corrections**: The system tracks multiple mistakes and corrects them in natural order, sometimes making additional errors during the correction process (overcorrection).

**Backspace Patterns**: Variable correction speeds and hesitation patterns that mirror how people actually fix their mistakes - sometimes hesitating before hitting backspace, sometimes rapid-firing corrections.

### 📝 Contextual Timing Intelligence

**Punctuation Awareness**: Natural pauses after periods (500ms), commas (200ms), and other punctuation marks. Line breaks get longer pauses (800ms) as if pressing Enter.

**Word Boundary Logic**: Proper spacing between words with context-sensitive delays. Complex or unfamiliar upcoming words trigger longer thinking pauses.

**Sentence Structure Recognition**: Different timing patterns for sentence beginnings, middles, and endings, creating natural reading rhythm in the typing flow.

## 🎯 Technical Implementation

### Core Constants
```typescript
const TIMING_CONSTANTS = {
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
  
  // Enhanced Realism  
  SHIFT_HESITATION: 100,       // Extra delay for shift key usage
  CAPS_LOCK_ON_DELAY: 150,     // Delay when turning CAPS LOCK on
  CAPS_LOCK_OFF_DELAY: 100,    // Delay when turning CAPS LOCK off
  CAPS_SEQUENCE_THRESHOLD: 3,  // Min consecutive caps for CAPS LOCK mode
  NUMBER_ROW_PENALTY: 35,      // Extra delay for numbers
  SYMBOL_BASE_PENALTY: 25,     // Base delay for complex symbols
  LOOK_AHEAD_CHANCE: 0.08,     // 8% look-ahead typing chance
};

const BEHAVIOR_RATES = {
  MISTAKE_FREQUENCY: 0.03,     // 3% base mistake rate
  CONCENTRATION_LAPSE: 0.03,   // 3% random pause chance
  BURST_TYPING: 0.15,          // 15% rapid sequence chance
  FATIGUE_FACTOR: 0.0001,      // Gradual slowdown rate
};
```

### QWERTY Adjacent Keys Map
```typescript
const QWERTY_ADJACENT = {
  'q': ['w', 'a', 's'],
  'w': ['q', 'e', 'a', 's', 'd'],
  'e': ['w', 'r', 's', 'd', 'f'],
  // ... complete mapping for realistic finger slips
};
```

## 📱 Examples

### Basic Usage
```jsx
<HumanLike 
  text="Welcome to our website!" 
  speed={70}
  mistakeFrequency={0.05}
/>
```

### Advanced Configuration
```jsx
<HumanLike
  text="This is a complex sentence with punctuation, numbers like 123, and symbols!"
  config={{
    speed: 75,
    speedVariation: 35,
    mistakeFrequency: 0.04,
    mistakeTypes: {
      adjacent: true,
      random: false,
      doubleChar: true,
      commonTypos: true
    },
    fatigueEffect: true,
    concentrationLapses: true,
    overcorrection: true
  }}
  onStart={() => console.log('Started typing')}
  onMistake={(mistake) => console.log('Made mistake:', mistake)}
  onComplete={() => console.log('Finished typing')}
/>
```

### Hook Usage for Custom Components
```jsx
function CustomTypewriter() {
  const typewriter = useHumanLike({
    text: "Custom implementation with full control",
    speed: 80,
    autoStart: false,
    showCursor: true,
    cursorChar: '█',
    cursorBlinkSpeed: 800
  });

  return (
    <div>
      <div className="typewriter-display">
        {typewriter.displayText}
        {typewriter.showCursor && (
          <span className="cursor">{typewriter.cursorChar}</span>
        )}
      </div>
      
      <div className="controls">
        <button onClick={typewriter.start} disabled={typewriter.isTyping}>
          Start
        </button>
        <button onClick={typewriter.pause} disabled={!typewriter.isTyping}>
          Pause
        </button>
        <button onClick={typewriter.reset}>
          Reset
        </button>
      </div>
      
      <div className="cursor-controls">
        <button onClick={() => typewriter.setCursorVisible(!typewriter.showCursor)}>
          Toggle Cursor
        </button>
        <button onClick={() => typewriter.setCursorChar('▓')}>
          Block Cursor
        </button>
        <button onClick={() => typewriter.setCursorChar('_')}>
          Underscore Cursor
        </button>
        <button onClick={() => typewriter.setCursorBlinkSpeed(300)}>
          Fast Blink
        </button>
      </div>
      
      <div className="stats">
        Progress: {typewriter.progress}% | 
        WPM: {typewriter.currentWPM} |
        Mistakes: {typewriter.mistakeCount}
      </div>
    </div>
  );
}
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/ertekinno/human-like.git
cd human-like

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📊 Performance

- **Bundle Size**: ~7.3KB gzipped (significantly reduced in v1.0.2!)
- **Dependencies**: React 16.8+ (hooks support required)
- **React 19 Compatible**: Full support for React 19 with proper externalization
- **Performance**: Optimized for 60fps animations with requestAnimationFrame
- **Memory**: Minimal memory footprint with efficient cleanup
- **Enhanced Features**: Added shift hesitation, number difficulty, symbol complexity, look-ahead typing

## 📄 License

MIT © [ertekinno](https://github.com/ertekinno)