export type Status = 'Active' | 'On Leave' | 'Inactive';
export type PermLevel = 'full' | 'view' | 'none';
/** Admin, Regional Manager, Store Manager — single role dimension per Jun 1 huddle */
export type UserType = 'admin' | 'regional_manager' | 'store_manager';
export type UserCategory = 'all' | UserType;
export type TeamViewMode = 'users' | 'groups';
export type GroupViewLayout = 'grid' | 'list';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roleId: UserType;
  userType: UserType;
  location: string;
  storeAccess: string[];
  status: Status;
  avatar?: string;
  customPerms?: Record<string, PermLevel>;
}

export interface TeamGroup {
  id: number;
  name: string;
  description?: string;
  memberIds: number[];
  storeScope?: string;
}

export interface RoleDef {
  id: UserType;
  name: string;
  description: string;
}

export interface TeamFilters {
  roleId: string;
  status: string;
  store: string;
  groupId: string;
}

export const ROLE_DEFS: RoleDef[] = [
  { id: 'admin', name: 'Admin', description: 'Full access across all regions and stores' },
  { id: 'regional_manager', name: 'Regional Manager', description: 'Access to stores in assigned region' },
  { id: 'store_manager', name: 'Store Manager', description: 'Access to assigned store only' },
];

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'live_feed', label: 'Live Feed' },
  { key: 'team', label: 'Team' },
  { key: 'reports', label: 'Reports' },
];

export const DEFAULT_ROLE_PERMS: Record<UserType, Record<string, PermLevel>> = {
  admin: { dashboard: 'full', analytics: 'full', live_feed: 'full', team: 'full', reports: 'full' },
  regional_manager: { dashboard: 'full', analytics: 'full', live_feed: 'full', team: 'view', reports: 'full' },
  store_manager: { dashboard: 'full', analytics: 'view', live_feed: 'full', team: 'view', reports: 'view' },
};

export const LOCATIONS = [
  'Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction',
  'Tampines Mall', 'Jurong Point', 'Northpoint City', 'Causeway Point', 'Singapore HQ',
];

export const STATUS_CFG: Record<Status, { dot: string; color: string; bg: string }> = {
  Active: { dot: 'var(--status-active-dot)', color: 'var(--status-active-text)', bg: 'var(--status-active-bg)' },
  'On Leave': { dot: 'var(--status-leave-dot)', color: 'var(--status-leave-text)', bg: 'var(--status-leave-bg)' },
  Inactive: { dot: 'var(--status-inactive-dot)', color: 'var(--status-inactive-text)', bg: 'var(--status-inactive-bg)' },
};

export const PERM_CFG: Record<PermLevel, { label: string; bg: string; color: string; border: string }> = {
  full: { label: 'Full', bg: 'var(--perm-full-bg)', color: 'var(--perm-full-text)', border: 'var(--perm-full-border)' },
  view: { label: 'View', bg: 'var(--perm-view-bg)', color: 'var(--perm-view-text)', border: 'var(--perm-view-border)' },
  none: { label: 'No Access', bg: 'var(--color-surface-2)', color: 'var(--color-text-4)', border: 'var(--color-border)' },
};

export const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Aditi Sharma', email: 'aditi.sharma@olyretail.com', phone: '+65 9123 4001', roleId: 'store_manager', userType: 'store_manager', location: 'Marina Bay Sands', storeAccess: ['Marina Bay Sands'], status: 'Active', avatar: 'https://i.pravatar.cc/68?img=47' },
  { id: 2, name: 'Jason Lee', email: 'jason.lee@olyretail.com', phone: '+65 9123 4002', roleId: 'regional_manager', userType: 'regional_manager', location: 'Singapore HQ', storeAccess: ['Marina Bay Sands', 'VivoCity', 'Bugis Junction', 'Tampines Mall'], status: 'Active', avatar: 'https://i.pravatar.cc/68?img=12' },
  { id: 3, name: 'Sarah Chen', email: 'sarah.chen@olyretail.com', phone: '+65 9123 4003', roleId: 'store_manager', userType: 'store_manager', location: 'Orchard Central', storeAccess: ['Orchard Central'], status: 'On Leave', avatar: 'https://i.pravatar.cc/68?img=44' },
  { id: 4, name: 'Michael Tan', email: 'michael.tan@olyretail.com', phone: '+65 9123 4004', roleId: 'store_manager', userType: 'store_manager', location: 'VivoCity', storeAccess: ['VivoCity'], status: 'Active', avatar: 'https://i.pravatar.cc/68?img=15' },
  { id: 5, name: 'Priya Nair', email: 'priya.nair@olyretail.com', phone: '+65 9123 4005', roleId: 'admin', userType: 'admin', location: 'Singapore HQ', storeAccess: LOCATIONS, status: 'Active', avatar: 'https://i.pravatar.cc/68?img=49' },
  { id: 6, name: 'Naren Kumar', email: 'naren.kumar@olyretail.com', phone: '+65 9123 4006', roleId: 'store_manager', userType: 'store_manager', location: 'Northpoint City', storeAccess: ['Northpoint City', 'Causeway Point'], status: 'Active', avatar: 'https://i.pravatar.cc/68?img=33' },
  { id: 7, name: 'Sneha Reddy', email: 'sneha.reddy@olyretail.com', phone: '+65 9123 4007', roleId: 'regional_manager', userType: 'regional_manager', location: 'Jurong Point', storeAccess: ['Jurong Point', 'Tampines Mall'], status: 'Active', avatar: 'https://i.pravatar.cc/68?img=25' },
  { id: 8, name: 'Priya Ganesh', email: 'priya.ganesh@olyretail.com', phone: '+65 9123 4008', roleId: 'store_manager', userType: 'store_manager', location: 'Bugis Junction', storeAccess: ['Bugis Junction'], status: 'Inactive', avatar: 'https://i.pravatar.cc/68?img=32' },
];

export const INITIAL_GROUPS: TeamGroup[] = [
  { id: 1, name: 'North Admins', description: 'Admin users covering northern stores', memberIds: [5, 6, 7], storeScope: 'Northpoint City' },
  { id: 2, name: 'South Store Managers', description: 'Store managers across southern locations', memberIds: [1, 4, 6, 7, 8], storeScope: 'VivoCity' },
  { id: 3, name: 'North Store Managers', description: 'Managers for north region stores', memberIds: [1, 6, 7, 3, 8], storeScope: 'Northpoint City' },
  { id: 4, name: 'South Admins', description: 'Regional coverage for south', memberIds: [2, 5, 4, 1], storeScope: 'Marina Bay Sands' },
  { id: 5, name: 'Special Executives', description: 'Cross-functional executive access group', memberIds: [5, 2, 1, 4, 6], storeScope: 'Singapore HQ' },
  { id: 6, name: 'Top Performing Store Managers', description: 'High-performing store leadership', memberIds: [1, 6, 7, 4, 3], storeScope: 'Marina Bay Sands' },
];

export function getRoleDef(roleId: string): RoleDef {
  return ROLE_DEFS.find(r => r.id === roleId) ?? ROLE_DEFS[2];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function formatStoreAccessLabel(count: number): string {
  const n = Math.max(0, count);
  return `${n} store${n === 1 ? '' : 's'} access`;
}

export function countMemberPermissions(member: Member): number {
  const perms = member.customPerms ?? DEFAULT_ROLE_PERMS[member.userType] ?? {};
  return Object.values(perms).filter(p => p !== 'none').length;
}

export function memberMatchesSearch(member: Member, query: string): boolean {
  const q = query.toLowerCase();
  if (!q) return true;
  const roleName = getRoleDef(member.roleId).name.toLowerCase();
  return (
    member.name.toLowerCase().includes(q) ||
    member.email.toLowerCase().includes(q) ||
    member.location.toLowerCase().includes(q) ||
    roleName.includes(q) ||
    member.storeAccess.some(s => s.toLowerCase().includes(q)) ||
    (member.phone?.toLowerCase().includes(q) ?? false)
  );
}

export function groupMatchesSearch(group: TeamGroup, members: Member[], query: string): boolean {
  const q = query.toLowerCase();
  if (!q) return true;
  if (group.name.toLowerCase().includes(q)) return true;
  if (group.description?.toLowerCase().includes(q)) return true;
  if (group.storeScope?.toLowerCase().includes(q)) return true;
  return group.memberIds.some(id => {
    const m = members.find(x => x.id === id);
    return m ? memberMatchesSearch(m, query) : false;
  });
}

export const EMPTY_FILTERS: TeamFilters = { roleId: '', status: '', store: '', groupId: '' };
