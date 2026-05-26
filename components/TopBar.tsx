'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Filter, Calendar, Store, Camera, RefreshCw, Settings, LogOut, UserCircle } from 'lucide-react';
import { useDashboardContext } from '@/components/DashboardProvider';

type DropdownType = 'shoppers' | 'bell' | 'avatar' | 'filter' | 'date' | null;

export function TopBar() {
  const { triggerRefresh } = useDashboardContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Qualified Shopper state
  const [minAge, setMinAge] = useState(13);
  const [maxAge, setMaxAge] = useState(60);
  const [genders, setGenders] = useState<Set<string>>(new Set(['Male', 'Female']));
  const [excludeChildren, setExcludeChildren] = useState(true);

  const rightSectionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the right section
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rightSectionRef.current && !rightSectionRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const toggleGender = (g: string) => {
    setGenders(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

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
        className="flex items-center justify-between"
        style={{ height: 'var(--topbar-height)', paddingLeft: 'var(--content-padding)', paddingRight: 'var(--content-padding)' }}
      >
        {/* Left — Landmark logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/landmark-logo.png"
            alt="Landmark Group"
            style={{ height: 22, width: 'auto', objectFit: 'contain', maxWidth: 130 }}
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 relative" ref={rightSectionRef}>

          {/* ── Qualified Shopper ── */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('shoppers')}
              className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors text-left border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-1)',
              }}
            >
              <div>
                <p className="text-[13px] font-semibold leading-tight">Qualified Shopper</p>
                <p className="text-[11px] font-medium leading-tight mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                  Kids Excluded
                </p>
              </div>
              <Settings size={14} strokeWidth={2} style={{ color: 'var(--color-text-3)' }} />
            </button>

            {activeDropdown === 'shoppers' && (
              <div
                className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-xl border z-50 bg-white"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-sm font-semibold text-gray-900">Qualified Shopper</p>
                  <p className="text-xs text-gray-400 mt-0.5">Configure visitor segments</p>
                </div>

                <div className="p-4 space-y-4">
                  {/* Preset */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preset</p>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: 'var(--color-primary)', background: 'var(--color-primary)' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">Kids Excluded</span>
                      <span className="ml-auto text-xs text-gray-400">Active</span>
                    </label>
                  </div>

                  {/* Age Range */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age Range</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Min Age</label>
                        <input
                          type="number"
                          value={minAge}
                          onChange={e => setMinAge(Number(e.target.value))}
                          className="w-full border rounded-md px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:ring-1"
                          style={{
                            borderColor: 'var(--color-border)',
                          }}
                          min={0}
                          max={maxAge}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Max Age</label>
                        <input
                          type="number"
                          value={maxAge}
                          onChange={e => setMaxAge(Number(e.target.value))}
                          className="w-full border rounded-md px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:ring-1"
                          style={{
                            borderColor: 'var(--color-border)',
                          }}
                          min={minAge}
                          max={120}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                    <div className="flex items-center gap-2">
                      {['Male', 'Female', 'Unknown'].map(g => (
                        <button
                          key={g}
                          onClick={() => toggleGender(g)}
                          className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                          style={
                            genders.has(g)
                              ? {
                                  background: 'var(--color-primary)',
                                  borderColor: 'var(--color-primary)',
                                  color: '#fff',
                                }
                              : {
                                  background: 'transparent',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text-2)',
                                }
                          }
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exclude Children */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeChildren}
                      onChange={e => setExcludeChildren(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span className="text-sm text-gray-700">Exclude children (under 13)</span>
                  </label>
                </div>

                {/* Save */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setActiveDropdown(null)}
                    className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bell ── */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('bell')}
              className="relative p-2 rounded-md transition-colors"
              style={{ color: 'var(--color-text-3)' }}
              aria-label="Notifications"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <Bell size={18} strokeWidth={1.5} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-error)' }}
              />
            </button>

            {activeDropdown === 'bell' && (
              <div
                className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 bg-white"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    Mark all read
                  </button>
                </div>

                {/* Notification rows */}
                <div>
                  {/* Row 1 – red */}
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#ef4444' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">High queue at Marina Bay Sands</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">Zone A wait time exceeded 15 min</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">2m ago</span>
                  </div>

                  {/* Row 2 – green */}
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22c55e' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">Footfall target reached</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">VivoCity hit 12,000 visitors</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">14m ago</span>
                  </div>

                  {/* Row 3 – blue */}
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3b82f6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">Weekly report ready</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">May 25 analytics summary available</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">1h ago</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Avatar ── */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('avatar')}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: '#7c3aed' }}
              >
                AM
              </div>
              <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
            </button>

            {activeDropdown === 'avatar' && (
              <div
                className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-xl border z-50 bg-white overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Profile header */}
                <div
                  className="flex flex-col items-center py-4 px-4 border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mb-2"
                    style={{ background: '#7c3aed' }}
                  >
                    AM
                  </div>
                  <p className="text-sm font-bold text-gray-900">Admin Manager</p>
                  <p className="text-xs text-gray-400 mt-0.5">admin@olyretail.com</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <UserCircle size={15} strokeWidth={1.5} className="text-gray-400" />
                    My Profile
                  </button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings size={15} strokeWidth={1.5} className="text-gray-400" />
                    Account Settings
                  </button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Bell size={15} strokeWidth={1.5} className="text-gray-400" />
                    Notifications
                  </button>

                  {/* Divider */}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--color-border)' }} />

                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={15} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-1.5 border-t"
        style={{
          height: 44,
          paddingLeft: 'var(--content-padding)',
          paddingRight: 'var(--content-padding)',
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface-2)',
          transition: 'background 200ms ease',
        }}
      >
        {/* Left group */}
        <div className="flex items-center gap-1.5">
          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('filter')}
              className="flex items-center gap-2 px-3 rounded-md text-sm font-medium border transition-colors"
              style={{
                height: 32,
                borderColor: activeDropdown === 'filter' ? 'var(--color-primary)' : 'var(--color-border)',
                color: activeDropdown === 'filter' ? 'var(--color-primary)' : 'var(--color-text-2)',
                background: activeDropdown === 'filter' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              }}
            >
              <Filter size={14} strokeWidth={1.5} />
              Filters
            </button>
            {activeDropdown === 'filter' && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border shadow-lg z-50 p-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                {['All Zones', 'Entrance', 'Exit'].map(f => (
                  <button key={f} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100" style={{ color: 'var(--color-text-1)' }}>{f}</button>
                ))}
              </div>
            )}
          </div>

          {/* Filter By Date */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('date')}
              className="flex items-center gap-2 px-3 rounded-md text-sm font-medium border transition-colors"
              style={{
                height: 32,
                borderColor: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-border)',
                color: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-text-2)',
                background: activeDropdown === 'date' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              }}
            >
              <Calendar size={14} strokeWidth={1.5} />
              Filter By Date
            </button>
            {activeDropdown === 'date' && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border shadow-lg z-50 p-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map(f => (
                  <button key={f} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100" style={{ color: 'var(--color-text-1)' }}>{f}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0 }} />

          {/* Stores */}
          <div
            className="flex items-center gap-2 px-3 rounded-md text-sm font-medium border"
            style={{ height: 32, borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
          >
            <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-text-1)' }}>8</span>
            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Stores</span>
          </div>

          {/* Cameras */}
          <div
            className="flex items-center gap-2 px-3 rounded-md text-sm font-medium border"
            style={{ height: 32, borderColor: 'var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}
          >
            <Camera size={14} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
            <span className="text-xs">
              <span className="font-semibold" style={{ color: 'var(--color-success)' }}>24</span>
              <span style={{ color: 'var(--color-text-3)' }}> online · </span>
              <span className="font-semibold" style={{ color: 'var(--color-error)' }}>2</span>
              <span style={{ color: 'var(--color-text-3)' }}> offline</span>
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right group */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: 'var(--color-text-3)', lineHeight: '32px' }}>
            Last Refresh: <span className="font-medium" style={{ color: 'var(--color-text-2)' }}>just now</span>
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 rounded-md text-sm font-medium border transition-colors"
            style={{ height: 32, borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-surface)' }}
          >
            <RefreshCw size={13} strokeWidth={1.5} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
