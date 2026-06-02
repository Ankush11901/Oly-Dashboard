'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface InsightStripSlide {
  tag: string;
  title: string;
  description: string;
  badge: string;
  badgeTone: 'brand' | 'success' | 'warning' | 'error';
  time: string;
  icon: ReactNode;
}

const BADGE_STYLES = {
  brand: { bg: 'var(--color-primary-light)', fg: 'var(--color-primary)' },
  success: { bg: 'var(--color-success-light)', fg: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-light)', fg: 'var(--color-error)' },
};

const ICON_STYLES = {
  brand: { bg: 'var(--color-primary-light)', fg: 'var(--color-primary)' },
  success: { bg: 'var(--color-success-light)', fg: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-light)', fg: 'var(--color-error)' },
};

const AUTO_MS = 6000;
const TRANSITION_MS = 480;

function snapAfterLoop(
  trackEl: HTMLDivElement | null,
  setAnimating: (v: boolean) => void,
  setPos: (v: number) => void,
  realPos: number,
  onDone: () => void,
) {
  setAnimating(false);
  setPos(realPos);
  void trackEl?.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setAnimating(true);
      onDone();
    });
  });
}

function StripSlide({
  slide,
  width,
}: {
  slide: InsightStripSlide;
  width?: number;
}) {
  const tone = BADGE_STYLES[slide.badgeTone];
  const iconTone = ICON_STYLES[slide.badgeTone];
  const slideStyle =
    width && width > 0
      ? { flex: `0 0 ${width}px`, width, maxWidth: width }
      : undefined;

  return (
    <div className="hybrid-strip__slide" style={slideStyle}>
      <span
        className="hybrid-strip__icon"
        style={{ background: iconTone.bg, color: iconTone.fg }}
        aria-hidden
      >
        {slide.icon}
      </span>
      <div className="hybrid-strip__body">
        <p className="hybrid-strip__tag">{slide.tag}</p>
        <h3 className="hybrid-strip__title">{slide.title}</h3>
        <p className="hybrid-strip__desc">{slide.description}</p>
        <div className="hybrid-strip__meta">
          <span className="hybrid-strip__badge" style={{ background: tone.bg, color: tone.fg }}>
            {slide.badge}
          </span>
          <span className="hybrid-strip__time">{slide.time}</span>
        </div>
      </div>
    </div>
  );
}

export function HybridInsightsStrip({ slides }: { slides: InsightStripSlide[] }) {
  const n = slides.length;
  const extended = n > 0 ? [slides[n - 1], ...slides, slides[0]] : [];
  const [pos, setPos] = useState(1);
  const [animating, setAnimating] = useState(true);
  const [paused, setPaused] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const snappingRef = useRef(false);

  posRef.current = pos;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setSlideWidth(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const runLoopSnap = useCallback(() => {
    if (n < 1 || snappingRef.current) return;
    const current = posRef.current;
    if (current === n + 1) {
      snappingRef.current = true;
      snapAfterLoop(trackRef.current, setAnimating, setPos, 1, () => {
        snappingRef.current = false;
      });
    } else if (current === 0) {
      snappingRef.current = true;
      snapAfterLoop(trackRef.current, setAnimating, setPos, n, () => {
        snappingRef.current = false;
      });
    }
  }, [n]);

  const goNext = useCallback(() => {
    if (snappingRef.current || n < 1 || slideWidth < 1) return;
    setAnimating(true);
    setPos(p => p + 1);
  }, [n, slideWidth]);

  const goPrev = useCallback(() => {
    if (snappingRef.current || n < 1 || slideWidth < 1) return;
    setAnimating(true);
    setPos(p => p - 1);
  }, [n, slideWidth]);

  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
      runLoopSnap();
    },
    [runLoopSnap],
  );

  useEffect(() => {
    if (n < 1) return;
    const current = posRef.current;
    if (current !== n + 1 && current !== 0) return;
    const id = window.setTimeout(() => {
      if (posRef.current === n + 1 || posRef.current === 0) {
        runLoopSnap();
      }
    }, TRANSITION_MS + 80);
    return () => window.clearTimeout(id);
  }, [pos, n, runLoopSnap]);

  useEffect(() => {
    if (paused || n < 2 || slideWidth < 1) return;
    const id = window.setInterval(() => {
      if (snappingRef.current) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, goNext, n, slideWidth]);

  const visualIdx = pos === 0 ? n - 1 : pos > n ? 0 : pos - 1;
  const canSlide = slideWidth > 0;
  const offsetPx = canSlide ? pos * slideWidth : 0;

  if (n === 0) return null;

  return (
    <section
      className="hybrid-strip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={viewportRef} className="hybrid-strip__viewport">
        {canSlide ? (
          <div
            ref={trackRef}
            className="hybrid-strip__track"
            style={{
              transform: `translate3d(-${offsetPx}px, 0, 0)`,
              transition: animating
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {extended.map((slide, i) => (
              <StripSlide key={`strip-slide-${i}`} slide={slide} width={slideWidth} />
            ))}
          </div>
        ) : (
          <StripSlide slide={slides[visualIdx]} />
        )}
      </div>
      <div className="hybrid-strip__ctrl">
        <button type="button" onClick={goPrev} aria-label="Previous insight"><ChevronLeft size={14} /></button>
        <div className="hybrid-strip__dots">
          {slides.map((_, i) => (
            <span key={i} className={i === visualIdx ? 'is-active' : ''} />
          ))}
        </div>
        <button type="button" onClick={goNext} aria-label="Next insight"><ChevronRight size={14} /></button>
      </div>
    </section>
  );
}
