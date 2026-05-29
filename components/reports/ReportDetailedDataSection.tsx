'use client';
import { Table2 } from 'lucide-react';

export const REPORT_TABLE_ROWS = [
  { sno: 1, date: '2026-05-28', country: 'Malaysia',     brand: 'BBS', store: 'BBS Plaza Merdeka',           code: '620025',  footfall: 455,  peak: '9 PM'  },
  { sno: 2, date: '2026-05-28', country: 'Indonesia',    brand: 'MAX', store: 'MAX PIM',                     code: '710002',  footfall: 2136, peak: '10 PM' },
  { sno: 3, date: '2026-05-28', country: 'United Arab Emirates', brand: 'MAX', store: 'MAX PIM 2',             code: '1300040', footfall: 901,  peak: '8 PM'  },
  { sno: 4, date: '2026-05-28', country: 'Oman',         brand: 'CP',  store: 'CP City Centre Muscat',       code: '810002',  footfall: 167,  peak: '7 PM'  },
  { sno: 5, date: '2026-05-28', country: 'Saudi Arabia', brand: 'HC',  store: 'HC Riyadh Park Mall',         code: '7100028', footfall: 120,  peak: '6 PM'  },
  { sno: 6, date: '2026-05-28', country: 'Qatar',        brand: 'MAX', store: 'MAX City Centre',             code: '410002',  footfall: 105,  peak: '5 PM'  },
  { sno: 7, date: '2026-05-28', country: 'Kuwait',       brand: 'HC',  store: 'HC Al Kout Mall',             code: '8100020', footfall: 32,   peak: '4 PM'  },
  { sno: 8, date: '2026-05-28', country: 'Bahrain',      brand: 'CP',  store: 'CP Seef Mall',                code: '4100020', footfall: 28,   peak: '3 PM'  },
];

const KPI_CARDS = [
  { label: 'Total Footfall',  value: '57,725', color: '#2563EB' },
  { label: 'Daily Average',   value: '57,725', color: '#059669' },
  { label: 'Conversion Rate', value: '17.96%', color: '#DC2626' },
];

export function ReportKpiSummary() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {KPI_CARDS.map(kpi => (
        <div
          key={kpi.label}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '18px 20px',
            textAlign: 'center',
            background: 'var(--color-surface)',
          }}
        >
          <p style={{ fontSize: 24, fontWeight: 700, color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-4)', marginTop: 8 }}>{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportDetailedDataTable() {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            {['S.No', 'Date', 'Country', 'Brand', 'Store Name', 'Store Code', 'Footfall', 'Peak Hour'].map(h => (
              <th
                key={h}
                style={{
                  padding: '11px 14px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-text-4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REPORT_TABLE_ROWS.map(row => (
            <tr key={row.sno} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-3)' }}>{row.sno}</td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>{row.date}</td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-2)' }}>{row.country}</td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-2)', fontWeight: 600 }}>{row.brand}</td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-2)' }}>{row.store}</td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-3)', fontFamily: 'monospace', fontSize: 11 }}>{row.code}</td>
              <td style={{ padding: '11px 14px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: 44,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    fontWeight: 600,
                    color: 'var(--color-text-1)',
                    textAlign: 'center',
                  }}
                >
                  {row.footfall.toLocaleString()}
                </span>
              </td>
              <td style={{ padding: '11px 14px', color: 'var(--color-text-2)', fontWeight: 500 }}>{row.peak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportDetailedDataSection({ showTopDivider = true }: { showTopDivider?: boolean }) {
  return (
    <div style={{
      marginTop: showTopDivider ? 24 : 0,
      paddingTop: showTopDivider ? 24 : 0,
      borderTop: showTopDivider ? '1px solid var(--color-border)' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Table2 size={15} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-1)', margin: 0 }}>Detailed Data</p>
      </div>

      <ReportDetailedDataTable />

      <div style={{ marginTop: 20 }}>
        <ReportKpiSummary />
      </div>
    </div>
  );
}
