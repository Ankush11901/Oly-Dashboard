'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, Search, Users, Zap, Clock, Video, FileText, Download } from 'lucide-react';
import { KpiPanelSpaced } from '@/components/home/KpiCard';
import { WhatsNewCarousel } from '@/components/WhatsNewCarousel';
import { HybridInsightsStrip, type InsightStripSlide } from '@/components/home/HybridInsightsStrip';
import { HybridQuickActionsModal } from '@/components/home/HybridQuickActionsModal';
import {
  QUICK_ACTION_POOL, ALERT_CFG, RECENT_REPORTS,
  HYBRID_QUICK_ACTIONS_STORAGE_KEY, DEFAULT_HYBRID_QUICK_ACTION_IDS,
  HYBRID_QUICK_ACTION_SLOT_COUNT,
  STATUS_CFG, formatTaskDueWindow, formatTaskRecurrence, getQuickActionIconTone,
  type Task, type RecentAlert, type QuickActionDef,
} from '@/components/home/home-data';

const CHECKLIST_PREVIEW_COUNT = 2;
import { haptic } from '@/lib/haptics';
import './home-hybrid.css';

const STRIP_SLIDES: InsightStripSlide[] = [
  {
    tag: 'Footfall highlight',
    title: 'Marina Bay Sands hit highest footfall this month.',
    description: 'Recorded 15,234 visitors today. 6.4% above last month’s peak.',
    badge: '↑ 8.2% vs last week',
    badgeTone: 'brand',
    time: 'Today · All stores',
    icon: <Users size={18} strokeWidth={1.75} />,
  },
  {
    tag: 'Conversion rate',
    title: 'Network conversion at 12.4% with steady hour-on-hour recovery.',
    description: 'Marina Bay leads at 16.2%. VivoCity follows at 15.3%.',
    badge: '↑ +1.8 pts today',
    badgeTone: 'success',
    time: 'Network average',
    icon: <Zap size={18} strokeWidth={1.75} />,
  },
  {
    tag: 'Staffing advisory',
    title: 'Peak window remained 12 PM–3 PM across top traffic stores.',
    description: 'Recommend proactive staff rotation for tomorrow’s lunch peak.',
    badge: '12 PM – 3 PM window',
    badgeTone: 'warning',
    time: 'All 8 stores',
    icon: <Clock size={18} strokeWidth={1.75} />,
  },
  {
    tag: 'Camera alert',
    title: 'One entrance camera remains offline at Bugis Junction.',
    description: 'Zone C confidence dropped 18%. Prompt maintenance suggested.',
    badge: 'Action required',
    badgeTone: 'error',
    time: '42 min ago',
    icon: <Video size={18} strokeWidth={1.75} />,
  },
];

function loadQuickActionIds(): string[] {
  const defaults = DEFAULT_HYBRID_QUICK_ACTION_IDS;
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(HYBRID_QUICK_ACTIONS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaults;
    const ids = parsed.slice(0, HYBRID_QUICK_ACTION_SLOT_COUNT);
    if (ids.length >= HYBRID_QUICK_ACTION_SLOT_COUNT) return ids;
    const padded = [...ids];
    for (const id of defaults) {
      if (padded.length >= HYBRID_QUICK_ACTION_SLOT_COUNT) break;
      if (!padded.includes(id)) padded.push(id);
    }
    return padded.slice(0, HYBRID_QUICK_ACTION_SLOT_COUNT);
  } catch {
    return defaults;
  }
}

export interface HomeHybridViewProps {
  tasks: Task[];
  isAdmin: boolean;
  refreshCount: number;
  activitySearch: string;
  setActivitySearch: (v: string) => void;
  filteredAlerts: RecentAlert[];
  onAddTask: () => void;
  onOpenTaskPanel: () => void;
  onInsightsOpen: () => void;
  onConcernOpen: () => void;
}

export function HomeHybridView({
  tasks,
  isAdmin,
  refreshCount,
  activitySearch,
  setActivitySearch,
  filteredAlerts,
  onAddTask,
  onOpenTaskPanel,
  onInsightsOpen,
  onConcernOpen,
}: HomeHybridViewProps) {
  const router = useRouter();
  const [quickActionIds, setQuickActionIds] = useState<string[]>(DEFAULT_HYBRID_QUICK_ACTION_IDS);
  const [qaModalOpen, setQaModalOpen] = useState(false);

  useEffect(() => {
    setQuickActionIds(loadQuickActionIds());
  }, []);

  const saveQuickActions = useCallback((ids: string[]) => {
    setQuickActionIds(ids);
    try {
      localStorage.setItem(HYBRID_QUICK_ACTIONS_STORAGE_KEY, JSON.stringify(ids));
    } catch { /* ignore */ }
  }, []);

  const quickActions = quickActionIds
    .map(id => QUICK_ACTION_POOL.find(a => a.id === id))
    .filter((a): a is QuickActionDef => Boolean(a));

  const runQuickAction = (action: QuickActionDef) => {
    haptic('medium');
    if (action.id === 'concern') onConcernOpen();
    else if (action.id === 'add-task') onAddTask();
    else if (action.id === 'task-tracker') onOpenTaskPanel();
    else if (action.id === 'insights') onInsightsOpen();
    else if (action.href) router.push(action.href);
  };

  const done = tasks.filter(t => t.status === 'done').length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const previewTasks = tasks.slice(0, CHECKLIST_PREVIEW_COUNT);

  return (
    <div className="hybrid-home">
      <HybridInsightsStrip slides={STRIP_SLIDES} />

      <div className="hybrid-kpis">
        <KpiPanelSpaced refreshCount={refreshCount} />
      </div>

      <section className="hybrid-main-row">
        <article className="hybrid-card hybrid-card--checklist">
          <header className="hybrid-card__head">
            <h3>Checklist progress</h3>
            <div className="hybrid-card__head-actions">
              <button type="button" className="hybrid-link-btn" onClick={() => { haptic('selection'); onOpenTaskPanel(); }}>
                See all tasks
              </button>
            </div>
          </header>
          <div className="hybrid-progress">
            <p className="hybrid-progress__nums">
              <strong>{done}</strong>
              <span>of {tasks.length} tasks completed</span>
            </p>
            <div className="hybrid-progress__track" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
              <span className="hybrid-progress__fill" style={{ width: `${completion}%` }} />
            </div>
            <p className="hybrid-progress__cap">{completion}% complete this week</p>
            <div className="hybrid-progress__tasks-wrap">
              <p className="hybrid-progress__tasks-label">Tasks</p>
              {previewTasks.length === 0 ? (
                <p className="hybrid-muted">No tasks yet.</p>
              ) : (
                <ul className="hybrid-progress__tasks">
                  {previewTasks.map(task => {
                    const st = STATUS_CFG[task.status];
                    const recurrence = formatTaskRecurrence(task);
                    return (
                      <li key={task.id} className="hybrid-progress__task">
                        <span className="hybrid-progress__task-icon" style={{ color: st.color }} aria-hidden>
                          {st.icon}
                        </span>
                        <span className="hybrid-progress__task-body">
                          <strong className={task.status === 'done' ? 'is-done' : undefined}>{task.title}</strong>
                          <small>
                            {formatTaskDueWindow(task)}
                            {recurrence ? ` · ${recurrence}` : ''}
                          </small>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </article>

        <article className="hybrid-card hybrid-card--qa">
          <header className="hybrid-card__head">
            <h3>Quick actions</h3>
            <div className="hybrid-card__head-actions">
              {isAdmin ? (
                <button
                  type="button"
                  className="hybrid-create-btn"
                  onClick={() => { haptic('medium'); setQaModalOpen(true); }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Create
                </button>
              ) : null}
            </div>
          </header>
          <div className="hybrid-qa-classic">
            {quickActions.map((action, index) => {
              const iconTone = getQuickActionIconTone(action.id, index);
              return (
                <button
                  key={action.id}
                  type="button"
                  className="hybrid-qa-classic__item"
                  onClick={() => runQuickAction(action)}
                >
                  <span
                    className="hybrid-qa-classic__icon"
                    style={{ color: iconTone.color, background: iconTone.background }}
                  >
                    {action.icon}
                  </span>
                  <span className="hybrid-qa-classic__label">{action.label}</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="hybrid-card hybrid-card--whatsnew">
          <WhatsNewCarousel />
        </article>
      </section>

      <section className="hybrid-bottom-row">
        <article className="hybrid-card hybrid-card--activity">
          <header className="hybrid-card__head">
            <h3>Recent activity</h3>
            <div className="hybrid-card__head-actions">
              <div className="hybrid-search-wrap">
                <Search size={14} strokeWidth={1.75} className="hybrid-search__icon" aria-hidden />
                <input
                  type="search"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  placeholder="Search alerts..."
                  className="hybrid-search"
                  aria-label="Search recent activity"
                />
              </div>
            </div>
          </header>
          <div className="hybrid-rows">
            {filteredAlerts.length === 0 ? (
              <p className="hybrid-empty">No alerts match your search.</p>
            ) : (
              filteredAlerts.slice(0, 4).map(alert => {
                const cfg = ALERT_CFG[alert.type];
                return (
                  <div key={alert.id} className="hybrid-row">
                    <span className="hybrid-row__icon" style={{ background: cfg.bg, color: cfg.color }}>{alert.icon}</span>
                    <span className="hybrid-row__copy">
                      <strong>{alert.message}</strong>
                      <small>{alert.store}</small>
                    </span>
                    <small className="hybrid-row__meta">{alert.ago}</small>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="hybrid-card hybrid-card--reports">
          <header className="hybrid-card__head">
            <h3>Recent reports</h3>
            <div className="hybrid-card__head-actions">
              <button type="button" className="hybrid-link-btn" onClick={() => router.push('/dashboard/reports')}>
                View all <ChevronRight size={12} />
              </button>
            </div>
          </header>
          <div className="hybrid-reports">
            {RECENT_REPORTS.map((r, idx) => (
              <div key={r.id} className={`hybrid-reports__row${idx === 0 ? ' hybrid-reports__row--first' : ''}`}>
                <span className="hybrid-reports__icon" aria-hidden>
                  <FileText size={14} strokeWidth={1.5} />
                </span>
                <div className="hybrid-reports__copy">
                  <strong>{r.name}</strong>
                  <span className="hybrid-reports__meta">
                    <span>{r.scope}</span>
                    <span className="hybrid-reports__dot" aria-hidden>●</span>
                    <span>{r.date}</span>
                  </span>
                </div>
                <span className="hybrid-reports__tag">{r.tag}</span>
                <button
                  type="button"
                  className="hybrid-reports__download"
                  aria-label={`Download ${r.name}`}
                  onClick={e => e.stopPropagation()}
                >
                  <Download size={13} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <HybridQuickActionsModal
        open={qaModalOpen}
        selectedIds={quickActionIds}
        onClose={() => setQaModalOpen(false)}
        onSave={saveQuickActions}
      />
    </div>
  );
}
