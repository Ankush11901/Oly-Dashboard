'use client';
import { useState } from 'react';
import { Camera, Clock, MapPin, GitMerge, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
}

const SNAPSHOTS: Snapshot[] = [
  { id: 'v001', cameraId: 'CAM-MBS-01', cameraLabel: 'Entrance A', store: 'Marina Bay Sands', timestamp: '14:32:18', timeAgo: '2m ago',   event: 'entry',    visitorId: 'VIS-4821', age: '22–35', gender: 'female',  isDuplicate: false, confidence: 97 },
  { id: 'v002', cameraId: 'CAM-MBS-02', cameraLabel: 'Entrance B', store: 'Marina Bay Sands', timestamp: '14:31:44', timeAgo: '3m ago',   event: 'exit',     visitorId: 'VIS-3612', age: '35+',   gender: 'male',    isDuplicate: false, confidence: 94 },
  { id: 'v003', cameraId: 'CAM-ORC-01', cameraLabel: 'Main Door',  store: 'Orchard Central',  timestamp: '14:30:55', timeAgo: '4m ago',   event: 'entry',    visitorId: 'VIS-5509', age: '13–21', gender: 'female',  isDuplicate: true,  confidence: 88 },
  { id: 'v004', cameraId: 'CAM-VIV-03', cameraLabel: 'Level 2',    store: 'VivoCity',          timestamp: '14:29:12', timeAgo: '6m ago',   event: 'passerby', visitorId: 'VIS-2274', age: '22–35', gender: 'male',    isDuplicate: false, confidence: 91 },
  { id: 'v005', cameraId: 'CAM-BGS-01', cameraLabel: 'North Gate', store: 'Bugis Junction',    timestamp: '14:28:40', timeAgo: '6m ago',   event: 'entry',    visitorId: 'VIS-6633', age: '35+',   gender: 'female',  isDuplicate: false, confidence: 96 },
  { id: 'v006', cameraId: 'CAM-MBS-01', cameraLabel: 'Entrance A', store: 'Marina Bay Sands', timestamp: '14:27:03', timeAgo: '8m ago',   event: 'exit',     visitorId: 'VIS-1188', age: '3–12',  gender: 'male',    isDuplicate: false, confidence: 85 },
  { id: 'v007', cameraId: 'CAM-TAM-02', cameraLabel: 'Side Entry', store: 'Tampines Mall',     timestamp: '14:25:51', timeAgo: '9m ago',   event: 'entry',    visitorId: 'VIS-7741', age: '22–35', gender: 'male',    isDuplicate: true,  confidence: 79 },
  { id: 'v008', cameraId: 'CAM-JUR-01', cameraLabel: 'Main Atrium',store: 'Jurong Point',      timestamp: '14:24:19', timeAgo: '11m ago',  event: 'passerby', visitorId: 'VIS-3355', age: '35+',   gender: 'female',  isDuplicate: false, confidence: 93 },
];

const EVENT_CONFIG = {
  entry:    { label: 'Entry',    color: '#16A34A', bg: 'rgba(22,163,74,0.12)'  },
  exit:     { label: 'Exit',     color: '#DC2626', bg: 'rgba(220,38,38,0.12)'  },
  passerby: { label: 'Passerby', color: '#D97706', bg: 'rgba(217,119,6,0.12)'  },
};

const GENDER_COLORS = { male: '#0DA2FF', female: '#EE0F6B', unknown: '#9CA3AF' };

// Deterministic avatar using initials + gradient derived from visitorId
function VisitorAvatar({ snapshot }: { snapshot: Snapshot }) {
  const hue = parseInt(snapshot.visitorId.replace(/\D/g, ''), 10) % 360;
  const initials = snapshot.gender === 'male' ? 'M' : snapshot.gender === 'female' ? 'F' : '?';
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-lg"
      style={{
        background: `linear-gradient(135deg, hsl(${hue},60%,72%) 0%, hsl(${(hue + 40) % 360},55%,58%) 100%)`,
        fontSize: 28,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 1,
      }}
    >
      {initials}
    </div>
  );
}

export function VisitorSnapshots() {
  const [eventFilter, setEventFilter] = useState<'all' | Snapshot['event']>('all');
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);

  const filtered = eventFilter === 'all'
    ? SNAPSHOTS
    : SNAPSHOTS.filter((s) => s.event === eventFilter);

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Camera size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Visitor Snapshots</h2>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
              Camera-captured visitor events · auto-refreshes every 30s
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <Filter size={13} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
          {(['all', 'entry', 'exit', 'passerby'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setEventFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
              style={{
                background: eventFilter === f ? '#655BD3' : '#F3F4F6',
                color: eventFilter === f ? 'white' : '#374151',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'All Events' : EVENT_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {filtered.map((snap) => {
          const ev = EVENT_CONFIG[snap.event];
          const isMerging = mergeTarget === snap.id;
          return (
            <div
              key={snap.id}
              className="card flex flex-col gap-0 overflow-hidden transition-all"
              style={{
                padding: 0,
                outline: isMerging ? '2px solid #655BD3' : snap.isDuplicate ? '2px solid #F59E0B' : 'none',
                outlineOffset: 2,
              }}
            >
              {/* Photo area */}
              <div
                className="relative flex-shrink-0"
                style={{ height: 130, background: '#F3F4F6' }}
              >
                <VisitorAvatar snapshot={snap} />

                {/* Event badge */}
                <span
                  className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: ev.bg, color: ev.color, backdropFilter: 'blur(4px)' }}
                >
                  {ev.label}
                </span>

                {/* Duplicate warning */}
                {snap.isDuplicate && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}
                  >
                    DUP
                  </span>
                )}

                {/* Confidence bar */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 3, background: '#E5E7EB' }}
                >
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
                {/* Visitor ID + gender */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: '#111827' }}>{snap.visitorId}</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: `${GENDER_COLORS[snap.gender]}20`, color: GENDER_COLORS[snap.gender] }}
                  >
                    {snap.gender} · {snap.age}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5" style={{ color: '#6B7280' }}>
                  <MapPin size={11} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span className="text-[11px] truncate">{snap.cameraLabel} · {snap.store.split(' ').slice(0, 2).join(' ')}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                  <Clock size={11} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span className="text-[11px]">{snap.timestamp} · {snap.timeAgo}</span>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
                  <span className="text-[10px]" style={{ color: '#9CA3AF' }}>Match confidence</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{
                      color: snap.confidence >= 90 ? '#16A34A' : snap.confidence >= 80 ? '#D97706' : '#DC2626',
                    }}
                  >
                    {snap.confidence}%
                  </span>
                </div>

                {/* Actions */}
                {snap.isDuplicate && (
                  <button
                    onClick={() => setMergeTarget(isMerging ? null : snap.id)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md text-[11px] font-semibold transition-colors"
                    style={{
                      background: isMerging ? '#655BD3' : 'rgba(101,91,211,0.1)',
                      color: isMerging ? 'white' : '#655BD3',
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
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          Showing <span style={{ color: '#374151', fontWeight: 600 }}>{filtered.length}</span> of{' '}
          <span style={{ color: '#374151', fontWeight: 600 }}>248</span> snapshots today
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
              style={{ border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'white'}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
