'use client';
import { useState, useRef } from 'react';
import {
  UserCircle, Mail, Phone, MapPin, Building, Shield, Check,
  Lock, Eye, EyeOff, Smartphone, Monitor, LogOut,
} from 'lucide-react';

// ── Shared toggle ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--color-primary-emphasis)' : 'var(--color-border)', position: 'relative', transition: 'background 200ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18,
        borderRadius: '50%', background: 'var(--color-surface)', transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const [form, setForm] = useState({
    name: 'Admin Manager',
    email: 'admin@olyretail.com',
    phone: '+65 9123 4567',
    location: 'Singapore HQ',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = form.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-6 mb-8">
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            onClick={() => fileRef.current?.click()}
            style={{ width: 96, height: 96 }}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-sm overflow-hidden" style={{ background: 'var(--color-primary)' }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.35)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Change</span>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) setAvatar(URL.createObjectURL(file));
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-1)' }}>{form.name || 'Admin Manager'}</h2>
            <p className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-text-3)' }}>
              <Shield size={14} /> System Administrator
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-1)', border: '1px solid var(--color-border)' }}
            >
              Change Avatar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>
                Company
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-text-3)' }}>(managed by organisation)</span>
              </label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input
                  type="text"
                  value="Landmark Asia"
                  disabled
                  className="w-full pl-10 pr-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-3)', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-md font-medium text-white transition-colors"
            style={{ background: saved ? '#16A34A' : 'var(--color-primary)' }}
          >
            {saved && <Check size={14} strokeWidth={2.5} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saved && (
            <span className="text-sm" style={{ color: '#16A34A' }}>Profile updated successfully.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Password input helper ─────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-2)' }}>{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-2.5" style={{ color: 'var(--color-text-3)' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-2.5" style={{ color: 'var(--color-text-3)' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['var(--color-border)', '#DC2626', '#F59E0B', '#3B82F6', '#16A34A'];
  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= score ? colors[score] : 'var(--color-border)', transition: 'background 200ms' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

const SESSIONS = [
  { id: 1, device: 'Chrome on macOS', location: 'Singapore', lastActive: 'Now', current: true },
  { id: 2, device: 'Safari on iPhone 15', location: 'Singapore', lastActive: '2 hrs ago', current: false },
  { id: 3, device: 'Chrome on Windows', location: 'Kuala Lumpur', lastActive: 'Yesterday', current: false },
];

// ── Password & Access tab ─────────────────────────────────────────────────────
function PasswordTab() {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [twoFa, setTwoFa] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!current) { setPwError('Please enter your current password.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaved(true);
    setCurrent(''); setNewPw(''); setConfirm('');
    setTimeout(() => setPwSaved(false), 3000);
  };

  const revokeSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4" style={{ maxWidth: 560 }}>
          <PasswordInput label="Current Password" value={current} onChange={setCurrent} placeholder="Enter current password" />
          <div>
            <PasswordInput label="New Password" value={newPw} onChange={setNewPw} placeholder="At least 8 characters" />
            <StrengthBar password={newPw} />
          </div>
          <PasswordInput label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Re-enter new password" />
          {pwError && <p style={{ fontSize: 12, color: '#DC2626' }}>{pwError}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: pwSaved ? '#16A34A' : 'var(--color-primary)' }}>
              {pwSaved && <Check size={14} strokeWidth={2.5} />}
              {pwSaved ? 'Password Updated!' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: twoFa ? 'var(--color-primary-light)' : 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={18} strokeWidth={1.5} style={{ color: twoFa ? 'var(--color-primary)' : 'var(--color-text-4)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Two-Factor Authentication</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                {twoFa ? 'Enabled — your account is protected by 2FA.' : 'Add an extra layer of security to your account.'}
              </p>
            </div>
          </div>
          <Toggle on={twoFa} onChange={() => setTwoFa(t => !t)} />
        </div>
        {twoFa && (
          <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)' }}>
            <p style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>
              2FA is active. Your account requires a verification code on each login.
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Active Sessions</h2>
        </div>
        <div className="space-y-2">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: session.current ? 'var(--color-accent-bg)' : 'var(--color-surface-2)', border: `1px solid ${session.current ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}` }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: session.current ? 'var(--color-primary-light)' : 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={14} strokeWidth={1.5} style={{ color: session.current ? 'var(--color-primary)' : 'var(--color-text-4)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>
                    {session.device}
                    {session.current && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: 4 }}>This device</span>}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>{session.location} · {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#DC2626', background: 'var(--color-error-light)', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={11} strokeWidth={2} />Revoke
                </button>
              )}
            </div>
          ))}
          {sessions.length <= 1 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', textAlign: 'center', padding: '8px 0' }}>No other active sessions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',   label: 'Profile',           icon: <UserCircle size={15} strokeWidth={1.5} /> },
  { id: 'password',  label: 'Password & Access',  icon: <Lock       size={15} strokeWidth={1.5} /> },
];

export default function ProfileAndSecurityPage() {
  const [active, setActive] = useState<'profile' | 'password'>('profile');

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Profile &amp; Security</h1>
      </div>

      {/* Inner tab bar */}
      <div
        className="flex mb-6"
        style={{
          borderBottom: '1px solid var(--color-border)',
          gap: 0,
        }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id as 'profile' | 'password')}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors relative"
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
      {active === 'profile'  && <ProfileTab />}
      {active === 'password' && <PasswordTab />}
    </div>
  );
}
