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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Users, TrendingUp, Zap, Store,
  ArrowUpRight, ArrowDownRight,
  CheckSquare, Clock, AlertCircle,
  CheckCircle2, Circle, Upload, Plus, X, Camera,
  BarChart2, ShoppingBag, Activity, GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PASSERBY_TREND_DATA, STORE_VISITOR_DATA, AGE_GENDER_COLORS } from '@/types/dashboard';
import { useDashboardContext } from '@/components/DashboardProvider';
import { VisitorSnapshots } from '@/components/VisitorSnapshots';

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

const TimeFilter = ({ active, onChange, type = 'dwmy' }: { active: string, onChange: (v: string) => void, type?: 'dwmy' | 'my' }) => {
  const options = type === 'dwmy' ? ['D', 'W', 'M', 'Y'] : ['Monthly', 'Yearly'];
  
  return (
    <div className="flex rounded-md overflow-hidden bg-gray-100 border border-gray-200" style={{ height: 28 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3 text-xs font-bold transition-colors"
          style={{
            background: active === opt ? '#000000' : 'transparent',
            color: active === opt ? '#FFFFFF' : '#4B5563',
            borderRight: opt !== options[options.length - 1] ? '1px solid #E5E7EB' : 'none'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

const ChartInfo = ({ title, description, improve, calculation, example }: { title: string, description: string, improve: string, calculation: string, example?: string }) => (
  <div className="relative group ml-2 flex items-center justify-center">
    <div className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-serif font-bold italic cursor-help transition-colors">i</div>
    <div className="absolute top-full right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-left pointer-events-none">
      <p className="text-[14px] font-bold text-gray-900 mb-1.5">{title}</p>
      <p className="text-[13px] text-gray-800 leading-snug mb-3">{description}</p>
      
      <p className="text-[14px] font-bold text-gray-900 mb-1.5">Used to Improve</p>
      <p className="text-[13px] text-gray-800 leading-snug mb-3">{improve}</p>
      
      <p className="text-[14px] font-bold text-gray-900 mb-1.5">How its Calculated?</p>
      <p className="text-[13px] text-gray-800 leading-snug mb-1">{calculation}</p>
      {example && (
        <div>
          <p className="text-[13px] font-bold text-gray-900 mb-0.5">For Example:</p>
          <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-line">{example}</p>
        </div>
      )}
    </div>
  </div>
);

const SortableChartCard = ({ id, title, filters, info, colSpan = 1, children }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
    position: 'relative' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className={`card flex flex-col h-[340px] ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 -ml-1 rounded hover:bg-gray-100">
            <GripVertical size={16} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>{title}</p>
        </div>
        <div className="flex items-center">
          {filters}
          {info}
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

// ── Mock Chart Data for Filters ───────────────────────────────────────────────
const DEMOGRAPHICS_DATA: Record<string, any[]> = {
  'D': [{name: 'Male 22-35', value: 15}, {name: 'Female 22-35', value: 12}, {name: 'Male 13-21', value: 5}, {name: 'Other', value: 3}],
  'W': [{name: 'Male 22-35', value: 80}, {name: 'Female 22-35', value: 75}, {name: 'Male 13-21', value: 25}, {name: 'Other', value: 20}],
  'M': [{name: 'Male 22-35', value: 400}, {name: 'Female 22-35', value: 350}, {name: 'Male 13-21', value: 150}, {name: 'Other', value: 100}],
  'Y': [{name: 'Male 22-35', value: 4800}, {name: 'Female 22-35', value: 4200}, {name: 'Male 13-21', value: 1800}, {name: 'Other', value: 1200}],
};

const CONVERSION_DATA: Record<string, any[]> = {
  'D': [{name: 'Converted', value: 12.5}, {name: 'Missed', value: 87.5}],
  'W': [{name: 'Converted', value: 15.2}, {name: 'Missed', value: 84.8}],
  'M': [{name: 'Converted', value: 18.2}, {name: 'Missed', value: 81.8}],
  'Y': [{name: 'Converted', value: 16.4}, {name: 'Missed', value: 83.6}],
};

const GENDER_TREND_DATA: Record<string, any[]> = {
  'Monthly': [{month: 'Jan', male: 120, female: 110}, {month: 'Feb', male: 130, female: 115}, {month: 'Mar', male: 145, female: 125}, {month: 'Apr', male: 135, female: 130}],
  'Yearly': [{month: '2021', male: 1200, female: 1100}, {month: '2022', male: 1300, female: 1150}, {month: '2023', male: 1450, female: 1250}, {month: '2024', male: 1600, female: 1500}],
};

const OVERALL_CONVERSION_DATA: Record<string, any[]> = {
  'D': [{hour: '9am', cv: 12}, {hour: '12pm', cv: 18}, {hour: '3pm', cv: 14}, {hour: '6pm', cv: 22}],
  'W': [{hour: 'Mon', cv: 14}, {hour: 'Wed', cv: 16}, {hour: 'Fri', cv: 19}, {hour: 'Sun', cv: 25}],
  'M': [{hour: 'Week 1', cv: 15}, {hour: 'Week 2', cv: 17}, {hour: 'Week 3', cv: 16}, {hour: 'Week 4', cv: 18}],
  'Y': [{hour: 'Q1', cv: 14}, {hour: 'Q2', cv: 16}, {hour: 'Q3', cv: 15}, {hour: 'Q4', cv: 20}],
};

const VISITING_HOURS_DATA: Record<string, any[]> = {
  'D': [{hour: '9am', peak: 20}, {hour: '12pm', peak: 80}, {hour: '3pm', peak: 50}, {hour: '6pm', peak: 90}],
  'W': [{hour: '9am', peak: 140}, {hour: '12pm', peak: 560}, {hour: '3pm', peak: 350}, {hour: '6pm', peak: 630}],
  'M': [{hour: '9am', peak: 600}, {hour: '12pm', peak: 2400}, {hour: '3pm', peak: 1500}, {hour: '6pm', peak: 2700}],
  'Y': [{hour: '9am', peak: 7200}, {hour: '12pm', peak: 28800}, {hour: '3pm', peak: 18000}, {hour: '6pm', peak: 32400}],
};

const FOOTFALL_TREND_DATA: Record<string, any[]> = {
  'Monthly': [
    { month: 'Jan', passerby: 4000, entryExit: 2400 },
    { month: 'Feb', passerby: 3000, entryExit: 1398 },
    { month: 'Mar', passerby: 2000, entryExit: 9800 },
    { month: 'Apr', passerby: 2780, entryExit: 3908 },
    { month: 'May', passerby: 1890, entryExit: 4800 },
    { month: 'Jun', passerby: 2390, entryExit: 3800 },
    { month: 'Jul', passerby: 3490, entryExit: 4300 },
  ],
  'Yearly': [
    { month: '2018', passerby: 40000, entryExit: 24000 },
    { month: '2019', passerby: 30000, entryExit: 13980 },
    { month: '2020', passerby: 20000, entryExit: 98000 },
    { month: '2021', passerby: 27800, entryExit: 39080 },
    { month: '2022', passerby: 18900, entryExit: 48000 },
    { month: '2023', passerby: 23900, entryExit: 38000 },
    { month: '2024', passerby: 34900, entryExit: 43000 },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [chartOrder, setChartOrder] = useState<string[]>([
    'demographics_donut',
    'conversion_donut',
    'gender_trend',
    'overall_conversion',
    'visiting_hours'
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChartOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [trendPeriod, setTrendPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [taskFilter, setTaskFilter] = useState<'all' | TaskStatus>('all');
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    store: 'Marina Bay Sands',
    due: 'Today',
    requiresPhoto: false,
    automated: false
  });
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const { enabledWidgets } = useDashboardContext();

  // Time filter states for each chart
  const [filterDemographics, setFilterDemographics] = useState('M');
  const [filterConversion, setFilterConversion] = useState('M');
  const [filterGender, setFilterGender] = useState('Monthly');
  const [filterOverall, setFilterOverall] = useState('D');
  const [filterVisiting, setFilterVisiting] = useState('W');

  const hasTrend = enabledWidgets.has('footfall_trend');
  const hasStores = enabledWidgets.has('top_stores');
  const hasAdditionalInsights = enabledWidgets.has('demographics_donut') || enabledWidgets.has('conversion_donut') || enabledWidgets.has('gender_trend') || enabledWidgets.has('overall_conversion') || enabledWidgets.has('visiting_hours');

  const filteredTasks = taskFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === taskFilter);

  const toggleTaskStatus = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'done' ? 'pending' : 'done' };
      }
      return t;
    }));
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
      automated: newTask.automated,
    };
    setTasks([taskToAdd, ...tasks]);
    setNewTask({ title: '', store: 'Marina Bay Sands', due: 'Today', requiresPhoto: false, automated: false });
    setIsAddTaskOpen(false);
  };

  return (
    <>
      <div className="p-8 space-y-10">

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — Checklist & Tasks
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="checklist">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Checklist &amp; Tasks</h2>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <Plus size={14} strokeWidth={2} />
            Add Task
          </button>
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
                  onClick={() => toggleTaskStatus(task.id)}
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
          SECTION 2 — Insights Dashboard
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
        {(hasTrend || hasStores) && (
          <div className={`grid gap-5 ${!hasTrend ? 'grid-cols-1' : ''}`} style={hasTrend ? { gridTemplateColumns: '1fr 320px' } : {}}>
            {/* Area chart */}
            {hasTrend ? (
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsSnapshotsOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                    >
                      <Camera size={13} strokeWidth={1.5} />
                      View Live Snapshots
                    </button>
                    <ChartInfo 
                      title="Footfall & Passerby Trend"
                      description="It shows the historical data of footfall and passerby traffic over the selected time period."
                      improve="Staffing Optimization, Store Conversion Analysis, and Marketing Campaign Effectiveness."
                      calculation="Total unique visitors entering the store vs passing by outside."
                    />
                  </div>
                </div>
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={FOOTFALL_TREND_DATA[trendPeriod]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="homeGradPasserby" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#655BD3" stopOpacity={0.5} />
                        <stop offset="55%"  stopColor="#655BD3" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="homeGradEntry" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#00CE9C" stopOpacity={0.45} />
                        <stop offset="55%"  stopColor="#00CE9C" stopOpacity={0.12} />
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
          ) : null}

          {/* Top stores */}
          {hasStores ? (
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
          ) : null}
          </div>
        )}
      </section>

      {/* Dynamic Charts Section */}
      {hasAdditionalInsights && (
        <section id="additional_insights">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {chartOrder.map((id) => {
                  if (!enabledWidgets.has(id)) return null;

                  switch (id) {
                    case 'demographics_donut':
                      return (
                        <SortableChartCard
                          key={id}
                          id={id}
                          title="Visitor Demographics"
                          filters={<TimeFilter active={filterDemographics} onChange={setFilterDemographics} />}
                          info={
                            <ChartInfo 
                              title="Visitor Demographics"
                              description="Displays the breakdown of visitors by age groups and gender."
                              improve="Product Merchandising, Targeted Marketing Campaigns, and Customer Profiling."
                              calculation="Uses AI facial recognition to estimate age and gender of unique visitors."
                            />
                          }
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <linearGradient id="gradMale" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#655BD3" />
                                  <stop offset="100%" stopColor="#4F46E5" />
                                </linearGradient>
                                <linearGradient id="gradFemale" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#EC4899" />
                                  <stop offset="100%" stopColor="#DB2777" />
                                </linearGradient>
                                <linearGradient id="gradTeen" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00CE9C" />
                                  <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                              </defs>
                              <Pie data={DEMOGRAPHICS_DATA[filterDemographics]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                {[{color: 'url(#gradMale)'}, {color: 'url(#gradFemale)'}, {color: 'url(#gradTeen)'}, {color: '#D1D5DB'}].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </SortableChartCard>
                      );
                    
                    case 'conversion_donut':
                      return (
                        <SortableChartCard
                          key={id}
                          id={id}
                          title="Conversion Rate"
                          filters={<TimeFilter active={filterConversion} onChange={setFilterConversion} />}
                          info={
                            <ChartInfo 
                              title="Conversion Rate by Stores"
                              description="It shows the data of overall conversion rate, which is used to measure the effectiveness of a store in turning visitors into customers."
                              improve="Performance Evaluation, Optimising Store Layout & Merchandising, Staff Performance, Comparative Analysis and Decision Making."
                              calculation="Conversion Rate = { Footfall Counts / (Footfall+Passerby) }*100."
                              example={`Let's say you want to calculate the conversion rate in a retail shop.\n1. Footfall Counts (Entry/exit) = 200\n2. Passerby Counts (no. of people who passed by the store without entering) = 500\nConversion Rate = 200 / (200+500)\nand which is (200 / 700)*100 = 28.5%\nSo, the conversion rate of the retail store is 28.5%.`}
                            />
                          }
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#F59E0B" />
                                  <stop offset="100%" stopColor="#D97706" />
                                </linearGradient>
                              </defs>
                              <Pie data={CONVERSION_DATA[filterConversion]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                                <Cell fill="url(#gradConv)" stroke="none" />
                                <Cell fill="#F3F4F6" stroke="none" />
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </SortableChartCard>
                      );

                    case 'gender_trend':
                      return (
                        <SortableChartCard
                          key={id}
                          id={id}
                          colSpan={2}
                          title="Gender Trend Over Time"
                          filters={<TimeFilter active={filterGender} onChange={setFilterGender} type="my" />}
                          info={
                            <ChartInfo 
                              title="Gender Trend Over Time"
                              description="Tracks the ratio of male vs female visitors over the selected historical period."
                              improve="Inventory Forecasting, Store Layout Zoning, and Seasonal Promotion Planning."
                              calculation="Aggregate daily visitor data separated by AI-detected gender."
                            />
                          }
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={GENDER_TREND_DATA[filterGender]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="lineGradMale" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#655BD3" />
                                  <stop offset="100%" stopColor="#4F46E5" />
                                </linearGradient>
                                <linearGradient id="lineGradFemale" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#EC4899" />
                                  <stop offset="100%" stopColor="#DB2777" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Legend />
                              <Line type="monotone" dataKey="male" name="Male" stroke="url(#lineGradMale)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="female" name="Female" stroke="url(#lineGradFemale)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </SortableChartCard>
                      );

                    case 'overall_conversion':
                      return (
                        <SortableChartCard
                          key={id}
                          id={id}
                          title="Overall Conversion Hourly"
                          filters={<TimeFilter active={filterOverall} onChange={setFilterOverall} />}
                          info={
                            <ChartInfo 
                              title="Overall Conversion Hourly"
                              description="Displays the conversion rate fluctuating throughout the hours of the day."
                              improve="Staff Shift Scheduling, Peak Hour Optimization, and Real-time Store Management."
                              calculation="Total Hourly Sales / Total Hourly Visitors."
                            />
                          }
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={OVERALL_CONVERSION_DATA[filterOverall]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#F59E0B" />
                                  <stop offset="100%" stopColor="#B45309" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{fill: 'var(--color-surface-2)'}} />
                              <Bar dataKey="cv" name="Conversion %" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </SortableChartCard>
                      );

                    case 'visiting_hours':
                      return (
                        <SortableChartCard
                          key={id}
                          id={id}
                          title="Store Visiting Peak Hours"
                          filters={<TimeFilter active={filterVisiting} onChange={setFilterVisiting} />}
                          info={
                            <ChartInfo 
                              title="Store Visiting Peak Hours"
                              description="A heatmap-style area chart showing when the store experiences the highest traffic."
                              improve="Managing Queue Wait Times, Security Staffing, and Identifying Store Saturation."
                              calculation="Sum of unique visitors recorded during each hour block."
                            />
                          }
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={VISITING_HOURS_DATA[filterVisiting]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.6}/>
                                  <stop offset="100%" stopColor="#00CE9C" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Area type="monotone" dataKey="peak" name="Visitors" stroke="#00CE9C" strokeWidth={3} fill="url(#areaGrad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </SortableChartCard>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

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

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-900">Add New Task</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addTask} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Update window display"
                  style={{ color: '#111827' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                  <select
                    value={newTask.store}
                    onChange={(e) => setNewTask({ ...newTask, store: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    style={{ color: '#111827' }}
                  >
                    <option>Marina Bay Sands</option>
                    <option>Orchard Central</option>
                    <option>VivoCity</option>
                    <option>All Stores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <select
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    style={{ color: '#111827' }}
                  >
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>This Week</option>
                    <option>Next Week</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newTask.requiresPhoto}
                    onChange={(e) => setNewTask({ ...newTask, requiresPhoto: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4" 
                  />
                  <span className="text-sm text-gray-700">Requires Photo Proof</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newTask.automated}
                    onChange={(e) => setNewTask({ ...newTask, automated: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4" 
                  />
                  <span className="text-sm text-gray-700">Automated Task</span>
                </label>
              </div>
              <div className="flex justify-end pt-4 gap-3 border-t">
                <button type="button" onClick={() => setIsAddTaskOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snapshots Modal */}
      {isSnapshotsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Camera className="text-indigo-600" />
                Live Visitor Snapshots
              </h3>
              <button onClick={() => setIsSnapshotsOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--color-page-bg)' }}>
              <VisitorSnapshots />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
