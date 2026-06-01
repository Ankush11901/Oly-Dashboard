'use client';

import type { UserType } from '@/lib/team-data';

export type RolePillVariant = UserType;

const VARIANT_CLASS: Record<RolePillVariant, string> = {
  admin: 'role-pill--admin',
  regional_manager: 'role-pill--regional-manager',
  store_manager: 'role-pill--store-manager',
};

/** Map role id or display name to a user-type pill variant. */
export function getRolePillVariant(roleIdOrName: string): RolePillVariant {
  const key = roleIdOrName.toLowerCase().replace(/\s+/g, '_');
  if (key === 'admin' || key === 'super_admin') return 'admin';
  if (key === 'regional_manager' || key === 'regional_director') return 'regional_manager';
  return 'store_manager';
}

interface RolePillProps {
  /** Role id (e.g. store_manager) or display name (e.g. Store Manager) */
  roleIdOrName: string;
  label?: string;
  className?: string;
}

export function RolePill({ roleIdOrName, label, className }: RolePillProps) {
  const variant = getRolePillVariant(roleIdOrName);
  const classes = ['role-pill', VARIANT_CLASS[variant], className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {label ?? roleIdOrName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
