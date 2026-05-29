'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PASSERBY_TREND_DATA } from '@/types/dashboard';
import { RechartsChartTooltip } from './RechartsChartTooltip';

function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface Props {
  height?: number;
  gradientIdPrefix?: string;
}

export function PasserbyTrendMiniChart({ height = 220, gradientIdPrefix = 'report' }: Props) {
  const passerbyGrad = `${gradientIdPrefix}-passerbyGrad`;
  const entryGrad = `${gradientIdPrefix}-entryGrad`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={PASSERBY_TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={passerbyGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="55%" stopColor="var(--chart-1)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={entryGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
            <stop offset="55%" stopColor="var(--chart-2)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={
            <RechartsChartTooltip valueFormatter={v => formatK(Number(v))} />
          }
          cursor={{ fill: 'rgba(101, 91, 211, 0.06)' }}
        />
        <Area
          type="monotone"
          dataKey="passerby"
          name="Passerby"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill={`url(#${passerbyGrad})`}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="entryExit"
          name="Footfall"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill={`url(#${entryGrad})`}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--chart-2)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
