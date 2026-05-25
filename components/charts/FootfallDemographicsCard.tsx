'use client';
import type { ApexOptions } from 'apexcharts';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ApexWrapper } from './ApexWrapper';
import { AGE_GENDER_COLORS, AGE_GENDER_LABELS, FOOTFALL_BREAKDOWN, PASSERBY_BREAKDOWN } from '@/types/dashboard';

function DemographicBar({ breakdown }: { breakdown: number[] }) {
  const total = breakdown.reduce((a, b) => a + b, 0);

  const series = AGE_GENDER_LABELS.map((name, i) => ({
    name,
    data: [breakdown[i]],
  }));

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      stackType: '100%',
      height: 56,
      sparkline: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 0,
      },
    },
    colors: AGE_GENDER_COLORS,
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false, max: total },
    grid: {
      show: false,
      padding: { top: -16, right: 0, bottom: -16, left: 0 },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${((val / total) * 100).toFixed(1)}%`,
      },
    },
  };

  return (
    <div style={{ marginLeft: -8, marginRight: -8 }}>
      <ApexWrapper options={options} series={series} type="bar" height={56} />
    </div>
  );
}

interface GenderCountRowProps {
  maleCount: number;
  femaleCount: number;
}

function GenderCountRow({ maleCount, femaleCount }: GenderCountRowProps) {
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        {/* Male icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="14" r="6" stroke="#0DA2FF" strokeWidth="2"/>
          <path d="M14.5 9.5L20 4M20 4H15M20 4V9" stroke="#0DA2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs font-semibold" style={{ color: '#0DA2FF' }}>
          {maleCount.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {/* Female icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="6" stroke="#EE0F6B" strokeWidth="2"/>
          <path d="M12 15V21M9 18H15" stroke="#EE0F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs font-semibold" style={{ color: '#EE0F6B' }}>
          {femaleCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function FootfallDemographicsCard() {
  return (
    <div className="card h-full">
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-neutral-500)' }}>
        Overall Footfall and Demographics
      </p>

      {/* Footfall */}
      <div className="mb-1">
        <AnimatedNumber
          value={15234}
          className="font-medium tabular-nums"
          style={{ fontSize: 36, lineHeight: 1.2, color: 'var(--color-neutral-900)' } as React.CSSProperties}
        />
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--color-neutral-500)' }}>Total Footfall</p>
      <DemographicBar breakdown={FOOTFALL_BREAKDOWN} />
      <GenderCountRow maleCount={9750} femaleCount={5484} />

      {/* Divider */}
      <div className="my-4" style={{ borderTop: '1px solid #F3F4F6' }} />

      {/* Passerby */}
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-neutral-500)' }}>
        Passerby
      </p>
      <div className="mb-1">
        <AnimatedNumber
          value={45621}
          duration={1600}
          className="font-medium tabular-nums"
          style={{ fontSize: 36, lineHeight: 1.2, color: 'var(--color-neutral-900)' } as React.CSSProperties}
        />
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--color-neutral-500)' }}>Total Passerby</p>
      <DemographicBar breakdown={PASSERBY_BREAKDOWN} />
      <GenderCountRow maleCount={29197} femaleCount={16424} />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
        {AGE_GENDER_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
            <span className="text-[10px]" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
