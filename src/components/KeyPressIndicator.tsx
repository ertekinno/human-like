import { useState } from 'react';
import type { KeyInfo } from '../types';

interface KeyPressEvent {
  keyInfo: KeyInfo;
  timestamp: number;
  id: string;
}

/**
 * Hook for tracking key press history
 * Returns keyHistory array, addKeyPress function, and clearHistory function
 */
export const useKeyPressIndicator = (maxHistory: number = 10) => {
  const [keyHistory, setKeyHistory] = useState<KeyPressEvent[]>([]);

  const addKeyPress = (keyInfo: KeyInfo) => {
    const newEvent: KeyPressEvent = {
      keyInfo,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(7)
    };

    setKeyHistory(prev => [newEvent, ...prev].slice(0, maxHistory));
  };

  const clearHistory = () => setKeyHistory([]);

  return { keyHistory, addKeyPress, clearHistory };
};