'use client';
import { Trophy, Users, Clock, Zap } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { AGE_GENDER_COLORS, STORE_VISITOR_DATA } from '@/types/dashboard';

function SegmentedBar({ breakdown }: { breakdown: number[] }) {
  return (
    <div className="flex rounded-full overflow-hidden mt-1.5" style={{ height: 6 }}>
      {breakdown.map((pct, i) => (
        <div
          key={i}
          style={{ width: `${pct}%`, background: AGE_GENDER_COLORS[i], flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

function StoreRow({ name, visitors, breakdown, rank }: { name: string; visitors: number; breakdown: number[]; rank: number }) {
  return (
    <div className="py-2.5" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold tabular-nums w-4 text-center"
            style={{ color: 'var(--color-neutral-400)' }}
          >
            {rank}
          </span>
          <span className="text-sm font-medium truncate" style={{ color: 'var(--color-neutral-700)', maxWidth: 200 }}>
            {name}
          </span>
        </div>
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-neutral-900)' }}>
          {visitors.toLocaleString()}
        </span>
      </div>
      <div className="pl-6">
        <SegmentedBar breakdown={breakdown} />
      </div>
    </div>
  );
}

export function StorePerformanceSection() {
  const top = STORE_VISITOR_DATA[0];

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: Top performing store */}
      <div className="card flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={28} strokeWidth={1.5} style={{ color: '#F59E0B' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Top Performing Store Today</p>
          </div>
        </div>

        <h2 className="font-bold mb-5" style={{ fontSize: 26, color: 'var(--color-neutral-900)' }}>
          {top.name}
        </h2>

        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <Users size={18} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Total Visitors</p>
              <AnimatedNumber
                value={top.visitors}
                className="font-bold tabular-nums"
                style={{ fontSize: 20, color: 'var(--color-neutral-900)' } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-warning-light)' }}
            >
              <Clock size={18} strokeWidth={1.5} style={{ color: '#D97706' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Avg Per Hour</p>
              <AnimatedNumber
                value={1270}
                duration={1200}
                className="font-bold tabular-nums"
                style={{ fontSize: 20, color: 'var(--color-neutral-900)' } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-secondary-light)' }}
            >
              <Zap size={18} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Avg Per Minute</p>
              <AnimatedNumber
                value={21.2}
                duration={1200}
                decimals={1}
                className="font-bold tabular-nums"
                style={{ fontSize: 20, color: 'var(--color-neutral-900)' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Top stores by visitors */}
      <div className="card flex flex-col">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-1)' }}>
          Top Stores by Visitors
        </p>
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 360 }}>
          {STORE_VISITOR_DATA.map((store, i) => (
            <StoreRow
              key={store.name}
              rank={i + 1}
              name={store.name}
              visitors={store.visitors}
              breakdown={store.breakdown}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <p className="text-[10px] mb-1.5" style={{ color: 'var(--color-neutral-500)' }}>Age × Gender breakdown</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {['M 0-2','M 3-12','M 13-21','M 22-35','M 35+','F 0-2','F 3-12','F 13-21','F 22-35','F 35+'].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: AGE_GENDER_COLORS[i] }} />
                <span className="text-[10px]" style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
