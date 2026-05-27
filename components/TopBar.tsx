'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Calendar, Store, Camera, RefreshCw, Settings, LogOut, UserCircle, TrendingUp, Filter, SlidersHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useDashboardContext } from '@/components/DashboardProvider';

type DropdownType = 'shoppers' | 'bell' | 'avatar' | 'date' | 'consultation' | null;

export function TopBar() {
  const { triggerRefresh } = useDashboardContext();
  const pathname = usePathname();
  const showQualifiedShopper = pathname?.startsWith('/dashboard/analytics') ?? false;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Qualified Shopper — saved (applied) values
  const [qsEnabled, setQsEnabled] = useState(false);
  const [savedMin, setSavedMin] = useState(13);
  const [savedMax, setSavedMax] = useState(60);
  const [savedGenders, setSavedGenders] = useState<Set<string>>(new Set(['Male', 'Female']));
  const [savedExclude, setSavedExclude] = useState(true);

  // Draft values (what's in the open dropdown before saving)
  const [draftMin, setDraftMin] = useState(13);
  const [draftMax, setDraftMax] = useState(60);
  const [draftGenders, setDraftGenders] = useState<Set<string>>(new Set(['Male', 'Female']));
  const [draftExclude, setDraftExclude] = useState(true);

  // Keep legacy names for backward compat with toggle fn below
  const minAge = draftMin;
  const maxAge = draftMax;
  const genders = draftGenders;
  const excludeChildren = draftExclude;
  const setMinAge = setDraftMin;
  const setMaxAge = setDraftMax;
  const setExcludeChildren = setDraftExclude;

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
    setDraftGenders(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  // When opening the dropdown, seed the draft from saved values
  const openQsDropdown = () => {
    setDraftMin(savedMin);
    setDraftMax(savedMax);
    setDraftGenders(new Set(savedGenders));
    setDraftExclude(savedExclude);
    toggleDropdown('shoppers');
  };

  // Save draft → saved and close
  const saveQs = () => {
    setSavedMin(draftMin);
    setSavedMax(draftMax);
    setSavedGenders(new Set(draftGenders));
    setSavedExclude(draftExclude);
    setQsEnabled(true);
    setActiveDropdown(null);
  };

  // Summary label for the button
  const genderLabel = savedGenders.size === 2 ? 'All genders'
    : savedGenders.size === 1 ? Array.from(savedGenders)[0]
    : 'No gender';
  const qsSummary = `Age ${savedMin}–${savedMax} · ${genderLabel}`;

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
        <img
          src="/landmark-logo.png"
          alt="Landmark Group"
          style={{ height: 22, width: 'auto', objectFit: 'contain', maxWidth: 130 }}
        />

        {/* Right */}
        <div className="flex items-center gap-3 relative" ref={rightSectionRef}>

          {/* ── Insights of the Day ── */}
          <button
            className="flex items-center gap-2 border transition-colors"
            style={{
              height: 34, paddingLeft: 14, paddingRight: 14,
              borderRadius: 6,
              borderColor: '#DDD6FE', color: '#655BD3',
              background: '#F5F3FF', fontSize: 13, fontWeight: 600,
              whiteSpace: 'nowrap', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FE'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; }}
          >
            <TrendingUp size={14} strokeWidth={1.5} />
            Insights of the Day
          </button>

          {/* ── Qualified Shopper — analytics only ── */}
          {showQualifiedShopper ? (<div className="relative">
            <button
              onClick={openQsDropdown}
              className="flex items-center gap-2 rounded-md px-3 transition-colors border"
              style={{
                height: 34,
                background: qsEnabled ? '#F5F3FF' : 'var(--color-surface)',
                borderColor: qsEnabled ? '#DDD6FE' : 'var(--color-border)',
                color: 'var(--color-text-1)',
              }}
            >
              <Settings size={14} strokeWidth={1.5} style={{ color: qsEnabled ? '#655BD3' : 'var(--color-text-3)' }} />
              <span className="text-[13px] font-semibold" style={{ color: qsEnabled ? '#655BD3' : 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
                Qualified Shopper
              </span>
            </button>

            {activeDropdown === 'shoppers' && (
              <div
                className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border z-50 bg-white"
                style={{ borderColor: 'var(--color-border)', width: 288 }}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Qualified Shopper</p>
                    <p className="text-xs text-gray-400 mt-0.5">Set age &amp; gender filters</p>
                  </div>

                  {/* Saved summary pill — only shown when enabled */}
                  {qsEnabled && (
                    <div style={{
                      marginTop: 10, padding: '6px 10px', borderRadius: 6,
                      background: '#F5F3FF', border: '1px solid #DDD6FE',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#655BD3', flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#655BD3' }}>
                        Active: Age {savedMin}–{savedMax} · {genderLabel}{savedExclude ? ' · Kids excl.' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Age Range */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age Range</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Min</label>
                        <input
                          type="number"
                          value={draftMin}
                          onChange={e => setMinAge(Number(e.target.value))}
                          className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-800 outline-none"
                          style={{ borderColor: 'var(--color-border)', accentColor: '#655BD3' }}
                          min={0} max={draftMax}
                          onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: '#D1D5DB', flexShrink: 0 }}>—</span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Max</label>
                        <input
                          type="number"
                          value={draftMax}
                          onChange={e => setMaxAge(Number(e.target.value))}
                          className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-800 outline-none"
                          style={{ borderColor: 'var(--color-border)' }}
                          min={draftMin} max={120}
                          onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender — Male / Female only */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                    <div className="flex items-center gap-2">
                      {['Male', 'Female'].map(g => {
                        const on = draftGenders.has(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGender(g)}
                            className="flex-1 py-1.5 rounded text-xs font-semibold border transition-all"
                            style={{
                              background: on ? '#655BD3' : 'transparent',
                              borderColor: on ? '#655BD3' : 'var(--color-border)',
                              color: on ? '#fff' : 'var(--color-text-2)',
                            }}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exclude Children */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftExclude}
                      onChange={e => setExcludeChildren(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#655BD3' }}
                    />
                    <span className="text-sm text-gray-700">Exclude children (under 13)</span>
                  </label>
                </div>

                {/* Save */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => setActiveDropdown(null)}
                    style={{ flex: 1, height: 36, borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQs}
                    className="transition-opacity hover:opacity-90"
                    style={{ flex: 2, height: 36, borderRadius: 6, border: 'none', background: '#655BD3', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}
                  >
                    Apply &amp; Save
                  </button>
                </div>
              </div>
            )}
          </div>) : null}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: '#E5E7EB', flexShrink: 0 }} />

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
                className="absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 bg-white"
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
                className="absolute top-full right-0 mt-2 w-52 rounded-lg shadow-xl border z-50 bg-white overflow-hidden"
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
        className="flex items-center border-t"
        style={{
          height: 64,
          paddingLeft: 'var(--content-padding)',
          paddingRight: 'var(--content-padding)',
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface-2)',
          transition: 'background 200ms ease',
        }}
      >
        {/* Page title */}
        <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', flex: 1 }}>
          {pathname === '/dashboard' || pathname === '/dashboard/'
            ? 'Home'
            : pathname?.startsWith('/dashboard/analytics') ? 'Analytics'
            : pathname?.startsWith('/dashboard/team') ? 'Team Management'
            : pathname?.startsWith('/dashboard/live') ? 'Live Feed'
            : pathname?.startsWith('/dashboard/preferences') ? 'Preferences'
            : 'Dashboard'}
        </p>

        {/* All filters + refresh — right-aligned */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <button
            className="flex items-center gap-2 rounded-md border transition-colors"
            style={{
              height: 34,
              paddingLeft: 14,
              paddingRight: 14,
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-2)',
              background: 'var(--color-surface)',
              fontSize: 13,
              fontWeight: 500,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            Filter
          </button>

          {/* Filter By Date */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('date')}
              className="flex items-center gap-2 rounded-md border transition-colors"
              style={{
                height: 34,
                paddingLeft: 14,
                paddingRight: 14,
                borderColor: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-border)',
                color: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-text-2)',
                background: activeDropdown === 'date' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Calendar size={14} strokeWidth={1.5} />
              Filter by Date
            </button>
            {activeDropdown === 'date' && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-md border shadow-lg z-50 p-1" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom Range'].map(f => (
                  <button key={f} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-1)' }}>{f}</button>
                ))}
              </div>
            )}
          </div>

          {/* Stores */}
          <div
            className="flex items-center gap-2 rounded-md border"
            style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)' }}>8</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Stores</span>
          </div>

          {/* Camera metric blocks */}
          <div style={{ display: 'flex', height: 34, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 11px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
              <Camera size={14} strokeWidth={2} style={{ color: 'var(--color-text-2)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: '#64748B', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>26</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: '#2D8A55', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>24</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: '#B54040' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>2</span>
            </div>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-md border transition-colors"
            style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
          >
            <RefreshCw size={13} strokeWidth={1.5} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
