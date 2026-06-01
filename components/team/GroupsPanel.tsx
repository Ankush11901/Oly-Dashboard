'use client';
import { useState, useEffect } from 'react';
import {
  Plus, ArrowLeft, Edit2, Trash2, Search, LayoutGrid, List,
  Users, Check, X,
} from 'lucide-react';
import { RolePill } from '@/components/team/RolePill';
import { CustomSelect } from '@/components/CustomSelect';
import type { Member, TeamGroup, GroupViewLayout } from '@/lib/team-data';
import { getRoleDef, getInitials, groupMatchesSearch, LOCATIONS } from '@/lib/team-data';

const AVATAR_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)', 'var(--chart-5)'];

function GroupFormModal({
  mode,
  initial,
  members,
  onClose,
  onSave,
}: {
  mode: 'create' | 'edit';
  initial: { name: string; description: string; storeScope: string; memberIds: number[] };
  members: Member[];
  onClose: () => void;
  onSave: (data: typeof initial) => void;
}) {
  const [form, setForm] = useState(initial);

  const toggleMember = (id: number) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id) ? f.memberIds.filter(x => x !== id) : [...f.memberIds, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" style={{ backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div className="modal-panel" style={{ borderRadius: 18, width: '100%', maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>
            {mode === 'create' ? 'Create Group' : 'Edit Group'}
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-4)', margin: '4px 0 0' }}>Name the group and assign members.</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6 }}>Group name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. North Store Managers"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13, background: 'var(--color-surface-2)', color: 'var(--color-text-1)', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6 }}>Description</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13, background: 'var(--color-surface-2)', color: 'var(--color-text-1)', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6 }}>Store scope</label>
            <CustomSelect value={form.storeScope} onChange={v => setForm(f => ({ ...f, storeScope: v }))} options={[{ value: '', label: 'No specific store' }, ...LOCATIONS.map(l => ({ value: l, label: l }))]} size="md" />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Members ({form.memberIds.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {members.map(m => {
                const checked = form.memberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                      border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: checked ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: checked ? 'var(--color-primary-emphasis)' : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', flex: 1 }}>{m.name}</span>
                    <RolePill roleIdOrName={m.roleId} label={getRoleDef(m.roleId).name} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, height: 40, borderRadius: 9, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-2)' }}>Cancel</button>
          <button
            type="button"
            disabled={!form.name.trim()}
            onClick={() => { if (form.name.trim()) onSave(form); }}
            style={{ flex: 2, height: 40, borderRadius: 9, border: 'none', background: 'var(--color-primary-emphasis)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: form.name.trim() ? 1 : 0.5 }}
          >
            {mode === 'create' ? 'Create Group' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const AVATAR_SLOTS = 5;

function GroupCard({ group, members, onOpen }: { group: TeamGroup; members: Member[]; onOpen: () => void }) {
  const groupMembers = group.memberIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
  const overflow = Math.max(0, groupMembers.length - AVATAR_SLOTS);
  const avatarSize = 40;
  const overlap = 10;

  const slots: Array<Member | null> = Array.from({ length: AVATAR_SLOTS }, (_, i) => groupMembers[i] ?? null);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="card"
      style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--color-border-subtle)', transition: 'box-shadow 150ms ease, border-color 150ms ease', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
    >
      <div style={{ padding: '18px 18px 14px', flex: 1, textAlign: 'left' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            marginBottom: 12,
            minHeight: avatarSize,
          }}
        >
          {slots.map((m, i) => (
            <div
              key={m ? m.id : `empty-${i}`}
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: '50%',
                marginLeft: i === 0 ? 0 : -overlap,
                border: `2.5px solid ${m ? 'var(--color-surface)' : 'var(--color-border-subtle)'}`,
                background: m ? AVATAR_COLORS[i % AVATAR_COLORS.length] : 'var(--color-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: m ? '#fff' : 'var(--color-text-4)',
                fontSize: m ? 11 : 10,
                fontWeight: 700,
                overflow: 'hidden',
                flexShrink: 0,
                zIndex: AVATAR_SLOTS - i,
              }}
            >
              {m
                ? (m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(m.name))
                : '·'}
            </div>
          ))}
          {overflow > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', flexShrink: 0 }}>
              +{overflow}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-2)', margin: 0, fontWeight: 500 }}>
          Totally {groupMembers.length} Members
        </p>
        {group.description && (
          <p style={{ fontSize: 11.5, color: 'var(--color-text-3)', margin: '6px 0 0', lineHeight: 1.45 }}>
            {group.description}
          </p>
        )}
        {group.storeScope && (
          <p style={{ fontSize: 11, color: 'var(--color-text-4)', margin: '4px 0 0' }}>{group.storeScope}</p>
        )}
      </div>
      <div style={{ padding: '12px 18px', background: 'var(--color-primary-emphasis)', color: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{group.name}</p>
      </div>
    </button>
  );
}

function GroupDetailView({
  group,
  members,
  onBack,
  onEdit,
  onDelete,
  onEditMember,
  onRemoveFromGroup,
}: {
  group: TeamGroup;
  members: Member[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditMember: (m: Member) => void;
  onRemoveFromGroup: (memberId: number) => void;
}) {
  const [detailSearch, setDetailSearch] = useState('');
  const groupMembers = group.memberIds
    .map(id => members.find(m => m.id === id))
    .filter(Boolean) as Member[];
  const filtered = groupMembers.filter(m =>
    !detailSearch || m.name.toLowerCase().includes(detailSearch.toLowerCase()) || m.email.toLowerCase().includes(detailSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={onBack} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-2)' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>{group.name}</h2>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-4)', margin: '2px 0 0' }}>{groupMembers.length} members{group.storeScope ? ` · ${group.storeScope}` : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: '1.5px solid var(--color-error)', background: 'var(--color-error-light)', color: 'var(--color-error)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Trash2 size={14} /> Delete Group
          </button>
          <button type="button" onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Edit2 size={14} /> Edit Group
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-4)' }} />
          <input
            value={detailSearch}
            onChange={e => setDetailSearch(e.target.value)}
            placeholder="Search members in group..."
            style={{ width: '100%', paddingLeft: 33, height: 36, borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13, background: 'var(--color-surface-2)', color: 'var(--color-text-1)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table-surface" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1.5px solid var(--color-border-subtle)' }}>
              {['Name', 'Role', 'Email', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{m.name}</span>
                </td>
                <td style={{ padding: '12px 18px' }}><RolePill roleIdOrName={m.roleId} label={getRoleDef(m.roleId).name} /></td>
                <td style={{ padding: '12px 18px', fontSize: 12.5, color: 'var(--color-text-3)' }}>{m.email}</td>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => onEditMember(m)} title="Edit" style={{ width: 32, height: 32, borderRadius: 7, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={14} />
                    </button>
                    <button type="button" onClick={() => onRemoveFromGroup(m.id)} title="Remove from group" style={{ width: 32, height: 32, borderRadius: 7, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GroupsPanel({
  groups,
  setGroups,
  members,
  search,
  layout,
  onEditMember,
  createOpen,
  onCreateOpenChange,
}: {
  groups: TeamGroup[];
  setGroups: React.Dispatch<React.SetStateAction<TeamGroup[]>>;
  members: Member[];
  search: string;
  layout: GroupViewLayout;
  onEditMember: (m: Member) => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}) {
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState<'create' | 'edit' | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (createOpen && !viewingId) setFormOpen('create');
  }, [createOpen, viewingId]);

  const filteredGroups = groups.filter(g => groupMatchesSearch(g, members, search));
  const viewingGroup = viewingId != null ? groups.find(g => g.id === viewingId) : null;

  const handleSaveGroup = (data: { name: string; description: string; storeScope: string; memberIds: number[] }) => {
    if (formOpen === 'create') {
      setGroups(prev => [...prev, { id: Date.now(), name: data.name, description: data.description, storeScope: data.storeScope || undefined, memberIds: data.memberIds }]);
    } else if (formOpen === 'edit' && viewingGroup) {
      setGroups(prev => prev.map(g => g.id === viewingGroup.id ? { ...g, ...data, storeScope: data.storeScope || undefined } : g));
    }
    setFormOpen(null);
    onCreateOpenChange(false);
  };

  const closeForm = () => {
    setFormOpen(null);
    onCreateOpenChange(false);
  };

  if (viewingGroup) {
    return (
      <>
        <GroupDetailView
          group={viewingGroup}
          members={members}
          onBack={() => setViewingId(null)}
          onEdit={() => setFormOpen('edit')}
          onDelete={() => setDeleteId(viewingGroup.id)}
          onEditMember={onEditMember}
          onRemoveFromGroup={memberId => {
            setGroups(prev => prev.map(g => g.id === viewingGroup.id ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) } : g));
          }}
        />
        {formOpen === 'edit' && (
          <GroupFormModal
            mode="edit"
            initial={{ name: viewingGroup.name, description: viewingGroup.description ?? '', storeScope: viewingGroup.storeScope ?? '', memberIds: [...viewingGroup.memberIds] }}
            members={members}
            onClose={closeForm}
            onSave={handleSaveGroup}
          />
        )}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" style={{ backdropFilter: 'blur(2px)' }} onClick={() => setDeleteId(null)}>
            <div className="modal-panel" style={{ borderRadius: 16, width: 360, padding: 24 }} onClick={e => e.stopPropagation()}>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Delete group?</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 20 }}>Members will not be removed from the organisation.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setDeleteId(null)} style={{ flex: 1, height: 40, borderRadius: 9, border: '1.5px solid var(--color-border)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={() => { setGroups(prev => prev.filter(g => g.id !== deleteId)); setDeleteId(null); setViewingId(null); }} style={{ flex: 1, height: 40, borderRadius: 9, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {layout === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filteredGroups.map(g => (
            <GroupCard key={g.id} group={g} members={members} onOpen={() => setViewingId(g.id)} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table-surface" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                {['Group', 'Members', 'Store scope', ''].map(h => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map(g => {
                const count = g.memberIds.length;
                return (
                  <tr key={g.id} style={{ borderTop: '1px solid var(--color-border-subtle)', cursor: 'pointer' }} onClick={() => setViewingId(g.id)}>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{g.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 12.5, color: 'var(--color-text-3)' }}>{count} members</td>
                    <td style={{ padding: '14px 18px', fontSize: 12.5, color: 'var(--color-text-3)' }}>{g.storeScope ?? '—'}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Users size={14} style={{ color: 'var(--color-text-4)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filteredGroups.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-4)', fontSize: 13 }}>No groups match your search.</div>
      )}
      {formOpen === 'create' && (
        <GroupFormModal mode="create" initial={{ name: '', description: '', storeScope: '', memberIds: [] }} members={members} onClose={closeForm} onSave={handleSaveGroup} />
      )}
    </>
  );
}

export function GroupsToolbarExtras({
  layout,
  onLayoutChange,
  onCreateGroup,
}: {
  layout: GroupViewLayout;
  onLayoutChange: (l: GroupViewLayout) => void;
  onCreateGroup: () => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', background: 'var(--color-surface-2)', borderRadius: 8, padding: 3 }}>
        {([
          { key: 'grid' as const, icon: <LayoutGrid size={14} /> },
          { key: 'list' as const, icon: <List size={14} /> },
        ]).map(v => (
          <button
            key={v.key}
            type="button"
            onClick={() => onLayoutChange(v.key)}
            style={{
              width: 32, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: layout === v.key ? 'var(--color-surface)' : 'transparent',
              color: layout === v.key ? 'var(--color-text-1)' : 'var(--color-text-4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: layout === v.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {v.icon}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onCreateGroup}
        style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px',
          borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        <Plus size={14} strokeWidth={2.5} /> Create Group
      </button>
    </>
  );
}
