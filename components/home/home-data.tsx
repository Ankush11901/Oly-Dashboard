'use client';
import {
  TrendingDown, AlertCircle, TrendingUp, Activity, Video,
  CheckCircle2, Circle, WifiOff, Flame, FileText, Download,
  UserPlus, LayoutGrid, Users, BarChart2, Clock,
} from 'lucide-react';

export type SignalTone = 'warning' | 'error' | 'success' | 'info' | 'brand';

export function signalIconStyle(tone: SignalTone): { background: string; color: string } {
  switch (tone) {
    case 'warning':
      return { background: 'var(--color-warning-light)', color: 'var(--color-warning)' };
    case 'error':
      return { background: 'var(--color-error-light)', color: 'var(--color-error)' };
    case 'success':
      return { background: 'var(--color-success-light)', color: 'var(--color-success)' };
    case 'info':
      return { background: 'var(--color-info-light)', color: 'var(--color-info)' };
    case 'brand':
      return { background: 'var(--color-primary-light)', color: 'var(--color-primary)' };
  }
}

export const SIGNALS = [
  { id: 1, title: 'Below peak hours', summary: 'Footfall 15% below projected peak. Promo push recommended 2–4 PM.', icon: <TrendingDown size={14} strokeWidth={1.5} />, tone: 'warning' as const },
  { id: 2, title: 'Queue alert — VivoCity', summary: 'Queue depth exceeded threshold for 40 min. Staff reallocation suggested.', icon: <AlertCircle size={14} strokeWidth={1.5} />, tone: 'error' as const },
  { id: 3, title: 'Conversion trending up', summary: 'Marina Bay Sands leads at 16.2% vs 12.4% avg — best performer this week.', icon: <TrendingUp size={14} strokeWidth={1.5} />, tone: 'success' as const },
  { id: 4, title: 'New tenant impact', summary: 'Jurong Point saw +22% footfall increase after anchor tenant opened last week.', icon: <Activity size={14} strokeWidth={1.5} />, tone: 'info' as const },
  { id: 5, title: 'Camera coverage gap', summary: 'Zone C at Bugis Junction has 18% lower detection confidence than baseline.', icon: <Video size={14} strokeWidth={1.5} />, tone: 'brand' as const },
];

export type TaskStatus = 'done' | 'pending' | 'overdue';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type DurationUnit = 'minutes' | 'hours';

export const WEEKDAYS = [
  { id: 'mon', label: 'Mon', full: 'Monday' },
  { id: 'tue', label: 'Tue', full: 'Tuesday' },
  { id: 'wed', label: 'Wed', full: 'Wednesday' },
  { id: 'thu', label: 'Thu', full: 'Thursday' },
  { id: 'fri', label: 'Fri', full: 'Friday' },
  { id: 'sat', label: 'Sat', full: 'Saturday' },
  { id: 'sun', label: 'Sun', full: 'Sunday' },
] as const;

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Every month' },
  { value: 'custom', label: 'Custom days' },
];

export interface TaskComment {
  author: string;
  text: string;
  at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskActivityType = 'comment' | 'status' | 'update';

export interface TaskActivity {
  type: TaskActivityType;
  author: string;
  text: string;
  at: string;
}

export interface Task {
  id: number;
  title: string;
  store: string;
  due: string;
  dueBy?: string;
  status: TaskStatus;
  requiresPhoto: boolean;
  automated: boolean;
  assignedTo?: string;
  description?: string;
  createdAt?: string;
  completedAt?: string;
  completionNotes?: string;
  notes?: string;
  priority?: TaskPriority;
  requiredActions?: string[];
  comments?: TaskComment[];
  activity?: TaskActivity[];
  /** Display-only overdue duration for overdue tasks */
  overdueBy?: string;
  recurrence?: Recurrence;
  recurrenceWeekdays?: string[];
  recurrenceMonthDays?: number[];
  completeWithinValue?: number;
  completeWithinUnit?: DurationUnit;
}

export const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'var(--color-text-3)', bg: 'var(--color-surface-3)' },
  medium: { label: 'Medium', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  high: { label: 'High', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

export function getTaskPriority(task: Task): TaskPriority {
  if (task.priority) return task.priority;
  if (task.status === 'overdue') return 'high';
  if (task.automated) return 'low';
  return 'medium';
}

export function getTaskOverdueSummary(task: Task): string {
  if (task.status !== 'overdue') return '';
  if (task.overdueBy) return `${task.overdueBy} overdue`;
  return 'Past due';
}

export function getTaskActivityFeed(task: Task): TaskActivity[] {
  const fromActivity = task.activity ?? [];
  const commentItems: TaskActivity[] = (task.comments ?? []).map(c => ({
    type: 'comment',
    author: c.author,
    text: c.text,
    at: c.at,
  }));
  const keys = new Set(fromActivity.map(a => `${a.type}:${a.at}:${a.text}`));
  const merged = [
    ...fromActivity,
    ...commentItems.filter(c => !keys.has(`${c.type}:${c.at}:${c.text}`)),
  ];
  return merged;
}

export function getTaskRequiredActions(task: Task): string[] {
  if (task.requiredActions?.length) return task.requiredActions;
  const actions: string[] = [];
  if (task.requiresPhoto) actions.push('Upload photo proof before marking complete');
  if (task.automated) actions.push('Follow automated checklist sequence');
  if (task.notes && task.status !== 'done') actions.push('Review store instructions in notes');
  return actions;
}

export function formatTaskRecurrence(task: Task): string | null {
  if (!task.recurrence || task.recurrence === 'none') return null;
  if (task.recurrence === 'daily') return 'Every day';
  const weekdayLabels = (task.recurrenceWeekdays ?? [])
    .map(id => WEEKDAYS.find(d => d.id === id)?.label ?? id)
    .join(', ');
  if (task.recurrence === 'monthly') {
    const dates = (task.recurrenceMonthDays ?? []).sort((a, b) => a - b).join(', ');
    return dates ? `Monthly · ${dates}` : 'Every month';
  }
  if (task.recurrence === 'weekly') {
    return weekdayLabels ? `Weekly · ${weekdayLabels}` : 'Every week';
  }
  if (task.recurrence === 'biweekly') {
    return weekdayLabels ? `Every 2 weeks · ${weekdayLabels}` : 'Every 2 weeks';
  }
  if (task.recurrence === 'custom') {
    return weekdayLabels ? `Custom · ${weekdayLabels}` : 'Custom schedule';
  }
  return null;
}

export function formatTaskDueWindow(task: Task): string {
  if (task.dueBy) return task.dueBy;
  if (task.completeWithinValue != null && task.completeWithinValue > 0) {
    const u = task.completeWithinUnit ?? 'minutes';
    const n = task.completeWithinValue;
    const unitLabel = u === 'hours' ? (n === 1 ? 'hour' : 'hours') : (n === 1 ? 'minute' : 'minutes');
    return `Within ${n} ${unitLabel}`;
  }
  return task.due;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Mannequin display',
    store: 'Marina Bay Sands',
    due: 'Today',
    status: 'done',
    requiresPhoto: true,
    automated: true,
    assignedTo: 'Sarah Tan',
    priority: 'medium',
    createdAt: 'May 28, 2026 · 9:00 AM',
    description: 'Refresh front-window mannequins with June campaign looks. Match VM guide spacing, lighting, and accessory pairing.',
    completedAt: 'Jun 1, 2026 · 4:32 PM',
    completionNotes: 'Display updated per VM guide. Before/after photos attached for audit trail.',
    requiredActions: ['Update mannequin styling per VM guide', 'Capture before/after photos', 'Confirm lighting alignment'],
    activity: [
      { type: 'status', author: 'System', text: 'Task created from automated checklist', at: 'May 28 · 9:00 AM' },
      { type: 'update', author: 'Sarah Tan', text: 'Started front-window refresh', at: 'Jun 1 · 1:45 PM' },
      { type: 'status', author: 'System', text: 'Marked complete', at: 'Jun 1 · 4:32 PM' },
      { type: 'comment', author: 'Sarah Tan', text: 'Left mannequin pair updated; right pair scheduled for tomorrow AM.', at: 'Jun 1 · 2:10 PM' },
    ],
  },
  {
    id: 2,
    title: 'Window signage — June',
    store: 'Orchard Central',
    due: 'Today',
    status: 'pending',
    requiresPhoto: true,
    automated: false,
    assignedTo: 'Priya S.',
    priority: 'high',
    createdAt: 'May 30, 2026 · 2:15 PM',
    description: 'Install approved June window vinyl and ensure pricing strips align with campaign POS.',
    notes: 'Use only creative assets from the shared June folder. Photo proof required before close.',
    requiredActions: ['Install approved June vinyl', 'Align pricing strips with POS', 'Upload photo proof'],
    activity: [
      { type: 'status', author: 'System', text: 'Task assigned to Priya S.', at: 'May 30 · 2:15 PM' },
      { type: 'comment', author: 'Ops lead', text: 'Vinyl shipment confirmed at store — ready for install.', at: 'Today · 9:15 AM' },
    ],
  },
  {
    id: 3,
    title: 'Layout rotation — Zone A',
    store: 'VivoCity',
    due: 'Tomorrow',
    status: 'pending',
    requiresPhoto: true,
    automated: true,
    assignedTo: 'John Lim',
    priority: 'medium',
    createdAt: 'Jun 1, 2026 · 7:30 AM',
    description: 'Rotate Zone A fixtures per automated planogram. Clear aisle width to 1.2m minimum.',
    notes: 'Automated checklist generated from planogram v3.2 — follow bay order north to south.',
    requiredActions: ['Rotate fixtures per planogram v3.2', 'Maintain 1.2m aisle clearance', 'Submit layout photo proof'],
    activity: [
      { type: 'status', author: 'System', text: 'Generated from planogram automation', at: 'Jun 1 · 7:30 AM' },
    ],
  },
  {
    id: 4,
    title: 'Restock fitting room',
    store: 'Bugis Junction',
    due: 'Today',
    status: 'overdue',
    requiresPhoto: false,
    automated: false,
    assignedTo: 'Ali Hassan',
    priority: 'high',
    createdAt: 'May 31, 2026 · 10:00 AM',
    description: 'Restock fitting room consumables and size-run gaps flagged in yesterday’s audit.',
    overdueBy: '6 hours',
    notes: 'High priority — affects fitting room NPS. No photo required; confirm counts in notes.',
    requiredActions: ['Restock consumables', 'Fill size-run gaps from audit', 'Log counts in completion notes'],
    activity: [
      { type: 'status', author: 'System', text: 'Task created', at: 'May 31 · 10:00 AM' },
      { type: 'status', author: 'System', text: 'Marked overdue — past due window', at: 'Today · 8:00 AM' },
      { type: 'comment', author: 'Ali Hassan', text: 'Waiting on delivery from back-of-house — ETA 2 PM.', at: 'Today · 11:40 AM' },
    ],
  },
  {
    id: 5,
    title: 'Fixture re-arrangement',
    store: 'Tampines Mall',
    due: 'Jun 2',
    status: 'pending',
    requiresPhoto: true,
    automated: false,
    assignedTo: 'Wei Chen',
    priority: 'medium',
    createdAt: 'Jun 1, 2026 · 11:20 AM',
    description: 'Move seasonal fixture bank to entrance zone B per floor plan update.',
    notes: 'Photo proof of final layout required. Coordinate with security for after-hours access if needed.',
    requiredActions: ['Move fixture bank to zone B', 'Coordinate after-hours access if needed', 'Upload final layout photos'],
    activity: [
      { type: 'status', author: 'System', text: 'Task scheduled', at: 'Jun 1 · 11:20 AM' },
    ],
  },
  {
    id: 6,
    title: 'Verify camera angles',
    store: 'All Stores',
    due: 'Weekly',
    status: 'done',
    requiresPhoto: false,
    automated: true,
    assignedTo: 'Sarah Tan',
    priority: 'low',
    createdAt: 'May 27, 2026 · 8:00 AM',
    description: 'Confirm entrance and zone cameras are unobstructed and within calibration tolerance.',
    completedAt: 'May 30, 2026 · 11:05 AM',
    completionNotes: 'All stores passed angle check. Minor adjustment logged for Northpoint entrance cam.',
    requiredActions: ['Check entrance camera angles', 'Verify zone coverage', 'Log exceptions in notes'],
    activity: [
      { type: 'status', author: 'System', text: 'Weekly automated task created', at: 'May 27 · 8:00 AM' },
      { type: 'status', author: 'System', text: 'Marked complete', at: 'May 30 · 11:05 AM' },
    ],
  },
];

/** Demo photo proof for completed tasks (user uploads override via taskPhotos state). */
export const INITIAL_TASK_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80',
};

export const STATUS_CFG: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  done: { icon: <CheckCircle2 size={14} strokeWidth={2} />, label: 'Done', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  pending: { icon: <Circle size={14} strokeWidth={2} />, label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  overdue: { icon: <AlertCircle size={14} strokeWidth={2} />, label: 'Overdue', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

export const PRESAVED_CONCERNS = [
  { id: 'footfall', label: 'Footfall mismatch', description: 'Counts do not match accuracy report' },
  { id: 'camera', label: 'Camera offline', description: 'Live feed or snapshot unavailable' },
  { id: 'accuracy', label: 'Accuracy concern', description: 'Demographics or conversion data looks off' },
];

export interface QuickActionDef {
  id: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
}

export type QuickActionIconTone = {
  color: string;
  background: string;
};

function qaIconTone(colorVar: string, backgroundVar: string): QuickActionIconTone {
  return { color: colorVar, background: backgroundVar };
}

/** Per-action icon colors for hybrid quick-action tiles (theme-aware tokens). */
export const QUICK_ACTION_ICON_TONES: Record<string, QuickActionIconTone> = {
  member: qaIconTone('var(--color-primary)', 'var(--color-primary-light)'),
  concern: qaIconTone('var(--color-error)', 'var(--color-error-light)'),
  page: qaIconTone('var(--color-info)', 'var(--color-info-light)'),
  snapshots: qaIconTone('var(--color-warning)', 'var(--color-warning-light)'),
  'add-task': qaIconTone('var(--color-success)', 'var(--color-success-light)'),
  reports: qaIconTone('var(--color-secondary)', 'var(--color-secondary-light)'),
  'task-tracker': qaIconTone('var(--color-info)', 'var(--color-info-light)'),
  insights: qaIconTone('var(--color-primary)', 'var(--color-primary-light)'),
  analytics: qaIconTone('var(--color-info)', 'var(--color-info-light)'),
  team: qaIconTone('var(--color-success)', 'var(--color-success-light)'),
  'export-report': qaIconTone('var(--color-warning)', 'var(--color-warning-light)'),
};

const QUICK_ACTION_ICON_TONE_FALLBACKS: QuickActionIconTone[] = [
  qaIconTone('var(--color-primary)', 'var(--color-primary-light)'),
  qaIconTone('var(--color-info)', 'var(--color-info-light)'),
  qaIconTone('var(--color-success)', 'var(--color-success-light)'),
  qaIconTone('var(--color-warning)', 'var(--color-warning-light)'),
  qaIconTone('var(--color-error)', 'var(--color-error-light)'),
  qaIconTone('var(--color-secondary)', 'var(--color-secondary-light)'),
];

export function getQuickActionIconTone(actionId: string, index = 0): QuickActionIconTone {
  return (
    QUICK_ACTION_ICON_TONES[actionId] ??
    QUICK_ACTION_ICON_TONE_FALLBACKS[index % QUICK_ACTION_ICON_TONE_FALLBACKS.length]
  );
}

export const QUICK_ACTIONS: QuickActionDef[] = [
  { id: 'member', label: 'Add a Member', href: '/dashboard/team?action=add-member', icon: <UserPlus size={16} strokeWidth={1.5} /> },
  { id: 'concern', label: 'Raise a Concern', icon: <AlertCircle size={16} strokeWidth={1.5} /> },
  { id: 'page', label: 'Create a New Page', href: '/dashboard/analytics?action=new-page', icon: <LayoutGrid size={16} strokeWidth={1.5} /> },
  { id: 'snapshots', label: 'View Snapshots', href: '/dashboard/analytics?action=view-snapshots', icon: <Video size={16} strokeWidth={1.5} /> },
];

/** Full catalog for hybrid quick-action picker (includes recent-style shortcuts). */
export const QUICK_ACTION_POOL: QuickActionDef[] = [
  ...QUICK_ACTIONS,
  { id: 'add-task', label: 'Add a Task', icon: <CheckCircle2 size={16} strokeWidth={1.5} /> },
  { id: 'task-tracker', label: 'Open Task Tracker', icon: <Clock size={16} strokeWidth={1.5} /> },
  { id: 'insights', label: 'Store Insights', icon: <Activity size={16} strokeWidth={1.5} /> },
  { id: 'reports', label: 'View Reports', href: '/dashboard/reports', icon: <FileText size={16} strokeWidth={1.5} /> },
  { id: 'analytics', label: 'Analytics Overview', href: '/dashboard/analytics', icon: <BarChart2 size={16} strokeWidth={1.5} /> },
  { id: 'team', label: 'Team Management', href: '/dashboard/team', icon: <Users size={16} strokeWidth={1.5} /> },
  { id: 'export-report', label: 'Export Footfall Report', icon: <Download size={16} strokeWidth={1.5} /> },
];

/** Suggested from recent usage (shown in quick-action manager). */
export const RECENT_ACTION_SUGGESTIONS: { actionId: string; usedAgo: string }[] = [
  { actionId: 'snapshots', usedAgo: '2h ago' },
  { actionId: 'concern', usedAgo: 'Yesterday' },
  { actionId: 'page', usedAgo: '2 days ago' },
  { actionId: 'export-report', usedAgo: '3 days ago' },
  { actionId: 'insights', usedAgo: '4 days ago' },
  { actionId: 'member', usedAgo: 'Last week' },
];

export const HYBRID_QUICK_ACTIONS_STORAGE_KEY = 'oly-hybrid-quick-actions';
export const HYBRID_QUICK_ACTION_SLOT_COUNT = 6;
export const DEFAULT_HYBRID_QUICK_ACTION_IDS = [
  ...QUICK_ACTIONS.map(a => a.id),
  'add-task',
  'reports',
];

export interface RecentAlert {
  id: number;
  type: 'critical' | 'warning' | 'success';
  message: string;
  store: string;
  ago: string;
  icon: React.ReactNode;
}

export const RECENT_ALERTS: RecentAlert[] = [
  { id: 1, type: 'critical', message: 'Entrance camera offline', store: 'Marina Bay Sands', ago: '2 min ago', icon: <WifiOff size={13} strokeWidth={1.5} /> },
  { id: 2, type: 'warning', message: 'High queue depth detected', store: 'VivoCity', ago: '9 min ago', icon: <Flame size={13} strokeWidth={1.5} /> },
  { id: 3, type: 'critical', message: 'Unusual activity in Zone B', store: 'Orchard Central', ago: '17 min ago', icon: <AlertCircle size={13} strokeWidth={1.5} /> },
  { id: 4, type: 'success', message: 'Queue cleared — peak resolved', store: 'Tampines Mall', ago: '31 min ago', icon: <CheckCircle2 size={13} strokeWidth={1.5} /> },
  { id: 5, type: 'warning', message: 'Low footfall — 32% below avg', store: 'Northpoint City', ago: '48 min ago', icon: <TrendingDown size={13} strokeWidth={1.5} /> },
];

export const ALERT_CFG = {
  critical: { color: 'var(--color-error)', bg: 'var(--color-error-light)', label: 'Alert' },
  warning: { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'Warning' },
  success: { color: 'var(--color-success)', bg: 'var(--color-success-light)', label: 'Resolved' },
};

export type ReportItem = {
  id: number;
  name: string;
  scope: string;
  date: string;
  tag: string;
};

export const ALL_REPORTS: ReportItem[] = [
  { id: 1, name: 'Monthly Footfall Summary', scope: 'All Stores', date: 'May 2026', tag: 'Footfall' },
  { id: 2, name: 'Demographics Breakdown', scope: 'Marina Bay Sands', date: 'Week 21', tag: 'Demographics' },
  { id: 3, name: 'Queue Performance Report', scope: 'VivoCity', date: 'May 2026', tag: 'Queue' },
  { id: 4, name: 'Conversion Rate Analysis', scope: 'All Stores', date: 'May 2026', tag: 'Conversion' },
  { id: 5, name: 'Heatmap Density Export', scope: 'Orchard Central', date: 'May 2026', tag: 'Heatmap' },
  { id: 6, name: 'Staffing vs Footfall', scope: 'Tampines Mall', date: 'Week 20', tag: 'Operations' },
  { id: 7, name: 'Dwell Time by Zone', scope: 'Bugis Junction', date: 'May 2026', tag: 'Dwell' },
  { id: 8, name: 'Weekly Executive Summary', scope: 'All Stores', date: 'Week 21', tag: 'Executive' },
];

/** Preview rows on the hybrid home card */
export const RECENT_REPORTS = ALL_REPORTS.slice(0, 4);

