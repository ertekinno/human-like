import React, { useEffect } from 'react';
import type { HumanLikeProps } from '../types';
import { useHumanLike } from '../hooks/useHumanLike';

export const HumanLike: React.FC<HumanLikeProps> = ({
  text,
  speed = 80,
  mistakeFrequency = 0.03,
  showCursor = true,
  cursorChar = '|',
  cursorBlinkSpeed = 530,
  autoStart = true,
  config = {},
  id,
  onStart,
  onComplete,
  onChar,
  onMistake,
  onBackspace,
  onPause,
  onResume,
  className,
  style,
  ...props
}) => {
  // Merge speed and mistakeFrequency into config
  const mergedConfig = {
    speed,
    mistakeFrequency,
    ...config
  };

  const {
    displayText,
    showCursor: shouldShowCursor,
    cursorChar: activeCursorChar,
    cursorBlinkSpeed: activeCursorBlinkSpeed,
    isTyping,
    isCompleted,
    currentState
  } = useHumanLike({
    text,
    config: mergedConfig,
    autoStart,
    showCursor,
    cursorChar,
    cursorBlinkSpeed,
    id,
    onStart,
    onComplete,
    onChar,
    onMistake,
    onBackspace,
    onPause,
    onResume
  });

  // Apply user styles only
  const componentStyle = style;

  // Cursor styles
  const cursorStyle: React.CSSProperties = {
    animation: shouldShowCursor ? `human-like-cursor-blink ${activeCursorBlinkSpeed}ms infinite` : 'none',
    opacity: shouldShowCursor ? 1 : 0
  };

  // Inject cursor blinking CSS if not already present
  useEffect(() => {
    const styleId = 'human-like-cursor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes human-like-cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <span
      className={`human-like-typewriter ${className || ''}`}
      style={componentStyle}
      data-typing={isTyping}
      data-completed={isCompleted}
      data-state={currentState}
      data-id={id}
      {...props}
    >
      {displayText}
      {shouldShowCursor && (
        <span
          className="human-like-cursor"
          style={cursorStyle}
          aria-hidden="true"
        >
          {activeCursorChar}
        </span>
      )}
    </span>
  );
};

HumanLike.displayName = 'HumanLike';