'use client';

export type RolePillTier = 'super_admin' | 'regional_director' | 'standard';

const TIER_CLASS: Record<RolePillTier, string> = {
  super_admin: 'role-pill--super-admin',
  regional_director: 'role-pill--regional-director',
  standard: 'role-pill--standard',
};

/** Map role id or display name to a pill tier. */
export function getRolePillTier(roleIdOrName: string): RolePillTier {
  const key = roleIdOrName.toLowerCase().replace(/\s+/g, '_');
  if (key === 'super_admin') return 'super_admin';
  if (key === 'regional_director') return 'regional_director';
  return 'standard';
}

interface RolePillProps {
  /** Role id (e.g. super_admin) or display name (e.g. Super Admin) */
  roleIdOrName: string;
  label?: string;
  className?: string;
}

export function RolePill({ roleIdOrName, label, className }: RolePillProps) {
  const tier = getRolePillTier(roleIdOrName);
  const classes = ['role-pill', TIER_CLASS[tier], className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {label ?? roleIdOrName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
