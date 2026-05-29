'use client';
import { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, Check,
  WifiOff, Flame, TrendingDown, Users, AlertCircle,
  LayoutPanelLeft, LayoutTemplate, Monitor, Wifi, HardDrive, RefreshCw,
} from 'lucide-react';
import { useDashboardContext, NavStyle } from '@/components/DashboardProvider';

// ── Shared toggle ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--color-primary-emphasis)' : 'var(--color-border)', position: 'relative', transition: 'background 200ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 20 : 3, width: 16, height: 16,
        borderRadius: '50%', background: 'var(--color-surface)', transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────
type Channel = 'email' | 'inApp' | 'sms';

interface AlertType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  enabled: boolean;
}

const STORES = ['All Stores', 'Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
});

function NotificationsTab() {
  const [alerts, setAlerts] = useState<AlertType[]>([
    { id: 'camera_offline',  label: 'Camera Offline',        description: 'Triggered when a camera loses connection',      icon: <WifiOff      size={14} strokeWidth={1.5} />, iconColor: '#DC2626', enabled: true  },
    { id: 'high_queue',      label: 'High Queue Depth',      description: 'Alert when queue exceeds the threshold',        icon: <Flame        size={14} strokeWidth={1.5} />, iconColor: '#F59E0B', enabled: true  },
    { id: 'low_footfall',    label: 'Low Footfall Warning',  description: 'When footfall drops below the daily average',   icon: <TrendingDown size={14} strokeWidth={1.5} />, iconColor: '#3B82F6', enabled: false },
    { id: 'unusual_activity',label: 'Unusual Activity',      description: 'AI-detected anomalies in visitor behaviour',   icon: <AlertCircle  size={14} strokeWidth={1.5} />, iconColor: '#8B5CF6', enabled: true  },
    { id: 'footfall_target', label: 'Footfall Target Met',   description: 'Notify when a store hits its daily target',     icon: <Check        size={14} strokeWidth={1.5} />, iconColor: '#16A34A', enabled: false },
    { id: 'new_team_member', label: 'New Team Member Added', description: 'When someone joins or is removed from a store', icon: <Users        size={14} strokeWidth={1.5} />, iconColor: '#00CE9C', enabled: false },
  ]);

  const [channels, setChannels] = useState<Record<Channel, boolean>>({ email: true, inApp: true, sms: false });
  const [quietStart, setQuietStart] = useState('10:00 PM');
  const [quietEnd, setQuietEnd] = useState('7:00 AM');
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [storeRule, setStoreRule] = useState('All Stores');
  const [saved, setSaved] = useState(false);

  const toggleAlert   = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const toggleChannel = (c: Channel) => setChannels(prev => ({ ...prev, [c]: !prev[c] }));
  const handleSave    = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const CHANNEL_CFG: { key: Channel; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'email',  label: 'Email',   desc: 'Sent to admin@olyretail.com',         icon: <Mail       size={16} strokeWidth={1.5} /> },
    { key: 'inApp',  label: 'In-App',  desc: 'Bell icon in the top navigation bar', icon: <Bell       size={16} strokeWidth={1.5} /> },
    { key: 'sms',    label: 'SMS',     desc: 'Text message to +65 9123 4567',        icon: <Smartphone size={16} strokeWidth={1.5} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Alert types */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={15} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Alert Types</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: alert.enabled ? `${alert.iconColor}18` : 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alert.enabled ? alert.iconColor : 'var(--color-text-4)', transition: 'all 200ms' }}>
                  {alert.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: alert.enabled ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>{alert.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>{alert.description}</p>
                </div>
              </div>
              <Toggle on={alert.enabled} onChange={() => toggleAlert(alert.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Delivery channels */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={15} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Delivery Channels</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {CHANNEL_CFG.map(ch => (
            <div key={ch.key} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: channels[ch.key] ? 'var(--color-primary-light)' : 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: channels[ch.key] ? 'var(--color-primary)' : 'var(--color-text-4)', transition: 'all 200ms' }}>
                  {ch.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>{ch.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>{ch.desc}</p>
                </div>
              </div>
              <Toggle on={channels[ch.key]} onChange={() => toggleChannel(ch.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={15} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Quiet Hours</h2>
          </div>
          <Toggle on={quietEnabled} onChange={() => setQuietEnabled(q => !q)} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 14 }}>
          No notifications will be sent during these hours.
        </p>
        <div className={`flex items-center gap-4 transition-opacity ${!quietEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>From</label>
            <select value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}>
              {HOURS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <span style={{ color: 'var(--color-text-3)', fontSize: 13, marginTop: 18 }}>to</span>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Until</label>
            <select value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}>
              {HOURS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Store-specific rules */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={15} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Store-Specific Rules</h2>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>
          Receive notifications only for specific stores.
        </p>
        <div className="flex flex-wrap gap-2">
          {STORES.map(store => {
            const active = storeRule === store;
            return (
              <button
                key={store}
                onClick={() => setStoreRule(store)}
                style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-2)',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {store}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: saved ? '#16A34A' : 'var(--color-primary)' }}
        >
          {saved && <Check size={14} strokeWidth={2.5} />}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
        {saved && <span style={{ fontSize: 12, color: '#16A34A' }}>Notification preferences updated.</span>}
      </div>
    </div>
  );
}

// ── Display & Navigation tab ──────────────────────────────────────────────────
function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

function DisplayTab() {
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
    <div className="space-y-5">
      {/* Navigation Style */}
      <SettingCard>
        <SectionLabel>Navigation Layout</SectionLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          {options.map(opt => {
            const isActive = navStyle === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setNavStyle(opt.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 12,
                  padding: '16px 16px 14px', borderRadius: 10,
                  border: isActive ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: isActive ? '#F9F7FF' : 'var(--color-surface-2)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border 150ms ease, background 150ms ease',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-emphasis)' }} />
                )}
                <div style={{ alignSelf: 'flex-start' }}>{opt.preview}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-3)', marginTop: 1, flexShrink: 0 }}>
                    {opt.icon}
                  </span>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: isActive ? 'var(--color-primary)' : 'var(--color-text-1)', marginBottom: 3 }}>
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
            { icon: <Monitor size={15} strokeWidth={1.5} />, label: 'Camera Network', value: '12 cameras active', badge: 'Online',  color: '#16A34A', bg: 'var(--color-success-light)' },
            { icon: <Wifi    size={15} strokeWidth={1.5} />, label: 'Edge Nodes',     value: '4 nodes connected', badge: 'Healthy', color: '#2563EB', bg: 'var(--color-info-light)' },
            { icon: <HardDrive size={15} strokeWidth={1.5} />, label: 'Local Storage', value: '1.4 TB / 2 TB used', badge: '70%',  color: '#D97706', bg: 'var(--color-warning-light)' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-2)' }}>
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
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notifications', label: 'Notifications',         icon: <Bell            size={15} strokeWidth={1.5} /> },
  { id: 'display',       label: 'Display & Navigation',  icon: <LayoutPanelLeft size={15} strokeWidth={1.5} /> },
];

export default function NotificationsAndDisplayPage() {
  const [active, setActive] = useState<'notifications' | 'display'>('notifications');

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Alerts &amp; Display</h1>
      </div>

      {/* Inner tab bar */}
      <div
        className="flex mb-6"
        style={{ borderBottom: '1px solid var(--color-border)', gap: 0 }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id as 'notifications' | 'display')}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-3)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-3)' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {active === 'notifications' && <NotificationsTab />}
      {active === 'display'       && <DisplayTab />}
    </div>
  );
}
