'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Search, X, Edit2, Trash2, Check, Filter, ChevronDown,
  LayoutDashboard, BarChart2, Video, UserCog, FileText,
  Store, Users, UsersRound,
  Activity, Download, Camera, KeyRound, ShieldCheck, LogIn,
} from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';
import { TeamKpiStrip } from '@/components/team/TeamKpiStrip';
import { TeamFiltersPanel } from '@/components/team/TeamFiltersPanel';
import { GroupsPanel, GroupsToolbarExtras } from '@/components/team/GroupsPanel';
import { RolePill } from '@/components/team/RolePill';
import { MemberStoreAccessLabel } from '@/components/team/MemberStoreAccessLabel';
import {
  type Member, type Status, type PermLevel, type UserType, type UserCategory,
  type TeamViewMode, type GroupViewLayout, type TeamGroup, type TeamFilters,
  ROLE_DEFS, MODULES, DEFAULT_ROLE_PERMS, LOCATIONS, STATUS_CFG, PERM_CFG,
  INITIAL_MEMBERS, INITIAL_GROUPS, EMPTY_FILTERS,
  getRoleDef, getInitials, memberMatchesSearch, countMemberPermissions,
} from '@/lib/team-data';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={13} strokeWidth={1.5} />,
  analytics: <BarChart2      size={13} strokeWidth={1.5} />,
  live_feed: <Video          size={13} strokeWidth={1.5} />,
  team:      <UserCog        size={13} strokeWidth={1.5} />,
  reports:   <FileText       size={13} strokeWidth={1.5} />,
};

// avatar bg colors by index
const AVATAR_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)', 'var(--chart-5)'];

// ── Permissions summary (compact table cell) ───────────────────────────────────
function PermissionsSummaryCell({ member }: { member: Member }) {
  const count = countMemberPermissions(member);
  const perms = member.customPerms ?? DEFAULT_ROLE_PERMS[member.userType] ?? {};
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popoverRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
          background: 'var(--color-primary-light)', color: 'var(--color-primary)',
          border: '1px solid var(--color-accent-border)', cursor: 'pointer',
        }}
      >
        {count} permission{count === 1 ? '' : 's'}
      </button>
      {open && btnRef.current && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: btnRef.current.getBoundingClientRect().bottom + 6,
            left: btnRef.current.getBoundingClientRect().left,
            zIndex: 10000,
            minWidth: 220,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-dropdown)',
            padding: '10px 12px',
          }}
        >
          {MODULES.map(m => {
            const level = (perms[m.key] ?? 'none') as PermLevel;
            const cfg = PERM_CFG[level];
            return (
              <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', fontSize: 11.5 }}>
                <span style={{ color: 'var(--color-text-2)' }}>{m.label}</span>
                <span style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Activity Log ──────────────────────────────────────────────────────────────

type LogType = 'profile' | 'password' | 'role' | 'store' | 'login';

interface LogEvent {
  id: number;
  type: LogType;
  description: string;
  detail?: string;
  timestamp: string;
}

const LOG_ICON: Record<LogType, React.ReactNode> = {
  profile:  <Camera     size={13} strokeWidth={1.75} />,
  password: <KeyRound   size={13} strokeWidth={1.75} />,
  role:     <ShieldCheck size={13} strokeWidth={1.75} />,
  store:    <Store      size={13} strokeWidth={1.75} />,
  login:    <LogIn      size={13} strokeWidth={1.75} />,
};

const LOG_COLORS: Record<LogType, { bg: string; color: string; border: string }> = {
  profile:  { bg: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'var(--color-accent-border)' },
  password: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: 'var(--color-border)' },
  role:     { bg: 'var(--color-success-light)', color: 'var(--color-success)', border: 'var(--color-border)' },
  store:    { bg: 'var(--color-info-light)', color: 'var(--color-info)', border: 'var(--color-border)' },
  login:    { bg: 'var(--color-accent-bg)', color: 'var(--color-primary)', border: 'var(--color-accent-border)' },
};

function getMockLogs(member: Member): LogEvent[] {
  const roleName = getRoleDef(member.roleId).name;
  const logs: LogEvent[] = [
    { id: 1, type: 'login',    description: 'Logged in',                  detail: 'Successful login · Chrome · Singapore',           timestamp: '2026-05-28T08:01:00Z' },
    { id: 2, type: 'profile',  description: 'Profile picture updated',    detail: 'Avatar image changed',                            timestamp: '2026-05-20T14:32:00Z' },
    { id: 3, type: 'login',    description: 'Logged in',                  detail: 'Successful login · Safari · Singapore',           timestamp: '2026-05-15T17:45:00Z' },
    { id: 4, type: 'password', description: 'Password changed',           detail: 'Password reset via email link',                   timestamp: '2026-05-15T09:18:00Z' },
    { id: 5, type: 'role',     description: 'Role updated',               detail: `Role changed to ${roleName}`,                     timestamp: '2026-04-28T11:05:00Z' },
    { id: 6, type: 'store',    description: 'Store access modified',      detail: `${member.storeAccess.length} store(s) assigned`,  timestamp: '2026-04-14T16:40:00Z' },
    { id: 7, type: 'profile',  description: 'Profile picture updated',    detail: 'Avatar image changed',                            timestamp: '2026-03-12T13:22:00Z' },
    { id: 8, type: 'store',    description: 'Store access modified',      detail: 'Access to Bugis Junction revoked',                timestamp: '2026-03-05T10:10:00Z' },
  ];
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function fmtDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
  };
}

function ActivityLogModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [search,     setSearch]     = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const allLogs = getMockLogs(member);
  const now     = Date.now();

  const DAY_MS = 86_400_000;
  const filtered = allLogs.filter(log => {
    const age = now - new Date(log.timestamp).getTime();
    if (dateFilter === '7d'  && age > 7  * DAY_MS) return false;
    if (dateFilter === '30d' && age > 30 * DAY_MS) return false;
    if (dateFilter === '90d' && age > 90 * DAY_MS) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!log.description.toLowerCase().includes(q) && !log.detail?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center theme-overlay"
      style={{ backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel"
        style={{
          borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid var(--color-border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', margin: 0, letterSpacing: '-0.01em' }}>
                {member.name} Activity Log
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-4)', margin: '3px 0 0' }}>
                All recorded account activity
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-3)', flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-4)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search activity..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 30, paddingRight: 12, height: 34,
                  border: '1.5px solid var(--color-border)', borderRadius: 8,
                  fontSize: 12.5, color: 'var(--color-text-1)', outline: 'none', boxSizing: 'border-box',
                  background: 'var(--color-surface-2)',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <div style={{ width: 130, flexShrink: 0 }}>
              <CustomSelect
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: 'all', label: 'All time' },
                  { value: '7d',  label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' },
                ]}
                size="sm"
                style={{ height: 34 }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const rows = [['Date', 'Time', 'Event', 'Detail'], ...filtered.map(log => {
                  const { date, time } = fmtDateTime(log.timestamp);
                  return [date, time, log.description, log.detail ?? ''];
                })];
                const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${member.name.replace(/\s+/g, '_')}_activity.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 34, paddingLeft: 12, paddingRight: 12,
                borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-text-2)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 150ms ease', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
            >
              <Download size={12} strokeWidth={1.75} />
              Export
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-4)', fontSize: 13, padding: '48px 0' }}>
              No activity matches your filters.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute', left: 17, top: 30, bottom: 30,
                width: 1.5, background: 'var(--color-border-subtle)', zIndex: 0,
              }} />

              {filtered.map((log, i) => {
                const { date, time } = fmtDateTime(log.timestamp);
                const cfg = LOG_COLORS[log.type];
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '14px 0',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      position: 'relative', zIndex: 1,
                    }}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cfg.color,
                    }}>
                      {LOG_ICON[log.type]}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-1)', margin: 0, lineHeight: 1.4 }}>
                        {log.description}
                      </p>
                      {log.detail && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-4)', margin: '3px 0 0', lineHeight: 1.4 }}>
                          {log.detail}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ flexShrink: 0, textAlign: 'right', paddingTop: 2 }}>
                      <p style={{ fontSize: 12, color: 'var(--color-text-2)', fontWeight: 500, margin: 0 }}>{date}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-4)', margin: '2px 0 0' }}>{time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Module permission row for permissions tab ─────────────────────────────────
function PermToggleRow({ module, icon, level, onChange }: {
  module: string;
  icon: React.ReactNode;
  level: PermLevel;
  onChange: (l: PermLevel) => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: 120, flexShrink: 0 }}>
        <span style={{ color: 'var(--color-text-4)', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)' }}>{module}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {(['none', 'view', 'full'] as PermLevel[]).map(l => {
          const active = level === l;
          const cfg = PERM_CFG[l];
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange(l)}
              style={{
                flex: 1, height: 32, borderRadius: 7,
                border: `1.5px solid ${active ? cfg.border : 'var(--color-border)'}`,
                background: active ? cfg.bg : 'var(--color-surface)',
                color: active ? cfg.color : 'var(--color-text-4)',
                fontSize: 12, fontWeight: active ? 700 : 500,
                cursor: 'pointer', transition: 'all 140ms ease',
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Add / Edit Member Modal ───────────────────────────────────────────────────
const BLANK_FORM = {
  name: '', email: '', roleId: 'store_manager' as UserType, userType: 'store_manager' as UserType,
  location: 'Marina Bay Sands', storeAccess: ['Marina Bay Sands'], status: 'Active' as Status,
};

function MemberModal({
  mode, initial, onClose, onSave,
}: {
  mode: 'add' | 'edit';
  initial: typeof BLANK_FORM & { id?: number; customPerms?: Record<string, PermLevel> };
  onClose: () => void;
  onSave: (data: typeof BLANK_FORM & { customPerms: Record<string, PermLevel> }) => void;
}) {
  const [permsOpen, setPermsOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [perms, setPerms] = useState<Record<string, PermLevel>>(
    initial.customPerms ?? { ...DEFAULT_ROLE_PERMS[initial.roleId as UserType] }
  );

  const handleRoleChange = (roleId: UserType) => {
    setForm(f => ({ ...f, roleId, userType: roleId }));
    setPerms({ ...DEFAULT_ROLE_PERMS[roleId] });
  };

  const toggleStore = (store: string) => {
    setForm(f => ({
      ...f,
      storeAccess: f.storeAccess.includes(store)
        ? f.storeAccess.filter(s => s !== store)
        : [...f.storeAccess, store],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave({ ...form, customPerms: perms });
  };

  const selectedRole = ROLE_DEFS.find(r => r.id === form.roleId) ?? ROLE_DEFS[2];

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, color: 'var(--color-text-1)',
    outline: 'none', boxSizing: 'border-box', background: 'var(--color-surface-2)',
    transition: 'border-color 150ms ease',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center theme-overlay"
      style={{ backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel"
        style={{
          borderRadius: 20,
          width: '100%',
          maxWidth: 580,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div style={{
          padding: '20px 24px 0',
          flexShrink: 0,
          background: 'var(--color-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', margin: 0, letterSpacing: '-0.01em' }}>
                {mode === 'add' ? 'Add Team Member' : 'Edit Member'}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-4)', margin: '3px 0 0' }}>
                {mode === 'add' ? 'Fill in details, assign a role, and configure access.' : 'Update member details and access permissions.'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-3)', flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name *</label>
                  <input
                    type="text" required autoFocus={mode === 'add'}
                    placeholder="e.g. Jane Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address *</label>
                  <input
                    type="email" required
                    placeholder="jane@olyretail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                  {ROLE_DEFS.map(r => {
                    const active = form.roleId === r.id;
                    return (
                      <button
                        key={r.id} type="button"
                        onClick={() => handleRoleChange(r.id)}
                        style={{
                          padding: '10px 10px', borderRadius: 9, minHeight: 72,
                          border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--color-text-1)', marginBottom: 4, lineHeight: 1.3 }}>
                          {r.name}
                        </span>
                        <p style={{ fontSize: 10.5, color: active ? 'var(--color-text-2)' : 'var(--color-text-4)', margin: 0, lineHeight: 1.35 }}>{r.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Primary Location</label>
                <CustomSelect
                  value={form.location}
                  onChange={v => setForm(f => ({ ...f, location: v }))}
                  options={LOCATIONS.map(l => ({ value: l, label: l }))}
                  size="md"
                />
              </div>

              <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4, marginBottom: 10 }}>Store Access</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LOCATIONS.map(store => {
                  const active = form.storeAccess.includes(store);
                  return (
                    <button
                      key={store} type="button"
                      onClick={() => toggleStore(store)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: active ? 5 : 0,
                        padding: '6px 12px', borderRadius: 7,
                        border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: active ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-3)',
                        fontSize: 12.5, fontWeight: active ? 600 : 400,
                        cursor: 'pointer', transition: 'all 120ms ease',
                      }}
                    >
                      {active && <Check size={11} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                      {store}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPermsOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--color-border)',
                  background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                  color: 'var(--color-text-2)',
                }}
              >
                <span>Customize permissions ({selectedRole.name} defaults)</span>
                <ChevronDown size={14} style={{ transform: permsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>
              {permsOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 0' }}>
                  {MODULES.map(m => (
                    <PermToggleRow
                      key={m.key}
                      module={m.label}
                      icon={MODULE_ICONS[m.key]}
                      level={(perms[m.key] ?? 'none') as PermLevel}
                      onChange={l => setPerms(p => ({ ...p, [m.key]: l }))}
                    />
                  ))}
                </div>
              )}
            </div>
        </form>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 24px 20px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            type="button" onClick={onClose}
            style={{
              flex: 1, height: 40, borderRadius: 9,
              border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
              color: 'var(--color-text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={e => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            style={{
              flex: 2, height: 40, borderRadius: 9,
              border: 'none', background: 'var(--color-primary-emphasis)',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            {mode === 'add' ? 'Add Member' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function TeamPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [groups, setGroups] = useState<TeamGroup[]>(INITIAL_GROUPS);
  const [viewMode, setViewMode] = useState<TeamViewMode>('users');
  const [category, setCategory] = useState<UserCategory>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TeamFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groupLayout, setGroupLayout] = useState<GroupViewLayout>('grid');
  const [groupsCreateOpen, setGroupsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activityMember, setActivityMember] = useState<Member | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add-member') {
      setAddOpen(true);
      router.replace('/dashboard/team');
    }
  }, [searchParams, router]);

  const memberInGroupFilter = (m: Member) => {
    if (!filters.groupId) return true;
    const g = groups.find(x => String(x.id) === filters.groupId);
    return g ? g.memberIds.includes(m.id) : true;
  };

  const filtered = members.filter(m => {
    const matchesCategory = category === 'all' || m.userType === category;
    if (!matchesCategory) return false;
    if (!memberMatchesSearch(m, search)) return false;
    if (filters.roleId && m.roleId !== filters.roleId) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.store && !m.storeAccess.includes(filters.store) && m.location !== filters.store) return false;
    if (!memberInGroupFilter(m)) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (selectedIds.size === 0 || viewMode !== 'users') return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-member-selection]')) return;
      setSelectedIds(new Set());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [selectedIds.size, viewMode]);

  const handleCreateGroupFromSelection = () => {
    if (selectedIds.size === 0) return;
    setGroups(prev => [...prev, {
      id: Date.now(),
      name: `New Team (${selectedIds.size} members)`,
      description: 'Created from selected members',
      memberIds: Array.from(selectedIds),
    }]);
    setSelectedIds(new Set());
    setViewMode('groups');
  };

  const handleAdd = (data: typeof BLANK_FORM & { customPerms: Record<string, PermLevel> }) => {
    setMembers(prev => [...prev, { ...data, id: Date.now(), storeAccess: data.storeAccess.length ? data.storeAccess : [data.location] }]);
    setAddOpen(false);
  };

  const handleEditSave = (data: typeof BLANK_FORM & { customPerms: Record<string, PermLevel> }) => {
    if (!editMember) return;
    setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, ...data } : m));
    setEditMember(null);
  };

  const handleDelete = () => {
    setMembers(prev => prev.filter(m => m.id !== deleteId));
    setDeleteId(null);
  };

  const adminCount = members.filter(m => m.userType === 'admin').length;
  const regionalCount = members.filter(m => m.userType === 'regional_manager').length;
  const storeMgrCount = members.filter(m => m.userType === 'store_manager').length;
  const hasFilters = !!(filters.roleId || filters.status || filters.store || filters.groupId);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%', background: 'var(--color-page-bg)' }}>

      <TeamKpiStrip members={members} groups={groups} />

      {filtersOpen && (
        <TeamFiltersPanel filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} groups={groups} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>

        {viewMode === 'users' ? (
        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--color-surface-2)', borderRadius: 10, padding: 3,
        }}>
          {([
            { key: 'all',     label: 'All Users',     count: members.length },
            { key: 'admin', label: 'Admin', count: adminCount },
            { key: 'regional_manager', label: 'Regional Manager', count: regionalCount },
            { key: 'store_manager', label: 'Store Manager', count: storeMgrCount },
          ] as { key: UserCategory; label: string; count: number }[]).map(tab => {
            const active = category === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: active ? 'var(--color-surface)' : 'transparent',
                  color: active ? 'var(--color-text-1)' : 'var(--color-text-3)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 18,
                  padding: '1px 6px', borderRadius: 8,
                  background: active ? 'var(--color-primary-light)' : 'var(--color-border)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-4)',
                  transition: 'all 150ms ease',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: 0 }}>{groups.length} groups</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={viewMode === 'users' ? 'Search users, stores, roles...' : 'Search groups...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 260, paddingLeft: 33, paddingRight: 12, height: 36,
                border: '1.5px solid var(--color-border)', borderRadius: 8,
                fontSize: 13, color: 'var(--color-text-1)', outline: 'none',
                background: 'var(--color-surface-2)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
              borderRadius: 8,
              border: `1.5px solid ${filtersOpen || hasFilters ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filtersOpen || hasFilters ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: filtersOpen || hasFilters ? 'var(--color-primary)' : 'var(--color-text-2)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Filter size={14} />
            Filters
          </button>
          <div className="team-view-switch team-view-switch--inline" role="tablist" aria-label="Team view">
            {([
              { key: 'users' as const, label: 'Users', icon: <Users size={14} strokeWidth={1.5} /> },
              { key: 'groups' as const, label: 'Groups', icon: <UsersRound size={14} strokeWidth={1.5} /> },
            ]).map(tab => {
              const active = viewMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(tab.key)}
                  className={`team-view-switch__btn${active ? ' team-view-switch__btn--active' : ''}`}
                  aria-label={tab.label}
                  title={tab.label}
                >
                  {tab.icon}
                </button>
              );
            })}
          </div>
          {viewMode === 'users' && selectedIds.size > 0 && (
            <button
              type="button"
              data-member-selection
              onClick={handleCreateGroupFromSelection}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
                borderRadius: 8, border: '1.5px solid var(--color-accent-border)', background: 'var(--color-accent-bg)',
                color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <UsersRound size={14} />
              Create Group ({selectedIds.size})
            </button>
          )}
          {viewMode === 'groups' ? (
            <GroupsToolbarExtras layout={groupLayout} onLayoutChange={setGroupLayout} onCreateGroup={() => setGroupsCreateOpen(true)} />
          ) : (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px',
                borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Member
            </button>
          )}
        </div>
      </div>

      {viewMode === 'groups' ? (
        <GroupsPanel
          groups={groups}
          setGroups={setGroups}
          members={members}
          search={search}
          layout={groupLayout}
          onEditMember={setEditMember}
          createOpen={groupsCreateOpen}
          onCreateOpenChange={setGroupsCreateOpen}
        />
      ) : (
      <>
      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table-surface" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 136 }} />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1.5px solid var(--color-border-subtle)' }}>
              {(['Member Name', 'User Type', 'Email', 'Permissions', 'Actions'] as const).map((h, i) => (
                <th key={i} style={{
                  padding: '11px 20px',
                  textAlign: i === 0 ? 'left' : 'center',
                  fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-text-4)', fontSize: 13 }}>
                  No members match your search.
                </td>
              </tr>
            )}
            {filtered.map((member, idx) => {
              const role = getRoleDef(member.roleId);
              const bgColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const checked = selectedIds.has(member.id);

              return (
                <tr
                  key={member.id}
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)', transition: 'background 120ms ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Member Name */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <input
                        type="checkbox"
                        data-member-selection
                        checked={checked}
                        onChange={() => toggleSelect(member.id)}
                        aria-label={`Select ${member.name}`}
                        style={{
                          width: 16,
                          height: 16,
                          margin: 0,
                          flexShrink: 0,
                          cursor: 'pointer',
                          accentColor: 'var(--color-primary-emphasis)',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        letterSpacing: '0.02em', overflow: 'hidden',
                        border: '2px solid var(--color-border)',
                      }}>
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : getInitials(member.name)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: 'var(--color-text-1)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </p>
                        <MemberStoreAccessLabel member={member} />
                      </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <RolePill roleIdOrName={member.roleId} label={role.name} />
                  </td>

                  {/* Email */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--color-text-3)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </span>
                  </td>

                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <PermissionsSummaryCell member={member} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        onClick={() => setEditMember(member)}
                        title="Edit member"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--color-primary)', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                      >
                        <Edit2 size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setActivityMember(member)}
                        title="View activity log"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#00CE9C', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg-hover)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                      >
                        <Activity size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setDeleteId(member.id)}
                        title="Remove member"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#EF4444', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-error-light)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-error)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-4)' }}>
            Showing {filtered.length} of {members.length} members
            {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}
          </span>
        </div>
      </div>
      </>
      )}

      {/* Add Modal */}
      {addOpen && (
        <MemberModal mode="add" initial={{ ...BLANK_FORM }} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      )}

      {/* Edit Modal */}
      {editMember && (
        <MemberModal
          mode="edit"
          initial={{
            name: editMember.name, email: editMember.email,
            roleId: editMember.roleId, userType: editMember.userType,
            location: editMember.location, storeAccess: editMember.storeAccess,
            status: editMember.status, id: editMember.id,
            customPerms: editMember.customPerms,
          }}
          onClose={() => setEditMember(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Activity Log Modal */}
      {activityMember && (
        <ActivityLogModal member={activityMember} onClose={() => setActivityMember(null)} />
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center theme-overlay"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="modal-panel"
            style={{ borderRadius: 16, width: 360, padding: '28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--color-error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: 'var(--color-error)' }} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>Remove Member</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-4)', margin: '2px 0 0' }}>This action cannot be undone.</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 22, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong>{members.find(m => m.id === deleteId)?.name}</strong> from the team? They will lose all access immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, height: 40, borderRadius: 9, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, height: 40, borderRadius: 9, border: 'none', background: '#EF4444', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={null}>
      <TeamPageContent />
    </Suspense>
  );
}
