import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Lock } from 'lucide-react';

export default function PasswordPage() {
  return (
    <PlaceholderPage
      title="Password & Access"
      description="Update your password, manage two-factor authentication, and control session security."
      icon={<Lock size={20} strokeWidth={1.5} />}
      features={[
        'Change account password',
        'Enable two-factor authentication (2FA)',
        'View active sessions and revoke access',
        'SSO configuration for enterprise accounts',
      ]}
    />
  );
}
