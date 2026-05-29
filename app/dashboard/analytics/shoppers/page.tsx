'use client';

import { useState } from 'react';
import {
  Users, TrendingUp, Clock, ArrowUpRight,
  Plus, X, Check, ChevronRight, Edit2, Trash2,
  ShieldCheck,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Criterion {
  id: string;
  label: string;
  description: string;
  value: number;
  unit: string;
}

interface QSProfile {
  id: string;
  name: string;
  description: string;
  criteria: Criterion[];
  isDefault?: boolean;
}

interface Shopper {
  initials: string;
  name: string;
  store: string;
  dwellMin: number;
  zones: number;
  visits: number;
}

// ── Static data ────────────────────────────────────────────────────────────────
const SHOPPERS: Shopper[] = [
  { initials: 'SL', name: 'Sarah L.',  store: 'Marina Bay Sands', dwellMin: 34, zones: 6, visits: 8  },
  { initials: 'JT', name: 'James T.',  store: 'VivoCity',         dwellMin: 28, zones: 5, visits: 12 },
  { initials: 'PM', name: 'Priya M.',  store: 'Orchard Central',  dwellMin: 22, zones: 4, visits: 6  },
  { initials: 'WH', name: 'Wei H.',    store: 'Tampines Mall',    dwellMin: 19, zones: 4, visits: 9  },
  { initials: 'AK', name: 'Aisha K.',  store: 'Bugis Junction',   dwellMin: 17, zones: 3, visits: 5  },
  { initials: 'RC', name: 'Ryan C.',   store: 'Jurong Point',     dwellMin: 16, zones: 3, visits: 7  },
  { initials: 'ML', name: 'Mei L.',    store: 'Northpoint City',  dwellMin: 15, zones: 3, visits: 4  },
];

const BASE_CRITERIA: Criterion[] = [
  { id: 'dwell',  label: 'Minimum Dwell Time',     description: 'Time visitor must spend inside store', value: 10, unit: 'min'        },
  { id: 'return', label: 'Return Visit Frequency',  description: 'Visits per month to qualify',          value: 2,  unit: 'visits/mo' },
  { id: 'zones',  label: 'Zone Engagement',         description: 'Distinct zones visited per session',   value: 3,  unit: 'zones'      },
];

const INITIAL_PROFILES: QSProfile[] = [
  {
    id: 'default',
    name: 'Standard Shopper',
    description: 'General qualification for all stores',
    isDefault: true,
    criteria: BASE_CRITERIA.map(c => ({ ...c })),
  },
  {
    id: 'premium',
    name: 'Premium Shopper',
    description: 'High-intent visitors for flagship stores',
    criteria: [
      { id: 'dwell',  label: 'Minimum Dwell Time',    description: 'Time visitor must spend inside store', value: 20, unit: 'min'       },
      { id: 'return', label: 'Return Visit Frequency', description: 'Visits per month to qualify',          value: 4,  unit: 'visits/mo' },
      { id: 'zones',  label: 'Zone Engagement',        description: 'Distinct zones visited per session',   value: 5,  unit: 'zones'     },
    ],
  },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, badge, icon, iconColor }: { label: string; value: string; badge: string; icon: React.ReactNode; iconColor: string }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor}18` }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.12)', color: '#16A34A' }}>
          <ArrowUpRight size={11} strokeWidth={2} />{badge}
        </span>
      </div>
      <p className="font-bold tabular-nums" style={{ fontSize: 26, color: 'var(--color-text-1)', lineHeight: 1.2 }}>{value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-3)' }}>{label}</p>
    </div>
  );
}

// ── New profile modal ──────────────────────────────────────────────────────────
function NewProfileModal({ onClose, onSave }: { onClose: () => void; onSave: (p: QSProfile) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>(BASE_CRITERIA.map(c => ({ ...c })));
  const [newRow, setNewRow] = useState({ label: '', unit: '', value: 5 });
  const [addingRow, setAddingRow] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: 13, borderRadius: 8,
    border: '1px solid var(--color-border)', padding: '8px 12px',
    color: 'var(--color-text-1)', background: 'var(--color-surface)', outline: 'none',
  };

  const updateVal = (id: string, val: number) =>
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, value: val } : c));

  const removeRow = (id: string) =>
    setCriteria(prev => prev.filter(c => c.id !== id));

  const addRow = () => {
    if (!newRow.label.trim()) return;
    setCriteria(prev => [...prev, {
      id: `custom-${Date.now()}`,
      label: newRow.label.trim(),
      description: '',
      value: newRow.value,
      unit: newRow.unit.trim(),
    }]);
    setNewRow({ label: '', unit: '', value: 5 });
    setAddingRow(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `profile-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      criteria,
    });
    onClose();
  };

  return (
    <div
      className="theme-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>New QS Profile</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-4)' }}>Define qualification criteria for this profile</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-4)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile name & description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Profile Name</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. High-Intent Shoppers"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Description <span style={{ color: 'var(--color-text-4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="Brief description of this profile"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
          </div>

          {/* Criteria table */}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Criteria</label>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
              {criteria.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--color-border-subtle)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{c.label}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={c.value}
                    onChange={e => updateVal(c.id, Number(e.target.value))}
                    style={{ width: 60, border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right', outline: 'none', background: 'var(--color-surface-2)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--color-text-4)', width: 72 }}>{c.unit}</span>
                  <button
                    onClick={() => removeRow(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-border)', padding: 2, display: 'flex', borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#DC2626'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-border)'}
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {/* Inline add row */}
              {addingRow && (
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Criterion name"
                    value={newRow.label}
                    onChange={e => setNewRow(p => ({ ...p, label: e.target.value }))}
                    style={{ flex: 1, border: '1px solid var(--color-accent-border)', borderRadius: 6, padding: '5px 8px', fontSize: 13, color: 'var(--color-text-1)', outline: 'none', background: 'var(--color-surface)' }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={newRow.value}
                    onChange={e => setNewRow(p => ({ ...p, value: Number(e.target.value) }))}
                    style={{ width: 60, border: '1px solid var(--color-accent-border)', borderRadius: 6, padding: '5px 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right', outline: 'none', background: 'var(--color-surface)' }}
                  />
                  <input
                    type="text"
                    placeholder="unit"
                    value={newRow.unit}
                    onChange={e => setNewRow(p => ({ ...p, unit: e.target.value }))}
                    style={{ width: 68, border: '1px solid var(--color-accent-border)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--color-text-3)', outline: 'none', background: 'var(--color-surface)' }}
                  />
                  <button onClick={addRow} style={{ background: 'var(--color-primary-emphasis)', border: 'none', borderRadius: 6, color: 'white', padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setAddingRow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', padding: 2, display: 'flex' }}>
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {!addingRow && (
              <button
                onClick={() => setAddingRow(true)}
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Plus size={13} strokeWidth={2.5} />
                Add criterion
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 38, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{ flex: 2, height: 38, borderRadius: 8, border: 'none', background: name.trim() ? 'var(--color-primary-emphasis)' : 'var(--color-border)', fontSize: 13, fontWeight: 600, color: name.trim() ? 'var(--color-on-primary)' : 'var(--color-text-4)', cursor: name.trim() ? 'pointer' : 'not-allowed', transition: 'background 150ms ease' }}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ShoppersPage() {
  const [profiles, setProfiles] = useState<QSProfile[]>(INITIAL_PROFILES);
  const [activeId, setActiveId] = useState<string>('default');
  const [showModal, setShowModal] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeId) ?? profiles[0];

  const updateCriterionValue = (profileId: string, critId: string, val: number) => {
    setProfiles(prev => prev.map(p =>
      p.id === profileId
        ? { ...p, criteria: p.criteria.map(c => c.id === critId ? { ...c, value: val } : c) }
        : p
    ));
  };

  const deleteProfile = (id: string) => {
    if (profiles.find(p => p.id === id)?.isDefault) return;
    const remaining = profiles.filter(p => p.id !== id);
    setProfiles(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? '');
  };

  const addProfile = (p: QSProfile) => {
    setProfiles(prev => [...prev, p]);
    setActiveId(p.id);
  };

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-1)' }}>Qualified Shoppers</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2 }}>
            Configure qualification profiles and monitor high-intent visitors
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: 'var(--color-primary-emphasis)', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(101,91,211,0.30)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'}
        >
          <Plus size={14} strokeWidth={2.5} />
          New Profile
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Qualified Today" value="1,247" badge="+12.4%" icon={<Users size={20} strokeWidth={1.5} />} iconColor="#00CE9C" />
        <StatCard label="Conversion Rate"  value="34.2%"  badge="+3.1%"  icon={<TrendingUp size={20} strokeWidth={1.5} />} iconColor="var(--color-primary)" />
        <StatCard label="Avg Dwell Time"   value="18.4 min" badge="+2.1 min" icon={<Clock size={20} strokeWidth={1.5} />} iconColor="#D97706" />
      </div>

      {/* Profiles + Criteria — side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Profile list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
            Profiles ({profiles.length})
          </p>
          {profiles.map(p => {
            const active = p.id === activeId;
            return (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: active ? '0 2px 8px rgba(101,91,211,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
              >
                {/* Active indicator */}
                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--color-primary-emphasis)' }} />}

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {/* Radio dot */}
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--color-text-1)', truncate: true } as React.CSSProperties}>{p.name}</p>
                      {p.isDefault && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'var(--color-primary-light)', color: 'var(--color-primary)', letterSpacing: '0.04em', flexShrink: 0 }}>DEFAULT</span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 11.5, color: 'var(--color-text-4)', marginLeft: 20, lineHeight: 1.45 }}>{p.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 20, marginTop: 8 }}>
                      {p.criteria.map(c => (
                        <span key={c.id} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: active ? 'var(--color-primary-light)' : 'var(--color-surface-2)', color: active ? 'var(--color-primary)' : 'var(--color-text-3)' }}>
                          {c.value} {c.unit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delete button — only non-default */}
                  {!p.isDefault && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteProfile(p.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-border)', padding: 2, borderRadius: 4, flexShrink: 0 }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#DC2626'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-border)'}
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10,
              border: '1.5px dashed var(--color-accent-border)', background: 'transparent',
              fontSize: 12.5, fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Plus size={13} strokeWidth={2.5} />
            New Profile
          </button>
        </div>

        {/* RIGHT — Criteria config for active profile */}
        {activeProfile && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>{activeProfile.name}</p>
                {activeProfile.description && (
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 1 }}>{activeProfile.description}</p>
                )}
              </div>
              <ChevronRight size={15} strokeWidth={2} style={{ color: 'var(--color-text-4)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-primary)' }}>
                {activeProfile.criteria.length} criteria
              </span>
            </div>

            {/* Criteria rows */}
            {activeProfile.criteria.map((c, idx) => (
              <div
                key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)' }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-1)' }}>{c.label}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 2 }}>{c.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <input
                    type="number"
                    min={1}
                    value={c.value}
                    onChange={e => updateCriterionValue(activeProfile.id, c.id, Number(e.target.value))}
                    style={{
                      width: 68, border: '1px solid var(--color-border)', borderRadius: 8,
                      padding: '7px 10px', fontSize: 15, fontWeight: 700,
                      color: 'var(--color-primary)', textAlign: 'right', outline: 'none', background: 'var(--color-surface-2)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-text-4)', minWidth: 72 }}>{c.unit}</span>
                </div>
              </div>
            ))}

            {/* Apply button */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--color-primary-emphasis)', color: 'white',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'}
              >
                <Check size={14} strokeWidth={2.5} />
                Apply Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Qualified Shoppers */}
      <div className="card">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-1)' }}>Top Qualified Shoppers Today</p>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {SHOPPERS.map((s, idx) => (
            <div
              key={s.name}
              className="flex items-center gap-4 py-3"
              style={{ borderBottom: idx < SHOPPERS.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(101,91,211,0.15)', color: 'var(--color-primary)' }}>
                {s.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-1)' }}>{s.name}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-4)' }}>{s.store}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,206,156,0.12)', color: '#00A57F' }}>{s.dwellMin} min</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(101,91,211,0.12)', color: 'var(--color-primary)' }}>{s.zones} zones</span>
                <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-4)', minWidth: 48, textAlign: 'right' }}>{s.visits} visits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <NewProfileModal onClose={() => setShowModal(false)} onSave={addProfile} />
      )}
    </div>
  );
}
