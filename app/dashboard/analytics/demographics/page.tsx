import { VisitorDemographicsSection } from '@/components/charts/VisitorDemographicsSection';
import { FootfallDemographicsCard } from '@/components/charts/FootfallDemographicsCard';

export default function DemographicsAnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-1)' }}>Demographics Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2, lineHeight: 1.45 }}>
          Age, gender, and visitor composition trends across your store network.
        </p>
      </div>
      <FootfallDemographicsCard />
      <VisitorDemographicsSection />
    </div>
  );
}
