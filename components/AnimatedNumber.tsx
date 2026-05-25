'use client';
import { useEffect, useState, useRef } from 'react';

interface Props {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({
  value,
  duration = 1400,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0,
  style,
}: Props) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const tick = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const raw = eased * value;
      setCurrent(decimals > 0 ? parseFloat(raw.toFixed(decimals)) : Math.round(raw));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, decimals]);

  const display =
    decimals > 0
      ? current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : current.toLocaleString();

  return (
    <span className={className} style={style}>
      {prefix}{display}{suffix}
    </span>
  );
}
