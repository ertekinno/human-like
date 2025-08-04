import type {
  HumanLikeConfig,
  MistakeInfo,
  MistakeType,
  TypingState,
  TypingEvent,
  TypingStats
} from '../types';
import {
  TIMING_CONSTANTS,
  BEHAVIOR_RATES,
  QWERTY_ADJACENT,
  COMMON_WORDS,
  COMMON_TYPOS,
  SPECIAL_CHARS,
  SHIFT_CHARS,
  NUMBER_CHARS,
  SYMBOL_COMPLEXITY,
  SENTENCE_ENDINGS,
  CLAUSE_SEPARATORS,
  LINE_BREAK_CHARS,
  LETTER_FREQUENCY,
  VOWELS,
  LEFT_HAND_KEYS,
  DEFAULT_CONFIG
} from '../constants';

export class TypingEngine {
  private config: HumanLikeConfig;
  private text: string;
  private currentIndex: number = 0;
  private displayText: string = '';
  private state: TypingState = 'idle';
  private timeoutId: number | null = null;
  private stats: TypingStats;
  private events: TypingEvent[] = [];
  private mistakes: MistakeInfo[] = [];
  private correctionQueue: MistakeInfo[] = [];
  private isCorrectingMistake: boolean = false;
  private charactersTyped: number = 0;
  private fatigueLevel: number = 0;
  private lastHandUsed: 'left' | 'right' | null = null;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  
  // Event callbacks
  private onStateChange?: (state: TypingState) => void;
  private onCharacter?: (char: string, index: number) => void;
  private onMistake?: (mistake: MistakeInfo) => void;
  private onBackspace?: () => void;
  private onComplete?: () => void;
  private onProgress?: (progress: number) => void;

  constructor(text: string, config: Partial<HumanLikeConfig> = {}) {
    this.text = text ?? ''; // Handle null/undefined text
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.initializeStats();
  }

  private debug(...args: any[]): void {
    if (this.config.debug) {
      console.log(...args);
    }
  }

  private safeCallback(callback: Function | undefined, ...args: any[]): void {
    if (callback) {
      try {
        callback(...args);
      } catch (error) {
        if (this.config.debug) {
          console.warn('Callback error:', error);
        }
        // Continue execution without crashing
      }
    }
  }

  private initializeStats(): TypingStats {
    return {
      totalCharacters: this.text.length,
      charactersTyped: 0,
      mistakesMade: 0,
      mistakesCorrected: 0,
      startTime: 0,
      currentWPM: 0,
      averageCharDelay: 0,
      totalDuration: 0
    };
  }

  public start(): void {
    if (this.state === 'typing' || this.state === 'correcting') return;
    
    this.state = 'typing';
    const now = Date.now();
    
    if (this.stats.startTime === 0) {
      this.stats.startTime = now;
    }
    
    this.safeCallback(this.onStateChange, 'typing');
    this.scheduleNextCharacter();
  }

  public stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    // Cancel all pending corrections
    for (const mistake of this.mistakes) {
      if (!mistake.corrected) {
        mistake.corrected = true; // Mark as handled to prevent further correction attempts
      }
    }
    this.correctionQueue = [];
    this.isCorrectingMistake = false;
    this.state = 'idle';
    this.safeCallback(this.onStateChange, 'idle');
  }

  public pause(): void {
    if (this.state === 'typing' || this.state === 'correcting') {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.pauseStartTime = Date.now();
      this.state = 'paused';
      this.safeCallback(this.onStateChange, 'paused');
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      if (this.pauseStartTime > 0) {
        this.totalPausedTime += Date.now() - this.pauseStartTime;
        this.pauseStartTime = 0;
      }
      this.state = 'typing';
      this.safeCallback(this.onStateChange, 'typing');
      this.scheduleNextCharacter();
    }
  }

  public skip(): void {
    this.currentIndex = this.text.length;
    this.displayText = this.text;
    this.state = 'completed';
    this.stats.endTime = Date.now();
    this.safeCallback(this.onStateChange, 'completed');
    this.safeCallback(this.onComplete);
  }

  public reset(): void {
    this.stop();
    this.currentIndex = 0;
    this.displayText = '';
    this.charactersTyped = 0;
    this.fatigueLevel = 0;
    this.lastHandUsed = null;
    this.mistakes = [];
    this.correctionQueue = [];
    this.isCorrectingMistake = false;
    this.events = [];
    this.pauseStartTime = 0;
    this.totalPausedTime = 0;
    this.stats = this.initializeStats();
    this.state = 'idle';
    this.safeCallback(this.onStateChange, 'idle');
  }

  private scheduleNextCharacter(): void {
    // Handle empty text case
    if (this.text.length === 0) {
      this.completeTyping();
      return;
    }
    
    if (this.currentIndex >= this.text.length) {
      // Don't immediately complete if we have pending corrections
      const hasUncorrectedMistakes = this.mistakes.some(m => !m.corrected);
      const hasPendingCorrections = this.correctionQueue.length > 0;
      
      if (hasUncorrectedMistakes || hasPendingCorrections) {
        this.debug(`📝 Reached end but have ${this.mistakes.filter(m => !m.corrected).length} uncorrected mistakes and ${this.correctionQueue.length} queued corrections`);
        // Process corrections first before completing
        this.processNextCorrection();
        return;
      }
      
      this.completeTyping();
      return;
    }

    const char = this.text[this.currentIndex];
    const delay = this.calculateCharacterDelay(char);
    
    // Check for concentration lapses
    if (this.shouldHaveConcentrationLapse()) {
      this.state = 'thinking';
      this.safeCallback(this.onStateChange, 'thinking');
      this.timeoutId = window.setTimeout(() => {
        this.state = 'typing';
        this.safeCallback(this.onStateChange, 'typing');
        this.scheduleNextCharacter();
      }, TIMING_CONSTANTS.CONCENTRATION_PAUSE);
      return;
    }

    // Check if we should make a mistake
    const shouldMakeMistake = this.shouldMakeMistake(char);
    
    // For significant delays (>200ms), show thinking state during the pause
    const isSignificantPause = delay > 200;
    
    // Use requestAnimationFrame for better performance on fast typing
    if (delay < 30) {
      requestAnimationFrame(() => {
        if (shouldMakeMistake) {
          this.makeMistake(char);
        } else {
          this.typeCharacter(char);
        }
      });
    } else if (isSignificantPause) {
      // Set thinking state for longer pauses (sentence, word, thinking pauses)
      this.state = 'thinking';
      this.safeCallback(this.onStateChange, 'thinking');
      
      this.timeoutId = window.setTimeout(() => {
        // Return to typing state before actually typing
        this.state = 'typing';
        this.safeCallback(this.onStateChange, 'typing');
        
        if (shouldMakeMistake) {
          this.makeMistake(char);
        } else {
          this.typeCharacter(char);
        }
      }, delay);
    } else {
      // Normal delay without state change
      this.timeoutId = window.setTimeout(() => {
        if (shouldMakeMistake) {
          this.makeMistake(char);
        } else {
          this.typeCharacter(char);
        }
      }, delay);
    }
  }

  private calculateCharacterDelay(char: string): number {
    let baseDelay = this.config.speed;
    
    // Apply speed variation
    const variation = (Math.random() - 0.5) * 2 * this.config.speedVariation;
    baseDelay += variation;
    
    // 1. CAPS LOCK vs SHIFT KEY LOGIC - Smart detection for capital letters
    if (char.match(/[A-Z]/)) {
      const capsInfo = this.getCapsLockInfo(this.currentIndex);
      
      if (capsInfo.isCapsLockSequence) {
        // CAPS LOCK mode: Only first and last letters get delays
        if (capsInfo.isFirst) {
          baseDelay += TIMING_CONSTANTS.CAPS_LOCK_ON_DELAY; // Press CAPS LOCK + type letter
          this.debug(`🔠 CAPS LOCK ON: "${char}" gets +${TIMING_CONSTANTS.CAPS_LOCK_ON_DELAY}ms`);
        } else if (capsInfo.isLast) {
          baseDelay += TIMING_CONSTANTS.CAPS_LOCK_OFF_DELAY; // Type letter + turn off CAPS LOCK
          this.debug(`🔡 CAPS LOCK OFF: "${char}" gets +${TIMING_CONSTANTS.CAPS_LOCK_OFF_DELAY}ms`);
        } else {
          // Middle of CAPS LOCK sequence - normal speed
          this.debug(`🔠 CAPS LOCK MIDDLE: "${char}" normal speed`);
        }
      } else {
        // Single capital or short sequence - use SHIFT
        baseDelay += TIMING_CONSTANTS.SHIFT_HESITATION;
        this.debug(`⇧ SHIFT: "${char}" gets +${TIMING_CONSTANTS.SHIFT_HESITATION}ms`);
      }
    } else if (SHIFT_CHARS.has(char)) {
      // Non-letter symbols requiring shift
      baseDelay += TIMING_CONSTANTS.SHIFT_HESITATION;
    }
    
    // 2. NUMBER ROW DIFFICULTY - Numbers are inherently harder
    if (NUMBER_CHARS.has(char)) {
      baseDelay += TIMING_CONSTANTS.NUMBER_ROW_PENALTY;
      // Numbers have higher mistake rate (handled in shouldMakeMistake)
    }
    
    // 3. SYMBOL COMPLEXITY - Different symbols have different difficulty levels
    if (SYMBOL_COMPLEXITY[char]) {
      const complexityLevel = SYMBOL_COMPLEXITY[char];
      baseDelay += TIMING_CONSTANTS.SYMBOL_BASE_PENALTY * complexityLevel;
    }
    
    // Existing character type adjustments
    if (SPECIAL_CHARS.has(char)) {
      baseDelay *= 1.2; // Reduced from 1.5 since we have specific symbol handling now
    } else if (VOWELS.has(char.toLowerCase())) {
      baseDelay *= 0.9; // Vowels are faster
    }
    
    // Adjust for letter frequency
    const frequency = LETTER_FREQUENCY[char.toLowerCase()] || 1;
    baseDelay *= Math.max(0.7, 1 - (frequency / 100)); // More frequent letters are faster
    
    // Check for hand alternation
    const currentHand = this.getCurrentHand(char);
    if (this.lastHandUsed && currentHand !== this.lastHandUsed) {
      baseDelay *= 0.85; // Alternating hands is faster
    }
    this.lastHandUsed = currentHand;
    
    // Apply fatigue
    if (this.config.fatigueEffect) {
      baseDelay += this.fatigueLevel;
      this.fatigueLevel += TIMING_CONSTANTS.FATIGUE_INCREMENT;
    }
    
    // Check for burst typing
    if (Math.random() < BEHAVIOR_RATES.BURST_TYPING) {
      baseDelay *= TIMING_CONSTANTS.BURST_SPEED_MULTIPLIER;
    }
    
    // Add pauses for punctuation and line breaks
    if (SENTENCE_ENDINGS.has(char)) {
      baseDelay += this.config.sentencePause;
    } else if (CLAUSE_SEPARATORS.has(char)) {
      baseDelay += TIMING_CONSTANTS.COMMA_PAUSE;
    } else if (LINE_BREAK_CHARS.has(char)) {
      // Line breaks get a longer pause (like pressing Enter)
      baseDelay += TIMING_CONSTANTS.LINE_BREAK;
    } else if (char === ' ') {
      baseDelay += this.config.wordPause;
      
      // Check if next word is complex (should add thinking pause)
      const nextWord = this.getNextWord();
      if (nextWord && this.isComplexWord(nextWord)) {
        baseDelay += this.config.thinkingPause;
      }
    }
    
    return Math.max(this.config.minCharDelay, baseDelay);
  }

  private shouldMakeMistake(char: string): boolean {
    // Don't make mistakes on spaces, line breaks, or at the beginning
    if (char === ' ' || LINE_BREAK_CHARS.has(char) || this.currentIndex === 0) return false;
    
    let mistakeChance = this.config.mistakeFrequency;
    
    // 2. NUMBER ROW DIFFICULTY - Numbers have higher mistake rate
    if (NUMBER_CHARS.has(char)) {
      mistakeChance *= 1.5; // 50% higher mistake rate for numbers
    }
    
    // Shift characters are slightly more error-prone
    if (SHIFT_CHARS.has(char)) {
      mistakeChance *= 1.2; // 20% higher mistake rate for shift characters
    }
    
    // Complex symbols have higher mistake rates
    if (SYMBOL_COMPLEXITY[char] && SYMBOL_COMPLEXITY[char] >= 3) {
      mistakeChance *= 1.3; // 30% higher mistake rate for complex symbols
    }
    
    // Reduce mistake frequency for simple punctuation to avoid too many errors
    if (SPECIAL_CHARS.has(char) && (!SYMBOL_COMPLEXITY[char] || SYMBOL_COMPLEXITY[char] === 1)) {
      mistakeChance *= 0.5;
    }
    
    // 6. LOOK-AHEAD TYPING - Sometimes type ahead and make mistakes
    if (this.shouldMakeLookAheadMistake()) {
      mistakeChance *= 2; // Double chance when typing ahead
    }
    
    return Math.random() < mistakeChance;
  }

  private makeMistake(originalChar: string): void {
    const mistakeType = this.selectMistakeType(originalChar);
    const mistakeChar = this.generateMistakeChar(originalChar, mistakeType);
    
    if (!mistakeChar) {
      // Fallback to typing correctly if no mistake could be generated
      this.typeCharacter(originalChar);
      return;
    }
    
    const mistake: MistakeInfo = {
      type: mistakeType,
      originalChar,
      mistakeChar,
      position: this.currentIndex,
      corrected: false,
      realizationTime: this.config.realizationDelay + (Math.random() * 150)
    };
    
    this.mistakes.push(mistake);
    this.stats.mistakesMade++;
    
    this.debug(`🔴 MISTAKE: "${originalChar}" → "${mistakeChar}" (${mistakeType}) at pos ${this.currentIndex}`);
    
    // Type the mistake
    this.displayText += mistakeChar;
    this.currentIndex++;
    this.charactersTyped++;
    
    this.recordEvent({
      type: 'mistake',
      position: mistake.position,
      timestamp: Date.now(),
      char: mistakeChar,
      mistake
    });
    
    this.safeCallback(this.onCharacter, mistakeChar, this.currentIndex - mistakeChar.length);
    this.safeCallback(this.onMistake, mistake);
    this.updateProgress();
    
    // Add to correction queue instead of scheduling immediately
    const realizationTime = Math.max(mistake.realizationTime, 200);
    this.debug(`📝 Adding "${mistakeChar}" to correction queue (will correct in ${realizationTime}ms)`);
    
    this.timeoutId = window.setTimeout(() => {
      if (!mistake.corrected) {
        this.correctionQueue.push(mistake);
        this.processNextCorrection();
      }
    }, realizationTime);
  }

  private processNextCorrection(): void {
    // If already correcting or no corrections queued, return
    if (this.isCorrectingMistake || this.correctionQueue.length === 0) {
      return;
    }

    // Get the most recent mistake to correct first (LIFO for natural correction behavior)
    const mistake = this.correctionQueue.pop()!;
    
    if (mistake.corrected) {
      // Already corrected, process next
      this.processNextCorrection();
      return;
    }

    this.debug(`🔧 Processing correction for "${mistake.mistakeChar}" → "${mistake.originalChar}"`);
    this.correctMistake(mistake);
  }

  private correctMistake(mistake: MistakeInfo): void {
    this.isCorrectingMistake = true;
    this.state = 'correcting';
    this.safeCallback(this.onStateChange, 'correcting');
    
    this.debug(`🔧 Correcting mistake: "${mistake.mistakeChar}" → should be "${mistake.originalChar}"`);
    this.debug(`📍 Current text: "${this.displayText}", current position: ${this.currentIndex}, mistake position: ${mistake.position}`);
    
    // Calculate exactly where we need to backspace to
    const targetPosition = mistake.position;
    const currentTextLength = this.displayText.length;
    const charsToDelete = currentTextLength - targetPosition;
    
    this.debug(`🔄 Need to delete ${charsToDelete} chars to get back to position ${targetPosition}`);
    
    if (charsToDelete <= 0) {
      // Already at or past the correct position, just mark as corrected and continue
      this.debug(`⚠️ Already at correct position, marking as corrected`);
      this.finishCorrection(mistake);
      return;
    }
    
    this.performBackspaceSequence(mistake, charsToDelete, targetPosition);
  }

  private performBackspaceSequence(mistake: MistakeInfo, charsToDelete: number, targetPosition: number): void {
    let deletedCount = 0;
    const backspaceDelay = this.config.backspaceSpeed;
    
    const performBackspace = () => {
      if (deletedCount < charsToDelete && this.displayText.length > targetPosition) {
        this.displayText = this.displayText.slice(0, -1);
        deletedCount++;
        
        this.recordEvent({
          type: 'backspace',
          position: this.displayText.length,
          timestamp: Date.now()
        });
        
        this.safeCallback(this.onBackspace);
        
        this.debug(`⬅️ Backspace ${deletedCount}/${charsToDelete}: "${this.displayText}" (length: ${this.displayText.length})`);
        
        if (deletedCount < charsToDelete && this.displayText.length > targetPosition) {
          this.timeoutId = window.setTimeout(performBackspace, backspaceDelay);
        } else {
          // Finished backspacing
          this.finishCorrection(mistake);
        }
      } else {
        // Force finish correction if we've gone too far
        this.finishCorrection(mistake);
      }
    };
    
    this.timeoutId = window.setTimeout(performBackspace, backspaceDelay);
  }

  private finishCorrection(mistake: MistakeInfo): void {
    // Ensure we're at exactly the right position
    this.currentIndex = mistake.position;
    this.displayText = this.text.slice(0, mistake.position);
    
    mistake.corrected = true;
    this.stats.mistakesCorrected++;
    this.isCorrectingMistake = false;
    
    this.debug(`✅ Correction complete. Position: ${this.currentIndex}, Text: "${this.displayText}"`);
    this.debug(`📝 Ready to type correct character: "${mistake.originalChar}"`);
    
    this.timeoutId = window.setTimeout(() => {
      this.state = 'typing';
      this.safeCallback(this.onStateChange, 'typing');
      
      // Type the correct character
      this.typeCharacter(mistake.originalChar);
      
      // Process next correction in queue if any
      if (this.correctionQueue.length > 0) {
        this.timeoutId = window.setTimeout(() => {
          this.processNextCorrection();
        }, this.config.realizationDelay);
      } else {
        // No more corrections queued, check if we should complete
        if (this.currentIndex >= this.text.length) {
          this.timeoutId = window.setTimeout(() => {
            this.completeTyping();
          }, 100);
        }
      }
    }, this.config.correctionPause);
  }

  private typeCharacter(char: string): void {
    this.displayText += char;
    this.currentIndex++;
    this.charactersTyped++;
    
    const now = Date.now();
    this.recordEvent({
      type: 'char',
      char,
      position: this.currentIndex - 1,
      timestamp: now
    });
    
    this.safeCallback(this.onCharacter, char, this.currentIndex - 1);
    this.updateProgress();
    this.updateWPM();
    this.updateTotalDuration();
    
    this.scheduleNextCharacter();
  }

  private selectMistakeType(char: string): MistakeType {
    const types: MistakeType[] = [];
    
    if (this.config.mistakeTypes.adjacent && QWERTY_ADJACENT[char.toLowerCase()]) {
      types.push('adjacent');
    }
    if (this.config.mistakeTypes.random) {
      types.push('random');
    }
    if (this.config.mistakeTypes.doubleChar) {
      types.push('doubleChar');
    }
    if (this.config.mistakeTypes.commonTypos) {
      types.push('commonTypo');
    }
    
    // For look-ahead typing, prefer common typo or adjacent key mistakes
    if (this.shouldMakeLookAheadMistake()) {
      const lookAheadTypes = types.filter(type => type === 'commonTypo' || type === 'adjacent');
      if (lookAheadTypes.length > 0) {
        return lookAheadTypes[Math.floor(Math.random() * lookAheadTypes.length)];
      }
    }
    
    return types[Math.floor(Math.random() * types.length)] || 'adjacent';
  }

  private generateMistakeChar(originalChar: string, type: MistakeType): string | null {
    const isOriginalUppercase = originalChar === originalChar.toUpperCase() && originalChar !== originalChar.toLowerCase();
    
    switch (type) {
      case 'adjacent':
        const adjacent = QWERTY_ADJACENT[originalChar.toLowerCase()];
        if (adjacent && adjacent.length > 0) {
          let mistakeChar = adjacent[Math.floor(Math.random() * adjacent.length)];
          // CAPS LOCK LOGIC: Match the case of the original character
          return isOriginalUppercase ? mistakeChar.toUpperCase() : mistakeChar.toLowerCase();
        }
        return null;
        
      case 'doubleChar':
        return originalChar + originalChar;
        
      case 'random':
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let randomChar = chars[Math.floor(Math.random() * chars.length)];
        // CAPS LOCK LOGIC: Match the case of the original character
        return isOriginalUppercase ? randomChar.toUpperCase() : randomChar.toLowerCase();
        
      case 'commonTypo':
        const currentWord = this.getCurrentWord();
        if (currentWord && COMMON_TYPOS[currentWord.toLowerCase()]) {
          const typoWord = COMMON_TYPOS[currentWord.toLowerCase()];
          const charIndex = this.currentIndex - this.getWordStartIndex(currentWord);
          if (charIndex < typoWord.length) {
            let typoChar = typoWord[charIndex];
            // CAPS LOCK LOGIC: Match the case of the original character
            return isOriginalUppercase ? typoChar.toUpperCase() : typoChar.toLowerCase();
          }
        }
        // Fallback to adjacent key mistake if no common typo available
        const adjacentKeys = QWERTY_ADJACENT[originalChar.toLowerCase()];
        if (adjacentKeys && adjacentKeys.length > 0) {
          let mistakeChar = adjacentKeys[Math.floor(Math.random() * adjacentKeys.length)];
          // CAPS LOCK LOGIC: Match the case of the original character
          return isOriginalUppercase ? mistakeChar.toUpperCase() : mistakeChar.toLowerCase();
        }
        return null;
        
      default:
        return null;
    }
  }

  private shouldHaveConcentrationLapse(): boolean {
    return this.config.concentrationLapses && Math.random() < BEHAVIOR_RATES.CONCENTRATION_LAPSE;
  }

  private getCurrentHand(char: string): 'left' | 'right' {
    return LEFT_HAND_KEYS.has(char.toLowerCase()) ? 'left' : 'right';
  }

  private getNextWord(): string | null {
    const remainingText = this.text.slice(this.currentIndex + 1);
    const match = remainingText.match(/^\s*(\w+)/);
    return match ? match[1] : null;
  }

  private getCurrentWord(): string | null {
    const beforeCursor = this.text.slice(0, this.currentIndex);
    const afterCursor = this.text.slice(this.currentIndex);
    
    const wordBefore = beforeCursor.match(/(\w+)$/);
    const wordAfter = afterCursor.match(/^(\w*)/);
    
    const before = wordBefore ? wordBefore[1] : '';
    const after = wordAfter ? wordAfter[1] : '';
    
    return before + after || null;
  }

  private getWordStartIndex(word: string): number {
    const beforeCursor = this.text.slice(0, this.currentIndex);
    const wordStart = beforeCursor.lastIndexOf(word);
    return wordStart !== -1 ? wordStart : this.currentIndex;
  }

  private isComplexWord(word: string): boolean {
    return word.length > 7 || !COMMON_WORDS.has(word.toLowerCase());
  }

  // Helper method to detect CAPS LOCK sequences (smart multi-word detection)
  private getCapsLockInfo(charIndex: number): { isCapsLockSequence: boolean; isFirst: boolean; isLast: boolean } {
    const char = this.text[charIndex];
    
    // Not a capital letter, definitely not caps lock
    if (!char.match(/[A-Z]/)) {
      return { isCapsLockSequence: false, isFirst: false, isLast: false };
    }
    
    // Find the start and end of CAPS region (including spaces between caps words)
    let sequenceStart = charIndex;
    let sequenceEnd = charIndex;
    
    // Go backward to find start (skip over spaces between caps words)
    while (sequenceStart > 0) {
      const prevChar = this.text[sequenceStart - 1];
      if (prevChar.match(/[A-Z]/)) {
        sequenceStart--;
      } else if (prevChar === ' ') {
        // Check if there's a caps word before the space
        let beforeSpace = sequenceStart - 2;
        if (beforeSpace >= 0 && this.text[beforeSpace].match(/[A-Z]/)) {
          sequenceStart--;
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    // Go forward to find end (skip over spaces between caps words)
    while (sequenceEnd < this.text.length - 1) {
      const nextChar = this.text[sequenceEnd + 1];
      if (nextChar.match(/[A-Z]/)) {
        sequenceEnd++;
      } else if (nextChar === ' ') {
        // Check if there's a caps word after the space
        let afterSpace = sequenceEnd + 2;
        if (afterSpace < this.text.length && this.text[afterSpace].match(/[A-Z]/)) {
          sequenceEnd++;
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    // Count only the capital letters (excluding spaces) to determine if it's caps lock worthy
    let capitalCount = 0;
    for (let i = sequenceStart; i <= sequenceEnd; i++) {
      if (this.text[i].match(/[A-Z]/)) {
        capitalCount++;
      }
    }
    
    const isCapsLockSequence = capitalCount >= TIMING_CONSTANTS.CAPS_SEQUENCE_THRESHOLD;
    
    // Find the first and last CAPITAL letters in the sequence (not spaces)
    let firstCapitalIndex = sequenceStart;
    while (firstCapitalIndex <= sequenceEnd && !this.text[firstCapitalIndex].match(/[A-Z]/)) {
      firstCapitalIndex++;
    }
    
    let lastCapitalIndex = sequenceEnd;
    while (lastCapitalIndex >= sequenceStart && !this.text[lastCapitalIndex].match(/[A-Z]/)) {
      lastCapitalIndex--;
    }
    
    return {
      isCapsLockSequence,
      isFirst: isCapsLockSequence && charIndex === firstCapitalIndex,
      isLast: isCapsLockSequence && charIndex === lastCapitalIndex
    };
  }

  // Helper method for look-ahead typing behavior
  private shouldMakeLookAheadMistake(): boolean {
    // Look ahead to see if we're approaching a common word ending
    const remainingText = this.text.slice(this.currentIndex);
    const nextFewChars = remainingText.slice(0, 4);
    
    // Common word endings that people tend to type ahead
    const commonEndings = ['ing', 'tion', 'ly', 'ed', 'er', 'est', 'ness'];
    
    const hasCommonEnding = commonEndings.some(ending => 
      nextFewChars.includes(ending.slice(0, Math.min(ending.length, nextFewChars.length)))
    );
    
    return hasCommonEnding && Math.random() < TIMING_CONSTANTS.LOOK_AHEAD_CHANCE;
  }

  private completeTyping(): void {
    // Before completing, check for any uncorrected mistakes or queued corrections
    const uncorrectedMistakes = this.mistakes.filter(m => !m.corrected);
    const hasQueuedCorrections = this.correctionQueue.length > 0;
    
    if (uncorrectedMistakes.length > 0 || hasQueuedCorrections || this.isCorrectingMistake) {
      this.debug(`🔍 Found ${uncorrectedMistakes.length} uncorrected mistakes, ${this.correctionQueue.length} queued corrections, correcting: ${this.isCorrectingMistake}`);
      
      // Add any uncorrected mistakes to the correction queue
      for (const mistake of uncorrectedMistakes) {
        if (!this.correctionQueue.includes(mistake)) {
          this.correctionQueue.push(mistake);
        }
      }
      
      // Process corrections only if not already correcting
      if (!this.isCorrectingMistake && this.correctionQueue.length > 0) {
        this.processNextCorrection();
      }
      
      // Check again after a delay, but prevent infinite recursion
      if (this.state !== 'completed') {
        this.timeoutId = window.setTimeout(() => {
          this.completeTyping();
        }, 500);
      }
      return;
    }
    
    // Ensure final text matches exactly what was intended
    this.displayText = this.text;
    this.currentIndex = this.text.length;
    
    // Only set completed state if we're not already completed
    if (this.state !== 'completed') {
      this.state = 'completed';
      const now = Date.now();
      this.stats.endTime = now;
      
      // Final duration update
      this.updateTotalDuration();
      
      this.safeCallback(this.onStateChange, 'completed');
      this.safeCallback(this.onComplete);
      
      this.debug(`🎉 Typing completed! Final text: "${this.displayText}"`);
      this.debug(`⏱️ Total duration: ${this.stats.totalDuration}ms`);
      
      // Final progress update to ensure 100%
      this.safeCallback(this.onProgress, 100);
    }
  }

  private updateProgress(): void {
    // Calculate progress based on actual completion, not just current index
    // Progress should only reach 100% when truly completed
    const rawProgress = this.text.length === 0 ? 100 : (this.currentIndex / this.text.length) * 100;
    
    // Don't report 100% progress unless we're actually completed and have no pending corrections
    const hasUncorrectedMistakes = this.mistakes.some(m => !m.corrected);
    const hasPendingCorrections = this.correctionQueue.length > 0;
    
    let actualProgress = rawProgress;
    if (rawProgress >= 100 && (hasUncorrectedMistakes || hasPendingCorrections || this.isCorrectingMistake)) {
      // Cap progress at 99% if we still have work to do
      actualProgress = Math.min(99, rawProgress);
    }
    
    this.safeCallback(this.onProgress, actualProgress);
  }

  private updateWPM(): void {
    if (this.stats.startTime === 0) return;
    
    const now = Date.now();
    const minutesElapsed = (now - this.stats.startTime) / 60000;
    const wordsTyped = this.charactersTyped / 5; // Standard WPM calculation
    
    this.stats.currentWPM = Math.round(wordsTyped / minutesElapsed);
  }

  private updateTotalDuration(): void {
    if (this.stats.startTime === 0) return;
    
    const now = Date.now();
    // Total duration is the time elapsed minus any paused time
    this.stats.totalDuration = (now - this.stats.startTime) - this.totalPausedTime;
  }


  private recordEvent(event: TypingEvent): void {
    this.events.push(event);
  }

  // Public getters
  public getText(): string { return this.text; }
  public getDisplayText(): string { return this.displayText; }
  public getState(): TypingState { return this.state; }
  public getProgress(): number { return this.text.length === 0 ? 100 : (this.currentIndex / this.text.length) * 100; }
  public getStats(): TypingStats { return { ...this.stats }; }
  public getMistakes(): MistakeInfo[] { return [...this.mistakes]; }
  public getEvents(): TypingEvent[] { return [...this.events]; }
  public getCurrentIndex(): number { return this.currentIndex; }
  public isCompleted(): boolean { return this.state === 'completed'; }
  public isTyping(): boolean { return this.state === 'typing' || this.state === 'correcting'; }
  public isPaused(): boolean { return this.state === 'paused'; }
  public getTotalDuration(): number { 
    this.updateTotalDuration(); 
    return this.stats.totalDuration; 
  }

  // Event listener setters
  public onStateChangeListener(callback: (state: TypingState) => void): void {
    this.onStateChange = callback;
  }
  
  public onCharacterListener(callback: (char: string, index: number) => void): void {
    this.onCharacter = callback;
  }
  
  public onMistakeListener(callback: (mistake: MistakeInfo) => void): void {
    this.onMistake = callback;
  }
  
  public onBackspaceListener(callback: () => void): void {
    this.onBackspace = callback;
  }
  
  public onCompleteListener(callback: () => void): void {
    this.onComplete = callback;
  }
  
  public onProgressListener(callback: (progress: number) => void): void {
    this.onProgress = callback;
  }

  // Configuration updates
  public updateConfig(newConfig: Partial<HumanLikeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public updateText(newText: string): void {
    this.stop();
    this.text = newText ?? ''; // Handle null/undefined text
    this.reset();
    // Do not auto-restart - let the caller decide whether to start
  }

  // Debug method to check mistake correction status
  public getUncorrectedMistakes(): MistakeInfo[] {
    return this.mistakes.filter(m => !m.corrected);
  }

  // Method to get current correction queue
  public getCorrectionQueue(): MistakeInfo[] {
    return [...this.correctionQueue];
  }

  // Method to force correction of all remaining mistakes (for debugging)
  public forceCorrectAllMistakes(): void {
    const uncorrected = this.getUncorrectedMistakes();
    if (uncorrected.length > 0 || this.correctionQueue.length > 0) {
      this.debug(`🔧 Forcing correction of ${uncorrected.length} uncorrected mistakes and ${this.correctionQueue.length} queued corrections`);
      
      // Add uncorrected mistakes to queue
      for (const mistake of uncorrected) {
        if (!this.correctionQueue.includes(mistake)) {
          this.correctionQueue.push(mistake);
        }
      }
      
      // Process all corrections
      this.processNextCorrection();
    }
  }
}