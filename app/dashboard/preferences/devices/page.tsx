import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Monitor } from 'lucide-react';

export default function DevicesPage() {
  return (
    <PlaceholderPage
      title="Device Settings"
      description="Manage connected cameras, sensors, and edge devices across your store network."
      icon={<Monitor size={20} strokeWidth={1.5} />}
      features={[
        'View and manage all registered devices',
        'Camera calibration and zone configuration',
        'Firmware update management',
        'Device health monitoring and diagnostics',
        'Add or decommission devices',
      ]}
    />
  );
}
