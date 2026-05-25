import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OlyRetail Analytics Dashboard',
  description: 'Unified retail analytics for Landmark Asia and Landmark US',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
