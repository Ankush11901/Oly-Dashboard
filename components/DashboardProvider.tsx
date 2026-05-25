'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Using ALL_WIDGETS from ChartSelector directly or hardcoding the default list.
// The default enabled widgets are the first 5 in the ALL_WIDGETS list.
const DEFAULT_ENABLED = new Set(['footfall_trend', 'top_stores', 'kpi_metrics', 'demographics_donut', 'conversion_donut']);

interface DashboardContextType {
  enabledWidgets: Set<string>;
  toggleWidget: (id: string) => void;
  isChartSelectorOpen: boolean;
  setChartSelectorOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  enabledWidgets: DEFAULT_ENABLED,
  toggleWidget: () => {},
  isChartSelectorOpen: false,
  setChartSelectorOpen: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(DEFAULT_ENABLED);
  const [isChartSelectorOpen, setChartSelectorOpen] = useState(false);

  // You can optionally persist this to localStorage later if needed
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oly-enabled-widgets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setEnabledWidgets(new Set(parsed));
        }
      }
    } catch (e) {
      console.error('Failed to load widgets from local storage', e);
    }
  }, []);

  const toggleWidget = (id: string) => {
    setEnabledWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('oly-enabled-widgets', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save widgets to local storage', e);
      }
      return next;
    });
  };

  return (
    <DashboardContext.Provider value={{ enabledWidgets, toggleWidget, isChartSelectorOpen, setChartSelectorOpen }}>
      {children}
    </DashboardContext.Provider>
  );
}
