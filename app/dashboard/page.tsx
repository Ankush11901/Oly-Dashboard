import { FootfallDemographicsCard } from '@/components/charts/FootfallDemographicsCard';
import { VisitingHoursChart } from '@/components/charts/VisitingHoursChart';
import { VisitorDemographicsSection } from '@/components/charts/VisitorDemographicsSection';
import { PasserbyTrendsChart } from '@/components/charts/PasserbyTrendsChart';
import { ConversionRateSection } from '@/components/charts/ConversionRateSection';
import { OverallConversionChart } from '@/components/charts/OverallConversionChart';
import { StorePerformanceSection } from '@/components/charts/StorePerformanceSection';

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Page title */}
      <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>
        Dashboard
      </h1>

      {/* Section 1 — Footfall & Demographics + Visiting Hours (50/50) */}
      <div className="grid grid-cols-2 gap-6 items-stretch">
        <FootfallDemographicsCard />
        <VisitingHoursChart />
      </div>

      {/* Section 2 — Visitor Demographics & Trend Over Time */}
      <VisitorDemographicsSection />

      {/* Section 3 — Passerby vs Footfall Trends */}
      <PasserbyTrendsChart />

      {/* Section 4 — Conversion Rate (4/12 + 8/12) */}
      <ConversionRateSection />

      {/* Section 5 — Overall Conversion Rate (combo chart) */}
      <OverallConversionChart />

      {/* Section 6 — Store Performance (50/50) */}
      <StorePerformanceSection />
    </div>
  );
}
