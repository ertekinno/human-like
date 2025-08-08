# 🚀 Human-Like

**Ultra-lightweight typewriter effect with realistic human typing behavior**

[![npm version](https://badge.fury.io/js/@ertekinno%2Fhuman-like.svg)](https://badge.fury.io/js/@ertekinno%2Fhuman-like)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-1.9KB-green.svg)](https://bundlephobia.com/package/@ertekinno/human-like)

## Introduction

### Overview

Human-Like is the most sophisticated React typewriter effect library that simulates realistic human typing behavior with actual keyboard sequences instead of artificial delays. With our new **modular architecture**, you get an ultra-lightweight core bundle (1.9KB) with optional keyboard visualization components.

#### Key Features

| Feature | Description |
|---------|-------------|
| 📦 **Ultra-lightweight** | Core bundle only 1.9KB (97% smaller than v2.0) |
| 🎯 **Modular Design** | Import keyboard components only when needed |
| ⌨️ **Real Keyboard Simulation** | Actual key sequences, not fake delays |
| 🧠 **Human-like Behavior** | Speed variation, realistic mistakes, corrections |
| 📱💻 **Platform-aware** | Different typing patterns for mobile vs desktop |
| 🎮 **Complete Control** | Start, pause, resume, reset with full state tracking |
| 🎨 **Advanced Theming** | Unstyled mode, CSS variables, class overrides |
| 📊 **100% Test Coverage** | Production-ready with comprehensive test suite |

#### Bundle Size Comparison

| Import Strategy | Bundle Size | Use Case |
|----------------|-------------|----------|
| **Core Only** | **1.9KB** gzipped | Pure typewriter effects, minimal footprint |
| **Core + Keyboard** | **54.9KB** gzipped | Interactive demos, tutorials, keyboard visualization |

#### What Makes It Different

| Traditional Libraries | Human-Like |
|----------------------|------------|
| `'H' → (150ms) → 'e' → (80ms) → 'l'` | `'H' → [Shift(80ms) + h(80ms)] → 'e' → [e(75ms)]` |
| Artificial character delays | Real keyboard sequences |
| Same behavior on all platforms | Platform-specific mobile/desktop behavior |
| Generic mistake patterns | Touch-based vs QWERTY-based errors |

### Installation

```bash
# NPM
npm install @ertekinno/human-like

# Yarn
yarn add @ertekinno/human-like

# PNPM
pnpm add @ertekinno/human-like
```

#### Import Strategies

```javascript
// Core typewriter functionality only (1.9KB)
import { HumanLike, useHumanLike } from '@ertekinno/human-like'

// Optional keyboard components (+53KB when needed)
import { 
  MobileKeyboard, 
  DesktopKeyboard,
  KeyPressIndicator,
  KeyboardSimulationDemo 
} from '@ertekinno/human-like/keyboard'

// CSS imports (optional)
import '@ertekinno/human-like/src/styles/MobileKeyboardStyle.css'
import '@ertekinno/human-like/src/styles/DesktopKeyboardStyle.css'
```

## Usage

### Getting Started with Human-Like

#### Basic Example (Component)

```jsx
import React from 'react'
import { HumanLike } from '@ertekinno/human-like'

function App() {
  return (
    <div>
      <HumanLike
        text="Hello, this types like a real human!"
        speed={80}
        mistakeFrequency={0.02}
        keyboardMode="mobile"
        onComplete={() => console.log('Typing completed!')}
      />
    </div>
  )
}
```

#### Basic Example (Hook)

```jsx
import React from 'react'
import { useHumanLike } from '@ertekinno/human-like'

function App() {
  const { displayText, start, isTyping } = useHumanLike({
    text: "Hello, this types like a real human!",
    speed: 80,
    mistakeFrequency: 0.02,
    autoStart: false
  })

  return (
    <div>
      <p>{displayText}</p>
      <button onClick={start} disabled={isTyping}>
        {isTyping ? 'Typing...' : 'Start Typing'}
      </button>
    </div>
  )
}
```

#### With Keyboard Visualization

```jsx
import React, { useState } from 'react'
import { useHumanLike } from '@ertekinno/human-like'
import { MobileKeyboard, KeyboardView, ShiftState } from '@ertekinno/human-like/keyboard'
import '@ertekinno/human-like/src/styles/MobileKeyboardStyle.css'

function AppWithKeyboard() {
  const [currentView, setCurrentView] = useState(KeyboardView.Letters)
  const [shiftState, setShiftState] = useState(ShiftState.Off)

  const { displayText, start, isTyping } = useHumanLike({
    text: "Watch the keyboard light up as I type!",
    keyboardMode: 'mobile',
    onKey: (keyInfo) => console.log(`Key pressed: ${keyInfo.key}`)
  })

  return (
    <div>
      <div className="typing-display">{displayText}</div>
      
      <MobileKeyboard
        currentView={currentView}
        shiftState={shiftState}
        onViewChange={(e) => setCurrentView(e.currentView)}
        onShiftStateChange={(e) => setShiftState(e.currentState)}
        showTitle={true}
        title="Interactive Demo"
      />
      
      <button onClick={start} disabled={isTyping}>
        {isTyping ? 'Typing...' : 'Start Demo'}
      </button>
    </div>
  )
}
```

### Component Usage

The `HumanLike` component provides a declarative way to add typewriter effects:

```jsx
<HumanLike
  text="Your text here"
  speed={80}
  mistakeFrequency={0.03}
  keyboardMode="mobile"
  showCursor={true}
  cursorChar="|"
  autoStart={true}
  className="my-typewriter"
  onStart={() => console.log('Started')}
  onComplete={() => console.log('Completed')}
  onChar={(char, index) => console.log(`Typed: ${char} at ${index}`)}
/>
```

### Hook Usage

The `useHumanLike` hook provides full programmatic control:

```jsx
const {
  // State
  displayText, isTyping, isPaused, isCompleted, progress, currentWPM,
  
  // Controls
  start, stop, pause, resume, reset, skip,
  
  // Cursor
  showCursor, cursorChar, setCursorVisible, setCursorChar
} = useHumanLike({
  text: "Your text here",
  speed: 80,
  mistakeFrequency: 0.03,
  config: {
    // Advanced configuration
  }
})
```

## API Reference

### Component API

Complete `HumanLike` component props reference:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **Core Props** |
| `text` | `string` | **required** | Text to type with keyboard simulation |
| `speed` | `number` | `80` | Base typing speed in milliseconds (20-500) |
| `mistakeFrequency` | `number` | `0.03` | Probability of making mistakes (0-0.15) |
| `keyboardMode` | `'mobile' \| 'desktop'` | `'mobile'` | Platform for keyboard simulation and mistake patterns |
| **Cursor Control** |
| `showCursor` | `boolean` | `true` | Show blinking cursor during typing |
| `cursorChar` | `string` | `\|` | Character to use for cursor (can be any string) |
| `cursorBlinkSpeed` | `number` | `530` | Cursor blink interval in milliseconds |
| **Lifecycle Control** |
| `autoStart` | `boolean` | `true` | Start typing automatically when component mounts |
| `id` | `string` | `undefined` | Unique identifier for tracking multiple instances |
| **Styling** |
| `className` | `string` | `undefined` | CSS class for styling the component |
| `style` | `React.CSSProperties` | `undefined` | Inline styles for the component |
| **Advanced Configuration** |
| `config` | `Partial<HumanLikeConfig>` | `{}` | Advanced configuration options (see below) |
| **Event Callbacks** |
| `onStart` | `(id?: string) => void` | `undefined` | Called when typing starts |
| `onComplete` | `(id?: string) => void` | `undefined` | Called when typing completes |
| `onChar` | `(char: string, index: number, id?: string) => void` | `undefined` | Called after each character is typed |
| `onMistake` | `(mistake: MistakeInfo, id?: string) => void` | `undefined` | Called when a mistake is made |
| `onBackspace` | `(id?: string) => void` | `undefined` | Called when backspacing during corrections |
| `onPause` | `(id?: string) => void` | `undefined` | Called when typing is paused |
| `onResume` | `(id?: string) => void` | `undefined` | Called when typing is resumed |
| `onKey` | `(keyInfo: KeyInfo, id?: string) => void` | `undefined` | Called for each key press in the sequence |

### Hook API

Complete `useHumanLike` hook return values:

| Property | Type | Description |
|----------|------|-------------|
| **State Information** |
| `displayText` | `string` | Current text being displayed as typing progresses |
| `isTyping` | `boolean` | Whether the typewriter is currently active |
| `isPaused` | `boolean` | Whether the typewriter is currently paused |
| `isCompleted` | `boolean` | Whether typing has finished completely |
| `currentState` | `TypingState` | Current state: `'idle'` \| `'typing'` \| `'paused'` \| `'correcting'` \| `'thinking'` \| `'completed'` |
| `progress` | `number` | Typing progress as percentage (0-100) |
| `currentWPM` | `number` | Current words per minute typing speed |
| `mistakeCount` | `number` | Total number of mistakes made during typing |
| `totalDuration` | `number` | Total duration in milliseconds for the entire typing effect |
| **Cursor Properties** |
| `showCursor` | `boolean` | Whether the cursor is currently visible |
| `cursorChar` | `string` | Current cursor character |
| `cursorBlinkSpeed` | `number` | Current cursor blink speed in milliseconds |
| **Control Methods** |
| `start()` | `() => void` | Start typing from current position |
| `stop()` | `() => void` | Stop typing and reset to beginning |
| `pause()` | `() => void` | Pause typing at current position |
| `resume()` | `() => void` | Resume typing from paused position |
| `skip()` | `() => void` | Skip to end and show complete text immediately |
| `reset()` | `() => void` | Reset typing to beginning |
| `rewind()` | `() => void` | Alias for `reset()` - rewind to beginning |
| **Cursor Control Methods** |
| `setCursorVisible(visible: boolean)` | `(boolean) => void` | Show/hide the cursor |
| `setCursorChar(char: string)` | `(string) => void` | Change cursor character |
| `setCursorBlinkSpeed(speed: number)` | `(number) => void` | Change cursor blink speed |

#### Hook Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | **required** | Text to type |
| `speed` | `number` | `80` | Base typing speed |
| `mistakeFrequency` | `number` | `0.03` | Mistake probability |
| `keyboardMode` | `'mobile' \| 'desktop'` | `'mobile'` | Platform mode |
| `autoStart` | `boolean` | `true` | Start automatically |
| `showCursor` | `boolean` | `true` | Show cursor |
| `cursorChar` | `string` | `\|` | Cursor character |
| `cursorBlinkSpeed` | `number` | `530` | Cursor blink speed |
| `id` | `string` | `undefined` | Instance identifier |
| `config` | `Partial<HumanLikeConfig>` | `{}` | Advanced config |
| `onStart` | `(id?: string) => void` | `undefined` | Start callback |
| `onComplete` | `(id?: string) => void` | `undefined` | Complete callback |
| `onChar` | `(char: string, index: number, id?: string) => void` | `undefined` | Character callback |
| `onMistake` | `(mistake: MistakeInfo, id?: string) => void` | `undefined` | Mistake callback |
| `onBackspace` | `(id?: string) => void` | `undefined` | Backspace callback |
| `onPause` | `(id?: string) => void` | `undefined` | Pause callback |
| `onResume` | `(id?: string) => void` | `undefined` | Resume callback |
| `onKey` | `(keyInfo: KeyInfo, id?: string) => void` | `undefined` | Key press callback |

### Advanced Configuration

The `config` object allows fine-tuning of typing behavior:

```typescript
interface HumanLikeConfig {
  // Core Timing Settings
  speed: number                    // Base typing speed (20-500ms)
  speedVariation: number           // Random timing variation (±ms)
  keyboardMode: 'mobile' | 'desktop'
  
  // Mistake System
  mistakeFrequency: number         // Overall mistake probability (0-0.15)
  mistakeTypes: {
    adjacent: boolean              // Adjacent key mistakes (platform-specific)
    random: boolean                // Random character mistakes
    doubleChar: boolean            // Accidental character repetition
    commonTypos: boolean           // Real-world typo patterns
  }
  
  // Human Behavior Simulation
  fatigueEffect: boolean           // Gradual slowdown over time
  concentrationLapses: boolean     // Random thinking pauses
  overcorrection: boolean          // Mistakes while correcting mistakes
  
  // Advanced Timing Controls
  sentencePause: number            // Pause after sentences (400-600ms)
  wordPause: number                // Pause between words (120-180ms)
  thinkingPause: number            // Pause before complex words (300-500ms)
  minCharDelay: number             // Minimum delay between characters
  backspaceSpeed: number           // Speed of corrections (40-80ms)
  realizationDelay: number         // Time to notice mistake (150-450ms)
  correctionPause: number          // Pause before retyping (200-300ms)
  
  // Debug and Development
  debug: boolean                   // Enable detailed console logging
  
  // Callbacks
  onKey?: (keyInfo: KeyInfo) => void  // Real-time key press events
}
```

#### Configuration Examples

```typescript
// Professional fast typist
const professionalConfig = {
  speed: 30,
  mistakeFrequency: 0.01,
  fatigueEffect: false,
  concentrationLapses: false
}

// Average casual user
const casualConfig = {
  speed: 80,
  mistakeFrequency: 0.03,
  fatigueEffect: true,
  concentrationLapses: true
}

// Beginner hunt-and-peck
const beginnerConfig = {
  speed: 300,
  mistakeFrequency: 0.08,
  thinkingPause: 800,
  realizationDelay: 600
}

// Mobile-optimized
const mobileConfig = {
  keyboardMode: 'mobile',
  mistakeFrequency: 0.04, // Higher due to touch
  mistakeTypes: {
    adjacent: true,       // Fat-finger errors
    doubleChar: true,     // Touch sensitivity
    commonTypos: false    // Less relevant for mobile
  }
}
```

### Events

Human-Like provides comprehensive event callbacks for tracking typing behavior:

#### Event Types

| Event | Parameters | Description |
|-------|------------|-------------|
| `onStart` | `(id?: string)` | Typing animation has started |
| `onComplete` | `(id?: string)` | Typing animation has completed |
| `onChar` | `(char: string, index: number, id?: string)` | A character has been successfully typed |
| `onMistake` | `(mistake: MistakeInfo, id?: string)` | A mistake has been made |
| `onBackspace` | `(id?: string)` | Backspacing during error correction |
| `onPause` | `(id?: string)` | Typing has been paused |
| `onResume` | `(id?: string)` | Typing has been resumed |
| `onKey` | `(keyInfo: KeyInfo, id?: string)` | Individual key press in sequence |

#### Event Examples

```jsx
<HumanLike
  text="Watch these events!"
  onStart={(id) => console.log('Started typing:', id)}
  onChar={(char, index, id) => {
    console.log(`Character "${char}" typed at position ${index}`)
    // Update progress bar, highlight text, etc.
  }}
  onMistake={(mistake, id) => {
    console.log(`Mistake: typed "${mistake.typed}" instead of "${mistake.intended}"`)
    // Track error analytics, show corrections, etc.
  }}
  onKey={(keyInfo, id) => {
    console.log(`Key: ${keyInfo.key} (${keyInfo.type}) - ${keyInfo.duration}ms`)
    // Update keyboard visualization, play sounds, etc.
  }}
  onComplete={(id) => {
    console.log('Typing completed!')
    // Show next content, trigger animations, etc.
  }}
/>
```

### Types and Interfaces

#### Core Types

```typescript
// Main hook return type
interface HumanLikeHookReturn {
  displayText: string
  isTyping: boolean
  isPaused: boolean
  isCompleted: boolean
  currentState: TypingState
  progress: number
  currentWPM: number
  mistakeCount: number
  totalDuration: number
  showCursor: boolean
  cursorChar: string
  cursorBlinkSpeed: number
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  reset: () => void
  rewind: () => void
  setCursorVisible: (visible: boolean) => void
  setCursorChar: (char: string) => void
  setCursorBlinkSpeed: (speed: number) => void
}

// Component props type
interface HumanLikeProps {
  text: string
  speed?: number
  mistakeFrequency?: number
  keyboardMode?: 'mobile' | 'desktop'
  showCursor?: boolean
  cursorChar?: string
  cursorBlinkSpeed?: number
  autoStart?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
  config?: Partial<HumanLikeConfig>
  onStart?: (id?: string) => void
  onComplete?: (id?: string) => void
  onChar?: (char: string, index: number, id?: string) => void
  onMistake?: (mistake: MistakeInfo, id?: string) => void
  onBackspace?: (id?: string) => void
  onPause?: (id?: string) => void
  onResume?: (id?: string) => void
  onKey?: (keyInfo: KeyInfo, id?: string) => void
}
```

#### State and Event Types

```typescript
// Typing states
type TypingState = 'idle' | 'typing' | 'paused' | 'correcting' | 'thinking' | 'completed'

// Mistake information
interface MistakeInfo {
  type: MistakeType
  intended: string
  typed: string
  position: number
  correctionDelay: number
}

type MistakeType = 'adjacent' | 'random' | 'doubleChar' | 'commonTypo'

// Key press information
interface KeyInfo {
  key: string              // Physical key: 'h', 'shift', '123', 'CAPS'
  character: string        // Target character: 'H', '@', '4'
  type: KeyType           // Key category
  keyboardView: KeyboardView  // Current keyboard view
  isCapsLock: boolean     // Whether this uses CAPS LOCK
  duration: number        // Key press duration (speed-adjusted)
  sequenceIndex: number   // Position in key sequence (0-based)
  sequenceLength: number  // Total keys needed for this character
}

type KeyType = 'letter' | 'number' | 'symbol' | 'modifier' | 'view-switch'
type KeyboardView = 'letters' | 'numbers' | 'symbols'
```

#### Keyboard Component Types (Optional Import)

```typescript
// Available when importing from '@ertekinno/human-like/keyboard'

// Mobile keyboard props
interface MobileKeyboardProps {
  currentView?: KeyboardView
  shiftState?: ShiftState
  highlightedKeys?: string[]
  onViewChange?: (event: ViewChangeEvent) => void
  onShiftStateChange?: (event: ShiftChangeEvent) => void
  showTitle?: boolean
  title?: string
  unstyled?: boolean
  keyboardClasses?: KeyboardClasses
  labelOverrides?: LabelOverrides
  iconOverrides?: IconOverrides
}

// Desktop keyboard props  
interface DesktopKeyboardProps {
  highlightedKeys?: string[]
  showTitle?: boolean
  title?: string
  theme?: 'light' | 'dark'
  unstyled?: boolean
  keyboardClasses?: KeyboardClasses
}

// Enums
enum ShiftState {
  Off = 'off',
  On = 'on', 
  Caps = 'caps'
}

enum KeyboardView {
  Letters = 'letters',
  Numbers = 'numbers', 
  Symbols = 'symbols'
}
```

#### Event Types (Keyboard Components)

```typescript
interface ViewChangeEvent {
  previousView: KeyboardView
  currentView: KeyboardView
  timestamp: number
}

interface ShiftChangeEvent {
  previousState: ShiftState
  currentState: ShiftState
  timestamp: number
}

interface KeyPressEvent {
  key: string
  keyType: KeyType
  timestamp: number
}
```

#### Customization Types

```typescript
// CSS class overrides
interface KeyboardClasses {
  keyboard?: string
  row?: string
  key?: string
  keyPressed?: string
  keyLetter?: string
  keyNumber?: string
  keySymbol?: string
  keyModifier?: string
  keySpace?: string
  keyShift?: string
  keyCaps?: string
  keyBackspace?: string
  keyReturn?: string
  title?: string
}

// Label customization
interface LabelOverrides {
  space?: string
  return?: string
  backspace?: string
  shift?: string
  caps?: string
  numbers?: string
  symbols?: string
  letters?: string
}

// Icon customization
interface IconOverrides {
  backspace?: React.ReactNode
  return?: React.ReactNode
  shift?: React.ReactNode
  caps?: React.ReactNode
}
```

---

## 🚀 Performance

- **Core bundle**: 1.9KB gzipped (essentials only)
- **Keyboard module**: +53KB gzipped (when needed) 
- **Runtime**: 60fps with requestAnimationFrame
- **Memory**: Zero leaks, efficient cleanup
- **Compatibility**: React 16.8+ (hooks required)

## 🔧 Development

```bash
# Clone and setup
git clone https://github.com/ertekinno/human-like.git
cd human-like && npm install

# Development
npm run dev        # Live demo with keyboard visualization
npm run build      # Production build  
npm test          # Full test suite (190 tests)
npm run typecheck  # TypeScript validation
```

## 📄 License

MIT © [ertekinno](https://github.com/ertekinno)