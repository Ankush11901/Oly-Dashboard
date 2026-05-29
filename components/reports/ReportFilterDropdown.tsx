'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function ReportFilterDropdown({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isSet = value !== options[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          height: 36,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 8,
          border: `1.5px solid ${isSet ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: isSet ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
          fontSize: 12.5,
          fontWeight: isSet ? 600 : 500,
          color: isSet ? 'var(--color-primary)' : 'var(--color-text-2)',
          cursor: 'pointer',
          transition: 'all 150ms',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'; }}
        onMouseLeave={e => { if (!isSet) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        <ChevronDown size={12} strokeWidth={2} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 60,
            overflow: 'hidden',
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          {options.map(option => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => { onChange(option); setOpen(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 12.5,
                  fontWeight: selected ? 600 : 400,
                  color: selected ? 'var(--color-primary)' : 'var(--color-text-2)',
                  background: selected ? 'var(--color-accent-bg)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {option}
                {selected && <Check size={11} strokeWidth={2.5} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
