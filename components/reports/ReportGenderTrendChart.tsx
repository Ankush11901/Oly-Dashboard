'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MONTHLY_TREND_DATA } from '@/types/dashboard';
import { RechartsChartTooltip } from '@/components/charts/RechartsChartTooltip';

function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface Props {
  height?: number;
  gradientIdPrefix?: string;
}

export function ReportGenderTrendChart({ height = 200, gradientIdPrefix = 'reportGender' }: Props) {
  const maleGrad = `${gradientIdPrefix}-maleGrad`;
  const femaleGrad = `${gradientIdPrefix}-femaleGrad`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id={maleGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0DA2FF" stopOpacity={0.45} />
            <stop offset="55%" stopColor="#0DA2FF" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#0DA2FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={femaleGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EE0F6B" stopOpacity={0.4} />
            <stop offset="55%" stopColor="#EE0F6B" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#EE0F6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<RechartsChartTooltip valueFormatter={v => formatK(Number(v))} />}
          cursor={{ fill: 'rgba(101, 91, 211, 0.06)' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="male"
          name="Male"
          stroke="#0DA2FF"
          strokeWidth={2}
          fill={`url(#${maleGrad})`}
          dot={false}
          activeDot={{ r: 4, fill: '#0DA2FF', stroke: 'var(--color-surface)', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="female"
          name="Female"
          stroke="#EE0F6B"
          strokeWidth={2}
          fill={`url(#${femaleGrad})`}
          dot={false}
          activeDot={{ r: 4, fill: '#EE0F6B', stroke: 'var(--color-surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
