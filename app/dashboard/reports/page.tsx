'use client';
import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { ReportFilterDropdown } from '@/components/reports/ReportFilterDropdown';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ReportOverallPreview, ReportHourlyPreview } from '@/components/reports/ReportPreview';
import { ReportDocument } from '@/components/reports/ReportDocument';

type AnalysisType = 'overall' | 'hourly';

const COUNTRIES = ['All Countries', 'Singapore', 'Malaysia', 'UAE', 'India'];
const BRANDS = ['All Brands', 'Landmark', 'Centrepoint', 'Max Fashion', 'Babyshop', 'Home Centre'];
const STORES = ['All Stores', 'Marina Bay Sands', 'VivoCity', 'Orchard Central', 'Bugis Junction', 'Ibn Battuta Mall', 'Al Ghurair Centre'];

/** Viewport minus TopBar (64) + filter row (64) + page padding (40) */
const PANEL_HEIGHT = 'calc(100vh - var(--topbar-height) - 64px - 40px)';

export default function ReportsPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('overall');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [country, setCountry] = useState('All Countries');
  const [brand, setBrand] = useState('All Brands');
  const [store, setStore] = useState('All Stores');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canGenerate = Boolean(dateRange.start && dateRange.end);

  const handleClear = () => {
    setDateRange({ start: null, end: null });
    setCountry('All Countries');
    setBrand('All Brands');
    setStore('All Stores');
    setAnalysisType('overall');
    setGenerated(false);
  };

  const handleGenerate = () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 800);
  };

  const fieldLabel = { fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 8, display: 'block' } as const;

  const panelCard = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-card)',
  } as const;

  return (
    <div
      className="reports-page"
      style={{
        padding: '20px 24px',
        background: 'var(--color-page-bg)',
        height: PANEL_HEIGHT,
        minHeight: 440,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 42%) minmax(0, 58%)',
          gap: 20,
          height: '100%',
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        {/* ── Left: Export config ── */}
        <aside
          style={{
            ...panelCard,
            padding: '20px 22px',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 18px', flexShrink: 0 }}>
            Export a Report
          </h1>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 2 }} className="reports-preview-scroll">
            <div style={{ marginBottom: 18 }}>
              <span style={fieldLabel}>Analysis Type</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([
                  { id: 'overall' as const, label: 'Overall Footfall' },
                  { id: 'hourly' as const,  label: 'Hourly Footfall'  },
                ]).map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${analysisType === opt.id ? 'var(--color-primary-emphasis)' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {analysisType === opt.id && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-emphasis)' }} />
                      )}
                    </span>
                    <input
                      type="radio"
                      name="analysisType"
                      checked={analysisType === opt.id}
                      onChange={() => { setAnalysisType(opt.id); setGenerated(false); }}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={fieldLabel}>Date Range</span>
              <DateRangePicker
                value={dateRange}
                onChange={range => { setDateRange(range); setGenerated(false); }}
              />
            </div>

            <div>
              <span style={fieldLabel}>Filters</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ReportFilterDropdown label="Country" value={country} options={COUNTRIES} onChange={v => { setCountry(v); setGenerated(false); }} />
                  <ReportFilterDropdown label="Brand" value={brand} options={BRANDS} onChange={v => { setBrand(v); setGenerated(false); }} />
                </div>
                <ReportFilterDropdown label="Stores" value={store} options={STORES} onChange={v => { setStore(v); setGenerated(false); }} />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
            }}
          >
            {(generated || canGenerate) && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-2)',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className={canGenerate && !generating ? 'btn-primary' : undefined}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid transparent',
                fontSize: 13,
                fontWeight: 600,
                cursor: canGenerate && !generating ? 'pointer' : 'not-allowed',
                background: canGenerate && !generating ? undefined : 'var(--color-surface-2)',
                color: canGenerate && !generating ? undefined : 'var(--color-text-4)',
              }}
            >
              {generating ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </aside>

        {/* ── Right: Preview ── */}
        <main style={{ minWidth: 0, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              ...panelCard,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>Preview</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  disabled={!generated}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 7,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: generated ? 'var(--color-text-2)' : 'var(--color-text-4)',
                    cursor: generated ? 'pointer' : 'not-allowed',
                    opacity: generated ? 1 : 0.65,
                  }}
                >
                  <FileSpreadsheet size={13} strokeWidth={1.75} style={{ color: generated ? '#16A34A' : 'var(--color-text-4)' }} />
                  Export CSV
                </button>
                <button
                  type="button"
                  disabled={!generated}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 7,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: generated ? 'var(--color-text-2)' : 'var(--color-text-4)',
                    cursor: generated ? 'pointer' : 'not-allowed',
                    opacity: generated ? 1 : 0.65,
                  }}
                >
                  <FileText size={13} strokeWidth={1.75} style={{ color: generated ? '#DC2626' : 'var(--color-text-4)' }} />
                  Export PDF
                </button>
              </div>
            </div>

            <div
              className="reports-preview-scroll reports-preview-body"
              style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}
            >
              {!generated ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 280,
                    color: 'var(--color-text-4)',
                    fontSize: 13,
                  }}
                >
                  Preview Not Available
                </div>
              ) : (
                <ReportDocument>
                  {analysisType === 'overall' ? (
                    <ReportOverallPreview key="overall-preview" />
                  ) : (
                    <ReportHourlyPreview key="hourly-preview" />
                  )}
                </ReportDocument>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
