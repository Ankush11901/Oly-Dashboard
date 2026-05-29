'use client';
import type { ApexOptions } from 'apexcharts';
import { ApexWrapper } from './ApexWrapper';
import { mergeApexOptions } from '@/lib/theme';
import { AGE_GENDER_COLORS, AGE_GENDER_LABELS, FOOTFALL_BREAKDOWN } from '@/types/dashboard';

interface Props {
  total?: number;
  totalLabel?: string;
  /** Override center display (e.g. "12.4%") */
  centerValue?: string;
  height?: number;
}

export function VisitorDemographicsDonut({
  total = 15234,
  totalLabel = 'Total Visitors',
  centerValue,
  height = 310,
}: Props) {
  const displayValue = centerValue ?? total.toLocaleString();
  const scaledSeries = FOOTFALL_BREAKDOWN.map(p => Math.round((p / 100) * total));

  const options = mergeApexOptions({
    chart: {
      type: 'donut',
      height,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 680,
      },
    },
    series: scaledSeries,
    labels: AGE_GENDER_LABELS,
    colors: AGE_GENDER_COLORS,
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              color: 'var(--color-text-3)',
              offsetY: 18,
            },
            value: {
              show: true,
              fontSize: height > 250 ? '26px' : '18px',
              fontWeight: 700,
              color: 'var(--color-text-1)',
              offsetY: -10,
              formatter: () => displayValue,
            },
            total: {
              show: true,
              label: totalLabel,
              fontSize: '11px',
              color: 'var(--color-text-3)',
              formatter: () => displayValue,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 3, colors: ['var(--color-surface)'] },
    states: {
      hover: { filter: { type: 'lighten' } },
      active: { filter: { type: 'none' } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const sum = scaledSeries.reduce((a, b) => a + b, 0);
          return `${((val / sum) * 100).toFixed(1)}%`;
        },
      },
    },
  });

  return <ApexWrapper options={options} series={scaledSeries} type="donut" height={height} />;
}
