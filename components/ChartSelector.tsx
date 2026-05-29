'use client';
import { X, BarChart2, TrendingUp, PieChart, Activity, Users, Zap, Store, Check } from 'lucide-react';

export interface ChartWidget {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'footfall' | 'conversion' | 'demographics' | 'stores';
}

export const ALL_WIDGETS: ChartWidget[] = [
  { id: 'footfall_trend',    label: 'Footfall & Passerby',          description: 'Monthly area chart',        icon: <TrendingUp size={16} strokeWidth={1.5} />,  category: 'footfall' },
  { id: 'top_stores',        label: 'Top Stores by Visitors',       description: 'Ranked list of stores',     icon: <Store size={16} strokeWidth={1.5} />,       category: 'stores' },
  { id: 'demographics_donut',label: 'Visitor Demographics',         description: 'Age × gender donut',        icon: <PieChart size={16} strokeWidth={1.5} />,    category: 'demographics' },
  { id: 'conversion_donut',  label: 'Conversion Rate',              description: 'Store conversion donut',    icon: <Zap size={16} strokeWidth={1.5} />,         category: 'conversion' },
  { id: 'gender_trend',      label: 'Gender Trend',                 description: 'Male vs female line chart', icon: <Users size={16} strokeWidth={1.5} />,       category: 'demographics' },
  { id: 'overall_conversion',label: 'Overall Conversion',           description: 'Hourly passerby vs entry',  icon: <BarChart2 size={16} strokeWidth={1.5} />,   category: 'conversion' },
  { id: 'visiting_hours',    label: 'Store Visiting Hours',         description: 'Peak hour area chart',      icon: <Activity size={16} strokeWidth={1.5} />,    category: 'footfall' },
];

const CATEGORY_LABELS: Record<ChartWidget['category'], string> = {
  footfall:     'Footfall',
  conversion:   'Conversion',
  demographics: 'Demographics',
  stores:       'Stores',
};
const CATEGORY_COLORS: Record<ChartWidget['category'], string> = {
  footfall:     'var(--chart-1)',
  conversion:   'var(--chart-3)',
  demographics: 'var(--chart-5)',
  stores:       'var(--chart-4)',
};

interface Props {
  open: boolean;
  onClose: () => void;
  enabled: Set<string>;
  onToggle: (id: string) => void;
}

const MiniChart = ({ id }: { id: string }) => {
  switch (id) {
    case 'footfall_trend':
    case 'gender_trend':
    case 'visiting_hours':
      return (
        <svg viewBox="0 0 100 40" className="w-full h-10 opacity-70">
          <path d="M0,40 L0,30 C20,25 30,10 50,20 C70,30 80,5 100,10 L100,40 Z" fill="currentColor" opacity="0.3" />
          <path d="M0,30 C20,25 30,10 50,20 C70,30 80,5 100,10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'demographics_donut':
    case 'conversion_donut':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 mx-auto opacity-70">
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="60 30" opacity="0.3" />
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="30 60" />
        </svg>
      );
    case 'top_stores':
    case 'overall_conversion':
      return (
        <div className="flex flex-col gap-1 w-full h-10 justify-center opacity-70">
          <div className="h-1.5 w-full bg-current rounded-full" />
          <div className="h-1.5 w-3/4 bg-current rounded-full opacity-70" />
          <div className="h-1.5 w-1/2 bg-current rounded-full opacity-50" />
        </div>
      );
    case 'kpi_metrics':
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-10 opacity-70">
          <div className="bg-current opacity-20 rounded" />
          <div className="bg-current opacity-40 rounded" />
          <div className="bg-current opacity-60 rounded" />
          <div className="bg-current opacity-80 rounded" />
        </div>
      );
    default:
      return <div className="h-10" />;
  }
};

export function ChartSelector({ open, onClose, enabled, onToggle }: Props) {
  const categories = Array.from(
    new Set(ALL_WIDGETS.map((w) => w.category))
  ) as ChartWidget['category'][];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 380,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), background 200ms ease, border-color 200ms ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', flexShrink: 0,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>Customise Dashboard</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 4, marginBottom: 0 }}>
              Select the charts you want to display on your home view.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)', cursor: 'pointer',
              color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            padding: '16px 24px', flexShrink: 0,
            background: 'var(--color-surface-2)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: 0 }}>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{enabled.size}</span>
            {' '}of {ALL_WIDGETS.length} active
          </p>
          <div
            style={{
              display: 'flex', borderRadius: 9999, overflow: 'hidden', marginTop: 10,
              background: 'var(--color-border)', height: 6,
            }}
          >
            <div
              style={{
                width: `${(enabled.size / ALL_WIDGETS.length) * 100}%`,
                background: 'var(--color-primary-emphasis)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Widget list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {categories.map((cat) => {
            const widgets = ALL_WIDGETS.filter((w) => w.category === cat);
            return (
              <div key={cat}>
                <p
                  style={{
                    marginBottom: 12, paddingLeft: 8,
                    fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: CATEGORY_COLORS[cat],
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {widgets.map((widget) => {
                    const on = enabled.has(widget.id);
                    const baseColor = on ? CATEGORY_COLORS[cat] : 'var(--color-text-4)';
                    const bgColor = on ? `${CATEGORY_COLORS[cat]}15` : 'var(--color-surface-2)';
                    const borderColor = on ? CATEGORY_COLORS[cat] : 'var(--color-border)';

                    return (
                      <button
                        key={widget.id}
                        onClick={() => onToggle(widget.id)}
                        style={{
                          position: 'relative', display: 'flex', flexDirection: 'column',
                          textAlign: 'left', padding: 12, borderRadius: 12,
                          border: `2px solid ${borderColor}`,
                          background: bgColor,
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                        }}
                      >
                        {on && (
                          <div
                            style={{
                              position: 'absolute', top: 8, right: 8,
                              padding: 2, borderRadius: 9999, color: 'white',
                              background: CATEGORY_COLORS[cat],
                            }}
                          >
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{ marginBottom: 8, color: baseColor }}>
                          <MiniChart id={widget.id} />
                        </div>
                        <div
                          style={{
                            marginTop: 'auto', paddingTop: 8,
                            borderTop: `1px solid ${on ? `${CATEGORY_COLORS[cat]}30` : 'var(--color-border)'}`,
                          }}
                        >
                          <p style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.3, color: on ? 'var(--color-text-1)' : 'var(--color-text-2)', margin: 0 }}>
                            {widget.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px', flexShrink: 0,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 8,
              fontSize: 13, fontWeight: 700, color: 'white',
              background: 'var(--color-primary-emphasis)', border: 'none', cursor: 'pointer',
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Apply Changes
          </button>
        </div>
      </aside>
    </>
  );
}
