'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_ENABLED = new Set(['footfall_trend', 'top_stores', 'kpi_metrics', 'demographics_donut', 'conversion_donut']);

export type NavStyle = 'sidebar' | 'topnav';

interface DashboardContextType {
  enabledWidgets: Set<string>;
  toggleWidget: (id: string) => void;
  isChartSelectorOpen: boolean;
  setChartSelectorOpen: (open: boolean) => void;
  navStyle: NavStyle;
  setNavStyle: (style: NavStyle) => void;
  refreshCount: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  enabledWidgets: DEFAULT_ENABLED,
  toggleWidget: () => {},
  isChartSelectorOpen: false,
  setChartSelectorOpen: () => {},
  navStyle: 'sidebar',
  setNavStyle: () => {},
  refreshCount: 0,
  triggerRefresh: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(DEFAULT_ENABLED);
  const [isChartSelectorOpen, setChartSelectorOpen] = useState(false);
  const [navStyle, setNavStyleState] = useState<NavStyle>('sidebar');
  const [refreshCount, setRefreshCount] = useState(0);
  const triggerRefresh = () => setRefreshCount(c => c + 1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('oly-enabled-widgets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setEnabledWidgets(new Set(parsed));
      }
      const storedNav = localStorage.getItem('oly-nav-style') as NavStyle | null;
      if (storedNav === 'sidebar' || storedNav === 'topnav') setNavStyleState(storedNav);
    } catch (e) {
      console.error('Failed to load preferences from localStorage', e);
    }
  }, []);

  const toggleWidget = (id: string) => {
    setEnabledWidgets((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem('oly-enabled-widgets', JSON.stringify(Array.from(next)));
      } catch (e) { /* noop */ }
      return next;
    });
  };

  const setNavStyle = (style: NavStyle) => {
    setNavStyleState(style);
    try {
      localStorage.setItem('oly-nav-style', style);
    } catch (e) { /* noop */ }
  };

  return (
    <DashboardContext.Provider value={{ enabledWidgets, toggleWidget, isChartSelectorOpen, setChartSelectorOpen, navStyle, setNavStyle, refreshCount, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}
