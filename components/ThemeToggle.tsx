'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const TRACK_W = 44;
const THUMB = 18;
const PAD = 3;

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 2px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Sun
        size={16}
        strokeWidth={1.75}
        style={{
          color: !isDark ? 'var(--color-primary)' : 'var(--color-text-4)',
          transition: 'color 200ms ease',
          flexShrink: 0,
        }}
        aria-hidden
      />
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: TRACK_W,
          height: THUMB + PAD * 2,
          padding: `0 ${PAD}px`,
          borderRadius: 99,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: THUMB,
            height: THUMB,
            marginLeft: isDark ? 'auto' : 0,
            borderRadius: '50%',
            background: 'var(--color-primary-emphasis)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            flexShrink: 0,
            transition: 'margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </span>
      <Moon
        size={16}
        strokeWidth={1.75}
        style={{
          color: isDark ? 'var(--color-primary)' : 'var(--color-text-4)',
          transition: 'color 200ms ease',
          flexShrink: 0,
        }}
        aria-hidden
      />
    </button>
  );
}
