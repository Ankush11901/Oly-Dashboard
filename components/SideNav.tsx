'use client';
import { useState } from 'react';
import {
  Home,
  Users,
  BarChart2,
  Video,
  Settings,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  Radio,
  UserCircle,
  Bell,
  Lock,
  Monitor,
} from 'lucide-react';

interface SubItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}
interface NavSection {
  label: string;
  icon: React.ReactNode;
  items: SubItem[];
  defaultOpen?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'HOME',
    icon: <Home size={20} strokeWidth={1.5} />,
    items: [
      { label: 'Insights Dashboard', icon: <BarChart2 size={14} strokeWidth={1.5} /> },
      { label: 'Checklist & Task Uploads', icon: <ClipboardList size={14} strokeWidth={1.5} /> },
      { label: 'Forecast', icon: <TrendingUp size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'TEAM MANAGEMENT',
    icon: <Users size={20} strokeWidth={1.5} />,
    items: [
      { label: 'Staff / Team', icon: <Users size={14} strokeWidth={1.5} /> },
      { label: 'Permissions', icon: <ShieldCheck size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'ANALYTICS',
    icon: <BarChart2 size={20} strokeWidth={1.5} />,
    defaultOpen: true,
    items: [
      { label: 'Traffic', icon: <TrendingUp size={14} strokeWidth={1.5} />, active: true },
      { label: 'Queue Management', icon: <Radio size={14} strokeWidth={1.5} /> },
      { label: 'Qualified Shopper Insights', icon: <UserCircle size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'LIVE FEED',
    icon: <Video size={20} strokeWidth={1.5} />,
    items: [
      { label: 'VMS Monitoring', icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'PREFERENCES',
    icon: <Settings size={20} strokeWidth={1.5} />,
    items: [
      { label: 'Profile', icon: <UserCircle size={14} strokeWidth={1.5} /> },
      { label: 'Notification Settings', icon: <Bell size={14} strokeWidth={1.5} /> },
      { label: 'Password & Access', icon: <Lock size={14} strokeWidth={1.5} /> },
      { label: 'Device Settings', icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
];

export function SideNav() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_SECTIONS.map((s) => [s.label, s.defaultOpen ?? false]))
  );

  const toggle = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      style={{ width: 'var(--sidebar-width)', background: 'var(--color-ink)' }}
      className="flex flex-col h-full overflow-y-auto flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          O
        </div>
        <span className="text-white font-bold text-base tracking-tight">OlyRetail</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSections[section.label];
          const hasActiveChild = section.items.some((i) => i.active);

          return (
            <div key={section.label} className="mb-1">
              {/* Section header (clickable parent) */}
              <button
                onClick={() => toggle(section.label)}
                className="w-full flex items-center gap-3 rounded-md text-left transition-colors"
                style={{
                  height: 40,
                  padding: '0 12px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: hasActiveChild ? '#FFFFFF' : '#D1D5DB',
                  background: hasActiveChild ? 'rgba(101,91,211,0.18)' : 'transparent',
                  borderLeft: hasActiveChild ? '3px solid var(--color-primary)' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!hasActiveChild)
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!hasActiveChild)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ color: hasActiveChild ? 'var(--color-primary)' : '#D1D5DB', flexShrink: 0 }}>
                  {section.icon}
                </span>
                <span className="flex-1 truncate">{section.label.charAt(0) + section.label.slice(1).toLowerCase().replace('_', ' ')}</span>
                <span style={{ color: '#6B7280' }}>
                  {isOpen ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
                </span>
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-2.5 rounded-md text-left transition-colors"
                      style={{
                        height: 36,
                        paddingLeft: 36,
                        paddingRight: 12,
                        fontSize: 13,
                        fontWeight: item.active ? 500 : 400,
                        color: item.active ? '#FFFFFF' : '#9CA3AF',
                        background: item.active ? 'rgba(101,91,211,0.25)' : 'transparent',
                        borderLeft: item.active ? '3px solid var(--color-primary)' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active)
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active)
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <span style={{ flexShrink: 0, color: item.active ? 'var(--color-primary)' : '#6B7280' }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin Manager</p>
            <p className="text-xs truncate" style={{ color: '#6B7280' }}>admin@olyretail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
