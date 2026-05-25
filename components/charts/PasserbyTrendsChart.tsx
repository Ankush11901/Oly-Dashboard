'use client';
import { useState } from 'react';
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
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
      <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-8" style={{ marginBottom: 3 }}>
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

export function PasserbyTrendsChart() {
  const [period, setPeriod] = useState<Period>('Monthly');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>
            Overall Passerby vs Footfall Trends
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            Monthly passerby count vs. store entry / exit
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#655BD3' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Passerby</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#00CE9C' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Entry / Exit</span>
            </div>
          </div>
          <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {(['Monthly', 'Yearly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: 'none', borderRight: p === 'Monthly' ? '1px solid #E5E7EB' : 'none',
                  background: period === p ? '#655BD3' : 'white',
                  color: period === p ? 'white' : '#374151',
                  transition: 'all 150ms',
                }}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PASSERBY_TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="passerbyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#655BD3" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#00CE9C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatK}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="passerby"
              name="Passerby"
              stroke="#655BD3"
              strokeWidth={2}
              fill="url(#passerbyGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#655BD3', stroke: 'white', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="entryExit"
              name="Entry / Exit"
              stroke="#00CE9C"
              strokeWidth={2}
              fill="url(#entryGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#00CE9C', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
