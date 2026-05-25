import { PlaceholderPage } from '@/components/PlaceholderPage';
import { UserCircle } from 'lucide-react';

export default function ShoppersPage() {
  return (
    <PlaceholderPage
      title="Qualified Shopper Insights"
      description="Identify and analyse high-intent shoppers based on dwell time, repeat visits, and behaviour patterns."
      icon={<UserCircle size={20} strokeWidth={1.5} />}
      features={[
        'Qualified shopper detection and counting',
        'Dwell time segmentation by zone',
        'Repeat visitor recognition',
        'Shopper journey heatmaps',
        'Conversion funnel per shopper segment',
      ]}
    />
  );
}
