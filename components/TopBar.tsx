'use client';
import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { Bell, ChevronDown, Calendar, Store, RefreshCw, Settings, LogOut, UserCircle, TrendingUp, TrendingDown, SlidersHorizontal, Eye, Check, X, ArrowUpRight, ArrowDownRight, Users, Target, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HomeVariantToggle } from '@/components/HomeVariantToggle';
import { DateCalendarPanel, isoToDate, dateToIso } from '@/components/DateCalendarPanel';
import { usePathname } from 'next/navigation';
import { useDashboardContext } from '@/components/DashboardProvider';

type DropdownType = 'shoppers' | 'bell' | 'alerts' | 'avatar' | 'date' | 'locationFilter' | null;

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
const PURPLE = 'var(--color-primary)';

const STORES_PERF = [
  { name: 'Marina Bay Sands', visitors: 15234, conv: 18.2, trend: 'up'   },
  { name: 'VivoCity',         visitors: 12800, conv: 15.3, trend: 'up'   },
  { name: 'Orchard Central',  visitors: 10900, conv: 14.1, trend: 'down' },
  { name: 'Bugis Junction',   visitors:  9450, conv: 12.7, trend: 'up'   },
  { name: 'Tampines Mall',    visitors: 11200, conv: 13.8, trend: 'down' },
];

function InsightsModal({ onClose }: { onClose: () => void }) {
  const [slideOpen, setSlideOpen] = useState(false);

  const handleClose = useCallback(() => {
    setSlideOpen(false);
    window.setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSlideOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', esc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose]);

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
  const TW = 380, TH = 80;
  const maxT = Math.max(...TRAFFIC.map(d => d.passerby));
  const tx = (i: number) => 8 + (i / (TRAFFIC.length - 1)) * (TW - 16);
  const ty = (v: number) => TH - 4 - ((v / maxT) * (TH - 12));
  const footfallPts  = TRAFFIC.map((d, i) => `${tx(i)},${ty(d.footfall)}`).join(' ');
  const passerbyPts  = TRAFFIC.map((d, i) => `${tx(i)},${ty(d.passerby)}`).join(' ');
  const footfallArea = `M${tx(0)},${TH} ` + TRAFFIC.map((d, i) => `L${tx(i)},${ty(d.footfall)}`).join(' ') + ` L${tx(TRAFFIC.length - 1)},${TH}Z`;

  const insights = [
    {
      icon: <TrendingDown size={16} strokeWidth={2} />,
      color: 'var(--color-error)',
      bg: 'var(--color-error-light)',
      text: 'Marina Bay conversion dipped 5% below usual at 5 PM — review hourly staffing and zone engagement.',
    },
    { icon: <Users size={16} strokeWidth={2} />, color: '#00CE9C', bg: 'var(--color-secondary-light)', text: 'Marina Bay leads at 18.2% conversion — replicate its zone layout system-wide.' },
  ];

  const recommendations = [
    { title: 'Staff reallocation',   body: 'Shift 2–3 floor associates to 12–3 PM peak windows across all 5 stores.', priority: 'High' },
    { title: 'Zone A promotion push', body: 'Zone A dwell is 4.2 min — add interactive displays to lift engagement.', priority: 'Medium' },
  ];

  const priorityColor: Record<string, { bg: string; color: string; border: string }> = {
    High:   { bg: 'var(--color-error-light)', color: 'var(--color-error)', border: '#FECACA' },
    Medium: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: '#FDE68A' },
  };

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-3)',
    margin: '0 0 10px',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'var(--color-overlay-heavy)',
          backdropFilter: 'blur(3px)',
          opacity: slideOpen ? 1 : 0,
          transition: 'opacity 320ms ease',
        }}
        onClick={handleClose}
      />

      {/* Right slide-in panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Insights of the Day"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: '100%',
          maxWidth: 540,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-page-bg)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-modal)',
          transform: slideOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--color-border)',
          flexShrink: 0, background: 'var(--color-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-bg) 100%)',
              border: '1px solid var(--color-accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE,
            }}>
              <TrendingUp size={18} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-1)', margin: 0, letterSpacing: '-0.02em' }}>
                Insights of the Day
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-3)', marginTop: 4, fontWeight: 500 }}>
                AI-powered analysis · Updated 3 min ago
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close insights"
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, padding: '20px 22px 28px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

          {/* Primary: Insights & recommendations */}
          <section
            aria-labelledby="insights-primary-heading"
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-accent-border)',
              borderRadius: 14,
              padding: '20px 20px 18px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
              paddingBottom: 14, borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <Target size={16} strokeWidth={2} style={{ color: PURPLE, flexShrink: 0 }} />
              <h2 id="insights-primary-heading" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>
                Insights &amp; Recommendations
              </h2>
            </div>

            <p style={sectionLabel}>Key insights</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {insights.map((ins, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 14px',
                    background: 'var(--color-surface)',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: ins.bg, border: `1px solid ${ins.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: ins.color, flexShrink: 0,
                  }}>
                    {ins.icon}
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-text-1)', lineHeight: 1.55, margin: 0, alignSelf: 'center' }}>
                    {ins.text}
                  </p>
                </div>
              ))}
            </div>

            <p style={sectionLabel}>What to do next</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommendations.map((r, i) => {
                const pri = priorityColor[r.priority];
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: 0, overflow: 'hidden',
                      borderRadius: 10, border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ width: 4, flexShrink: 0, background: pri.color }} />
                    <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: 0, lineHeight: 1.35 }}>
                          <span style={{ color: PURPLE, marginRight: 6 }}>{i + 1}.</span>
                          {r.title}
                        </p>
                        <span style={{
                          padding: '3px 9px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700,
                          background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`,
                          flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {r.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.55, margin: 0 }}>
                        {r.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Supporting charts */}
          <div>
            <p style={{ ...sectionLabel, marginBottom: 12 }}>Supporting data</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow-xs)',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 4px' }}>Visitor count by store</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 14 }}>Today&apos;s footfall</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {STORES_PERF.map((s, i) => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 108, fontSize: 12, fontWeight: 600, color: 'var(--color-text-1)',
                        flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.name}
                      </span>
                      <div style={{ flex: 1, height: 10, background: 'var(--color-surface-3)', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${(s.visitors / maxStore) * 100}%`, height: '100%', background: storeColors[i], borderRadius: 5 }} />
                      </div>
                      <span style={{ width: 40, fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', textAlign: 'right', flexShrink: 0 }}>
                        {(s.visitors / 1000).toFixed(1)}K
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow-xs)',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 4px' }}>Hourly traffic trends</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>Footfall vs. passerby</p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                  {[{ c: PURPLE, l: 'Footfall' }, { c: '#00CE9C', l: 'Passerby' }].map(({ c, l }) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 14, height: 3, borderRadius: 2, background: c }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)' }}>{l}</span>
                    </div>
                  ))}
                </div>
                <svg viewBox={`0 0 ${TW} ${TH + 16}`} style={{ width: '100%', height: TH + 16, overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="ins-fg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PURPLE} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={PURPLE} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75, 1].map(p => (
                    <line key={p} x1={0} y1={TH - 4 - p * (TH - 12)} x2={TW} y2={TH - 4 - p * (TH - 12)}
                      stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4,3" />
                  ))}
                  <path d={footfallArea} fill="url(#ins-fg)" />
                  <polyline points={passerbyPts} fill="none" stroke="#00CE9C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  <polyline points={footfallPts} fill="none" stroke={PURPLE} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                  {TRAFFIC.map((d, i) => (
                    <circle key={i} cx={tx(i)} cy={ty(d.footfall)} r="2.5" fill="var(--color-surface)" stroke={PURPLE} strokeWidth="1.5" />
                  ))}
                  {TRAFFIC.filter((_, i) => i % 2 === 0).map((d, idx) => {
                    const i = idx * 2;
                    return (
                      <text key={i} x={tx(i)} y={TH + 12} textAnchor="middle" fontSize="9.5" fontWeight="500" fill="var(--color-text-3)">{d.h}</text>
                    );
                  })}
                </svg>
              </div>

              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow-xs)',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 4px' }}>Conversion rate by store</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>Passerby-to-entry conversion %</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 96 }}>
                  {STORES_PERF.map((s, i) => {
                    const barPx = Math.round((s.conv / maxConv) * 76);
                    return (
                      <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: storeColors[i] }}>{s.conv}%</span>
                        <div style={{ width: '76%', height: barPx, background: storeColors[i], borderRadius: '5px 5px 0 0' }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4 }}>
                  {STORES_PERF.map(s => (
                    <div key={s.name} style={{ flex: 1, fontSize: 10, color: 'var(--color-text-3)', textAlign: 'center', fontWeight: 600 }}>
                      {s.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}

const MOCK_STORE_ALERTS = [
  { id: 1, store: 'Marina Bay Sands', message: 'Queue depth exceeded threshold (40 min)', severity: 'high' as const, time: '12 min ago' },
  { id: 2, store: 'Bugis Junction', message: 'Entrance camera offline — North Entry', severity: 'high' as const, time: '28 min ago' },
  { id: 3, store: 'VivoCity', message: 'Footfall 32% below daily average', severity: 'medium' as const, time: '1 hr ago' },
];

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateFieldLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function TopBar() {
  const { triggerRefresh, insightsOpen, setInsightsOpen } = useDashboardContext();
  const pathname = usePathname();
  const isLiveFeed = pathname?.startsWith('/dashboard/live') ?? false;
  const isTeamPage = pathname?.startsWith('/dashboard/team') ?? false;
  const isAnalytics = pathname?.startsWith('/dashboard/analytics') ?? false;
  const isHomePage = pathname === '/dashboard' || pathname === '/dashboard/';
  const showQualifiedShopper = isAnalytics;
  const showDateFilter = !isLiveFeed && !isTeamPage;
  const showLocationFilter = !isLiveFeed;
  const showStoreCameraStats = !isLiveFeed && !isTeamPage;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekAgoIso = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const [dateStart, setDateStart] = useState(weekAgoIso);
  const [dateEnd, setDateEnd] = useState(todayIso);
  const [draftDateStart, setDraftDateStart] = useState(weekAgoIso);
  const [draftDateEnd, setDraftDateEnd] = useState(todayIso);
  const [datePickField, setDatePickField] = useState<'from' | 'to'>('from');
  const [calendarMonth, setCalendarMonth] = useState(() => isoToDate(weekAgoIso));

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

          {/* Qualified Shopper — analytics only */}
          {showQualifiedShopper ? (
            <div className="relative">
              <button onClick={openQsDropdown} className="flex items-center gap-2 rounded-md px-3 transition-colors border" style={{ height: 34, background: qsEnabled ? 'var(--color-accent-bg)' : 'var(--color-surface)', borderColor: qsEnabled ? 'var(--color-accent-border)' : 'var(--color-border)', color: 'var(--color-text-1)' }}>
                <Settings size={14} strokeWidth={1.5} style={{ color: qsEnabled ? 'var(--color-primary)' : 'var(--color-text-3)' }} />
                <span className="text-[13px] font-semibold" style={{ color: qsEnabled ? 'var(--color-primary)' : 'var(--color-text-2)', whiteSpace: 'nowrap' }}>Qualified Shopper</span>
              </button>
              {activeDropdown === 'shoppers' && (
                <div className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border z-50" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', width: 288 }}>
                  <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>Qualified Shopper</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-4)' }}>Set age &amp; gender filters</p>
                    {qsEnabled && (
                      <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 6, background: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary-emphasis)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-primary)' }}>{savedTitle || 'Active'}: Age {savedMin}–{savedMax} · {genderLabel}{savedExclude ? ' · Kids excl.' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Custom title */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-3)' }}>Filter Name</p>
                      <input
                        type="text"
                        placeholder="e.g. High-Intent Adults"
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          border: '1px solid var(--color-border)', borderRadius: 6,
                          padding: '7px 10px', fontSize: 13,
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text-1)', outline: 'none',
                          transition: 'border-color 150ms ease',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                      />
                      <p style={{ fontSize: 10.5, color: 'var(--color-text-4)', marginTop: 4, lineHeight: 1.4 }}>
                        Shown in place of "Active" once saved
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-3)' }}>Age Range</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-4)' }}>Min</label>
                          <input type="number" value={draftMin} onChange={e => setDraftMin(Number(e.target.value))} className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold outline-none" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-1)' }} min={0} max={draftMax} onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-text-4)', flexShrink: 0 }}>—</span>
                        <div className="flex-1">
                          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-4)' }}>Max</label>
                          <input type="number" value={draftMax} onChange={e => setDraftMax(Number(e.target.value))} className="w-full border rounded-md px-2.5 py-1.5 text-sm font-semibold outline-none" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-1)' }} min={draftMin} max={120} onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-3)' }}>Gender</p>
                      <div className="flex items-center gap-2">
                        {['Male', 'Female'].map(g => {
                          const on = draftGenders.has(g);
                          return (
                            <button key={g} onClick={() => toggleGender(g)} className="flex-1 py-1.5 rounded text-xs font-semibold border transition-all" style={{ background: on ? 'var(--color-primary-emphasis)' : 'transparent', borderColor: on ? 'var(--color-primary-emphasis)' : 'var(--color-border)', color: on ? 'var(--color-on-primary)' : 'var(--color-text-2)' }}>{g}</button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={draftExclude} onChange={e => setDraftExclude(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-primary-emphasis)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>Exclude children (under 13)</span>
                    </label>
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <button onClick={() => setActiveDropdown(null)} style={{ flex: 1, height: 36, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveQs} className="transition-opacity hover:opacity-90" style={{ flex: 2, height: 36, borderRadius: 6, border: 'none', background: 'var(--color-primary-emphasis)', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Apply &amp; Save</button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

          {isHomePage ? <HomeVariantToggle /> : null}

          <ThemeToggle />

          {/* Bell */}
          <div className="relative">
            <button onClick={() => toggleDropdown('bell')} className="relative p-2 rounded-md transition-colors" style={{ color: 'var(--color-text-3)' }} aria-label="Notifications"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)' }} />
            </button>
            {activeDropdown === 'bell' && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border z-50" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>Notifications</span>
                  <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Mark all read</button>
                </div>
                <div>
                  {[
                    { color: '#ef4444', title: 'High queue at Marina Bay Sands', desc: 'Zone A wait time exceeded 15 min', time: '2m ago' },
                    { color: '#22c55e', title: 'Footfall target reached',          desc: 'VivoCity hit 12,000 visitors',         time: '14m ago' },
                    { color: '#3b82f6', title: 'Weekly report ready',              desc: 'May 25 analytics summary available',   time: '1h ago' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text-1)' }}>{n.title}</p>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-4)' }}>{n.desc}</p>
                      </div>
                      <span className="flex-shrink-0 mt-0.5" style={{ fontSize: 11, color: 'var(--color-text-4)' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--color-primary-emphasis)', color: 'var(--color-on-primary)' }}>AM</div>
              <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
            </button>
            {activeDropdown === 'avatar' && (
              <div className="absolute top-full right-0 mt-2 w-52 rounded-lg shadow-xl border z-50 overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex flex-col items-center py-4 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2" style={{ background: 'var(--color-primary-emphasis)', color: 'var(--color-on-primary)' }}>AM</div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>Admin Manager</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-4)' }}>admin@olyretail.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm transition-colors" style={{ color: 'var(--color-text-2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  ><UserCircle size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-4)' }} />My Profile</button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm transition-colors" style={{ color: 'var(--color-text-2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  ><Settings size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-4)' }} />Account Settings</button>
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm transition-colors" style={{ color: 'var(--color-text-2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  ><Bell size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-4)' }} />Notifications</button>
                  <div className="my-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
                  <button className="w-full h-10 px-4 flex items-center gap-2.5 text-sm transition-colors" style={{ color: '#EF4444' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-error-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  ><LogOut size={15} strokeWidth={1.5} />Sign Out</button>
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
              : pathname?.startsWith('/dashboard/reports') ? 'Reports'
              : pathname?.startsWith('/dashboard/preferences') ? 'Preferences'
              : 'Dashboard'}
          </p>

          <div className="flex items-center gap-2">

            {isAnalytics && (
              <button
                type="button"
                onClick={() => { window.location.href = '/dashboard/analytics?action=view-snapshots'; }}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: 34, paddingLeft: 14, paddingRight: 14,
                  borderColor: 'var(--color-accent-border)', color: 'var(--color-primary)',
                  background: 'var(--color-accent-bg)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                <Eye size={14} strokeWidth={1.5} />
                View Snapshots
              </button>
            )}

            {/* ── Filter button ── */}
            {showLocationFilter && (
            <div className="relative">
              <button
                onClick={openLocationFilter}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: 34, paddingLeft: 14, paddingRight: 14,
                  borderColor: activeDropdown === 'locationFilter' || hasActiveFilters ? 'var(--color-primary)' : 'var(--color-border)',
                  color: activeDropdown === 'locationFilter' || hasActiveFilters ? 'var(--color-primary)' : 'var(--color-text-2)',
                  background: activeDropdown === 'locationFilter' || hasActiveFilters ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                  fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={e => { if (!hasActiveFilters && activeDropdown !== 'locationFilter') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (!hasActiveFilters && activeDropdown !== 'locationFilter') (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
              >
                <SlidersHorizontal size={13} strokeWidth={1.5} />
                Filter
                {hasActiveFilters && (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-primary-emphasis)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}>
                    {Object.values(appliedFilters).filter((v, i) => v !== Object.values(emptyFilters)[i]).length}
                  </span>
                )}
              </button>

              {/* ── Location filter panel ── */}
              {activeDropdown === 'locationFilter' && (
                <div
                  className="absolute top-full mt-2 rounded-xl shadow-2xl border z-50"
                  style={{ left: 0, width: 560, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                >
                  {/* Panel header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SlidersHorizontal size={14} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-1)' }}>Filter by Location</span>
                    </div>
                    <button onClick={clearAllFilters} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={11} strokeWidth={2} />
                      Clear all
                    </button>
                  </div>

                  {/* 3-2 filter grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '14px 20px 16px', background: 'var(--color-surface)' }}>
                    {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((key) => {
                      const isOpen = openSubFilter === key;
                      const val = draftFilters[key];
                      const isSet = val !== FILTER_OPTIONS[key][0];
                      return (
                        <div key={key} style={{ position: 'relative' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{key}</p>
                          <button
                            onClick={() => setOpenSubFilter(isOpen ? null : key)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                              height: 36, paddingLeft: 10, paddingRight: 10, borderRadius: 8,
                              border: `1.5px solid ${isSet ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              background: isSet ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                              fontSize: 12.5, fontWeight: isSet ? 600 : 500,
                              color: isSet ? 'var(--color-primary)' : 'var(--color-text-2)',
                              cursor: 'pointer', transition: 'all 150ms',
                              whiteSpace: 'nowrap', overflow: 'hidden',
                            }}
                            onMouseEnter={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'; }}
                            onMouseLeave={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                            <ChevronDown size={12} strokeWidth={2} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                          </button>

                          {/* Sub-dropdown */}
                          {isOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 60, overflow: 'hidden', paddingTop: 4, paddingBottom: 4 }}>
                              {FILTER_OPTIONS[key].map(option => {
                                const selected = draftFilters[key] === option;
                                return (
                                  <button
                                    key={option}
                                    onClick={() => { setDraftFilters(prev => ({ ...prev, [key]: option })); setOpenSubFilter(null); }}
                                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 12.5, fontWeight: selected ? 600 : 400, color: selected ? 'var(--color-primary)' : 'var(--color-text-2)', background: selected ? 'var(--color-accent-bg)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'background 100ms' }}
                                    onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                                    onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                  >
                                    {option}
                                    {selected && <Check size={11} strokeWidth={2.5} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 20px 14px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      style={{ height: 34, paddingLeft: 16, paddingRight: 16, borderRadius: 7, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyLocationFilter}
                      style={{ height: 34, paddingLeft: 20, paddingRight: 20, borderRadius: 7, border: 'none', background: 'var(--color-primary-emphasis)', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 150ms' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Date range picker */}
            {showDateFilter && (
            <div className="relative">
              <button
                onClick={() => {
                  setDraftDateStart(dateStart);
                  setDraftDateEnd(dateEnd);
                  setDatePickField('from');
                  setCalendarMonth(isoToDate(dateStart));
                  toggleDropdown('date');
                }}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: 34, paddingLeft: 14, paddingRight: 14,
                  borderColor: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-border)',
                  color: activeDropdown === 'date' ? 'var(--color-primary)' : 'var(--color-text-2)',
                  background: activeDropdown === 'date' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                <Calendar size={14} strokeWidth={1.5} />
                {formatDateLabel(dateStart)} – {formatDateLabel(dateEnd)}
              </button>
              {activeDropdown === 'date' && (
                <div className="oly-date-range-popover">
                  <p className="oly-date-range-popover__title">Select date range</p>
                  <div className="oly-date-range-fields">
                    {(['from', 'to'] as const).map(field => {
                      const active = datePickField === field;
                      const iso = field === 'from' ? draftDateStart : draftDateEnd;
                      return (
                        <button
                          key={field}
                          type="button"
                          className={`oly-date-range-field${active ? ' oly-date-range-field--active' : ''}`}
                          onClick={() => {
                            setDatePickField(field);
                            setCalendarMonth(isoToDate(iso));
                          }}
                        >
                          <span className="oly-date-range-field__label">{field === 'from' ? 'From' : 'To'}</span>
                          <span className="oly-date-range-field__value">{formatDateFieldLabel(iso)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <DateCalendarPanel
                    className="oly-calendar--embedded oly-calendar--compact"
                    viewMonth={calendarMonth}
                    onViewMonthChange={setCalendarMonth}
                    selected={isoToDate(datePickField === 'from' ? draftDateStart : draftDateEnd)}
                    maxDate={datePickField === 'from' ? isoToDate(draftDateEnd) : isoToDate(todayIso)}
                    minDate={datePickField === 'to' ? isoToDate(draftDateStart) : undefined}
                    onSelect={d => {
                      const iso = dateToIso(d);
                      if (datePickField === 'from') {
                        setDraftDateStart(iso);
                        if (iso > draftDateEnd) setDraftDateEnd(iso);
                      } else {
                        setDraftDateEnd(iso);
                      }
                    }}
                  />
                  <div className="oly-date-range-presets">
                    {[
                      { label: 'Today', start: todayIso, end: todayIso },
                      { label: 'Last 7 days', start: weekAgoIso, end: todayIso },
                      { label: 'Last 30 days', start: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), end: todayIso },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        className="oly-date-range-preset"
                        onClick={() => { setDraftDateStart(preset.start); setDraftDateEnd(preset.end); }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="oly-date-range-apply"
                    onClick={() => { setDateStart(draftDateStart); setDateEnd(draftDateEnd); setActiveDropdown(null); }}
                  >
                    Apply range
                  </button>
                </div>
              )}
            </div>
            )}

            {showStoreCameraStats && (
            <>
            {/* Stores */}
            <div className="flex items-center gap-2 rounded-md border" style={{ height: 34, paddingLeft: 14, paddingRight: 14, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <Store size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)' }}>8</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Stores</span>
            </div>

            {/* Total Alerts — clickable CTA */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('alerts')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  height: 34, paddingLeft: 12, paddingRight: 12,
                  borderRadius: 6, border: `1px solid ${activeDropdown === 'alerts' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: activeDropdown === 'alerts' ? 'var(--color-error-light)' : 'var(--color-surface)',
                  flexShrink: 0, cursor: 'pointer',
                }}
              >
                <Bell size={14} strokeWidth={1.5} style={{ color: '#DC2626' }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
                  {MOCK_STORE_ALERTS.length} Alerts
                </span>
                <ChevronDown size={12} strokeWidth={2} style={{ color: 'var(--color-text-4)' }} />
              </button>
              {activeDropdown === 'alerts' && (
                <div className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border z-50" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', width: 320 }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>Store alerts</span>
                  </div>
                  {MOCK_STORE_ALERTS.map((a, i) => (
                    <div key={a.id} className="px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-1)', margin: 0 }}>{a.store}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.4 }}>{a.message}</p>
                      <span style={{ fontSize: 10.5, color: 'var(--color-text-4)', marginTop: 4, display: 'block' }}>{a.time}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                    <button type="button" className="text-xs font-medium" style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>View all alerts</button>
                  </div>
                </div>
              )}
            </div>
            </>
            )}

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
    {insightsOpen && <InsightsModal onClose={() => setInsightsOpen(false)} />}
  </>
  );
}
