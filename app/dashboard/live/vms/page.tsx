'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor, Play, Pause, Grid, ChevronLeft, ChevronRight,
  Wifi, WifiOff, Settings, X, Check, AlertCircle,
  LogIn, LogOut, PersonStanding, Pencil, Scan, ChevronDown,
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

const TYPE_BADGES: { key: 'entry' | 'exit' | 'passerby'; bg: string; border: string; icon: React.ReactNode }[] = [
  { key: 'entry',    bg: 'rgba(22,163,74,0.78)',   border: 'rgba(74,222,128,0.35)', icon: <LogIn          size={12} strokeWidth={2.5} /> },
  { key: 'exit',     bg: 'rgba(220,38,38,0.78)',   border: 'rgba(252,165,165,0.35)', icon: <LogOut         size={12} strokeWidth={2.5} /> },
  { key: 'passerby', bg: 'rgba(180,83,9,0.82)',    border: 'rgba(251,191,36,0.35)', icon: <PersonStanding size={12} strokeWidth={2.5} /> },
];

// loremflickr lock IDs chosen to return indoor mall / crowd / corridor scenes
const CAMERAS: Camera[] = [
  { id: 'CAM-MBS-01', label: 'Entrance A',   store: 'Marina Bay Sands', zone: 'Entrance', status: 'online',   seed: 3,  entry: 238,  exit: 181,  passerby: 882  },
  { id: 'CAM-MBS-02', label: 'Entrance B',   store: 'Marina Bay Sands', zone: 'Entrance', status: 'online',   seed: 7,  entry: 174,  exit: 143,  passerby: 740  },
  { id: 'CAM-MBS-03', label: 'Level 1 Main', store: 'Marina Bay Sands', zone: 'Floor',    status: 'online',   seed: 11, entry: 312,  exit: 289,  passerby: 871  },
  { id: 'CAM-ORC-01', label: 'Main Door',    store: 'Orchard Central',  zone: 'Entrance', status: 'online',   seed: 15, entry: 174,  exit: 132,  passerby: 734  },
  { id: 'CAM-ORC-02', label: 'Atrium',       store: 'Orchard Central',  zone: 'Atrium',   status: 'degraded', seed: 19, entry: 98,   exit: 87,   passerby: 720  },
  { id: 'CAM-VIV-01', label: 'North Gate',   store: 'VivoCity',         zone: 'Entrance', status: 'online',   seed: 23, entry: 312,  exit: 274,  passerby: 890  },
  { id: 'CAM-VIV-02', label: 'Level 2',      store: 'VivoCity',         zone: 'Floor',    status: 'online',   seed: 27, entry: 203,  exit: 189,  passerby: 875  },
  { id: 'CAM-BGS-01', label: 'North Entry',  store: 'Bugis Junction',   zone: 'Entrance', status: 'offline',  seed: 31, entry: 0,    exit: 0,    passerby: 0    },
  { id: 'CAM-TAM-01', label: 'Side Entry',   store: 'Tampines Mall',    zone: 'Entrance', status: 'online',   seed: 35, entry: 203,  exit: 159,  passerby: 762  },
  { id: 'CAM-TAM-02', label: 'Main Hall',    store: 'Tampines Mall',    zone: 'Floor',    status: 'online',   seed: 39, entry: 167,  exit: 145,  passerby: 743  },
  { id: 'CAM-JUR-01', label: 'Main Atrium',  store: 'Jurong Point',     zone: 'Atrium',   status: 'online',   seed: 43, entry: 289,  exit: 241,  passerby: 881  },
  { id: 'CAM-NPC-01', label: 'Ground Floor', store: 'Northpoint City',  zone: 'Entrance', status: 'online',   seed: 47, entry: 267,  exit: 198,  passerby: 868  },
  { id: 'CAM-JUR-02', label: 'B2 Parking',   store: 'Jurong Point',     zone: 'Entrance', status: 'online',   seed: 51, entry: 189,  exit: 167,  passerby: 759  },
  { id: 'CAM-NPC-02', label: 'Level 2 Hall', store: 'Northpoint City',  zone: 'Floor',    status: 'online',   seed: 55, entry: 142,  exit: 128,  passerby: 718  },
  { id: 'CAM-MBS-04', label: 'Food Court',   store: 'Marina Bay Sands', zone: 'Floor',    status: 'online',   seed: 59, entry: 198,  exit: 176,  passerby: 874  },
  { id: 'CAM-ORC-03', label: 'Level 3 Lift', store: 'Orchard Central',  zone: 'Floor',    status: 'degraded', seed: 63, entry: 67,   exit: 59,   passerby: 703  },
  { id: 'CAM-VIV-03', label: 'South Gate',   store: 'VivoCity',         zone: 'Entrance', status: 'online',   seed: 67, entry: 276,  exit: 254,  passerby: 887  },
  { id: 'CAM-BGS-02', label: 'Food Hall',    store: 'Bugis Junction',   zone: 'Floor',    status: 'online',   seed: 71, entry: 123,  exit: 108,  passerby: 732  },
  { id: 'CAM-TAM-03', label: 'Carpark Entry',store: 'Tampines Mall',    zone: 'Entrance', status: 'online',   seed: 75, entry: 145,  exit: 132,  passerby: 751  },
  { id: 'CAM-JUR-03', label: 'L1 Atrium',    store: 'Jurong Point',     zone: 'Atrium',   status: 'online',   seed: 79, entry: 201,  exit: 187,  passerby: 876  },
  { id: 'CAM-MBS-05', label: 'VIP Lounge',   store: 'Marina Bay Sands', zone: 'Floor',    status: 'online',   seed: 83, entry: 89,   exit: 76,   passerby: 712  },
  { id: 'CAM-ORC-04', label: 'Basement',     store: 'Orchard Central',  zone: 'Entrance', status: 'online',   seed: 87, entry: 134,  exit: 118,  passerby: 728  },
  { id: 'CAM-VIV-04', label: 'Rooftop Walk', store: 'VivoCity',         zone: 'Floor',    status: 'degraded', seed: 91, entry: 56,   exit: 49,   passerby: 707  },
  { id: 'CAM-BGS-03', label: 'East Wing',    store: 'Bugis Junction',   zone: 'Floor',    status: 'online',   seed: 95, entry: 178,  exit: 162,  passerby: 753  },
  { id: 'CAM-CWP-01', label: 'Main Entrance',store: 'Causeway Point',   zone: 'Entrance', status: 'online',   seed: 99, entry: 221,  exit: 198,  passerby: 870  },
  { id: 'CAM-CWP-02', label: 'Level 1 Hall', store: 'Causeway Point',   zone: 'Floor',    status: 'online',   seed: 103,entry: 167,  exit: 143,  passerby: 745  },
  { id: 'CAM-NPC-03', label: 'Atrium Sky',   store: 'Northpoint City',  zone: 'Atrium',   status: 'online',   seed: 107,entry: 312,  exit: 287,  passerby: 892  },
  { id: 'CAM-TAM-04', label: 'Food Court',   store: 'Tampines Mall',    zone: 'Floor',    status: 'online',   seed: 111,entry: 198,  exit: 176,  passerby: 738  },
];

const STATUS_STYLES = {
  online:   { color: '#16A34A', bg: 'rgba(22,163,74,0.12)',  icon: <Wifi size={10} strokeWidth={2} />,    label: 'Live' },
  offline:  { color: '#DC2626', bg: 'rgba(220,38,38,0.12)', icon: <WifiOff size={10} strokeWidth={2} />, label: 'Offline' },
  degraded: { color: '#D97706', bg: 'rgba(217,119,6,0.12)', icon: <AlertCircle size={10} strokeWidth={2} />, label: 'Degraded' },
};

// ── Camera feed tile ──────────────────────────────────────────────────────────
function CameraFeed({ camera, selected, onToggle, onRoiClick, gridMode }: {
  camera: Camera;
  selected: boolean;
  onToggle: () => void;
  onRoiClick: () => void;
  gridMode: boolean;
}) {
  const st = STATUS_STYLES[camera.status];

  return (
    <div
      className="relative rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group vms-camera-tile"
      style={{
        outline: selected && gridMode ? '2px solid var(--color-primary)' : 'none',
        outlineOffset: 2,
        aspectRatio: '16/9',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
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
            <WifiOff size={28} strokeWidth={1.5} style={{ color: 'var(--color-text-2)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>NO SIGNAL</span>
          </div>
        </div>
      )}

      {/* Vignette + bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

      {/* Top-left: camera ID monospace + ROI chip below */}
      <div className="absolute top-2 left-2 flex flex-col items-start gap-3">
        <div className="font-mono text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          <div style={{ fontWeight: 700 }}>{camera.id}</div>
          <div style={{ opacity: 0.65 }}>{camera.zone}</div>
        </div>
        {camera.status !== 'offline' && (
          <button
            onClick={e => { e.stopPropagation(); onRoiClick(); }}
            title="View ROI zones"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 7px 3px 5px',
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.92)',
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-base, "Neue Haas Grotesk Display Pro", "Helvetica Neue", sans-serif)',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.72)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.55)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)';
            }}
          >
            <Scan size={9} strokeWidth={2.5} />
            ROI
          </button>
        )}
      </div>

      {/* Top-right: REC + status */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {camera.status === 'online' && (
          <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            REC
          </span>
        )}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono" style={{ background: 'rgba(0,0,0,0.62)', border: '1px solid rgba(255,255,255,0.12)', color: st.color, backdropFilter: 'blur(4px)' }}>
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
          {TYPE_BADGES.map(({ key, bg, border, icon }) => (
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
                border: `1px solid ${border}`,
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
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
        <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>{camera.label}</p>
        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{camera.store}</p>
      </div>

      {/* Select checkbox overlay when in grid selection mode */}
      {gridMode && (
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
          style={{
            background: selected ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
            borderColor: selected ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
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
      className="fixed inset-0 z-50 flex items-center justify-center theme-overlay"
      onClick={onCancel}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: 16, width: 320,
          padding: '24px 24px 20px',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--color-error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Monitor size={20} strokeWidth={1.5} style={{ color: '#DC2626' }} />
        </div>

        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 6 }}>
          Remove camera from view?
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--color-text-3)', lineHeight: 1.55, marginBottom: 20 }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-2)' }}>{camera.label}</span>
          {' '}({camera.store}) will be hidden from the feed. You can re-add it anytime from the camera selector.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', cursor: 'pointer',
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
      className="fixed inset-0 z-50 flex items-center justify-center theme-overlay"
      onClick={onClose}
    >
      <div
        className="modal-panel w-full max-w-sm"
        style={{ borderRadius: 16, padding: '24px 28px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>View Settings</h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-4)' }}><X size={18} strokeWidth={2} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--color-text-2)' }}>
              Carousel Interval: <span style={{ color: 'var(--color-primary)' }}>{interval}s</span>
            </label>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={interval}
              onChange={e => setIntervalVal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary-emphasis)' }}
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--color-text-4)' }}>
              <span>5s</span><span>60s</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-6"
          style={{ background: 'var(--color-primary-emphasis)' }}
        >Done</button>
      </div>
    </div>
  );
}

const CAMS_PER_PAGE = 16;

// ROI lines: static decorative overlay polygons simulating detection zones
const ROI_LINES = [
  { points: '12%,15% 48%,12% 52%,55% 10%,58%', color: '#00CE9C' },
  { points: '55%,10% 88%,14% 90%,62% 53%,58%', color: 'var(--color-primary)' },
  { points: '20%,65% 78%,62% 80%,90% 18%,92%', color: '#F59E0B' },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VMSPage() {
  const [selectedCams, setSelectedCams] = useState<Set<string>>(
    new Set(CAMERAS.filter(c => c.status !== 'offline').map(c => c.id))
  );
  const [cols, setCols] = useState(4);
  const [carouselMode, setCarouselMode] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [interval, setIntervalVal] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [storeDropOpen, setStoreDropOpen] = useState(false);
  const storeDropTriggerRef = useRef<HTMLButtonElement>(null);
  const storeDropPanelRef   = useRef<HTMLDivElement>(null);
  const [storeDropStyle, setStoreDropStyle] = useState<React.CSSProperties>({});
  const [zoneFilter, setZoneFilter]   = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'degraded'>('all');
  const [page, setPage] = useState(0);
  const [expandedCam, setExpandedCam] = useState<Camera | null>(null);
  const [roiActive, setRoiActive] = useState(false);
  const [zoneLabels, setZoneLabels] = useState<Record<string, string>>({});
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneEditValue, setZoneEditValue] = useState('');

  const getZoneLabel = (zone: string) => zoneLabels[zone] ?? zone;

  const STORE_NAMES = Array.from(new Set(CAMERAS.map(c => c.store)));
  const ZONES  = ['all', ...Array.from(new Set(CAMERAS.map(c => c.zone)))];

  const filteredCameras = CAMERAS.filter(c => {
    if (selectedStores.size > 0 && !selectedStores.has(c.store)) return false;
    if (zoneFilter  !== 'all' && c.zone  !== zoneFilter)  return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const closeStoreDrop = useCallback(() => setStoreDropOpen(false), []);

  const openStoreDrop = () => {
    const el = storeDropTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedH = Math.min(STORE_NAMES.length * 34 + 44, 280);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < estimatedH && rect.top > estimatedH;
    setStoreDropStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 180),
      zIndex: 99999,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
    setStoreDropOpen(true);
  };

  const toggleStoreDrop = () => (storeDropOpen ? closeStoreDrop() : openStoreDrop());

  const toggleStore = (store: string) => {
    setSelectedStores(prev => {
      const next = new Set(prev);
      if (next.has(store)) { next.delete(store); } else { next.add(store); }
      return next;
    });
  };

  const storeLabel = selectedStores.size === 0
    ? 'All Stores'
    : selectedStores.size === 1
      ? [...selectedStores][0]
      : `${selectedStores.size} Stores`;

  useEffect(() => {
    if (!storeDropOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!storeDropTriggerRef.current?.contains(t) && !storeDropPanelRef.current?.contains(t)) closeStoreDrop();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [storeDropOpen, closeStoreDrop]);

  useEffect(() => {
    if (!storeDropOpen) return;
    const handler = (e: Event) => { if (storeDropPanelRef.current?.contains(e.target as Node)) return; closeStoreDrop(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeStoreDrop(); };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', closeStoreDrop);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', closeStoreDrop);
      document.removeEventListener('keydown', onKey);
    };
  }, [storeDropOpen, closeStoreDrop]);

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

  const onlineCams   = CAMERAS.filter(c => c.status === 'online').length;
  const offlineCams  = CAMERAS.filter(c => c.status === 'offline').length;
  const degradedCams = CAMERAS.filter(c => c.status === 'degraded').length;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-page-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <Monitor size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <div className="flex items-center gap-1.5">
            {/* Clickable status badges — double as status filters */}
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs font-medium px-2 py-0.5 rounded-full transition-all"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-3)', border: 'none', cursor: 'pointer' }}
              >
                All
              </button>
            )}
            <button
              onClick={() => setStatusFilter(s => s === 'online' ? 'all' : 'online')}
              className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all"
              style={{
                background: statusFilter === 'online' ? '#16A34A' : 'rgba(22,163,74,0.1)',
                color: statusFilter === 'online' ? 'white' : '#16A34A',
                border: 'none', cursor: 'pointer',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusFilter === 'online' ? 'white' : '#16A34A' }} />
              {onlineCams} online
            </button>
            {degradedCams > 0 && (
              <button
                onClick={() => setStatusFilter(s => s === 'degraded' ? 'all' : 'degraded')}
                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: statusFilter === 'degraded' ? '#D97706' : 'rgba(217,119,6,0.1)',
                  color: statusFilter === 'degraded' ? 'white' : '#D97706',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusFilter === 'degraded' ? 'white' : '#D97706' }} />
                {degradedCams} degraded
              </button>
            )}
            {offlineCams > 0 && (
              <button
                onClick={() => setStatusFilter(s => s === 'offline' ? 'all' : 'offline')}
                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: statusFilter === 'offline' ? '#DC2626' : 'rgba(220,38,38,0.1)',
                  color: statusFilter === 'offline' ? 'white' : '#DC2626',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {offlineCams} offline
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid layout toggle: 2×2 / 3×3 / 4×4 */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}
          >
            {([2, 3, 4] as const).map((n) => {
              const active = cols === n;
              return (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: active ? 'var(--color-primary-emphasis)' : 'transparent',
                    color: active ? 'var(--color-on-primary)' : 'var(--color-text-2)',
                    borderRight: n !== 4 ? '1px solid var(--color-border)' : 'none',
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
                          fill={active ? 'var(--color-on-primary)' : 'var(--color-text-3)'}
                        />
                      );
                    })}
                  </svg>
                  {n}×{n}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5" style={{ background: 'var(--color-border)' }} />

          {/* Camera selector toggle */}
          <button
            onClick={() => setSelectMode(!selectMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: selectMode ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
              color: selectMode ? 'var(--color-primary)' : 'var(--color-text-2)',
              border: `1px solid ${selectMode ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
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
              background: carouselMode ? 'var(--color-primary-emphasis)' : 'var(--color-surface-2)',
              color: carouselMode ? 'white' : 'var(--color-text-2)',
              border: `1px solid ${carouselMode ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            {carouselMode ? <Pause size={13} strokeWidth={2} /> : <Play size={13} strokeWidth={2} />}
            {carouselMode ? 'Stop' : 'Carousel'}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-3)' }}
          >
            <Settings size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-6 flex-shrink-0"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-subtle)', height: 44 }}
      >
        {/* Filters — left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* ZONE — underline-tab style with inline rename */}
          <div className="flex items-center gap-0" style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
            {ZONES.map(z => {
              const active = zoneFilter === z;
              const displayLabel = z === 'all' ? 'All' : getZoneLabel(z);
              return (
                <div key={z} className="relative flex items-center group" style={{ marginBottom: -2 }}>
                  {editingZone === z ? (
                    <input
                      autoFocus
                      value={zoneEditValue}
                      onChange={e => setZoneEditValue(e.target.value)}
                      onBlur={() => {
                        if (zoneEditValue.trim()) setZoneLabels(prev => ({ ...prev, [z]: zoneEditValue.trim() }));
                        setEditingZone(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (zoneEditValue.trim()) setZoneLabels(prev => ({ ...prev, [z]: zoneEditValue.trim() }));
                          setEditingZone(null);
                        }
                        if (e.key === 'Escape') setEditingZone(null);
                      }}
                      style={{
                        height: 28, width: 90, padding: '0 8px', fontSize: 11.5, fontWeight: 600,
                        border: '1.5px solid var(--color-primary)', borderRadius: 6, outline: 'none',
                        color: 'var(--color-primary)', background: 'var(--color-accent-bg)',
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => { setZoneFilter(z); setPage(0); }}
                      style={{
                        height: 30, paddingLeft: 10, paddingRight: z !== 'all' ? 24 : 10,
                        border: 'none', cursor: 'pointer', background: 'transparent',
                        fontSize: 11.5, fontWeight: active ? 600 : 400,
                        color: active ? 'var(--color-primary)' : 'var(--color-text-3)',
                        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'all 150ms ease', whiteSpace: 'nowrap',
                      }}
                    >
                      {displayLabel}
                    </button>
                  )}
                  {z !== 'all' && editingZone !== z && (
                    <button
                      onClick={e => { e.stopPropagation(); setZoneEditValue(getZoneLabel(z)); setEditingZone(z); }}
                      className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', padding: 0, display: 'flex' }}
                    >
                      <Pencil size={9} strokeWidth={2} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0 }} />

          {/* STORE — multi-select dropdown */}
          <button
            ref={storeDropTriggerRef}
            type="button"
            onClick={toggleStoreDrop}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 28, padding: '0 8px',
              border: `1px solid ${storeDropOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 6, background: 'var(--color-surface)',
              color: 'var(--color-text-1)', fontSize: 11.5, fontWeight: 400,
              cursor: 'pointer', outline: 'none', flexShrink: 0, whiteSpace: 'nowrap',
              minWidth: 120,
              ...(storeDropOpen ? { boxShadow: '0 0 0 3px rgba(101,91,211,0.12)' } : {}),
            }}
            onMouseEnter={e => { if (!storeDropOpen) e.currentTarget.style.borderColor = '#C4B5FD'; }}
            onMouseLeave={e => { if (!storeDropOpen) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {storeLabel}
            </span>
            <ChevronDown
              size={11} strokeWidth={2.5}
              style={{
                color: 'var(--color-text-4)', flexShrink: 0,
                transform: storeDropOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 200ms ease',
              }}
            />
          </button>

          {storeDropOpen && (
            <div
              ref={storeDropPanelRef}
              style={{
                ...storeDropStyle,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                padding: 4,
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              <button
                type="button"
                onClick={() => { setSelectedStores(new Set()); closeStoreDrop(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none',
                  background: selectedStores.size === 0 ? 'var(--color-primary-light)' : 'transparent',
                  color: selectedStores.size === 0 ? 'var(--color-primary)' : 'var(--color-text-2)',
                  fontSize: 12, fontWeight: 400,
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { if (selectedStores.size !== 0) e.currentTarget.style.background = '#F9F7FF'; }}
                onMouseLeave={e => { if (selectedStores.size !== 0) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>All Stores</span>
                {selectedStores.size === 0 && <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} />}
              </button>

              <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 0' }} />

              {STORE_NAMES.map(store => {
                const checked = selectedStores.has(store);
                return (
                  <button
                    key={store}
                    type="button"
                    onClick={() => toggleStore(store)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none',
                      background: checked ? 'var(--color-primary-light)' : 'transparent',
                      color: checked ? 'var(--color-primary)' : 'var(--color-text-2)',
                      fontSize: 12, fontWeight: 400,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#F9F7FF'; }}
                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      width: 14, height: 14, flexShrink: 0, borderRadius: 3,
                      border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: checked ? 'var(--color-primary-emphasis)' : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <Check size={9} strokeWidth={3} style={{ color: 'white' }} />}
                    </span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Camera count — right anchor */}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--color-text-4)', whiteSpace: 'nowrap' }}>
          {filteredCameras.length} camera{filteredCameras.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Camera selector strip (when in select mode) */}
      {selectMode && (
        <div
          className="flex-shrink-0 px-6 py-2.5 overflow-x-auto"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
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
                    background: sel ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                    color: sel ? 'var(--color-primary)' : 'var(--color-text-2)',
                    border: `1px solid ${sel ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                  }}
                >
                  <span style={{ color: st.color, display: 'flex', alignItems: 'center' }}>{st.icon}</span>
                  <span style={{ fontWeight: sel ? 600 : 400 }}>{cam.label}</span>
                  <span style={{ color: sel ? '#9580E8' : 'var(--color-text-4)', fontWeight: 400 }}>{cam.store.split(' ')[0]}</span>
                  {sel && (
                    <span
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 16, height: 16, borderRadius: '50%',
                        background: 'var(--color-primary-emphasis)', color: '#fff', flexShrink: 0, marginLeft: 2,
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
            <Monitor size={40} strokeWidth={1} style={{ color: 'var(--color-border)' }} />
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>No cameras selected</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-4)' }}>Click "Select Cameras" to choose which feeds to display</p>
            </div>
            <button
              onClick={() => setSelectMode(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary-emphasis)' }}
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
                        <WifiOff size={48} strokeWidth={1.5} style={{ color: 'var(--color-text-2)' }} />
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
                    background: i === carouselIndex ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
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
                    outline: i === carouselIndex ? '2px solid var(--color-primary)' : 'none',
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
                      <WifiOff size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-2)' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grid view */
          <>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {activeCams.slice(page * CAMS_PER_PAGE, (page + 1) * CAMS_PER_PAGE).map(cam => (
                <CameraFeed
                  key={cam.id}
                  camera={cam}
                  selected={selectedCams.has(cam.id)}
                  onToggle={() => {
                    if (selectMode) {
                      if (selectedCams.has(cam.id)) {
                        setPendingDeselect(cam);
                      } else {
                        toggleCam(cam.id);
                      }
                    } else {
                      setExpandedCam(cam);
                      setRoiActive(false);
                    }
                  }}
                  onRoiClick={() => {
                    setExpandedCam(cam);
                    setRoiActive(true);
                  }}
                  gridMode={selectMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {activeCams.length > CAMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--color-border)',
                    background: page === 0 ? 'var(--color-surface-2)' : 'var(--color-surface)',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    color: page === 0 ? 'var(--color-border)' : 'var(--color-text-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                {Array.from({ length: Math.ceil(activeCams.length / CAMS_PER_PAGE) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: page === i ? 700 : 400,
                      border: `1px solid ${page === i ? 'var(--color-primary-emphasis)' : 'var(--color-border)'}`,
                      background: page === i ? 'var(--color-primary-emphasis)' : 'var(--color-surface)',
                      color: page === i ? 'white' : 'var(--color-text-2)', cursor: 'pointer',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(activeCams.length / CAMS_PER_PAGE) - 1, p + 1))}
                  disabled={page >= Math.ceil(activeCams.length / CAMS_PER_PAGE) - 1}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--color-border)',
                    background: page >= Math.ceil(activeCams.length / CAMS_PER_PAGE) - 1 ? 'var(--color-surface-2)' : 'var(--color-surface)',
                    cursor: page >= Math.ceil(activeCams.length / CAMS_PER_PAGE) - 1 ? 'not-allowed' : 'pointer',
                    color: page >= Math.ceil(activeCams.length / CAMS_PER_PAGE) - 1 ? 'var(--color-border)' : 'var(--color-text-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
                <span style={{ fontSize: 11, color: 'var(--color-text-4)', marginLeft: 4 }}>
                  {activeCams.length} camera{activeCams.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
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

      {/* Expanded camera overlay with ROI option */}
      {expandedCam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setExpandedCam(null); setRoiActive(false); }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ width: '80vw', maxWidth: 1000, aspectRatio: '16/9', background: '#111' }}
            onClick={e => e.stopPropagation()}
          >
            {expandedCam.status !== 'offline' ? (
              <img
                src={`https://loremflickr.com/1200/675/shopping,mall,crowd,people?lock=${expandedCam.seed}`}
                alt={expandedCam.label}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: 'grayscale(1) contrast(1.15) brightness(0.75)',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a0a' }}>
                <WifiOff size={48} strokeWidth={1.5} style={{ color: 'var(--color-text-2)' }} />
              </div>
            )}
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)',
            }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* ROI overlay */}
            {roiActive && (
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                {ROI_LINES.map((roi, i) => (
                  <g key={i}>
                    <polygon
                      points={roi.points.split(' ').map(p => {
                        const [x, y] = p.split(',');
                        return `${x} ${y}`;
                      }).join(' ')}
                      fill={`${roi.color}18`}
                      stroke={roi.color}
                      strokeWidth="1.5"
                      strokeDasharray="6 3"
                    />
                    <text
                      x={roi.points.split(' ')[0].split(',')[0]}
                      y={roi.points.split(' ')[0].split(',')[1]}
                      fill={roi.color}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="700"
                      dy="-4"
                    >
                      Zone {i + 1}
                    </text>
                  </g>
                ))}
              </svg>
            )}

            {/* Top bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: '#E5E7EB' }}>
                  {expandedCam.id}
                </span>
                {expandedCam.status === 'online' && (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded" style={{ background: 'rgba(22,163,74,0.25)', color: '#4ADE80' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                    REC
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* X-ray / ROI toggle */}
                <button
                  onClick={() => setRoiActive(r => !r)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: roiActive ? 'rgba(101,91,211,0.9)' : 'rgba(0,0,0,0.65)',
                    color: roiActive ? 'white' : '#E5E7EB',
                    border: `1px solid ${roiActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Scan size={12} strokeWidth={2} />
                  ROI {roiActive ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => { setExpandedCam(null); setRoiActive(false); }}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(0,0,0,0.65)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-3 left-4">
              <p className="text-base font-bold text-white">{expandedCam.label}</p>
              <p className="text-xs text-gray-300 mt-0.5">{expandedCam.store} · {getZoneLabel(expandedCam.zone)}</p>
            </div>
          </div>
        </div>
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
