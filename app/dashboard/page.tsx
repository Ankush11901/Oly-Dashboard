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
  Search, TrendingUp,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useDashboardContext } from '@/components/DashboardProvider';

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

function KpiCard({ card }: { card: KpiCard }) {
  const pos = card.change >= 0;
  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: '16px 18px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.055), 0 1px 2px rgba(0,0,0,0.035)',
      border: `1px solid ${card.color}22`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Main row: icon + value left, pill right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${card.color}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: card.color, flexShrink: 0,
          }}>
            {card.icon}
          </div>
          <AnimatedNumber
            value={card.actual}
            prefix={card.prefix}
            suffix={card.suffix}
            decimals={card.decimals}
            className="font-bold tabular-nums"
            style={{ fontSize: 26, color: '#0F172A', lineHeight: 1 } as React.CSSProperties}
          />
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          fontSize: 11, fontWeight: 700,
          color: pos ? '#16A34A' : '#DC2626',
          background: pos ? '#DCFCE7' : '#FEE2E2',
          padding: '3px 7px', borderRadius: 99,
          flexShrink: 0, alignSelf: 'flex-start',
        }}>
          {pos ? <ArrowUpRight size={10} strokeWidth={2.5} /> : <ArrowDownRight size={10} strokeWidth={2.5} />}
          {Math.abs(card.change)}%
        </span>
      </div>

      <p style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', lineHeight: 1 }}>{card.label}</p>
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
  { label: 'Analytics', href: '/dashboard/analytics',      icon: <BarChart2  size={16} strokeWidth={1.5} /> },
  { label: 'Live Feed',  href: '/dashboard/live/vms',       icon: <Video      size={16} strokeWidth={1.5} /> },
  { label: 'New Page',   href: '/dashboard/analytics?new=1', icon: <LayoutGrid size={16} strokeWidth={1.5} /> },
  { label: 'Add Member', href: '/dashboard/team',           icon: <UserPlus   size={16} strokeWidth={1.5} /> },
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
  critical: { color: '#DC2626', bg: '#FEE2E2', label: 'Alert'    },
  warning:  { color: '#D97706', bg: '#FEF3C7', label: 'Warning'  },
  success:  { color: '#16A34A', bg: '#DCFCE7', label: 'Resolved' },
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
  { id: 1, title: 'Heatmap widget',              desc: 'Visualize foot traffic density across zones in real time.',        date: 'May 26', icon: <LayoutGrid size={14} strokeWidth={1.5} />, color: '#655BD3' },
  { id: 2, title: 'AI footfall predictions',     desc: 'ML-powered daily and hourly footfall forecasting per store.',      date: 'May 23', icon: <TrendingUp size={14} strokeWidth={1.5} />, color: '#10B981' },
  { id: 3, title: 'Multi-store comparison',      desc: 'Side-by-side KPI comparison across up to 4 stores.',               date: 'May 20', icon: <BarChart2  size={14} strokeWidth={1.5} />, color: '#0EA5E9' },
  { id: 4, title: 'Dwell time analytics',        desc: 'Track average customer dwell time per zone and section.',          date: 'May 17', icon: <Clock      size={14} strokeWidth={1.5} />, color: '#F59E0B' },
  { id: 5, title: 'CSV & Excel export',          desc: 'All analytics reports now exportable in CSV and XLSX format.',     date: 'May 14', icon: <Download   size={14} strokeWidth={1.5} />, color: '#8B5CF6' },
  { id: 6, title: 'Staff alert notifications',   desc: 'Push alerts to store staff for queue and footfall thresholds.',    date: 'May 11', icon: <Users      size={14} strokeWidth={1.5} />, color: '#EF4444' },
];

// ── Shared card shell ─────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.055), 0 1px 2px rgba(0,0,0,0.035)',
  overflow: 'hidden',
};

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
      <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh' }}>

        {/* ── KPI row ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {KPI_CARDS.map(card => (
            <KpiCard key={`${card.label}-${refreshCount}`} card={card} />
          ))}
        </div>

        {/* ── Row 2: Checklist + Store Insights + Quick Actions ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Checklist & Tasks */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Checklist &amp; Tasks</p>
              {isAdmin && (
                <button
                  onClick={() => setAddOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#655BD3', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#5549C0'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#655BD3'}
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
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9' }}
                    onClick={() => toggleTask(task.id)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? '#94A3B8' : '#1E293B', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">
                          {task.title}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#64748B' }} className="truncate">{task.store}</span>
                        <span style={{ color: '#CBD5E1', fontSize: 8 }}>●</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{task.due}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {task.requiresPhoto ? (
                        taskPhotos[task.id] ? (
                          <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} />
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: '#655BD3', border: '1px solid #DDD6FE', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
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
                          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: '1px solid #F1F5F9' }}
                          onClick={() => toggleTask(task.id)}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? '#94A3B8' : '#1E293B', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">
                                {task.title}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: '#64748B' }} className="truncate">{task.store}</span>
                              <span style={{ color: '#CBD5E1', fontSize: 8 }}>●</span>
                              <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{task.due}</span>
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            {task.requiresPhoto ? (
                              taskPhotos[task.id] ? (
                                <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} />
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: '#655BD3', border: '1px solid #DDD6FE', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
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
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 0', borderTop: '1px solid #F1F5F9', fontSize: 12, fontWeight: 600, color: '#655BD3', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
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
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Quick Actions</p>
            </div>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: showAllTasks ? '1fr' : '1fr 1fr', gap: 8, transition: 'grid-template-columns 200ms ease' }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '16px', borderRadius: 8, background: 'white', border: '1px solid #EDE9FE', boxShadow: '0 1px 3px rgba(101,91,211,0.07)', cursor: 'pointer', transition: 'all 150ms ease', textAlign: 'left' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#F5F3FF'; el.style.borderColor = '#C4B5FD'; el.style.boxShadow = '0 4px 14px rgba(101,91,211,0.13)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.borderColor = '#EDE9FE'; el.style.boxShadow = '0 1px 3px rgba(101,91,211,0.07)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDEAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#655BD3' }}>
                    {action.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{action.label}</p>
                    <ChevronRight size={12} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* What's New */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>What&apos;s New</p>
                <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Platform updates &amp; releases</p>
              </div>
              <button
                style={{ fontSize: 12, fontWeight: 600, color: '#655BD3', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                Changelog <ChevronRight size={12} strokeWidth={2} />
              </button>
            </div>
            <div>
              {WHATS_NEW.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 120ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0, marginTop: 1 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#1E293B', lineHeight: 1.3, marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, marginTop: 1 }}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Recent Activity/Reports + Store Insights ──────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Recent Activity / Recent Reports — tabbed */}
          <div style={{ ...cardStyle, order: 2 }}>
            {/* Tab header */}
            <div style={{ padding: '14px 20px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
                      color: activityTab === tab ? '#655BD3' : '#64748B',
                      borderBottom: activityTab === tab ? '2px solid #655BD3' : '2px solid transparent',
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
                  <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-60%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={activitySearch}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 12, color: '#374151', background: '#F8FAFC', outline: 'none', width: 148 }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#655BD3'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'}
                  />
                </div>
              ) : (
                <button
                  style={{ fontSize: 12, fontWeight: 600, color: '#655BD3', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, paddingBottom: 10 }}
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
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 120ms' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                        {alert.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', lineHeight: 1.3 }}>{alert.message}</p>
                        <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{alert.store}</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{alert.ago}</span>
                    </div>
                  );
                })}
                {filteredAlerts.length === 0 && (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No results</div>
                )}
              </div>
            ) : (
              <div>
                {RECENT_REPORTS.map((r, idx) => (
                  <div
                    key={r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>
                      <FileText size={14} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{r.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{r.scope}</span>
                        <span style={{ color: '#CBD5E1', fontSize: 8 }}>●</span>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{r.date}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: '#F1F5F9', color: '#64748B', flexShrink: 0 }}>{r.tag}</span>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EEE9FF'; (e.currentTarget as HTMLElement).style.color = '#655BD3'; (e.currentTarget as HTMLElement).style.borderColor = '#DDD6FE'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; }}
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
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Store Insights</p>
              <button
                style={{ fontSize: 12, fontWeight: 600, color: '#655BD3', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
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
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 120ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFF'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0, marginTop: 1 }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', lineHeight: 1.3, marginBottom: 2 }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{s.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Task Modal ──────────────────────────────────────────────────────── */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.5)' }} onClick={() => setAddOpen(false)}>
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', width: '100%', maxWidth: 440, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Add New Task</h3>
            <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Task Title</label>
                <input type="text" placeholder="Describe the task..." value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Store</label>
                  <select value={newTask.store} onChange={e => setNewTask({ ...newTask, store: e.target.value })} style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#0F172A', background: 'white', outline: 'none' }}>
                    {STORES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due Date</label>
                  <input type="text" placeholder="Today / Jun 5..." value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assign To <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: newTask.assignedTo ? '#0F172A' : '#94A3B8', background: 'white', outline: 'none' }}>
                  <option value="">— Unassigned —</option>
                  {MANAGERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={newTask.requiresPhoto} onChange={e => setNewTask({ ...newTask, requiresPhoto: e.target.checked })} style={{ accentColor: '#655BD3', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>Requires photo upload as proof</span>
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1.5px solid #E2E8F0', color: '#374151', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', color: 'white', background: '#655BD3', cursor: 'pointer' }}>Create Task</button>
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
