'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import {
  ArrowDownRight, ArrowUpRight, ChevronRight, Plus, Store,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { KPI_CARDS } from '@/components/home/KpiCard';
import { haptic } from '@/lib/haptics';
import {
  SIGNALS, QUICK_ACTIONS, STATUS_CFG, RECENT_ALERTS, ALERT_CFG, signalIconStyle,
  formatTaskDueWindow,
  type Task,
} from '@/components/home/home-data';
import './home-redesign.css';

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
const DIP_IDX = CONVERSION_BARS.findIndex(b => b.isDip);
const CONV_CHART_H = 96;

function convBarHeight(h: number) {
  return Math.max(14, Math.round((h / 100) * CONV_CHART_H));
}

function formatKpi(card: (typeof KPI_CARDS)[0]) {
  const d = card.decimals ?? 0;
  const v = d > 0 ? card.actual.toFixed(d) : card.actual.toLocaleString();
  return `${card.prefix ?? ''}${v}${card.suffix ?? ''}`;
}

function Gauge({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const dash = (pct / 100) * 126;
  return (
    <div className="acru-gauge">
      <svg viewBox="0 0 128 72" aria-hidden>
        <path d="M 14 62 A 50 50 0 0 1 114 62" fill="none" stroke="#E8ECF2" strokeWidth="11" strokeLinecap="round" />
        <path
          d="M 14 62 A 50 50 0 0 1 114 62"
          fill="none"
          stroke="url(#acruGaugeGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${dash} 126`}
        />
        <defs>
          <linearGradient id="acruGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <p className="acru-gauge__value">{value}%</p>
      <p className="acru-gauge__sub">{pct}% of {target}% target</p>
    </div>
  );
}

function quickIcon(icon: ReactNode) {
  if (isValidElement<{ size?: number; strokeWidth?: number }>(icon)) {
    return cloneElement(icon, { size: 18, strokeWidth: 2 });
  }
  return icon;
}

export interface HomeRedesignViewProps {
  tasks: Task[];
  taskPhotos: Record<number, string>;
  isAdmin: boolean;
  refreshCount: number;
  activitySearch: string;
  setActivitySearch: (v: string) => void;
  filteredAlerts: typeof RECENT_ALERTS;
  onAddTask: () => void;
  onAllTasks: () => void;
  onToggleTask: (id: number) => void;
  onUploadPhoto: (taskId: number) => void;
  onInsightsOpen: () => void;
  onConcernOpen: () => void;
}

export function HomeRedesignView({
  tasks,
  isAdmin,
  refreshCount,
  filteredAlerts,
  onAddTask,
  onAllTasks,
  onToggleTask,
  onInsightsOpen,
  onConcernOpen,
}: HomeRedesignViewProps) {
  const router = useRouter();
  const [activeBar, setActiveBar] = useState(DIP_IDX >= 0 ? DIP_IDX : 0);

  const footfall = KPI_CARDS[0];
  const summaryRows = [...KPI_CARDS.slice(1), footfall];
  const conv = KPI_CARDS[2];
  const storeSignals = SIGNALS.slice(0, 4);
  const completedTasks = tasks.filter(t => t.status === 'done');
  const done = completedTasks.length;
  const taskPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const trackerTasks = tasks.slice(0, 4);
  const alerts = filteredAlerts.slice(0, 5);
  const activeConv = CONVERSION_BARS[activeBar];
  const footfallUp = footfall.change >= 0;

  return (
    <div className="acru-home">
      <div className="acru-home__grid">
        {/* Row 1 — conversion chart + footfall KPI */}
        <section className="acru-card acru-card--conv">
          <header className="acru-card__head">
            <div>
              <h2 className="acru-card__title">Conversion overview</h2>
              <p className="acru-card__sub">Hourly rate · Marina Bay Sands · today</p>
            </div>
            <button type="button" className="acru-cta-btn" onClick={() => { haptic('medium'); onInsightsOpen(); }}>
              Insights
            </button>
          </header>
          <p className="acru-conv-lead">
            Conversion dipped at 5 PM — 5% below usual. Tap a bar for the hourly rate.
          </p>
          <div className="acru-conv-meta">
            <span className="acru-card__sub">Selected hour</span>
            <span className={`acru-rate-pill${activeConv?.isDip ? ' is-dip' : ''}`}>
              {activeConv?.isDip ? <ArrowDownRight size={12} /> : null}
              {activeConv?.rate}%
              {activeConv?.isDip ? ' · below target' : ''}
            </span>
          </div>
          <div className="acru-conv-chart">
            {CONVERSION_BARS.map((b, i) => {
              const isActive = activeBar === i;
              const isDip = !!b.isDip;
              return (
                <button
                  key={b.label}
                  type="button"
                  className={`acru-conv-col${isActive ? ' is-active' : ''}${isDip ? ' is-dip' : ''}`}
                  onClick={() => { setActiveBar(i); haptic('selection'); }}
                  aria-label={`${b.label} ${b.rate}% conversion`}
                >
                  <span className="acru-conv-col__val">{b.rate}%</span>
                  <span className="acru-conv-col__bar" style={{ height: convBarHeight(b.h) }} />
                  <span className="acru-conv-col__lbl">{b.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="acru-card acru-card--footfall">
          <h2 className="acru-card__title">Footfall today</h2>
          <p className="acru-card__sub">All stores · network total</p>
          <p className="acru-footfall__val">
            <AnimatedNumber key={refreshCount} value={footfall.actual} className="acru-footfall__num" />
          </p>
          <span className={`acru-footfall__chg ${footfallUp ? 'up' : 'down'}`}>
            {footfallUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {footfallUp ? '+' : ''}{footfall.change}% vs yesterday
          </span>
          <ul className="acru-footfall__facts">
            <li><span>Peak hour</span><strong>1 PM</strong></li>
            <li><span>Top store</span><strong>Marina Bay Sands</strong></li>
            <li><span>Passerby</span><strong>{formatKpi(summaryRows[0])}</strong></li>
          </ul>
        </section>

        {/* Row 2 — three equal tiles */}
        <section className="acru-card acru-card--summary">
          <h2 className="acru-card__title">Store summary</h2>
          <ul className="acru-summary">
            {summaryRows.map(card => {
              const up = card.change >= 0;
              return (
                <li key={card.label}>
                  <span className="acru-summary__name">{card.label}</span>
                  <span className="acru-summary__val">{formatKpi(card)}</span>
                  <span className={`acru-summary__chg ${up ? 'up' : 'down'}`}>
                    {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(card.change)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="acru-card acru-card--limit">
          <div className="acru-card__head">
            <h2 className="acru-card__title">Checklist progress</h2>
            <button type="button" className="acru-text-btn" onClick={onAllTasks}>See all</button>
          </div>
          <p className="acru-limit__nums">
            <strong>{done}</strong> of {tasks.length} tasks
          </p>
          <div className="acru-limit__track">
            <div className="acru-limit__fill" style={{ width: `${taskPct}%` }} />
          </div>
          <p className="acru-limit__cap">{taskPct}% complete this week</p>
          <div className="acru-limit__done-wrap">
            <p className="acru-limit__done-label">Completed</p>
            {completedTasks.length === 0 ? (
              <p className="acru-limit__done-empty">No tasks completed yet</p>
            ) : (
              <ul className="acru-limit__done">
                {completedTasks.map(task => (
                  <li key={task.id}>
                    <span className="acru-limit__done-check" aria-hidden>
                      {STATUS_CFG.done.icon}
                    </span>
                    <span className="acru-limit__done-title">{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="acru-card acru-card--gauge">
          <h2 className="acru-card__title">Conversion health</h2>
          <Gauge value={conv.actual} target={conv.expected} />
        </section>

        {/* Row 3 — task tracker + store signals (matched height) */}
        <section className="acru-card acru-card--goals">
          <div className="acru-card__head">
            <h2 className="acru-card__title">Task tracker</h2>
            <div className="acru-card__actions">
              <button type="button" className="acru-btn-outline" onClick={() => { haptic('selection'); onAllTasks(); }}>
                See all
              </button>
              {isAdmin && (
                <button type="button" className="acru-btn-solid" onClick={() => { haptic('medium'); onAddTask(); }}>
                  <Plus size={14} strokeWidth={2.5} /> New
                </button>
              )}
            </div>
          </div>
          <ul className="acru-goals acru-goals--stack">
            {trackerTasks.map(task => {
              const prog = task.status === 'done' ? 100 : task.status === 'overdue' ? 52 : 30;
              const st = STATUS_CFG[task.status];
              return (
                <li key={task.id}>
                  <button type="button" className="acru-goal__row" onClick={() => onToggleTask(task.id)}>
                    <span className="acru-goal__emoji" style={{ background: `${st.color}18`, color: st.color }}>
                      {st.icon}
                    </span>
                    <span className="acru-goal__info">
                      <strong>{task.title}</strong>
                      <span>{formatTaskDueWindow(task)}</span>
                    </span>
                    <span className="acru-goal__amt">{prog}%</span>
                  </button>
                  <div className="acru-goal__bar">
                    <span style={{ width: `${prog}%`, background: st.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="acru-card acru-card--signals">
          <header className="acru-card__head">
            <h2 className="acru-card__title">Store signals</h2>
            <div className="acru-card__actions">
              <button type="button" className="acru-btn-outline" onClick={() => { haptic('selection'); onInsightsOpen(); }}>
                See all
              </button>
            </div>
          </header>
          <ul className="acru-signals">
            {storeSignals.map(s => {
              const st = signalIconStyle(s.tone);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className="acru-signals__btn"
                    onClick={() => { haptic('selection'); onInsightsOpen(); }}
                  >
                    <span className="acru-signals__icon" style={{ background: st.background, color: st.color }}>
                      {s.icon}
                    </span>
                    <span className="acru-signals__copy">
                      <strong>{s.title}</strong>
                      <span>{s.summary}</span>
                    </span>
                    <ChevronRight size={14} className="acru-signals__chev" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className="acru-home__rail">
        <section className="acru-card acru-card--quick">
          <h2 className="acru-card__title">Quick actions</h2>
          <div className="acru-quick-grid">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                type="button"
                className="acru-quick-row"
                onClick={() => {
                  haptic('medium');
                  if (action.id === 'concern') onConcernOpen();
                  else if (action.href) router.push(action.href);
                }}
              >
                <span className="acru-quick-row__icon">{quickIcon(action.icon)}</span>
                <span className="acru-quick-row__label">{action.label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="acru-card acru-card--wallet">
          <h2 className="acru-card__title">Primary store</h2>
          <div className="acru-wallet">
            <div className="acru-wallet__top">
              <Store size={20} strokeWidth={1.5} />
              <span>Lead location</span>
            </div>
            <p className="acru-wallet__name">Marina Bay Sands</p>
            <p className="acru-wallet__meta">Watch 5 PM conversion · network lead</p>
          </div>
        </section>

        <section className="acru-card acru-card--history">
          <h2 className="acru-card__title">Recent activity</h2>
          <ul className="acru-history">
            {alerts.map(a => {
              const c = ALERT_CFG[a.type];
              const neg = a.type === 'critical' || a.type === 'warning';
              return (
                <li key={a.id} className="acru-history__row">
                  <span className="acru-history__logo" style={{ background: c.bg, color: c.color }}>{a.icon}</span>
                  <span className="acru-history__mid">
                    <strong>{a.message}</strong>
                    <span>{a.store}</span>
                  </span>
                  <span className="acru-history__meta">
                    <em className={neg ? 'bad' : 'ok'}>{neg ? 'Alert' : 'Logged'}</em>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    </div>
  );
}
