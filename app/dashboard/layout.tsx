import { SideNav } from '@/components/SideNav';
import { TopBar } from '@/components/TopBar';
import { DashboardProvider } from '@/components/DashboardProvider';
import { DashboardLayoutInner } from './DashboardLayoutInner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardProvider>
  );
}
