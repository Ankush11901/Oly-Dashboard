'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Zap,
  ArrowUpRight, ArrowDownRight,
  CheckSquare, Clock, AlertCircle,
  CheckCircle2, Circle, Upload, Plus, ChevronDown, ChevronUp,
  Activity, ShoppingBag, UserCircle,
  BarChart2, Video, UserPlus, LayoutGrid,
  Bell, WifiOff, TrendingDown, Flame,
  FileText, Download, ChevronRight, Sparkles,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useDashboardContext } from '@/components/DashboardProvider';

// ── KPI progress-bar style cards ──────────────────────────────────────────────
interface KpiProgressCard {
  label: string;
  actual: number;
  expected: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const KPI_CARDS: KpiProgressCard[] = [
  {
    label: 'Total Footfall',
    actual: 15234,
    expected: 18000,
    change: 8.2,
    icon: <Users size={16} strokeWidth={1.5} />,
    color: '#655BD3',
    bg: 'rgba(101,91,211,0.12)',
  },
  {
    label: 'Passerby Count',
    actual: 45621,
    expected: 50000,
    change: 3.1,
    icon: <Activity size={16} strokeWidth={1.5} />,
    color: '#00CE9C',
    bg: 'rgba(0,206,156,0.12)',
  },
  {
    label: 'Avg Conversion',
    actual: 12.4,
    expected: 15,
    suffix: '%',
    decimals: 1,
    change: 1.2,
    icon: <Zap size={16} strokeWidth={1.5} />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    label: 'Top Store Visitors',
    actual: 15234,
    expected: 17000,
    change: 5.7,
    icon: <ShoppingBag size={16} strokeWidth={1.5} />,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
  },
];

// Module-level set — persists across client-side navigations (SPA re-mounts)
// but resets on a full hard reload. Records which refreshCount epochs have
// already been animated so we don't replay when the user navigates away → back.
const _kpiAnimated = new Set<number>();

function KpiProgressCard({ card, refreshCount }: { card: KpiProgressCard; refreshCount: number }) {
  const pct = Math.min(100, Math.round((card.actual / card.expected) * 100));
  const positive = card.change >= 0;
  const SEGMENTS = 60;
  const targetFilled = Math.round((pct / 100) * SEGMENTS);

  // If this refreshCount epoch was already animated (user navigated away + back),
  // start at the final position immediately — no animation.
  const [filledCount, setFilledCount] = useState(
    _kpiAnimated.has(refreshCount) ? targetFilled : 0
  );

  useEffect(() => {
    if (_kpiAnimated.has(refreshCount)) return; // already played for this epoch
    const t = setTimeout(() => {
      setFilledCount(targetFilled);
      _kpiAnimated.add(refreshCount); // mark as done
    }, 80);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card flex flex-col gap-2" style={{ padding: '14px 16px' }}>
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
          <span style={{ color: card.color }}>{card.icon}</span>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
          style={{
            background: positive ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
            color: positive ? '#16A34A' : '#DC2626',
          }}
        >
          {positive ? <ArrowUpRight size={11} strokeWidth={2} /> : <ArrowDownRight size={11} strokeWidth={2} />}
          {Math.abs(card.change)}%
        </span>
      </div>

      <div>
        <AnimatedNumber
          value={card.actual}
          prefix={card.prefix}
          suffix={card.suffix}
          decimals={card.decimals}
          className="font-bold tabular-nums"
          style={{ fontSize: 22, color: '#111827', lineHeight: 1.15 } as React.CSSProperties}
        />
        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#6B7280' }}>{card.label}</p>
      </div>

      {/* Segmented progress bar — animates left-to-right on mount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: '#9CA3AF' }}>vs expected</span>
          <span className="text-[10px] font-semibold" style={{ color: card.color }}>{pct}%</span>
        </div>
        <div className="flex items-center gap-[1.5px]">
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const filled = i < filledCount;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 14,
                  borderRadius: 1,
                  background: filled ? card.color : `${card.color}25`,
                  // Stagger: each segment starts transitioning slightly after the previous one
                  transition: 'background 260ms ease',
                  transitionDelay: filled ? `${i * 10}ms` : '0ms',
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
            {card.suffix
              ? `${card.actual}${card.suffix}`
              : card.actual.toLocaleString()}
          </span>
          <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
            Expected: {card.suffix
              ? `${card.expected}${card.suffix}`
              : card.expected.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Forecast charts ───────────────────────────────────────────────────────────
// Module-level set — same pattern as _kpiAnimated. Tracks which refresh epochs
// have already played the forecast-card animations so navigate-away→back skips them.
const _forecastAnimated = new Set<number>();

function useForecastAnim(refreshCount: number) {
  const [animated, setAnimated] = useState(_forecastAnimated.has(refreshCount));
  useEffect(() => {
    if (_forecastAnimated.has(refreshCount)) return;
    const t = setTimeout(() => {
      setAnimated(true);
      _forecastAnimated.add(refreshCount);
    }, 120);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return animated;
}

// Card 1 — Footfall: bars grow up from baseline with staggered spring
function FootfallForecastCard({ refreshCount }: { refreshCount: number }) {
  const animated = useForecastAnim(refreshCount);
  const color = '#655BD3';
  const bars = [
    { actual: 14200, forecast: null },
    { actual: 15234, forecast: null },
    { actual: null,  forecast: 15800 },
    { actual: null,  forecast: 16100 },
    { actual: null,  forecast: 16800 },
    { actual: null,  forecast: 18200 },
    { actual: null,  forecast: 17400 },
  ];
  const W = 112, H = 54;
  const maxVal = 18200;
  const barW = 11, gap = 5;
  const totalW = bars.length * barW + (bars.length - 1) * gap;
  const offsetX = (W - totalW) / 2;

  return (
    <div className="card flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden', minHeight: 130 }}>
      <div style={{ height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color, letterSpacing: '0.08em' }}>Footfall</span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tabular-nums" style={{ fontSize: 26, color: '#111827', lineHeight: 1 }}>16,880</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>+10.8%</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Now</span>
            <span className="text-[11px] font-medium" style={{ color: '#6B7280' }}>15,234</span>
            <span style={{ color: '#D1D5DB', fontSize: 10 }}>→</span>
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Predicted</span>
          </div>
        </div>
        <svg width={W} height={H} style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {bars.map((b, i) => {
            const x = offsetX + i * (barW + gap);
            const val = b.actual ?? b.forecast ?? 0;
            const bh = Math.max(4, (val / maxVal) * H);
            const isForecast = b.forecast !== null;
            // Animate: start stubbed at bottom (height=2), grow to full height
            const animY  = animated ? H - bh : H - 2;
            const animH  = animated ? bh : 2;
            const delay  = `${i * 55}ms`;
            const easing = '520ms cubic-bezier(0.34, 1.56, 0.64, 1)';
            return (
              <g key={i}>
                <rect x={x} y={H - 2} width={barW} height={2} rx={1} fill={`${color}18`} />
                <rect
                  x={x}
                  y={animY}
                  width={barW}
                  height={animH}
                  rx={3}
                  fill={isForecast ? `${color}30` : 'url(#barGrad)'}
                  style={{
                    transition: animated
                      ? `y ${easing} ${delay}, height ${easing} ${delay}`
                      : 'none',
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Card 2 — Passerby: donut arc sweeps from 0 to filled percentage
function PasserbyForecastCard({ refreshCount }: { refreshCount: number }) {
  const animated = useForecastAnim(refreshCount);
  const color = '#00CE9C';
  const current = 87100, target = 92500;
  const pct = current / target; // ~0.942
  const R = 26, cx = 32, cy = 32, strokeW = 7;
  const circ = 2 * Math.PI * R;
  const dash = pct * circ;

  // Dot position follows arc progress
  const dotAngle = (pct * 2 * Math.PI) - Math.PI / 2;

  return (
    <div className="card flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden', minHeight: 130 }}>
      <div style={{ height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color, letterSpacing: '0.08em' }}>Passerby</span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tabular-nums" style={{ fontSize: 26, color: '#111827', lineHeight: 1 }}>91,000</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>+4.5%</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Now</span>
            <span className="text-[11px] font-medium" style={{ color: '#6B7280' }}>87,100</span>
            <span style={{ color: '#D1D5DB', fontSize: 10 }}>→</span>
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Predicted</span>
          </div>
        </div>
        <svg
          width={64} height={64}
          style={{
            flexShrink: 0,
            // Subtle pop-in on first appear
            opacity: animated ? 1 : 0,
            transform: animated ? 'scale(1)' : 'scale(0.82)',
            transition: 'opacity 350ms ease 120ms, transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms',
          }}
        >
          <defs>
            <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor="#00A97F" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Outer glow track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={`${color}12`} strokeWidth={strokeW + 4} />
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={`${color}18`} strokeWidth={strokeW} />
          {/* Progress arc — sweeps from 0 to dash */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="url(#donutGrad)"
            strokeWidth={strokeW}
            strokeDasharray={animated ? `${dash} ${circ - dash}` : `0 ${circ}`}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 950ms cubic-bezier(0.4, 0, 0.2, 1) 180ms' }}
          />
          {/* End dot — fades in after arc is mostly drawn */}
          <circle
            cx={cx + R * Math.cos(dotAngle)}
            cy={cy + R * Math.sin(dotAngle)}
            r={3}
            fill="white"
            stroke={color}
            strokeWidth={1.5}
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 200ms ease 900ms' }}
          />
        </svg>
      </div>
    </div>
  );
}

// Card 3 — Conversion Rate: line draws itself left-to-right via stroke-dashoffset
function ConversionForecastCard({ refreshCount }: { refreshCount: number }) {
  const animated = useForecastAnim(refreshCount);
  const color = '#F59E0B';
  const pts = [9.8, 10.4, 11.1, 10.6, 12.4, 13.1, 13.4, 14.0, 14.6];
  const W = 112, H = 52;
  const minV = 8, maxV = 16;
  const toX = (i: number) => (i / (pts.length - 1)) * W;
  const toY = (v: number) => H - ((v - minV) / (maxV - minV)) * H;

  const linePts = pts.map((v, i) => ({ x: toX(i), y: toY(v) }));
  let d = `M ${linePts[0].x} ${linePts[0].y}`;
  for (let i = 1; i < linePts.length; i++) {
    const prev = linePts[i - 1];
    const curr = linePts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  const areaD = `${d} L ${linePts[linePts.length - 1].x} ${H} L ${linePts[0].x} ${H} Z`;

  const splitIdx = pts.length - 3;
  const splitX = toX(splitIdx);

  const forecastPts = linePts.slice(splitIdx);
  let fd = `M ${forecastPts[0].x} ${forecastPts[0].y}`;
  for (let i = 1; i < forecastPts.length; i++) {
    const prev = forecastPts[i - 1];
    const curr = forecastPts[i];
    const cpx = (prev.x + curr.x) / 2;
    fd += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }

  // Large dash length — covers any path length we'll encounter
  const DASH = 700;

  return (
    <div className="card flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden', minHeight: 130 }}>
      <div style={{ height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color, letterSpacing: '0.08em' }}>Conversion Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tabular-nums" style={{ fontSize: 26, color: '#111827', lineHeight: 1 }}>13.4%</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>+8.1%</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Now</span>
            <span className="text-[11px] font-medium" style={{ color: '#6B7280' }}>12.4%</span>
            <span style={{ color: '#D1D5DB', fontSize: 10 }}>→</span>
            <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Predicted</span>
          </div>
        </div>
        <svg width={W} height={H} style={{ flexShrink: 0, overflow: 'visible' }}>
          <defs>
            <linearGradient id="sparkAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="sparkLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset={`${(splitX / W) * 100}%`} stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.55" />
            </linearGradient>
            <clipPath id="actualClip">
              <rect x={0} y={0} width={splitX} height={H} />
            </clipPath>
          </defs>

          {/* Area fill — fades in after line is drawn */}
          <path
            d={areaD}
            fill={`${color}18`}
            clipPath="url(#actualClip)"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 500ms ease 700ms' }}
          />

          {/* Actual line — draws left-to-right via stroke-dashoffset */}
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#actualClip)"
            strokeDasharray={DASH}
            strokeDashoffset={animated ? 0 : DASH}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1) 120ms' }}
          />

          {/* Forecast portion — draws after actual finishes */}
          <path
            d={fd}
            fill="none"
            stroke={`${color}60`}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={DASH}
            strokeDashoffset={animated ? 0 : DASH}
            style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1) 820ms' }}
          />

          {/* Vertical divider */}
          <line x1={splitX} y1={0} x2={splitX} y2={H} stroke={`${color}30`} strokeWidth={1}
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 200ms ease 900ms' }}
          />

          {/* Dot at current point — pops in after line arrives */}
          {(() => {
            const p = linePts[splitIdx];
            return (
              <>
                <circle cx={p.x} cy={p.y} r={4.5} fill={`${color}20`}
                  style={{ opacity: animated ? 1 : 0, transition: 'opacity 200ms ease 950ms' }} />
                <circle cx={p.x} cy={p.y} r={2.5} fill={color}
                  style={{ opacity: animated ? 1 : 0, transition: 'opacity 200ms ease 980ms' }} />
              </>
            );
          })()}
        </svg>
      </div>
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
  assignedTo?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Change mannequin display — Summer collection', store: 'Marina Bay Sands', due: 'Today', status: 'done', requiresPhoto: true, automated: true, assignedTo: 'Sarah Tan' },
  { id: 2, title: 'Update window signage — June promotion', store: 'Orchard Central', due: 'Today', status: 'pending', requiresPhoto: true, automated: false, assignedTo: 'John Lim' },
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

const STORES = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City', 'All Stores'];
const MANAGERS = ['Sarah Tan', 'John Lim', 'Priya S.', 'Ali Hassan', 'Wei Chen'];

// ── Quick Actions data ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: 'Analytics',
    description: 'View charts & reports',
    href: '/dashboard/analytics',
    icon: <BarChart2 size={18} strokeWidth={1.5} />,
    color: '#655BD3',
    bg: '#EEE9FF',
  },
  {
    label: 'Live Feed',
    description: 'Monitor cameras in real time',
    href: '/dashboard/live/vms',
    icon: <Video size={18} strokeWidth={1.5} />,
    color: '#00CE9C',
    bg: '#CCFBF1',
  },
  {
    label: 'New Analytics Page',
    description: 'Build a custom dashboard view',
    href: '/dashboard/analytics',
    icon: <LayoutGrid size={18} strokeWidth={1.5} />,
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    label: 'Add Team Member',
    description: 'Invite a new user to the workspace',
    href: '/dashboard/team/staff',
    icon: <UserPlus size={18} strokeWidth={1.5} />,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
];

// ── Recent Alerts data ────────────────────────────────────────────────────────
interface RecentAlert {
  id: number;
  type: 'critical' | 'warning' | 'success';
  message: string;
  store: string;
  ago: string;
  icon: React.ReactNode;
}
const RECENT_ALERTS: RecentAlert[] = [
  { id: 1, type: 'critical', message: 'Entrance camera offline',        store: 'Marina Bay Sands', ago: '2 min ago',  icon: <WifiOff size={13} strokeWidth={2} /> },
  { id: 2, type: 'warning',  message: 'High queue depth detected',      store: 'VivoCity',         ago: '9 min ago',  icon: <Flame size={13} strokeWidth={2} /> },
  { id: 3, type: 'critical', message: 'Unusual activity in Zone B',     store: 'Orchard Central',  ago: '17 min ago', icon: <AlertCircle size={13} strokeWidth={2} /> },
  { id: 4, type: 'success',  message: 'Footfall predicted met',         store: 'Bugis Junction',   ago: '1 hr ago',   icon: <Activity size={13} strokeWidth={2} /> },
  { id: 5, type: 'warning',  message: 'Low footfall — below average',   store: 'Tampines Mall',    ago: '2 hrs ago',  icon: <TrendingDown size={13} strokeWidth={2} /> },
];
const ALERT_CFG = {
  critical: { color: '#DC2626', bg: '#FEE2E2' },
  warning:  { color: '#D97706', bg: '#FEF3C7' },
  success:  { color: '#16A34A', bg: '#DCFCE7' },
};

// ── Recent Reports data ───────────────────────────────────────────────────────
const RECENT_REPORTS = [
  { id: 1, name: 'Monthly Footfall Summary',     scope: 'All Stores',       date: 'May 2026', tag: 'Footfall'    },
  { id: 2, name: 'Demographics Breakdown',        scope: 'Marina Bay Sands', date: 'Week 21',  tag: 'Demographics'},
  { id: 3, name: 'Queue Performance Report',      scope: 'VivoCity',         date: 'May 2026', tag: 'Queue'       },
  { id: 4, name: 'Conversion Rate Analysis',      scope: 'All Stores',       date: 'May 2026', tag: 'Conversion'  },
];

// ── What's New data ───────────────────────────────────────────────────────────
const WHATS_NEW = [
  { id: 1, tag: 'NEW',    color: '#655BD3', bg: '#EEE9FF', title: 'Analytics page templates',   body: 'Traffic, Demographics & Queue templates now available.',    date: 'May 24' },
  { id: 2, tag: 'NEW',    color: '#00CE9C', bg: '#CCFBF1', title: 'Snapshot deduplication',     body: 'Merge duplicate visitor snapshots with one click.',         date: 'May 22' },
  { id: 3, tag: 'UPDATE', color: '#3B82F6', bg: '#DBEAFE', title: 'Live Feed zone filtering',   body: 'Filter cameras by zone directly from the feed strip.',      date: 'May 20' },
  { id: 4, tag: 'NEW',    color: '#F59E0B', bg: '#FEF3C7', title: 'Conversion rate chart',      body: 'Hourly passerby-to-entry chart added to Analytics.',        date: 'May 18' },
  { id: 5, tag: 'UPDATE', color: '#EC4899', bg: '#FCE7F3', title: 'Edit layout mode',           body: 'Drag and reorder analytics widgets with the new edit mode.', date: 'May 16' },
  { id: 6, tag: 'NEW',    color: '#655BD3', bg: '#EEE9FF', title: 'Multi-store comparison',     body: 'Compare footfall across stores side by side.',              date: 'May 14' },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { refreshCount } = useDashboardContext();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    store: 'Marina Bay Sands',
    due: 'Today',
    requiresPhoto: false,
    assignedTo: '',
  });
  const [taskPhotos, setTaskPhotos] = useState<Record<number, string>>({});
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activityTab, setActivityTab] = useState<'alerts' | 'reports'>('alerts');

  // Permission: admin can create tasks. Toggle this to demo permission gating.
  const isAdmin = true;

  const DEFAULT_SHOW = 2;

  const toggleTaskStatus = (id: number) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
    ));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const taskToAdd: Task = {
      id: Date.now(),
      title: newTask.title,
      store: newTask.store,
      due: newTask.due,
      status: 'pending',
      requiresPhoto: newTask.requiresPhoto,
      automated: false,
      assignedTo: newTask.assignedTo || undefined,
    };
    setTasks([taskToAdd, ...tasks]);
    setNewTask({ title: '', store: 'Marina Bay Sands', due: 'Today', requiresPhoto: false, assignedTo: '' });
    setIsAddTaskOpen(false);
  };

  return (
    <>
      <div className="p-8 space-y-6">

        {/* ═══ KPI Progress Cards ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-4 gap-4">
          {KPI_CARDS.map((card) => (
            <KpiProgressCard
              key={`${card.label}-${refreshCount}`}
              card={card}
              refreshCount={refreshCount}
            />
          ))}
        </div>

        {/* ═══ Forecast Charts (compact, no header) ════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">
          <FootfallForecastCard key={`footfall-${refreshCount}`} refreshCount={refreshCount} />
          <PasserbyForecastCard key={`passerby-${refreshCount}`} refreshCount={refreshCount} />
          <ConversionForecastCard key={`conversion-${refreshCount}`} refreshCount={refreshCount} />
        </div>

        {/* Subtle divider — above Quick Actions / Checklist */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />

        {/* ═══ All four sections in one unified 2-col grid ════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Quick Actions — LEFT */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center mb-4" style={{ height: 32 }}>
            <Zap size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginLeft: 8 }}>Quick Actions</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: showAllTasks ? '1fr' : '1fr 1fr',
            gap: 12,
            flex: 1,
            transition: 'grid-template-columns 200ms ease',
          }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="card text-left flex items-center gap-3"
                style={{ padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow 180ms ease' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = ''}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: action.bg, color: action.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Checklist & Tasks — RIGHT */}
        <section style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="flex items-center justify-between mb-4" style={{ height: 32 }}>
            <div className="flex items-center gap-2">
              <CheckSquare size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Checklist &amp; Tasks</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(101,91,211,0.1)', color: '#655BD3' }}
              >
                {tasks.filter(t => t.status !== 'done').length} pending
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#655BD3', color: 'white' }}
              >
                <Plus size={14} strokeWidth={2} />
                Add Task
              </button>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* All visible tasks in one continuous list */}
            {(showAllTasks ? tasks : tasks.slice(0, DEFAULT_SHOW)).map((task, taskIdx) => {
              const s = STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-4 py-2.5 transition-colors"
                  style={{ cursor: 'pointer', borderTop: taskIdx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
                  onClick={() => toggleTaskStatus(task.id)}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color: task.status === 'done' ? '#9CA3AF' : '#111827',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </p>
                      {task.automated && (
                        <span
                          className="flex-shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-px rounded"
                          style={{ background: 'rgba(101,91,211,0.1)', color: '#655BD3', letterSpacing: '0.06em' }}
                        >
                          AUTO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs truncate" style={{ color: '#6B7280' }}>{task.store}</span>
                      {task.assignedTo && (
                        <>
                          <span style={{ color: '#D1D5DB' }}>·</span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#655BD3' }}>
                            <UserCircle size={11} strokeWidth={1.5} />
                            {task.assignedTo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Col 1 — Photo: fixed 76px so every row's upload button lines up */}
                  <div style={{ width: 76, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.requiresPhoto ? (
                      taskPhotos[task.id] ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={taskPhotos[task.id]}
                            alt="proof"
                            style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', border: '2px solid #16A34A' }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadingTaskId(task.id);
                            photoInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                          style={{ background: '#F5F3FF', color: '#655BD3', border: '1px solid #DDD6FE' }}
                        >
                          <Upload size={10} strokeWidth={1.5} />
                          Photo
                        </button>
                      )
                    ) : (
                      <span style={{ color: '#E5E7EB', fontSize: 11 }}>—</span>
                    )}
                  </div>

                  {/* Col 2 — Due date: fixed 60px so all dates line up */}
                  <div style={{ width: 60, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} strokeWidth={1.5} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                    <span className="text-xs truncate" style={{ color: '#6B7280' }}>{task.due}</span>
                  </div>

                  {/* Col 3 — Status: fixed 68px so all pills line up flush right */}
                  <div style={{ width: 68, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Show more / less — always at the bottom of the card */}
            {tasks.length > DEFAULT_SHOW && (
              <button
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
                style={{
                  borderTop: '1px solid #F3F4F6',
                  color: '#655BD3',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {showAllTasks
                  ? <><ChevronUp size={13} strokeWidth={2} /> Show less</>
                  : <><ChevronDown size={13} strokeWidth={2} /> Show {tasks.length - DEFAULT_SHOW} more</>
                }
              </button>
            )}
          </div>
        </section>


        {/* Activity */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Heading outside the card */}
          <div className="flex items-center justify-between mb-4" style={{ height: 32 }}>
            <div className="flex items-center gap-2">
              <Bell size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Activity</h2>
              {activityTab === 'alerts' && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}
                >
                  {RECENT_ALERTS.filter(a => a.type !== 'success').length} active
                </span>
              )}
            </div>
            {/* Tab switcher — iOS-style pill */}
            <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
              {(['alerts', 'reports'] as const).map((tab) => {
                const active = activityTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    style={{
                      padding: '4px 14px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      background: active ? 'white' : 'transparent',
                      color: active ? '#111827' : '#9CA3AF',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                    }}
                  >
                    {tab === 'alerts' ? 'Alerts' : 'Reports'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>

            {/* Alerts tab */}
            {activityTab === 'alerts' && (
              <div>
                {RECENT_ALERTS.map((alert, idx) => {
                  const cfg = ALERT_CFG[alert.type];
                  return (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors"
                      style={{ borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: cfg.bg, color: cfg.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {alert.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 500, color: '#111827' }}>{alert.message}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{alert.store}</p>
                      </div>
                      <span style={{ fontSize: 10.5, color: '#9CA3AF', flexShrink: 0 }}>{alert.ago}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reports tab */}
            {activityTab === 'reports' && (
              <div>
                {RECENT_REPORTS.map((report, idx) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: '#EEE9FF', color: '#655BD3',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={14} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: '#111827' }}>{report.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>{report.scope}</span>
                        <span style={{ color: '#E5E7EB', fontSize: 9 }}>●</span>
                        <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>{report.date}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: '#F3F4F6', color: '#6B7280', flexShrink: 0,
                    }}>
                      {report.tag}
                    </span>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: '#F3F4F6', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6B7280',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#EEE9FF';
                        (e.currentTarget as HTMLElement).style.color = '#655BD3';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#F3F4F6';
                        (e.currentTarget as HTMLElement).style.color = '#6B7280';
                      }}
                    >
                      <Download size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* What's New */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-2 mb-4" style={{ height: 32 }}>
            <Sparkles size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>What&apos;s New</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1, alignContent: 'start' }}>
            {WHATS_NEW.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{ padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow 180ms ease' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = ''}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{
                    fontSize: 9.5, fontWeight: 800, letterSpacing: '0.07em',
                    padding: '2px 7px', borderRadius: 4,
                    background: item.bg, color: item.color,
                  }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#9CA3AF', marginLeft: 'auto' }}>{item.date}</span>
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        </div>{/* end unified 4-section grid */}

      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(17,24,39,0.6)' }}
          onClick={() => setIsAddTaskOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ padding: '28px 28px', borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-5" style={{ color: '#111827' }}>Add New Task</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Task Title</label>
                <input
                  type="text"
                  placeholder="Describe the task..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ border: '1px solid #E5E7EB', color: '#111827' }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Store</label>
                  <select
                    value={newTask.store}
                    onChange={(e) => setNewTask({ ...newTask, store: e.target.value })}
                    className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}
                  >
                    {STORES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Due Date</label>
                  <input
                    type="text"
                    placeholder="Today / Tomorrow / Jun 5..."
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                    className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#111827' }}
                  />
                </div>
              </div>

              {/* Assign to store manager */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Assign to Store Manager <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ border: '1px solid #E5E7EB', color: newTask.assignedTo ? '#111827' : '#9CA3AF', background: 'white' }}
                >
                  <option value="">— Unassigned —</option>
                  {MANAGERS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTask.requiresPhoto}
                  onChange={(e) => setNewTask({ ...newTask, requiresPhoto: e.target.checked })}
                  style={{ accentColor: '#655BD3', width: 15, height: 15 }}
                />
                <span className="text-sm" style={{ color: '#374151' }}>Requires photo upload as proof</span>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#655BD3' }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden file input for photo upload */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingTaskId !== null) {
            const url = URL.createObjectURL(file);
            setTaskPhotos(prev => ({ ...prev, [uploadingTaskId]: url }));
            setTasks(prev => prev.map(t =>
              t.id === uploadingTaskId ? { ...t, status: 'done' } : t
            ));
          }
          setUploadingTaskId(null);
          if (photoInputRef.current) photoInputRef.current.value = '';
        }}
      />
    </>
  );
}
