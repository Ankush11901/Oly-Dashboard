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
import { Users, TrendingUp, Zap, Store, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PASSERBY_TREND_DATA, STORE_VISITOR_DATA, AGE_GENDER_COLORS } from '@/types/dashboard';

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, prefix, suffix, decimals, change, changeLabel, icon, iconBg, iconColor }: KpiCardProps) {
  const positive = change >= 0;
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
          style={{
            background: positive ? '#DCFCE7' : '#FEE2E2',
            color: positive ? '#15803D' : '#DC2626',
          }}
        >
          {positive
            ? <ArrowUpRight size={12} strokeWidth={2} />
            : <ArrowDownRight size={12} strokeWidth={2} />
          }
          {Math.abs(change)}%
        </span>
      </div>
      <div>
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="font-bold tabular-nums"
          style={{ fontSize: 28, color: '#111827', lineHeight: 1.2 } as React.CSSProperties}
        />
        <p className="text-sm font-medium mt-0.5" style={{ color: '#374151' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{changeLabel}</p>
      </div>
    </div>
  );
}

// ── Trend area chart ──────────────────────────────────────────────────────────
function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}
function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
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

function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={PASSERBY_TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="homeGradPasserby" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#655BD3" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="homeGradEntry" x1="0" y1="0" x2="0" y2="1">
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
        <Tooltip content={<TrendTooltip />} />
        <Area
          type="monotone"
          dataKey="passerby"
          name="Passerby"
          stroke="#655BD3"
          strokeWidth={2}
          fill="url(#homeGradPasserby)"
          dot={false}
          activeDot={{ r: 5, fill: '#655BD3', stroke: 'white', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="entryExit"
          name="Entry / Exit"
          stroke="#00CE9C"
          strokeWidth={2}
          fill="url(#homeGradEntry)"
          dot={false}
          activeDot={{ r: 5, fill: '#00CE9C', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Segmented bar for stores ──────────────────────────────────────────────────
function SegmentedBar({ breakdown }: { breakdown: number[] }) {
  return (
    <div className="flex rounded-full overflow-hidden" style={{ height: 5, marginTop: 4 }}>
      {breakdown.map((pct, i) => (
        <div
          key={i}
          style={{ width: `${pct}%`, background: AGE_GENDER_COLORS[i], flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [trendPeriod, setTrendPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            Good morning, Admin 👋
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            Here&apos;s what&apos;s happening across your stores today.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        <KpiCard
          label="Total Footfall"
          value={15234}
          change={8.2}
          changeLabel="vs. yesterday"
          icon={<Users size={20} strokeWidth={1.5} />}
          iconBg="#EEE9FF"
          iconColor="#655BD3"
        />
        <KpiCard
          label="Total Passerby"
          value={45621}
          change={3.1}
          changeLabel="vs. yesterday"
          icon={<TrendingUp size={20} strokeWidth={1.5} />}
          iconBg="#CCFBF1"
          iconColor="#00CE9C"
        />
        <KpiCard
          label="Avg Conversion Rate"
          value={12.4}
          suffix="%"
          decimals={1}
          change={1.2}
          changeLabel="vs. last week"
          icon={<Zap size={20} strokeWidth={1.5} />}
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <KpiCard
          label="Active Stores"
          value={8}
          change={0}
          changeLabel="all stores online"
          icon={<Store size={20} strokeWidth={1.5} />}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
        />
      </div>

      {/* Trend chart + Top stores */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Area chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                Footfall &amp; Passerby Trend
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Entry / exit vs passerby over time
              </p>
            </div>
            <div className="flex items-center gap-4 mr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#655BD3' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>Passerby</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#00CE9C' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>Entry / Exit</span>
              </div>
              <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                {(['Monthly', 'Yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    style={{
                      padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      border: 'none', borderRight: p === 'Monthly' ? '1px solid #E5E7EB' : 'none',
                      background: trendPeriod === p ? '#655BD3' : 'white',
                      color: trendPeriod === p ? 'white' : '#374151',
                      transition: 'all 150ms',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <TrendChart />
          </div>
        </div>

        {/* Top stores */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Top Stores</p>
            <span className="text-xs font-medium" style={{ color: '#655BD3' }}>by visitors</span>
          </div>
          <div className="flex-1 space-y-0.5">
            {STORE_VISITOR_DATA.slice(0, 6).map((store, i) => (
              <div
                key={store.name}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: i === 0 ? '#655BD3' : '#F3F4F6',
                    color: i === 0 ? 'white' : '#6B7280',
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>{store.name}</p>
                  <SegmentedBar breakdown={store.breakdown} />
                </div>
                <span className="text-sm font-semibold tabular-nums flex-shrink-0" style={{ color: '#374151' }}>
                  {store.visitors.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
            <p className="text-[10px]" style={{ color: '#9CA3AF', marginBottom: 6 }}>Age × Gender breakdown</p>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {['M 0-2','M 3-12','M 13-21','M 22-35','M 35+','F 0-2','F 3-12','F 13-21','F 22-35','F 35+'].map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
                  <span className="text-[10px]" style={{ color: '#6B7280' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
