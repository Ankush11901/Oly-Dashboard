'use client';
import { useState } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Filter,
  Calendar,
  Store,
  Camera,
  RefreshCw,
} from 'lucide-react';

export function TopBar() {
  const [isNew, setIsNew] = useState(false);

  return (
    <header
      className="flex-shrink-0 bg-white border-b"
      style={{ borderColor: '#E5E7EB' }}
    >
      {/* Main top row */}
      <div
        className="flex items-center justify-between px-6"
        style={{ height: 'var(--topbar-height)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            className="p-1.5 rounded-md transition-colors hover:bg-neutral-100"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={1.5} style={{ color: 'var(--color-neutral-500)' }} />
          </button>

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

          <div
            className="h-5 w-px"
            style={{ background: '#E5E7EB' }}
          />

          <span className="text-sm font-medium" style={{ color: 'var(--color-neutral-500)' }}>
            Landmark Asia
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Qualified shoppers live badge */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--color-secondary-light)', color: '#065F46' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--color-secondary)' }}
            />
            <span>Qualified Shoppers</span>
            <span className="font-bold">1,247</span>
            <ChevronDown size={12} strokeWidth={2} />
          </div>

          {/* Current / New toggle */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border"
            style={{ borderColor: '#E5E7EB', background: 'white' }}
          >
            <span style={{ color: !isNew ? 'var(--color-neutral-900)' : 'var(--color-neutral-400)' }} className="text-xs font-medium">
              Current
            </span>

            {/* Toggle switch */}
            <button
              onClick={() => setIsNew((v) => !v)}
              className="relative inline-flex items-center"
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: isNew ? 'var(--color-secondary)' : '#D1D5DB',
                transition: 'background 200ms ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label="Toggle new view"
            >
              <span
                style={{
                  position: 'absolute',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'white',
                  left: isNew ? 19 : 3,
                  transition: 'left 200ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </button>

            <span style={{ color: isNew ? 'var(--color-neutral-900)' : 'var(--color-neutral-400)' }} className="text-xs font-medium">
              New
            </span>
          </div>

          {/* Bell */}
          <button
            className="relative p-2 rounded-md transition-colors hover:bg-neutral-100"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} style={{ color: 'var(--color-neutral-500)' }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-error)' }}
            />
          </button>

          {/* Avatar */}
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-100">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'var(--color-primary)' }}
            >
              AM
            </div>
            <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-neutral-500)' }} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-6 py-2.5 border-t"
        style={{ borderColor: '#F3F4F6', background: '#FAFAFA' }}
      >
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors hover:bg-neutral-50"
          style={{ borderColor: '#E5E7EB', color: 'var(--color-neutral-700)', background: 'white' }}
        >
          <Filter size={14} strokeWidth={1.5} />
          Filters
        </button>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors hover:bg-neutral-50"
          style={{ borderColor: '#E5E7EB', color: 'var(--color-neutral-700)', background: 'white' }}
        >
          <Calendar size={14} strokeWidth={1.5} />
          Filter By Date
        </button>

        <div
          className="h-4 w-px mx-1"
          style={{ background: '#E5E7EB' }}
        />

        {/* Store count */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: '#E5E7EB', color: 'var(--color-neutral-700)', background: 'white' }}
        >
          <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-neutral-900)' }}>8</span>
          <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Stores</span>
        </div>

        {/* Camera count */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border"
          style={{ borderColor: '#E5E7EB', color: 'var(--color-neutral-700)', background: 'white' }}
        >
          <Camera size={14} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
          <span className="text-xs">
            <span className="font-semibold" style={{ color: 'var(--color-success)' }}>24</span>
            <span style={{ color: 'var(--color-neutral-500)' }}> online · </span>
            <span className="font-semibold" style={{ color: 'var(--color-error)' }}>2</span>
            <span style={{ color: 'var(--color-neutral-500)' }}> offline</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Refresh */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
            Last Refresh: <span className="font-medium" style={{ color: 'var(--color-neutral-700)' }}>3s ago</span>
          </span>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors hover:bg-neutral-50"
            style={{ borderColor: '#E5E7EB', color: 'var(--color-primary)', background: 'white' }}
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
