'use client';
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Circle, Upload, Plus, ChevronDown, ChevronUp,
  UserPlus, LayoutGrid, Video,
  FileText, Download, ChevronRight, CalendarDays,
  Search, ListChecks,
} from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';
import { DateCalendarPanel, dateToIso, isoToDate } from '@/components/DateCalendarPanel';
import { useDashboardContext } from '@/components/DashboardProvider';
import { WhatsNewCarousel } from '@/components/WhatsNewCarousel';
import { dashboardCardStyle } from '@/lib/theme';
import { KpiPanelGrouped } from '@/components/home/KpiCard';
import { HomeBentoView } from '@/components/home/HomeBentoView';
import { HomeRedesignView } from '@/components/home/HomeRedesignView';
import { HomeHybridView } from '@/components/home/HomeHybridView';
import {
  SIGNALS, INITIAL_TASKS, STATUS_CFG, QUICK_ACTIONS, PRESAVED_CONCERNS, signalIconStyle,
  RECURRENCE_OPTIONS, WEEKDAYS,
  formatTaskRecurrence, formatTaskDueWindow,
  type Recurrence, type DurationUnit,
  RECENT_ALERTS, ALERT_CFG, RECENT_REPORTS,
  type Task, type TaskStatus,
} from '@/components/home/home-data';

const STORES   = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City', 'All Stores'];
const MANAGERS = ['Sarah Tan', 'John Lim', 'Priya S.', 'Ali Hassan', 'Wei Chen'];
const cardStyle = dashboardCardStyle;

const toLocalISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDueLabelFromISO = (iso: string) => {
  if (!iso) return 'Today';
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const todayISO = toLocalISODate(today);
  const tomorrowISO = toLocalISODate(tomorrow);
  if (iso === todayISO) return 'Today';
  if (iso === tomorrowISO) return 'Tomorrow';
  const date = parseISODate(iso);
  if (!date) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const initialDueISO = toLocalISODate(new Date());
const EMPTY_NEW_TASK = {
  title: '', store: 'Marina Bay Sands', due: 'Today', dueDateISO: initialDueISO, requiresPhoto: false, assignedTo: '',
  recurrence: 'none' as Recurrence, recurrenceWeekdays: [] as string[], recurrenceMonthDays: [] as number[],
  completeWithinValue: '', completeWithinUnit: 'minutes' as DurationUnit,
};
const needsWeekdayPicker = (r: Recurrence) => r === 'weekly' || r === 'biweekly' || r === 'custom';
const fieldLabel: CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { refreshCount, setInsightsOpen, homeVariant } = useDashboardContext();

  const [tasks,            setTasks]     = useState<Task[]>(INITIAL_TASKS);
  const [showAllTasks,     setShowAll]   = useState(false);
  const [isAddTaskOpen,    setAddOpen]   = useState(false);
  const [newTask,          setNewTask]   = useState(EMPTY_NEW_TASK);
  const [dueCalendarOpen,  setDueCalendarOpen] = useState(false);
  const [dueCalendarMonth, setDueCalendarMonth] = useState(() => isoToDate(initialDueISO));
  const [concernOpen,      setConcernOpen]  = useState(false);
  const [concernSent,      setConcernSent]  = useState<string | null>(null);
  const [tasksHistoryOpen, setTasksHistoryOpen] = useState(false);
  const [taskTrackerOpen,  setTaskTrackerOpen] = useState(false);
  const [taskPhotos,       setPhotos]    = useState<Record<number, string>>({});
  const [uploadingId,      setUploading] = useState<number | null>(null);
  const [activitySearch,   setSearch]   = useState('');
  const [activityTab,      setActTab]   = useState<'activity' | 'reports'>('activity');
  const photoRef = useRef<HTMLInputElement>(null);
  const isAdmin = true;
  const DEFAULT_SHOW = 3;

  useEffect(() => {
    if (!isAddTaskOpen) setDueCalendarOpen(false);
  }, [isAddTaskOpen]);

  useEffect(() => {
    if (isAddTaskOpen) setTaskTrackerOpen(false);
  }, [isAddTaskOpen]);

  const openAddTask = () => {
    setTaskTrackerOpen(false);
    setAddOpen(true);
  };

  const toggleTask = (id: number) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));

  const toggleWeekday = (id: string) => {
    setNewTask(f => {
      const next = new Set(f.recurrenceWeekdays);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...f, recurrenceWeekdays: Array.from(next) };
    });
  };
  const toggleMonthDay = (day: number) => {
    setNewTask(f => {
      const next = new Set(f.recurrenceMonthDays);
      next.has(day) ? next.delete(day) : next.add(day);
      return { ...f, recurrenceMonthDays: Array.from(next).sort((a, b) => a - b) };
    });
  };
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const dueLabel = formatDueLabelFromISO(newTask.dueDateISO);
    const withinVal = newTask.completeWithinValue ? Number(newTask.completeWithinValue) : undefined;
    const dueBy = withinVal && withinVal > 0
      ? `Within ${withinVal} ${newTask.completeWithinUnit === 'hours' ? (withinVal === 1 ? 'hour' : 'hours') : (withinVal === 1 ? 'minute' : 'minutes')}`
      : undefined;
    setTasks(ts => [{
      title: newTask.title, store: newTask.store, due: dueBy ?? dueLabel,
      requiresPhoto: newTask.requiresPhoto, id: Date.now(), status: 'pending' as TaskStatus,
      automated: false, assignedTo: newTask.assignedTo || undefined, dueBy,
      recurrence: newTask.recurrence,
      recurrenceWeekdays: needsWeekdayPicker(newTask.recurrence) ? newTask.recurrenceWeekdays : undefined,
      recurrenceMonthDays: newTask.recurrence === 'monthly' ? newTask.recurrenceMonthDays : undefined,
      completeWithinValue: withinVal, completeWithinUnit: withinVal ? newTask.completeWithinUnit : undefined,
    }, ...ts]);
    setNewTask(EMPTY_NEW_TASK);
    setAddOpen(false);
  };

  const filteredAlerts = RECENT_ALERTS.filter(a =>
    a.message.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.store.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <>
      <div className="dashboard-home">

        {/* ── Variant content ──────────────────────────────────────────────── */}
        <div
          key={homeVariant}
          className="dashboard-home__view"
          style={{ animationName: 'homeVariantIn', animationDuration: '220ms', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)', animationFillMode: 'both' }}
        >

          {/* ══════════════════════════════════════════════════════════════════
              VARIANT 1 — CLASSIC (original, fully preserved)
          ══════════════════════════════════════════════════════════════════ */}
          {homeVariant === 0 && (
            <>
              <div className="card" style={{ ...cardStyle, marginBottom: 0, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 55%)', border: '1px solid var(--color-accent-border)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 4px' }}>Daily insights</p>
                  <p style={{ fontSize: 12.5, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.45 }}>Marina Bay conversion is 5% below usual at 5 PM — review recommendations and weekly recap.</p>
                </div>
                <button type="button" onClick={() => setInsightsOpen(true)} style={{ flexShrink: 0, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)', color: 'white', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'}>View insights</button>
              </div>

              <div>
                <KpiPanelGrouped refreshCount={refreshCount} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div style={cardStyle}>
                  <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Checklist &amp; Tasks</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button type="button" onClick={() => setTasksHistoryOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', cursor: 'pointer', transition: 'background 150ms ease, border-color 150ms ease' }} onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-primary-light)'; el.style.borderColor = 'var(--color-primary)'; }} onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-surface)'; el.style.borderColor = 'var(--color-accent-border)'; }}><ListChecks size={12} strokeWidth={2} /> All tasks</button>
                      {isAdmin && <button onClick={openAddTask} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'var(--color-primary-emphasis)', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 150ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'}><Plus size={12} strokeWidth={2.5} /> Add Task</button>}
                    </div>
                  </div>
                  <div>
                    {tasks.slice(0, DEFAULT_SHOW).map((task, idx) => {
                      const s = STATUS_CFG[task.status];
                      return (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)' }} onClick={() => toggleTask(task.id)} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--color-text-4)' : 'var(--color-text-1)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">{task.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--color-text-3)' }} className="truncate">{task.store}</span>
                              <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
                              <span style={{ fontSize: 11, color: task.status === 'overdue' ? 'var(--color-error)' : 'var(--color-text-4)', flexShrink: 0 }}>{formatTaskDueWindow(task)}{formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}</span>
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>{task.requiresPhoto ? (taskPhotos[task.id] ? <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} /> : <button onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}><Upload size={11} strokeWidth={1.5} /> Upload</button>) : null}</div>
                        </div>
                      );
                    })}
                    <div style={{ display: 'grid', gridTemplateRows: showAllTasks ? '1fr' : '0fr', transition: showAllTasks ? 'grid-template-rows 520ms cubic-bezier(0.34,1.2,0.64,1)' : 'grid-template-rows 300ms cubic-bezier(0.4,0,0.6,1)' }}>
                      <div style={{ overflow: 'hidden', minHeight: 0 }}>
                        <div style={{ transform: showAllTasks ? 'translateY(0)' : 'translateY(-10px)', transition: showAllTasks ? 'transform 560ms cubic-bezier(0.34,1.56,0.64,1)' : 'transform 200ms ease-in' }}>
                          {tasks.slice(DEFAULT_SHOW).map(task => {
                            const s = STATUS_CFG[task.status];
                            return (
                              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', cursor: 'pointer', transition: 'background 120ms', borderTop: '1px solid var(--color-border-subtle)' }} onClick={() => toggleTask(task.id)} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--color-text-4)' : 'var(--color-text-1)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">{task.title}</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--color-text-3)' }} className="truncate">{task.store}</span>
                                    <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
                                    <span style={{ fontSize: 11, color: task.status === 'overdue' ? 'var(--color-error)' : 'var(--color-text-4)', flexShrink: 0 }}>{formatTaskDueWindow(task)}{formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}</span>
                                  </div>
                                </div>
                                <div style={{ flexShrink: 0 }}>{task.requiresPhoto ? (taskPhotos[task.id] ? <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} /> : <button onClick={e => { e.stopPropagation(); setUploading(task.id); photoRef.current?.click(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 10px', height: 26, borderRadius: 6, background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}><Upload size={11} strokeWidth={1.5} /> Upload</button>) : null}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {tasks.length > DEFAULT_SHOW && (
                    <button onClick={() => setShowAll(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 0', borderTop: '1px solid var(--color-border-subtle)', fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 120ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      {showAllTasks ? <><ChevronUp size={12} strokeWidth={2} /> Show less</> : <><ChevronDown size={12} strokeWidth={2} /> Show {tasks.length - DEFAULT_SHOW} more</>}
                    </button>
                  )}
                </div>

                <div style={cardStyle}>
                  <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}><p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Quick Actions</p></div>
                  <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {QUICK_ACTIONS.map(action => (
                      <button key={action.id} onClick={() => { if (action.id === 'concern') setConcernOpen(true); else if (action.href) router.push(action.href); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '16px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'all 150ms ease', textAlign: 'left' }} onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-primary-light)'; el.style.borderColor = 'var(--color-accent-border)'; el.style.boxShadow = 'var(--shadow-card-hover)'; }} onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-surface-2)'; el.style.borderColor = 'var(--color-border)'; el.style.boxShadow = 'var(--shadow-card)'; }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>{action.icon}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-2)', lineHeight: 1.3 }}>{action.label}</p>
                          <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--color-text-4)' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={cardStyle}><WhatsNewCarousel /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ ...cardStyle, order: 2 }}>
                  <div style={{ padding: '14px 20px 0', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex' }}>
                      {(['activity', 'reports'] as const).map(tab => (
                        <button key={tab} onClick={() => setActTab(tab)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', color: activityTab === tab ? 'var(--color-primary)' : 'var(--color-text-3)', borderBottom: activityTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent', marginBottom: -1, transition: 'all 150ms ease' }}>{tab === 'activity' ? 'Recent Activity' : 'Recent Reports'}</button>
                      ))}
                    </div>
                    {activityTab === 'activity' ? (
                      <div style={{ position: 'relative', flexShrink: 0, paddingBottom: 10 }}>
                        <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: 10, top: 'calc(50% - 5px)', transform: 'translateY(-50%)', color: 'var(--color-text-4)', pointerEvents: 'none' }} />
                        <input type="text" placeholder="Search alerts..." value={activitySearch} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-2)', background: 'var(--color-surface-2)', outline: 'none', width: 148 }} onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'} onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'} />
                      </div>
                    ) : (
                      <button style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, paddingBottom: 10 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>View all <ChevronRight size={12} strokeWidth={2} /></button>
                    )}
                  </div>
                  {activityTab === 'activity' ? (
                    <div>
                      {filteredAlerts.map((alert, idx) => {
                        const cfg = ALERT_CFG[alert.type];
                        return <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}><div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>{alert.icon}</div><div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', lineHeight: 1.3 }}>{alert.message}</p><p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>{alert.store}</p></div><span style={{ fontSize: 11, color: 'var(--color-text-4)', flexShrink: 0 }}>{alert.ago}</span></div>;
                      })}
                      {filteredAlerts.length === 0 && <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--color-text-4)', fontSize: 13 }}>No results</div>}
                    </div>
                  ) : (
                    <div>
                      {RECENT_REPORTS.map((r, idx) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-3)', flexShrink: 0 }}><FileText size={14} strokeWidth={1.5} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{r.name}</p><div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.scope}</span><span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span><span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.date}</span></div></div>
                          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'var(--color-surface-2)', color: 'var(--color-text-3)', flexShrink: 0 }}>{r.tag}</span>
                          <button onClick={e => e.stopPropagation()} style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-4)' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-4)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}><Download size={13} strokeWidth={1.5} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ ...cardStyle, order: 1 }}>
                  <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Store Insights</p>
                    <button type="button" onClick={() => setInsightsOpen(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>Insights of the Day <ChevronRight size={12} strokeWidth={2} /></button>
                  </div>
                  <div>
                    {SIGNALS.map((s, idx) => {
                      const iconStyle = signalIconStyle(s.tone);
                      return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 120ms' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: iconStyle.background, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconStyle.color, flexShrink: 0, marginTop: 1, border: `1px solid color-mix(in srgb, ${iconStyle.color} 22%, transparent)` }}>{s.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.3, marginBottom: 2 }}>{s.title}</p><p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.5 }}>{s.summary}</p></div>
                      </div>
                    );})}
                  </div>
                </div>
              </div>
            </>
          )}

          {homeVariant === 1 && (
            <HomeBentoView
              tasks={tasks}
              taskPhotos={taskPhotos}
              showAllTasks={showAllTasks}
              setShowAll={setShowAll}
              defaultShow={DEFAULT_SHOW}
              isAdmin={isAdmin}
              onAddTask={openAddTask}
              onAllTasks={() => setTasksHistoryOpen(true)}
              onToggleTask={toggleTask}
              onUploadPhoto={taskId => { setUploading(taskId); photoRef.current?.click(); }}
              onInsightsOpen={() => setInsightsOpen(true)}
              onConcernOpen={() => setConcernOpen(true)}
            />
          )}

          {homeVariant === 2 && (
            <HomeRedesignView
              tasks={tasks}
              taskPhotos={taskPhotos}
              isAdmin={isAdmin}
              refreshCount={refreshCount}
              activitySearch={activitySearch}
              setActivitySearch={setSearch}
              filteredAlerts={filteredAlerts}
              onAddTask={openAddTask}
              onAllTasks={() => setTasksHistoryOpen(true)}
              onToggleTask={toggleTask}
              onUploadPhoto={taskId => { setUploading(taskId); photoRef.current?.click(); }}
              onInsightsOpen={() => setInsightsOpen(true)}
              onConcernOpen={() => setConcernOpen(true)}
            />
          )}

          {homeVariant === 3 && (
            <HomeHybridView
              tasks={tasks}
              isAdmin={isAdmin}
              refreshCount={refreshCount}
              activitySearch={activitySearch}
              setActivitySearch={setSearch}
              filteredAlerts={filteredAlerts}
              onAddTask={openAddTask}
              onOpenTaskPanel={() => setTaskTrackerOpen(true)}
              onInsightsOpen={() => setInsightsOpen(true)}
              onConcernOpen={() => setConcernOpen(true)}
            />
          )}


        </div>
      </div>

      {/* ── Add Task Modal ────────────────────────────────────────────────────── */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center theme-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal-panel" style={{ borderRadius: 20, width: '100%', maxWidth: 500, padding: '28px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 20 }}>Add New Task</h3>
            <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={fieldLabel}>Task Title</label><input type="text" placeholder="Describe the task..." value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--color-text-1)', background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box' }} autoFocus /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={fieldLabel}>Store</label><CustomSelect value={newTask.store} onChange={v => setNewTask({ ...newTask, store: v })} options={STORES.map(s => ({ value: s, label: s }))} /></div>
                <div>
                  <label style={fieldLabel}>Today</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, position: 'relative' }}>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        minHeight: 38,
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '9px 12px',
                        fontSize: 13,
                        fontWeight: 400,
                        color: 'var(--color-text-1)',
                        background: 'var(--color-surface)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      aria-label="Select date"
                      onClick={() => {
                        setDueCalendarMonth(isoToDate(newTask.dueDateISO || initialDueISO));
                        setDueCalendarOpen(v => !v);
                      }}
                    >
                      {formatDueLabelFromISO(newTask.dueDateISO)}
                    </button>
                    <button
                      type="button"
                      className="oly-calendar__nav"
                      style={{
                        width: 38,
                        height: 38,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      aria-label="Toggle date calendar"
                      onClick={() => {
                        setDueCalendarMonth(isoToDate(newTask.dueDateISO || initialDueISO));
                        setDueCalendarOpen(v => !v);
                      }}
                    >
                      <CalendarDays size={16} strokeWidth={2} />
                    </button>
                    {dueCalendarOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50 }}>
                        <DateCalendarPanel
                          className="oly-calendar--compact oly-calendar--add-task"
                          viewMonth={dueCalendarMonth}
                          onViewMonthChange={setDueCalendarMonth}
                          selected={isoToDate(newTask.dueDateISO || initialDueISO)}
                          onSelect={d => {
                            const nextISO = dateToIso(d);
                            setNewTask({ ...newTask, dueDateISO: nextISO, due: formatDueLabelFromISO(nextISO) });
                            setDueCalendarOpen(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div><label style={fieldLabel}>Assign To <span style={{ color: 'var(--color-text-4)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label><CustomSelect value={newTask.assignedTo || '__none__'} onChange={v => setNewTask({ ...newTask, assignedTo: v === '__none__' ? '' : v })} options={[{ value: '__none__', label: '— Unassigned —' }, ...MANAGERS.map(m => ({ value: m, label: m }))]} placeholder="— Unassigned —" /></div>
              <div><label style={fieldLabel}>Repeat</label><CustomSelect value={newTask.recurrence} onChange={v => setNewTask({ ...newTask, recurrence: v as Recurrence, recurrenceWeekdays: needsWeekdayPicker(v as Recurrence) ? newTask.recurrenceWeekdays : [], recurrenceMonthDays: v === 'monthly' ? newTask.recurrenceMonthDays : [] })} options={RECURRENCE_OPTIONS} /></div>
              {needsWeekdayPicker(newTask.recurrence) && (
                <div>
                  <label style={fieldLabel}>{newTask.recurrence === 'custom' ? 'Select custom days' : 'On these days'}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {WEEKDAYS.map(d => { const active = newTask.recurrenceWeekdays.includes(d.id); return <button key={d.id} type="button" onClick={() => toggleWeekday(d.id)} style={{ minWidth: 44, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'var(--color-primary-light)' : 'var(--color-surface)', color: active ? 'var(--color-primary)' : 'var(--color-text-3)', cursor: 'pointer' }}>{d.label}</button>; })}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-4)', margin: '8px 0 0' }}>Select one or more days. Tap again to deselect.</p>
                </div>
              )}
              {newTask.recurrence === 'monthly' && (
                <div>
                  <label style={fieldLabel}>On these dates (each month)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => { const active = newTask.recurrenceMonthDays.includes(day); return <button key={day} type="button" onClick={() => toggleMonthDay(day)} style={{ height: 32, borderRadius: 8, fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'var(--color-primary-light)' : 'var(--color-surface)', color: active ? 'var(--color-primary)' : 'var(--color-text-3)', cursor: 'pointer' }}>{day}</button>; })}
                  </div>
                </div>
              )}
              <div>
                <label style={fieldLabel}>Complete within</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
                  <input type="number" min={0} placeholder="e.g. 2" value={newTask.completeWithinValue} onChange={e => setNewTask({ ...newTask, completeWithinValue: e.target.value })} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, background: 'var(--color-surface)', boxSizing: 'border-box', outline: 'none' }} />
                  <CustomSelect value={newTask.completeWithinUnit} onChange={v => setNewTask({ ...newTask, completeWithinUnit: v as DurationUnit })} options={[{ value: 'minutes', label: 'Minutes' }, { value: 'hours', label: 'Hours' }]} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={newTask.requiresPhoto} onChange={e => setNewTask({ ...newTask, requiresPhoto: e.target.checked })} style={{ accentColor: 'var(--color-primary-emphasis)', width: 15, height: 15 }} /><span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Requires photo upload as proof</span></label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1.5px solid var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface-2)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', color: 'white', background: 'var(--color-primary-emphasis)', cursor: 'pointer' }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {concernOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => { setConcernOpen(false); setConcernSent(null); }}>
          <div className="modal-panel" style={{ borderRadius: 20, width: '100%', maxWidth: 480, padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 6 }}>Raise a concern</h3>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-3)', marginBottom: 16 }}>Quick tickets to support, or create a new concern.</p>
            {concernSent ? <p style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600 }}>Ticket sent: {concernSent}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRESAVED_CONCERNS.map(c => <button key={c.id} type="button" onClick={() => setConcernSent(c.label)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer' }}><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', margin: 0 }}>{c.label}</p><p style={{ fontSize: 11.5, color: 'var(--color-text-3)', margin: '4px 0 0' }}>{c.description}</p></button>)}
                <button type="button" onClick={() => { setConcernOpen(false); router.push('/dashboard/preferences/tickets?action=raise-concern'); }} style={{ marginTop: 8, height: 40, borderRadius: 10, border: 'none', background: 'var(--color-primary-emphasis)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create new concern</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tasksHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => setTasksHistoryOpen(false)}>
          <div className="modal-panel" style={{ borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>All tasks</h3><p style={{ fontSize: 12, color: 'var(--color-text-4)', margin: '4px 0 0' }}>Created, completed, and scheduled</p></div>
            <div style={{ overflowY: 'auto', padding: '8px 0' }}>
              {tasks.map(task => { const s = STATUS_CFG[task.status]; return <div key={task.id} style={{ padding: '12px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: 10, alignItems: 'flex-start' }}><span style={{ color: s.color, display: 'flex', marginTop: 2 }}>{s.icon}</span><div><p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{task.title}</p><p style={{ fontSize: 11.5, color: 'var(--color-text-3)', margin: '4px 0 0' }}>{task.store} · {formatTaskDueWindow(task)}{formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}</p></div></div>; })}
            </div>
          </div>
        </div>
      )}

      {taskTrackerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end theme-overlay" onClick={() => setTaskTrackerOpen(false)}>
          <aside
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--color-page-bg)',
              borderLeft: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-modal)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>Task tracker</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-3)' }}>{tasks.filter(t => t.status === 'done').length} of {tasks.length} completed</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin && (
                  <button type="button" onClick={openAddTask} style={{ height: 34, borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)', color: 'var(--color-on-primary)', padding: '0 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} strokeWidth={2.5} /> Add Task
                  </button>
                )}
                <button type="button" onClick={() => setTaskTrackerOpen(false)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-3)', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', padding: '10px 0' }}>
              {tasks.map(task => {
                const s = STATUS_CFG[task.status];
                return (
                  <div key={task.id} style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ color: s.color, display: 'flex', flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{task.title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--color-text-3)' }}>{task.store} · {formatTaskDueWindow(task)}{formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => toggleTask(task.id)} style={{ height: 28, borderRadius: 7, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', padding: '0 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                      {task.status === 'done' ? 'Reopen' : 'Done'}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (file && uploadingId !== null) {
          const url = URL.createObjectURL(file);
          setPhotos(p => ({ ...p, [uploadingId]: url }));
          setTasks(ts => ts.map(t => t.id === uploadingId ? { ...t, status: 'done' } : t));
        }
        setUploading(null);
        if (photoRef.current) photoRef.current.value = '';
      }} />
    </>
  );
}
