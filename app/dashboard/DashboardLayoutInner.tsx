'use client';
import React from 'react';
import { SideNav } from '@/components/SideNav';
import { TopBar } from '@/components/TopBar';
import { ChartSelector } from '@/components/ChartSelector';
import { useDashboardContext } from '@/components/DashboardProvider';

export function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { isChartSelectorOpen, setChartSelectorOpen, enabledWidgets, toggleWidget } = useDashboardContext();

  return (
    <>
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
      
      <ChartSelector
        open={isChartSelectorOpen}
        onClose={() => setChartSelectorOpen(false)}
        enabled={enabledWidgets}
        onToggle={toggleWidget}
      />
    </>
  );
}
