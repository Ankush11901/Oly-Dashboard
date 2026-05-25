import { SideNav } from '@/components/SideNav';
import { TopBar } from '@/components/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full" style={{ background: 'var(--color-page-bg)' }}>
      <SideNav />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--color-page-bg)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
