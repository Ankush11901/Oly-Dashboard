import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

export default function StaffPage() {
  return (
    <PlaceholderPage
      title="Staff / Team"
      description="Manage store staff, assign roles, and track team activity."
      icon={<Users size={20} strokeWidth={1.5} />}
      features={[
        'Add and manage store staff across all locations',
        'Assign stores and shift schedules',
        'View staff performance and attendance',
        'Export staff reports',
      ]}
    />
  );
}
