'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Users, BarChart2, Video, Settings,
  ClipboardList, TrendingUp, ShieldCheck,
  Radio, UserCircle, Bell, Lock, Monitor, LayoutGrid,
} from 'lucide-react';
import { ChartSelector, ALL_WIDGETS } from '@/components/ChartSelector';

interface NavItem { label: string; href: string; icon: React.ReactNode }
interface NavSection { label: string; icon: React.ReactNode; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Home',
    icon: <Home size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Insights Dashboard', href: '/dashboard',          icon: <BarChart2 size={14} strokeWidth={1.5} /> },
      { label: 'Checklist & Tasks',  href: '/dashboard#checklist', icon: <ClipboardList size={14} strokeWidth={1.5} /> },
      { label: 'Forecast',           href: '/dashboard#forecast',  icon: <TrendingUp size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Team Management',
    icon: <Users size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Staff / Team',  href: '/dashboard/team/staff',       icon: <Users size={14} strokeWidth={1.5} /> },
      { label: 'Permissions',   href: '/dashboard/team/permissions',  icon: <ShieldCheck size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChart2 size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Traffic',                    href: '/dashboard/analytics/traffic',  icon: <TrendingUp size={14} strokeWidth={1.5} /> },
      { label: 'Queue Management',           href: '/dashboard/analytics/queue',    icon: <Radio size={14} strokeWidth={1.5} /> },
      { label: 'Qualified Shopper Insights', href: '/dashboard/analytics/shoppers', icon: <UserCircle size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Live Feed',
    icon: <Video size={14} strokeWidth={1.5} />,
    items: [
      { label: 'VMS Monitoring', href: '/dashboard/live/vms', icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Preferences',
    icon: <Settings size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Profile',               href: '/dashboard/preferences/profile',       icon: <UserCircle size={14} strokeWidth={1.5} /> },
      { label: 'Notification Settings', href: '/dashboard/preferences/notifications', icon: <Bell size={14} strokeWidth={1.5} /> },
      { label: 'Password & Access',     href: '/dashboard/preferences/password',      icon: <Lock size={14} strokeWidth={1.5} /> },
      { label: 'Device Settings',       href: '/dashboard/preferences/devices',       icon: <Monitor size={14} strokeWidth={1.5} /> },
    ],
  },
];

const DEFAULT_ENABLED = new Set(ALL_WIDGETS.slice(0, 5).map((w) => w.id));

export function SideNav() {
  const pathname = usePathname();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(DEFAULT_ENABLED);

  const isActive = (href: string) =>
    href.includes('#') ? pathname === href.split('#')[0] : pathname === href;

  const toggleWidget = (id: string) => {
    setEnabledWidgets((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <aside
        className="flex flex-col h-full flex-shrink-0 overflow-y-auto"
        style={{ width: 'var(--sidebar-width)', background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 flex-shrink-0"
          style={{ height: 64, borderBottom: '1px solid #E5E7EB' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
            style={{ background: '#655BD3' }}
          >O</div>
          <span className="font-bold text-base tracking-tight" style={{ color: '#111827' }}>OlyRetail</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              <div className="flex items-center gap-2 px-2 mb-2">
                <span style={{ color: '#9CA3AF' }}>{section.icon}</span>
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: '#9CA3AF', letterSpacing: '0.06em' }}
                >
                  {section.label}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-lg transition-colors"
                      style={{
                        height: 36,
                        paddingLeft: 10,
                        paddingRight: 10,
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 500,
                        color: active ? '#655BD3' : '#374151',
                        background: active ? '#EEE9FF' : 'transparent',
                        borderLeft: active ? '2px solid #655BD3' : '2px solid transparent',
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
                      <span style={{ flexShrink: 0, color: active ? '#655BD3' : '#6B7280' }}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Customise Home Charts button */}
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            onClick={() => setSelectorOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
            style={{
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              color: '#655BD3',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#EEE9FF'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#F5F3FF'}
          >
            <LayoutGrid size={14} strokeWidth={1.5} />
            <span className="flex-1 text-left">Customise Home Charts</span>
            <span
              className="rounded-full text-xs font-bold px-1.5 py-0.5"
              style={{ background: '#655BD3', color: 'white', fontSize: 10 }}
            >
              {enabledWidgets.size}
            </span>
          </button>
        </div>

        {/* Bottom user */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: '#655BD3' }}
            >AM</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>Admin Manager</p>
              <p className="text-xs truncate" style={{ color: '#6B7280' }}>admin@olyretail.com</p>
            </div>
            <Settings size={14} strokeWidth={1.5} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      <ChartSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        enabled={enabledWidgets}
        onToggle={toggleWidget}
      />
    </>
  );
}
