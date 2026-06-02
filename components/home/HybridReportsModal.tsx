'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, X } from 'lucide-react';
import { ALL_REPORTS } from '@/components/home/home-data';

export interface HybridReportsModalProps {
  open: boolean;
  onClose: () => void;
}

export function HybridReportsModal({ open, onClose }: HybridReportsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="hybrid-reports-modal__backdrop theme-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hybrid-reports-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hybrid-reports-modal modal-panel" onClick={e => e.stopPropagation()}>
        <header className="hybrid-reports-modal__head">
          <div>
            <h2 id="hybrid-reports-modal-title">All reports</h2>
            <p>Download or review recent exports</p>
          </div>
          <button
            type="button"
            className="hybrid-reports-modal__close modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </header>

        <div className="hybrid-reports-modal__body hybrid-reports">
          {ALL_REPORTS.map((r, idx) => (
            <div
              key={r.id}
              className={`hybrid-reports__row${idx === 0 ? ' hybrid-reports__row--first' : ''}`}
            >
              <span className="hybrid-reports__icon" aria-hidden>
                <FileText size={14} strokeWidth={1.5} />
              </span>
              <div className="hybrid-reports__copy">
                <strong>{r.name}</strong>
                <span className="hybrid-reports__meta">
                  <span>{r.scope}</span>
                  <span className="hybrid-reports__dot" aria-hidden>
                    ●
                  </span>
                  <span>{r.date}</span>
                </span>
              </div>
              <span className="hybrid-reports__tag">{r.tag}</span>
              <button
                type="button"
                className="hybrid-reports__download"
                aria-label={`Download ${r.name}`}
                onClick={e => e.stopPropagation()}
              >
                <Download size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
