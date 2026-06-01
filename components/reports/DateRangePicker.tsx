'use client';
import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { DateCalendarPanel } from '@/components/DateCalendarPanel';

function formatDisplay(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
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
  const toBlockedWithoutFrom = field === 'to' && !range.start;

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
          height: 34,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 8,
          border: `1.5px solid ${hasValue || isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: hasValue || isOpen ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
          fontSize: 12,
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
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 70, width: 252 }}>
          <DateCalendarPanel
            className="oly-calendar--compact"
            viewMonth={viewMonth}
            onViewMonthChange={setViewMonth}
            selected={field === 'from' ? range.start : range.end}
            onSelect={onSelect}
            availableDates={AVAILABLE}
            minDate={field === 'to' ? range.start ?? undefined : undefined}
            hint={
              field === 'from'
                ? 'Dates with report data only.'
                : toBlockedWithoutFrom
                  ? 'Pick a start date first.'
                  : 'End date on or after start.'
            }
          />
        </div>
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
