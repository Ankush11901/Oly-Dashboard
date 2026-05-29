'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Home, Users, BarChart2, Video, Settings, ChevronDown,
} from 'lucide-react';

interface NavItem { label: string; href: string }
interface NavEntry { type: 'flat'; label: string; href: string; icon: React.ReactNode }
interface NavSection { type: 'section'; label: string; icon: React.ReactNode; items: NavItem[] }
type NavNode = NavEntry | NavSection;

const NAV_NODES: NavNode[] = [
  { type: 'flat', label: 'Home', href: '/dashboard', icon: <Home size={14} strokeWidth={1.5} /> },
  {
    type: 'section', label: 'Team Management', icon: <Users size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Staff / Team', href: '/dashboard/team/staff' },
      { label: 'Permissions', href: '/dashboard/team/permissions' },
    ],
  },
  { type: 'flat', label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart2 size={14} strokeWidth={1.5} /> },
  { type: 'flat', label: 'Live Feed', href: '/dashboard/live/vms', icon: <Video size={14} strokeWidth={1.5} /> },
  {
    type: 'section', label: 'Preferences', icon: <Settings size={14} strokeWidth={1.5} />,
    items: [
      { label: 'Profile', href: '/dashboard/preferences/profile' },
      { label: 'Notification Settings', href: '/dashboard/preferences/notifications' },
      { label: 'Password & Access', href: '/dashboard/preferences/password' },
      { label: 'Device Settings', href: '/dashboard/preferences/devices' },
    ],
  },
];

function DropdownMenu({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        boxShadow: 'var(--shadow-dropdown)',
        minWidth: 180,
        zIndex: 200,
        overflow: 'hidden',
        padding: '4px 0',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{
            display: 'block',
            padding: '8px 14px',
            fontSize: 13,
            color: 'var(--color-text-2)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function TopNavBar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenSection(null);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div
      ref={navRef}
      style={{
        height: 44,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        gap: 2,
        flexShrink: 0,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      {NAV_NODES.map((node) => {
        if (node.type === 'flat') {
          const active = isActive(node.href);
          return (
            <Link
              key={node.href}
              href={node.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--color-primary)' : 'var(--color-text-2)',
                background: active ? 'var(--color-primary-light)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 120ms ease, color 120ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-3)', display: 'flex' }}>{node.icon}</span>
              {node.label}
            </Link>
          );
        }

        // Section with dropdown
        const section = node;
        const anyChildActive = section.items.some(i => isActive(i.href));
        const isOpen = openSection === section.label;

        return (
          <div key={section.label} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenSection(isOpen ? null : section.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                paddingLeft: 12,
                paddingRight: 10,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: anyChildActive ? 600 : 500,
                color: anyChildActive ? 'var(--color-primary)' : 'var(--color-text-2)',
                background: anyChildActive ? 'var(--color-primary-light)' : isOpen ? 'var(--color-surface-2)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 120ms ease, color 120ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!anyChildActive && !isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { if (!anyChildActive && !isOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ color: anyChildActive ? 'var(--color-primary)' : 'var(--color-text-3)', display: 'flex' }}>{section.icon}</span>
              {section.label}
              <span style={{ display: 'flex', color: 'var(--color-text-4)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}>
                <ChevronDown size={12} strokeWidth={2} />
              </span>
            </button>

            {isOpen && (
              <DropdownMenu items={section.items} onClose={() => setOpenSection(null)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
