'use client';
import {
  Users, Zap, Activity, ShoppingBag,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useTheme } from '@/components/ThemeProvider';

export function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function buildKpiSparkline(change: number, seed: number): number[] {
  const n = 8;
  const positive = change >= 0;
  const strength = Math.min(Math.abs(change) / 12, 1);
  const rise = 6 + strength * 12;
  const start = 40 + (seed % 4) * 3;
  const end = positive ? start + rise : start - rise;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const trend = start + (end - start) * t;
    const wobble = Math.sin((i + seed * 1.4) * 1.05) * (1.2 + strength * 2.5);
    return Math.round(trend + wobble);
  });
}

function KpiTrendGlyph({ positive }: { positive: boolean }) {
  const color = positive ? 'var(--color-success)' : 'var(--color-error)';
  return (
    <svg width={16} height={10} viewBox="0 0 16 10" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      {positive ? (
        <polyline
          points="1,8 5,5 9,6 15,1"
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <polyline
          points="1,2 5,5 9,4 15,9"
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
function KpiSparkline({ data, color, compact = false }: { data: number[]; color: string; compact?: boolean }) {
  const W = compact ? 64 : 76;
  const H = compact ? 30 : 38;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = 2 + (i / (data.length - 1)) * (W - 4);
      const y = H - 3 - ((v - min) / range) * (H - 8);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ flexShrink: 0, display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={compact ? 2 : 2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiSparklineArea({
  data,
  color,
  gradId,
  compact = false,
}: {
  data: number[];
  color: string;
  gradId: string;
  compact?: boolean;
}) {
  const W = compact ? 88 : 108;
  const H = compact ? 58 : 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const coords = data.map((v, i) => ({
    x: 2 + (i / (data.length - 1)) * (W - 4),
    y: H - 4 - ((v - min) / range) * (H - 12),
  }));
  const linePts = coords.map(c => `${c.x},${c.y}`).join(' ');
  const areaPath =
    `M${coords[0].x},${H} ` +
    coords.map(c => `L${c.x},${c.y}`).join(' ') +
    ` L${coords[coords.length - 1].x},${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface KpiCardData {
  label: string;
  actual: number;
  expected: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export const KPI_CARDS: KpiCardData[] = [
  { label: 'Total Footfall', actual: 15234, expected: 18000, change: 8.2, icon: <Users size={18} strokeWidth={1.5} />, color: '#655BD3' },
  { label: 'Passerby Count', actual: 45621, expected: 50000, change: 3.1, icon: <Activity size={18} strokeWidth={1.5} />, color: '#0EA5E9' },
  { label: 'Avg Conversion', actual: 12.4, expected: 15, change: -1.2, icon: <Zap size={18} strokeWidth={1.5} />, color: '#F59E0B', suffix: '%', decimals: 1 },
  { label: 'Top Store Visitors', actual: 15234, expected: 17000, change: 5.7, icon: <ShoppingBag size={18} strokeWidth={1.5} />, color: '#10B981' },
];

export function KpiCard({
  card,
  styleVariant = 0,
  sparkIndex = 0,
  grouped = false,
  readableLabel = false,
}: {
  card: KpiCardData;
  styleVariant?: 0 | 1 | 2 | 3;
  sparkIndex?: number;
  grouped?: boolean;
  readableLabel?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pos = card.change >= 0;

  if (styleVariant === 0) {
    return (
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 10,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
        border: `1px solid ${card.color}22`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${card.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <AnimatedNumber value={card.actual} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} className="font-bold tabular-nums" style={{ fontSize: 26, color: 'var(--color-text-1)', lineHeight: 1 } as React.CSSProperties} />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: pos ? 'var(--color-success)' : 'var(--color-error)', background: pos ? 'var(--color-success-light)' : 'var(--color-error-light)', padding: '3px 7px', borderRadius: 99, flexShrink: 0, alignSelf: 'flex-start' }}>
            {pos ? <ArrowUpRight size={10} strokeWidth={2.5} /> : <ArrowDownRight size={10} strokeWidth={2.5} />}
            {Math.abs(card.change)}%
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-3)', lineHeight: 1.2 }}>{card.label}</p>
      </div>
    );
  }

  if (styleVariant === 1) {
    const accent = card.color;
    const sparkData = buildKpiSparkline(card.change, sparkIndex);
    const changeColor = pos ? 'var(--color-success)' : 'var(--color-error)';
    const valueColor = isDark ? 'var(--color-text-1)' : `color-mix(in srgb, ${accent} 72%, #0F172A)`;
    const labelColor = isDark ? 'var(--color-text-3)' : `color-mix(in srgb, ${accent} 50%, #64748B)`;
    const sparkColor = isDark ? `color-mix(in srgb, ${accent} 75%, var(--color-text-2))` : `color-mix(in srgb, ${accent} 80%, #1E293B)`;

    return (
      <div style={{
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: isDark
          ? `linear-gradient(152deg, ${hexAlpha(accent, 0.16)} 0%, ${hexAlpha(accent, 0.05)} 42%, var(--color-surface-2) 100%)`
          : `linear-gradient(152deg, ${hexAlpha(accent, 0.28)} 0%, ${hexAlpha(accent, 0.09)} 48%, #FFFFFF 100%)`,
        border: `1px solid ${isDark ? hexAlpha(accent, 0.14) : hexAlpha(accent, 0.12)}`,
        boxShadow: isDark ? 'var(--shadow-card)' : `0 2px 12px ${hexAlpha(accent, 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
            background: isDark
              ? `linear-gradient(145deg, color-mix(in srgb, ${accent} 55%, #FFFFFF) 0%, color-mix(in srgb, ${accent} 88%, #13161B) 100%)`
              : `linear-gradient(145deg, color-mix(in srgb, ${accent} 70%, #FFFFFF) 0%, ${accent} 100%)`,
            boxShadow: isDark ? `0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)` : `0 6px 18px ${hexAlpha(accent, 0.38)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
            flexShrink: 0,
          }}>
            {card.icon}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: changeColor, marginTop: 1 }}>
            {pos ? '+' : '−'}{Math.abs(card.change)}%
            {pos ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: labelColor, lineHeight: 1.2, marginBottom: 4 }}>{card.label}</p>
            <AnimatedNumber value={card.actual} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} className="font-bold tabular-nums" style={{ fontSize: 24, color: valueColor, lineHeight: 1, letterSpacing: '-0.02em' } as React.CSSProperties} />
          </div>
          <KpiSparkline data={sparkData} color={sparkColor} compact />
        </div>
      </div>
    );
  }

  // Style 3 — reference layout + style-2 area chart on the right
  if (styleVariant === 3) {
    const isFeatured = sparkIndex === 0;
    const sparkData = buildKpiSparkline(card.change, sparkIndex);
    const sparkColor = pos
      ? (isFeatured
        ? (isDark ? 'color-mix(in srgb, var(--color-primary-emphasis) 75%, #FFFFFF)' : 'var(--color-primary-emphasis)')
        : (isDark ? `color-mix(in srgb, ${card.color} 70%, #FFFFFF)` : card.color))
      : 'var(--color-error)';
    const trendColor = pos ? 'var(--color-success)' : 'var(--color-error)';
    const trendBg = pos ? 'var(--color-success-light)' : 'var(--color-error-light)';
    const comparisonColor = isFeatured ? 'var(--color-text-3)' : 'var(--color-text-4)';

    return (
      <div
        style={{
          background: isFeatured ? 'var(--color-accent-bg)' : 'var(--color-surface)',
          borderRadius: 12,
          padding: '14px 16px',
          boxShadow: 'var(--shadow-card)',
          border: isFeatured ? '1px solid var(--color-accent-border)' : '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: 12,
          minHeight: 118,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isFeatured ? 'var(--color-surface)' : (isDark ? 'var(--color-surface-3)' : 'var(--color-surface-2)'),
                border: `1px solid ${isFeatured ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFeatured ? 'var(--color-primary)' : 'var(--color-text-1)',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text-1)',
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {card.label}
            </p>
          </div>

          <AnimatedNumber
            value={card.actual}
            prefix={card.prefix}
            suffix={card.suffix}
            decimals={card.decimals}
            className="font-bold tabular-nums"
            style={{
              fontSize: 26,
              color: 'var(--color-text-1)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            } as React.CSSProperties}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px 3px 6px',
                borderRadius: 99,
                background: trendBg,
                fontSize: 11,
                fontWeight: 700,
                color: trendColor,
                lineHeight: 1,
              }}
            >
              <KpiTrendGlyph positive={pos} />
              {Math.abs(card.change).toFixed(1)}%
            </span>
            <span style={{ fontSize: 11, fontWeight: 400, color: comparisonColor, lineHeight: 1.2 }}>
              vs last week
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, alignSelf: 'center' }}>
          <KpiSparklineArea data={sparkData} color={sparkColor} gradId={`kpi-s3-${sparkIndex}`} compact />
        </div>
      </div>
    );
  }

  // Style 2 — unified panel with area sparkline
  const sparkData = buildKpiSparkline(card.change, sparkIndex);
  const sparkColor = pos
    ? (isDark ? `color-mix(in srgb, ${card.color} 70%, #FFFFFF)` : card.color)
    : 'var(--color-error)';
  const trendTextColor = pos ? 'var(--color-success)' : 'var(--color-error)';
  const trendBg = pos
    ? (isDark ? 'rgba(74, 222, 128, 0.14)' : '#DCFCE7')
    : (isDark ? 'rgba(248, 113, 113, 0.14)' : '#FEE2E2');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: 16,
      padding: grouped ? '20px 24px' : '20px 22px',
      minHeight: 112,
      background: grouped ? 'transparent' : 'var(--color-surface)',
      borderRadius: grouped ? 0 : 12,
      border: grouped ? 'none' : `1px solid var(--color-border)`,
      boxShadow: grouped ? 'none' : 'var(--shadow-card)',
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: readableLabel ? 'var(--text-md)' : 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-1)', lineHeight: 1.35, marginBottom: 14 }}>{card.label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <AnimatedNumber value={card.actual} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} className="font-bold tabular-nums" style={{ fontSize: 32, color: 'var(--color-text-1)', lineHeight: 1, letterSpacing: '-0.03em' } as React.CSSProperties} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: trendTextColor }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: trendBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {pos ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
            </span>
            {Math.abs(card.change)}%
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-3)', lineHeight: 1.45 }}>compared to last week</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <KpiSparklineArea data={sparkData} color={sparkColor} gradId={`kpi-s2-${sparkIndex}`} />
      </div>
    </div>
  );
}

export function KpiPanelGrouped({ refreshCount }: { refreshCount: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {KPI_CARDS.map((card, i) => (
        <div key={`${card.label}-${refreshCount}`} style={{ borderRight: i < KPI_CARDS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <KpiCard card={card} styleVariant={2} sparkIndex={i} grouped />
        </div>
      ))}
    </div>
  );
}

/** Spaced KPI row for hybrid home — separate cards with readable labels. */
export function KpiPanelSpaced({ refreshCount }: { refreshCount: number }) {
  return (
    <div className="hybrid-kpi-grid">
      {KPI_CARDS.map((card, i) => (
        <div key={`${card.label}-${refreshCount}`} className="hybrid-kpi-grid__cell">
          <KpiCard card={card} styleVariant={2} sparkIndex={i} grouped readableLabel />
        </div>
      ))}
    </div>
  );
}
