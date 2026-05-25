'use client';
import { Bell, ChevronDown, Filter, Calendar, Store, Camera, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function TopBar() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header
      className="flex-shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Main top row */}
      <div
        className="flex items-center justify-between px-6"
        style={{ height: 'var(--topbar-height)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
              style={{ background: 'var(--color-primary)' }}
            >
              O
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              OlyRetail
            </span>
          </div>

          <div className="h-5 w-px" style={{ background: 'var(--color-border)' }} />

          <span className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>
            Landmark Asia
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Qualified shoppers live badge */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--color-secondary-light)', color: isDark ? '#34D399' : '#065F46' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--color-secondary)' }}
            />
            <span>Qualified Shoppers</span>
            <span className="font-bold">1,247</span>
            <ChevronDown size={12} strokeWidth={2} />
          </div>

          {/* Light / Dark toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border transition-all"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-2)',
            }}
            aria-label="Toggle dark mode"
          >
            {isDark
              ? <Sun size={14} strokeWidth={1.5} style={{ color: '#F59E0B' }} />
              : <Moon size={14} strokeWidth={1.5} style={{ color: '#655BD3' }} />
            }
            {/* Toggle pill */}
            <span
              className="relative inline-flex items-center"
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: isDark ? '#655BD3' : '#D1D5DB',
                transition: 'background 200ms ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'white',
                  left: isDark ? 19 : 3,
                  transition: 'left 200ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Bell */}
          <button
            className="relative p-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text-3)' }}
            aria-label="Notifications"
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <Bell size={18} strokeWidth={1.5} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-error)' }}
            />
          </button>

          {/* Avatar */}
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'var(--color-primary)' }}
            >
              AM
            </div>
            <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-6 py-2.5 border-t"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface-2)',
          transition: 'background 200ms ease',
        }}
      >
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-2)',
            background: 'var(--color-surface)',
          }}
        >
          <Filter size={14} strokeWidth={1.5} />
          Filters
        </button>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-2)',
            background: 'var(--color-surface)',
          }}
        >
          <Calendar size={14} strokeWidth={1.5} />
          Filter By Date
        </button>

        <div className="h-4 w-px mx-1" style={{ background: 'var(--color-border)' }} />

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
        >
          <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text-1)' }}>8</span>
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Stores</span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
        >
          <Camera size={14} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
          <span className="text-xs">
            <span className="font-semibold" style={{ color: 'var(--color-success)' }}>24</span>
            <span style={{ color: 'var(--color-text-3)' }}> online · </span>
            <span className="font-semibold" style={{ color: 'var(--color-error)' }}>2</span>
            <span style={{ color: 'var(--color-text-3)' }}> offline</span>
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
            Last Refresh: <span className="font-medium" style={{ color: 'var(--color-text-2)' }}>3s ago</span>
          </span>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-surface)' }}
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
