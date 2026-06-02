'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, BarChart2, Clock, X, ChevronRight } from 'lucide-react';
import './whatsnew-carousel.css';

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

// ── "View All" modal (portaled — escapes overflow:hidden on parent cards) ─────
function ViewAllModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="whatsnew-modal__backdrop theme-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsnew-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="whatsnew-modal modal-panel" onClick={e => e.stopPropagation()}>
        <header className="whatsnew-modal__head">
          <div>
            <h2 id="whatsnew-modal-title">What&apos;s New</h2>
            <p>Latest platform features &amp; updates</p>
          </div>
          <button
            type="button"
            className="whatsnew-modal__close modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </header>

        <div className="whatsnew-modal__body">
          <div className="whatsnew-modal__grid">
            {SLIDES.map(s => (
              <article key={s.id} className="whatsnew-modal__card">
                <div className="whatsnew-modal__card-preview">{s.previewCompact}</div>
                <div className="whatsnew-modal__card-info">
                  <div className="whatsnew-modal__card-head">
                    <div className="whatsnew-modal__card-title-row">
                      <span className="whatsnew-modal__card-icon">{s.icon}</span>
                      <p className="whatsnew-modal__card-title">{s.title}</p>
                    </div>
                    <span className="whatsnew-modal__card-date">{s.date}</span>
                  </div>
                  <p className="whatsnew-modal__card-desc">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
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
    <div className="whatsnew-carousel">
      <header className="hybrid-card__head whatsnew-carousel__head">
        <h3 className="whatsnew-carousel__title">What&apos;s New</h3>
        <div className="hybrid-card__head-actions">
          <button
            type="button"
            className="hybrid-link-btn whatsnew-carousel__view-all"
            onClick={() => setModalOpen(true)}
          >
            View all <ChevronRight size={12} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div
        className="whatsnew-carousel__body"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="whatsnew-carousel__preview">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="whatsnew-carousel__preview-slide"
              style={{
                opacity: i === current ? 1 : 0,
                pointerEvents: i === current ? 'auto' : 'none',
              }}
            >
              {s.preview}
            </div>
          ))}
        </div>

        <div className="whatsnew-carousel__info">
          <div className="whatsnew-carousel__info-head">
            <div className="whatsnew-carousel__info-title-row">
              <span className="whatsnew-carousel__info-icon">{slide.icon}</span>
              <p className="whatsnew-carousel__info-title">{slide.title}</p>
            </div>
            <span className="whatsnew-carousel__date">{slide.date}</span>
          </div>
          <p className="whatsnew-carousel__desc">{slide.desc}</p>

          <div className="whatsnew-carousel__footer">
            <div className="whatsnew-carousel__dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={`whatsnew-carousel__dot${i === current ? ' is-active' : ''}`}
                  onClick={() => navigate(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="whatsnew-carousel__next"
              onClick={() => navigate((current + 1) % SLIDES.length)}
            >
              Next <ChevronRight size={11} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && <ViewAllModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
