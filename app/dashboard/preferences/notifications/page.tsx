import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Notification Settings"
      description="Configure which alerts and reports you receive, and how you receive them."
      icon={<Bell size={20} strokeWidth={1.5} />}
      features={[
        'Enable or disable alert types (footfall thresholds, camera offline, etc.)',
        'Choose delivery channels — email, in-app, or SMS',
        'Set quiet hours and digest schedules',
        'Store-specific notification rules',
      ]}
    />
  );
}
