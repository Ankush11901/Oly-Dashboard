'use client';

import { useCallback, useState, type CSSProperties, type ReactNode, type MouseEvent, type PointerEvent } from 'react';
import { haptic, type HapticPattern } from '@/lib/haptics';

type BentoPressableProps = {
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
  hapticPattern?: HapticPattern;
  disabled?: boolean;
  as?: 'button' | 'div';
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
};

export function BentoPressable({
  children,
  onClick,
  className = '',
  style,
  hapticPattern = 'light',
  disabled = false,
  as = 'button',
  type = 'button',
  'aria-label': ariaLabel,
}: BentoPressableProps) {
  const [pressed, setPressed] = useState(false);

  const fireHaptic = useCallback(() => {
    if (!disabled) haptic(hapticPattern);
  }, [disabled, hapticPattern]);

  const handlePointerDown = (e: PointerEvent) => {
    if (disabled) return;
    if (e.button !== 0) return;
    setPressed(true);
    fireHaptic();
  };

  const handlePointerUp = () => setPressed(false);
  const handlePointerLeave = () => setPressed(false);

  const handleClick = (e: MouseEvent) => {
    if (disabled) return;
    onClick?.(e);
  };

  const classes = `bento-pressable ${pressed ? 'is-pressed' : ''} ${className}`.trim();
  const shared = {
    className: classes,
    style,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerLeave,
    'aria-label': ariaLabel,
  };

  if (as === 'div') {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fireHaptic();
            onClick?.(e as unknown as MouseEvent);
          }
        }}
        {...shared}
      />
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={handleClick} {...shared}>
      {children}
    </button>
  );
}
