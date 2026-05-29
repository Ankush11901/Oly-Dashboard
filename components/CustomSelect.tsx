'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** 'sm' — compact toolbar control (~28px tall)
   *  'md' — form field matching inputStyle height */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  size = 'md',
  style,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const isSm = size === 'sm';
  const selectedOpt = options.find(o => o.value === value);
  const displayLabel = selectedOpt?.label ?? placeholder;
  const hasValue = !!selectedOpt;

  const openPanel = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelMaxH = 220;
    const estimatedH = Math.min(options.length * 36 + 8, panelMaxH);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < estimatedH && rect.top > estimatedH;
    setPanelStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, isSm ? 160 : 200),
      zIndex: 99999,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
    setOpen(true);
  };

  const closePanel = useCallback(() => setOpen(false), []);

  const toggle = () => (open ? closePanel() : openPanel());

  // Click-outside: check both trigger and panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, closePanel]);

  // Reposition / close on scroll or resize
  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      // Don't close when scrolling inside the dropdown panel itself
      if (panelRef.current?.contains(e.target as Node)) return;
      closePanel();
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', closePanel);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', closePanel);
    };
  }, [open, closePanel]);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closePanel]);

  return (
    <>
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 6,
          width: '100%',
          padding: isSm ? '0 8px' : '9px 10px 9px 12px',
          height: isSm ? 28 : undefined,
          border: `${isSm ? 1 : 1.5}px solid ${open ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: isSm ? 6 : 8,
          background: 'var(--color-surface)',
          color: hasValue ? 'var(--color-text-1)' : 'var(--color-text-4)',
          fontSize: isSm ? 11.5 : 13,
          fontWeight: 400,
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          ...(open ? { boxShadow: '0 0 0 3px var(--color-focus-ring)' } : {}),
          ...style,
        }}
        onMouseEnter={e => {
          if (!open) (e.currentTarget).style.borderColor = 'var(--color-accent-muted)';
        }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget).style.borderColor = 'var(--color-border)';
        }}
      >
        <span style={{
          flex: 1, textAlign: 'left',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: hasValue ? 'var(--color-text-1)' : 'var(--color-text-4)',
        }}>
          {displayLabel}
        </span>
        <ChevronDown
          size={isSm ? 11 : 13}
          strokeWidth={2.5}
          style={{
            color: 'var(--color-text-4)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>

      {/* ── Panel (fixed, avoids overflow clipping) ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            ...panelStyle,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-dropdown)',
            padding: '4px',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {options.map(opt => {
            const sel = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); closePanel(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%',
                  padding: isSm ? '6px 10px' : '8px 12px',
                  borderRadius: 6, border: 'none',
                  background: sel ? 'var(--color-primary-light)' : 'transparent',
                  color: sel ? 'var(--color-primary)' : 'var(--color-text-2)',
                  fontSize: isSm ? 12 : 13,
                  fontWeight: sel ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => {
                  if (!sel) (e.currentTarget).style.background = 'var(--color-surface-2)';
                }}
                onMouseLeave={e => {
                  if (!sel) (e.currentTarget).style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {sel && (
                  <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
