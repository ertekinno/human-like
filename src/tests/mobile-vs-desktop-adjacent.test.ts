/**
 * Test basic mobile vs desktop keyboard differences
 */

import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

describe('Mobile vs Desktop Configuration', () => {
  it('should accept mobile keyboard mode', () => {
    const config: Partial<HumanLikeConfig> = {
      keyboardMode: 'mobile',
      mistakeFrequency: 0
    };
    
    const engine = new TypingEngine('test', config);
    expect((engine as any).config.keyboardMode).toBe('mobile');
  });

  it('should accept desktop keyboard mode', () => {
    const config: Partial<HumanLikeConfig> = {
      keyboardMode: 'desktop',
      mistakeFrequency: 0
    };
    
    const engine = new TypingEngine('test', config);
    expect((engine as any).config.keyboardMode).toBe('desktop');
  });

  it('should default to mobile when no mode specified', () => {
    const engine = new TypingEngine('test');
    expect((engine as any).config.keyboardMode).toBe('mobile');
  });
});