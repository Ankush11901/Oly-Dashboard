'use client';

/** Report body always renders as a light document inside the theme-aware preview panel. */
export function ReportDocument({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="report-document"
      data-theme="light"
      style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
    >
      {children}
    </div>
  );
}
