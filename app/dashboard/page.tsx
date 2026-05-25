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
  Users, TrendingUp, Zap, Store,
  ArrowUpRight, ArrowDownRight,
  CheckSquare, Clock, AlertCircle,
  CheckCircle2, Circle, Upload, Plus,
  BarChart2, ShoppingBag, Activity,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PASSERBY_TREND_DATA, STORE_VISITOR_DATA, AGE_GENDER_COLORS } from '@/types/dashboard';

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, prefix, suffix, decimals, change, changeLabel, icon, iconBg, iconColor }: KpiCardProps) {
  const positive = change >= 0;
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
          style={{
            background: positive ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
            color: positive ? '#16A34A' : '#DC2626',
          }}
        >
          {positive
            ? <ArrowUpRight size={12} strokeWidth={2} />
            : <ArrowDownRight size={12} strokeWidth={2} />
          }
          {Math.abs(change)}%
        </span>
      </div>
      <div>
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="font-bold tabular-nums"
          style={{ fontSize: 28, color: 'var(--color-text-1)', lineHeight: 1.2 } as React.CSSProperties}
        />
        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-2)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{changeLabel}</p>
      </div>
    </div>
  );
}

// ── Trend tooltip ─────────────────────────────────────────────────────────────
function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}
function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
      <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-8" style={{ marginBottom: 3 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#D1D5DB', fontSize: 12 }}>{p.name}</span>
          </div>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{formatK(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Segmented bar ─────────────────────────────────────────────────────────────
function SegmentedBar({ breakdown }: { breakdown: number[] }) {
  return (
    <div className="flex rounded-full overflow-hidden" style={{ height: 5, marginTop: 4 }}>
      {breakdown.map((pct, i) => (
        <div key={i} style={{ width: `${pct}%`, background: AGE_GENDER_COLORS[i], flexShrink: 0 }} />
      ))}
    </div>
  );
}

// ── Checklist data ────────────────────────────────────────────────────────────
type TaskStatus = 'done' | 'pending' | 'overdue';
interface Task {
  id: number;
  title: string;
  store: string;
  due: string;
  status: TaskStatus;
  requiresPhoto: boolean;
  automated: boolean;
}

const TASKS: Task[] = [
  { id: 1, title: 'Change mannequin display — Summer collection', store: 'Marina Bay Sands', due: 'Today', status: 'done', requiresPhoto: true, automated: true },
  { id: 2, title: 'Update window signage — June promotion', store: 'Orchard Central', due: 'Today', status: 'pending', requiresPhoto: true, automated: false },
  { id: 3, title: 'Monthly layout rotation — Zone A & B', store: 'VivoCity', due: 'Tomorrow', status: 'pending', requiresPhoto: true, automated: true },
  { id: 4, title: 'Check and restock fitting room supplies', store: 'Bugis Junction', due: 'Today', status: 'overdue', requiresPhoto: false, automated: false },
  { id: 5, title: 'Fixture re-arrangement — Bags section', store: 'Tampines Mall', due: 'Jun 2', status: 'pending', requiresPhoto: true, automated: false },
  { id: 6, title: 'Verify camera angles — Entrance cameras', store: 'All Stores', due: 'Weekly', status: 'done', requiresPhoto: false, automated: true },
];

const STATUS_CONFIG: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  done:    { icon: <CheckCircle2 size={15} strokeWidth={2} />, label: 'Done',    color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  pending: { icon: <Circle size={15} strokeWidth={2} />,       label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.1)'  },
  overdue: { icon: <AlertCircle size={15} strokeWidth={2} />,  label: 'Overdue', color: '#DC2626', bg: 'rgba(220,38,38,0.1)'  },
};

// ── Chart metric cards ────────────────────────────────────────────────────────
const METRIC_CARDS = [
  { label: 'Total Footfall', value: '15,234', change: '+8.2%', positive: true, icon: <Users size={16} strokeWidth={1.5} />, color: '#655BD3', bg: 'rgba(101,91,211,0.12)' },
  { label: 'Passerby Count', value: '45,621', change: '+3.1%', positive: true, icon: <Activity size={16} strokeWidth={1.5} />, color: '#00CE9C', bg: 'rgba(0,206,156,0.12)' },
  { label: 'Avg Conversion', value: '12.4%',  change: '+1.2%', positive: true, icon: <Zap size={16} strokeWidth={1.5} />,    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { label: 'Top Store Visitors', value: '15,234', change: '+5.7%', positive: true, icon: <ShoppingBag size={16} strokeWidth={1.5} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [trendPeriod, setTrendPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [taskFilter, setTaskFilter] = useState<'all' | TaskStatus>('all');

  const filteredTasks = taskFilter === 'all'
    ? TASKS
    : TASKS.filter((t) => t.status === taskFilter);

  const doneCount    = TASKS.filter((t) => t.status === 'done').length;
  const pendingCount = TASKS.filter((t) => t.status === 'pending').length;
  const overdueCount = TASKS.filter((t) => t.status === 'overdue').length;

  return (
    <div className="p-8 space-y-10">

      {/* ── Greeting ── */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.3 }}>
          Good morning, Admin 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 3 }}>
          Here&apos;s what&apos;s happening across your stores today.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — Insights Dashboard
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="insights">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Insights Dashboard</h2>
        </div>

        {/* Metric summary chips */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {METRIC_CARDS.map((m) => (
            <div
              key={m.label}
              className="card flex items-center gap-3"
              style={{ padding: '14px 16px' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: m.bg }}
              >
                <span style={{ color: m.color }}>{m.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{m.label}</p>
                <p className="font-bold tabular-nums" style={{ fontSize: 18, color: 'var(--color-text-1)', lineHeight: 1.3 }}>
                  {m.value}
                </p>
                <span
                  className="text-xs font-semibold"
                  style={{ color: m.positive ? '#16A34A' : '#DC2626' }}
                >
                  {m.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trend chart + Top stores */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
          {/* Area chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>
                  Footfall &amp; Passerby Trend
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                  Monthly store entry vs passerby flow
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {[
                    { color: '#655BD3', label: 'Passerby' },
                    { color: '#00CE9C', label: 'Entry / Exit' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  {(['Monthly', 'Yearly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTrendPeriod(p)}
                      style={{
                        padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        border: 'none', borderRight: p === 'Monthly' ? '1px solid var(--color-border)' : 'none',
                        background: trendPeriod === p ? '#655BD3' : 'var(--color-surface)',
                        color: trendPeriod === p ? 'white' : 'var(--color-text-2)',
                        transition: 'all 150ms',
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PASSERBY_TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="homeGradPasserby" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#655BD3" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="homeGradEntry" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#00CE9C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-4)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: 'var(--color-text-4)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="passerby" name="Passerby" stroke="#655BD3" strokeWidth={2} fill="url(#homeGradPasserby)" dot={false} activeDot={{ r: 5, fill: '#655BD3', stroke: 'white', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="entryExit" name="Entry / Exit" stroke="#00CE9C" strokeWidth={2} fill="url(#homeGradEntry)" dot={false} activeDot={{ r: 5, fill: '#00CE9C', stroke: 'white', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top stores */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>Top Stores</p>
              <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>by visitors</span>
            </div>
            <div className="flex-1 space-y-0.5">
              {STORE_VISITOR_DATA.slice(0, 6).map((store, i) => (
                <div
                  key={store.name}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? '#655BD3' : 'var(--color-surface-2)',
                      color: i === 0 ? 'white' : 'var(--color-text-3)',
                    }}
                  >{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-1)' }}>{store.name}</p>
                    <SegmentedBar breakdown={store.breakdown} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--color-text-2)' }}>
                    {store.visitors.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — Checklist & Tasks
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="checklist">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Checklist &amp; Tasks</h2>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <Plus size={14} strokeWidth={2} />
            Add Task
          </button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { key: 'done',    count: doneCount,    label: 'Completed', icon: <CheckCircle2 size={18} strokeWidth={1.5} />, color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
            { key: 'pending', count: pendingCount, label: 'Pending',   icon: <Clock size={18} strokeWidth={1.5} />,        color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
            { key: 'overdue', count: overdueCount, label: 'Overdue',   icon: <AlertCircle size={18} strokeWidth={1.5} />,  color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setTaskFilter(taskFilter === s.key ? 'all' : s.key as TaskStatus)}
              className="card flex items-center gap-4 text-left transition-all"
              style={{
                padding: '14px 18px',
                outline: taskFilter === s.key ? `2px solid ${s.color}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <p className="font-bold text-2xl tabular-nums" style={{ color: 'var(--color-text-1)', lineHeight: 1 }}>{s.count}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{s.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {(['all', 'pending', 'overdue', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
                style={{
                  background: taskFilter === f ? 'var(--color-primary-light)' : 'transparent',
                  color: taskFilter === f ? 'var(--color-primary)' : 'var(--color-text-3)',
                }}
              >{f === 'all' ? 'All tasks' : f}</button>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {filteredTasks.map((task) => {
              const s = STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Status icon */}
                  <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>

                  {/* Title + store */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{
                        color: task.status === 'done' ? 'var(--color-text-3)' : 'var(--color-text-1)',
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-3)' }}>
                      {task.store}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {task.automated && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(101,91,211,0.12)', color: '#655BD3' }}
                      >AUTO</span>
                    )}
                    {task.requiresPhoto && (
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-3)' }}>
                        <Upload size={12} strokeWidth={1.5} />
                        <span className="text-xs">Photo</span>
                      </div>
                    )}
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {task.due}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — Forecast (preview)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="forecast">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Forecast</h2>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {[
            { label: "Tomorrow's Expected Footfall", value: '16,100', change: '+5.7%', note: 'vs today', positive: true, color: '#655BD3' },
            { label: "This Week's Projected Visitors", value: '89,240', change: '+2.3%', note: 'vs last week', positive: true, color: '#00CE9C' },
            { label: "Monthly Conversion Forecast", value: '13.1%', change: '+0.7%', note: 'vs last month', positive: true, color: '#F59E0B' },
          ].map((f) => (
            <div key={f.label} className="card flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: f.color }}
                />
                <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{f.label}</p>
              </div>
              <p className="font-bold tabular-nums" style={{ fontSize: 30, color: 'var(--color-text-1)', lineHeight: 1 }}>
                {f.value}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-0.5 text-xs font-semibold"
                  style={{ color: f.positive ? '#16A34A' : '#DC2626' }}
                >
                  <ArrowUpRight size={12} strokeWidth={2} />
                  {f.change}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{f.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
