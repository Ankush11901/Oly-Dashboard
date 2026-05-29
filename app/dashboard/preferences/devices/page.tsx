'use client';
import { useState } from 'react';
import { LayoutPanelLeft, LayoutTemplate, Monitor, Wifi, HardDrive, RefreshCw } from 'lucide-react';
import { useDashboardContext, NavStyle } from '@/components/DashboardProvider';

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </p>
  );
}

export default function DevicesPage() {
  const { navStyle, setNavStyle } = useDashboardContext();
  const [refreshInterval, setRefreshInterval] = useState('30');

  const options: { value: NavStyle; label: string; desc: string; icon: React.ReactNode; preview: React.ReactNode }[] = [
    {
      value: 'sidebar',
      label: 'Sidebar Navigation',
      desc: 'Vertical nav panel on the left. Best for dense link structures and multi-level menus.',
      icon: <LayoutPanelLeft size={18} strokeWidth={1.5} />,
      preview: (
        <div style={{ display: 'flex', gap: 3, width: 64, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{ width: 14, background: 'var(--color-primary-light)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 3px' }}>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--color-primary-emphasis)', width: '70%' }} />
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: '85%' }} />
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: '60%' }} />
          </div>
        </div>
      ),
    },
    {
      value: 'topnav',
      label: 'Top Navigation',
      desc: 'Horizontal nav bar below the header. Gives more horizontal space to content.',
      icon: <LayoutTemplate size={18} strokeWidth={1.5} />,
      preview: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 64, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{ height: 10, background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 2, padding: '0 4px' }}>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-primary-emphasis)', width: 10 }} />
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: 8 }} />
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: 10 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '3px 4px' }}>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: '80%' }} />
            <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', width: '60%' }} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 'var(--content-padding)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 4 }}>Display &amp; Navigation</h1>
        <p style={{ fontSize: 13.5, color: 'var(--color-text-3)' }}>Personalise how the dashboard looks and how you navigate between sections.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Navigation Style */}
        <SettingCard>
          <SectionLabel>Navigation Layout</SectionLabel>
          <div style={{ display: 'flex', gap: 12 }}>
            {options.map(opt => {
              const active = navStyle === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setNavStyle(opt.value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '16px 16px 14px',
                    borderRadius: 10,
                    border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border 150ms ease, background 150ms ease',
                    position: 'relative',
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-emphasis)',
                    }} />
                  )}
                  <div style={{ alignSelf: 'flex-start' }}>{opt.preview}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-3)', marginTop: 1, flexShrink: 0 }}>
                      {opt.icon}
                    </span>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: active ? 'var(--color-primary)' : 'var(--color-text-1)', marginBottom: 3 }}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-4)', lineHeight: 1.5 }}>{opt.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: 12, fontSize: 11.5, color: 'var(--color-text-4)' }}>
            Changes apply immediately and are saved to this browser.
          </p>
        </SettingCard>

        {/* Connected Devices */}
        <SettingCard>
          <SectionLabel>Connected Devices</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <Monitor size={15} strokeWidth={1.5} />, label: 'Camera Network', value: '12 cameras active', badge: 'Online', color: '#16A34A', bg: 'var(--color-success-light)' },
              { icon: <Wifi size={15} strokeWidth={1.5} />, label: 'Edge Nodes', value: '4 nodes connected', badge: 'Healthy', color: '#2563EB', bg: 'var(--color-info-light)' },
              { icon: <HardDrive size={15} strokeWidth={1.5} />, label: 'Local Storage', value: '1.4 TB / 2 TB used', badge: '70%', color: '#D97706', bg: 'var(--color-warning-light)' },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface)' }}>
                <span style={{ color: 'var(--color-text-3)' }}>{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)' }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-4)' }}>{row.value}</p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: row.color, background: row.bg, padding: '3px 9px', borderRadius: 999 }}>
                  {row.badge}
                </span>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Data Refresh */}
        <SettingCard>
          <SectionLabel>Data Refresh</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-text-3)' }}><RefreshCw size={15} strokeWidth={1.5} /></span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)' }}>Live Data Interval</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-4)' }}>How often live metrics and snapshots refresh</p>
              </div>
            </div>
            <select
              value={refreshInterval}
              onChange={e => setRefreshInterval(e.target.value)}
              style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="15">Every 15s</option>
              <option value="30">Every 30s</option>
              <option value="60">Every 60s</option>
              <option value="300">Every 5 min</option>
            </select>
          </div>
        </SettingCard>

      </div>
    </div>
  );
}
