import { PlaceholderPage } from '@/components/PlaceholderPage';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Manage your account details, contact information, and display preferences."
      icon={<UserCircle size={20} strokeWidth={1.5} />}
      features={[
        'Update name, email, and profile picture',
        'Change display language and timezone',
        'Manage linked stores and access level',
        'View login activity and sessions',
      ]}
    />
  );
}
