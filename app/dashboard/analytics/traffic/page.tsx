import { FootfallDemographicsCard } from '@/components/charts/FootfallDemographicsCard';
import { VisitingHoursChart } from '@/components/charts/VisitingHoursChart';
import { VisitorDemographicsSection } from '@/components/charts/VisitorDemographicsSection';
import { PasserbyTrendsChart } from '@/components/charts/PasserbyTrendsChart';
import { ConversionRateSection } from '@/components/charts/ConversionRateSection';
import { OverallConversionChart } from '@/components/charts/OverallConversionChart';
import { StorePerformanceSection } from '@/components/charts/StorePerformanceSection';
import { VisitorSnapshots } from '@/components/VisitorSnapshots';

export default function TrafficPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-1)' }}>Traffic Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2 }}>
          Detailed footfall, demographics, and conversion data across all stores.
        </p>
      </div>

      {/* Section 1 — Footfall & Demographics + Visiting Hours */}
      <div className="grid grid-cols-2 gap-6 items-stretch">
        <FootfallDemographicsCard />
        <VisitingHoursChart />
      </div>

      {/* Section 2 — Visitor Demographics & Trend Over Time */}
      <VisitorDemographicsSection />

      {/* Section 3 — Passerby vs Footfall Trends */}
      <PasserbyTrendsChart />

      {/* Section 4 — Conversion Rate */}
      <ConversionRateSection />

      {/* Section 5 — Overall Conversion Rate */}
      <OverallConversionChart />

      {/* Section 6 — Store Performance */}
      <StorePerformanceSection />

      {/* Section 7 — Visitor Snapshots */}
      <VisitorSnapshots />
    </div>
  );
}
