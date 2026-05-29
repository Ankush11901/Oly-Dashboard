'use client';
import { useState, useRef } from 'react';
import { Users, MoreVertical, Plus, Search, X, Check, Edit2, Trash2 } from 'lucide-react';

type Status = 'Active' | 'On Leave' | 'Inactive';

interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
  status: Status;
  location: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Aditi Sharma',  role: 'Store Manager',     email: 'aditi.sharma@olyretail.com',  status: 'Active',   location: 'Marina Bay Sands' },
  { id: 2, name: 'Jason Lee',     role: 'Regional Director', email: 'jason.lee@olyretail.com',     status: 'Active',   location: 'Singapore HQ' },
  { id: 3, name: 'Sarah Chen',    role: 'Sales Associate',   email: 'sarah.chen@olyretail.com',    status: 'On Leave', location: 'Orchard Central' },
  { id: 4, name: 'Michael Tan',   role: 'Security Ops',      email: 'michael.tan@olyretail.com',   status: 'Active',   location: 'VivoCity' },
];

const ROLES = ['Store Manager', 'Regional Director', 'Sales Associate', 'Security Ops', 'Staff Associate'];
const LOCATIONS = ['Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Singapore HQ'];
const STATUSES: Status[] = ['Active', 'On Leave', 'Inactive'];

const STATUS_CFG: Record<Status, { bg: string; color: string }> = {
  Active:    { bg: 'rgba(22,163,74,0.1)',  color: '#16A34A' },
  'On Leave':{ bg: 'rgba(217,119,6,0.1)', color: '#D97706' },
  Inactive:  { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
};

const BLANK_FORM = { name: '', role: 'Store Manager', email: '', status: 'Active' as Status, location: 'Marina Bay Sands' };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState(BLANK_FORM);
  const [saved, setSaved] = useState(false);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const header = ['Name', 'Role', 'Email', 'Status', 'Location'];
    const rows = members.map(m => [m.name, m.role, m.email, m.status, m.location]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.email.trim()) return;
    setMembers(prev => [...prev, { ...newForm, id: Date.now() }]);
    setNewForm(BLANK_FORM);
    setAddOpen(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setMembers(prev => prev.map(m => m.id === editMember.id ? editMember : m));
    setEditMember(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    setMembers(prev => prev.filter(m => m.id !== deleteId));
    setDeleteId(null);
    setMenuOpen(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Staff / Team</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(101,91,211,0.1)', color: 'var(--color-primary)' }}>
            {members.length} members
          </span>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-colors"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus size={16} strokeWidth={2} /> Add Team Member
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-2.5" style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm font-medium border rounded-md transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Name</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Role</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Location</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: 'var(--color-text-3)' }}>
                    No team members match your search.
                  </td>
                </tr>
              ) : filtered.map((member, idx) => {
                const sc = STATUS_CFG[member.status];
                return (
                  <tr
                    key={member.id}
                    className="transition-colors"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>{member.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-2)' }}>{member.role}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-2)' }}>{member.location}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: sc.bg, color: sc.color }}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                          className="p-1.5 rounded-md hover:bg-gray-100"
                          style={{ color: 'var(--color-text-3)' }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === member.id && (
                          <div
                            className="absolute right-0 z-20 rounded-lg shadow-lg border py-1"
                            style={{ top: '100%', marginTop: 4, minWidth: 140, borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                          >
                            <button
                              onClick={() => { setEditMember(member); setMenuOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left"
                              style={{ color: 'var(--color-text-2)' }}
                            >
                              <Edit2 size={13} strokeWidth={1.5} /> Edit
                            </button>
                            <button
                              onClick={() => { setDeleteId(member.id); setMenuOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-left"
                              style={{ color: '#DC2626' }}
                            >
                              <Trash2 size={13} strokeWidth={1.5} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Click-away for menu */}
      {menuOpen !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}

      {/* Add Member Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.6)' }} onClick={() => setAddOpen(false)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md p-7" style={{ background: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Add Team Member</h3>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-4)' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Full Name</label>
                <input type="text" required placeholder="e.g. Jane Smith" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Email Address</label>
                <input type="email" required placeholder="e.g. jane.smith@olyretail.com" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Role</label>
                  <select value={newForm.role} onChange={e => setNewForm(f => ({ ...f, role: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Status</label>
                  <select value={newForm.status} onChange={e => setNewForm(f => ({ ...f, status: e.target.value as Status }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Location</label>
                <select value={newForm.location} onChange={e => setNewForm(f => ({ ...f, location: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-primary)' }}>Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.6)' }} onClick={() => setEditMember(null)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md p-7" style={{ background: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Edit Team Member</h3>
              <button onClick={() => setEditMember(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-4)' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Full Name</label>
                <input type="text" required value={editMember.name} onChange={e => setEditMember(m => m ? { ...m, name: e.target.value } : m)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Email Address</label>
                <input type="email" required value={editMember.email} onChange={e => setEditMember(m => m ? { ...m, email: e.target.value } : m)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Role</label>
                  <select value={editMember.role} onChange={e => setEditMember(m => m ? { ...m, role: e.target.value } : m)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Status</label>
                  <select value={editMember.status} onChange={e => setEditMember(m => m ? { ...m, status: e.target.value as Status } : m)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Location</label>
                <select value={editMember.location} onChange={e => setEditMember(m => m ? { ...m, location: e.target.value } : m)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', background: 'var(--color-surface)' }}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditMember(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-primary)' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.6)' }} onClick={() => setDeleteId(null)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-sm p-7" style={{ background: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-error-light)' }}>
                <Trash2 size={16} style={{ color: '#DC2626' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Remove Member</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
              Are you sure you want to remove <strong>{members.find(m => m.id === deleteId)?.name}</strong> from the team? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#DC2626' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
