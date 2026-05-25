'use client';
import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HOURLY_CONVERSION_DATA } from '@/types/dashboard';

type Period = 'D' | 'W' | 'M' | 'Y';

function formatVisitors(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '10px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <p style={{ color: '#D1D5DB', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6" style={{ marginBottom: 3 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: p.dataKey === 'conversionRate' ? '50%' : 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#D1D5DB', fontSize: 12 }}>{p.name}</span>
          </div>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
            {p.dataKey === 'conversionRate' ? `${p.value}%` : formatVisitors(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

const PERIODS: Period[] = ['D', 'W', 'M', 'Y'];

export function OverallConversionChart() {
  const [period, setPeriod] = useState<Period>('D');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-neutral-500)' }}>
          Overall Conversion Rate
        </p>
        <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: 'none', borderRight: p !== 'Y' ? '1px solid #E5E7EB' : 'none',
                background: period === p ? 'var(--color-primary)' : 'white',
                color: period === p ? 'white' : 'var(--color-neutral-700)',
                transition: 'all 150ms',
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={HOURLY_CONVERSION_DATA} margin={{ top: 8, right: 48, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            {/* Left Y axis - visitor counts */}
            <YAxis
              yAxisId="left"
              tickFormatter={formatVisitors}
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              width={44}
              label={{
                value: 'Visitor Counts',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 10, fill: '#9CA3AF', fontFamily: 'inherit' },
              }}
            />
            {/* Right Y axis - conversion rate */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 50]}
              width={44}
              label={{
                value: 'Conversion %',
                angle: 90,
                position: 'insideRight',
                offset: 12,
                style: { fontSize: 10, fill: '#9CA3AF', fontFamily: 'inherit' },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.04)' }} />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar
              yAxisId="left"
              dataKey="passerby"
              name="Passerby"
              fill="#ffc546"
              maxBarSize={20}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="entryExit"
              name="Entry / Exit"
              fill="#0085a8"
              maxBarSize={20}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversionRate"
              name="Conversion Rate"
              stroke="#754C7F"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#754C7F', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
