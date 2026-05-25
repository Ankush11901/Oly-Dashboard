import React from 'react';

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

export function PlaceholderPage({ title, description, icon, features }: Props) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</h1>
      </div>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 32 }}>{description}</p>

      <div
        className="rounded-2xl flex flex-col items-center justify-center text-center"
        style={{ border: '2px dashed #E5E7EB', padding: '64px 32px', background: '#FAFAFA' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#EEE9FF' }}
        >
          <span style={{ color: 'var(--color-primary)', transform: 'scale(1.5)', display: 'block' }}>{icon}</span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 360, lineHeight: 1.6 }}>
          This section is under development. The full feature will be available soon.
        </p>

        {features && features.length > 0 && (
          <div className="mt-6 text-left" style={{ maxWidth: 320 }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
              Planned features
            </p>
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                  <span style={{ color: '#655BD3', marginTop: 2, flexShrink: 0 }}>·</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
