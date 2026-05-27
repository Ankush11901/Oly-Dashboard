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
  { label: 'Total Footfall',     actual: 15234, expected: 18000, change: 8.2, icon: <Users       size={20} strokeWidth={1.5} />, color: '#655BD3' },
  { label: 'Passerby Count',     actual: 45621, expected: 50000, change: 3.1, icon: <Activity    size={20} strokeWidth={1.5} />, color: '#00CE9C' },
  { label: 'Avg Conversion',     actual: 12.4,  expected: 15,    change: 1.2, icon: <Zap         size={20} strokeWidth={1.5} />, color: '#F59E0B', suffix: '%', decimals: 1 },
  { label: 'Top Store Visitors', actual: 15234, expected: 17000, change: 5.7, icon: <ShoppingBag size={20} strokeWidth={1.5} />, color: '#3B82F6' },
];

function KpiCard({ card }: { card: KpiCard }) {
  const pos = card.change >= 0;
  return (
    <div className="card" style={{ padding: '20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${card.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: card.color, flexShrink: 0,
        }}>
          {card.icon}
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 11.5, fontWeight: 700,
          color: pos ? '#16A34A' : '#DC2626',
          background: pos ? '#DCFCE7' : '#FEE2E2',
          padding: '3px 8px', borderRadius: 99,
        }}>
          {pos ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
          {Math.abs(card.change)}%
        </span>
      </div>
      <AnimatedNumber
        value={card.actual}
        prefix={card.prefix}
        suffix={card.suffix}
        decimals={card.decimals}
        className="font-bold tabular-nums"
        style={{ fontSize: 28, color: '#111827', lineHeight: 1 } as React.CSSProperties}
      />
      <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginTop: 6 }}>{card.label}</p>
    </div>
  );
}

// ── Store signals ─────────────────────────────────────────────────────────────
const SIGNALS = [
  { id: 1, color: '#655BD3', title: 'Below peak hours',        summary: 'Footfall 15% below projected peak. Promo push may help 2–4 PM.' },
  { id: 2, color: '#D97706', title: 'Queue alert — VivoCity',  summary: 'Queue depth exceeded threshold for 40 min. Staff reallocation suggested.' },
  { id: 3, color: '#16A34A', title: 'Conversion trending up',  summary: 'Marina Bay Sands leads at 16.2% vs 12.4% avg — best performer this week.' },
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
  { id: 1, title: 'Change mannequin display — Summer collection', store: 'Marina Bay Sands', due: 'Today',    status: 'done',    requiresPhoto: true,  automated: true,  assignedTo: 'Sarah Tan' },
  { id: 2, title: 'Update window signage — June promotion',       store: 'Orchard Central', due: 'Today',    status: 'pending', requiresPhoto: true,  automated: false, assignedTo: 'John Lim' },
  { id: 3, title: 'Monthly layout rotation — Zone A & B',         store: 'VivoCity',        due: 'Tomorrow', status: 'pending', requiresPhoto: true,  automated: true  },
  { id: 4, title: 'Check and restock fitting room supplies',       store: 'Bugis Junction',  due: 'Today',    status: 'overdue', requiresPhoto: false, automated: false },
  { id: 5, title: 'Fixture re-arrangement — Bags section',        store: 'Tampines Mall',   due: 'Jun 2',    status: 'pending', requiresPhoto: true,  automated: false },
  { id: 6, title: 'Verify camera angles — Entrance cameras',      store: 'All Stores',      due: 'Weekly',   status: 'done',    requiresPhoto: false, automated: true  },
];

const STATUS_CFG: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  done:    { icon: <CheckCircle2 size={15} strokeWidth={2} />, label: 'Done',    color: '#16A34A', bg: 'rgba(22,163,74,0.1)'   },
  pending: { icon: <Circle       size={15} strokeWidth={2} />, label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.1)'   },
  overdue: { icon: <AlertCircle  size={15} strokeWidth={2} />, label: 'Overdue', color: '#DC2626', bg: 'rgba(220,38,38,0.1)'   },
};

const STORES   = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City', 'All Stores'];
const MANAGERS = ['Sarah Tan', 'John Lim', 'Priya S.', 'Ali Hassan', 'Wei Chen'];

// ── Quick actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Analytics',          href: '/dashboard/analytics',    icon: <BarChart2  size={14} strokeWidth={1.5} /> },
  { label: 'Live Feed',          href: '/dashboard/live/vms',      icon: <Video      size={14} strokeWidth={1.5} /> },
  { label: 'New Analytics Page', href: '/dashboard/analytics?new=1', icon: <LayoutGrid size={14} strokeWidth={1.5} /> },
  { label: 'Add Team Member',    href: '/dashboard/team',          icon: <UserPlus   size={14} strokeWidth={1.5} /> },
];

// ── Recent alerts ─────────────────────────────────────────────────────────────
interface RecentAlert { id: number; type: 'critical' | 'warning' | 'success'; message: string; store: string; ago: string; icon: React.ReactNode; }

const RECENT_ALERTS: RecentAlert[] = [
  { id: 1, type: 'critical', message: 'Entrance camera offline',      store: 'Marina Bay Sands', ago: '2 min ago',  icon: <WifiOff      size={12} strokeWidth={2} /> },
  { id: 2, type: 'warning',  message: 'High queue depth detected',    store: 'VivoCity',         ago: '9 min ago',  icon: <Flame        size={12} strokeWidth={2} /> },
  { id: 3, type: 'critical', message: 'Unusual activity in Zone B',   store: 'Orchard Central',  ago: '17 min ago', icon: <AlertCircle  size={12} strokeWidth={2} /> },
  { id: 4, type: 'success',  message: 'Footfall predicted met',       store: 'Bugis Junction',   ago: '1 hr ago',   icon: <Activity     size={12} strokeWidth={2} /> },
  { id: 5, type: 'warning',  message: 'Low footfall — below average', store: 'Tampines Mall',    ago: '2 hrs ago',  icon: <TrendingDown size={12} strokeWidth={2} /> },
];

const ALERT_CFG = {
  critical: { color: '#DC2626', bg: '#FEE2E2' },
  warning:  { color: '#D97706', bg: '#FEF3C7' },
  success:  { color: '#16A34A', bg: '#DCFCE7' },
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
  { id: 1, tag: 'NEW',    title: 'Analytics page builder',    date: 'May 24' },
  { id: 2, tag: 'NEW',    title: 'Snapshot deduplication',    date: 'May 22' },
  { id: 3, tag: 'UPDATE', title: 'Live Feed zone filtering',  date: 'May 20' },
  { id: 4, tag: 'NEW',    title: 'Conversion rate chart',     date: 'May 18' },
  { id: 5, tag: 'UPDATE', title: 'Edit layout mode',          date: 'May 16' },
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
  const [activityTab,    setTab]       = useState<'alerts' | 'reports'>('alerts');
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

  const pending = tasks.filter(t => t.status !== 'done').length;
  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, DEFAULT_SHOW);

  return (
    <>
      <div className="p-8">

        {/* ── KPI row ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {KPI_CARDS.map(card => (
            <KpiCard key={`${card.label}-${refreshCount}`} card={card} />
          ))}
        </div>

        {/* ── Store signals ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Store Insights
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {SIGNALS.map(s => (
              <div key={s.id} className="card" style={{ padding: '16px 18px', borderLeft: `3px solid ${s.color}`, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{s.title}</p>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, paddingLeft: 16 }}>{s.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main grid: 2×2 so rows align across columns ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', columnGap: 24, rowGap: 24 }}>

            {/* Quick Actions — row 1, col 1 */}
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, height: 28, display: 'flex', alignItems: 'center' }}>
                Quick Actions
              </p>
              <div className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, height: 'calc(100% - 38px)' }}>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                    style={{ padding: '18px 12px', background: '#F9FAFB', border: '1px solid #F0F0F0', cursor: 'pointer', minHeight: 80 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EEE9FF'; (e.currentTarget as HTMLElement).style.borderColor = '#DDD6FE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#F0F0F0'; }}
                  >
                    <span style={{ color: '#655BD3', display: 'flex', background: '#EEE9FF', borderRadius: 8, padding: 8 }}>{action.icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>{action.label}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Checklist — row 1, col 2 */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, height: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    Checklist &amp; Tasks
                  </p>
                  {pending > 0 && (
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: 'rgba(101,91,211,0.1)', color: '#655BD3' }}>
                      {pending} pending
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setAddOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: '#655BD3', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={12} strokeWidth={2.5} /> Add Task
                  </button>
                )}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {visibleTasks.map((task, idx) => {
                  const s = STATUS_CFG[task.status];
                  return (
                    <div
                      key={task.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
                      onClick={() => toggleTask(task.id)}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? '#9CA3AF' : '#111827', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">
                            {task.title}
                          </p>
                          {task.automated && (
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '1px 5px', borderRadius: 3, background: 'rgba(101,91,211,0.08)', color: '#655BD3', flexShrink: 0 }}>
                              AUTO
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }} className="truncate">{task.store}</span>
                          {task.assignedTo && (
                            <>
                              <span style={{ color: '#E5E7EB', fontSize: 9 }}>●</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#655BD3' }}>
                                <UserCircle size={11} strokeWidth={1.5} />{task.assignedTo}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Photo column */}
                      <div style={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {task.requiresPhoto ? (
                          taskPhotos[task.id] ? (
                            <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', border: '2px solid #16A34A' }} />
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: '#F5F3FF', color: '#655BD3', border: '1px solid #DDD6FE', cursor: 'pointer' }}
                            >
                              <Upload size={9} strokeWidth={1.5} /> Photo
                            </button>
                          )
                        ) : (
                          <span style={{ color: '#E5E7EB', fontSize: 11 }}>—</span>
                        )}
                      </div>

                      {/* Due */}
                      <div style={{ width: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} strokeWidth={1.5} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#9CA3AF' }} className="truncate">{task.due}</span>
                      </div>

                      {/* Status pill */}
                      <div style={{ width: 62, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {tasks.length > DEFAULT_SHOW && (
                  <button
                    onClick={() => setShowAll(v => !v)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 0', borderTop: '1px solid #F3F4F6', fontSize: 11.5, fontWeight: 600, color: '#655BD3', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {showAllTasks
                      ? <><ChevronUp size={12} strokeWidth={2} /> Show less</>
                      : <><ChevronDown size={12} strokeWidth={2} /> Show {tasks.length - DEFAULT_SHOW} more</>
                    }
                  </button>
                )}
              </div>
            </section>

            {/* Activity — row 2, col 1 */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, height: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Activity</p>
                  {activityTab === 'alerts' && (
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
                      {RECENT_ALERTS.filter(a => a.type !== 'success').length} active
                    </span>
                  )}
                </div>
                <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: 7, padding: 3, gap: 2 }}>
                  {(['alerts', 'reports'] as const).map(tab => {
                    const active = activityTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setTab(tab)}
                        style={{ padding: '3px 12px', borderRadius: 5, border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 140ms', background: active ? 'white' : 'transparent', color: active ? '#111827' : '#9CA3AF', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.09)' : 'none' }}
                      >
                        {tab === 'alerts' ? 'Alerts' : 'Reports'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {activityTab === 'alerts' && RECENT_ALERTS.map((alert, idx) => {
                  const cfg = ALERT_CFG[alert.type];
                  return (
                    <div
                      key={alert.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{alert.message}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{alert.store}</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#C4C9D4', flexShrink: 0 }}>{alert.ago}</span>
                    </div>
                  );
                })}

                {activityTab === 'reports' && RECENT_REPORTS.map((r, idx) => (
                  <div
                    key={r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={13} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{r.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{r.scope}</span>
                        <span style={{ color: '#E5E7EB', fontSize: 8 }}>●</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{r.date}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#F3F4F6', color: '#9CA3AF', flexShrink: 0 }}>
                      {r.tag}
                    </span>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EEE9FF'; (e.currentTarget as HTMLElement).style.color = '#655BD3'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
                    >
                      <Download size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* What's New — row 2, col 2 */}
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, height: 28, display: 'flex', alignItems: 'center' }}>
                What&apos;s New
              </p>
              <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {WHATS_NEW.map((item) => {
                  const isNew = item.tag === 'NEW';
                  return (
                    <div
                      key={item.id}
                      style={{ padding: '12px 14px', background: '#F9FAFB', border: '1px solid #F0F0F0', borderRadius: 10, cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4FF'; (e.currentTarget as HTMLElement).style.borderColor = '#E0DBFF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#F0F0F0'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                          padding: '2px 7px', borderRadius: 4,
                          background: isNew ? '#EEE9FF' : '#FEF3C7',
                          color: isNew ? '#655BD3' : '#D97706',
                        }}>
                          {item.tag}
                        </span>
                        <span style={{ fontSize: 11, color: '#C4C9D4' }}>{item.date}</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </section>

        </div>{/* end main grid */}
      </div>

      {/* ── Add Task Modal ─────────────────────────────────────────────────────── */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.55)' }} onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ padding: '28px 28px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-5" style={{ color: '#111827' }}>Add New Task</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Task Title</label>
                <input type="text" placeholder="Describe the task..." value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid #E5E7EB', color: '#111827' }} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Store</label>
                  <select value={newTask.store} onChange={e => setNewTask({ ...newTask, store: e.target.value })} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}>
                    {STORES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Due Date</label>
                  <input type="text" placeholder="Today / Jun 5..." value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid #E5E7EB', color: '#111827' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Assign to Store Manager <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid #E5E7EB', color: newTask.assignedTo ? '#111827' : '#9CA3AF', background: 'white' }}>
                  <option value="">— Unassigned —</option>
                  {MANAGERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={newTask.requiresPhoto} onChange={e => setNewTask({ ...newTask, requiresPhoto: e.target.checked })} style={{ accentColor: '#655BD3', width: 15, height: 15 }} />
                <span className="text-sm" style={{ color: '#374151' }}>Requires photo upload as proof</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#655BD3' }}>Create Task</button>
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
