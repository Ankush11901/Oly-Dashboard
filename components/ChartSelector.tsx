'use client';
import { X, BarChart2, TrendingUp, PieChart, Activity, Users, Zap, Store, GripVertical } from 'lucide-react';

export interface ChartWidget {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'footfall' | 'conversion' | 'demographics' | 'stores';
}

export const ALL_WIDGETS: ChartWidget[] = [
  { id: 'footfall_trend',    label: 'Footfall & Passerby Trend',    description: 'Monthly area chart of passerby vs. store entry/exit', icon: <TrendingUp size={16} strokeWidth={1.5} />,  category: 'footfall' },
  { id: 'top_stores',        label: 'Top Stores by Visitors',        description: 'Ranked list of stores with demographic breakdown bars',  icon: <Store size={16} strokeWidth={1.5} />,       category: 'stores' },
  { id: 'kpi_metrics',       label: 'KPI Metric Cards',              description: 'Footfall, passerby, conversion rate, active stores',    icon: <Activity size={16} strokeWidth={1.5} />,    category: 'footfall' },
  { id: 'demographics_donut',label: 'Visitor Demographics Donut',    description: 'Age × gender breakdown donut chart',                    icon: <PieChart size={16} strokeWidth={1.5} />,    category: 'demographics' },
  { id: 'conversion_donut',  label: 'Conversion Rate Donut',         description: 'Average conversion rate with store-level breakdown',    icon: <Zap size={16} strokeWidth={1.5} />,         category: 'conversion' },
  { id: 'gender_trend',      label: 'Gender Trend Over Time',        description: 'Male vs. female visitor line chart by month',           icon: <Users size={16} strokeWidth={1.5} />,       category: 'demographics' },
  { id: 'overall_conversion',label: 'Overall Conversion Chart',      description: 'Hourly passerby/entry bars with conversion rate line',  icon: <BarChart2 size={16} strokeWidth={1.5} />,   category: 'conversion' },
  { id: 'visiting_hours',    label: 'Store Visiting Hours',          description: 'Peak hour breakdown by age × gender group',            icon: <Activity size={16} strokeWidth={1.5} />,    category: 'footfall' },
];

const CATEGORY_LABELS: Record<ChartWidget['category'], string> = {
  footfall:     'Footfall',
  conversion:   'Conversion',
  demographics: 'Demographics',
  stores:       'Stores',
};
const CATEGORY_COLORS: Record<ChartWidget['category'], string> = {
  footfall:     '#655BD3',
  conversion:   '#D97706',
  demographics: '#EC4899',
  stores:       '#2563EB',
};

interface Props {
  open: boolean;
  onClose: () => void;
  enabled: Set<string>;
  onToggle: (id: string) => void;
}

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
          style={{ background: 'rgba(0,0,0,0.18)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 340,
          background: '#FFFFFF',
          borderLeft: '1px solid #E5E7EB',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <p className="font-semibold" style={{ fontSize: 14, color: '#111827' }}>Customise Home Charts</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              Toggle widgets on or off. Drag to reorder.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 py-3 flex-shrink-0" style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            <span className="font-semibold" style={{ color: '#111827' }}>{enabled.size}</span>
            {' '}of {ALL_WIDGETS.length} widgets enabled
          </p>
          <div className="flex rounded-full overflow-hidden mt-2" style={{ height: 5, background: '#E5E7EB' }}>
            <div
              style={{
                width: `${(enabled.size / ALL_WIDGETS.length) * 100}%`,
                background: '#655BD3',
                transition: 'width 200ms ease',
              }}
            />
          </div>
        </div>

        {/* Widget list */}
        <div className="flex-1 overflow-y-auto py-2">
          {categories.map((cat) => {
            const widgets = ALL_WIDGETS.filter((w) => w.category === cat);
            return (
              <div key={cat} className="mb-1">
                <p
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: CATEGORY_COLORS[cat] }}
                >
                  {CATEGORY_LABELS[cat]}
                </p>
                {widgets.map((widget) => {
                  const on = enabled.has(widget.id);
                  return (
                    <div
                      key={widget.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors"
                      style={{
                        borderBottom: '1px solid #F9FAFB',
                        background: on ? '#FAFAFE' : 'transparent',
                      }}
                    >
                      {/* Drag handle (visual only) */}
                      <span style={{ color: '#D1D5DB', flexShrink: 0, cursor: 'grab' }}>
                        <GripVertical size={14} strokeWidth={1.5} />
                      </span>

                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: on ? 'rgba(101,91,211,0.12)' : '#F3F4F6',
                          color: on ? '#655BD3' : '#9CA3AF',
                        }}
                      >
                        {widget.icon}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: on ? '#111827' : '#374151' }}>
                          {widget.label}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>
                          {widget.description}
                        </p>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => onToggle(widget.id)}
                        className="relative inline-flex items-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 10,
                          background: on ? '#655BD3' : '#D1D5DB',
                          transition: 'background 180ms ease',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        aria-label={`Toggle ${widget.label}`}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: 'white',
                            left: on ? 19 : 3,
                            transition: 'left 180ms ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #F3F4F6' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: '#655BD3' }}
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
}
