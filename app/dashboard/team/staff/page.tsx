import React from 'react';
import { Users, MoreVertical, Plus, Search } from 'lucide-react';

const TEAM_MEMBERS = [
  { id: 1, name: 'Aditi Sharma', role: 'Store Manager', email: 'aditi.sharma@olyretail.com', status: 'Active', location: 'Marina Bay Sands' },
  { id: 2, name: 'Jason Lee', role: 'Regional Director', email: 'jason.lee@olyretail.com', status: 'Active', location: 'Singapore HQ' },
  { id: 3, name: 'Sarah Chen', role: 'Sales Associate', email: 'sarah.chen@olyretail.com', status: 'On Leave', location: 'Orchard Central' },
  { id: 4, name: 'Michael Tan', role: 'Security Ops', email: 'michael.tan@olyretail.com', status: 'Active', location: 'VivoCity' },
];

export default function TeamPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users size={24} style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>Staff / Team</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-colors" style={{ background: 'var(--color-primary)' }}>
          <Plus size={16} strokeWidth={2} /> Add Team Member
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-2.5" style={{ color: 'var(--color-text-3)' }} />
            <input type="text" placeholder="Search team members..." className="w-full pl-9 pr-4 py-2 text-sm rounded-md border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-1)' }} />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium border rounded-md" style={{ borderColor: 'var(--color-border)' }}>Export</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Name</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Role</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Location</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {TEAM_MEMBERS.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>{member.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-2)' }}>{member.role}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-2)' }}>{member.location}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ 
                      background: member.status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)',
                      color: member.status === 'Active' ? '#16A34A' : '#D97706'
                    }}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md hover:bg-gray-100" style={{ color: 'var(--color-text-3)' }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
