'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Clock,
  CheckCircle2,
  Star,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
type StoreStatus = 'High' | 'Moderate' | 'Normal';
type TrendDir = '↑' | '→' | '↓';

interface StoreRow {
  name: string;
  inQueue: number;
  avgWait: string;
  status: StoreStatus;
  trend: TrendDir;
}

// ── Static Data ────────────────────────────────────────────────────────────────
const STORE_DATA: StoreRow[] = [
  { name: 'Marina Bay Sands',  inQueue: 12, avgWait: '9.2 min',  status: 'High',     trend: '↑' },
  { name: 'Orchard Central',   inQueue: 5,  avgWait: '4.1 min',  status: 'Normal',   trend: '→' },
  { name: 'VivoCity',          inQueue: 8,  avgWait: '6.8 min',  status: 'Moderate', trend: '↓' },
  { name: 'Bugis Junction',    inQueue: 3,  avgWait: '2.9 min',  status: 'Normal',   trend: '→' },
  { name: 'Tampines Mall',     inQueue: 15, avgWait: '11.4 min', status: 'High',     trend: '↑' },
  { name: 'Jurong Point',      inQueue: 6,  avgWait: '5.2 min',  status: 'Moderate', trend: '→' },
  { name: 'Northpoint City',   inQueue: 2,  avgWait: '1.8 min',  status: 'Normal',   trend: '↓' },
  { name: 'Causeway Point',    inQueue: 9,  avgWait: '7.6 min',  status: 'Moderate', trend: '↑' },
];

const QUEUE_TREND_DATA = {
  Today: [
    { hour: '8am',  depth: 3  },
    { hour: '9am',  depth: 5  },
    { hour: '10am', depth: 8  },
    { hour: '11am', depth: 12 },
    { hour: '12pm', depth: 15 },
    { hour: '1pm',  depth: 18 },
    { hour: '2pm',  depth: 14 },
    { hour: '3pm',  depth: 10 },
    { hour: '4pm',  depth: 8  },
    { hour: '5pm',  depth: 12 },
    { hour: '6pm',  depth: 16 },
    { hour: '7pm',  depth: 11 },
  ],
  'This Week': [
    { hour: 'Mon', depth: 9  },
    { hour: 'Tue', depth: 11 },
    { hour: 'Wed', depth: 14 },
    { hour: 'Thu', depth: 12 },
    { hour: 'Fri', depth: 16 },
    { hour: 'Sat', depth: 18 },
    { hour: 'Sun', depth: 10 },
    { hour: '',    depth: 10 },
    { hour: '',    depth: 10 },
    { hour: '',    depth: 10 },
    { hour: '',    depth: 10 },
    { hour: '',    depth: 10 },
  ],
  'This Month': [
    { hour: 'W1', depth: 10 },
    { hour: 'W2', depth: 13 },
    { hour: 'W3', depth: 11 },
    { hour: 'W4', depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
    { hour: '',   depth: 15 },
  ],
};

const STATUS_CONFIG: Record<StoreStatus, { bg: string; color: string }> = {
  High:     { bg: 'rgba(220,38,38,0.10)',  color: '#DC2626' },
  Moderate: { bg: 'rgba(217,119,6,0.10)',  color: '#D97706' },
  Normal:   { bg: 'rgba(22,163,74,0.10)',  color: '#16A34A' },
};

const TREND_COLOR: Record<TrendDir, string> = {
  '↑': '#DC2626',
  '→': '#9CA3AF',
  '↓': '#16A34A',
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
}
function KpiCard({ label, value, icon, iconColor }: KpiCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${iconColor}18` }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <p className="font-bold tabular-nums" style={{ fontSize: 26, color: '#111827', lineHeight: 1.2 }}>
          {value}
        </p>
        <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}
function QueueTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
      <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <div className="flex items-center gap-2">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#655BD3', display: 'inline-block' }} />
        <span style={{ color: '#D1D5DB', fontSize: 12 }}>Queue Depth</span>
        <span style={{ color: 'white', fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{payload[0].value}</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
type Period = 'Today' | 'This Week' | 'This Month';

export default function QueuePage() {
  const [period, setPeriod] = useState<Period>('Today');
  const [alertQueue, setAlertQueue] = useState(10);
  const [alertWait, setAlertWait] = useState(10);

  const chartData = QUEUE_TREND_DATA[period].filter((d) => d.hour !== '');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Queue Management</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
          Real-time queue monitoring across all stores
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Currently In Queue" value="47"    icon={<Users        size={20} strokeWidth={1.5} />} iconColor="#655BD3" />
        <KpiCard label="Avg Wait Time"      value="8.3 min" icon={<Clock       size={20} strokeWidth={1.5} />} iconColor="#D97706" />
        <KpiCard label="Served Today"       value="1,243" icon={<CheckCircle2 size={20} strokeWidth={1.5} />} iconColor="#16A34A" />
        <KpiCard label="Queue Satisfaction" value="87%"   icon={<Star         size={20} strokeWidth={1.5} />} iconColor="#EC4899" />
      </div>

      {/* Live Queue Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>Live Queue by Store</p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: '#16A34A',
                boxShadow: '0 0 0 3px rgba(22,163,74,0.25)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>Live</span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Store', 'In Queue', 'Avg Wait', 'Status', 'Trend'].map((col) => (
                <th
                  key={col}
                  className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#9CA3AF' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STORE_DATA.map((row, idx) => {
              const sc = STATUS_CONFIG[row.status];
              return (
                <tr
                  key={row.name}
                  style={{ borderBottom: idx < STORE_DATA.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td className="px-6 py-3.5 text-sm font-medium" style={{ color: '#111827' }}>{row.name}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold tabular-nums" style={{ color: '#374151' }}>{row.inQueue}</td>
                  <td className="px-6 py-3.5 text-sm tabular-nums" style={{ color: '#6B7280' }}>{row.avgWait}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-base font-bold" style={{ color: TREND_COLOR[row.trend] }}>
                    {row.trend}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Queue Trend Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Queue Depth — Last 12 Hours</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Average queue length across all stores</p>
          </div>
          {/* Period toggle */}
          <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {(['Today', 'This Week', 'This Month'] as Period[]).map((p, i, arr) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  borderRight: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
                  background: period === p ? '#655BD3' : 'white',
                  color: period === p ? 'white' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 280, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#655BD3" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 20]}
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<QueueTooltip />} />
              <Area
                type="monotone"
                dataKey="depth"
                name="Queue Depth"
                stroke="#655BD3"
                strokeWidth={2.5}
                fill="url(#queueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#655BD3', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert Config */}
      <div className="card">
        <p className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Queue Alert Thresholds</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Alert when queue exceeds
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={alertQueue}
                onChange={(e) => setAlertQueue(Number(e.target.value))}
                className="w-20 text-sm font-semibold"
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '7px 12px',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#655BD3')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>people</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Alert when wait exceeds
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={alertWait}
                onChange={(e) => setAlertWait(Number(e.target.value))}
                className="w-20 text-sm font-semibold"
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '7px 12px',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#655BD3')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>min</span>
            </div>
          </div>

          <button
            className="text-sm font-semibold px-5 py-2 rounded-md transition-opacity"
            style={{ background: '#00CE9C', color: 'white', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Save Thresholds
          </button>
        </div>
      </div>

      {/* Pulse keyframe injected inline for the live dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 0 0 5px rgba(22,163,74,0.10); }
        }
      `}</style>
    </div>
  );
}
