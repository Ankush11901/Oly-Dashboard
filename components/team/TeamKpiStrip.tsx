'use client';
import { Users, Shield, UserCheck, UsersRound } from 'lucide-react';
import type { Member, TeamGroup } from '@/lib/team-data';

export function TeamKpiStrip({ members, groups }: { members: Member[]; groups: TeamGroup[] }) {
  const adminCount = members.filter(m => m.userType === 'admin').length;
  const activeCount = members.filter(m => m.status === 'Active').length;

  const stats = [
    { label: 'Total Users', value: members.length, icon: <Users size={16} strokeWidth={1.5} />, featured: true },
    { label: 'Admin Users', value: adminCount, icon: <Shield size={16} strokeWidth={1.5} /> },
    { label: 'Active Users', value: activeCount, icon: <UserCheck size={16} strokeWidth={1.5} /> },
    { label: 'Groups', value: groups.length, icon: <UsersRound size={16} strokeWidth={1.5} /> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: s.featured ? 'var(--color-primary-light)' : 'var(--color-accent-bg)',
            border: `1px solid ${s.featured ? 'var(--color-accent-border)' : 'color-mix(in srgb, var(--color-accent-border) 55%, var(--color-border-subtle))'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: s.featured ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 78%, var(--color-text-2))',
            boxShadow: s.featured ? 'inset 0 1px 0 rgba(255,255,255,0.35)' : 'none',
          }}>
            {s.icon}
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-1)', lineHeight: 1.1, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11.5, color: 'var(--color-text-3)', marginTop: 2 }}>{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
