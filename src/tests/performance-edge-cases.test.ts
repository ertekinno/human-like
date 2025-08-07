/**
 * Edge Case Tests
 * Tests extreme scenarios and edge cases
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

describe('Edge Cases', () => {
  it('should handle very long texts', () => {
    const longText = 'A'.repeat(1000);
    const engine = new TypingEngine(longText, { mistakeFrequency: 0 });
    
    engine.start();
    vi.advanceTimersByTime(10000);
    
    expect(engine.getProgress()).toBeGreaterThan(0);
    expect(engine.getDisplayText()).toBeTruthy();
  });

  it('should handle single character', () => {
    const engine = new TypingEngine('A', { mistakeFrequency: 0 });
    
    engine.start();
    vi.advanceTimersByTime(1000);
    
    expect(engine.getDisplayText()).toBe('A');
    expect(engine.isCompleted()).toBe(true);
    expect(engine.getProgress()).toBe(100);
  });

  it('should handle empty strings without crashing', () => {
    const engine = new TypingEngine('');
    
    expect(() => {
      engine.start();
      vi.advanceTimersByTime(100);
    }).not.toThrow();
    
    expect(engine.isCompleted()).toBe(true);
    expect(engine.getProgress()).toBe(100);
  });

  it('should handle special characters', () => {
    const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,.';
    const engine = new TypingEngine(specialText, { mistakeFrequency: 0 });
    
    engine.start();
    vi.advanceTimersByTime(15000);
    
    expect(engine.getDisplayText()).toBe(specialText);
    expect(engine.isCompleted()).toBe(true);
  });

  it('should handle unicode and emoji', () => {
    const unicodeText = 'Hello 世界 🌍 café naïve résumé';
    const engine = new TypingEngine(unicodeText, { mistakeFrequency: 0 });
    
    engine.start();
    vi.advanceTimersByTime(10000);
    
    expect(engine.getDisplayText()).toBe(unicodeText);
    expect(engine.isCompleted()).toBe(true);
  });

  it('should handle null and undefined gracefully', () => {
    expect(() => {
      const engine1 = new TypingEngine(null as any);
      engine1.start();
      vi.advanceTimersByTime(100);
    }).not.toThrow();
    
    expect(() => {
      const engine2 = new TypingEngine(undefined as any);
      engine2.start(); 
      vi.advanceTimersByTime(100);
    }).not.toThrow();
  });

  it('should handle rapid state changes', () => {
    const engine = new TypingEngine('test', { mistakeFrequency: 0 });
    
    expect(() => {
      engine.start();
      engine.pause();
      engine.resume();
      engine.stop();
      engine.reset();
    }).not.toThrow();
    
    expect(engine.getState()).toBe('idle');
  });
});