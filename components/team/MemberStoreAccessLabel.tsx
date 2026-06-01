'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Member } from '@/lib/team-data';
import { formatStoreAccessLabel } from '@/lib/team-data';

export function MemberStoreAccessLabel({ member }: { member: Member }) {
  const stores = member.storeAccess;
  const count = stores.length;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popoverRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (count === 0) {
    return (
      <span style={{ fontSize: 11, color: 'var(--color-text-4)', margin: 0, lineHeight: 1.2 }}>
        No store access
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', marginTop: 0, maxWidth: '100%' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          maxWidth: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.2,
          color: 'var(--color-text-4)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-4)'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatStoreAccessLabel(count)}
        </span>
        <ChevronDown
          size={11}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            color: 'var(--color-text-4)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        />
      </button>
      {open && btnRef.current && (
        <div
          ref={popoverRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: btnRef.current.getBoundingClientRect().bottom + 6,
            left: btnRef.current.getBoundingClientRect().left,
            zIndex: 10000,
            minWidth: 200,
            maxWidth: 280,
            maxHeight: 220,
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-dropdown)',
            padding: '6px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              padding: '6px 12px 8px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-text-4)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            Stores
          </p>
          {stores.map(store => (
            <div
              key={store}
              role="option"
              style={{
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text-2)',
              }}
            >
              {store}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
