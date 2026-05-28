'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Calendar, Store, RefreshCw, Settings, LogOut, UserCircle, TrendingUp, SlidersHorizontal, Video, Check, X, Lightbulb, ArrowUpRight, ArrowDownRight, Users, Target, Clock } from 'lucide-react';
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

// ── Insights of the Day Modal ─────────────────────────────────────────────────
const PURPLE = '#655BD3';

const HOURLY = [
  { h: '9am',  v: 210 }, { h: '10am', v: 380 }, { h: '11am', v: 520 },
  { h: '12pm', v: 680 }, { h: '1pm',  v: 750 }, { h: '2pm',  v: 710 },
  { h: '3pm',  v: 640 }, { h: '4pm',  v: 590 }, { h: '5pm',  v: 480 },
  { h: '6pm',  v: 320 }, { h: '7pm',  v: 190 },
];

const STORES_PERF = [
  { name: 'Marina Bay Sands', visitors: 15234, conv: 18.2, trend: 'up'   },
  { name: 'VivoCity',         visitors: 12800, conv: 15.3, trend: 'up'   },
  { name: 'Orchard Central',  visitors: 10900, conv: 14.1, trend: 'down' },
  { name: 'Bugis Junction',   visitors:  9450, conv: 12.7, trend: 'up'   },
  { name: 'Tampines Mall',    visitors: 11200, conv: 13.8, trend: 'down' },
];

function InsightsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const storeColors = [PURPLE, '#00CE9C', '#3B82F6', '#F59E0B', '#EC4899'];
  const maxStore = Math.max(...STORES_PERF.map(s => s.visitors));
  const maxConv  = 22;

  // Traffic chart — two lines: Footfall (purple) + Passerby (teal), analytics style
  const TRAFFIC = [
    { h: '9am',  footfall: 210, passerby: 1050 },
    { h: '10am', footfall: 380, passerby: 1820 },
    { h: '11am', footfall: 520, passerby: 2240 },
    { h: '12pm', footfall: 680, passerby: 2900 },
    { h: '1pm',  footfall: 750, passerby: 3200 },
    { h: '2pm',  footfall: 710, passerby: 2980 },
    { h: '3pm',  footfall: 640, passerby: 2650 },
    { h: '4pm',  footfall: 590, passerby: 2400 },
    { h: '5pm',  footfall: 480, passerby: 1920 },
    { h: '6pm',  footfall: 320, passerby: 1380 },
    { h: '7pm',  footfall: 190, passerby:  820 },
  ];
  const TW = 820, TH = 96;
  const maxT = Math.max(...TRAFFIC.map(d => d.passerby));
  const tx = (i: number) => 8 + (i / (TRAFFIC.length - 1)) * (TW - 16);
  const ty = (v: number) => TH - 4 - ((v / maxT) * (TH - 12));
  const footfallPts  = TRAFFIC.map((d, i) => `${tx(i)},${ty(d.footfall)}`).join(' ');
  const passerbyPts  = TRAFFIC.map((d, i) => `${tx(i)},${ty(d.passerby)}`).join(' ');
  const footfallArea = `M${tx(0)},${TH} ` + TRAFFIC.map((d, i) => `L${tx(i)},${ty(d.footfall)}`).join(' ') + ` L${tx(TRAFFIC.length - 1)},${TH}Z`;

  const insights = [
    { icon: <TrendingUp size={13} strokeWidth={1.5} />, color: PURPLE,    bg: '#EEE9FF', text: 'Peak at 1 PM — deploy extra staff 12:30–2:30 PM across all stores.' },
    { icon: <Users     size={13} strokeWidth={1.5} />, color: '#00CE9C',  bg: '#CCFBF1', text: 'Marina Bay leads at 18.2% conversion — replicate its zone layout system-wide.' },
    { icon: <Clock     size={13} strokeWidth={1.5} />, color: '#F59E0B',  bg: '#FEF3C7', text: 'Zone D dwell time 11.4 min — highest engagement. Prioritise premium inventory here.' },
    { icon: <Target    size={13} strokeWidth={1.5} />, color: '#3B82F6',  bg: '#DBEAFE', text: 'Orchard & Tampines declining — review queue times and checkout throughput.' },
  ];

  const recommendations = [
    { title: 'Staff reallocation',          body: 'Shift 2–3 floor associates to 12–3 PM peak windows across all 5 stores.',                             priority: 'High'   },
    { title: 'Zone A promotion push',        body: "Zone A dwell is 4.2 min — add interactive displays to lift engagement.",                               priority: 'Medium' },
    { title: 'Replicate top-performer layout', body: "Apply Marina Bay's aisle-width and signage pattern to VivoCity for conversion lift.",               priority: 'High'   },
  ];

  const priorityColor: Record<string, { bg: string; color: string }> = {
    High:   { bg: '#FEE2E2', color: '#DC2626' },
    Medium: { bg: '#FEF3C7', color: '#D97706' },
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#F9FAFB', borderRadius: 16, width: '100%', maxWidth: 940, maxHeight: '94vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0, background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EEE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE }}>
              <Lightbulb size={16} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Insights of the Day</p>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>AI-powered analysis · Updated 3 min ago</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

          {/* ── Row 1: Store Performance — two charts side by side ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Left: Visitor Count — horizontal progress bars (analytics style) */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Visitor Count by Store</p>
              <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 14 }}>Today's footfall per location</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STORES_PERF.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 82, fontSize: 11, fontWeight: 500, color: '#374151', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                    <div style={{ flex: 1, height: 9, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(s.visitors / maxStore) * 100}%`, height: '100%', background: storeColors[i], borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 38, fontSize: 11, fontWeight: 600, color: '#374151', textAlign: 'right', flexShrink: 0 }}>
                      {(s.visitors / 1000).toFixed(1)}K
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: s.trend === 'up' ? '#16A34A' : '#DC2626', flexShrink: 0, width: 36, textAlign: 'right' }}>
                      {s.trend === 'up' ? '↑' : '↓'} {s.conv}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Conversion Rate — vertical bar chart (analytics style) */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Conversion Rate by Store</p>
              <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 10 }}>Passerby-to-entry conversion %</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100 }}>
                {STORES_PERF.map((s, i) => {
                  const barPx = Math.round((s.conv / maxConv) * 82);
                  return (
                    <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: storeColors[i] }}>{s.conv}%</span>
                      <div style={{ width: '78%', height: barPx, background: storeColors[i], borderRadius: '4px 4px 0 0', opacity: 0.88 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F3F4F6', paddingTop: 6 }}>
                {STORES_PERF.map(s => (
                  <div key={s.name} style={{ flex: 1, fontSize: 7.5, color: '#9CA3AF', textAlign: 'center', fontWeight: 500 }}>
                    {s.name.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 2: Hourly Traffic Trends — analytics-style dual-line chart ── */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Hourly Traffic Trends</p>
                <p style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>Footfall vs. Passerby — all stores combined</p>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ c: PURPLE, l: 'Footfall' }, { c: '#00CE9C', l: 'Passerby' }].map(({ c, l }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 12, height: 3, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: 10.5, color: '#6B7280' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <svg viewBox={`0 0 ${TW} ${TH + 18}`} style={{ width: '100%', height: TH + 18, overflow: 'visible' }}>
              <defs>
                <linearGradient id="ins-fg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity="0.14" />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {/* Dashed gridlines — analytics style */}
              {[0.25, 0.5, 0.75, 1].map(p => (
                <line key={p} x1={0} y1={TH - 4 - p * (TH - 12)} x2={TW} y2={TH - 4 - p * (TH - 12)}
                  stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4,3" />
              ))}
              {/* Area fill under footfall */}
              <path d={footfallArea} fill="url(#ins-fg)" />
              {/* Passerby line */}
              <polyline points={passerbyPts} fill="none" stroke="#00CE9C" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
              {/* Footfall line */}
              <polyline points={footfallPts} fill="none" stroke={PURPLE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {/* Footfall dots */}
              {TRAFFIC.map((d, i) => (
                <circle key={i} cx={tx(i)} cy={ty(d.footfall)} r="2.5" fill="white" stroke={PURPLE} strokeWidth="1.5" />
              ))}
              {/* X axis labels */}
              {TRAFFIC.map((d, i) => (
                <text key={i} x={tx(i)} y={TH + 14} textAnchor="middle" fontSize="9" fill="#9CA3AF">{d.h}</text>
              ))}
            </svg>
          </div>

          {/* ── Row 3: Key Insights + Recommendations — side by side ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Key Insights */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Key Insights</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: ins.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ins.color, flexShrink: 0 }}>
                      {ins.icon}
                    </div>
                    <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.55, margin: 0 }}>{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Actionable Recommendations</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 9 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#EEE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.title}</p>
                        <span style={{ padding: '2px 6px', borderRadius: 9999, fontSize: 9.5, fontWeight: 600, background: priorityColor[r.priority].bg, color: priorityColor[r.priority].color }}>{r.priority}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function TopBar() {
  const { triggerRefresh } = useDashboardContext();
  const pathname = usePathname();
  const showQualifiedShopper = pathname?.startsWith('/dashboard/analytics') ?? false;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [showInsights, setShowInsights] = useState(false);

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
  const [savedTitle, setSavedTitle]   = useState('');
  const [draftTitle, setDraftTitle]   = useState('');
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
    setDraftTitle(savedTitle);
    setDraftMin(savedMin);
    setDraftMax(savedMax);
    setDraftGenders(new Set(savedGenders));
    setDraftExclude(savedExclude);
    toggleDropdown('shoppers');
  };

  const saveQs = () => {
    setSavedTitle(draftTitle.trim());
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
  <>
    <header className="flex-shrink-0" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', transition: 'background 200ms ease, border-color 200ms ease' }}>

      {/* ── Main top row ── */}
      <div className="flex items-center justify-between" style={{ height: 'var(--topbar-height)', paddingLeft: 'var(--content-padding)', paddingRight: 'var(--content-padding)' }}>
        {/* Left — Landmark logo */}
        <img src="/landmark-logo.png" alt="Landmark Group" style={{ height: 22, width: 'auto', objectFit: 'contain', maxWidth: 130 }} />

        {/* Right */}
        <div className="flex items-center gap-3 relative" ref={rightSectionRef}>

          {/* Insights of the Day */}
          <button className="flex items-center gap-2 border transition-colors" style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderRadius: 6, borderColor: '#DDD6FE', color: '#655BD3', background: '#F5F3FF', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={() => setShowInsights(true)}
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
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#655BD3' }}>{savedTitle || 'Active'}: Age {savedMin}–{savedMax} · {genderLabel}{savedExclude ? ' · Kids excl.' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Custom title */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter Name</p>
                      <input
                        type="text"
                        placeholder="e.g. High-Intent Adults"
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          border: '1px solid #E5E7EB', borderRadius: 6,
                          padding: '7px 10px', fontSize: 13,
                          color: '#111827', outline: 'none',
                          transition: 'border-color 150ms ease',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                      />
                      <p style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 4, lineHeight: 1.4 }}>
                        Shown in place of "Active" once saved
                      </p>
                    </div>
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

            {/* Total Alerts stat chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              height: 34, paddingLeft: 12, paddingRight: 12,
              borderRadius: 6, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>Total Alerts</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-1)' }}>
                {selectedCamera.offline}
              </span>
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

    {/* Insights of the Day modal — rendered outside <header> to escape stacking context */}
    {showInsights && <InsightsModal onClose={() => setShowInsights(false)} />}
  </>
  );
}
