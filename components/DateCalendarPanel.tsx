'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function isoToDate(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

export function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface DateCalendarPanelProps {
  viewMonth: Date;
  onViewMonthChange: (d: Date) => void;
  selected: Date | null;
  onSelect: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** If set, only these dates are selectable (reports). */
  availableDates?: Set<string>;
  hint?: string;
  className?: string;
}

export function DateCalendarPanel({
  viewMonth,
  onViewMonthChange,
  selected,
  onSelect,
  minDate,
  maxDate,
  availableDates,
  hint,
  className,
}: DateCalendarPanelProps) {
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

  const isDisabled = (d: Date) => {
    if (availableDates && !availableDates.has(dateKey(d))) return true;
    if (minDate && d.getTime() < minDate.getTime()) return true;
    if (maxDate && d.getTime() > maxDate.getTime()) return true;
    return false;
  };

  const rootClass = ['oly-calendar', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className="oly-calendar__header">
        <button
          type="button"
          className="oly-calendar__nav"
          aria-label="Previous month"
          onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        <span className="oly-calendar__title">{monthLabel}</span>
        <button
          type="button"
          className="oly-calendar__nav"
          aria-label="Next month"
          onClick={() => onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="oly-calendar__weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} className="oly-calendar__weekday">{d}</span>
        ))}
      </div>

      <div className="oly-calendar__grid">
        {calendarDays.map((d, i) => {
          if (!d) return <span key={`e-${i}`} className="oly-calendar__cell oly-calendar__cell--empty" />;
          const disabled = isDisabled(d);
          const isSelected = selected ? sameDay(d, selected) : false;
          return (
            <button
              key={dateKey(d)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={[
                'oly-calendar__cell',
                isSelected ? 'oly-calendar__cell--selected' : '',
                disabled ? 'oly-calendar__cell--disabled' : '',
              ].filter(Boolean).join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {hint ? <p className="oly-calendar__hint">{hint}</p> : null}
    </div>
  );
}
