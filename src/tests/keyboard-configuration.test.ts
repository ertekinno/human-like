/**
 * Test basic keyboard configuration changes
 */

import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

describe('Keyboard Configuration', () => {
  it('should accept different speed configurations', () => {
    const fastConfig: Partial<HumanLikeConfig> = {
      speed: 30,
      mistakeFrequency: 0
    };
    
    const slowConfig: Partial<HumanLikeConfig> = {
      speed: 300,
      mistakeFrequency: 0
    };
    
    const fastEngine = new TypingEngine('test', fastConfig);
    const slowEngine = new TypingEngine('test', slowConfig);
    
    expect((fastEngine as any).config.speed).toBe(30);
    expect((slowEngine as any).config.speed).toBe(300);
  });

  it('should accept different keyboard modes', () => {
    const mobileConfig: Partial<HumanLikeConfig> = {
      keyboardMode: 'mobile'
    };
    
    const desktopConfig: Partial<HumanLikeConfig> = {
      keyboardMode: 'desktop'
    };
    
    const mobileEngine = new TypingEngine('test', mobileConfig);
    const desktopEngine = new TypingEngine('test', desktopConfig);
    
    expect((mobileEngine as any).config.keyboardMode).toBe('mobile');
    expect((desktopEngine as any).config.keyboardMode).toBe('desktop');
  });

  it('should accept mistake configuration', () => {
    const noMistakesConfig: Partial<HumanLikeConfig> = {
      mistakeFrequency: 0
    };
    
    const mistakesConfig: Partial<HumanLikeConfig> = {
      mistakeFrequency: 0.5,
      mistakeTypes: {
        adjacent: true,
        random: false,
        doubleChar: true,
        commonTypos: false
      }
    };
    
    const noMistakesEngine = new TypingEngine('test', noMistakesConfig);
    const mistakesEngine = new TypingEngine('test', mistakesConfig);
    
    expect((noMistakesEngine as any).config.mistakeFrequency).toBe(0);
    expect((mistakesEngine as any).config.mistakeFrequency).toBe(0.5);
    expect((mistakesEngine as any).config.mistakeTypes.adjacent).toBe(true);
    expect((mistakesEngine as any).config.mistakeTypes.random).toBe(false);
  });
});