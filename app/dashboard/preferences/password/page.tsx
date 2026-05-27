'use client';
import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, Shield, Smartphone, Monitor, LogOut } from 'lucide-react';

const SESSIONS = [
  { id: 1, device: 'Chrome on macOS', location: 'Singapore', lastActive: 'Now', current: true },
  { id: 2, device: 'Safari on iPhone 15', location: 'Singapore', lastActive: '2 hrs ago', current: false },
  { id: 3, device: 'Chrome on Windows', location: 'Kuala Lumpur', lastActive: 'Yesterday', current: false },
];

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
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
  const colors = ['#E5E7EB', '#DC2626', '#F59E0B', '#3B82F6', '#16A34A'];
  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= score ? colors[score] : '#E5E7EB', transition: 'background 200ms' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function PasswordPage() {
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Lock size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Password &amp; Access</h1>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: twoFa ? '#EEE9FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={18} strokeWidth={1.5} style={{ color: twoFa ? '#655BD3' : '#9CA3AF' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Two-Factor Authentication</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                {twoFa ? 'Enabled — your account is protected by 2FA.' : 'Add an extra layer of security to your account.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTwoFa(t => !t)}
            style={{
              width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: twoFa ? '#655BD3' : '#D1D5DB', position: 'relative', transition: 'background 200ms',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: twoFa ? 22 : 3, width: 18, height: 18,
              borderRadius: '50%', background: 'white', transition: 'left 200ms',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
        {twoFa && (
          <div className="mt-4 rounded-lg p-3" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
            <p style={{ fontSize: 12, color: '#655BD3', fontWeight: 500 }}>
              2FA is active. Your account requires a verification code on each login.
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} strokeWidth={1.5} style={{ color: '#655BD3' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)' }}>Active Sessions</h2>
        </div>
        <div className="space-y-2">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: session.current ? '#F5F3FF' : '#FAFAFA', border: `1px solid ${session.current ? '#DDD6FE' : '#F3F4F6'}` }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: session.current ? '#EEE9FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={14} strokeWidth={1.5} style={{ color: session.current ? '#655BD3' : '#9CA3AF' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>
                    {session.device}
                    {session.current && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#655BD3', background: '#EEE9FF', padding: '2px 6px', borderRadius: 4 }}>This device</span>}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>{session.location} · {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#DC2626', background: '#FEE2E2', border: 'none', cursor: 'pointer' }}
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
