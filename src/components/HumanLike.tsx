import React from 'react';
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
  keyboardMode,
  onKey,
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
    onResume,
    keyboardMode,
    onKey
  });

  // Apply user styles only
  const componentStyle = style;

  // Trust the hook's cursor visibility completely - no CSS animations needed
  const cursorStyle: React.CSSProperties = {
    opacity: 1 // Always visible when rendered, hook controls visibility via render condition
  };

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