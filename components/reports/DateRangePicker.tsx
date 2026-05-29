'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function formatDisplay(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildAvailableDates(): Set<string> {
  const set = new Set<string>();
  const today = new Date(2026, 4, 28);
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getDay() !== 0) set.add(dateKey(d));
  }
  return set;
}

const AVAILABLE = buildAvailableDates();
const DEFAULT_MONTH = new Date(2026, 4, 1);

type OpenField = 'from' | 'to' | null;

interface Props {
  value: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
}

function isDateDisabled(d: Date, activeField: 'from' | 'to', value: { start: Date | null; end: Date | null }) {
  if (!AVAILABLE.has(dateKey(d))) return true;
  if (activeField === 'to' && value.start && d.getTime() < value.start.getTime()) return true;
  if (activeField === 'from' && value.end && d.getTime() > value.end.getTime()) return true;
  return false;
}

function CalendarPanel({
  viewMonth,
  setViewMonth,
  value,
  activeField,
  onSelect,
}: {
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  value: { start: Date | null; end: Date | null };
  activeField: 'from' | 'to';
  onSelect: (d: Date) => void;
}) {
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewMonth]);

  const monthLabel = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const toBlockedWithoutFrom = activeField === 'to' && !value.start;

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        zIndex: 70,
        width: 280,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        boxShadow: 'var(--shadow-dropdown)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-1)' }}>{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-4)', textAlign: 'center', padding: '4px 0' }}>{d}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {calendarDays.map((d, i) => {
          if (!d) return <span key={`empty-${i}`} />;
          const disabled = toBlockedWithoutFrom || isDateDisabled(d, activeField, value);
          const selected =
            activeField === 'from'
              ? Boolean(value.start && sameDay(d, value.start))
              : Boolean(value.end && sameDay(d, value.end));

          return (
            <button
              key={dateKey(d)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              style={{
                height: 32,
                borderRadius: 6,
                border: selected ? '1px solid var(--color-primary)' : '1px solid transparent',
                fontSize: 11.5,
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: selected ? 'var(--color-primary-emphasis)' : 'transparent',
                color: selected
                  ? 'var(--color-on-primary)'
                  : disabled
                    ? 'var(--color-text-4)'
                    : 'var(--color-text-2)',
                opacity: disabled && !selected ? 0.35 : 1,
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--color-text-4)', marginTop: 10, lineHeight: 1.4 }}>
        {activeField === 'from'
          ? 'Select a start date. Only dates with report data are available.'
          : toBlockedWithoutFrom
            ? 'Select a From date first, then choose an end date.'
            : 'Select an end date on or after the From date.'}
      </p>
    </div>
  );
}

function DateField({
  label,
  date,
  field,
  isOpen,
  onToggle,
  viewMonth,
  setViewMonth,
  range,
  onSelect,
}: {
  label: string;
  date: Date | null;
  field: 'from' | 'to';
  isOpen: boolean;
  onToggle: () => void;
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  range: { start: Date | null; end: Date | null };
  onSelect: (d: Date) => void;
}) {
  const hasValue = Boolean(date);

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          height: 36,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 8,
          border: `1.5px solid ${hasValue || isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: hasValue || isOpen ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
          fontSize: 12.5,
          fontWeight: hasValue ? 600 : 500,
          color: hasValue ? 'var(--color-primary)' : 'var(--color-text-4)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {date ? formatDisplay(date) : 'Select date'}
        </span>
        <Calendar size={14} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--color-text-4)' }} />
      </button>

      {isOpen && (
        <CalendarPanel
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          value={range}
          activeField={field}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

export function DateRangePicker({ value, onChange }: Props) {
  const [openField, setOpenField] = useState<OpenField>(null);
  const [fromViewMonth, setFromViewMonth] = useState(() =>
    value.start ? new Date(value.start.getFullYear(), value.start.getMonth(), 1) : DEFAULT_MONTH,
  );
  const [toViewMonth, setToViewMonth] = useState(() =>
    value.end ? new Date(value.end.getFullYear(), value.end.getMonth(), 1) : DEFAULT_MONTH,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenField(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleFromSelect = (d: Date) => {
    let end = value.end;
    if (end && d.getTime() > end.getTime()) end = d;
    onChange({ start: d, end });
    setOpenField(null);
  };

  const handleToSelect = (d: Date) => {
    if (!value.start || d.getTime() < value.start.getTime()) return;
    onChange({ start: value.start, end: d });
    setOpenField(null);
  };

  const toggleField = (field: 'from' | 'to') => {
    setOpenField(current => {
      const next = current === field ? null : field;
      if (next === 'from') {
        const anchor = value.start ?? DEFAULT_MONTH;
        setFromViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
      } else if (next === 'to') {
        const anchor = value.end ?? DEFAULT_MONTH;
        setToViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
      }
      return next;
    });
  };

  return (
    <div ref={ref} style={{ display: 'flex', gap: 10 }}>
      <DateField
        label="From"
        date={value.start}
        field="from"
        isOpen={openField === 'from'}
        onToggle={() => toggleField('from')}
        viewMonth={fromViewMonth}
        setViewMonth={setFromViewMonth}
        range={value}
        onSelect={handleFromSelect}
      />
      <DateField
        label="To"
        date={value.end}
        field="to"
        isOpen={openField === 'to'}
        onToggle={() => toggleField('to')}
        viewMonth={toViewMonth}
        setViewMonth={setToViewMonth}
        range={value}
        onSelect={handleToSelect}
      />
    </div>
  );
}
