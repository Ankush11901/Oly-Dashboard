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
    <div style={{ background: 'var(--color-tooltip-bg)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-tooltip-border)', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ color: 'var(--color-tooltip-muted)', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6" style={{ marginBottom: 3 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: p.dataKey === 'conversionRate' ? '50%' : 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--color-tooltip-muted)', fontSize: 12 }}>{p.name}</span>
          </div>
          <span style={{ color: 'var(--color-text-1)', fontSize: 13, fontWeight: 700 }}>
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
        <div>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>Overall Conversion Rate</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Passerby vs. entry/exit with conversion % overlay</p>
        </div>
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
            <defs>
              <linearGradient id="passerbyBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#655BD3" stopOpacity={1} />
                <stop offset="100%" stopColor="#655BD3" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="entryBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00CE9C" stopOpacity={1} />
                <stop offset="100%" stopColor="#00CE9C" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
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
              fill="url(#passerbyBarGrad)"
              maxBarSize={20}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="entryExit"
              name="Entry / Exit"
              fill="url(#entryBarGrad)"
              maxBarSize={20}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversionRate"
              name="Conversion Rate"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
