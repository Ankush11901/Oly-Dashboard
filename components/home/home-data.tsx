'use client';
import {
  TrendingDown, AlertCircle, TrendingUp, Activity, Video,
  CheckCircle2, Circle, WifiOff, Flame, FileText, Download,
  UserPlus, LayoutGrid, Users, BarChart2, Clock,
} from 'lucide-react';

export const SIGNALS = [
  { id: 1, title: 'Below peak hours', summary: 'Footfall 15% below projected peak. Promo push recommended 2–4 PM.', icon: <TrendingDown size={14} strokeWidth={1.5} />, color: '#F59E0B' },
  { id: 2, title: 'Queue alert — VivoCity', summary: 'Queue depth exceeded threshold for 40 min. Staff reallocation suggested.', icon: <AlertCircle size={14} strokeWidth={1.5} />, color: '#EF4444' },
  { id: 3, title: 'Conversion trending up', summary: 'Marina Bay Sands leads at 16.2% vs 12.4% avg — best performer this week.', icon: <TrendingUp size={14} strokeWidth={1.5} />, color: '#10B981' },
  { id: 4, title: 'New tenant impact', summary: 'Jurong Point saw +22% footfall increase after anchor tenant opened last week.', icon: <Activity size={14} strokeWidth={1.5} />, color: '#0EA5E9' },
  { id: 5, title: 'Camera coverage gap', summary: 'Zone C at Bugis Junction has 18% lower detection confidence than baseline.', icon: <Video size={14} strokeWidth={1.5} />, color: '#8B5CF6' },
];

export type TaskStatus = 'done' | 'pending' | 'overdue';

export interface Task {
  id: number;
  title: string;
  store: string;
  due: string;
  status: TaskStatus;
  requiresPhoto: boolean;
  automated: boolean;
  assignedTo?: string;
}

export const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Mannequin display', store: 'Marina Bay Sands', due: 'Today', status: 'done', requiresPhoto: true, automated: true },
  { id: 2, title: 'Window signage — June', store: 'Orchard Central', due: 'Today', status: 'pending', requiresPhoto: true, automated: false },
  { id: 3, title: 'Layout rotation — Zone A', store: 'VivoCity', due: 'Tomorrow', status: 'pending', requiresPhoto: true, automated: true },
  { id: 4, title: 'Restock fitting room', store: 'Bugis Junction', due: 'Today', status: 'overdue', requiresPhoto: false, automated: false },
  { id: 5, title: 'Fixture re-arrangement', store: 'Tampines Mall', due: 'Jun 2', status: 'pending', requiresPhoto: true, automated: false },
  { id: 6, title: 'Verify camera angles', store: 'All Stores', due: 'Weekly', status: 'done', requiresPhoto: false, automated: true },
];

export const STATUS_CFG: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  done: { icon: <CheckCircle2 size={14} strokeWidth={2} />, label: 'Done', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  pending: { icon: <Circle size={14} strokeWidth={2} />, label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  overdue: { icon: <AlertCircle size={14} strokeWidth={2} />, label: 'Overdue', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

export const QUICK_ACTIONS = [
  { label: 'Add a Member', href: '/dashboard/team?action=add-member', icon: <UserPlus size={16} strokeWidth={1.5} /> },
  { label: 'Raise New Concern', href: '/dashboard/preferences/tickets?action=raise-concern', icon: <AlertCircle size={16} strokeWidth={1.5} /> },
  { label: 'Create a New Page', href: '/dashboard/analytics?action=new-page', icon: <LayoutGrid size={16} strokeWidth={1.5} /> },
  { label: 'View Snapshots', href: '/dashboard/analytics?action=view-snapshots', icon: <Video size={16} strokeWidth={1.5} /> },
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

export const RECENT_REPORTS = [
  { id: 1, name: 'Monthly Footfall Summary', scope: 'All Stores', date: 'May 2026', tag: 'Footfall' },
  { id: 2, name: 'Demographics Breakdown', scope: 'Marina Bay Sands', date: 'Week 21', tag: 'Demographics' },
  { id: 3, name: 'Queue Performance Report', scope: 'VivoCity', date: 'May 2026', tag: 'Queue' },
  { id: 4, name: 'Conversion Rate Analysis', scope: 'All Stores', date: 'May 2026', tag: 'Conversion' },
];

export const SUMMARY_CHIPS: { accent: string; text: React.ReactNode }[] = [
  {
    accent: 'var(--color-success)',
    text: <>Marina Bay Sands led footfall today with <strong style={{ color: 'var(--color-success)', fontWeight: 600 }}>15,234</strong> visitors — its highest this month.</>,
  },
  {
    accent: 'var(--color-success)',
    text: <>Conversion rate is tracking at <strong style={{ color: 'var(--color-success)', fontWeight: 600 }}>12.4%</strong>, up <strong style={{ color: 'var(--color-success)', fontWeight: 600 }}>+1.8 pts</strong> from yesterday.</>,
  },
  {
    accent: 'var(--color-success)',
    text: <>Peak hour was <strong style={{ color: 'var(--color-success)', fontWeight: 600 }}>1 PM</strong> across all stores — consider extra staffing 12–3 PM tomorrow.</>,
  },
  {
    accent: 'var(--color-error)',
    text: <><strong style={{ color: 'var(--color-error)', fontWeight: 600 }}>1 camera offline</strong> at Bugis Junction North Entry. Review recommended.</>,
  },
];
