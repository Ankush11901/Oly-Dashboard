'use client';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AGE_GENDER_COLORS,
  AGE_GENDER_LABELS,
  AGE_GENDER_SERIES_KEYS,
  VISITING_HOURS_DATA,
  type VisitingHoursDataPoint,
} from '@/types/dashboard';

type Period = 'D' | 'W' | 'M' | 'Y';

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div
      style={{
        background: '#1A1A2E',
        borderRadius: 8,
        padding: '10px 12px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        maxWidth: 200,
      }}
    >
      <p style={{ color: '#D1D5DB', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4" style={{ marginBottom: 2 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#D1D5DB', fontSize: 11 }}>{p.name}</span>
          </div>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 6, paddingTop: 4 }}>
        <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>Total: {total}</span>
      </div>
    </div>
  );
}

const PERIODS: Period[] = ['D', 'W', 'M', 'Y'];

export function VisitingHoursChart() {
  const [period, setPeriod] = useState<Period>('D');

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-neutral-500)' }}>
          Store Top Visiting Hours
        </p>
        {/* Period toggle */}
        <div
          className="flex rounded-md overflow-hidden"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                borderRight: p !== 'Y' ? '1px solid #E5E7EB' : 'none',
                background: period === p ? 'var(--color-primary)' : 'white',
                color: period === p ? 'white' : 'var(--color-neutral-700)',
                transition: 'all 150ms ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={VISITING_HOURS_DATA}
            margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
            barCategoryGap="20%"
            barGap={1}
          >
            <defs>
              {AGE_GENDER_COLORS.map((color, i) => (
                <linearGradient key={i} id={`barGrad_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.35} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              width={36}
              label={{
                value: 'Visitors',
                angle: -90,
                position: 'insideLeft',
                offset: 8,
                style: { fontSize: 10, fill: '#9CA3AF', fontFamily: 'inherit' },
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(101,91,211,0.04)' }}
            />
            {AGE_GENDER_SERIES_KEYS.map((key, i) => (
              <Bar
                key={key}
                dataKey={key as keyof VisitingHoursDataPoint}
                name={AGE_GENDER_LABELS[i]}
                fill={`url(#barGrad_${i})`}
                maxBarSize={5}
                radius={[1, 1, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {AGE_GENDER_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
            <span className="text-[10px]" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
