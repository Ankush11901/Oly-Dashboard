'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, X, Edit2, Trash2, Check,
  LayoutDashboard, BarChart2, Video, UserCog, FileText,
  Store, Shield, ChevronRight, Users,
  Activity, Download, Camera, KeyRound, ShieldCheck, LogIn,
} from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status    = 'Active' | 'On Leave' | 'Inactive';
type PermLevel = 'full' | 'view' | 'none';
type UserType  = 'admin' | 'regular';
type UserCategory = 'all' | 'admin' | 'regular';

interface Member {
  id: number;
  name: string;
  email: string;
  roleId: string;
  userType: UserType;
  location: string;
  storeAccess: string[];
  status: Status;
  avatar?: string;
  customPerms?: Record<string, PermLevel>;
}

interface RoleDef {
  id: string;
  name: string;
  description: string;
  color: string;
  userType: UserType;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_DEFS: RoleDef[] = [
  { id: 'super_admin',       name: 'Super Admin',       description: 'Full unrestricted access to all modules',    color: '#655BD3', userType: 'admin'   },
  { id: 'regional_director', name: 'Regional Director', description: 'Cross-store analytics & team oversight',      color: '#00CE9C', userType: 'admin'   },
  { id: 'store_manager',     name: 'Store Manager',     description: 'Full access to assigned store & team',        color: '#3B82F6', userType: 'regular' },
  { id: 'security_ops',      name: 'Security Ops',      description: 'Live feed monitoring & incident management',   color: '#F59E0B', userType: 'regular' },
  { id: 'staff',             name: 'Staff Associate',   description: 'Read-only dashboard & analytics access',       color: '#6B7280', userType: 'regular' },
];

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={13} strokeWidth={1.5} />,
  analytics: <BarChart2      size={13} strokeWidth={1.5} />,
  live_feed: <Video          size={13} strokeWidth={1.5} />,
  team:      <UserCog        size={13} strokeWidth={1.5} />,
  reports:   <FileText       size={13} strokeWidth={1.5} />,
};

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'live_feed', label: 'Live Feed' },
  { key: 'team',      label: 'Team' },
  { key: 'reports',   label: 'Reports' },
];

const DEFAULT_ROLE_PERMS: Record<string, Record<string, PermLevel>> = {
  super_admin:       { dashboard: 'full', analytics: 'full', live_feed: 'full', team: 'full',  reports: 'full' },
  regional_director: { dashboard: 'full', analytics: 'full', live_feed: 'full', team: 'view',  reports: 'full' },
  store_manager:     { dashboard: 'full', analytics: 'view', live_feed: 'full', team: 'view',  reports: 'view' },
  security_ops:      { dashboard: 'view', analytics: 'none', live_feed: 'full', team: 'none',  reports: 'view' },
  staff:             { dashboard: 'view', analytics: 'view', live_feed: 'view', team: 'none',  reports: 'view' },
};

const LOCATIONS = [
  'Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction',
  'Tampines Mall', 'Jurong Point', 'Northpoint City', 'Causeway Point', 'Singapore HQ',
];

const STATUS_CFG: Record<Status, { dot: string; color: string }> = {
  Active:     { dot: '#16A34A', color: '#16A34A' },
  'On Leave': { dot: '#D97706', color: '#D97706' },
  Inactive:   { dot: '#9CA3AF', color: '#9CA3AF' },
};

const PERM_CFG: Record<PermLevel, { label: string; bg: string; color: string; border: string }> = {
  full: { label: 'Full',      bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  view: { label: 'View',      bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  none: { label: 'No Access', bg: '#F9FAFB', color: '#9CA3AF', border: '#E5E7EB' },
};

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Aditi Sharma',  email: 'aditi.sharma@olyretail.com',  roleId: 'store_manager',     userType: 'regular', location: 'Marina Bay Sands', storeAccess: ['Marina Bay Sands', 'Orchard Central'],  status: 'Active',   avatar: 'https://i.pravatar.cc/68?img=47' },
  { id: 2, name: 'Jason Lee',     email: 'jason.lee@olyretail.com',     roleId: 'regional_director', userType: 'admin',   location: 'Singapore HQ',     storeAccess: ['Marina Bay Sands', 'VivoCity', 'Bugis Junction', 'Tampines Mall'], status: 'Active',  avatar: 'https://i.pravatar.cc/68?img=12' },
  { id: 3, name: 'Sarah Chen',    email: 'sarah.chen@olyretail.com',    roleId: 'staff',             userType: 'regular', location: 'Orchard Central',  storeAccess: ['Orchard Central'],                      status: 'On Leave', avatar: 'https://i.pravatar.cc/68?img=44' },
  { id: 4, name: 'Michael Tan',   email: 'michael.tan@olyretail.com',   roleId: 'security_ops',      userType: 'regular', location: 'VivoCity',         storeAccess: ['VivoCity', 'Bugis Junction'],            status: 'Active',   avatar: 'https://i.pravatar.cc/68?img=15' },
  { id: 5, name: 'Priya Nair',    email: 'priya.nair@olyretail.com',    roleId: 'super_admin',       userType: 'admin',   location: 'Singapore HQ',     storeAccess: LOCATIONS,                                status: 'Active',   avatar: 'https://i.pravatar.cc/68?img=49' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRoleDef(roleId: string): RoleDef {
  return ROLE_DEFS.find(r => r.id === roleId) ?? ROLE_DEFS[4];
}

function getEffectivePerms(member: Member): Record<string, PermLevel> {
  const base = DEFAULT_ROLE_PERMS[member.roleId] ?? DEFAULT_ROLE_PERMS['staff'];
  return { ...base, ...member.customPerms };
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// avatar bg colors by index
const AVATAR_COLORS = ['#655BD3', '#00CE9C', '#3B82F6', '#F59E0B', '#EC4899'];

// ── Access cell — pills + smart viewport-aware fixed popover ──────────────────
function AccessCell({ member }: { member: Member }) {
  const SHOW     = 2;
  const visible  = member.storeAccess.slice(0, SHOW);
  const overflow = member.storeAccess.length - SHOW;
  // Cap the displayed overflow label at 3 — avoids "+7 more" etc.
  const overflowLabel = Math.min(overflow, 3);

  const [open,   setOpen]   = useState(false);
  const [pos,    setPos]    = useState({ top: 0, left: 0 });
  const btnRef     = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Initial anchor: below button, horizontally centred
      setPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
    }
    setOpen(v => !v);
  };

  // After the popover renders, clamp it fully inside the viewport.
  // Prefer opening below; only flip above when there is genuinely not enough room.
  useEffect(() => {
    if (!open || !popoverRef.current || !btnRef.current) return;
    const el  = popoverRef.current;
    const btn = btnRef.current.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const GAP = 8;

    // Always try below first
    let newTop  = btn.bottom + 6;
    let newLeft = pos.left - box.width / 2;

    // Only flip above if it genuinely overflows AND there is more room above
    const spaceBelow = vh - btn.bottom - GAP;
    const spaceAbove = btn.top - GAP;
    if (box.height > spaceBelow && spaceAbove > spaceBelow) {
      newTop = btn.top - 6 - box.height;
    }
    if (newTop < GAP) newTop = GAP;

    // Clamp horizontal edges
    if (newLeft + box.width > vw - GAP) newLeft = vw - GAP - box.width;
    if (newLeft < GAP) newLeft = GAP;

    el.style.top       = `${newTop}px`;
    el.style.left      = `${newLeft}px`;
    el.style.transform = 'none';
  }, [open, pos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        btnRef.current     && !btnRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
      {visible.map(s => (
        <span key={s} style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
          background: '#F8F9FA', color: '#374151', border: '1px solid #E5E7EB',
          whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block',
        }}>
          {s}
        </span>
      ))}
      {overflow > 0 && (
        <button
          ref={btnRef}
          onClick={toggle}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
            background: open ? '#EDE9FE' : '#F5F3FF', color: '#655BD3',
            border: `1px solid ${open ? '#C4B5FD' : '#EDE9FE'}`,
            whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 120ms',
          }}
        >
          +{overflowLabel} more
        </button>
      )}

      {/* Viewport-aware fixed popover */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%)', // overridden by useEffect clamp
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            zIndex: 9999,
            minWidth: 210,
            padding: 12,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            More Stores
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {member.storeAccess.slice(SHOW, SHOW + overflowLabel).map(s => (
              <span key={s} style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: '#F8F9FA', color: '#374151', border: '1px solid #E5E7EB', display: 'block',
              }}>
                {s}
              </span>
            ))}
          </div>
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
  profile:  { bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' },
  password: { bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' },
  role:     { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  store:    { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  login:    { bg: '#F5F3FF', color: '#655BD3', border: '#DDD6FE' },
};

function getMockLogs(member: Member): LogEvent[] {
  const roleName = getRoleDef(member.roleId).name;
  return [
    { id: 1, type: 'login',    description: 'Logged in',                  detail: 'Successful login · Chrome · Singapore',           timestamp: '2026-05-28T08:01:00Z' },
    { id: 2, type: 'profile',  description: 'Profile picture updated',    detail: 'Avatar image changed',                            timestamp: '2026-05-20T14:32:00Z' },
    { id: 3, type: 'login',    description: 'Logged in',                  detail: 'Successful login · Safari · Singapore',           timestamp: '2026-05-15T17:45:00Z' },
    { id: 4, type: 'password', description: 'Password changed',           detail: 'Password reset via email link',                   timestamp: '2026-05-15T09:18:00Z' },
    { id: 5, type: 'role',     description: 'Role updated',               detail: `Role changed to ${roleName}`,                     timestamp: '2026-04-28T11:05:00Z' },
    { id: 6, type: 'store',    description: 'Store access modified',      detail: `${member.storeAccess.length} store(s) assigned`,  timestamp: '2026-04-14T16:40:00Z' },
    { id: 7, type: 'profile',  description: 'Profile picture updated',    detail: 'Avatar image changed',                            timestamp: '2026-03-12T13:22:00Z' },
    { id: 8, type: 'store',    description: 'Store access modified',      detail: 'Access to Bugis Junction revoked',                timestamp: '2026-03-05T10:10:00Z' },
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                {member.name} Activity Log
              </h3>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '3px 0 0' }}>
                All recorded account activity
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid #E5E7EB', background: '#FAFAFA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B7280', flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search activity..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 30, paddingRight: 12, height: 34,
                  border: '1.5px solid #E5E7EB', borderRadius: 8,
                  fontSize: 12.5, color: '#111827', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
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
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 34, paddingLeft: 12, paddingRight: 12,
                borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'white',
                color: '#374151', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 150ms ease', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              <Download size={12} strokeWidth={1.75} />
              Export
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '48px 0' }}>
              No activity matches your filters.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute', left: 17, top: 30, bottom: 30,
                width: 1.5, background: '#F0F0F0', zIndex: 0,
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
                      borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none',
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
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4 }}>
                        {log.description}
                      </p>
                      {log.detail && (
                        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0', lineHeight: 1.4 }}>
                          {log.detail}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ flexShrink: 0, textAlign: 'right', paddingTop: 2 }}>
                      <p style={{ fontSize: 12, color: '#374151', fontWeight: 500, margin: 0 }}>{date}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{time}</p>
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
      borderBottom: '1px solid #F3F4F6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: 120, flexShrink: 0 }}>
        <span style={{ color: '#9CA3AF', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{module}</span>
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
                border: `1.5px solid ${active ? cfg.border : '#E5E7EB'}`,
                background: active ? cfg.bg : 'white',
                color: active ? cfg.color : '#9CA3AF',
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
  name: '', email: '', roleId: 'store_manager', userType: 'regular' as UserType,
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
  const [tab, setTab] = useState<'details' | 'permissions'>('details');
  const [form, setForm] = useState(initial);
  const [perms, setPerms] = useState<Record<string, PermLevel>>(
    initial.customPerms ?? { ...DEFAULT_ROLE_PERMS[initial.roleId] ?? DEFAULT_ROLE_PERMS['staff'] }
  );

  const handleRoleChange = (roleId: string) => {
    const roleDef = ROLE_DEFS.find(r => r.id === roleId);
    setForm(f => ({ ...f, roleId, userType: roleDef?.userType ?? f.userType }));
    setPerms({ ...DEFAULT_ROLE_PERMS[roleId] ?? DEFAULT_ROLE_PERMS['staff'] });
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
  const filteredRoles = ROLE_DEFS.filter(r => r.userType === form.userType);

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box', background: 'white',
    transition: 'border-color 150ms ease',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%',
          maxWidth: 580,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div style={{
          padding: '20px 24px 0',
          flexShrink: 0,
          background: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                {mode === 'add' ? 'Add Team Member' : 'Edit Member'}
              </h3>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '3px 0 0' }}>
                {mode === 'add' ? 'Fill in details, assign a role, and configure access.' : 'Update member details and access permissions.'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid #E5E7EB', background: '#FAFAFA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B7280', flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Tab strip */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid #F3F4F6' }}>
            {(['details', 'permissions'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: '9px 18px',
                  fontSize: 13, fontWeight: tab === t ? 700 : 500,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: tab === t ? '#655BD3' : '#9CA3AF',
                  borderBottom: tab === t ? '2px solid #655BD3' : '2px solid transparent',
                  marginBottom: -1.5,
                  transition: 'color 150ms ease',
                }}
              >
                {t === 'details' ? 'User Details' : 'Permissions'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

          {tab === 'details' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name *</label>
                  <input
                    type="text" required autoFocus={mode === 'add'}
                    placeholder="e.g. Jane Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address *</label>
                  <input
                    type="email" required
                    placeholder="jane@olyretail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                </div>
              </div>

              {/* User Type segmented control */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>User Type</label>
                <div style={{
                  display: 'flex', gap: 0,
                  background: '#F3F4F6', borderRadius: 10, padding: 3,
                }}>
                  {(['admin', 'regular'] as UserType[]).map(ut => {
                    const active = form.userType === ut;
                    return (
                      <button
                        key={ut} type="button"
                        onClick={() => setForm(f => ({ ...f, userType: ut }))}
                        style={{
                          flex: 1, height: 34, borderRadius: 8,
                          border: 'none',
                          background: active ? 'white' : 'transparent',
                          color: active ? '#655BD3' : '#6B7280',
                          fontSize: 13, fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                          boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                          transition: 'all 150ms ease',
                        }}
                      >
                        {ut === 'admin' ? 'Admin User' : 'Regular User'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role — 3-column compact cards */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                  {filteredRoles.map(r => {
                    const active = form.roleId === r.id;
                    return (
                      <button
                        key={r.id} type="button"
                        onClick={() => handleRoleChange(r.id)}
                        style={{
                          padding: '10px 12px', borderRadius: 9,
                          border: `1.5px solid ${active ? r.color + '80' : '#E5E7EB'}`,
                          background: active ? r.color + '0D' : '#FAFAFA',
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: active ? r.color : '#111827', flex: 1 }}>{r.name}</span>
                          {active && <Check size={12} strokeWidth={2.5} style={{ color: r.color, flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>{r.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Primary Location</label>
                  <CustomSelect
                    value={form.location}
                    onChange={v => setForm(f => ({ ...f, location: v }))}
                    options={LOCATIONS.map(l => ({ value: l, label: l }))}
                    size="md"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={v => setForm(f => ({ ...f, status: v as Status }))}
                    options={(['Active', 'On Leave', 'Inactive'] as Status[]).map(s => ({ value: s, label: s }))}
                    size="md"
                  />
                </div>
              </div>

            </div>

          ) : (
            /* ── Permissions Tab ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Role context banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 9, marginBottom: 18,
                background: selectedRole.color + '0D',
                border: `1.5px solid ${selectedRole.color}30`,
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: selectedRole.color }}>
                  {selectedRole.name}
                </span>
                <span style={{ fontSize: 12, color: selectedRole.color, opacity: 0.7 }}>
                  — default permissions applied. Customise below.
                </span>
              </div>

              {/* Module toggles */}
              <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Module Access</p>
              {MODULES.map(m => (
                <PermToggleRow
                  key={m.key}
                  module={m.label}
                  icon={MODULE_ICONS[m.key]}
                  level={(perms[m.key] ?? 'none') as PermLevel}
                  onChange={l => setPerms(p => ({ ...p, [m.key]: l }))}
                />
              ))}

              {/* Store access */}
              <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 20, marginBottom: 10 }}>Store Access</p>
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
                        border: `1.5px solid ${active ? '#655BD3' : '#E5E7EB'}`,
                        background: active ? '#F5F3FF' : '#FAFAFA',
                        color: active ? '#655BD3' : '#6B7280',
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
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 24px 20px',
          borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            type="button" onClick={onClose}
            style={{
              flex: 1, height: 40, borderRadius: 9,
              border: '1.5px solid #E5E7EB', background: 'white',
              color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={e => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            style={{
              flex: 2, height: 40, borderRadius: 9,
              border: 'none', background: '#655BD3',
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
export default function TeamPage() {
  const [members,        setMembers]        = useState<Member[]>(INITIAL_MEMBERS);
  const [category,       setCategory]       = useState<UserCategory>('all');
  const [search,         setSearch]         = useState('');
  const [addOpen,        setAddOpen]        = useState(false);
  const [editMember,     setEditMember]     = useState<Member | null>(null);
  const [deleteId,       setDeleteId]       = useState<number | null>(null);
  const [activityMember, setActivityMember] = useState<Member | null>(null);

  const filtered = members.filter(m => {
    const matchesCategory =
      category === 'all' ||
      (category === 'admin'   && m.userType === 'admin') ||
      (category === 'regular' && m.userType === 'regular');
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

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

  const adminCount   = members.filter(m => m.userType === 'admin').length;
  const regularCount = members.filter(m => m.userType === 'regular').length;

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>

        {/* Category tabs — segmented control */}
        <div style={{
          display: 'flex', gap: 2,
          background: '#F3F4F6', borderRadius: 10, padding: 3,
        }}>
          {([
            { key: 'all',     label: 'All Users',     count: members.length },
            { key: 'admin',   label: 'Admin',         count: adminCount     },
            { key: 'regular', label: 'Regular',       count: regularCount   },
          ] as { key: UserCategory; label: string; count: number }[]).map(tab => {
            const active = category === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: active ? 'white' : 'transparent',
                  color: active ? '#111827' : '#6B7280',
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
                  background: active ? '#EEE9FF' : '#E5E7EB',
                  color: active ? '#655BD3' : '#9CA3AF',
                  transition: 'all 150ms ease',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 240, paddingLeft: 33, paddingRight: 12, height: 36,
                border: '1.5px solid #E5E7EB', borderRadius: 8,
                fontSize: 13, color: '#111827', outline: 'none',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#655BD3')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              height: 36, paddingLeft: 16, paddingRight: 16,
              borderRadius: 8, border: 'none', background: '#655BD3',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Member
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '24%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 136 }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1.5px solid #F0F0F0' }}>
              {(['Member Name', 'Role', 'Email', 'Access', 'Actions'] as const).map((h, i) => (
                <th key={i} style={{
                  padding: '11px 20px',
                  textAlign: i === 0 ? 'left' : 'center',
                  fontSize: 10.5, fontWeight: 700, color: '#9CA3AF',
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
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                  No members match your search.
                </td>
              </tr>
            )}
            {filtered.map((member, idx) => {
              const role   = getRoleDef(member.roleId);
              const sc     = STATUS_CFG[member.status];
              const bgColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <tr
                  key={member.id}
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid #F3F4F6', transition: 'background 120ms ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Member Name */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        letterSpacing: '0.02em', overflow: 'hidden',
                        border: '2px solid #E5E7EB',
                      }}>
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : getInitials(member.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px', borderRadius: 4,
                      fontSize: 10.5, fontWeight: 600,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      background: role.userType === 'admin' ? '#EEE9FF' : '#F1F5F9',
                      color: role.userType === 'admin' ? '#6D5FD5' : '#4B5563',
                      whiteSpace: 'nowrap',
                    }}>
                      {role.name}
                    </span>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{ fontSize: 12.5, color: '#6B7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </span>
                  </td>

                  {/* Access */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <AccessCell member={member} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 20px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        onClick={() => setEditMember(member)}
                        title="Edit member"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid #E5E7EB', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#655BD3', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; (e.currentTarget as HTMLElement).style.borderColor = '#DDD6FE'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                      >
                        <Edit2 size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setActivityMember(member)}
                        title="View activity log"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid #E5E7EB', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#00CE9C', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0FDF9'; (e.currentTarget as HTMLElement).style.borderColor = '#6EE7CF'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                      >
                        <Activity size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setDeleteId(member.id)}
                        title="Remove member"
                        style={{
                          width: 32, height: 32, borderRadius: 7,
                          border: '1.5px solid #E5E7EB', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#EF4444', transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.borderColor = '#FECACA'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
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

        <div style={{ padding: '10px 20px', borderTop: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            Showing {filtered.length} of {members.length} members
          </span>
        </div>
      </div>

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
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white"
            style={{ borderRadius: 16, width: 360, padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.16)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: '#EF4444' }} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Remove Member</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>This action cannot be undone.</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 22, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong>{members.find(m => m.id === deleteId)?.name}</strong> from the team? They will lose all access immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, height: 40, borderRadius: 9, border: '1.5px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
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
