'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Zap,
  ArrowUpRight, ArrowDownRight,
  Clock, AlertCircle,
  CheckCircle2, Circle, Upload, Plus, ChevronDown, ChevronUp,
  Activity, ShoppingBag, UserCircle,
  BarChart2, Video, UserPlus, LayoutGrid,
  WifiOff, TrendingDown, Flame,
  FileText, Download, ChevronRight,
  Search, TrendingUp, Sparkles,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useDashboardContext } from '@/components/DashboardProvider';
import { WhatsNewCarousel } from '@/components/WhatsNewCarousel';
import { dashboardCardStyle } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

// ── KPI helpers (style 1 pastel + sparkline) ───────────────────────────────────
function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const KPI_SPARKLINES: number[][] = [
  [38, 42, 40, 48, 45, 52, 50, 58],
  [62, 58, 55, 52, 54, 50, 48, 46],
  [28, 32, 30, 35, 33, 38, 36, 40],
  [44, 40, 46, 42, 48, 45, 50, 52],
];

function KpiSparkline({ data, color, compact = false }: { data: number[]; color: string; compact?: boolean }) {
  const W = compact ? 64 : 76;
  const H = compact ? 30 : 38;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = 2 + (i / (data.length - 1)) * (W - 4);
      const y = H - 3 - ((v - min) / range) * (H - 8);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ flexShrink: 0, display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={compact ? 2 : 2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Style 2 — area sparkline with gradient fill */
function KpiSparklineArea({ data, color, gradId }: { data: number[]; color: string; gradId: string }) {
  const W = 108;
  const H = 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const coords = data.map((v, i) => ({
    x: 2 + (i / (data.length - 1)) * (W - 4),
    y: H - 4 - ((v - min) / range) * (H - 12),
  }));
  const linePts = coords.map(c => `${c.x},${c.y}`).join(' ');
  const areaPath =
    `M${coords[0].x},${H} ` +
    coords.map(c => `L${c.x},${c.y}`).join(' ') +
    ` L${coords[coords.length - 1].x},${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
interface KpiCard {
  label: string;
  actual: number;
  expected: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const KPI_CARDS: KpiCard[] = [
  { label: 'Total Footfall',     actual: 15234, expected: 18000, change: 8.2,  icon: <Users       size={18} strokeWidth={1.5} />, color: '#655BD3' },
  { label: 'Passerby Count',     actual: 45621, expected: 50000, change: 3.1,  icon: <Activity    size={18} strokeWidth={1.5} />, color: '#0EA5E9' },
  { label: 'Avg Conversion',     actual: 12.4,  expected: 15,    change: -1.2, icon: <Zap         size={18} strokeWidth={1.5} />, color: '#F59E0B', suffix: '%', decimals: 1 },
  { label: 'Top Store Visitors', actual: 15234, expected: 17000, change: 5.7,  icon: <ShoppingBag size={18} strokeWidth={1.5} />, color: '#10B981' },
];

function KpiCard({ card, styleVariant = 0, sparkIndex = 0, grouped = false }: { card: KpiCard; styleVariant?: 0 | 1 | 2; sparkIndex?: number; grouped?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pos = card.change >= 0;

  // Style 0 = clean white (original)
  if (styleVariant === 0) {
    return (
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 10,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
        border: `1px solid ${card.color}22`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${card.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <AnimatedNumber value={card.actual} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} className="font-bold tabular-nums" style={{ fontSize: 26, color: 'var(--color-text-1)', lineHeight: 1 } as React.CSSProperties} />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: pos ? '#16A34A' : '#DC2626', background: pos ? 'var(--color-success-light)' : 'var(--color-error-light)', padding: '3px 7px', borderRadius: 99, flexShrink: 0, alignSelf: 'flex-start' }}>
            {pos ? <ArrowUpRight size={10} strokeWidth={2.5} /> : <ArrowDownRight size={10} strokeWidth={2.5} />}
            {Math.abs(card.change)}%
          </span>
        </div>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-4)', lineHeight: 1 }}>{card.label}</p>
      </div>
    );
  }

  // Style 1 = soft pastel card with sparkline (reference design)
  if (styleVariant === 1) {
    const accent = card.color;
    const sparkData = KPI_SPARKLINES[sparkIndex % KPI_SPARKLINES.length];
    const changeColor = pos ? 'var(--color-success)' : 'var(--color-error)';
    const valueColor = isDark
      ? 'var(--color-text-1)'
      : `color-mix(in srgb, ${accent} 72%, #0F172A)`;
    const labelColor = isDark
      ? 'var(--color-text-3)'
      : `color-mix(in srgb, ${accent} 50%, #64748B)`;
    const sparkColor = isDark
      ? `color-mix(in srgb, ${accent} 75%, var(--color-text-2))`
      : `color-mix(in srgb, ${accent} 80%, #1E293B)`;

    return (
      <div
        style={{
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isDark
            ? `linear-gradient(152deg, ${hexAlpha(accent, 0.16)} 0%, ${hexAlpha(accent, 0.05)} 42%, var(--color-surface-2) 100%)`
            : `linear-gradient(152deg, ${hexAlpha(accent, 0.28)} 0%, ${hexAlpha(accent, 0.09)} 48%, #FFFFFF 100%)`,
          border: `1px solid ${isDark ? hexAlpha(accent, 0.14) : hexAlpha(accent, 0.12)}`,
          boxShadow: isDark ? 'var(--shadow-card)' : `0 2px 12px ${hexAlpha(accent, 0.08)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top row: 3D icon + change */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              background: isDark
                ? `linear-gradient(145deg, color-mix(in srgb, ${accent} 55%, #FFFFFF) 0%, color-mix(in srgb, ${accent} 88%, #13161B) 100%)`
                : `linear-gradient(145deg, color-mix(in srgb, ${accent} 70%, #FFFFFF) 0%, ${accent} 100%)`,
              boxShadow: isDark
                ? `0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)`
                : `0 6px 18px ${hexAlpha(accent, 0.38)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 11,
              fontWeight: 600,
              color: changeColor,
              marginTop: 1,
            }}
          >
            {pos ? '+' : '−'}{Math.abs(card.change)}%
            {pos ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
          </span>
        </div>

        {/* Bottom row: label + value | sparkline */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: labelColor, lineHeight: 1.2, marginBottom: 4 }}>
              {card.label}
            </p>
            <AnimatedNumber
              value={card.actual}
              prefix={card.prefix}
              suffix={card.suffix}
              decimals={card.decimals}
              className="font-bold tabular-nums"
              style={{ fontSize: 24, color: valueColor, lineHeight: 1, letterSpacing: '-0.02em' } as React.CSSProperties}
            />
          </div>
          <KpiSparkline data={sparkData} color={sparkColor} compact />
        </div>
      </div>
    );
  }

  // Style 2 = unified panel card: title, value + trend pill, comparison, area sparkline
  const sparkData = KPI_SPARKLINES[sparkIndex % KPI_SPARKLINES.length];
  const sparkColor = isDark
    ? (pos ? `color-mix(in srgb, ${card.color} 70%, #FFFFFF)` : 'var(--color-warning)')
    : (pos ? card.color : '#F97316');
  const trendTextColor = pos ? 'var(--color-success)' : 'var(--color-warning)';
  const trendBg = pos
    ? (isDark ? 'rgba(74, 222, 128, 0.14)' : '#DCFCE7')
    : (isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFEDD5');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 16,
        padding: grouped ? '20px 24px' : '20px 22px',
        minHeight: 112,
        background: grouped ? 'transparent' : 'var(--color-surface)',
        borderRadius: grouped ? 0 : 12,
        border: grouped ? 'none' : `1px solid var(--color-border)`,
        boxShadow: grouped ? 'none' : 'var(--shadow-card)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', lineHeight: 1.3, marginBottom: 14 }}>
          {card.label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <AnimatedNumber
            value={card.actual}
            prefix={card.prefix}
            suffix={card.suffix}
            decimals={card.decimals}
            className="font-bold tabular-nums"
            style={{ fontSize: 32, color: 'var(--color-text-1)', lineHeight: 1, letterSpacing: '-0.03em' } as React.CSSProperties}
          />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: trendTextColor }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: trendBg,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {pos
                ? <ArrowUpRight size={12} strokeWidth={2.5} />
                : <ArrowDownRight size={12} strokeWidth={2.5} />}
            </span>
            {Math.abs(card.change)}%
          </span>
        </div>
        <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-4)', lineHeight: 1.3 }}>
          compared to last week
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <KpiSparklineArea data={sparkData} color={sparkColor} gradId={`kpi-s2-${sparkIndex}`} />
      </div>
    </div>
  );
}

// ── Store insights ────────────────────────────────────────────────────────────
const SIGNALS = [
  { id: 1, title: 'Below peak hours',         summary: 'Footfall 15% below projected peak. Promo push recommended 2–4 PM.',                 icon: <TrendingDown size={14} strokeWidth={1.5} />, color: '#F59E0B' },
  { id: 2, title: 'Queue alert — VivoCity',   summary: 'Queue depth exceeded threshold for 40 min. Staff reallocation suggested.',          icon: <AlertCircle  size={14} strokeWidth={1.5} />, color: '#EF4444' },
  { id: 3, title: 'Conversion trending up',   summary: 'Marina Bay Sands leads at 16.2% vs 12.4% avg — best performer this week.',          icon: <TrendingUp   size={14} strokeWidth={1.5} />, color: '#10B981' },
  { id: 4, title: 'New tenant impact',        summary: 'Jurong Point saw +22% footfall increase after anchor tenant opened last week.',      icon: <Activity     size={14} strokeWidth={1.5} />, color: '#0EA5E9' },
  { id: 5, title: 'Camera coverage gap',      summary: 'Zone C at Bugis Junction has 18% lower detection confidence than baseline.',        icon: <Video        size={14} strokeWidth={1.5} />, color: '#8B5CF6' },
];

// ── Checklist ─────────────────────────────────────────────────────────────────
type TaskStatus = 'done' | 'pending' | 'overdue';
interface Task {
  id: number;
  title: string;
  store: string;
  due: string;
  status: TaskStatus;
  requiresPhoto: boolean;
  automated: boolean;
  assignedTo?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Mannequin display',        store: 'Marina Bay Sands', due: 'Today',    status: 'done',    requiresPhoto: true,  automated: true  },
  { id: 2, title: 'Window signage — June',    store: 'Orchard Central',  due: 'Today',    status: 'pending', requiresPhoto: true,  automated: false },
  { id: 3, title: 'Layout rotation — Zone A', store: 'VivoCity',         due: 'Tomorrow', status: 'pending', requiresPhoto: true,  automated: true  },
  { id: 4, title: 'Restock fitting room',     store: 'Bugis Junction',   due: 'Today',    status: 'overdue', requiresPhoto: false, automated: false },
  { id: 5, title: 'Fixture re-arrangement',   store: 'Tampines Mall',    due: 'Jun 2',    status: 'pending', requiresPhoto: true,  automated: false },
  { id: 6, title: 'Verify camera angles',     store: 'All Stores',       due: 'Weekly',   status: 'done',    requiresPhoto: false, automated: true  },
];

const STATUS_CFG: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  done:    { icon: <CheckCircle2 size={14} strokeWidth={2} />, label: 'Done',    color: '#16A34A', bg: 'rgba(22,163,74,0.08)'   },
  pending: { icon: <Circle       size={14} strokeWidth={2} />, label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.08)'   },
  overdue: { icon: <AlertCircle  size={14} strokeWidth={2} />, label: 'Overdue', color: '#DC2626', bg: 'rgba(220,38,38,0.08)'   },
};

const STORES   = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City', 'All Stores'];
const MANAGERS = ['Sarah Tan', 'John Lim', 'Priya S.', 'Ali Hassan', 'Wei Chen'];

// ── Quick actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Add a Member',       href: '/dashboard/team?action=add-member',                          icon: <UserPlus   size={16} strokeWidth={1.5} /> },
  { label: 'Raise New Concern',  href: '/dashboard/preferences/tickets?action=raise-concern',        icon: <AlertCircle size={16} strokeWidth={1.5} /> },
  { label: 'Create a New Page',  href: '/dashboard/analytics?action=new-page',                       icon: <LayoutGrid size={16} strokeWidth={1.5} /> },
  { label: 'View Snapshots',     href: '/dashboard/analytics?action=view-snapshots',                 icon: <Video      size={16} strokeWidth={1.5} /> },
];

// ── Recent alerts / activity ──────────────────────────────────────────────────
interface RecentAlert { id: number; type: 'critical' | 'warning' | 'success'; message: string; store: string; ago: string; icon: React.ReactNode; }

const RECENT_ALERTS: RecentAlert[] = [
  { id: 1, type: 'critical', message: 'Entrance camera offline',       store: 'Marina Bay Sands', ago: '2 min ago',  icon: <WifiOff      size={13} strokeWidth={1.5} /> },
  { id: 2, type: 'warning',  message: 'High queue depth detected',     store: 'VivoCity',         ago: '9 min ago',  icon: <Flame        size={13} strokeWidth={1.5} /> },
  { id: 3, type: 'critical', message: 'Unusual activity in Zone B',    store: 'Orchard Central',  ago: '17 min ago', icon: <AlertCircle  size={13} strokeWidth={1.5} /> },
  { id: 4, type: 'success',  message: 'Queue cleared — peak resolved', store: 'Tampines Mall',    ago: '31 min ago', icon: <CheckCircle2 size={13} strokeWidth={1.5} /> },
  { id: 5, type: 'warning',  message: 'Low footfall — 32% below avg', store: 'Northpoint City',  ago: '48 min ago', icon: <TrendingDown size={13} strokeWidth={1.5} /> },
];

const ALERT_CFG = {
  critical: { color: '#DC2626', bg: 'var(--color-error-light)',   label: 'Alert'    },
  warning:  { color: '#D97706', bg: 'var(--color-warning-light)', label: 'Warning'  },
  success:  { color: '#16A34A', bg: 'var(--color-success-light)', label: 'Resolved' },
};

// ── Recent reports ────────────────────────────────────────────────────────────
const RECENT_REPORTS = [
  { id: 1, name: 'Monthly Footfall Summary',  scope: 'All Stores',       date: 'May 2026', tag: 'Footfall'     },
  { id: 2, name: 'Demographics Breakdown',     scope: 'Marina Bay Sands', date: 'Week 21',  tag: 'Demographics' },
  { id: 3, name: 'Queue Performance Report',   scope: 'VivoCity',         date: 'May 2026', tag: 'Queue'        },
  { id: 4, name: 'Conversion Rate Analysis',   scope: 'All Stores',       date: 'May 2026', tag: 'Conversion'   },
];

// ── What's new ────────────────────────────────────────────────────────────────
const WHATS_NEW = [
  { id: 1, title: 'Heatmap widget',              desc: 'Visualize foot traffic density across zones in real time.',        date: 'May 26', icon: <LayoutGrid size={14} strokeWidth={1.5} />, color: 'var(--color-primary)' },
  { id: 2, title: 'AI footfall predictions',     desc: 'ML-powered daily and hourly footfall forecasting per store.',      date: 'May 23', icon: <TrendingUp size={14} strokeWidth={1.5} />, color: '#10B981' },
  { id: 3, title: 'Multi-store comparison',      desc: 'Side-by-side KPI comparison across up to 4 stores.',               date: 'May 20', icon: <BarChart2  size={14} strokeWidth={1.5} />, color: '#0EA5E9' },
  { id: 4, title: 'Dwell time analytics',        desc: 'Track average customer dwell time per zone and section.',          date: 'May 17', icon: <Clock      size={14} strokeWidth={1.5} />, color: '#F59E0B' },
  { id: 5, title: 'CSV & Excel export',          desc: 'All analytics reports now exportable in CSV and XLSX format.',     date: 'May 14', icon: <Download   size={14} strokeWidth={1.5} />, color: '#8B5CF6' },
  { id: 6, title: 'Staff alert notifications',   desc: 'Push alerts to store staff for queue and footfall thresholds.',    date: 'May 11', icon: <Users      size={14} strokeWidth={1.5} />, color: '#EF4444' },
];

const cardStyle = dashboardCardStyle;

const SUMMARY_CHIPS: { accent: string; text: React.ReactNode }[] = [
  {
    accent: 'var(--color-primary)',
    text: <>Marina Bay Sands led footfall today with <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>15,234</strong> visitors — its highest this month.</>,
  },
  {
    accent: 'var(--color-success)',
    text: <>Conversion rate is tracking at <strong style={{ color: 'var(--color-warning)', fontWeight: 600 }}>12.4%</strong>, up <strong style={{ color: 'var(--color-success)', fontWeight: 600 }}>+1.8 pts</strong> from yesterday.</>,
  },
  {
    accent: 'var(--color-primary)',
    text: <>Peak hour was <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>1 PM</strong> across all stores — consider extra staffing 12–3 PM tomorrow.</>,
  },
  {
    accent: 'var(--color-error)',
    text: <><strong style={{ color: 'var(--color-error)', fontWeight: 600 }}>1 camera offline</strong> at Bugis Junction North Entry. Review recommended.</>,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router                          = useRouter();
  const { refreshCount }               = useDashboardContext();
  const [tasks,          setTasks]     = useState<Task[]>(INITIAL_TASKS);
  const [showAllTasks,   setShowAll]   = useState(false);
  const [isAddTaskOpen,  setAddOpen]   = useState(false);
  const [newTask,        setNewTask]   = useState({ title: '', store: 'Marina Bay Sands', due: 'Today', requiresPhoto: false, assignedTo: '' });
  const [taskPhotos,     setPhotos]    = useState<Record<number, string>>({});
  const [uploadingId,    setUploading] = useState<number | null>(null);
  const [activitySearch, setSearch]   = useState('');
  const [activityTab,    setActTab]   = useState<'activity' | 'reports'>('activity');
  const [stripOpen,      setStripOpen] = useState(true);
  const [kpiStyle,       setKpiStyle] = useState<0 | 1 | 2>(0);
  const photoRef = useRef<HTMLInputElement>(null);
  const isAdmin  = true;
  const DEFAULT_SHOW = 3;

  const toggleTask = (id: number) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setTasks(ts => [{ ...newTask, id: Date.now(), status: 'pending' as TaskStatus, automated: false, assignedTo: newTask.assignedTo || undefined }, ...ts]);
    setNewTask({ title: '', store: 'Marina Bay Sands', due: 'Today', requiresPhoto: false, assignedTo: '' });
    setAddOpen(false);
  };


  const filteredAlerts = RECENT_ALERTS.filter(a =>
    a.message.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.store.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <>
      <div style={{ padding: '28px 32px', background: 'var(--color-page-bg)', minHeight: '100vh' }}>

        {/* ── Today's Summary strip ───────────────────────────────────────── */}
        <div
          className="insights-strip"
          style={{
            marginBottom: 16,
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            animation: 'slideInStrip 0.45s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes slideInStrip {
              from { opacity: 0; transform: translateX(-12px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {/* Header — click to collapse */}
          <button
            type="button"
            onClick={() => setStripOpen(o => !o)}
            aria-expanded={stripOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 18px',
              cursor: 'pointer',
              userSelect: 'none',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', flex: 1, margin: 0 }}>
              Today&apos;s Summary
            </p>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: stripOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 220ms ease',
              }}
              aria-hidden
            >
              <ChevronDown size={16} strokeWidth={2} style={{ color: 'var(--color-text-3)' }} />
            </span>
          </button>

          {/* Text insight chips */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: stripOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div style={{ overflow: 'hidden', minHeight: 0 }}>
              <div
                className="summary-chips"
                style={{
                  padding: '2px 16px 14px',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                <style>{`
                  @media (max-width: 1100px) {
                    .summary-chips { overflow-x: auto; scrollbar-width: thin; }
                    .summary-chip { min-width: 200px; }
                  }
                `}</style>
                {SUMMARY_CHIPS.map((chip, i) => (
                  <div
                    key={i}
                    className="summary-chip"
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '10px 12px',
                      background: 'var(--color-insights-chip)',
                      borderRadius: 9,
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
                      fontSize: 11.5,
                      color: 'var(--color-text-2)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 3,
                        alignSelf: 'stretch',
                        borderRadius: 2,
                        background: chip.accent,
                        flexShrink: 0,
                        minHeight: 20,
                      }}
                      aria-hidden
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>{chip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI row ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          {/* Style switcher */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-4)', fontWeight: 500, marginRight: 4 }}>Style</span>
            {([0, 1, 2] as const).map(s => (
              <button
                key={s}
                onClick={() => setKpiStyle(s)}
                style={{
                  width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                  background: kpiStyle === s ? 'var(--color-primary)' : 'var(--color-border)',
                  transform: kpiStyle === s ? 'scale(1.4)' : 'scale(1)',
                  transition: 'all 150ms ease',
                }}
                aria-label={`KPI style ${s + 1}`}
              />
            ))}
          </div>
          {kpiStyle === 2 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {KPI_CARDS.map((card, i) => (
                <div
                  key={`${card.label}-${refreshCount}`}
                  style={{ borderRight: i < KPI_CARDS.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <KpiCard card={card} styleVariant={2} sparkIndex={i} grouped />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {KPI_CARDS.map((card, i) => (
                <KpiCard key={`${card.label}-${refreshCount}`} card={card} styleVariant={kpiStyle} sparkIndex={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Row 2: Checklist + Store Insights + Quick Actions ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Checklist & Tasks */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Checklist &amp; Tasks</p>
              {isAdmin && (
                <button
                  onClick={() => setAddOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'var(--color-primary-emphasis)', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'}
                >
                  <Plus size={12} strokeWidth={2.5} /> Add Task
                </button>
              )}
            </div>
            <div>
              {tasks.slice(0, DEFAULT_SHOW).map((task, idx) => {
                const s = STATUS_CFG[task.status];
                return (
                  <div
                    key={task.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)' }}
                    onClick={() => toggleTask(task.id)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--color-text-4)' : 'var(--color-text-1)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">
                          {task.title}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }} className="truncate">{task.store}</span>
                        <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-4)', flexShrink: 0 }}>{task.due}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {task.requiresPhoto ? (
                        taskPhotos[task.id] ? (
                          <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} />
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            <Upload size={11} strokeWidth={1.5} /> Upload
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {/* Animated expandable section */}
              <div style={{
                display: 'grid',
                gridTemplateRows: showAllTasks ? '1fr' : '0fr',
                transition: showAllTasks
                  ? 'grid-template-rows 520ms cubic-bezier(0.34, 1.2, 0.64, 1)'
                  : 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.6, 1)',
              }}>
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  <div style={{
                    transform: showAllTasks ? 'translateY(0)' : 'translateY(-10px)',
                    transition: showAllTasks
                      ? 'transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : 'transform 200ms ease-in',
                  }}>
                    {tasks.slice(DEFAULT_SHOW).map((task) => {
                      const s = STATUS_CFG[task.status];
                      return (
                        <div
                          key={task.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: '1px solid var(--color-border-subtle)' }}
                          onClick={() => toggleTask(task.id)}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--color-text-4)' : 'var(--color-text-1)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">
                                {task.title}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--color-text-3)' }} className="truncate">{task.store}</span>
                              <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
                              <span style={{ fontSize: 11, color: 'var(--color-text-4)', flexShrink: 0 }}>{task.due}</span>
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            {task.requiresPhoto ? (
                              taskPhotos[task.id] ? (
                                <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} />
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                                >
                                  <Upload size={11} strokeWidth={1.5} /> Upload
                                </button>
                              )
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {tasks.length > DEFAULT_SHOW && (
              <button
                onClick={() => setShowAll(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 0', borderTop: '1px solid var(--color-border-subtle)', fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {showAllTasks
                  ? <><ChevronUp size={12} strokeWidth={2} /> Show less</>
                  : <><ChevronDown size={12} strokeWidth={2} /> Show {tasks.length - DEFAULT_SHOW} more</>}
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Quick Actions</p>
            </div>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: showAllTasks ? '1fr' : '1fr 1fr', gap: 8, transition: 'grid-template-columns 200ms ease' }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '16px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'all 150ms ease', textAlign: 'left' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-primary-light)'; el.style.borderColor = 'var(--color-accent-border)'; el.style.boxShadow = 'var(--shadow-card-hover)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-surface-2)'; el.style.borderColor = 'var(--color-border)'; el.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    {action.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-2)', lineHeight: 1.3 }}>{action.label}</p>
                    <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--color-text-4)' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* What's New — carousel */}
          <div style={cardStyle}>
            <WhatsNewCarousel />
          </div>
        </div>

        {/* ── Row 3: Recent Activity/Reports + Store Insights ──────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Recent Activity / Recent Reports — tabbed */}
          <div style={{ ...cardStyle, order: 2 }}>
            {/* Tab header */}
            <div style={{ padding: '14px 20px 0', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {(['activity', 'reports'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActTab(tab)}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: activityTab === tab ? 'var(--color-primary)' : 'var(--color-text-3)',
                      borderBottom: activityTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: -1,
                      transition: 'all 150ms ease',
                    }}
                  >
                    {tab === 'activity' ? 'Recent Activity' : 'Recent Reports'}
                  </button>
                ))}
              </div>
              {activityTab === 'activity' ? (
                <div style={{ position: 'relative', flexShrink: 0, paddingBottom: 10 }}>
                  <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: 10, top: 'calc(50% - 5px)', transform: 'translateY(-50%)', color: 'var(--color-text-4)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={activitySearch}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-2)', background: 'var(--color-surface-2)', outline: 'none', width: 148 }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
                  />
                </div>
              ) : (
                <button
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, paddingBottom: 10 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  View all <ChevronRight size={12} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Tab content */}
            {activityTab === 'activity' ? (
              <div>
                {filteredAlerts.map((alert, idx) => {
                  const cfg = ALERT_CFG[alert.type];
                  return (
                    <div
                      key={alert.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                        {alert.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', lineHeight: 1.3 }}>{alert.message}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>{alert.store}</p>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-text-4)', flexShrink: 0 }}>{alert.ago}</span>
                    </div>
                  );
                })}
                {filteredAlerts.length === 0 && (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--color-text-4)', fontSize: 13 }}>No results</div>
                )}
              </div>
            ) : (
              <div>
                {RECENT_REPORTS.map((r, idx) => (
                  <div
                    key={r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-3)', flexShrink: 0 }}>
                      <FileText size={14} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{r.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.scope}</span>
                        <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.date}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'var(--color-surface-2)', color: 'var(--color-text-3)', flexShrink: 0 }}>{r.tag}</span>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-4)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-4)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                    >
                      <Download size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store Insights */}
          <div style={{ ...cardStyle, order: 1 }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Store Insights</p>
              <button
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                View all <ChevronRight size={12} strokeWidth={2} />
              </button>
            </div>
            <div>
              {SIGNALS.map((s, idx) => (
                <div
                  key={s.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0, marginTop: 1 }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.3, marginBottom: 2 }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.5 }}>{s.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Task Modal ──────────────────────────────────────────────────────── */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={() => setAddOpen(false)}>
          <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 20, boxShadow: 'var(--shadow-modal)', border: '1px solid var(--color-border)', width: '100%', maxWidth: 440, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 20 }}>Add New Task</h3>
            <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Task Title</label>
                <input type="text" placeholder="Describe the task..." value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: 'var(--color-text-1)', background: 'var(--color-surface-2)', outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Store</label>
                  <select value={newTask.store} onChange={e => setNewTask({ ...newTask, store: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: 'var(--color-text-1)', background: 'var(--color-surface-2)', outline: 'none' }}>
                    {STORES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due Date</label>
                  <input type="text" placeholder="Today / Jun 5..." value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: 'var(--color-text-1)', background: 'var(--color-surface-2)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assign To <span style={{ color: 'var(--color-text-4)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: newTask.assignedTo ? 'var(--color-text-1)' : 'var(--color-text-4)', background: 'var(--color-surface-2)', outline: 'none' }}>
                  <option value="">— Unassigned —</option>
                  {MANAGERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={newTask.requiresPhoto} onChange={e => setNewTask({ ...newTask, requiresPhoto: e.target.checked })} style={{ accentColor: 'var(--color-primary-emphasis)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Requires photo upload as proof</span>
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1.5px solid var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface-2)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', color: 'white', background: 'var(--color-primary-emphasis)', cursor: 'pointer' }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden photo input */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && uploadingId !== null) {
            const url = URL.createObjectURL(file);
            setPhotos(p => ({ ...p, [uploadingId]: url }));
            setTasks(ts => ts.map(t => t.id === uploadingId ? { ...t, status: 'done' } : t));
          }
          setUploading(null);
          if (photoRef.current) photoRef.current.value = '';
        }}
      />
    </>
  );
}
