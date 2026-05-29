'use client';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/components/ThemeProvider';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-md"
      style={{ background: 'var(--color-neutral-100)', width: '100%', height: '100%', minHeight: 80 }}
    />
  ),
});

interface Props {
  options: ApexOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series: any;
  type: string;
  height?: number | string;
  width?: number | string;
}

export function ApexWrapper({ options, series, type, height, width }: Props) {
  const { theme } = useTheme();
  return (
    <ReactApexChart
      key={theme}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type={type as any}
      series={series}
      options={options}
      height={height}
      width={width ?? '100%'}
    />
  );
}
