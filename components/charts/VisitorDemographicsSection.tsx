'use client';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ApexOptions } from 'apexcharts';
import { ApexWrapper } from './ApexWrapper';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import {
  AGE_GENDER_COLORS,
  AGE_GENDER_LABELS,
  FOOTFALL_BREAKDOWN,
  MONTHLY_TREND_DATA,
} from '@/types/dashboard';

type Period = 'Monthly' | 'Yearly';
type Segment = 'Gender' | 'Age Groups';

function formatK(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
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

function DonutChart() {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 310,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    series: FOOTFALL_BREAKDOWN,
    labels: AGE_GENDER_LABELS,
    colors: AGE_GENDER_COLORS,
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              color: '#6B7280',
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              offsetY: -12,
              formatter: () => '15,234',
            },
            total: {
              show: true,
              label: 'Total Visitors',
              fontSize: '12px',
              color: '#6B7280',
              formatter: () => '15,234',
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ['#FFFFFF'] },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const total = FOOTFALL_BREAKDOWN.reduce((a, b) => a + b, 0);
          return `${((val / total) * 100).toFixed(1)}%`;
        },
      },
    },
  };

  return <ApexWrapper options={options} series={FOOTFALL_BREAKDOWN} type="donut" height={310} />;
}

export function VisitorDemographicsSection() {
  const [period, setPeriod] = useState<Period>('Monthly');
  const [segment, setSegment] = useState<Segment>('Gender');

  return (
    <div className="card">
      <div className="flex gap-6" style={{ minHeight: 400 }}>
        {/* Left: donut */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-neutral-500)' }}>
            Visitor Demographics
          </p>
          <DonutChart />
          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
            {AGE_GENDER_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
                <span className="text-[10px]" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#F3F4F6', flexShrink: 0, alignSelf: 'stretch' }} />

        {/* Right: trend line chart */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-neutral-500)' }}>
              Gender / Age Trend Over Time
            </p>
            {/* Period + segment toggles */}
            <div className="flex items-center gap-2">
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
              <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                {(['Gender', 'Age Groups'] as Segment[]).map((s, idx) => (
                  <button
                    key={s}
                    onClick={() => setSegment(s)}
                    style={{
                      padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      border: 'none', borderRight: idx === 0 ? '1px solid #E5E7EB' : 'none',
                      background: segment === s ? 'var(--color-primary)' : 'white',
                      color: segment === s ? 'white' : 'var(--color-neutral-700)',
                      transition: 'all 150ms',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1" style={{ minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TREND_DATA} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="male"
                  name="Male"
                  stroke="#0DA2FF"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0DA2FF', strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="female"
                  name="Female"
                  stroke="#EE0F6B"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#EE0F6B', strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
