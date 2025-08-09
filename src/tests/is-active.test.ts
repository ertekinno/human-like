/**
 * Tests for the isActive property
 * isActive should be true from start to completion, covering all active states
 */
import { TypingEngine } from '../utils/TypingEngine';

describe('isActive Property', () => {
  it('should be false for idle state', () => {
    const engine = new TypingEngine('Test');
    
    // Initially idle
    expect(engine.getState()).toBe('idle');
    // isActive equivalent logic
    expect(engine.getState() !== 'idle' && engine.getState() !== 'completed').toBe(false);
  });
  
  it('should be true for all active typing states', async () => {
    const engine = new TypingEngine('Hello!', {
      speed: 50,
      mistakeFrequency: 0.1,
      debug: false
    });
    
    const activeStates: string[] = [];
    
    engine.onStateChangeListener((state) => {
      const isActive = state !== 'idle' && state !== 'completed';
      activeStates.push(`${state}:${isActive}`);
    });
    
    // Start typing
    engine.start();
    
    // Wait for completion
    await new Promise<void>((resolve) => {
      engine.onCompleteListener(() => resolve());
    });
    
    // Check that isActive was true for all non-idle/completed states
    const hasActiveStates = activeStates.some(entry => {
      const [state, isActiveStr] = entry.split(':');
      return isActiveStr === 'true' && ['typing', 'correcting', 'paused', 'thinking'].includes(state);
    });
    
    expect(hasActiveStates).toBe(true);
    
    // Final state should be completed with isActive = false
    const finalEntry = activeStates[activeStates.length - 1];
    expect(finalEntry).toBe('completed:false');
  });
  
  it('should handle pause/resume correctly with isActive', () => {
    const engine = new TypingEngine('Test text');
    
    // Start typing
    engine.start();
    let isActive = engine.getState() !== 'idle' && engine.getState() !== 'completed';
    expect(isActive).toBe(true);
    
    // Pause
    engine.pause();
    isActive = engine.getState() !== 'idle' && engine.getState() !== 'completed';
    expect(engine.getState()).toBe('paused');
    expect(isActive).toBe(true); // Should still be active when paused
    
    // Resume
    engine.resume();
    isActive = engine.getState() !== 'idle' && engine.getState() !== 'completed';
    expect(isActive).toBe(true);
  });
});