'use client';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, BarChart2, Clock, X, ChevronRight } from 'lucide-react';

const PURPLE = 'var(--color-primary)';

// ── Preview components ─────────────────────────────────────────────────────────

/** Zone traffic — clean 3-shade purple heatmap (replaces noisy rainbow version) */
function ZoneTrafficPreview({ compact = false }: { compact?: boolean }) {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const hours  = ['9am', '11am', '1pm', '3pm', '5pm', '7pm'];
  const data   = [
    [0.2, 0.4, 0.6, 0.85, 0.5, 0.2],
    [0.3, 0.65, 0.9, 1.0, 0.8, 0.35],
    [0.35, 0.7, 1.0, 1.0, 0.75, 0.4],
    [0.15, 0.3, 0.5, 0.6, 0.4, 0.2],
  ];
  // 3 shades of brand purple — no rainbow
  const shade = (v: number) =>
    v < 0.4 ? 'var(--color-heatmap-low)' : v < 0.75 ? 'var(--color-heatmap-mid)' : 'var(--color-heatmap-high)';

  const cellH = compact ? 14 : 18;
  const fs    = compact ? 8 : 8.5;
  const pad   = compact ? '8px 12px 4px' : '10px 14px 6px';

  return (
    <div style={{ padding: pad }}>
      <div style={{ display: 'flex', marginLeft: 38, marginBottom: 3 }}>
        {hours.map(h => <div key={h} style={{ flex: 1, fontSize: fs, color: 'var(--color-text-4)', textAlign: 'center', fontWeight: 600 }}>{h}</div>)}
      </div>
      {zones.map((z, ri) => (
        <div key={z} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: compact ? 2 : 3 }}>
          <span style={{ width: 34, fontSize: fs, color: 'var(--color-text-3)', fontWeight: 600, flexShrink: 0 }}>{z}</span>
          {data[ri].map((v, ci) => (
            <div key={ci} style={{ flex: 1, height: cellH, borderRadius: 3, background: shade(v) }} />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 38, marginTop: 4 }}>
        <span style={{ fontSize: 8, color: 'var(--color-text-4)' }}>Low</span>
        {['var(--color-heatmap-low)', 'var(--color-heatmap-mid)', 'var(--color-heatmap-high)'].map(c => (
          <div key={c} style={{ flex: 1, height: 4, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 8, color: 'var(--color-text-4)' }}>High</span>
      </div>
    </div>
  );
}

/** Dual-line forecast chart */
function ForecastPreview({ compact = false }: { compact?: boolean }) {
  const W = 280, H = compact ? 65 : 80;
  const hist = [380, 440, 500, 420, 360, 430, 510, 560, 590, 540, 490, 460];
  const pred  = [460, 510, 545, 575, 555, 530];
  const all   = [...hist, ...pred];
  const mn    = Math.min(...all) - 20, mx = Math.max(...all) + 20;
  const tx    = (i: number, tot: number) => (i / (tot - 1)) * W;
  const ty    = (v: number) => H - ((v - mn) / (mx - mn)) * H;
  const hPts  = hist.map((v, i) => `${tx(i, 18)},${ty(v)}`).join(' ');
  const pPts  = [hist[hist.length - 1], ...pred].map((v, i) => `${tx(hist.length - 1 + i, 18)},${ty(v)}`).join(' ');
  const area  = `M0,${H} ` + hist.map((v, i) => `L${tx(i, 18)},${ty(v)}`).join(' ') + ` L${tx(hist.length - 1, 18)},${H}Z`;

  return (
    <div style={{ padding: compact ? '8px 12px 4px' : '10px 14px 4px' }}>
      {!compact && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          {[{ c: PURPLE, l: 'Historical' }, { c: '#00CE9C', l: 'AI Forecast', dash: true }].map(({ c, l, dash }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke={c} strokeWidth="2" strokeDasharray={dash ? '3,2' : undefined} /></svg>
              <span style={{ fontSize: 8.5, color: 'var(--color-text-3)', fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible' }}>
        <defs>
          <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.15" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(p => <line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="var(--color-border-subtle)" strokeWidth="1" />)}
        <path d={area} fill="url(#fg2)" />
        <polyline points={hPts} fill="none" stroke={PURPLE} strokeWidth="1.8" strokeLinejoin="round" />
        <polyline points={pPts} fill="none" stroke="#00CE9C" strokeWidth="1.8" strokeDasharray="4,3" strokeLinejoin="round" />
        <line x1={tx(hist.length - 1, 18)} y1={0} x2={tx(hist.length - 1, 18)} y2={H} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    </div>
  );
}

/** Grouped bar chart — multi-store comparison */
function ComparisonPreview({ compact = false }: { compact?: boolean }) {
  const stores = ['Marina Bay', 'VivoCity', 'Orchard', 'Bugis', 'Tampines'];
  const vals   = [15234, 12800, 10900, 9450, 11200];
  const conv   = [18.2, 15.3, 14.1, 12.7, 13.8];
  const maxV   = 16000;
  const colors = [PURPLE, '#00CE9C', '#3B82F6', '#F59E0B', '#EC4899'];
  const barH   = compact ? 68 : 108;

  return (
    <div style={{ padding: compact ? '8px 10px 4px' : '10px 14px 4px' }}>
      <div style={{ display: 'flex', gap: compact ? 5 : 7, alignItems: 'flex-end', height: barH }}>
        {stores.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: colors[i] }}>{conv[i]}%</span>
            <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: Math.round((vals[i] / maxV) * (barH - 18)), background: colors[i], opacity: 0.88 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: compact ? 5 : 7, borderTop: '1px solid var(--color-border-subtle)', paddingTop: 5 }}>
        {stores.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', fontSize: 7.5, color: 'var(--color-text-4)', fontWeight: 500 }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bar chart — dwell time by zone */
function DwellTimePreview({ compact = false }: { compact?: boolean }) {
  const zones = [
    { label: 'Entrance',  avg: 2.4,  color: PURPLE },
    { label: 'Zone A',    avg: 4.2,  color: '#00CE9C' },
    { label: 'Zone B',    avg: 8.7,  color: '#3B82F6' },
    { label: 'Zone C',    avg: 3.1,  color: '#F59E0B' },
    { label: 'Zone D',    avg: 11.4, color: '#EC4899' },
    { label: 'Checkout',  avg: 6.8,  color: '#8B5CF6' },
  ];
  const max = 13;
  const barH = compact ? 10 : 13;
  const gap  = compact ? 6 : 9;
  return (
    <div style={{ padding: compact ? '8px 12px 4px' : '10px 14px 6px', display: 'flex', flexDirection: 'column', gap }}>
      {zones.map(z => (
        <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 42, fontSize: 8, color: 'var(--color-text-3)', fontWeight: 600, flexShrink: 0 }}>{z.label}</span>
          <div style={{ flex: 1, height: barH, background: 'var(--color-border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(z.avg / max) * 100}%`, height: '100%', background: z.color, borderRadius: 3 }} />
          </div>
          <span style={{ width: 26, fontSize: 8, fontWeight: 700, color: 'var(--color-text-2)', textAlign: 'right' }}>{z.avg}m</span>
        </div>
      ))}
    </div>
  );
}

// ── 4-slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1, title: 'Heatmap widget',          date: 'May 26',
    desc: 'Visualize foot traffic density across store zones using a clean single-tone heatmap.',
    icon: <BarChart2 size={12} strokeWidth={1.5} />,
    preview:        <ZoneTrafficPreview />,
    previewCompact: <ZoneTrafficPreview compact />,
  },
  {
    id: 2, title: 'AI footfall predictions', date: 'May 23',
    desc: 'ML-powered daily and hourly footfall forecasting with historical vs. predicted view.',
    icon: <TrendingUp size={12} strokeWidth={1.5} />,
    preview:        <ForecastPreview />,
    previewCompact: <ForecastPreview compact />,
  },
  {
    id: 3, title: 'Multi-store comparison',  date: 'May 20',
    desc: 'Side-by-side KPI comparison across up to 4 stores with conversion overlay.',
    icon: <BarChart2 size={12} strokeWidth={1.5} />,
    preview:        <ComparisonPreview />,
    previewCompact: <ComparisonPreview compact />,
  },
  {
    id: 4, title: 'Dwell time analytics',    date: 'May 17',
    desc: 'Track average customer dwell time per zone to identify high-engagement areas.',
    icon: <Clock size={12} strokeWidth={1.5} />,
    preview:        <DwellTimePreview />,
    previewCompact: <DwellTimePreview compact />,
  },
];

const INTERVAL = 7000;

// ── "View All" modal ───────────────────────────────────────────────────────────
function ViewAllModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 760,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>What&apos;s New</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Latest platform features &amp; updates</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-3)', transition: 'background 120ms' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* 2×2 grid of feature cards */}
        <div style={{ overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {SLIDES.map(s => (
              <div key={s.id} style={{
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 10,
                overflow: 'hidden',
                background: 'var(--color-surface)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 150ms',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
              >
                {/* Preview */}
                <div style={{ height: 110, background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
                  {s.previewCompact}
                </div>
                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE }}>
                        {s.icon}
                      </div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-1)' }}>{s.title}</p>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-4)' }}>{s.date}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.55, paddingLeft: 26 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Carousel ───────────────────────────────────────────────────────────────────
export function WhatsNewCarousel() {
  const [current,   setCurrent]   = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), INTERVAL);
    }
  };

  useEffect(() => {
    if (paused) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const navigate = (idx: number) => { setCurrent(idx); resetInterval(); };

  const slide = SLIDES[current];

  return (
    <>
      {/* Header row — inside the card, matches Store Insights */}
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>What&apos;s New</p>
        <button
          onClick={() => setModalOpen(true)}
          style={{ fontSize: 12, fontWeight: 600, color: PURPLE, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          View all <ChevronRight size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Carousel body */}
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {/* Preview — fixed height, all slides stacked, opacity fade */}
        <div style={{ position: 'relative', height: 148, overflow: 'hidden', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              style={{
                position: 'absolute', inset: 0,
                opacity: i === current ? 1 : 0,
                transition: 'opacity 300ms ease',
                pointerEvents: i === current ? 'auto' : 'none',
              }}
            >
              {s.preview}
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div style={{ padding: '10px 14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE, flexShrink: 0 }}>
                {slide.icon}
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)' }}>{slide.title}</p>
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-4)', flexShrink: 0, marginLeft: 8 }}>{slide.date}</span>
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--color-text-3)', lineHeight: 1.5, marginBottom: 10, paddingLeft: 26 }}>
            {slide.desc}
          </p>

          {/* Dots + Next — same row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => navigate(i)}
                  style={{
                    padding: 0, border: 'none', cursor: 'pointer',
                    width: i === current ? 18 : 6, height: 6,
                    borderRadius: 3,
                    background: PURPLE,
                    opacity: i === current ? 1 : 0.25,
                    transition: 'all 300ms ease',
                    flexShrink: 0,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => navigate((current + 1) % SLIDES.length)}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: 0, border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--color-text-4)',
                fontSize: 11, fontWeight: 500,
                transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = PURPLE}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-4)'}
            >
              Next <ChevronRight size={11} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <ViewAllModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
