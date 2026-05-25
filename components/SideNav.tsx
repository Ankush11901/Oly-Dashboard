'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavSection {
  label: string;
  sectionKey: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Home',
    sectionKey: 'home',
    icon: <Home size={16} strokeWidth={1.5} />,
    defaultOpen: true,
    items: [
      { label: 'Insights Dashboard', href: '/dashboard', icon: <BarChart2 size={14} strokeWidth={1.5} /> },
      { label: 'Checklist & Tasks', href: '/dashboard/checklist', icon: <ClipboardList size={14} strokeWidth={1.5} /> },
      { label: 'Forecast', href: '/dashboard/forecast', icon: <TrendingUp size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Team Management',
    sectionKey: 'team',
    icon: <Users size={16} strokeWidth={1.5} />,
    items: [
      { label: 'Staff / Team', href: '/dashboard/team/staff', icon: <Users size={14} strokeWidth={1.5} /> },
      { label: 'Permissions', href: '/dashboard/team/permissions', icon: <ShieldCheck size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Analytics',
    sectionKey: 'analytics',
    icon: <BarChart2 size={16} strokeWidth={1.5} />,
    defaultOpen: true,
    items: [
      { label: 'Traffic', href: '/dashboard/analytics/traffic', icon: <TrendingUp size={14} strokeWidth={1.5} /> },
      { label: 'Queue Management', href: '/dashboard/analytics/queue', icon: <Radio size={14} strokeWidth={1.5} /> },
      { label: 'Qualified Shopper Insights', href: '/dashboard/analytics/shoppers', icon: <UserCircle size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Live Feed',
    sectionKey: 'live',
    icon: <Video size={16} strokeWidth={1.5} />,
    items: [
      { label: 'VMS Monitoring', href: '/dashboard/live/vms', icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Preferences',
    sectionKey: 'preferences',
    icon: <Settings size={16} strokeWidth={1.5} />,
    items: [
      { label: 'Profile', href: '/dashboard/preferences/profile', icon: <UserCircle size={14} strokeWidth={1.5} /> },
      { label: 'Notification Settings', href: '/dashboard/preferences/notifications', icon: <Bell size={14} strokeWidth={1.5} /> },
      { label: 'Password & Access', href: '/dashboard/preferences/password', icon: <Lock size={14} strokeWidth={1.5} /> },
      { label: 'Device Settings', href: '/dashboard/preferences/devices', icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
];

export function SideNav() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_SECTIONS.map((s) => [s.sectionKey, s.defaultOpen ?? false]))
  );

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive = (href: string) => pathname === href;
  const sectionHasActive = (section: NavSection) => section.items.some((i) => isActive(i.href));

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0 overflow-y-auto"
      style={{
        width: 'var(--sidebar-width)',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ height: 64, borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          O
        </div>
        <span className="font-bold text-base tracking-tight" style={{ color: 'var(--color-neutral-900)' }}>
          OlyRetail
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSections[section.sectionKey];
          const hasActive = sectionHasActive(section);

          return (
            <div key={section.sectionKey}>
              {/* Section header */}
              <button
                onClick={() => toggle(section.sectionKey)}
                className="w-full flex items-center gap-2.5 rounded-lg text-left transition-colors"
                style={{
                  height: 38,
                  padding: '0 10px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: hasActive ? 'var(--color-primary)' : '#374151',
                  background: hasActive ? 'var(--color-primary-light)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!hasActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!hasActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ color: hasActive ? 'var(--color-primary)' : '#6B7280', flexShrink: 0 }}>
                  {section.icon}
                </span>
                <span className="flex-1 truncate">{section.label}</span>
                <span style={{ color: '#9CA3AF' }}>
                  {isOpen
                    ? <ChevronDown size={13} strokeWidth={2} />
                    : <ChevronRight size={13} strokeWidth={2} />
                  }
                </span>
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="mt-0.5 mb-1 space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 rounded-lg transition-colors"
                        style={{
                          height: 34,
                          paddingLeft: 32,
                          paddingRight: 10,
                          fontSize: 13,
                          fontWeight: active ? 500 : 400,
                          color: active ? 'var(--color-primary)' : '#4B5563',
                          background: active ? 'var(--color-primary-light)' : 'transparent',
                          borderLeft: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                          textDecoration: 'none',
                          display: 'flex',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <span style={{ flexShrink: 0, color: active ? 'var(--color-primary)' : '#9CA3AF' }}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>Admin Manager</p>
            <p className="text-xs truncate" style={{ color: '#6B7280' }}>admin@olyretail.com</p>
          </div>
          <Settings size={14} strokeWidth={1.5} style={{ color: '#9CA3AF', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
