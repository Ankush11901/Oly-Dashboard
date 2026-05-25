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
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 380,
          background: '#FFFFFF',
          borderLeft: '1px solid #E5E7EB',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: 16 }}>Customise Dashboard</p>
            <p className="text-xs text-gray-500 mt-1">
              Select the charts you want to display on your home view.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-500"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 flex-shrink-0 bg-gray-50" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <p className="text-sm text-gray-600">
            <span className="font-bold text-indigo-600">{enabled.size}</span>
            {' '}of {ALL_WIDGETS.length} active
          </p>
          <div className="flex rounded-full overflow-hidden mt-2.5 bg-gray-200" style={{ height: 6 }}>
            <div
              style={{
                width: `${(enabled.size / ALL_WIDGETS.length) * 100}%`,
                background: '#4F46E5',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Widget list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map((cat) => {
            const widgets = ALL_WIDGETS.filter((w) => w.category === cat);
            return (
              <div key={cat}>
                <p
                  className="mb-3 px-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: CATEGORY_COLORS[cat] }}
                >
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {widgets.map((widget) => {
                    const on = enabled.has(widget.id);
                    const baseColor = on ? CATEGORY_COLORS[cat] : '#9CA3AF';
                    const bgColor = on ? `${CATEGORY_COLORS[cat]}15` : '#F9FAFB'; // 15 is hex for ~8% opacity
                    const borderColor = on ? CATEGORY_COLORS[cat] : '#E5E7EB';
                    
                    return (
                      <button
                        key={widget.id}
                        onClick={() => onToggle(widget.id)}
                        className="relative flex flex-col text-left p-3 rounded-xl border-2 transition-all duration-200"
                        style={{
                          background: bgColor,
                          borderColor: borderColor,
                        }}
                      >
                        {on && (
                          <div className="absolute top-2 right-2 p-0.5 rounded-full text-white" style={{ background: CATEGORY_COLORS[cat] }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div className="mb-2" style={{ color: baseColor }}>
                          <MiniChart id={widget.id} />
                        </div>
                        <div className="mt-auto pt-2 border-t" style={{ borderColor: on ? `${CATEGORY_COLORS[cat]}30` : '#E5E7EB' }}>
                          <p className="text-xs font-bold leading-tight" style={{ color: on ? '#111827' : '#4B5563' }}>
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
        <div className="px-6 py-4 flex-shrink-0 bg-white" style={{ borderTop: '1px solid #F3F4F6' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors bg-indigo-600 hover:bg-indigo-700"
          >
            Apply Changes
          </button>
        </div>
      </aside>
    </>
  );
}
