'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Monitor, Play, Pause, Grid, ChevronLeft, ChevronRight,
  Wifi, WifiOff, Settings, X, Check, AlertCircle,
  LogIn, LogOut, PersonStanding,
} from 'lucide-react';

// ── Camera data ───────────────────────────────────────────────────────────────
interface Camera {
  id: string;
  label: string;
  store: string;
  zone: string;
  status: 'online' | 'offline' | 'degraded';
  seed: number;
  entry: number;
  exit: number;
  passerby: number;
}

const TYPE_BADGES: { key: 'entry' | 'exit' | 'passerby'; bg: string; icon: React.ReactNode }[] = [
  { key: 'entry',    bg: 'rgba(22,163,74,0.52)',   icon: <LogIn          size={12} strokeWidth={2.5} /> },
  { key: 'exit',     bg: 'rgba(220,38,38,0.52)',   icon: <LogOut         size={12} strokeWidth={2.5} /> },
  { key: 'passerby', bg: 'rgba(101,91,211,0.52)', icon: <PersonStanding size={12} strokeWidth={2.5} /> },
];

// loremflickr lock IDs chosen to return indoor mall / crowd / corridor scenes
const CAMERAS: Camera[] = [
  { id: 'CAM-MBS-01', label: 'Entrance A',   store: 'Marina Bay Sands', zone: 'Entrance', status: 'online',   seed: 3,  entry: 238,  exit: 181,  passerby: 2082 },
  { id: 'CAM-MBS-02', label: 'Entrance B',   store: 'Marina Bay Sands', zone: 'Entrance', status: 'online',   seed: 7,  entry: 174,  exit: 143,  passerby: 1540 },
  { id: 'CAM-MBS-03', label: 'Level 1 Main', store: 'Marina Bay Sands', zone: 'Floor',    status: 'online',   seed: 11, entry: 312,  exit: 289,  passerby: 3210 },
  { id: 'CAM-ORC-01', label: 'Main Door',    store: 'Orchard Central',  zone: 'Entrance', status: 'online',   seed: 15, entry: 174,  exit: 132,  passerby: 1340 },
  { id: 'CAM-ORC-02', label: 'Atrium',       store: 'Orchard Central',  zone: 'Atrium',   status: 'degraded', seed: 19, entry: 98,   exit: 87,   passerby: 920  },
  { id: 'CAM-VIV-01', label: 'North Gate',   store: 'VivoCity',         zone: 'Entrance', status: 'online',   seed: 23, entry: 312,  exit: 274,  passerby: 2890 },
  { id: 'CAM-VIV-02', label: 'Level 2',      store: 'VivoCity',         zone: 'Floor',    status: 'online',   seed: 27, entry: 203,  exit: 189,  passerby: 1875 },
  { id: 'CAM-BGS-01', label: 'North Entry',  store: 'Bugis Junction',   zone: 'Entrance', status: 'offline',  seed: 31, entry: 0,    exit: 0,    passerby: 0    },
  { id: 'CAM-TAM-01', label: 'Side Entry',   store: 'Tampines Mall',    zone: 'Entrance', status: 'online',   seed: 35, entry: 203,  exit: 159,  passerby: 1620 },
  { id: 'CAM-TAM-02', label: 'Main Hall',    store: 'Tampines Mall',    zone: 'Floor',    status: 'online',   seed: 39, entry: 167,  exit: 145,  passerby: 1430 },
  { id: 'CAM-JUR-01', label: 'Main Atrium',  store: 'Jurong Point',     zone: 'Atrium',   status: 'online',   seed: 43, entry: 289,  exit: 241,  passerby: 2341 },
  { id: 'CAM-NPC-01', label: 'Ground Floor', store: 'Northpoint City',  zone: 'Entrance', status: 'online',   seed: 47, entry: 267,  exit: 198,  passerby: 1980 },
];

const STATUS_STYLES = {
  online:   { color: '#16A34A', bg: 'rgba(22,163,74,0.12)',  icon: <Wifi size={10} strokeWidth={2} />,    label: 'Live' },
  offline:  { color: '#DC2626', bg: 'rgba(220,38,38,0.12)', icon: <WifiOff size={10} strokeWidth={2} />, label: 'Offline' },
  degraded: { color: '#D97706', bg: 'rgba(217,119,6,0.12)', icon: <AlertCircle size={10} strokeWidth={2} />, label: 'Degraded' },
};

// ── Camera feed tile ──────────────────────────────────────────────────────────
function CameraFeed({ camera, selected, onToggle, gridMode }: {
  camera: Camera;
  selected: boolean;
  onToggle: () => void;
  gridMode: boolean;
}) {
  const st = STATUS_STYLES[camera.status];

  return (
    <div
      className="relative rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
      style={{
        background: '#111',
        outline: selected && gridMode ? '2px solid #655BD3' : 'none',
        outlineOffset: 2,
        aspectRatio: '16/9',
      }}
      onClick={onToggle}
    >
      {/* Feed image — loremflickr mall/crowd scenes with CCTV treatment */}
      {camera.status !== 'offline' ? (
        <>
          <img
            src={`https://loremflickr.com/640/360/shopping,mall,crowd,people?lock=${camera.seed}`}
            alt={camera.label}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              filter: camera.status === 'degraded'
                ? 'grayscale(1) contrast(1.1) brightness(0.6) blur(0.6px)'
                : 'grayscale(1) contrast(1.15) brightness(0.75)',
            }}
          />
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 1px, transparent 1px, transparent 3px)',
          }} />
          {/* Degraded noise overlay */}
          {camera.status === 'degraded' && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
              backgroundSize: '200px 200px', opacity: 0.5,
            }} />
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a0a' }}>
          <div className="flex flex-col items-center gap-2">
            <WifiOff size={28} strokeWidth={1.5} style={{ color: '#374151' }} />
            <span className="text-xs font-mono" style={{ color: '#4B5563' }}>NO SIGNAL</span>
          </div>
        </div>
      )}

      {/* Vignette + bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

      {/* Top-left: camera ID monospace */}
      <div className="absolute top-2 left-2 font-mono text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
        <div style={{ fontWeight: 700 }}>{camera.id}</div>
        <div style={{ opacity: 0.65 }}>{camera.zone}</div>
      </div>

      {/* Top-right: REC + status */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {camera.status === 'online' && (
          <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            REC
          </span>
        )}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono" style={{ background: 'rgba(0,0,0,0.55)', color: st.color }}>
          {st.icon}&nbsp;{st.label}
        </div>
      </div>

      {/* Three stacked badges — icon + count only — top-right */}
      {camera.status !== 'offline' && (
        <div style={{
          position: 'absolute',
          top: 36,
          right: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-end',
        }}>
          {TYPE_BADGES.map(({ key, bg, icon }) => (
            <div
              key={key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 8,
                background: bg,
                backdropFilter: 'blur(6px)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
              }}
            >
              {icon}
              <span>{camera[key].toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp bottom-right */}
      {camera.status !== 'offline' && (
        <div className="absolute bottom-7 right-2 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
          {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      )}


      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2">
        <p className="text-xs font-semibold text-white truncate">{camera.label}</p>
        <p className="text-[10px] text-gray-300 truncate">{camera.store}</p>
      </div>

      {/* Select checkbox overlay when in grid selection mode */}
      {gridMode && (
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
          style={{
            background: selected ? '#655BD3' : 'rgba(255,255,255,0.2)',
            borderColor: selected ? '#655BD3' : 'rgba(255,255,255,0.5)',
          }}
        >
          {selected && <Check size={11} strokeWidth={3} color="white" />}
        </div>
      )}
    </div>
  );
}

// ── Remove confirmation modal ─────────────────────────────────────────────────
function RemoveConfirmModal({ camera, onConfirm, onCancel }: {
  camera: Camera;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: 320,
          padding: '24px 24px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Monitor size={20} strokeWidth={1.5} style={{ color: '#DC2626' }} />
        </div>

        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Remove camera from view?
        </p>
        <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.55, marginBottom: 20 }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>{camera.label}</span>
          {' '}({camera.store}) will be hidden from the feed. You can re-add it anytime from the camera selector.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: '1px solid #E5E7EB',
              background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer',
            }}
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: 'none',
              background: '#DC2626', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settings panel ────────────────────────────────────────────────────────────
function SettingsPanel({ cols, setCols, interval, setInterval: setIntervalVal, onClose }: {
  cols: number;
  setCols: (v: number) => void;
  interval: number;
  setInterval: (v: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-sm"
        style={{ borderRadius: 16, padding: '24px 28px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: '#111827' }}>View Settings</h3>
          <button onClick={onClose} style={{ color: '#9CA3AF' }}><X size={18} strokeWidth={2} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: '#374151' }}>
              Carousel Interval: <span style={{ color: '#655BD3' }}>{interval}s</span>
            </label>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={interval}
              onChange={e => setIntervalVal(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#655BD3' }}
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
              <span>5s</span><span>60s</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-6"
          style={{ background: '#655BD3' }}
        >Done</button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VMSPage() {
  const [selectedCams, setSelectedCams] = useState<Set<string>>(
    new Set(CAMERAS.filter(c => c.status !== 'offline').slice(0, 4).map(c => c.id))
  );
  const [cols, setCols] = useState(2);
  const [carouselMode, setCarouselMode] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [interval, setIntervalVal] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter]   = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'degraded'>('all');

  const STORES = ['all', ...Array.from(new Set(CAMERAS.map(c => c.store)))];
  const ZONES  = ['all', ...Array.from(new Set(CAMERAS.map(c => c.zone)))];

  const filteredCameras = CAMERAS.filter(c => {
    if (storeFilter !== 'all' && c.store !== storeFilter) return false;
    if (zoneFilter  !== 'all' && c.zone  !== zoneFilter)  return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });
  const [selectMode, setSelectMode] = useState(false);
  const [pendingDeselect, setPendingDeselect] = useState<Camera | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCams = filteredCameras.filter(c => selectedCams.has(c.id));

  // Carousel auto-advance
  useEffect(() => {
    if (!carouselMode) return;
    timerRef.current = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % activeCams.length);
    }, interval * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [carouselMode, interval, activeCams.length]);

  const toggleCam = (id: string) => {
    setSelectedCams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const prevCam = () => setCarouselIndex(i => (i - 1 + activeCams.length) % activeCams.length);
  const nextCam = () => setCarouselIndex(i => (i + 1) % activeCams.length);

  const onlineCams = CAMERAS.filter(c => c.status === 'online').length;
  const offlineCams = CAMERAS.filter(c => c.status === 'offline').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-3">
          <Monitor size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
          <span className="text-sm font-bold" style={{ color: '#111827' }}>VMS Monitoring</span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#16A34A' }} />
              {onlineCams} online
            </span>
            {offlineCams > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>
                {offlineCams} offline
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid layout toggle: 2×2 / 3×3 / 4×4 */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}
          >
            {([2, 3, 4] as const).map((n) => {
              const active = cols === n;
              return (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: active ? '#655BD3' : 'transparent',
                    color: active ? 'white' : '#6B7280',
                    borderRight: n !== 4 ? '1px solid #E5E7EB' : 'none',
                  }}
                >
                  {/* Mini grid icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    {Array.from({ length: n * n }).map((_, i) => {
                      const col = i % n;
                      const row = Math.floor(i / n);
                      const size = n === 2 ? 5 : n === 3 ? 3.2 : 2.2;
                      const gap = n === 2 ? 1.5 : n === 3 ? 1.2 : 1;
                      const total = n * size + (n - 1) * gap;
                      const offset = (14 - total) / 2;
                      const x = offset + col * (size + gap);
                      const y = offset + row * (size + gap);
                      return (
                        <rect
                          key={i}
                          x={x} y={y}
                          width={size} height={size}
                          rx={0.5}
                          fill={active ? 'white' : '#9CA3AF'}
                        />
                      );
                    })}
                  </svg>
                  {n}×{n}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5" style={{ background: '#E5E7EB' }} />

          {/* Camera selector toggle */}
          <button
            onClick={() => setSelectMode(!selectMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: selectMode ? '#EEE9FF' : '#F9FAFB',
              color: selectMode ? '#655BD3' : '#374151',
              border: `1px solid ${selectMode ? '#DDD6FE' : '#E5E7EB'}`,
            }}
          >
            <Grid size={13} strokeWidth={2} />
            {selectMode ? 'Done' : 'Select Cameras'}
          </button>

          {/* Carousel toggle */}
          <button
            onClick={() => { setCarouselMode(!carouselMode); setCarouselIndex(0); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: carouselMode ? '#655BD3' : '#F9FAFB',
              color: carouselMode ? 'white' : '#374151',
              border: `1px solid ${carouselMode ? '#655BD3' : '#E5E7EB'}`,
            }}
          >
            {carouselMode ? <Pause size={13} strokeWidth={2} /> : <Play size={13} strokeWidth={2} />}
            {carouselMode ? 'Stop' : 'Carousel'}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280' }}
          >
            <Settings size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-6 flex-shrink-0"
        style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', height: 44 }}
      >
        {/* Filters — left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* STATUS — labelled dot-toggle group */}
          <div className="flex items-center gap-1" style={{ background: '#F9FAFB', borderRadius: 8, padding: '3px 4px', border: '1px solid #F3F4F6' }}>
            {([
              { value: 'all',      label: 'All',      dot: '#9CA3AF' },
              { value: 'online',   label: 'Online',   dot: '#16A34A' },
              { value: 'offline',  label: 'Offline',  dot: '#DC2626' },
              { value: 'degraded', label: 'Degraded', dot: '#D97706' },
            ] as const).map(({ value, label, dot }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 26, paddingLeft: 8, paddingRight: 8,
                    borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 11.5, fontWeight: active ? 600 : 400,
                    background: active ? '#fff' : 'transparent',
                    color: active ? '#111827' : '#6B7280',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 120ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? dot : '#D1D5DB', flexShrink: 0, transition: 'background 120ms ease' }} />
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 16, background: '#E5E7EB', flexShrink: 0 }} />

          {/* ZONE — underline-tab style */}
          <div className="flex items-center gap-0" style={{ borderBottom: '2px solid #F3F4F6' }}>
            {ZONES.map(z => {
              const active = zoneFilter === z;
              return (
                <button
                  key={z}
                  onClick={() => setZoneFilter(z)}
                  style={{
                    height: 30, paddingLeft: 10, paddingRight: 10,
                    border: 'none', cursor: 'pointer', background: 'transparent',
                    fontSize: 11.5, fontWeight: active ? 600 : 400,
                    color: active ? '#655BD3' : '#6B7280',
                    borderBottom: active ? '2px solid #655BD3' : '2px solid transparent',
                    marginBottom: -2,
                    transition: 'all 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {z === 'all' ? 'All' : z}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 16, background: '#E5E7EB', flexShrink: 0 }} />

          {/* STORE — compact dropdown */}
          <select
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
            style={{
              fontSize: 11.5, padding: '4px 8px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: '#fff',
              color: storeFilter === 'all' ? '#6B7280' : '#111827',
              fontWeight: storeFilter === 'all' ? 400 : 600,
              cursor: 'pointer', outline: 'none',
            }}
          >
            {STORES.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Stores' : s}</option>
            ))}
          </select>
        </div>

        {/* Camera count — right anchor */}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
          {filteredCameras.length} camera{filteredCameras.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Camera selector strip (when in select mode) */}
      {selectMode && (
        <div
          className="flex-shrink-0 px-6 py-2.5 overflow-x-auto"
          style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}
        >
          <div className="flex gap-1.5 items-center">
            {filteredCameras.map(cam => {
              const sel = selectedCams.has(cam.id);
              const st = STATUS_STYLES[cam.status];
              return (
                <button
                  key={cam.id}
                  onClick={() => toggleCam(cam.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    paddingLeft: 10,
                    paddingRight: sel ? 6 : 10,
                    paddingTop: 5,
                    paddingBottom: 5,
                    background: sel ? '#EEE9FF' : '#F3F4F6',
                    color: sel ? '#655BD3' : '#374151',
                    border: `1px solid ${sel ? '#DDD6FE' : '#E5E7EB'}`,
                  }}
                >
                  <span style={{ color: st.color, display: 'flex', alignItems: 'center' }}>{st.icon}</span>
                  <span style={{ fontWeight: sel ? 600 : 400 }}>{cam.label}</span>
                  <span style={{ color: sel ? '#9580E8' : '#9CA3AF', fontWeight: 400 }}>{cam.store.split(' ')[0]}</span>
                  {sel && (
                    <span
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#655BD3', color: '#fff', flexShrink: 0, marginLeft: 2,
                      }}
                    >
                      <X size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feed area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeCams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Monitor size={40} strokeWidth={1} style={{ color: '#D1D5DB' }} />
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>No cameras selected</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Click "Select Cameras" to choose which feeds to display</p>
            </div>
            <button
              onClick={() => setSelectMode(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#655BD3' }}
            >Select Cameras</button>
          </div>
        ) : carouselMode ? (
          /* Carousel view */
          <div className="flex flex-col items-center gap-4 h-full">
            <div className="w-full max-w-4xl flex-1 relative rounded-2xl overflow-hidden" style={{ background: '#111', minHeight: 400 }}>
              {activeCams[carouselIndex] && (
                <>
                  {activeCams[carouselIndex].status !== 'offline' ? (
                    <img
                      src={`https://picsum.photos/seed/${activeCams[carouselIndex].seed}/1200/675`}
                      alt={activeCams[carouselIndex].label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 540 }}
                    />
                  ) : (
                    <div className="w-full flex items-center justify-center" style={{ height: 540, background: '#1A1A2E' }}>
                      <div className="flex flex-col items-center gap-3">
                        <WifiOff size={48} strokeWidth={1.5} style={{ color: '#374151' }} />
                        <span className="text-sm font-medium" style={{ color: '#4B5563' }}>Camera Offline</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Overlay info */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(22,163,74,0.2)', color: '#4ADE80' }}>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      LIVE
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: '#E5E7EB' }}>
                    {activeCams[carouselIndex].id}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-lg font-bold text-white">{activeCams[carouselIndex].label}</p>
                    <p className="text-sm text-gray-300">{activeCams[carouselIndex].store} · {activeCams[carouselIndex].zone}</p>
                  </div>

                  {/* Carousel controls */}
                  <button
                    onClick={prevCam}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                  >
                    <ChevronLeft size={20} strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextCam}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                  >
                    <ChevronRight size={20} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>

            {/* Carousel dots + timer */}
            <div className="flex items-center gap-2">
              {activeCams.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === carouselIndex ? 20 : 8,
                    height: 8,
                    background: i === carouselIndex ? '#655BD3' : '#D1D5DB',
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {carouselIndex + 1} / {activeCams.length} · Auto-advancing every {interval}s
            </p>

            {/* Thumbnail strip */}
            <div className="flex gap-2 w-full max-w-4xl overflow-x-auto pb-1">
              {activeCams.map((cam, i) => (
                <button
                  key={cam.id}
                  onClick={() => setCarouselIndex(i)}
                  className="flex-shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: 80,
                    height: 45,
                    outline: i === carouselIndex ? '2px solid #655BD3' : 'none',
                    outlineOffset: 2,
                    background: '#111',
                  }}
                >
                  {cam.status !== 'offline' ? (
                    <img
                      src={`https://picsum.photos/seed/${cam.seed}/160/90`}
                      alt={cam.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#1A1A2E' }}>
                      <WifiOff size={14} strokeWidth={1.5} style={{ color: '#374151' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grid view */
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {activeCams.map(cam => (
              <CameraFeed
                key={cam.id}
                camera={cam}
                selected={selectedCams.has(cam.id)}
                onToggle={() => {
                  if (!selectMode) return;
                  if (selectedCams.has(cam.id)) {
                    // deselecting from tile → ask for confirmation
                    setPendingDeselect(cam);
                  } else {
                    toggleCam(cam.id);
                  }
                }}
                gridMode={selectMode}
              />
            ))}
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          cols={cols}
          setCols={setCols}
          interval={interval}
          setInterval={setIntervalVal}
          onClose={() => setShowSettings(false)}
        />
      )}

      {pendingDeselect && (
        <RemoveConfirmModal
          camera={pendingDeselect}
          onConfirm={() => { toggleCam(pendingDeselect.id); setPendingDeselect(null); }}
          onCancel={() => setPendingDeselect(null)}
        />
      )}
    </div>
  );
}
