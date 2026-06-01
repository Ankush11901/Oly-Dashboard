'use client';
import { useState } from 'react';
import {
  ShieldCheck, Plus, Users, Edit2, Trash2, Check, Eye, Minus, X,
  LayoutDashboard, BarChart2, Video, UserCog, Settings2, FileText, Lock,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type PermLevel = 'full' | 'view' | 'none';

interface RoleDef {
  id: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  isSystem: boolean;
}

interface ActionPerm {
  label: string;
  level: PermLevel;
}

interface ModulePerm {
  module: string;
  icon: React.ReactNode;
  actions: ActionPerm[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ROLES: RoleDef[] = [
  { id: 'admin', name: 'Admin', description: 'Full access across all regions and stores', color: 'var(--color-primary)', userCount: 2, isSystem: true },
  { id: 'regional_manager', name: 'Regional Manager', description: 'Access to stores in assigned region', color: '#3B82F6', userCount: 3, isSystem: false },
  { id: 'store_manager', name: 'Store Manager', description: 'Access to assigned store only', color: '#00CE9C', userCount: 8, isSystem: false },
];

function makeModules(perms: [string, React.ReactNode, [string, PermLevel][]][]): ModulePerm[] {
  return perms.map(([module, icon, actions]) => ({
    module,
    icon,
    actions: actions.map(([label, level]) => ({ label, level })),
  }));
}

const I = {
  dash:     <LayoutDashboard size={15} strokeWidth={1.5} />,
  analytics:<BarChart2 size={15} strokeWidth={1.5} />,
  feed:     <Video size={15} strokeWidth={1.5} />,
  team:     <UserCog size={15} strokeWidth={1.5} />,
  prefs:    <Settings2 size={15} strokeWidth={1.5} />,
  reports:  <FileText size={15} strokeWidth={1.5} />,
};

const PERM_MATRIX: Record<string, ModulePerm[]> = {
  admin: makeModules([
    ['Dashboard',       I.dash,     [['View',            'full'], ['Edit Layout',       'full']]],
    ['Analytics',       I.analytics,[['View Reports',    'full'], ['Export Data',       'full'], ['Custom Widgets', 'full']]],
    ['Live Feed',       I.feed,     [['View Cameras',    'full'], ['Control PTZ',       'full'], ['Download Footage','full']]],
    ['Team Management', I.team,     [['View Team',       'full'], ['Add / Remove Members','full'],['Manage Roles',  'full']]],
    ['Preferences',     I.prefs,    [['View Settings',   'full'], ['Edit Settings',     'full']]],
    ['Reports',         I.reports,  [['View Reports',    'full'], ['Export Reports',    'full'], ['Schedule Reports','full']]],
  ]),
  regional_manager: makeModules([
    ['Dashboard',       I.dash,     [['View',            'full'], ['Edit Layout',       'view']]],
    ['Analytics',       I.analytics,[['View Reports',    'full'], ['Export Data',       'full'], ['Custom Widgets', 'view']]],
    ['Live Feed',       I.feed,     [['View Cameras',    'full'], ['Control PTZ',       'none'], ['Download Footage','view']]],
    ['Team Management', I.team,     [['View Team',       'full'], ['Add / Remove Members','view'],['Manage Roles',  'none']]],
    ['Preferences',     I.prefs,    [['View Settings',   'full'], ['Edit Settings',     'none']]],
    ['Reports',         I.reports,  [['View Reports',    'full'], ['Export Reports',    'full'], ['Schedule Reports','view']]],
  ]),
  store_manager: makeModules([
    ['Dashboard',       I.dash,     [['View',            'full'], ['Edit Layout',       'full']]],
    ['Analytics',       I.analytics,[['View Reports',    'full'], ['Export Data',       'view'], ['Custom Widgets', 'none']]],
    ['Live Feed',       I.feed,     [['View Cameras',    'full'], ['Control PTZ',       'none'], ['Download Footage','none']]],
    ['Team Management', I.team,     [['View Team',       'full'], ['Add / Remove Members','view'],['Manage Roles',  'none']]],
    ['Preferences',     I.prefs,    [['View Settings',   'full'], ['Edit Settings',     'view']]],
    ['Reports',         I.reports,  [['View Reports',    'full'], ['Export Reports',    'view'], ['Schedule Reports','none']]],
  ]),
};

// ── Config ────────────────────────────────────────────────────────────────────
const LEVEL_CFG: Record<PermLevel, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  full: { label: 'Full',  bg: 'var(--color-primary-light)', text: 'var(--color-primary)', icon: <Check size={10} strokeWidth={2.5} /> },
  view: { label: 'View',  bg: 'var(--color-info-light)',    text: '#2563EB', icon: <Eye   size={10} strokeWidth={2}   /> },
  none: { label: 'None',  bg: 'var(--color-surface-2)',     text: 'var(--color-text-4)', icon: <Minus size={10} strokeWidth={2.5} /> },
};

function moduleAccessLevel(mod: ModulePerm): PermLevel {
  const levels = mod.actions.map(a => a.level);
  if (levels.every(l => l === 'full')) return 'full';
  if (levels.every(l => l === 'none')) return 'none';
  return 'view';
}

// ── Shared components ─────────────────────────────────────────────────────────
function PermBadge({ level }: { level: PermLevel }) {
  const c = LEVEL_CFG[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {c.icon}{c.label}
    </span>
  );
}

// iOS-style segmented control
function PermToggle({ level, onChange, disabled }: { level: PermLevel; onChange: (l: PermLevel) => void; disabled: boolean }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--color-surface-2)',
      borderRadius: 9, padding: 2, gap: 1, flexShrink: 0,
    }}>
      {(['full', 'view', 'none'] as PermLevel[]).map(l => {
        const c = LEVEL_CFG[l];
        const active = level === l;
        return (
          <button
            key={l}
            onClick={() => !disabled && onChange(l)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 11px', borderRadius: 7, border: 'none',
              fontSize: 11, fontWeight: active ? 700 : 400,
              background: active ? 'var(--color-surface)' : 'transparent',
              color: active ? c.text : 'var(--color-text-4)',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 120ms ease',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {c.icon}{c.label}
          </button>
        );
      })}
    </div>
  );
}

const ROLE_COLORS = ['var(--chart-1)', 'var(--chart-4)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-5)', 'var(--chart-6)', 'var(--color-error)'];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [perms, setPerms] = useState<Record<string, ModulePerm[]>>(PERM_MATRIX);
  const [roles, setRoles] = useState<RoleDef[]>(ROLES);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDef | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  // Create role form
  const [newRole, setNewRole] = useState({ name: '', description: '', color: ROLE_COLORS[1] });

  const role = roles.find(r => r.id === selectedRole) ?? roles[0];
  const modules = perms[selectedRole] ?? perms['store_manager'] ?? [];
  const totalUsers = roles.reduce((s, r) => s + r.userCount, 0);

  const updatePerm = (moduleIdx: number, actionIdx: number, level: PermLevel) => {
    setPerms(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map((m, mi) =>
        mi !== moduleIdx ? m : {
          ...m,
          actions: m.actions.map((a, ai) => ai !== actionIdx ? a : { ...a, level }),
        }
      ),
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;
    const id = newRole.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const created: RoleDef = { id, name: newRole.name, description: newRole.description, color: newRole.color, userCount: 0, isSystem: false };
    setRoles(prev => [...prev, created]);
    setPerms(prev => ({ ...prev, [id]: prev['store_manager'] ?? [] }));
    setSelectedRole(id);
    setNewRole({ name: '', description: '', color: ROLE_COLORS[1] });
    setCreateOpen(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRole) return;
    setRoles(prev => prev.map(r => r.id === editRole.id ? editRole : r));
    setEditRole(null);
  };

  const handleDeleteRole = () => {
    if (!deleteRoleId) return;
    setRoles(prev => prev.filter(r => r.id !== deleteRoleId));
    setPerms(prev => { const next = { ...prev }; delete next[deleteRoleId]; return next; });
    if (selectedRole === deleteRoleId) setSelectedRole('admin');
    setDeleteRoleId(null);
  };

  const handleSaveChanges = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleResetDefault = () => {
    if (PERM_MATRIX[selectedRole]) {
      setPerms(prev => ({ ...prev, [selectedRole]: PERM_MATRIX[selectedRole] }));
    }
  };

  return (
    <div className="p-8" style={{ maxWidth: 1200 }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={20} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-1)', lineHeight: 1.2 }}>Permissions</h1>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 1 }}>
              Manage role-based access control across all modules
            </p>
          </div>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white"
          style={{ padding: '8px 16px', borderRadius: 9, background: 'var(--color-primary-emphasis)', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Create Role
        </button>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Roles',   value: roles.length,                          color: 'var(--color-primary)', bg: 'var(--color-primary-light)', icon: <ShieldCheck size={16} strokeWidth={1.5} /> },
          { label: 'System Roles',  value: roles.filter(r => r.isSystem).length,  color: 'var(--color-text-3)', bg: 'var(--color-surface-2)', icon: <Lock size={16} strokeWidth={1.5} /> },
          { label: 'Custom Roles',  value: roles.filter(r => !r.isSystem).length, color: '#3B82F6', bg: 'var(--color-info-light)', icon: <ShieldCheck size={16} strokeWidth={1.5} /> },
          { label: 'Total Members', value: totalUsers,                             color: '#00CE9C', bg: '#CCFBF1', icon: <Users size={16} strokeWidth={1.5} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: s.color,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</p>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-3)', marginTop: 1 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Horizontal role selector ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Select Role
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{roles.length} roles</p>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {roles.map((r, idx) => {
            const active = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '16px 22px', border: 'none',
                  borderRight: idx < roles.length - 1 ? '1px solid var(--color-border)' : 'none',
                  borderBottom: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left',
                  minWidth: 175, flexShrink: 0,
                  background: active ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Role avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: active ? r.color : r.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10, transition: 'all 150ms',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: active ? 'white' : r.color }}>
                    {r.name.charAt(0)}
                  </span>
                </div>
                {/* Role name */}
                <p style={{
                  fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, marginBottom: 3,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-1)',
                }}>
                  {r.name}
                </p>
                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                    {r.userCount} member{r.userCount !== 1 ? 's' : ''}
                  </span>
                  {r.isSystem && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 2,
                      fontSize: 8.5, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                      background: 'var(--color-surface-2)', color: 'var(--color-text-4)',
                    }}>
                      <Lock size={7} strokeWidth={2.5} />SYS
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Add role placeholder */}
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '16px 28px', border: 'none', cursor: 'pointer', background: 'transparent',
              minWidth: 100, gap: 8,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              border: '1.5px dashed var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={15} strokeWidth={2} style={{ color: 'var(--color-text-4)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-4)' }}>New Role</span>
          </button>
        </div>
      </div>

      {/* ── Permission editor ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Role context header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: role.color + '08',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Large role avatar */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: role.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{role.name.charAt(0)}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-1)' }}>{role.name}</p>
                {role.isSystem && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: 'var(--color-surface-2)', color: 'var(--color-text-3)',
                  }}>
                    <Lock size={8} strokeWidth={2.5} />SYSTEM ROLE
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{role.description}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, background: 'var(--color-surface-2)',
            }}>
              <Users size={12} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)' }}>
                {role.userCount} member{role.userCount !== 1 ? 's' : ''}
              </span>
            </div>
            {!role.isSystem && (
              <>
                <button
                  onClick={() => setEditRole(role)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 500,
                    color: 'var(--color-text-2)', background: 'var(--color-surface)', cursor: 'pointer',
                  }}
                >
                  <Edit2 size={12} strokeWidth={1.5} />Edit Role
                </button>
                <button
                  onClick={() => setDeleteRoleId(role.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    border: '1px solid var(--color-error-light)', fontSize: 12, fontWeight: 500,
                    color: '#DC2626', background: 'var(--color-error-light)', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} strokeWidth={1.5} />Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          padding: '9px 24px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-surface)', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
            Access levels:
          </span>
          {(['full', 'view', 'none'] as PermLevel[]).map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PermBadge level={l} />
              <span style={{ fontSize: 11, color: 'var(--color-text-4)' }}>
                {l === 'full' ? '— unrestricted' : l === 'view' ? '— read-only' : '— no access'}
              </span>
            </div>
          ))}
          {role.isSystem && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-4)' }}>
              <Lock size={10} strokeWidth={2} />System roles cannot be modified
            </span>
          )}
        </div>

        {/* Module sections */}
        {modules.map((mod, moduleIdx) => {
          const summary    = moduleAccessLevel(mod);
          const summaryBg  = summary === 'full' ? 'var(--color-primary-light)' : summary === 'view' ? 'var(--color-info-light)' : 'var(--color-surface-2)';
          const summaryClr = summary === 'full' ? 'var(--color-primary)' : summary === 'view' ? 'var(--color-info)' : 'var(--color-text-4)';

          return (
            <div
              key={mod.module}
              style={{
                borderBottom: moduleIdx < modules.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              {/* Module header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: summaryBg, color: summaryClr,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 200ms',
                }}>
                  {mod.icon}
                </div>
                <p style={{
                  flex: 1, fontSize: 13.5, fontWeight: 700,
                  color: summary === 'none' ? 'var(--color-text-4)' : 'var(--color-text-1)',
                }}>
                  {mod.module}
                </p>
                <PermBadge level={summary} />
              </div>

              {/* Action rows — 2-column flex grid */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                paddingLeft: 66, paddingRight: 24, paddingTop: 10, paddingBottom: 14,
              }}>
                {mod.actions.map((action, actionIdx) => (
                  <div
                    key={action.label}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      padding: '9px 14px', borderRadius: 9,
                      background: action.level === 'none' ? 'transparent' : 'var(--color-surface)',
                      border: '1px solid',
                      borderColor: action.level === 'none' ? 'var(--color-border-subtle)' : 'var(--color-border)',
                      flex: '1 1 calc(50% - 4px)', minWidth: 260,
                      transition: 'all 150ms',
                    }}
                  >
                    <span style={{
                      fontSize: 12.5, fontWeight: 500,
                      color: action.level === 'none' ? 'var(--color-text-4)' : 'var(--color-text-2)',
                    }}>
                      {action.label}
                    </span>
                    <PermToggle
                      level={action.level}
                      disabled={role.isSystem}
                      onChange={level => updatePerm(moduleIdx, actionIdx, level)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        {!role.isSystem && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-surface)',
          }}>
            <p style={{ fontSize: 11.5, color: 'var(--color-text-3)' }}>
              Changes apply immediately when saved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {savedMsg && (
                <span style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} strokeWidth={2.5} />Saved!
                </span>
              )}
              <button
                onClick={handleResetDefault}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  border: '1px solid var(--color-border)', fontSize: 13, fontWeight: 500,
                  color: 'var(--color-text-2)', background: 'var(--color-surface)', cursor: 'pointer',
                }}
              >
                Reset to Default
              </button>
              <button
                onClick={handleSaveChanges}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  border: 'none', fontSize: 13, fontWeight: 700,
                  color: '#fff', background: 'var(--color-primary-emphasis)', cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Role Modal ──────────────────────────────────────────────── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => setCreateOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ borderRadius: 16, width: '100%', maxWidth: 448, padding: 28 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Create New Role</h3>
              <button onClick={() => setCreateOpen(false)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--color-surface-2)', color: 'var(--color-text-4)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Role Name</label>
                <input type="text" required autoFocus placeholder="e.g. Data Analyst" value={newRole.name} onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Description <span style={{ fontWeight: 400, color: 'var(--color-text-4)' }}>(optional)</span></label>
                <input type="text" placeholder="Brief description of this role's access" value={newRole.description} onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-2)' }}>Colour</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLE_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewRole(r => ({ ...r, color: c }))} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: newRole.color === c ? '3px solid var(--color-text-1)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-4)' }}>Permissions start as a copy of Staff Associate. You can edit them after creation.</p>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-primary-emphasis)' }}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Role Modal ────────────────────────────────────────────────── */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => setEditRole(null)}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ borderRadius: 16, width: '100%', maxWidth: 448, padding: 28 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Edit Role</h3>
              <button onClick={() => setEditRole(null)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--color-surface-2)', color: 'var(--color-text-4)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Role Name</label>
                <input type="text" required value={editRole.name} onChange={e => setEditRole(r => r ? { ...r, name: e.target.value } : r)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>Description</label>
                <input type="text" value={editRole.description} onChange={e => setEditRole(r => r ? { ...r, description: e.target.value } : r)} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-2)' }}>Colour</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLE_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setEditRole(r => r ? { ...r, color: c } : r)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: editRole.color === c ? '3px solid var(--color-text-1)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditRole(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-primary-emphasis)' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Role Confirmation ───────────────────────────────────────── */}
      {deleteRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay" onClick={() => setDeleteRoleId(null)}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ borderRadius: 16, width: '100%', maxWidth: 384, padding: 28 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-error-light)' }}>
                <Trash2 size={16} style={{ color: '#DC2626' }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>Delete Role</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
              Are you sure you want to delete <strong>{roles.find(r => r.id === deleteRoleId)?.name}</strong>? Members with this role will lose access. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRoleId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)', background: 'var(--color-surface)' }}>Cancel</button>
              <button onClick={handleDeleteRole} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#DC2626' }}>Delete Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
