import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Radio } from 'lucide-react';

export default function QueuePage() {
  return (
    <PlaceholderPage
      title="Queue Management"
      description="Monitor and optimise queue lengths, wait times, and service rates across stores."
      icon={<Radio size={20} strokeWidth={1.5} />}
      features={[
        'Real-time queue length monitoring per store',
        'Average wait time trends',
        'Alert configuration when thresholds are crossed',
        'Historical queue data and peak hour analysis',
      ]}
    />
  );
}
