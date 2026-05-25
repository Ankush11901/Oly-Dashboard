import { SideNav } from '@/components/SideNav';
import { TopBar } from '@/components/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <SideNav />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--color-neutral-50)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
