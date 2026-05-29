'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Ticket, Plus, ChevronDown, ChevronUp, X,
  AlertTriangle, CheckCircle2, Clock, MessageSquare,
  Sparkles, BarChart2, Layers, ArrowRight, MapPin, Calendar,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type TicketStatus = 'open' | 'in_review' | 'resolved';
type TicketCategory = 'accuracy' | 'requirement' | 'technical' | 'other';

interface TicketReply {
  from: 'user' | 'support';
  body: string;
  time: string;
}

interface SupportTicket {
  id: string;
  category: TicketCategory;
  area: string;
  status: TicketStatus;
  date: string;
  dateRaw: string;
  store: string;
  eventTime?: string;
  comment: string;
  replies: TicketReply[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2024-001',
    category: 'accuracy',
    area: 'Footfall',
    status: 'in_review',
    date: 'Today, 9:42 AM',
    dateRaw: '2026-05-26T09:42:00',
    store: 'Store 1 – Marina Bay Sands',
    eventTime: '2:00 PM – 3:00 PM',
    comment:
      'The footfall counter showed only 310 visitors during this window but we counted approximately 420 manually.',
    replies: [],
  },
  {
    id: 'TKT-2024-002',
    category: 'accuracy',
    area: 'Queue Mgmt',
    status: 'resolved',
    date: 'Yesterday, 3:15 PM',
    dateRaw: '2026-05-25T15:15:00',
    store: 'Store 2 – Orchard Central',
    eventTime: 'Yesterday, 2:34 PM',
    comment:
      'Queue alert showed 8 people but the actual count was 4. Screenshot attached.',
    replies: [
      {
        from: 'support',
        body: 'Hi, we reviewed the alert from 2:34 PM. The discrepancy was due to a partial camera obstruction. The camera angle has been recalibrated. Thank you for flagging this — the correction is live as of this morning.',
        time: 'Today, 8:10 AM',
      },
    ],
  },
  {
    id: 'TKT-2024-003',
    category: 'requirement',
    area: 'Reporting',
    status: 'open',
    date: '2 days ago',
    dateRaw: '2026-05-24T11:00:00',
    store: 'All Stores',
    comment:
      'We need a weekly PDF export of the footfall summary that can be emailed directly to store managers.',
    replies: [],
  },
];

// ── Config ────────────────────────────────────────────────────────────────────
const CATEGORY_CFG: Record<TicketCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  accuracy:    { label: 'Accuracy',    color: '#D97706', bg: 'var(--color-warning-light)', icon: <AlertTriangle size={11} strokeWidth={2.5} /> },
  requirement: { label: 'Requirement', color: '#00CE9C', bg: '#CCFBF1',                    icon: <Sparkles      size={11} strokeWidth={2.5} /> },
  technical:   { label: 'Technical',   color: '#3B82F6', bg: 'var(--color-info-light)',    icon: <Layers        size={11} strokeWidth={2.5} /> },
  other:       { label: 'Other',       color: 'var(--color-text-3)', bg: 'var(--color-surface-2)', icon: <BarChart2 size={11} strokeWidth={2.5} /> },
};

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  open:      { label: 'Open',      color: 'var(--color-primary)', bg: 'var(--color-accent-bg)', border: 'var(--color-accent-border)', icon: <Clock         size={11} strokeWidth={2} /> },
  in_review: { label: 'In Review', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', border: 'var(--color-border)', icon: <MessageSquare size={11} strokeWidth={2} /> },
  resolved:  { label: 'Resolved',  color: 'var(--color-success)', bg: 'var(--color-success-light)', border: 'var(--color-border)', icon: <CheckCircle2  size={11} strokeWidth={2} /> },
};

const STATUS_ACCENT: Record<TicketStatus, string> = {
  open:      'var(--chart-1)',
  in_review: '#D97706',
  resolved:  '#16A34A',
};

const AREAS = ['Footfall', 'Queue Mgmt', 'Demographics', 'Conversion', 'Reporting', 'Camera / Hardware', 'Other'];
const STORES = ['All Stores', 'Marina Bay Sands', 'Orchard Central', 'VivoCity', 'Bugis Junction', 'Tampines Mall', 'Jurong Point', 'Northpoint City'];

// ── Sub-components ────────────────────────────────────────────────────────────
function CategoryBadge({ cat }: { cat: TicketCategory }) {
  const c = CATEGORY_CFG[cat];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 5,
      background: c.bg, color: c.color,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {c.icon}
      {c.label}
    </span>
  );
}

function StatusPill({ status }: { status: TicketStatus }) {
  const s = STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 11.5, fontWeight: 600,
    }}>
      {s.icon}
      {s.label}
    </span>
  );
}

function SupportAvatar({ from }: { from: 'user' | 'support' }) {
  const isSupport = from === 'support';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: isSupport ? 'var(--color-primary-emphasis)' : 'var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: isSupport ? 'white' : 'var(--color-text-3)',
    }}>
      {isSupport ? 'OS' : 'ME'}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const [open, setOpen] = useState(ticket.status === 'in_review');
  const accent = STATUS_ACCENT[ticket.status];

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: open ? `0 4px 16px rgba(0,0,0,0.07)` : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 20px', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--color-border-subtle)' : 'none',
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Left: category + area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <CategoryBadge cat={ticket.category} />
          <span style={{ fontSize: 12, color: 'var(--color-border)' }}>›</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.area}</span>
        </div>

        {/* Right: meta + status + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-4)', whiteSpace: 'nowrap', fontFamily: 'monospace', letterSpacing: '0.03em' }}>{ticket.id}</span>
          <span style={{ fontSize: 11.5, color: 'var(--color-text-4)', whiteSpace: 'nowrap' }}>{ticket.date}</span>
          <StatusPill status={ticket.status} />
          <span style={{ color: 'var(--color-text-4)', lineHeight: 0 }}>
            {open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
          </span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <MapPin size={12} strokeWidth={2} style={{ color: 'var(--color-text-3)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-2)' }}>{ticket.store}</span>
            </div>
            {ticket.eventTime && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <Calendar size={12} strokeWidth={2} style={{ color: 'var(--color-text-3)' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-2)' }}>{ticket.eventTime}</span>
              </div>
            )}
          </div>

          {/* User comment */}
          <div style={{ display: 'flex', gap: 12 }}>
            <SupportAvatar from="user" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)' }}>You</span>
                <span style={{ fontSize: 11, color: 'var(--color-border)' }}>·</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-4)' }}>{ticket.date}</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.65, margin: 0 }}>{ticket.comment}</p>
              </div>
            </div>
          </div>

          {/* Support replies */}
          {ticket.replies.map((reply, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <SupportAvatar from={reply.from} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: reply.from === 'support' ? 'var(--color-primary)' : 'var(--color-text-2)' }}>
                    {reply.from === 'support' ? 'Oly Support' : 'You'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-border)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-4)' }}>{reply.time}</span>
                </div>
                <div style={{
                  background: reply.from === 'support' ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                  border: `1px solid ${reply.from === 'support' ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.65, margin: 0 }}>{reply.body}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Pending state */}
          {ticket.replies.length === 0 && ticket.status !== 'resolved' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
              <Clock size={13} strokeWidth={2} style={{ color: '#D97706', flexShrink: 0 }} />
              <p style={{ fontSize: 12.5, color: '#92400E', margin: 0 }}>
                Awaiting response from the Oly support team — typically within 24 hours.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Raise New Concern modal ───────────────────────────────────────────────────
function RaiseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (t: SupportTicket) => void }) {
  const [form, setForm] = useState({
    category: 'accuracy' as TicketCategory,
    area: 'Footfall',
    store: 'All Stores',
    eventTime: '',
    comment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    const id = `TKT-2024-${String(Math.floor(Math.random() * 900) + 100)}`;
    onSubmit({
      id,
      category: form.category,
      area: form.area,
      status: 'open',
      date: 'Just now',
      dateRaw: new Date().toISOString(),
      store: form.store,
      eventTime: form.eventTime || undefined,
      comment: form.comment,
      replies: [],
    });
    onClose();
  };

  const field: React.CSSProperties = {
    width: '100%', fontSize: 13, borderRadius: 8,
    border: '1px solid var(--color-border)', padding: '9px 12px',
    color: 'var(--color-text-1)', background: 'var(--color-surface)', outline: 'none',
    boxSizing: 'border-box',
  };
  // Select fields need extra right padding so text doesn't overlap the native chevron
  const selectField: React.CSSProperties = { ...field, paddingRight: 32 };
  const label: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'var(--color-text-3)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}
      >
        {/* Modal header */}
        <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={18} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 1 }}>Raise a New Concern</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-4)' }}>We'll review and respond within 24 hours</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-4)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={label}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as TicketCategory })} style={{ ...selectField, cursor: 'pointer' }}>
                {(Object.keys(CATEGORY_CFG) as TicketCategory[]).map(k => (
                  <option key={k} value={k}>{CATEGORY_CFG[k].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>Area</label>
              <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} style={{ ...selectField, cursor: 'pointer' }}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={label}>Store</label>
            <select value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} style={{ ...selectField, cursor: 'pointer' }}>
              {STORES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={label}>Event Time <span style={{ color: 'var(--color-text-4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Yesterday, 2:30 PM or 11:00 AM – 12:00 PM"
              value={form.eventTime}
              onChange={e => setForm({ ...form, eventTime: e.target.value })}
              style={field}
            />
          </div>

          <div>
            <label style={label}>Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the issue in detail — what you observed, expected vs actual…"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              style={{ ...field, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-2)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 2, height: 40, borderRadius: 8, border: 'none', background: 'var(--color-primary-emphasis)', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              <Ticket size={14} strokeWidth={2} />
              Submit Ticket
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tickets, setTickets] = useState<SupportTicket[]>(TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');

  // Auto-open Raise New Concern modal when navigated from Quick Actions
  useEffect(() => {
    if (searchParams.get('action') === 'raise-concern') {
      setShowModal(true);
      router.replace('/dashboard/preferences/tickets');
    }
  }, [searchParams, router]);

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const total          = tickets.length;
  const openCount      = tickets.filter(t => t.status === 'open' || t.status === 'in_review').length;
  const resolvedCount  = tickets.filter(t => t.status === 'resolved').length;

  const addTicket = (t: SupportTicket) => setTickets(prev => [t, ...prev]);

  return (
    <div style={{ padding: 32 }}>

      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={18} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-1)', letterSpacing: '-0.02em', margin: 0 }}>My Tickets</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-4)', margin: 0, paddingLeft: 46 }}>
            Track concerns you&apos;ve raised and see responses from the Oly support team.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: 'var(--color-primary-emphasis)', color: 'white',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(101,91,211,0.30)',
            transition: 'background 150ms ease, box-shadow 150ms ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'; }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Raise New Concern
        </button>
      </div>

      {/* KPI summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Raised',     value: total,          color: 'var(--color-primary)', bg: 'var(--color-accent-bg)', border: 'var(--color-accent-border)', status: 'all'      as const },
          { label: 'Open / In Review', value: openCount,      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', status: 'open'     as const },
          { label: 'Resolved',         value: resolvedCount,  color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', status: 'resolved' as const },
        ].map(({ label, value, color, bg, border, status }) => (
          <button
            key={label}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            style={{
              background: filter === status ? bg : 'var(--color-surface)',
              border: `1px solid ${filter === status ? border : 'var(--color-border)'}`,
              borderRadius: 12, padding: '20px 22px',
              textAlign: 'left', cursor: 'pointer',
              boxShadow: filter === status ? `0 2px 12px ${color}18` : '0 1px 2px var(--color-border-subtle)',
              transition: 'all 150ms ease',
            }}
          >
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: filter === status ? color : 'var(--color-text-4)', marginBottom: 10 }}>
              {label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, color: filter === status ? color : 'var(--color-text-1)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {value}
            </p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'inline-flex', background: 'var(--color-surface-2)', borderRadius: 9, padding: 3, gap: 2, marginBottom: 18 }}>
        {(['all', 'open', 'in_review', 'resolved'] as const).map((f) => {
          const active = filter === f;
          const label = f === 'all' ? 'All' : f === 'in_review' ? 'In Review' : f === 'open' ? 'Open' : 'Resolved';
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 15px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                background: active ? 'var(--color-surface)' : 'transparent',
                color: active ? 'var(--color-text-1)' : 'var(--color-text-3)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              {label}
              {f !== 'all' && (
                <span style={{
                  marginLeft: 6, fontSize: 10.5, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 999,
                  background: active ? (STATUS_CFG[f]?.bg ?? 'var(--color-surface-2)') : 'var(--color-border)',
                  color: active ? (STATUS_CFG[f]?.color ?? 'var(--color-text-3)') : 'var(--color-text-4)',
                }}>
                  {tickets.filter(t => t.status === f).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ticket list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--color-text-4)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Ticket size={26} strokeWidth={1} style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>No tickets found</p>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-4)' }}>Raise a concern to get started</p>
          </div>
        ) : (
          filtered.map(t => <TicketRow key={t.id} ticket={t} />)
        )}
      </div>

      {showModal && (
        <RaiseModal onClose={() => setShowModal(false)} onSubmit={addTicket} />
      )}
    </div>
  );
}
