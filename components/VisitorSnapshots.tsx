'use client';
import { useState, useEffect, useCallback } from 'react';
import { Camera, Clock, MapPin, GitMerge, ChevronLeft, ChevronRight, X, ZoomIn, AlertTriangle, Info, RefreshCw } from 'lucide-react';

interface Snapshot {
  id: string;
  cameraId: string;
  cameraLabel: string;
  store: string;
  timestamp: string;
  timeAgo: string;
  event: 'entry' | 'exit' | 'passerby';
  visitorId: string;
  age: string;
  gender: 'male' | 'female' | 'unknown';
  isDuplicate: boolean;
  confidence: number;
  imgSeed: number; // picsum seed for consistent, varied images
}

const SNAPSHOTS: Snapshot[] = [
  { id: 'v001', cameraId: 'CAM-MBS-01', cameraLabel: 'Entrance A',  store: 'Marina Bay Sands',  timestamp: '14:32:18', timeAgo: '2m ago',  event: 'entry',    visitorId: 'VIS-4821', age: '22–35', gender: 'female',  isDuplicate: false, confidence: 97, imgSeed: 2  },
  { id: 'v002', cameraId: 'CAM-MBS-02', cameraLabel: 'Entrance B',  store: 'Marina Bay Sands',  timestamp: '14:31:44', timeAgo: '3m ago',  event: 'exit',     visitorId: 'VIS-3612', age: '35+',   gender: 'male',    isDuplicate: false, confidence: 94, imgSeed: 6  },
  { id: 'v003', cameraId: 'CAM-ORC-01', cameraLabel: 'Main Door',   store: 'Orchard Central',   timestamp: '14:30:55', timeAgo: '4m ago',  event: 'entry',    visitorId: 'VIS-5509', age: '13–21', gender: 'female',  isDuplicate: true,  confidence: 88, imgSeed: 10 },
  { id: 'v004', cameraId: 'CAM-VIV-03', cameraLabel: 'Level 2',     store: 'VivoCity',           timestamp: '14:29:12', timeAgo: '6m ago',  event: 'passerby', visitorId: 'VIS-2274', age: '22–35', gender: 'male',    isDuplicate: false, confidence: 91, imgSeed: 14 },
  { id: 'v005', cameraId: 'CAM-BGS-01', cameraLabel: 'North Gate',  store: 'Bugis Junction',     timestamp: '14:28:40', timeAgo: '6m ago',  event: 'entry',    visitorId: 'VIS-6633', age: '35+',   gender: 'female',  isDuplicate: false, confidence: 96, imgSeed: 18 },
  { id: 'v006', cameraId: 'CAM-MBS-01', cameraLabel: 'Entrance A',  store: 'Marina Bay Sands',  timestamp: '14:27:03', timeAgo: '8m ago',  event: 'exit',     visitorId: 'VIS-1188', age: '3–12',  gender: 'male',    isDuplicate: false, confidence: 85, imgSeed: 22 },
  { id: 'v007', cameraId: 'CAM-TAM-02', cameraLabel: 'Side Entry',  store: 'Tampines Mall',      timestamp: '14:25:51', timeAgo: '9m ago',  event: 'entry',    visitorId: 'VIS-7741', age: '22–35', gender: 'male',    isDuplicate: true,  confidence: 79, imgSeed: 26 },
  { id: 'v008', cameraId: 'CAM-JUR-01', cameraLabel: 'Main Atrium', store: 'Jurong Point',       timestamp: '14:24:19', timeAgo: '11m ago', event: 'passerby', visitorId: 'VIS-3355', age: '35+',   gender: 'female',  isDuplicate: false, confidence: 93, imgSeed: 30 },
];

const EVENT_CONFIG = {
  entry:    { label: 'Entry',    color: '#16A34A', bg: 'rgba(22,163,74,0.85)'   },
  exit:     { label: 'Exit',     color: '#DC2626', bg: 'rgba(220,38,38,0.85)'   },
  passerby: { label: 'Passerby', color: '#D97706', bg: 'rgba(217,119,6,0.85)'   },
};

const GENDER_COLORS = { male: '#0DA2FF', female: '#EE0F6B', unknown: '#9CA3AF' };

// CCTV-style CSS filter — grayscale + slightly boosted contrast/darkened
const CCTV_FILTER = 'grayscale(1) contrast(1.15) brightness(0.78)';

// loremflickr returns keyword-matched CC photos — "mall,people,walking" gives
// realistic overhead / entrance / corridor shots that read as CCTV footage.
function imgUrl(seed: number, w: number, h: number) {
  return `https://loremflickr.com/${w}/${h}/shopping,mall,people,walking?lock=${seed}`;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  snap,
  allSnaps,
  onClose,
  onNav,
}: {
  snap: Snapshot;
  allSnaps: Snapshot[];
  onClose: () => void;
  onNav: (id: string) => void;
}) {
  const idx = allSnaps.findIndex((s) => s.id === snap.id);
  const ev = EVENT_CONFIG[snap.event];

  const goPrev = useCallback(() => {
    if (idx > 0) onNav(allSnaps[idx - 1].id);
  }, [idx, allSnaps, onNav]);

  const goNext = useCallback(() => {
    if (idx < allSnaps.length - 1) onNav(allSnaps[idx + 1].id);
  }, [idx, allSnaps, onNav]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goPrev, goNext]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,15,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111827',
          borderRadius: 16,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 760,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image area */}
        <div style={{ position: 'relative', background: '#000', lineHeight: 0 }}>
          <img
            src={imgUrl(snap.imgSeed, 760, 380)}
            alt={snap.visitorId}
            style={{
              width: '100%',
              height: 380,
              objectFit: 'cover',
              filter: CCTV_FILTER,
              display: 'block',
            }}
          />

          {/* Scanlines overlay */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* CCTV chrome overlay */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          {/* Top-left: camera info */}
          <div
            style={{
              position: 'absolute', top: 14, left: 16,
              fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.5, textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 12 }}>{snap.cameraId}</div>
            <div style={{ opacity: 0.75 }}>{snap.cameraLabel} · {snap.store}</div>
          </div>

          {/* Top-right: REC dot + time */}
          <div
            style={{
              position: 'absolute', top: 14, right: 16,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            REC &nbsp;{snap.timestamp}
          </div>

          {/* Bottom-left: event badge */}
          <span
            style={{
              position: 'absolute', bottom: 14, left: 16,
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
              background: ev.bg, color: 'white',
              fontFamily: 'monospace', letterSpacing: '0.05em',
            }}
          >
            ▶ {ev.label.toUpperCase()}
          </span>

          {/* Bottom-right: visitor ID */}
          <span
            style={{
              position: 'absolute', bottom: 14, right: 16,
              fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)',
            }}
          >
            ID: {snap.visitorId}
          </span>

          {/* Duplicate badge */}
          {snap.isDuplicate && (
            <span
              style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(245,158,11,0.92)', color: 'white',
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
                fontFamily: 'monospace', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <AlertTriangle size={10} strokeWidth={2} /> DUPLICATE DETECTED
            </span>
          )}

          {/* Prev / Next nav arrows */}
          {idx > 0 && (
            <button
              onClick={goPrev}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
          )}
          {idx < allSnaps.length - 1 && (
            <button
              onClick={goNext}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Metadata strip — light mode */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            padding: '14px 20px', gap: 0,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {[
            { label: 'Visitor ID',  value: snap.visitorId },
            { label: 'Gender / Age', value: `${snap.gender.charAt(0).toUpperCase() + snap.gender.slice(1)} · ${snap.age}` },
            { label: 'Confidence',  value: `${snap.confidence}%`, valueColor: snap.confidence >= 90 ? '#16A34A' : snap.confidence >= 80 ? '#D97706' : '#DC2626' },
            { label: 'Captured',    value: `${snap.timestamp} · ${snap.timeAgo}` },
          ].map(({ label, value, valueColor }) => (
            <div key={label} style={{ padding: '0 16px', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-4)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? 'var(--color-text-1)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Thumbnail strip — light mode */}
        <div
          style={{
            display: 'flex', gap: 6, padding: '10px 20px 14px',
            overflowX: 'auto',
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {allSnaps.map((s) => (
            <button
              key={s.id}
              onClick={() => onNav(s.id)}
              style={{
                flexShrink: 0, width: 60, height: 40,
                borderRadius: 6, overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
                outline: s.id === snap.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                outlineOffset: 1,
                opacity: s.id === snap.id ? 1 : 0.5,
                transition: 'opacity 150ms, outline 150ms',
              }}
              onMouseEnter={(e) => { if (s.id !== snap.id) (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
              onMouseLeave={(e) => { if (s.id !== snap.id) (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
            >
              <img
                src={imgUrl(s.imgSeed, 60, 40)}
                alt={s.visitorId}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: CCTV_FILTER, display: 'block' }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Controlled props (optional) ───────────────────────────────────────────────
export interface VisitorSnapshotsProps {
  /** When true, the internal header (Camera icon + title + controls) is hidden */
  hideHeader?: boolean;
  /** Controlled event filter — if provided, internal state is ignored */
  eventFilter?: 'all' | Snapshot['event'];
  onEventFilterChange?: (f: 'all' | Snapshot['event']) => void;
  /** Controlled refresh state */
  isRefreshing?: boolean;
  onRefresh?: () => void;
  /** Controlled info tooltip state */
  showInfo?: boolean;
  onShowInfoChange?: (v: boolean) => void;
}

// ── Main component ────────────────────────────────────────────────────────────
export function VisitorSnapshots({
  hideHeader = false,
  eventFilter: eventFilterProp,
  onEventFilterChange,
  isRefreshing: isRefreshingProp,
  onRefresh,
  showInfo: showInfoProp,
  onShowInfoChange,
}: VisitorSnapshotsProps = {}) {
  const [eventFilterInternal, setEventFilterInternal] = useState<'all' | Snapshot['event']>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [showInfoInternal, setShowInfoInternal] = useState(false);
  const [isRefreshingInternal, setIsRefreshingInternal] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // Use controlled or internal state
  const isControlled = eventFilterProp !== undefined;
  const eventFilter = isControlled ? eventFilterProp : eventFilterInternal;
  const setEventFilter = isControlled
    ? (f: 'all' | Snapshot['event']) => onEventFilterChange?.(f)
    : setEventFilterInternal;
  const isRefreshing = isRefreshingProp !== undefined ? isRefreshingProp : isRefreshingInternal;
  const showInfo = showInfoProp !== undefined ? showInfoProp : showInfoInternal;
  const setShowInfo = onShowInfoChange ?? setShowInfoInternal;

  // Auto-refresh every 30 seconds (only when uncontrolled)
  useEffect(() => {
    if (isControlled) return;
    const interval = setInterval(() => {
      setIsRefreshingInternal(true);
      setTimeout(() => setIsRefreshingInternal(false), 900);
      setRefreshTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [isControlled]);

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    if (onRefresh) {
      onRefresh();
    } else {
      setIsRefreshingInternal(true);
      setTimeout(() => setIsRefreshingInternal(false), 900);
      setRefreshTick(t => t + 1);
    }
  };

  const filtered = eventFilter === 'all'
    ? SNAPSHOTS
    : SNAPSHOTS.filter((s) => s.event === eventFilter);

  const lightboxSnap = selectedId ? SNAPSHOTS.find((s) => s.id === selectedId) ?? null : null;

  return (
    <section>
      {/* Header — hidden when controlled externally */}
      {!hideHeader && <div className="flex items-center justify-between mb-5">
        {/* Title only — no subtitle */}
        <div className="flex items-center gap-2">
          <Camera size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Visitor Snapshots</h2>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">

          {/* Refresh button — left of filter pills */}
          <button
            onClick={handleManualRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, paddingLeft: 12, paddingRight: 14,
              borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)', color: 'var(--color-primary)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'background 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)'; (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
          >
            <RefreshCw
              size={13}
              strokeWidth={2.2}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span style={{ color: 'var(--color-text-4)', fontWeight: 400, fontSize: 12 }}>Refreshes:</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>30 s</span>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />

          {/* Filter pills */}
          {(['all', 'entry', 'exit', 'passerby'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setEventFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
              style={{
                background: eventFilter === f ? 'var(--color-primary-emphasis)' : 'var(--color-surface-2)',
                color: eventFilter === f ? 'white' : 'var(--color-text-2)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'All Events' : EVENT_CONFIG[f].label}
            </button>
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />

          {/* Info button — icon only, no background */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4, color: 'var(--color-text-4)', transition: 'color 150ms',
              }}
              onFocus={() => setShowInfo(true)}
              onBlur={() => setShowInfo(false)}
            >
              <Info size={15} strokeWidth={1.8} />
            </button>

            {/* Light tooltip */}
            {showInfo && (
              <div
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  width: 252,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                  zIndex: 100,
                }}
              >
                {/* Arrow */}
                <div style={{
                  position: 'absolute', top: -5, right: 10,
                  width: 10, height: 10,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderBottom: 'none', borderRight: 'none',
                  transform: 'rotate(45deg)', borderRadius: 2,
                }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 5 }}>
                  Live Visitor Snapshots
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.65 }}>
                  Real-time frames captured by entrance cameras each time a visitor is detected. Shows event type, demographic match, and AI confidence score.
                </p>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { dot: '#16A34A', label: 'Entry — visitor walked in' },
                    { dot: '#DC2626', label: 'Exit — visitor left' },
                    { dot: '#D97706', label: 'Passerby — detected outside' },
                  ].map(({ dot, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>}

      {/* Grid — fixed 4 columns so card width never changes between tabs */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {filtered.map((snap) => {
          const ev = EVENT_CONFIG[snap.event];
          const isMerging = mergeTarget === snap.id;
          const isSelected = selectedId === snap.id;

          return (
            <div
              key={snap.id}
              className="card flex flex-col gap-0 overflow-hidden"
              style={{
                padding: 0,
                cursor: 'pointer',
                outline: isMerging || isSelected ? '2px solid var(--color-primary)' : 'none',
                outlineOffset: 2,
                transition: 'box-shadow 150ms, outline 150ms',
              }}
              onClick={() => setSelectedId(snap.id)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              {/* Photo area */}
              <div
                className="relative flex-shrink-0"
                style={{ height: 130, background: '#1a1a1a', lineHeight: 0 }}
              >
                <img
                  src={imgUrl(snap.imgSeed, 280, 130)}
                  alt={`Visitor ${snap.visitorId}`}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    filter: CCTV_FILTER,
                  }}
                />

                {/* Scanlines */}
                <div
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)',
                  }}
                />

                {/* Bottom gradient */}
                <div
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.35) 100%)',
                  }}
                />

                {/* Camera ID — monospace CCTV style */}
                <span
                  style={{
                    position: 'absolute', top: 6, left: 8,
                    fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.75)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  {snap.cameraId}
                </span>

                {/* REC indicator */}
                <span
                  style={{
                    position: 'absolute', top: 6, right: 8,
                    fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.65)',
                    display: 'flex', alignItems: 'center', gap: 3,
                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  REC
                </span>

                {/* Event badge */}
                <span
                  className="absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: ev.bg, color: 'white',
                    fontFamily: 'monospace', letterSpacing: '0.04em',
                  }}
                >
                  {ev.label.toUpperCase()}
                </span>

                {/* Duplicate warning */}
                {snap.isDuplicate && (
                  <span
                    className="absolute top-2 right-8 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(245,158,11,0.92)', color: 'white', fontFamily: 'monospace' }}
                  >
                    DUP
                  </span>
                )}

                {/* Zoom-in hint on hover */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 150ms',
                    background: 'rgba(0,0,0,0.18)',
                  }}
                  className="group-hover-hint"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '0'}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ZoomIn size={16} strokeWidth={1.5} style={{ color: 'white' }} />
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="absolute bottom-0 left-0 right-0" style={{ height: 3, background: 'rgba(0,0,0,0.4)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${snap.confidence}%`,
                      background: snap.confidence >= 90 ? '#16A34A' : snap.confidence >= 80 ? '#D97706' : '#DC2626',
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-text-1)' }}>{snap.visitorId}</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: `${GENDER_COLORS[snap.gender]}20`, color: GENDER_COLORS[snap.gender] }}
                  >
                    {snap.gender} · {snap.age}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-3)' }}>
                  <MapPin size={11} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span className="text-[11px] truncate">{snap.cameraLabel} · {snap.store.split(' ').slice(0, 2).join(' ')}</span>
                </div>

                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-4)' }}>
                  <Clock size={11} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span className="text-[11px]">{snap.timestamp} · {snap.timeAgo}</span>
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-4)' }}>Match confidence</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{
                      color: snap.confidence >= 90 ? '#16A34A' : snap.confidence >= 80 ? '#D97706' : '#DC2626',
                    }}
                  >
                    {snap.confidence}%
                  </span>
                </div>

                {snap.isDuplicate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMergeTarget(isMerging ? null : snap.id);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md text-[11px] font-semibold transition-colors"
                    style={{
                      background: isMerging ? 'var(--color-primary-emphasis)' : 'rgba(101,91,211,0.1)',
                      color: isMerging ? 'white' : 'var(--color-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: 2,
                    }}
                  >
                    <GitMerge size={11} strokeWidth={2} />
                    {isMerging ? 'Select to merge…' : 'Merge duplicate'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination stub */}
      <div className="flex items-center justify-between mt-5">
        <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
          Showing <span style={{ color: 'var(--color-text-2)', fontWeight: 600 }}>{filtered.length}</span> of{' '}
          <span style={{ color: 'var(--color-text-2)', fontWeight: 600 }}>248</span> snapshots today
        </p>
        <div className="flex items-center gap-1">
          {[
            { icon: <ChevronLeft size={14} strokeWidth={2} />, label: 'Previous' },
            { icon: <ChevronRight size={14} strokeWidth={2} />, label: 'Next' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              aria-label={label}
              className="p-1.5 rounded-md transition-colors"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSnap && (
        <Lightbox
          snap={lightboxSnap}
          allSnaps={filtered.length > 0 ? filtered : SNAPSHOTS}
          onClose={() => setSelectedId(null)}
          onNav={(id) => setSelectedId(id)}
        />
      )}
    </section>
  );
}
