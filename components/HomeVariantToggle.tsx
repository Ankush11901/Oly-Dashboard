'use client';

import { useDashboardContext } from '@/components/DashboardProvider';

const VARIANT_LABELS = ['Classic', 'Bento Board', 'Widgets'] as const;

export function HomeVariantToggle() {
  const { homeVariant, setHomeVariant } = useDashboardContext();

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
      role="group"
      aria-label="Home layout"
    >
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-4)', whiteSpace: 'nowrap' }}>
        {VARIANT_LABELS[homeVariant]}
      </span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {([0, 1, 2] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setHomeVariant(v)}
            title={VARIANT_LABELS[v]}
            aria-label={`Switch to ${VARIANT_LABELS[v]} layout`}
            aria-pressed={homeVariant === v}
            style={{
              width: homeVariant === v ? 22 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'block',
              background: homeVariant === v ? 'var(--color-primary-emphasis)' : 'var(--color-border)',
              transition: 'all 250ms cubic-bezier(0,0,0.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
