'use client';
import { BarChart2, Table2 } from 'lucide-react';
import { OlyRetailLogo } from '@/components/OlyRetailLogo';
import { VisitorDemographicsDonut } from '@/components/charts/VisitorDemographicsDonut';
import { PasserbyTrendMiniChart } from '@/components/charts/PasserbyTrendMiniChart';
import { ReportGenderTrendChart } from '@/components/reports/ReportGenderTrendChart';
import { ReportHourlyTrafficChart } from '@/components/reports/ReportHourlyTrafficChart';
import {
  ReportDetailedDataTable,
  ReportKpiSummary,
} from '@/components/reports/ReportDetailedDataSection';
import { AGE_GENDER_COLORS, AGE_GENDER_LABELS } from '@/types/dashboard';

const REPORT_TOTAL = 57709;
const MALE_TOTAL = 22915;
const FEMALE_TOTAL = 34700;

const CHART_HEIGHT = 240;
const TREND_HEIGHT = 200;

const MALE_LEGEND = [
  { label: 'Youths (22–35 yrs)', value: '19,699', color: AGE_GENDER_COLORS[3] },
  { label: 'Teens (13–21 yrs)',  value: '2,357',  color: AGE_GENDER_COLORS[2] },
  { label: 'Infants (0–2 yrs)',  value: '70',     color: AGE_GENDER_COLORS[0] },
  { label: 'Adults (35+ yrs)',   value: '647',    color: AGE_GENDER_COLORS[4] },
];

const FEMALE_LEGEND = [
  { label: 'Youths (22–35 yrs)', value: '19,753', color: AGE_GENDER_COLORS[8] },
  { label: 'Teens (13–21 yrs)',  value: '2,773',  color: AGE_GENDER_COLORS[7] },
  { label: 'Infants (0–2 yrs)',  value: '56',     color: AGE_GENDER_COLORS[5] },
  { label: 'Kids (3–12 yrs)',    value: '2,218',  color: AGE_GENDER_COLORS[6] },
  { label: 'Adults (35+ yrs)',   value: '900',    color: AGE_GENDER_COLORS[9] },
];

function ReportPreviewHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <OlyRetailLogo height={34} variant="light" />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
        <BarChart2 size={16} strokeWidth={1.75} style={{ color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
    </>
  );
}

function ReportDetailedSection({ heading }: { heading: string }) {
  return (
    <div style={{ paddingTop: 24, marginTop: 24, borderTop: '1px solid var(--color-border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Table2 size={15} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>{heading}</p>
      </div>
      <ReportDetailedDataTable />
      <div style={{ marginTop: 20 }}>
        <ReportKpiSummary />
      </div>
    </div>
  );
}

function ReportOverallOverviewCharts() {
  return (
    <>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 12px' }}>
        Overall Walk-Ins and Demographics for the Selected Date
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          gap: 20,
          alignItems: 'start',
          marginBottom: 20,
        }}
      >
        <div style={{ minHeight: CHART_HEIGHT + 80 }}>
          <div style={{ height: CHART_HEIGHT, width: '100%' }}>
            <VisitorDemographicsDonut total={REPORT_TOTAL} totalLabel="Total Footfall" height={CHART_HEIGHT} documentLight />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--color-text-4)', margin: 0 }}>♂ Male</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0DA2FF', margin: '2px 0 0' }}>{MALE_TOTAL.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--color-text-4)', margin: 0 }}>♀ Female</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#EE0F6B', margin: '2px 0 0' }}>{FEMALE_TOTAL.toLocaleString()}</p>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '6px 10px', justifyContent: 'center' }}>
            {AGE_GENDER_LABELS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: AGE_GENDER_COLORS[i], flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'var(--color-text-4)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 8, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--chart-1)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Passerby</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--chart-2)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Footfall</span>
            </div>
          </div>
          <div style={{ height: CHART_HEIGHT, width: '100%' }}>
            <PasserbyTrendMiniChart height={CHART_HEIGHT} gradientIdPrefix="reportOverall" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 10px' }}>
          Gender Trend Over Time
        </p>
        <div style={{ height: TREND_HEIGHT, width: '100%' }}>
          <ReportGenderTrendChart height={TREND_HEIGHT} gradientIdPrefix="reportOverallGender" />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        {([
          { title: 'Male', total: MALE_TOTAL, items: MALE_LEGEND },
          { title: 'Female', total: FEMALE_TOTAL, items: FEMALE_LEGEND },
        ] as const).map(group => (
          <div key={group.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)' }}>{group.title}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: group.title === 'Male' ? '#0DA2FF' : '#EE0F6B' }}>
                {group.total.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportHourlyOverviewCharts() {
  return (
    <>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 12px' }}>
        Hourly Footfall Trends
      </p>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 8, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--chart-1)' }} />
            <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Passerby</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--chart-2)' }} />
            <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Footfall</span>
          </div>
        </div>
        <div style={{ height: CHART_HEIGHT, width: '100%' }}>
          <PasserbyTrendMiniChart height={CHART_HEIGHT} gradientIdPrefix="reportHourly" />
        </div>
      </div>

      <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 10px' }}>
          Visitors by Hour
        </p>
        <div style={{ height: TREND_HEIGHT, width: '100%' }}>
          <ReportHourlyTrafficChart height={TREND_HEIGHT} />
        </div>
      </div>
    </>
  );
}

export function ReportOverallPreview() {
  return (
    <div style={{ padding: '20px 22px', background: '#FFFFFF', color: '#0F172A' }}>
      <ReportPreviewHeader
        title="Footfall Analytics Overview"
        subtitle="Overall breakdown for the selected date period."
      />
      <ReportOverallOverviewCharts />
      <ReportDetailedSection heading="Store-Level Breakdown" />
    </div>
  );
}

export function ReportHourlyPreview() {
  return (
    <div style={{ padding: '20px 22px', background: '#FFFFFF', color: '#0F172A' }}>
      <ReportPreviewHeader
        title="Hourly Footfall Report"
        subtitle="Hour-by-hour breakdown for the selected date period."
      />
      <ReportHourlyOverviewCharts />
      <ReportDetailedSection heading="Hourly Data" />
    </div>
  );
}
