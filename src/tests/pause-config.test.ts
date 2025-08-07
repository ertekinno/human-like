/**
 * Test pause functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TypingEngine } from '../utils/TypingEngine';
import type { HumanLikeConfig } from '../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Pause Functionality', () => {
  it('should pause and resume typing', () => {
    const engine = new TypingEngine('hello world', { mistakeFrequency: 0 });
    let stateChanges: string[] = [];
    
    engine.onStateChangeListener((state) => {
      stateChanges.push(state);
    });
    
    // Start typing
    engine.start();
    vi.advanceTimersByTime(100);
    expect(stateChanges).toContain('typing');
    
    // Pause
    engine.pause();
    expect(engine.getState()).toBe('paused');
    expect(stateChanges).toContain('paused');
    
    // Resume
    engine.resume();
    expect(engine.getState()).toBe('typing');
    expect(stateChanges.filter(s => s === 'typing')).toHaveLength(2);
  });

  it('should handle pause configuration', () => {
    const config: Partial<HumanLikeConfig> = {
      wordPause: 100,
      sentencePause: 200,
      thinkingPause: 300
    };
    
    const engine = new TypingEngine('test', config);
    
    expect((engine as any).config.wordPause).toBe(100);
    expect((engine as any).config.sentencePause).toBe(200);
    expect((engine as any).config.thinkingPause).toBe(300);
  });
});