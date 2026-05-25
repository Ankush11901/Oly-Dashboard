import React from 'react';
import { UserCircle, Mail, Phone, MapPin, Building, Shield } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Profile Settings</h1>
      </div>

      <div className="card mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-sm" style={{ background: 'var(--color-primary)' }}>
            AM
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-1)' }}>Admin Manager</h2>
            <p className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-text-3)' }}>
              <Shield size={14} /> System Administrator
            </p>
            <button className="px-4 py-2 rounded-md text-sm font-medium transition-colors" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-1)', border: '1px solid var(--color-border)' }}>
              Change Avatar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Full Name</label>
              <input type="text" defaultValue="Admin Manager" className="w-full px-4 py-2 rounded-md border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input type="email" defaultValue="admin@olyretail.com" className="w-full pl-10 pr-4 py-2 rounded-md border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input type="tel" defaultValue="+65 9123 4567" className="w-full pl-10 pr-4 py-2 rounded-md border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Company</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input type="text" defaultValue="Landmark Asia" className="w-full pl-10 pr-4 py-2 rounded-md border bg-gray-50" disabled style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3" style={{ color: 'var(--color-text-3)' }} />
                <input type="text" defaultValue="Singapore HQ" className="w-full pl-10 pr-4 py-2 rounded-md border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button className="px-6 py-2 rounded-md font-medium text-white transition-colors" style={{ background: 'var(--color-primary)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
