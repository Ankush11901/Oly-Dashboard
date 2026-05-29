import type { CSSProperties } from 'react';
import type { ApexOptions } from 'apexcharts';

/** Read resolved theme from the document (SSR-safe default: light). */
export function getResolvedTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function isDarkTheme(): boolean {
  return getResolvedTheme() === 'dark';
}

/** Shared Recharts tooltip shell */
export function rechartsTooltipStyle(): CSSProperties {
  return {
    background: 'var(--color-tooltip-bg)',
    border: '1px solid var(--color-tooltip-border)',
    borderRadius: 8,
    padding: '10px 14px',
    boxShadow: 'var(--shadow-md)',
  };
}

/** Base ApexCharts options merged with caller options */
export function apexThemeBase(): ApexOptions {
  return {
    chart: {
      background: 'transparent',
      foreColor: 'var(--color-chart-label)',
      toolbar: { tools: { download: false, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
    },
    grid: {
      borderColor: 'var(--color-chart-grid)',
      strokeDashArray: 3,
    },
    xaxis: {
      labels: { style: { colors: 'var(--color-chart-label)', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: 'var(--color-chart-label)', fontSize: '11px' } },
    },
    legend: {
      labels: { colors: 'var(--color-text-2)' },
    },
    tooltip: { theme: isDarkTheme() ? 'dark' : 'light' },
  };
}

export function mergeApexOptions(overrides: ApexOptions): ApexOptions {
  const base = apexThemeBase();
  return {
    ...base,
    ...overrides,
    chart: { ...base.chart, ...overrides.chart },
    grid: { ...base.grid, ...overrides.grid },
  };
}

/** Theme-aware chart series (maps to --chart-* in globals.css) */
export const CHART_SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;

/** Card shell used across dashboard sections */
export const dashboardCardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 10,
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--shadow-card)',
  overflow: 'hidden',
};
