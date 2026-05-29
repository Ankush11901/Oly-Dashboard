'use client';

export interface RechartsTooltipPayloadItem {
  name: string;
  value: number | string;
  color: string;
}

interface RechartsChartTooltipProps {
  active?: boolean;
  payload?: RechartsTooltipPayloadItem[];
  label?: string;
  valueFormatter?: (value: number | string, name: string) => string;
}

/** Theme-aware tooltip — matches Analytics builder charts (surface + border tokens). */
export function RechartsChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: RechartsChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const format =
    valueFormatter ??
    ((v: number | string) => (typeof v === 'number' ? v.toLocaleString() : v));

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        transition: 'opacity var(--duration-fast) var(--ease-out)',
      }}
    >
      {label ? (
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-4)',
            marginBottom: 5,
            fontWeight: 600,
          }}
        >
          {label}
        </p>
      ) : null}
      {payload.map((entry, i) => (
        <div
          key={`${entry.name}-${i}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: i < payload.length - 1 ? 3 : 0,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 2,
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{entry.name}</span>
          <span
            style={{
              fontSize: 13,
              color: 'var(--color-text-1)',
              fontWeight: 700,
              marginLeft: 'auto',
              paddingLeft: 16,
            }}
          >
            {format(entry.value, entry.name)}
          </span>
        </div>
      ))}
    </div>
  );
}
