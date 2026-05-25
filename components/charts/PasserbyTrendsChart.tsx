'use client';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PASSERBY_TREND_DATA } from '@/types/dashboard';

type Period = 'Monthly' | 'Yearly';

function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '10px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <p style={{ color: '#D1D5DB', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6" style={{ marginBottom: 3 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#D1D5DB', fontSize: 12 }}>{p.name}</span>
          </div>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{formatK(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface LegendDotProps {
  color: string;
  label: string;
}
function LegendDot({ color, label }: LegendDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
    </div>
  );
}

export function PasserbyTrendsChart() {
  const [period, setPeriod] = useState<Period>('Monthly');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-neutral-500)' }}>
          Overall Passerby vs Footfall Trends
        </p>
        <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {(['Monthly', 'Yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: 'none', borderRight: p === 'Monthly' ? '1px solid #E5E7EB' : 'none',
                background: period === p ? 'var(--color-primary)' : 'white',
                color: period === p ? 'white' : 'var(--color-neutral-700)',
                transition: 'all 150ms',
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 370 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={PASSERBY_TREND_DATA} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatK}
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="passerby"
              name="Passerby"
              stroke="#7a9e7e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#7a9e7e', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="entryExit"
              name="Entry / Exit"
              stroke="#F4A261"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F4A261', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend */}
      <div className="mt-4 flex items-center gap-6 justify-center">
        <LegendDot color="#7a9e7e" label="Passerby" />
        <LegendDot color="#F4A261" label="Entry / Exit" />
      </div>
    </div>
  );
}
