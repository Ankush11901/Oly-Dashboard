'use client';
import { Suspense, useState, useRef, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
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

// ── Password input helper (compact) ───────────────────────────────────────────
function PasswordInput({ label, value, onChange, placeholder, id }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-2.5 top-2" style={{ color: 'var(--color-text-3)' }} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-9 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2.5 top-2" style={{ color: 'var(--color-text-3)' }} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
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
    <div className="flex items-center gap-2" style={{ height: 16, marginTop: 2 }}>
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? colors[score] : 'var(--color-border)', transition: 'background 200ms' }} />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: colors[score], minWidth: 36, textAlign: 'right' }}>{labels[score]}</span>
    </div>
  );
}

const PW_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'num', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

function PasswordRequirements({ password }: { password: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid var(--color-border-subtle)',
        overflow: 'hidden',
        background: 'var(--color-surface-2)',
      }}
    >
      <div
        style={{
          padding: '6px 12px',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-surface)',
        }}
      >
        Password requirements
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
        }}
      >
        {PW_RULES.map((rule, idx) => {
          const met = password.length > 0 && rule.test(password);
          return (
            <div
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderTop: idx >= 2 ? '1px solid var(--color-border-subtle)' : 'none',
                borderRight: idx % 2 === 0 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: met ? 'var(--color-success-light)' : 'var(--color-surface)',
                  border: `1px solid ${met ? 'var(--color-success)' : 'var(--color-border)'}`,
                }}
              >
                {met && <Check size={10} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} />}
              </span>
              <span style={{ fontSize: 11, color: met ? 'var(--color-text-1)' : 'var(--color-text-3)', fontWeight: met ? 500 : 400 }}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--color-primary)', display: 'flex' }}>{icon}</span>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ fontSize: 12, color: 'var(--color-text-3)', margin: '6px 0 0', lineHeight: 1.45 }}>{subtitle}</p>
      )}
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

  const revokeOthers = () => {
    setSessions(prev => prev.filter(s => s.current));
  };

  const otherSessions = sessions.filter(s => !s.current);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div
        className="password-access-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'stretch',
          minHeight: 0,
        }}
      >
        {/* ── Left: Change password ─────────────────────────────────────── */}
        <section
          style={{
            padding: '22px 26px',
            borderRight: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SectionHeading
            icon={<Lock size={15} strokeWidth={1.75} />}
            title="Change password"
            subtitle="Use a strong password you do not use elsewhere."
          />

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PasswordInput
                id="pw-current"
                label="Current password"
                value={current}
                onChange={setCurrent}
                placeholder="Enter current password"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PasswordInput
                  id="pw-new"
                  label="New password"
                  value={newPw}
                  onChange={setNewPw}
                  placeholder="Create a new password"
                />
                <StrengthBar password={newPw} />
                <PasswordInput
                  id="pw-confirm"
                  label="Confirm new password"
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <PasswordRequirements password={newPw} />
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <p style={{ fontSize: 11, color: pwError ? '#DC2626' : 'var(--color-text-4)', margin: 0 }}>
                {pwError || 'Last changed 3 months ago'}
              </p>
              <button
                type="submit"
                className="flex items-center gap-2 shrink-0"
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  background: pwSaved ? '#16A34A' : 'var(--color-primary-emphasis)',
                }}
              >
                {pwSaved && <Check size={14} strokeWidth={2.5} />}
                {pwSaved ? 'Updated' : 'Update password'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Right: Access controls ────────────────────────────────────── */}
        <section style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column' }}>
          <SectionHeading
            icon={<Shield size={15} strokeWidth={1.75} />}
            title="Account access"
            subtitle="Two-factor auth and devices signed in to your account."
          />

          {/* 2FA — compact row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: twoFa ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
              border: `1px solid ${twoFa ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
            }}
          >
            <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: twoFa ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smartphone size={15} strokeWidth={1.75} style={{ color: twoFa ? 'var(--color-primary)' : 'var(--color-text-4)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-1)', margin: 0 }}>
                  Two-factor authentication
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-3)', margin: '2px 0 0', lineHeight: 1.35 }}>
                  {twoFa ? 'Verification required at sign-in' : 'Recommended for admin accounts'}
                </p>
              </div>
            </div>
            <Toggle on={twoFa} onChange={() => setTwoFa(t => !t)} />
          </div>

          {/* Sessions — dense table */}
          <div style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div className="flex items-center gap-2">
                <Monitor size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)' }}>Active sessions</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-3)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  {sessions.length}
                </span>
              </div>
              {otherSessions.length > 0 && (
                <button
                  type="button"
                  onClick={revokeOthers}
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#DC2626',
                    background: 'var(--color-error-light)',
                    border: '1px solid color-mix(in srgb, #DC2626 28%, var(--color-border))',
                    borderRadius: 8,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    flexShrink: 0,
                    transition: 'background 150ms ease, border-color 150ms ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, #DC2626 12%, var(--color-error-light))';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-error-light)';
                  }}
                >
                  <LogOut size={12} strokeWidth={2} />
                  Sign out others
                </button>
              )}
            </div>

            <div
              style={{
                borderRadius: 10,
                border: '1px solid var(--color-border-subtle)',
                overflow: 'hidden',
                background: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 8,
                  padding: '6px 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-4)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-surface)',
                }}
              >
                <span>Device</span>
                <span style={{ textAlign: 'right' }}>Last active</span>
                <span style={{ width: 52, textAlign: 'right' }} />
              </div>

              {sessions.map((session, idx) => (
                <div
                  key={session.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 8,
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-subtle)',
                    background: session.current ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                    borderLeft: session.current ? '3px solid var(--color-primary-emphasis)' : '3px solid transparent',
                    boxShadow: session.current ? 'inset 0 0 0 1px var(--color-accent-border)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-1)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {session.device}
                      {session.current && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 9,
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            verticalAlign: 'middle',
                          }}
                        >
                          · This device
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: 10.5, color: 'var(--color-text-3)', margin: '1px 0 0' }}>{session.location}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>{session.lastActive}</span>
                  <div style={{ width: 52, display: 'flex', justifyContent: 'flex-end' }}>
                    {!session.current ? (
                      <button
                        type="button"
                        onClick={() => revokeSession(session.id)}
                        title="Revoke session"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          color: '#DC2626',
                          background: 'var(--color-error-light)',
                        }}
                      >
                        <LogOut size={12} strokeWidth={2} />
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-success)' }}>Active</span>
                    )}
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', textAlign: 'center', padding: '16px 12px', margin: 0 }}>
                  No active sessions.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .password-access-grid {
            grid-template-columns: 1fr !important;
          }
          .password-access-grid > section:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--color-border-subtle);
          }
        }
      `}</style>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',   label: 'Profile',           icon: <UserCircle size={15} strokeWidth={1.5} /> },
  { id: 'password',  label: 'Password & Access',  icon: <Lock       size={15} strokeWidth={1.5} /> },
];

function ProfileAndSecurityContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'password') setActive('password');
  }, [searchParams]);

  return (
    <>
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

      {active === 'profile'  && <ProfileTab />}
      {active === 'password' && <PasswordTab />}
    </>
  );
}

export default function ProfileAndSecurityPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Profile &amp; Security</h1>
      </div>

      <Suspense fallback={null}>
        <ProfileAndSecurityContent />
      </Suspense>
    </div>
  );
}
