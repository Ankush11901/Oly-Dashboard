import { StorePerformanceSection } from '@/components/charts/StorePerformanceSection';
import { OverallConversionChart } from '@/components/charts/OverallConversionChart';

export default function StorePerformanceAnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-1)' }}>Store Performance</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2, lineHeight: 1.45 }}>
          Rankings, conversion, and comparative performance by location.
        </p>
      </div>
      <StorePerformanceSection />
      <OverallConversionChart />
    </div>
  );
}
