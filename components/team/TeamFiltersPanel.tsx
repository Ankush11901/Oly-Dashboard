'use client';
import { X } from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';
import type { TeamFilters } from '@/lib/team-data';
import { ROLE_DEFS, LOCATIONS, STATUS_CFG } from '@/lib/team-data';
import type { TeamGroup } from '@/lib/team-data';

export function TeamFiltersPanel({
  filters,
  onChange,
  onClear,
  groups,
}: {
  filters: TeamFilters;
  onChange: (f: TeamFilters) => void;
  onClear: () => void;
  groups: TeamGroup[];
}) {
  const hasActive = filters.roleId || filters.status || filters.store || filters.groupId;

  const fieldWrap: React.CSSProperties = { flex: '1 1 0', minWidth: 0 };

  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
      }}
    >
      <div style={fieldWrap}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
        <CustomSelect
          value={filters.roleId}
          onChange={v => onChange({ ...filters, roleId: v })}
          options={[{ value: '', label: 'All roles' }, ...ROLE_DEFS.map(r => ({ value: r.id, label: r.name }))]}
          size="sm"
          style={{ width: '100%', height: 34 }}
        />
      </div>
      <div style={fieldWrap}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
        <CustomSelect
          value={filters.status}
          onChange={v => onChange({ ...filters, status: v })}
          options={[{ value: '', label: 'All Status' }, ...(Object.keys(STATUS_CFG) as (keyof typeof STATUS_CFG)[]).map(s => ({ value: s, label: s }))]}
          size="sm"
          style={{ width: '100%', height: 34 }}
        />
      </div>
      <div style={fieldWrap}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Store</label>
        <CustomSelect
          value={filters.store}
          onChange={v => onChange({ ...filters, store: v })}
          options={[{ value: '', label: 'All stores' }, ...LOCATIONS.map(l => ({ value: l, label: l }))]}
          size="sm"
          style={{ width: '100%', height: 34 }}
        />
      </div>
      <div style={fieldWrap}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Group</label>
        <CustomSelect
          value={filters.groupId}
          onChange={v => onChange({ ...filters, groupId: v })}
          options={[{ value: '', label: 'All groups' }, ...groups.map(g => ({ value: String(g.id), label: g.name }))]}
          size="sm"
          style={{ width: '100%', height: 34 }}
        />
      </div>
      {hasActive && (
        <button
          type="button"
          onClick={onClear}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px',
            borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
            color: 'var(--color-text-2)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
  );
}
