'use client';
import { useState, useRef } from 'react';
import { UserCircle, Mail, Phone, MapPin, Building, Shield, Check } from 'lucide-react';

export default function ProfilePage() {
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
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Profile Settings</h1>
      </div>

      <div className="card mb-8">
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
                  className="w-full pl-10 pr-4 py-2 rounded-md border bg-gray-50"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)', cursor: 'not-allowed' }}
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
