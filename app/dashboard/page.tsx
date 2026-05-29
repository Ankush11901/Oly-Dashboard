'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, ArrowDownRight,
  AlertCircle,
  CheckCircle2, Circle, Upload, Plus, ChevronDown, ChevronUp,
  UserPlus, LayoutGrid,
  Video,
  FileText, Download, ChevronRight,
  Search, Sparkles,
} from 'lucide-react';
import { useDashboardContext } from '@/components/DashboardProvider';
import { WhatsNewCarousel } from '@/components/WhatsNewCarousel';
import { dashboardCardStyle } from '@/lib/theme';
import { KpiCard, KPI_CARDS, KpiPanelGrouped } from '@/components/home/KpiCard';
import {
  SIGNALS, INITIAL_TASKS, STATUS_CFG, QUICK_ACTIONS,
  RECENT_ALERTS, ALERT_CFG, RECENT_REPORTS, SUMMARY_CHIPS,
  type Task,
  type TaskStatus,
} from '@/components/home/home-data';

const STORES   = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City', 'All Stores'];
const MANAGERS = ['Sarah Tan', 'John Lim', 'Priya S.', 'Ali Hassan', 'Wei Chen'];

const cardStyle = dashboardCardStyle;

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
  const [kpiStyle,       setKpiStyle] = useState<0 | 1 | 2 | 3>(0);
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
                    className="summary-chip insights-chip"
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 9,
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
            {([0, 1, 2, 3] as const).map(s => (
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
            <KpiPanelGrouped refreshCount={refreshCount} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal-panel" style={{ borderRadius: 20, width: '100%', maxWidth: 440, padding: '28px' }} onClick={e => e.stopPropagation()}>
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
