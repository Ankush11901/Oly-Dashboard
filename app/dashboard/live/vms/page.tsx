import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Monitor } from 'lucide-react';

export default function VMSPage() {
  return (
    <PlaceholderPage
      title="VMS Monitoring"
      description="Live video management and camera feed monitoring across all store locations."
      icon={<Monitor size={20} strokeWidth={1.5} />}
      features={[
        'Live camera feeds from all store locations',
        'Camera health and connectivity status',
        'Motion detection and zone alerts',
        'Video clip export and download',
        'Camera configuration and angle management',
      ]}
    />
  );
}
