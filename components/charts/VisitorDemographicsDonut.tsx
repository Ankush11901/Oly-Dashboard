'use client';
import type { ApexOptions } from 'apexcharts';
import { ApexWrapper } from './ApexWrapper';
import { mergeApexOptions } from '@/lib/theme';
import { REPORT_LIGHT } from '@/lib/reportLightTheme';
import { AGE_GENDER_COLORS, AGE_GENDER_LABELS, FOOTFALL_BREAKDOWN } from '@/types/dashboard';

interface Props {
  total?: number;
  totalLabel?: string;
  /** Override center display (e.g. "12.4%") */
  centerValue?: string;
  height?: number;
  /** Force light Apex tooltip (report preview document). */
  documentLight?: boolean;
}

export function VisitorDemographicsDonut({
  total = 15234,
  totalLabel = 'Total Visitors',
  centerValue,
  height = 310,
  documentLight = false,
}: Props) {
  const displayValue = centerValue ?? total.toLocaleString();
  const scaledSeries = FOOTFALL_BREAKDOWN.map(p => Math.round((p / 100) * total));
  const labelColor = documentLight ? REPORT_LIGHT.text3 : 'var(--color-text-3)';
  const valueColor = documentLight ? REPORT_LIGHT.text1 : 'var(--color-text-1)';
  const strokeColor = documentLight ? REPORT_LIGHT.surface : 'var(--color-surface)';

  const options = mergeApexOptions({
    chart: {
      type: 'donut',
      height,
      toolbar: { show: false },
      ...(documentLight ? { foreColor: REPORT_LIGHT.chartLabel } : {}),
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
              color: labelColor,
              offsetY: 18,
            },
            value: {
              show: true,
              fontSize: height > 250 ? '26px' : '18px',
              fontWeight: 700,
              color: valueColor,
              offsetY: -10,
              formatter: () => displayValue,
            },
            total: {
              show: true,
              label: totalLabel,
              fontSize: '11px',
              color: labelColor,
              formatter: () => displayValue,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 3, colors: [strokeColor] },
    states: {
      hover: { filter: { type: 'lighten' } },
      active: { filter: { type: 'none' } },
    },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      theme: 'light',
      custom: ({ series, seriesIndex, w }) => {
        const idx = seriesIndex ?? 0;
        const label = w.globals.labels[idx] ?? '';
        const val = Number(series[idx] ?? 0);
        const sum = scaledSeries.reduce((a, b) => a + b, 0);
        const pct = sum ? ((val / sum) * 100).toFixed(1) : '0.0';
        const color = AGE_GENDER_COLORS[idx] ?? REPORT_LIGHT.chart1;
        const safeLabel = String(label).replace(/</g, '&lt;');
        return (
          `<div class="apex-donut-tooltip">` +
            `<div class="apex-donut-tooltip-row">` +
              `<span class="apex-donut-tooltip-swatch" style="background:${color}"></span>` +
              `<span class="apex-donut-tooltip-label">${safeLabel}</span>` +
            `</div>` +
            `<div class="apex-donut-tooltip-value">` +
              `${val.toLocaleString()}<span class="apex-donut-tooltip-pct">${pct}%</span>` +
            `</div>` +
          `</div>`
        );
      },
    },
  }, documentLight ? { theme: 'light' } : undefined);

  return (
    <ApexWrapper
      options={options}
      series={scaledSeries}
      type="donut"
      height={height}
      chartKey={documentLight ? 'report-light' : undefined}
    />
  );
}
