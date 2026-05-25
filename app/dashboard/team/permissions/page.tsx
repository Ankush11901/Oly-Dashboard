import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ShieldCheck } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <PlaceholderPage
      title="Permissions"
      description="Control role-based access across admin, store managers, and staff."
      icon={<ShieldCheck size={20} strokeWidth={1.5} />}
      features={[
        'Create and manage permission roles',
        'Grant or restrict access per module',
        'Audit permission changes',
        'Invite users with scoped access',
      ]}
    />
  );
}
