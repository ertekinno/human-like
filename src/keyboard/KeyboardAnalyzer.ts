import type { 
  KeyInfo, 
  KeySequence, 
  KeyboardState, 
  KeyboardView,
  KeyboardAnalyzerConfig,
  KeyboardLayoutDefinition 
} from './types';
import { MOBILE_LAYOUT, MOBILE_CHARACTER_TO_VIEW } from './mobile-layouts';
import { DESKTOP_QWERTY_LAYOUT, DESKTOP_KEY_MAPPING } from './desktop-layouts';
import { getDefaultTimingProfile, applyTimingProfile, calculateContextualTiming, type TimingProfile } from './timing-profiles';

/**
 * Analyzes characters and converts them to realistic keyboard key sequences
 * Handles both mobile and desktop keyboard behaviors
 */
export class KeyboardAnalyzer {
  private config: KeyboardAnalyzerConfig;
  private layout: KeyboardLayoutDefinition;
  private state: KeyboardState;
  private timingProfile: TimingProfile;

  constructor(config: Partial<KeyboardAnalyzerConfig> = {}) {
    this.config = {
      keyboardMode: 'mobile',
      capsLockThreshold: 3,
      useNaturalTiming: true,
      debug: false,
      ...config
    };

    // Select appropriate timing profile
    this.timingProfile = getDefaultTimingProfile(this.config.keyboardMode, this.config.typingSpeed);
    
    // Select appropriate layout and apply timing profile
    const baseLayout = config.customLayout || 
      (this.config.keyboardMode === 'mobile' ? MOBILE_LAYOUT : DESKTOP_QWERTY_LAYOUT);
    
    this.layout = applyTimingProfile(baseLayout, this.timingProfile);

    // Initialize keyboard state
    this.state = {
      currentView: 'letters',
      capsLockActive: false,
      shiftActive: false,
      recentCharacters: [],
      mode: this.config.keyboardMode
    };

    this.debug('KeyboardAnalyzer initialized', { 
      config: this.config, 
      timingProfile: this.timingProfile.name,
      layout: this.layout.viewSwitchers 
    });
  }

  /**
   * Analyzes a character and returns the key sequence needed to type it
   */
  public analyzeCharacter(character: string, charIndex: number, fullText: string): KeySequence {
    this.debug(`Analyzing character: "${character}" at index ${charIndex}`);
    
    // Update recent characters for caps lock detection
    this.updateRecentCharacters(character);
    
    // Determine if this is part of a caps lock sequence
    const capsLockInfo = this.analyzeCapsLockSequence(character, charIndex, fullText);
    
    let keys: KeyInfo[] = [];
    
    if (this.config.keyboardMode === 'mobile') {
      keys = this.analyzeMobileCharacter(character, capsLockInfo);
    } else {
      keys = this.analyzeDesktopCharacter(character, capsLockInfo);
    }
    
    // Calculate total duration
    const totalDuration = keys.reduce((sum, key) => sum + key.duration, 0);
    
    const sequence: KeySequence = {
      character,
      keys,
      totalDuration,
      usesCapsLock: capsLockInfo.isCapsLockSequence
    };
    
    this.debug(`Generated sequence for "${character}":`, sequence);
    return sequence;
  }

  /**
   * Analyzes mobile keyboard character input
   */
  private analyzeMobileCharacter(character: string, capsInfo: any): KeyInfo[] {
    const keys: KeyInfo[] = [];
    let sequenceIndex = 0;
    
    // Handle special characters
    if (character === ' ') {
      return [{
        key: this.layout.modifiers.space,
        character,
        type: 'space',
        keyboardView: this.state.currentView,
        isCapsLock: false,
        duration: this.layout.keyDurations.space,
        sequenceIndex: 0,
        sequenceLength: 1
      }];
    }
    
    if (character === '\n') {
      return [{
        key: this.layout.modifiers.enter,
        character,
        type: 'enter',
        keyboardView: this.state.currentView,
        isCapsLock: false,
        duration: this.layout.keyDurations.enter,
        sequenceIndex: 0,
        sequenceLength: 1
      }];
    }
    
    // Determine target view for this character
    const targetView = this.getCharacterView(character);
    
    // Add view switching keys if needed
    if (this.state.currentView !== targetView) {
      const viewSwitchKeys = this.getViewSwitchSequence(this.state.currentView, targetView);
      viewSwitchKeys.forEach(viewKey => {
        keys.push({
          ...viewKey,
          sequenceIndex: sequenceIndex++,
          sequenceLength: 0 // Will be updated after we know total length
        });
      });
      this.state.currentView = targetView;
    }
    
    // Handle caps lock for letters
    if (character.match(/[A-Z]/)) {
      if (capsInfo.isCapsLockSequence) {
        // CAPS LOCK mode - only add caps key for first and last
        if (capsInfo.isFirst) {
          keys.push(this.createCapsKey(true, sequenceIndex++));
          this.state.capsLockActive = true;
        } else if (capsInfo.isLast) {
          // Add the letter first, then caps off
          keys.push(this.createLetterKey(character.toLowerCase(), sequenceIndex++, capsInfo.isCapsLockSequence));
          keys.push(this.createCapsKey(false, sequenceIndex++));
          this.state.capsLockActive = false;
          
          // Update sequence lengths and return early
          keys.forEach(key => key.sequenceLength = keys.length);
          return keys;
        }
        // Middle of caps lock sequence - just add the letter (no caps key)
      } else {
        // Single capital - use shift
        keys.push(this.createShiftKey(sequenceIndex++));
      }
    }
    
    // Add the main character key
    const mainKey = this.createCharacterKey(character, sequenceIndex++, capsInfo.isCapsLockSequence);
    keys.push(mainKey);
    
    // Update sequence lengths
    keys.forEach(key => key.sequenceLength = keys.length);
    
    return keys;
  }

  /**
   * Analyzes desktop keyboard character input
   */
  private analyzeDesktopCharacter(character: string, capsInfo: any): KeyInfo[] {
    const keys: KeyInfo[] = [];
    let sequenceIndex = 0;
    
    // Handle special characters
    if (character === ' ') {
      return [{
        key: 'space',
        character,
        type: 'space',
        keyboardView: 'letters',
        isCapsLock: false,
        duration: this.layout.keyDurations.space,
        sequenceIndex: 0,
        sequenceLength: 1
      }];
    }
    
    if (character === '\n') {
      return [{
        key: 'enter',
        character,
        type: 'enter',
        keyboardView: 'letters',
        isCapsLock: false,
        duration: this.layout.keyDurations.enter,
        sequenceIndex: 0,
        sequenceLength: 1
      }];
    }
    
    // Get desktop key mapping
    const mapping = DESKTOP_KEY_MAPPING[character];
    if (!mapping) {
      this.debug(`No desktop mapping found for character: "${character}"`);
      // Fallback to basic letter key
      return [{
        key: character.toLowerCase(),
        character,
        type: 'letter',
        keyboardView: 'letters',
        isCapsLock: false,
        duration: this.layout.keyDurations.letter,
        sequenceIndex: 0,
        sequenceLength: 1
      }];
    }
    
    const [physicalKey, requiresShift] = mapping;
    
    // Handle caps lock for letters
    if (character.match(/[A-Z]/)) {
      if (capsInfo.isCapsLockSequence) {
        // CAPS LOCK mode
        if (capsInfo.isFirst) {
          keys.push({
            key: 'caps lock',
            character,
            type: 'modifier',
            keyboardView: 'letters',
            isCapsLock: true,
            duration: this.layout.keyDurations.modifier,
            sequenceIndex: sequenceIndex++,
            sequenceLength: 0
          });
        } else if (capsInfo.isLast) {
          // Add letter first, then turn off caps lock
          keys.push({
            key: physicalKey,
            character,
            type: 'letter',
            keyboardView: 'letters',
            isCapsLock: true,
            duration: this.layout.keyDurations.letter,
            sequenceIndex: sequenceIndex++,
            sequenceLength: 0
          });
          keys.push({
            key: 'caps lock',
            character,
            type: 'modifier',
            keyboardView: 'letters',
            isCapsLock: true,
            duration: this.layout.keyDurations.modifier,
            sequenceIndex: sequenceIndex++,
            sequenceLength: 0
          });
          
          // Update sequence lengths and return
          keys.forEach(key => key.sequenceLength = keys.length);
          return keys;
        }
        // Middle of caps lock - just the letter
      } else if (requiresShift) {
        // Single capital with shift
        keys.push({
          key: 'shift',
          character,
          type: 'modifier',
          keyboardView: 'letters',
          isCapsLock: false,
          duration: this.layout.keyDurations.modifier,
          sequenceIndex: sequenceIndex++,
          sequenceLength: 0
        });
      }
    } else if (requiresShift) {
      // Non-letter that requires shift (symbols)
      keys.push({
        key: 'shift',
        character,
        type: 'modifier',
        keyboardView: 'symbols',
        isCapsLock: false,
        duration: this.layout.keyDurations.modifier,
        sequenceIndex: sequenceIndex++,
        sequenceLength: 0
      });
    }
    
    // Add the main key
    const keyType = character.match(/[a-zA-Z]/) ? 'letter' : 
                   character.match(/[0-9]/) ? 'number' : 'symbol';
    
    keys.push({
      key: physicalKey,
      character,
      type: keyType,
      keyboardView: keyType === 'letter' ? 'letters' : keyType === 'number' ? 'numbers' : 'symbols',
      isCapsLock: capsInfo.isCapsLockSequence,
      duration: this.layout.keyDurations[keyType],
      sequenceIndex: sequenceIndex++,
      sequenceLength: 0
    });
    
    // Update sequence lengths
    keys.forEach(key => key.sequenceLength = keys.length);
    
    return keys;
  }

  /**
   * Determines which keyboard view a character belongs to (mobile)
   */
  private getCharacterView(character: string): KeyboardView {
    if (this.config.keyboardMode === 'desktop') {
      return 'letters'; // Desktop doesn't have view switching
    }
    
    return MOBILE_CHARACTER_TO_VIEW[character] || 'letters';
  }

  /**
   * Gets the sequence of view switch keys needed
   */
  private getViewSwitchSequence(from: KeyboardView, to: KeyboardView): KeyInfo[] {
    if (from === to) return [];
    
    const keys: KeyInfo[] = [];
    
    // Mobile view switching logic
    switch (to) {
      case 'numbers':
        keys.push({
          key: this.layout.viewSwitchers.toNumbers,
          character: '',
          type: 'view-switch',
          keyboardView: from,
          isCapsLock: false,
          duration: this.layout.keyDurations.viewSwitch,
          sequenceIndex: 0,
          sequenceLength: 0
        });
        break;
        
      case 'symbols':
        // Might need to go through numbers first
        if (from === 'letters') {
          keys.push({
            key: this.layout.viewSwitchers.toNumbers,
            character: '',
            type: 'view-switch',
            keyboardView: from,
            isCapsLock: false,
            duration: this.layout.keyDurations.viewSwitch,
            sequenceIndex: 0,
            sequenceLength: 0
          });
        }
        keys.push({
          key: this.layout.viewSwitchers.toSymbols,
          character: '',
          type: 'view-switch',
          keyboardView: 'numbers',
          isCapsLock: false,
          duration: this.layout.keyDurations.viewSwitch,
          sequenceIndex: 0,
          sequenceLength: 0
        });
        break;
        
      case 'letters':
        keys.push({
          key: this.layout.viewSwitchers.toLetters,
          character: '',
          type: 'view-switch',
          keyboardView: from,
          isCapsLock: false,
          duration: this.layout.keyDurations.viewSwitch,
          sequenceIndex: 0,
          sequenceLength: 0
        });
        break;
    }
    
    return keys;
  }

  /**
   * Creates a caps lock key press
   */
  private createCapsKey(turningOn: boolean, sequenceIndex: number): KeyInfo {
    const baseDuration = this.layout.keyDurations.modifier;
    const contextualDuration = calculateContextualTiming(baseDuration, this.timingProfile, {
      isCapsLockTransition: true
    });
    
    return {
      key: this.layout.modifiers.caps,
      character: '',
      type: 'modifier',
      keyboardView: this.state.currentView,
      isCapsLock: true,
      duration: turningOn ? contextualDuration + 20 : contextualDuration, // Slightly longer for turning on
      sequenceIndex,
      sequenceLength: 0
    };
  }

  /**
   * Creates a shift key press
   */
  private createShiftKey(sequenceIndex: number): KeyInfo {
    return {
      key: this.layout.modifiers.shift,
      character: '',
      type: 'modifier',
      keyboardView: this.state.currentView,
      isCapsLock: false,
      duration: this.layout.keyDurations.modifier,
      sequenceIndex,
      sequenceLength: 0
    };
  }

  /**
   * Creates a letter key press
   */
  private createLetterKey(letter: string, sequenceIndex: number, isCapsLock: boolean): KeyInfo {
    return {
      key: letter,
      character: letter,
      type: 'letter',
      keyboardView: 'letters',
      isCapsLock,
      duration: this.layout.keyDurations.letter,
      sequenceIndex,
      sequenceLength: 0
    };
  }

  /**
   * Creates a character key press
   */
  private createCharacterKey(character: string, sequenceIndex: number, isCapsLock: boolean): KeyInfo {
    const key = character.toLowerCase();
    const type = character.match(/[a-zA-Z]/) ? 'letter' : 
                character.match(/[0-9]/) ? 'number' : 'symbol';
    
    // Apply contextual timing based on character complexity
    const baseDuration = this.layout.keyDurations[type];
    const isComplexSymbol = type === 'symbol' && this.isComplexSymbol(character);
    const contextualDuration = calculateContextualTiming(baseDuration, this.timingProfile, {
      isComplexSymbol
    });
    
    return {
      key,
      character,
      type,
      keyboardView: this.state.currentView,
      isCapsLock,
      duration: contextualDuration,
      sequenceIndex,
      sequenceLength: 0
    };
  }

  /**
   * Updates recent characters for caps lock detection
   */
  private updateRecentCharacters(character: string) {
    this.state.recentCharacters.push(character);
    // Keep only last 10 characters for analysis
    if (this.state.recentCharacters.length > 10) {
      this.state.recentCharacters.shift();
    }
  }

  /**
   * Analyzes whether character is part of a caps lock sequence
   * Uses the same logic as the original TypingEngine
   */
  private analyzeCapsLockSequence(character: string, charIndex: number, fullText: string) {
    if (!character.match(/[A-Z]/)) {
      return { isCapsLockSequence: false, isFirst: false, isLast: false };
    }
    
    // Find the start and end of the caps region
    let sequenceStart = charIndex;
    let sequenceEnd = charIndex;
    
    // Scan backwards to find start of caps sequence
    while (sequenceStart > 0) {
      const prevChar = fullText[sequenceStart - 1];
      if (prevChar.match(/[A-Z]/) || prevChar === ' ') {
        sequenceStart--;
      } else {
        break;
      }
    }
    
    // Scan forwards to find end of caps sequence  
    while (sequenceEnd < fullText.length - 1) {
      const nextChar = fullText[sequenceEnd + 1];
      if (nextChar.match(/[A-Z]/) || nextChar === ' ') {
        sequenceEnd++;
      } else {
        break;
      }
    }
    
    // Count capital letters (excluding spaces)
    let capitalCount = 0;
    for (let i = sequenceStart; i <= sequenceEnd; i++) {
      if (fullText[i].match(/[A-Z]/)) {
        capitalCount++;
      }
    }
    
    const isCapsLockSequence = capitalCount >= this.config.capsLockThreshold;
    
    // Find first and last capital letters
    let firstCapitalIndex = sequenceStart;
    while (firstCapitalIndex <= sequenceEnd && !fullText[firstCapitalIndex].match(/[A-Z]/)) {
      firstCapitalIndex++;
    }
    
    let lastCapitalIndex = sequenceEnd;
    while (lastCapitalIndex >= sequenceStart && !fullText[lastCapitalIndex].match(/[A-Z]/)) {
      lastCapitalIndex--;
    }
    
    return {
      isCapsLockSequence,
      isFirst: isCapsLockSequence && charIndex === firstCapitalIndex,
      isLast: isCapsLockSequence && charIndex === lastCapitalIndex
    };
  }

  /**
   * Check if a symbol is considered complex (requires more precise movement)
   */
  private isComplexSymbol(character: string): boolean {
    const complexSymbols = new Set(['@', '#', '$', '%', '^', '&', '*', '+', '=', '{', '}', '\\', '|', '`', '~', '<', '>']);
    return complexSymbols.has(character);
  }

  /**
   * Debug logging
   */
  private debug(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[KeyboardAnalyzer] ${message}`, data || '');
    }
  }

  /**
   * Reset keyboard state (useful for testing)
   */
  public resetState() {
    this.state = {
      currentView: 'letters',
      capsLockActive: false,
      shiftActive: false,
      recentCharacters: [],
      mode: this.config.keyboardMode
    };
  }

  /**
   * Analyzes a backspace key press and returns the key sequence
   */
  public analyzeBackspace(): KeySequence {
    this.debug('Analyzing backspace key');
    
    const backspaceKey: KeyInfo = {
      key: this.config.keyboardMode === 'mobile' ? this.layout.modifiers.backspace : 'backspace',
      character: '\b', // Backspace character
      type: 'backspace',
      keyboardView: this.state.currentView,
      isCapsLock: false,
      duration: this.layout.keyDurations.backspace || this.layout.keyDurations.modifier || 120,
      sequenceIndex: 0,
      sequenceLength: 1
    };
    
    const sequence: KeySequence = {
      character: '\b',
      keys: [backspaceKey],
      totalDuration: backspaceKey.duration,
      usesCapsLock: false
    };
    
    this.debug('Generated backspace sequence:', sequence);
    return sequence;
  }

  /**
   * Get current keyboard state (useful for debugging)
   */
  public getState(): KeyboardState {
    return { ...this.state };
  }
}