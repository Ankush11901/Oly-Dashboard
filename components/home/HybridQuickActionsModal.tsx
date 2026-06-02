'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  QUICK_ACTION_POOL,
  RECENT_ACTION_SUGGESTIONS,
  HYBRID_QUICK_ACTION_SLOT_COUNT,
  type QuickActionDef,
} from '@/components/home/home-data';

type Tab = 'shortcuts' | 'recent' | 'all';

export interface HybridQuickActionsModalProps {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}

function actionById(id: string): QuickActionDef | undefined {
  return QUICK_ACTION_POOL.find(a => a.id === id);
}

export function HybridQuickActionsModal({
  open,
  selectedIds,
  onClose,
  onSave,
}: HybridQuickActionsModalProps) {
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [tab, setTab] = useState<Tab>('shortcuts');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setTab('shortcuts');
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open, selectedIds]);

  const recentActions = useMemo(
    () =>
      RECENT_ACTION_SUGGESTIONS.map(r => ({
        ...r,
        action: actionById(r.actionId),
      })).filter((r): r is typeof r & { action: QuickActionDef } => Boolean(r.action)),
    [],
  );

  if (!open || !mounted) return null;

  const addId = (id: string) => {
    if (draft.includes(id) || draft.length >= HYBRID_QUICK_ACTION_SLOT_COUNT) return;
    setDraft(prev => [...prev, id]);
  };

  const removeId = (id: string) => {
    setDraft(prev => prev.filter(x => x !== id));
  };

  const poolAvailable = QUICK_ACTION_POOL.filter(a => !draft.includes(a.id));

  return createPortal(
    <div
      className="hybrid-qa-modal__backdrop theme-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hybrid-qa-modal-title"
      onClick={onClose}
    >
      <div className="hybrid-qa-modal" onClick={e => e.stopPropagation()}>
        <header className="hybrid-qa-modal__head">
          <div>
            <h2 id="hybrid-qa-modal-title">Manage quick actions</h2>
            <p>Pick up to {HYBRID_QUICK_ACTION_SLOT_COUNT} shortcuts. Recent actions help you add what you use most.</p>
          </div>
          <button type="button" className="hybrid-qa-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <nav className="hybrid-qa-modal__tabs" aria-label="Quick action sections">
          {([
            ['shortcuts', 'Your shortcuts'],
            ['recent', 'Recent actions'],
            ['all', 'All actions'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'is-active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hybrid-qa-modal__body">
          {tab === 'shortcuts' && (
            <div className="hybrid-qa-modal__shortcuts">
              {draft.length === 0 ? (
                <p className="hybrid-qa-modal__empty">No shortcuts yet. Add from Recent or All actions.</p>
              ) : (
                draft.map(id => {
                  const action = actionById(id);
                  if (!action) return null;
                  return (
                    <div key={id} className="hybrid-qa-modal__chip">
                      <span className="hybrid-qa-modal__chip-icon">{action.icon}</span>
                      <span className="hybrid-qa-modal__chip-label">{action.label}</span>
                      <button type="button" onClick={() => removeId(id)} aria-label={`Remove ${action.label}`}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
              {draft.length < HYBRID_QUICK_ACTION_SLOT_COUNT && (
                <p className="hybrid-qa-modal__hint">
                  {HYBRID_QUICK_ACTION_SLOT_COUNT - draft.length} slot{HYBRID_QUICK_ACTION_SLOT_COUNT - draft.length === 1 ? '' : 's'} available
                </p>
              )}
            </div>
          )}

          {tab === 'recent' && (
            <ul className="hybrid-qa-modal__list">
              {recentActions.map(({ actionId, usedAgo, action }) => {
                const added = draft.includes(actionId);
                const full = draft.length >= HYBRID_QUICK_ACTION_SLOT_COUNT;
                return (
                  <li key={actionId}>
                    <div className="hybrid-qa-modal__list-main">
                      <span className="hybrid-qa-modal__list-icon">{action.icon}</span>
                      <div>
                        <strong>{action.label}</strong>
                        <small>Used {usedAgo}</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={added || full}
                      onClick={() => addId(actionId)}
                    >
                      {added ? 'Added' : <><Plus size={12} /> Add</>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'all' && (
            <ul className="hybrid-qa-modal__list">
              {poolAvailable.map(action => (
                <li key={action.id}>
                  <div className="hybrid-qa-modal__list-main">
                    <span className="hybrid-qa-modal__list-icon">{action.icon}</span>
                    <div>
                      <strong>{action.label}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={draft.length >= HYBRID_QUICK_ACTION_SLOT_COUNT}
                    onClick={() => addId(action.id)}
                  >
                    <Plus size={12} /> Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="hybrid-qa-modal__foot">
          <button type="button" className="hybrid-qa-modal__cancel" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="hybrid-qa-modal__save"
            onClick={() => { onSave(draft); onClose(); }}
          >
            Save shortcuts
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
