'use client';
import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Check, WifiOff, Flame, TrendingDown, Users, AlertCircle } from 'lucide-react';

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

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: on ? '#655BD3' : '#D1D5DB', position: 'relative', transition: 'background 200ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 20 : 3, width: 16, height: 16,
        borderRadius: '50%', background: 'white', transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<AlertType[]>([
    { id: 'camera_offline', label: 'Camera Offline',        description: 'Triggered when a camera loses connection',       icon: <WifiOff size={14} strokeWidth={1.5} />,      iconColor: '#DC2626', enabled: true  },
    { id: 'high_queue',     label: 'High Queue Depth',      description: 'Alert when queue exceeds the threshold',         icon: <Flame size={14} strokeWidth={1.5} />,        iconColor: '#F59E0B', enabled: true  },
    { id: 'low_footfall',   label: 'Low Footfall Warning',  description: 'When footfall drops below the daily average',    icon: <TrendingDown size={14} strokeWidth={1.5} />, iconColor: '#3B82F6', enabled: false },
    { id: 'unusual_activity',label: 'Unusual Activity',     description: 'AI-detected anomalies in visitor behaviour',    icon: <AlertCircle size={14} strokeWidth={1.5} />, iconColor: '#8B5CF6', enabled: true  },
    { id: 'footfall_target',label: 'Footfall Target Met',   description: 'Notify when a store hits its daily target',      icon: <Check size={14} strokeWidth={1.5} />,        iconColor: '#16A34A', enabled: false },
    { id: 'new_team_member',label: 'New Team Member Added', description: 'When someone joins or is removed from a store',  icon: <Users size={14} strokeWidth={1.5} />,        iconColor: '#00CE9C', enabled: false },
  ]);

  const [channels, setChannels] = useState<Record<Channel, boolean>>({ email: true, inApp: true, sms: false });
  const [quietStart, setQuietStart] = useState('10:00 PM');
  const [quietEnd, setQuietEnd] = useState('7:00 AM');
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [storeRule, setStoreRule] = useState('All Stores');
  const [saved, setSaved] = useState(false);

  const toggleAlert = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const toggleChannel = (c: Channel) => setChannels(prev => ({ ...prev, [c]: !prev[c] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const CHANNEL_CFG: { key: Channel; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'email',  label: 'Email',    desc: 'Sent to admin@olyretail.com',          icon: <Mail size={16} strokeWidth={1.5} /> },
    { key: 'inApp',  label: 'In-App',   desc: 'Bell icon in the top navigation bar',  icon: <Bell size={16} strokeWidth={1.5} /> },
    { key: 'sms',    label: 'SMS',      desc: 'Text message to +65 9123 4567',         icon: <Smartphone size={16} strokeWidth={1.5} /> },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Bell size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Notification Settings</h1>
      </div>

      {/* Alert types */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={15} strokeWidth={1.5} style={{ color: '#655BD3' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Alert Types</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: '#FAFAFA', border: '1px solid #F3F4F6' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: alert.enabled ? `${alert.iconColor}18` : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alert.enabled ? alert.iconColor : '#9CA3AF', transition: 'all 200ms' }}>
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
          <MessageSquare size={15} strokeWidth={1.5} style={{ color: '#655BD3' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Delivery Channels</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {CHANNEL_CFG.map(ch => (
            <div key={ch.key} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: '#FAFAFA', border: '1px solid #F3F4F6' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: channels[ch.key] ? '#EEE9FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: channels[ch.key] ? '#655BD3' : '#9CA3AF', transition: 'all 200ms' }}>
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
            <Bell size={15} strokeWidth={1.5} style={{ color: '#655BD3' }} />
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
          <Bell size={15} strokeWidth={1.5} style={{ color: '#655BD3' }} />
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
                  border: `1.5px solid ${active ? '#655BD3' : '#E5E7EB'}`,
                  background: active ? '#EEE9FF' : 'white',
                  color: active ? '#655BD3' : 'var(--color-text-2)',
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
