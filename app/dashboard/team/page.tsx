'use client';
import React, { useState } from 'react';
import {
  Plus, Search, X, Edit2, Trash2, ChevronDown, ChevronUp,
  Check, Eye, Minus, ShieldCheck, ExternalLink,
  LayoutDashboard, BarChart2, Video, UserCog, Settings2, FileText,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status    = 'Active' | 'On Leave' | 'Inactive';
type PermLevel = 'full' | 'view' | 'none';

interface Member {
  id: number;
  name: string;
  roleId: string;
  email: string;
  status: Status;
  location: string;
}

interface RoleDef {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
}

interface ModulePerm {
  module: string;
  icon: React.ReactNode;
  level: PermLevel;
}

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLE_DEFS: RoleDef[] = [
  { id: 'super_admin',       name: 'Super Admin',       description: 'Full unrestricted access',              color: '#655BD3', isSystem: true  },
  { id: 'regional_director', name: 'Regional Director', description: 'Cross-store analytics & team oversight', color: '#00CE9C', isSystem: false },
  { id: 'store_manager',     name: 'Store Manager',     description: 'Full access to assigned store & team',   color: '#3B82F6', isSystem: false },
  { id: 'security_ops',      name: 'Security Ops',      description: 'Live feed monitoring & incident ops',    color: '#F59E0B', isSystem: false },
  { id: 'staff',             name: 'Staff Associate',   description: 'Read-only dashboard access',             color: '#6B7280', isSystem: false },
];

const I = {
  dash:     <LayoutDashboard size={12} strokeWidth={1.5} />,
  analytics:<BarChart2 size={12} strokeWidth={1.5} />,
  feed:     <Video size={12} strokeWidth={1.5} />,
  team:     <UserCog size={12} strokeWidth={1.5} />,
  prefs:    <Settings2 size={12} strokeWidth={1.5} />,
  reports:  <FileText size={12} strokeWidth={1.5} />,
};

const ROLE_PERMS: Record<string, ModulePerm[]> = {
  super_admin:       [
    { module: 'Dashboard',  icon: I.dash,      level: 'full' },
    { module: 'Analytics',  icon: I.analytics, level: 'full' },
    { module: 'Live Feed',  icon: I.feed,      level: 'full' },
    { module: 'Team',       icon: I.team,      level: 'full' },
    { module: 'Reports',    icon: I.reports,   level: 'full' },
  ],
  regional_director: [
    { module: 'Dashboard',  icon: I.dash,      level: 'full' },
    { module: 'Analytics',  icon: I.analytics, level: 'full' },
    { module: 'Live Feed',  icon: I.feed,      level: 'full' },
    { module: 'Team',       icon: I.team,      level: 'view' },
    { module: 'Reports',    icon: I.reports,   level: 'full' },
  ],
  store_manager:     [
    { module: 'Dashboard',  icon: I.dash,      level: 'full' },
    { module: 'Analytics',  icon: I.analytics, level: 'view' },
    { module: 'Live Feed',  icon: I.feed,      level: 'full' },
    { module: 'Team',       icon: I.team,      level: 'view' },
    { module: 'Reports',    icon: I.reports,   level: 'view' },
  ],
  security_ops:      [
    { module: 'Dashboard',  icon: I.dash,      level: 'view' },
    { module: 'Analytics',  icon: I.analytics, level: 'none' },
    { module: 'Live Feed',  icon: I.feed,      level: 'full' },
    { module: 'Team',       icon: I.team,      level: 'none' },
    { module: 'Reports',    icon: I.reports,   level: 'view' },
  ],
  staff:             [
    { module: 'Dashboard',  icon: I.dash,      level: 'view' },
    { module: 'Analytics',  icon: I.analytics, level: 'view' },
    { module: 'Live Feed',  icon: I.feed,      level: 'view' },
    { module: 'Team',       icon: I.team,      level: 'none' },
    { module: 'Reports',    icon: I.reports,   level: 'view' },
  ],
};

// ── Static data ───────────────────────────────────────────────────────────────
const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Aditi Sharma',  roleId: 'store_manager',     email: 'aditi.sharma@olyretail.com',  status: 'Active',   location: 'Marina Bay Sands' },
  { id: 2, name: 'Jason Lee',     roleId: 'regional_director', email: 'jason.lee@olyretail.com',     status: 'Active',   location: 'Singapore HQ'     },
  { id: 3, name: 'Sarah Chen',    roleId: 'staff',             email: 'sarah.chen@olyretail.com',    status: 'On Leave', location: 'Orchard Central'  },
  { id: 4, name: 'Michael Tan',   roleId: 'security_ops',      email: 'michael.tan@olyretail.com',   status: 'Active',   location: 'VivoCity'         },
];

const LOCATIONS = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Singapore HQ'];
const STATUSES: Status[] = ['Active', 'On Leave', 'Inactive'];

const STATUS_CFG: Record<Status, { bg: string; color: string }> = {
  Active:     { bg: 'rgba(22,163,74,0.1)',   color: '#16A34A' },
  'On Leave': { bg: 'rgba(217,119,6,0.1)',   color: '#D97706' },
  Inactive:   { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
};

const PERM_CFG: Record<PermLevel, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  full: { label: 'Full',  bg: '#EEE9FF', color: '#655BD3', icon: <Check size={9} strokeWidth={2.5} /> },
  view: { label: 'View',  bg: '#DBEAFE', color: '#2563EB', icon: <Eye   size={9} strokeWidth={2}   /> },
  none: { label: 'None',  bg: '#F3F4F6', color: '#9CA3AF', icon: <Minus size={9} strokeWidth={2.5} /> },
};

const BLANK = { name: '', roleId: 'store_manager', email: '', status: 'Active' as Status, location: 'Marina Bay Sands' };

// ── Permissions preview strip ─────────────────────────────────────────────────
function PermStrip({ roleId }: { roleId: string }) {
  const perms = ROLE_PERMS[roleId] ?? ROLE_PERMS['staff'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {perms.map(p => {
        const cfg = PERM_CFG[p.level];
        return (
          <span key={p.module} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
            background: cfg.bg, color: cfg.color,
          }}>
            <span style={{ opacity: 0.8 }}>{p.icon}</span>
            {p.module}
            <span style={{ opacity: 0.6, fontSize: 9, fontWeight: 700, marginLeft: 1 }}>
              {cfg.label.toUpperCase()}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ── Member form (shared by Add + Edit) ───────────────────────────────────────
function MemberForm({
  title, form, setForm, onSubmit, onClose, submitLabel,
}: {
  title: string;
  form: typeof BLANK & { id?: number };
  setForm: (f: typeof BLANK) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
}) {
  const assignableRoles = ROLE_DEFS.filter(r => !r.isSystem);
  const selectedRole    = ROLE_DEFS.find(r => r.id === form.roleId) ?? ROLE_DEFS[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.55)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full"
        style={{ maxWidth: 480, padding: '28px 28px 24px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#9CA3AF' }}><X size={16} /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Full Name</label>
            <input
              type="text" required autoFocus
              placeholder="e.g. Jane Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{ border: '1px solid #E5E7EB', color: '#111827' }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email</label>
            <input
              type="email" required
              placeholder="jane.smith@olyretail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{ border: '1px solid #E5E7EB', color: '#111827' }}
            />
          </div>

          {/* Role + permissions preview */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Role</label>
            <select
              value={form.roleId}
              onChange={e => setForm({ ...form, roleId: e.target.value })}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{ border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}
            >
              {assignableRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>{selectedRole.description}</p>

            {/* Live permissions preview */}
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Access granted by this role
              </p>
              <PermStrip roleId={form.roleId} />
            </div>
          </div>

          {/* Location + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Location</label>
              <select
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}
              >
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Status })}
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                style={{ border: '1px solid #E5E7EB', color: '#111827', background: 'white' }}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#655BD3' }}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [members,    setMembers]    = useState<Member[]>(INITIAL_MEMBERS);
  const [search,     setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addOpen,    setAddOpen]    = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteId,   setDeleteId]   = useState<number | null>(null);
  const [addForm,    setAddForm]    = useState<typeof BLANK>({ ...BLANK });

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleDef = (roleId: string) => ROLE_DEFS.find(r => r.id === roleId) ?? ROLE_DEFS[4];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    setMembers(prev => [...prev, { ...addForm, id: Date.now() }]);
    setAddForm({ ...BLANK });
    setAddOpen(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setMembers(prev => prev.map(m => m.id === editMember.id ? editMember : m));
    setEditMember(null);
  };

  const handleDelete = () => {
    setMembers(prev => prev.filter(m => m.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Team Members</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(101,91,211,0.1)', color: '#655BD3' }}>
            {members.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/team/permissions"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid #E5E7EB', color: '#374151', textDecoration: 'none' }}
          >
            <ShieldCheck size={14} strokeWidth={1.5} style={{ color: '#655BD3' }} />
            Manage Roles
            <ExternalLink size={11} strokeWidth={1.5} style={{ color: '#D1D5DB' }} />
          </Link>
          <button
            onClick={() => { setAddForm({ ...BLANK }); setAddOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#655BD3', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} strokeWidth={2} />
            Add Member
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Search bar */}
        <div className="px-5 py-3 border-b flex items-center" style={{ borderColor: '#F3F4F6' }}>
          <div className="relative" style={{ width: 260 }}>
            <Search size={13} className="absolute left-3 top-2.5" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: '#E5E7EB', color: '#111827' }}
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Member</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Role</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Location</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>
                  No members match your search.
                </td>
              </tr>
            )}
            {filtered.map((member, idx) => {
              const sc       = STATUS_CFG[member.status];
              const role     = getRoleDef(member.roleId);
              const expanded = expandedId === member.id;

              return (
                <React.Fragment key={member.id}>
                  {/* ── Main row ── */}
                  <tr
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}
                    onClick={() => setExpandedId(expanded ? null : member.id)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {/* Member */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: role.color }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#111827' }}>{member.name}</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3.5">
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                        background: role.color + '18', color: role.color,
                      }}>
                        {role.name}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-3.5 text-sm" style={{ color: '#6B7280' }}>{member.location}</td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: sc.bg, color: sc.color }}>
                        {member.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setEditMember(member)}
                          className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                          style={{ color: '#9CA3AF', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteId(member.id)}
                          className="p-1.5 rounded-md transition-colors hover:bg-red-50"
                          style={{ color: '#9CA3AF', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                        <span style={{ color: expanded ? '#655BD3' : '#D1D5DB', display: 'flex', marginLeft: 2 }}>
                          {expanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded permissions row ── */}
                  {expanded && (
                    <tr style={{ background: '#FAFAFA' }}>
                      <td colSpan={5} style={{ padding: '12px 24px 14px 60px', borderTop: '1px dashed #EBEBEB' }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                          Access — {role.name}
                        </p>
                        <PermStrip roleId={member.roleId} />
                        <Link
                          href="/dashboard/team/permissions"
                          className="inline-flex items-center gap-1 mt-2.5"
                          style={{ fontSize: 11, color: '#655BD3', textDecoration: 'none' }}
                        >
                          Edit role permissions <ExternalLink size={10} strokeWidth={1.5} />
                        </Link>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {addOpen && (
        <MemberForm
          title="Add Team Member"
          form={addForm}
          setForm={setAddForm}
          onSubmit={handleAdd}
          onClose={() => setAddOpen(false)}
          submitLabel="Add Member"
        />
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <MemberForm
          title="Edit Member"
          form={editMember}
          setForm={f => setEditMember({ ...editMember, ...f })}
          onSubmit={handleEditSave}
          onClose={() => setEditMember(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.55)' }} onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FEE2E2' }}>
                <Trash2 size={16} style={{ color: '#DC2626' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: '#111827' }}>Remove Member</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Remove <strong>{members.find(m => m.id === deleteId)?.name}</strong> from the team? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#DC2626', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
