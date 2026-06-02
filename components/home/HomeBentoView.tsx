'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Plus, Upload, ChevronRight, ChevronDown, ChevronUp,
  ListChecks, Sparkles,
} from 'lucide-react';
import { KPI_CARDS, buildKpiSparkline, KpiSparklineArea } from '@/components/home/KpiCard';
import {
  SIGNALS, QUICK_ACTIONS, STATUS_CFG, RECENT_ALERTS, signalIconStyle,
  formatTaskRecurrence, formatTaskDueWindow,
  type Task,
} from '@/components/home/home-data';
import { WhatsNewCarousel } from '@/components/WhatsNewCarousel';
import { dashboardCardStyle } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import './home-bento.css';

const TILE_THEMES = [
  {
    bg: 'linear-gradient(145deg, #4338CA 0%, #655BD3 38%, #A78BFA 100%)',
    glow: 'rgba(101, 91, 211, 0.45)',
  },
  {
    bg: 'linear-gradient(145deg, #047857 0%, #0D9488 42%, #5EEAD4 100%)',
    glow: 'rgba(13, 148, 136, 0.4)',
  },
  {
    bg: 'linear-gradient(145deg, #C2410C 0%, #EA580C 40%, #FDBA74 100%)',
    glow: 'rgba(234, 88, 12, 0.4)',
  },
  {
    bg: 'linear-gradient(145deg, #0F172A 0%, #1E3A5F 45%, #475569 100%)',
    glow: 'rgba(30, 58, 95, 0.5)',
  },
];

/** Hourly conversion (% of daily norm) — 5 PM is the dip called out in copy */
const CONVERSION_BARS = [
  { label: '12PM', h: 88, rate: 14.2 },
  { label: '1PM', h: 94, rate: 15.1 },
  { label: '2PM', h: 91, rate: 14.6 },
  { label: '3PM', h: 84, rate: 13.5 },
  { label: '4PM', h: 78, rate: 12.8 },
  { label: '5PM', h: 52, rate: 11.1, isDip: true },
  { label: '6PM', h: 74, rate: 12.4 },
  { label: '7PM', h: 80, rate: 13.0 },
];
const DIP_BAR_INDEX = CONVERSION_BARS.findIndex(b => b.isDip);
const CONV_TRACK_HEIGHT = 140;

/** Urgent / operational signals for the live column (not duplicated in weekly recap) */
const LIVE_SIGNALS = SIGNALS.filter(s =>
  s.tone === 'error' || s.tone === 'warning' || s.tone === 'brand',
).slice(0, 3);

function conversionBarHeightPx(hPercent: number): number {
  return Math.max(40, Math.round((hPercent / 100) * CONV_TRACK_HEIGHT));
}

function quickActionIcon(icon: ReactNode) {
  if (isValidElement<{ size?: number; strokeWidth?: number }>(icon)) {
    return cloneElement(icon, { size: 16, strokeWidth: 1.5 });
  }
  return icon;
}

type BentoCardBase = typeof dashboardCardStyle & { borderRadius: number; overflow: 'hidden' };

function BentoQuickActionsCard({
  cardBase,
  onConcernOpen,
}: {
  cardBase: BentoCardBase;
  onConcernOpen: () => void;
}) {
  const router = useRouter();
  const { background: _bg, border: _border, ...cardShell } = cardBase;
  return (
    <div
      className="bento-card bento-card--hover bento-quick-actions-card"
      style={{
        ...cardShell,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div className="bento-card-head">
        <p className="bento-title" style={{ margin: 0 }}>Quick actions</p>
      </div>
      <div className="bento-card-body">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.id}
            type="button"
            className="bento-quick-action"
            onClick={() => {
              haptic('medium');
              if (action.id === 'concern') onConcernOpen();
              else if (action.href) router.push(action.href);
            }}
          >
            <div className="bento-quick-action__icon">{quickActionIcon(action.icon)}</div>
            <div className="bento-quick-action__label">
              {action.label}
              <ChevronRight size={12} strokeWidth={2} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  taskPhotos,
  isFirst,
  onToggle,
  onUpload,
}: {
  task: Task;
  taskPhotos: Record<number, string>;
  isFirst: boolean;
  onToggle: () => void;
  onUpload: () => void;
}) {
  const s = STATUS_CFG[task.status];
  return (
    <div
      role="button"
      tabIndex={0}
      className="bento-task-row"
      onClick={() => { haptic('toggle'); onToggle(); }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          haptic('toggle');
          onToggle();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 20px',
        cursor: 'pointer',
        borderTop: isFirst ? 'none' : '1px solid var(--color-border-subtle)',
      }}
    >
      <span style={{ color: s.color, flexShrink: 0, display: 'flex' }}>{s.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="truncate"
          style={{
            fontSize: 13,
            fontWeight: 500,
            margin: 0,
            color: task.status === 'done' ? 'var(--color-text-4)' : 'var(--color-text-1)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span className="truncate" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{task.store}</span>
          <span style={{ color: 'var(--color-border)', fontSize: 8 }}>●</span>
          <span style={{ fontSize: 11, color: task.status === 'overdue' ? 'var(--color-error)' : 'var(--color-text-4)', flexShrink: 0 }}>
            {formatTaskDueWindow(task)}{formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {task.requiresPhoto && (
          taskPhotos[task.id] ? (
            <img src={taskPhotos[task.id]} alt="proof" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: '2px solid #16A34A' }} />
          ) : (
            <button
              type="button"
              className="bento-btn-upload"
              onClick={e => { e.stopPropagation(); haptic('selection'); onUpload(); }}
            >
              <Upload size={11} strokeWidth={1.5} />
              Upload
            </button>
          )
        )}
      </div>
    </div>
  );
}

export interface HomeBentoViewProps {
  tasks: Task[];
  taskPhotos: Record<number, string>;
  showAllTasks: boolean;
  setShowAll: (fn: (v: boolean) => boolean) => void;
  defaultShow: number;
  isAdmin: boolean;
  onAddTask: () => void;
  onAllTasks: () => void;
  onToggleTask: (id: number) => void;
  onUploadPhoto: (taskId: number) => void;
  onInsightsOpen: () => void;
  onConcernOpen: () => void;
}

export function HomeBentoView({
  tasks,
  taskPhotos,
  showAllTasks,
  setShowAll,
  defaultShow,
  isAdmin,
  onAddTask,
  onAllTasks,
  onToggleTask,
  onUploadPhoto,
  onInsightsOpen,
  onConcernOpen,
}: HomeBentoViewProps) {
  const [activeConvBar, setActiveConvBar] = useState(DIP_BAR_INDEX >= 0 ? DIP_BAR_INDEX : 0);
  const cardBase = { ...dashboardCardStyle, borderRadius: 20, overflow: 'hidden' as const };
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const criticalAlert = RECENT_ALERTS.find(a => a.type === 'critical' || a.type === 'warning');

  return (
    <>
      <div className="home-bento" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="bento-stagger bento-hero-row" style={{ display: 'grid', gridTemplateColumns: '1.06fr 0.86fr 0.9fr', gap: 18, alignItems: 'stretch' }}>

          {/* Conversion dip — hourly bar chart */}
          <div
            className="bento-card bento-card--hover bento-conversion-card"
            style={{
              ...cardBase,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 280,
              height: '100%',
              background: 'var(--color-surface)',
            }}
          >
            <div className="bento-card-head">
              <p className="bento-title" style={{ margin: 0, minWidth: 0, flex: 1 }}>Conversion dipped at 5 PM</p>
              <button
                type="button"
                className="bento-btn-outline"
                style={{ flexShrink: 0, minHeight: 34, padding: '0 12px', fontSize: 12 }}
                onClick={() => { haptic('selection'); onInsightsOpen(); }}
              >
                See recommendations
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="bento-card-body">
              <div
                className="bento-conversion-chart"
                style={{ ['--bento-conv-track-h' as string]: `${CONV_TRACK_HEIGHT}px` }}
              >
                {CONVERSION_BARS.map((b, i) => {
                const isActive = activeConvBar === i;
                const isDip = !!b.isDip;
                const barPx = conversionBarHeightPx(b.h);
                return (
                  <button
                    key={b.label}
                    type="button"
                    className={`bento-bar-wrap bento-pressable ${isActive ? 'is-active' : ''} ${isDip ? 'bento-bar-wrap--dip' : ''}`}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setActiveConvBar(i);
                      haptic('selection');
                    }}
                    aria-label={`${b.label} conversion ${b.rate}%`}
                  >
                    <span
                      className="bento-bar-value"
                      style={{
                        color: isDip
                          ? isActive ? 'var(--color-error)' : 'var(--color-text-3)'
                          : isActive ? 'var(--color-primary)' : 'var(--color-text-3)',
                        fontWeight: isActive ? 700 : 600,
                      }}
                    >
                      {b.rate}%
                    </span>
                    <div className="bento-bar-track">
                      <div
                        className={`bento-bar${isDip ? ' bento-bar--dip' : ''}`}
                        style={{ height: barPx }}
                      />
                    </div>
                    <span
                      className="bento-bar-label"
                      style={{
                        color: isActive
                          ? isDip ? 'var(--color-error)' : 'var(--color-primary)'
                          : 'var(--color-text-4)',
                        fontWeight: isActive ? 700 : 600,
                      }}
                    >
                      {b.label}
                    </span>
                  </button>
                );
                })}
              </div>
            </div>
          </div>

          <BentoQuickActionsCard cardBase={cardBase} onConcernOpen={onConcernOpen} />

          {/* Weekly recap */}
          <div className="bento-card bento-recap-card" style={{ ...cardBase, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', minHeight: 280, height: '100%' }}>
            <div
              className="bento-on-gradient bento-recap__gradient"
              style={{
                background: 'linear-gradient(135deg, #4338CA 0%, #655BD3 40%, #8B5CF6 72%, #C4B5FD 100%)',
              }}
            >
              <div className="bento-card-head bento-card-head--on-gradient">
                <p className="bento-title-lg" style={{ margin: 0 }}>Weekly recap</p>
                <Sparkles size={18} strokeWidth={1.5} className="bento-sparkle" />
              </div>
              <div className="bento-recap__insight">
                <div className="bento-recap__insight-box">
                  <p className="bento-overline" style={{ margin: '0 0 6px' }}>Peak insight</p>
                  <p className="bento-metric-md" style={{ margin: 0 }}>1 PM peak</p>
                  <p className="bento-body-sm" style={{ margin: '8px 0 0' }}>
                    Staff 12:30–2:30 PM across top stores for best conversion lift.
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-recap__footer">
              <p className="bento-recap__summary">
                Network conversion <strong>12.4%</strong> · {SIGNALS.length} insights this week · 2 stores flagged
              </p>
              <button
                type="button"
                className="bento-btn-primary"
                style={{ height: 40, width: '100%', borderRadius: 10 }}
                onClick={() => { haptic('medium'); onInsightsOpen(); }}
              >
                View full insights
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="bento-stagger--kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {KPI_CARDS.map((card, i) => {
            const theme = TILE_THEMES[i % TILE_THEMES.length];
            const pos = card.change >= 0;
            const value =
              `${card.prefix ?? ''}${card.actual >= 1000 ? `${(card.actual / 1000).toFixed(1)}K` : card.actual}${card.suffix ?? ''}`;
            return (
              <div
                key={card.label}
                className="bento-kpi-tile"
                style={{
                  borderRadius: 18,
                  padding: '18px 18px 16px',
                  background: theme.bg,
                  boxShadow: `0 8px 24px ${theme.glow}`,
                  minHeight: 122,
                }}
              >
                <div className="bento-kpi-tile__shimmer" aria-hidden />
                <div className="bento-kpi-tile__content">
                  <p className="bento-kpi-tile__label">{card.label}</p>
                  <div className="bento-kpi-tile__row">
                    <div className="bento-kpi-tile__metrics">
                      <p className="bento-kpi-tile__value">{value}</p>
                      <span className="bento-kpi-tile__delta">
                        {pos ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
                        {Math.abs(card.change)}%
                      </span>
                    </div>
                    <div className="bento-kpi-tile__spark" aria-hidden>
                      <KpiSparklineArea
                        data={buildKpiSparkline(card.change, i)}
                        color="rgba(255, 255, 255, 0.95)"
                        gradId={`bento-kpi-spark-${i}`}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(overdueCount > 0 || criticalAlert) && (
          <div className="bento-ops-strip" role="status">
            {overdueCount > 0 && (
              <button type="button" className="bento-ops-strip__chip bento-ops-strip__chip--warn" onClick={() => { haptic('selection'); onAllTasks(); }}>
                {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}
              </button>
            )}
            {pendingCount > 0 && overdueCount === 0 && (
              <button type="button" className="bento-ops-strip__chip" onClick={() => { haptic('selection'); onAllTasks(); }}>
                {pendingCount} task{pendingCount !== 1 ? 's' : ''} due today
              </button>
            )}
            {criticalAlert && (
              <span className="bento-ops-strip__text">
                {criticalAlert.message} · {criticalAlert.store}
              </span>
            )}
          </div>
        )}

        {/* Tasks + What's New + Live signals */}
        <div className="bento-triple-row">

          <div className="bento-card bento-triple-row__card" style={{ ...cardBase, background: 'var(--color-surface)' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <p className="bento-title" style={{ margin: 0 }}>Checklist &amp; tasks</p>
                {overdueCount > 0 && (
                  <span className="bento-task-badge">{overdueCount} overdue</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="button" className="bento-btn-outline" onClick={() => { haptic('selection'); onAllTasks(); }}>
                  <ListChecks size={13} strokeWidth={2} />
                  All tasks
                </button>
                {isAdmin && (
                  <button type="button" className="bento-btn-primary" onClick={() => { haptic('medium'); onAddTask(); }}>
                    <Plus size={13} strokeWidth={2.5} />
                    Add Task
                  </button>
                )}
              </div>
            </div>
            <div>
              {tasks.slice(0, defaultShow).map((task, idx) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  taskPhotos={taskPhotos}
                  isFirst={idx === 0}
                  onToggle={() => onToggleTask(task.id)}
                  onUpload={() => onUploadPhoto(task.id)}
                />
              ))}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: showAllTasks ? '1fr' : '0fr',
                  transition: showAllTasks
                    ? 'grid-template-rows 520ms cubic-bezier(0.34,1.2,0.64,1)'
                    : 'grid-template-rows 300ms cubic-bezier(0.4,0,0.6,1)',
                }}
              >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  <div
                    style={{
                      transform: showAllTasks ? 'translateY(0)' : 'translateY(-10px)',
                      transition: showAllTasks
                        ? 'transform 560ms cubic-bezier(0.34,1.56,0.64,1)'
                        : 'transform 200ms ease-in',
                    }}
                  >
                    {tasks.slice(defaultShow).map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        taskPhotos={taskPhotos}
                        isFirst={false}
                        onToggle={() => onToggleTask(task.id)}
                        onUpload={() => onUploadPhoto(task.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {tasks.length > defaultShow && (
              <button
                type="button"
                className="bento-tasks-expand"
                onClick={() => { haptic('selection'); setShowAll(v => !v); }}
              >
                {showAllTasks ? (
                  <><ChevronUp size={12} strokeWidth={2} /> Show less</>
                ) : (
                  <><ChevronDown size={12} strokeWidth={2} /> Show {tasks.length - defaultShow} more</>
                )}
              </button>
            )}
          </div>

          <div className="bento-card bento-triple-row__card bento-whats-new-card" style={{ ...cardBase, background: 'var(--color-surface)', padding: 0 }}>
            <WhatsNewCarousel />
          </div>

          <div className="bento-card bento-triple-row__card" style={{ ...cardBase, background: 'var(--color-surface)' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="bento-title" style={{ margin: 0 }}>Live signals</p>
              <button
                type="button"
                className="bento-btn-outline"
                style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}
                onClick={() => { haptic('selection'); onInsightsOpen(); }}
              >
                All signals
                <ChevronRight size={12} strokeWidth={2} />
              </button>
            </div>
            {LIVE_SIGNALS.map((s, idx) => {
              const accent = signalIconStyle(s.tone);
              return (
              <button
                key={s.id}
                type="button"
                className="bento-highlight-item"
                onClick={() => { haptic('selection'); onInsightsOpen(); }}
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  className="bento-signal-icon"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: accent.background,
                    color: accent.color,
                    border: `1px solid color-mix(in srgb, ${accent.color} 22%, transparent)`,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.45 }}>{s.summary}</p>
                </div>
              </button>
            );})}
          </div>
        </div>
      </div>
    </>
  );
}
