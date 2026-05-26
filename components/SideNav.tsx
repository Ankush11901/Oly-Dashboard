'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Users, BarChart2, Video, Settings,
  ShieldCheck, UserCircle, Bell, Lock, Monitor, ChevronDown,
} from 'lucide-react';

interface NavItem { label: string; href: string }
interface NavEntry {
  type: 'flat';
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavSection {
  type: 'section';
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}
type NavNode = NavEntry | NavSection;

const NAV_NODES: NavNode[] = [
  {
    type: 'flat',
    label: 'Home',
    href: '/dashboard',
    icon: <Home size={16} strokeWidth={1.5} />,
  },
  {
    type: 'section',
    label: 'Team Management',
    icon: <Users size={16} strokeWidth={1.5} />,
    items: [
      { label: 'Staff / Team',  href: '/dashboard/team/staff' },
      { label: 'Permissions',   href: '/dashboard/team/permissions' },
    ],
  },
  {
    type: 'flat',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart2 size={16} strokeWidth={1.5} />,
  },
  {
    type: 'flat',
    label: 'Live Feed',
    href: '/dashboard/live/vms',
    icon: <Video size={16} strokeWidth={1.5} />,
  },
  {
    type: 'section',
    label: 'Preferences',
    icon: <Settings size={16} strokeWidth={1.5} />,
    items: [
      { label: 'Profile',               href: '/dashboard/preferences/profile' },
      { label: 'Notification Settings', href: '/dashboard/preferences/notifications' },
      { label: 'Password & Access',     href: '/dashboard/preferences/password' },
      { label: 'Device Settings',       href: '/dashboard/preferences/devices' },
      { label: 'My Tickets',            href: '/dashboard/preferences/tickets' },
    ],
  },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const TOP_ITEM: React.CSSProperties = {
  height: 40,
  paddingLeft: 12,
  paddingRight: 10,
  fontSize: 13.5,
  fontWeight: 500,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
};

const SUB_ITEM: React.CSSProperties = {
  height: 32,
  paddingLeft: 38,
  paddingRight: 10,
  fontSize: 12.5,
  fontWeight: 400,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease',
};

export function SideNav() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([]));

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0 overflow-y-auto"
      style={{ width: 'var(--sidebar-width)', background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 flex-shrink-0"
        style={{ height: 64, borderBottom: '1px solid #E5E7EB' }}
      >
        <img
          src="/oly-logo.svg"
          alt="OlyRetail"
          style={{ height: 26, width: 'auto', objectFit: 'contain', maxWidth: 140 }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_NODES.map((node) => {
          /* ── Flat link (Home, Analytics) ── */
          if (node.type === 'flat') {
            const active = isActive(node.href);
            return (
              <Link
                key={node.href}
                href={node.href}
                style={{
                  ...TOP_ITEM,
                  color: active ? '#655BD3' : '#374151',
                  background: active ? '#EEE9FF' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  borderLeft: active ? '2px solid #655BD3' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ flexShrink: 0, color: active ? '#655BD3' : '#6B7280', display: 'flex' }}>
                  {node.icon}
                </span>
                <span className="truncate">{node.label}</span>
              </Link>
            );
          }

          /* ── Collapsible section (Team Mgmt, Live Feed, Preferences) ── */
          const section = node;
          const isOpen = openSections.has(section.label);
          const anyChildActive = section.items.some(i => isActive(i.href));
          const firstHref = section.items[0]?.href ?? '#';

          return (
            <div key={section.label}>
              {/* Section header row: link area + separate chevron */}
              <div
                className="flex items-center rounded-lg transition-colors"
                style={{
                  height: 40,
                  color: anyChildActive ? '#655BD3' : '#374151',
                  background: 'transparent',
                  borderLeft: anyChildActive ? '2px solid #655BD3' : '2px solid transparent',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* Navigable area — link to first sub-item, also expands section */}
                <Link
                  href={firstHref}
                  onClick={() => { if (!isOpen) toggleSection(section.label); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    paddingLeft: 12,
                    height: '100%',
                    textDecoration: 'none',
                    fontSize: 13.5,
                    fontWeight: anyChildActive ? 600 : 500,
                    color: 'inherit',
                    minWidth: 0,
                  }}
                >
                  <span style={{ flexShrink: 0, color: anyChildActive ? '#655BD3' : '#6B7280', display: 'flex' }}>
                    {section.icon}
                  </span>
                  <span className="truncate">{section.label}</span>
                </Link>

                {/* Chevron — only toggles open/close */}
                <button
                  onClick={() => toggleSection(section.label)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 200ms ease',
                    }}
                  >
                    <ChevronDown size={13} strokeWidth={2} />
                  </span>
                </button>
              </div>

              {/* Sub-items */}
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: isOpen ? `${section.items.length * 36}px` : '0px',
                  transition: 'max-height 220ms ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 1, paddingBottom: 2 }}>
                  {section.items.map(item => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          ...SUB_ITEM,
                          color: active ? '#655BD3' : '#9CA3AF',
                          background: active ? '#EEE9FF' : 'transparent',
                          fontWeight: active ? 500 : 400,
                          borderLeft: active ? '2px solid #655BD3' : '2px solid transparent',
                        }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

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
  );
}
