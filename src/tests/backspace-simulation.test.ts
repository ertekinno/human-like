/**
 * Test basic backspace functionality during mistake correction
 */

import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

describe('Backspace Functionality', () => {
  it('should correct mistakes using backspace', async () => {
    let backspaceCount = 0;
    let mistakeCount = 0;
    
    const config: Partial<HumanLikeConfig> = {
      speed: 100,
      mistakeFrequency: 1.0, // Force mistakes
      mistakeTypes: {
        adjacent: true,
        random: false,
        doubleChar: false,
        commonTypos: false
      }
    };
    
    const engine = new TypingEngine('test', config);
    
    engine.onMistakeListener(() => {
      mistakeCount++;
    });
    
    engine.onBackspaceListener(() => {
      backspaceCount++;
    });
    
    await new Promise<void>((resolve) => {
      engine.onStateChangeListener((state) => {
        if (state === 'completed') resolve();
      });
      engine.start();
    });
    
    // Should make mistakes and correct them
    expect(mistakeCount).toBeGreaterThan(0);
    expect(backspaceCount).toBeGreaterThan(0);
    expect(engine.getDisplayText()).toBe('test');
  });
});