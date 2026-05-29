'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { VISITING_HOURS_DATA, AGE_GENDER_SERIES_KEYS } from '@/types/dashboard';
import { RechartsChartTooltip } from '@/components/charts/RechartsChartTooltip';

interface Props {
  height?: number;
}

const HOURLY_BAR_DATA = VISITING_HOURS_DATA.map(row => ({
  hour: row.hour,
  total: AGE_GENDER_SERIES_KEYS.reduce(
    (sum, key) => sum + row[key as keyof Omit<typeof row, 'hour'>],
    0,
  ),
}));

export function ReportHourlyTrafficChart({ height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={HOURLY_BAR_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--color-text-4)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          content={<RechartsChartTooltip />}
          cursor={{ fill: 'rgba(101, 91, 211, 0.06)' }}
        />
        <Bar dataKey="total" name="Visitors" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
