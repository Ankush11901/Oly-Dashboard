'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Calendar, Store, RefreshCw, Settings, LogOut, UserCircle, TrendingUp, SlidersHorizontal, Video, Check, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useDashboardContext } from '@/components/DashboardProvider';

type DropdownType = 'shoppers' | 'bell' | 'avatar' | 'date' | 'camera' | 'locationFilter' | null;

// ── Camera options ─────────────────────────────────────────────────────────────
const CAMERA_OPTIONS = [
  { label: 'All Cameras',       total: 26, online: 24, offline: 2 },
  { label: 'Entrance Cameras',  total: 12, online: 11, offline: 1 },
  { label: 'Cash Bill Cameras', total: 8,  online: 8,  offline: 0 },
];

// ── Location filter options ────────────────────────────────────────────────────
const FILTER_OPTIONS = {
  Country:    ['All Countries', 'Singapore', 'Malaysia', 'UAE', 'India'],
  Region:     ['All Regions',   'Central',   'East',     'West', 'North'],
  State:      ['All States',    'Central Region', 'Eastern Region', 'Western Region'],
  City:       ['All Cities',    'Singapore City', 'Kuala Lumpur', 'Dubai', 'Mumbai'],
  'Store Name': ['All Stores', 'Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point'],
};
type FilterKey = keyof typeof FILTER_OPTIONS;

export function TopBar() {
  const { triggerRefresh } = useDashboardContext();
  const pathname = usePathname();
  const showQualifiedShopper = pathname?.startsWith('/dashboard/analytics') ?? false;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Camera selection
  const [selectedCameraIdx, setSelectedCameraIdx] = useState(0);
  const selectedCamera = CAMERA_OPTIONS[selectedCameraIdx];

  // Location filter drafts
  const emptyFilters = { Country: 'All Countries', Region: 'All Regions', State: 'All States', City: 'All Cities', 'Store Name': 'All Stores' } as Record<FilterKey, string>;
  const [appliedFilters, setAppliedFilters] = useState<Record<FilterKey, string>>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Record<FilterKey, string>>(emptyFilters);

  // Sub-dropdowns inside the location filter panel
  const [openSubFilter, setOpenSubFilter] = useState<FilterKey | null>(null);

  const hasActiveFilters = Object.entries(appliedFilters).some(([k, v]) => v !== emptyFilters[k as FilterKey]);

  // Qualified Shopper
  const [qsEnabled, setQsEnabled] = useState(false);
  const [savedMin, setSavedMin] = useState(13);
  const [savedMax, setSavedMax] = useState(60);
  const [savedGenders, setSavedGenders] = useState<Set<string>>(new Set(['Male', 'Female']));
  const [savedExclude, setSavedExclude] = useState(true);
  const [draftMin, setDraftMin] = useState(13);
  const [draftMax, setDraftMax] = useState(60);
  const [draftGenders, setDraftGenders] = useState<Set<string>>(new Set(['Male', 'Female']));
  const [draftExclude, setDraftExclude] = useState(true);

  const rightSectionRef = useRef<HTMLDivElement>(null);
  const filterBarRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rightSectionRef.current && !rightSectionRef.current.contains(event.target as Node) &&
        filterBarRef.current    && !filterBarRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
        setOpenSubFilter(null);
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
    setOpenSubFilter(null);
  };

  const toggleGender = (g: string) => {
    setDraftGenders(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const openQsDropdown = () => {
    setDraftMin(savedMin);
    setDraftMax(savedMax);
    setDraftGenders(new Set(savedGenders));
    setDraftExclude(savedExclude);
    toggleDropdown('shoppers');
  };

  const saveQs = () => {
    setSavedMin(draftMin);
    setSavedMax(draftMax);
    setSavedGenders(new Set(draftGenders));
    setSavedExclude(draftExclude);
    setQsEnabled(true);
    setActiveDropdown(null);
  };

  const openLocationFilter = () => {
    setDraftFilters({ ...appliedFilters });
    toggleDropdown('locationFilter');
  };

  const applyLocationFilter = () => {
    setAppliedFilters({ ...draftFilters });
    setActiveDropdown(null);
    setOpenSubFilter(null);
  };

  const clearAllFilters = () => {
    setDraftFilters({ ...emptyFilters });
    setOpenSubFilter(null);
  };

  const genderLabel  = savedGenders.size === 2 ? 'All genders' : savedGenders.size === 1 ? Array.from(savedGenders)[0] : 'No gender';

  return (
    <header className="flex-shrink-0" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', transition: 'background 200ms ease, border-color 200ms ease' }}>

      {/* ── Main top row ── */}
      <div className="flex items-center justify-between" style={{ height: 'var(--topbar-height)', paddingLeft: 'var(--content-padding)', paddingRight: 'var(--content-padding)' }}>
        {/* Left — Landmark logo */}
        <img src="/landmark-logo.png" alt="Landmark Group" style={{ height: 22, width: 'auto', objectFit: 'contain', maxWidth: 130 }} />

        {/* Right */}
        <div className="flex items-center gap-3 relative" ref={rightSectionRef}>

          {/* Insights of the Day */}
          <button className="flex items-center gap-2 border transition-colors" style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderRadius: 6, borderColor: '#DDD6FE', color: '#655BD3', background: '#F5F3FF', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FE'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; }}>
            <TrendingUp size={14} strokeWidth={1.5} />
            Insights of the Day
          </button>

          {/* Qualified Shopper — analytics only */}
          {showQualifiedShopper ? (
            <div className="relative">
              <button onClick={openQsDropdown} className="flex items-center gap-2 rounded-md px-3 transition-colors border" style={{ height: 34, background: qsEnabled ? '#F5F3FF' : 'var(--color-surface)', borderColor: qsEnabled ? '#DDD6FE' : 'var(--color-border)', color: 'var(--color-text-1)' }}>
                <Settings size={14} strokeWidth={1.5} style={{ color: qsEnabled ? '#655BD3' : 'var(--color-text-3)' }} />
                <span className="text-[13px] font-semibold" style={{ color: qsEnabled ? '#655BD3' : 'var(--color-text-2)', whiteSpace: 'nowrap' }}>Qualified Shopper</span>
              </button>
              {activeDropdown === 'shoppers' && (
                <div className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border z-50 bg-white" style={{ borderColor: 'var(--color-border)', width: 288 }}>
                  <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-sm font-semibold text-gray-900">Qualified Shopper</p>
                    <p className="text-xs text-gray-400 mt-0.5">Set age &amp; gender filters</p>
                    {qsEnabled && (
                      <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 6, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#655BD3', flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#655BD3' }}>Active: Age {savedMin}–{savedMax} · {genderLabel}{savedExclude ? ' · Kids excl.' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age Range</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Min</label>
                          <input type="number" value={draftMin} onChange={e => setDraftMin(Number(e.target.value))} className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-800 outline-none" style={{ borderColor: 'var(--color-border)' }} min={0} max={draftMax} onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                        </div>
                        <span style={{ fontSize: 12, color: '#D1D5DB', flexShrink: 0 }}>—</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Max</label>
                          <input type="number" value={draftMax} onChange={e => setDraftMax(Number(e.target.value))} className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-800 outline-none" style={{ borderColor: 'var(--color-border)' }} min={draftMin} max={120} onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                      <div className="flex items-center gap-2">
                        {['Male', 'Female'].map(g => {
                          const on = draftGenders.has(g);
                          return (
                            <button key={g} onClick={() => toggleGender(g)} className="flex-1 py-1.5 rounded text-xs font-semibold border transition-all" style={{ background: on ? '#655BD3' : 'transparent', borderColor: on ? '#655BD3' : 'var(--color-border)', color: on ? '#fff' : 'var(--color-text-2)' }}>{g}</button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={draftExclude} onChange={e => setDraftExclude(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#655BD3' }} />
                      <span className="text-sm text-gray-700">Exclude children (under 13)</span>
                    </label>
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <button onClick={() => setActiveDropdown(null)} style={{ flex: 1, height: 36, borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveQs} className="transition-opacity hover:opacity-90" style={{ flex: 2, height: 36, borderRadius: 6, border: 'none', background: '#655BD3', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Apply &amp; Save</button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: '#E5E7EB', flexShrink: 0 }} />

          {/* Bell */}
          <div className="relative">
            <button onClick={() => toggleDropdown('bell')} className="relative p-2 rounded-md transition-colors" style={{ color: 'var(--color-text-3)' }} aria-label="Notifications"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)' }} />
            </button>
            {activeDropdown === 'bell' && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 bg-white" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Mark all read</button>
                </div>
                <div>
                  {[
                    { color: '#ef4444', title: 'High queue at Marina Bay Sands', desc: 'Zone A wait time exceeded 15 min', time: '2m ago' },
                    { color: '#22c55e', title: 'Footfall target reached',          desc: 'VivoCity hit 12,000 visitors',         time: '14m ago' },
                    { color: '#3b82f6', title: 'Weekly report ready',              desc: 'May 25 analytics summary available',   time: '1h ago' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <button onClick={() => toggleDropdown('avatar')} className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: '#7c3aed' }}>AM</div>
              <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
            </button>
            {activeDropdown === 'avatar' && (
              <div className="absolute top-full right-0 mt-2 w-52 rounded-lg shadow-xl border z-50 bg-white overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex flex-col items-center py-4 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mb-2" style={{ background: '#7c3aed' }}>AM</div>
                  <p className="text-sm font-bold text-gray-900">Admin Manager</p>
                  <p className="text-xs text-gray-400 mt-0.5">admin@olyretail.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><UserCircle size={15} strokeWidth={1.5} className="text-gray-400" />My Profile</button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Settings size={15} strokeWidth={1.5} className="text-gray-400" />Account Settings</button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Bell size={15} strokeWidth={1.5} className="text-gray-400" />Notifications</button>
                  <div className="my-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut size={15} strokeWidth={1.5} />Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div ref={filterBarRef} className="border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', transition: 'background 200ms ease' }}>
        <div className="flex items-center" style={{ height: 64, paddingLeft: 'var(--content-padding)', paddingRight: 'var(--content-padding)' }}>
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

          <div className="flex items-center gap-2">

            {/* ── Filter button ── */}
            <div className="relative">
              <button
                onClick={openLocationFilter}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: 34, paddingLeft: 14, paddingRight: 14,
                  borderColor: activeDropdown === 'locationFilter' || hasActiveFilters ? '#655BD3' : 'var(--color-border)',
                  color: activeDropdown === 'locationFilter' || hasActiveFilters ? '#655BD3' : 'var(--color-text-2)',
                  background: activeDropdown === 'locationFilter' || hasActiveFilters ? '#F5F3FF' : 'var(--color-surface)',
                  fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={e => { if (!hasActiveFilters && activeDropdown !== 'locationFilter') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (!hasActiveFilters && activeDropdown !== 'locationFilter') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
              >
                <SlidersHorizontal size={13} strokeWidth={1.5} />
                Filter
                {hasActiveFilters && (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#655BD3', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}>
                    {Object.values(appliedFilters).filter((v, i) => v !== Object.values(emptyFilters)[i]).length}
                  </span>
                )}
              </button>

              {/* ── Location filter panel ── */}
              {activeDropdown === 'locationFilter' && (
                <div
                  className="absolute top-full mt-2 rounded-xl shadow-2xl border z-50 bg-white"
                  style={{ left: 0, width: 560, borderColor: '#E5E7EB' }}
                >
                  {/* Panel header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SlidersHorizontal size={14} strokeWidth={1.5} style={{ color: '#655BD3' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Filter by Location</span>
                    </div>
                    <button onClick={clearAllFilters} style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={11} strokeWidth={2} />
                      Clear all
                    </button>
                  </div>

                  {/* 3-2 filter grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '14px 20px 16px', background: 'white' }}>
                    {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((key) => {
                      const isOpen = openSubFilter === key;
                      const val = draftFilters[key];
                      const isSet = val !== FILTER_OPTIONS[key][0];
                      return (
                        <div key={key} style={{ position: 'relative' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{key}</p>
                          <button
                            onClick={() => setOpenSubFilter(isOpen ? null : key)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                              height: 36, paddingLeft: 10, paddingRight: 10, borderRadius: 8,
                              border: `1.5px solid ${isSet ? '#655BD3' : '#E5E7EB'}`,
                              background: isSet ? '#F5F3FF' : '#F8FAFC',
                              fontSize: 12.5, fontWeight: isSet ? 600 : 500,
                              color: isSet ? '#655BD3' : '#374151',
                              cursor: 'pointer', transition: 'all 150ms',
                              whiteSpace: 'nowrap', overflow: 'hidden',
                            }}
                            onMouseEnter={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'; }}
                            onMouseLeave={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                            <ChevronDown size={12} strokeWidth={2} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                          </button>

                          {/* Sub-dropdown */}
                          {isOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '100%', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 60, overflow: 'hidden', paddingTop: 4, paddingBottom: 4 }}>
                              {FILTER_OPTIONS[key].map(option => {
                                const selected = draftFilters[key] === option;
                                return (
                                  <button
                                    key={option}
                                    onClick={() => { setDraftFilters(prev => ({ ...prev, [key]: option })); setOpenSubFilter(null); }}
                                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 12.5, fontWeight: selected ? 600 : 400, color: selected ? '#655BD3' : '#374151', background: selected ? '#F5F3FF' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'background 100ms' }}
                                    onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                                    onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                  >
                                    {option}
                                    {selected && <Check size={11} strokeWidth={2.5} style={{ color: '#655BD3', flexShrink: 0 }} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Panel footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 20px 14px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      style={{ height: 34, paddingLeft: 16, paddingRight: 16, borderRadius: 7, border: '1px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyLocationFilter}
                      style={{ height: 34, paddingLeft: 20, paddingRight: 20, borderRadius: 7, border: 'none', background: '#655BD3', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 150ms' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter By Date */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('date')}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: 34, paddingLeft: 14, paddingRight: 14,
                  borderColor: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-border)',
                  color: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-text-2)',
                  background: activeDropdown === 'date' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  fontSize: 13, fontWeight: 500,
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
            <div className="flex items-center gap-2 rounded-md border" style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)' }}>8</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Stores</span>
            </div>

            {/* ── Camera selector + original stat boxes ── */}
            <div style={{ display: 'flex', height: 34, borderRadius: 6, overflow: 'visible', border: '1px solid var(--color-border)', position: 'relative' }}>
              {/* "All Cameras ▾" label — dropdown trigger */}
              <button
                onClick={() => toggleDropdown('camera')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  height: '100%', paddingLeft: 12, paddingRight: 10,
                  background: activeDropdown === 'camera' ? '#F5F3FF' : 'var(--color-surface)',
                  border: 'none', borderRight: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  color: activeDropdown === 'camera' ? '#655BD3' : 'var(--color-text-2)',
                  whiteSpace: 'nowrap', borderRadius: '6px 0 0 6px',
                }}
                onMouseEnter={e => { if (activeDropdown !== 'camera') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (activeDropdown !== 'camera') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
              >
                {selectedCamera.label}
                <ChevronDown size={12} strokeWidth={2} style={{ color: 'var(--color-text-3)', transform: activeDropdown === 'camera' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>

              {/* Stat boxes — same styling as original */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: '#64748B', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{selectedCamera.total}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: '#2D8A55', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{selectedCamera.online}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 13px', background: selectedCamera.offline > 0 ? '#B54040' : '#2D8A55', borderRadius: '0 6px 6px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{selectedCamera.offline}</span>
              </div>

              {/* Camera dropdown */}
              {activeDropdown === 'camera' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 50, minWidth: 240, overflow: 'hidden', paddingTop: 4, paddingBottom: 4 }}>
                  {CAMERA_OPTIONS.map((opt, idx) => {
                    const active = selectedCameraIdx === idx;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => { setSelectedCameraIdx(idx); setActiveDropdown(null); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: active ? '#F5F3FF' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 120ms' }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {active && <Check size={11} strokeWidth={2.5} style={{ color: '#655BD3' }} />}
                          {!active && <span style={{ width: 11 }} />}
                          <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#655BD3' : '#374151' }}>{opt.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'white', background: '#64748B', borderRadius: 4, padding: '1px 5px' }}>{opt.total}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'white', background: '#2D8A55', borderRadius: 4, padding: '1px 5px' }}>{opt.online}</span>
                          {opt.offline > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'white', background: '#B54040', borderRadius: 4, padding: '1px 5px' }}>{opt.offline}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
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
      </div>
    </header>
  );
}
