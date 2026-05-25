'use client';
import type { ApexOptions } from 'apexcharts';
import { ApexWrapper } from './ApexWrapper';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { AGE_GENDER_COLORS, AGE_GENDER_LABELS, FOOTFALL_BREAKDOWN, STORE_CONVERSION_DATA } from '@/types/dashboard';

function ConversionDonut() {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 277,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    series: FOOTFALL_BREAKDOWN,
    labels: AGE_GENDER_LABELS,
    colors: AGE_GENDER_COLORS,
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              color: '#6B7280',
              offsetY: 18,
            },
            value: {
              show: true,
              fontSize: '30px',
              fontWeight: 700,
              color: '#111827',
              offsetY: -10,
              formatter: () => '12.4%',
            },
            total: {
              show: true,
              label: 'Avg Conversion',
              fontSize: '11px',
              color: '#6B7280',
              formatter: () => '12.4%',
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ['#FFFFFF'] },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const total = FOOTFALL_BREAKDOWN.reduce((a, b) => a + b, 0);
          return `${((val / total) * 100).toFixed(1)}%`;
        },
      },
    },
  };

  return <ApexWrapper options={options} series={FOOTFALL_BREAKDOWN} type="donut" height={277} />;
}

function StoreRow({ name, rate, max }: { name: string; rate: number; max: number }) {
  const barWidth = (rate / max) * 100;
  return (
    <div className="py-2.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-neutral-700)', maxWidth: '70%' }}>
          {name}
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-neutral-900)' }}>
          {rate}%
        </span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: '#F3F4F6' }}>
        <div
          className="rounded-full"
          style={{
            width: `${barWidth}%`,
            height: '100%',
            background: 'rgb(117,76,127)',
            transition: 'width 600ms ease',
          }}
        />
      </div>
    </div>
  );
}

export function ConversionRateSection() {
  const maxRate = Math.max(...STORE_CONVERSION_DATA.map((s) => s.rate));

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: '4fr 8fr' }}>
      {/* Left: Donut */}
      <div className="card flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-neutral-500)' }}>
          Average Conversion Rate
        </p>
        <ConversionDonut />
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {AGE_GENDER_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
              <span className="text-[10px]" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Store list */}
      <div className="card flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-neutral-500)' }}>
          Top Stores by Conversion Rate (High to Low)
        </p>
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 320 }}>
          {STORE_CONVERSION_DATA.map((store) => (
            <StoreRow key={store.name} name={store.name} rate={store.rate} max={maxRate} />
          ))}
        </div>
      </div>
    </div>
  );
}
