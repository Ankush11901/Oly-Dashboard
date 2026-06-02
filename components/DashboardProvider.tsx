'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_ENABLED = new Set(['footfall_trend', 'top_stores', 'kpi_metrics', 'demographics_donut', 'conversion_donut']);

export type NavStyle = 'sidebar' | 'topnav';
export type HomeVariant = 0 | 1 | 2 | 3;

/** 0 = Hybrid, 1 = Classic, 2 = Bento, 3 = Widgets */
const HOME_VARIANT_STORAGE_KEY = 'oly-home-variant';
const HOME_VARIANT_ORDER_KEY = 'oly-home-variant-order-v2';

/** Maps pre-v2 indices (Classic=0 … Hybrid=3) to current order (Hybrid=0 … Widgets=3). */
const LEGACY_HOME_VARIANT_MAP: Record<HomeVariant, HomeVariant> = {
  0: 1,
  1: 2,
  2: 3,
  3: 0,
};

interface DashboardContextType {
  enabledWidgets: Set<string>;
  toggleWidget: (id: string) => void;
  isChartSelectorOpen: boolean;
  setChartSelectorOpen: (open: boolean) => void;
  navStyle: NavStyle;
  setNavStyle: (style: NavStyle) => void;
  refreshCount: number;
  triggerRefresh: () => void;
  insightsOpen: boolean;
  setInsightsOpen: (open: boolean) => void;
  homeVariant: HomeVariant;
  setHomeVariant: (variant: HomeVariant) => void;
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
  insightsOpen: false,
  setInsightsOpen: () => {},
  homeVariant: 0,
  setHomeVariant: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(DEFAULT_ENABLED);
  const [isChartSelectorOpen, setChartSelectorOpen] = useState(false);
  const [navStyle, setNavStyleState] = useState<NavStyle>('sidebar');
  const [refreshCount, setRefreshCount] = useState(0);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [homeVariant, setHomeVariantState] = useState<HomeVariant>(0);
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
      const storedHome = localStorage.getItem(HOME_VARIANT_STORAGE_KEY);
      if (storedHome === '0' || storedHome === '1' || storedHome === '2' || storedHome === '3') {
        const stored = Number(storedHome) as HomeVariant;
        const orderMigrated = localStorage.getItem(HOME_VARIANT_ORDER_KEY);
        if (!orderMigrated) {
          const mapped = LEGACY_HOME_VARIANT_MAP[stored];
          setHomeVariantState(mapped);
          localStorage.setItem(HOME_VARIANT_STORAGE_KEY, String(mapped));
          localStorage.setItem(HOME_VARIANT_ORDER_KEY, '1');
        } else {
          setHomeVariantState(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load preferences from localStorage', e);
    }
  }, []);

  const setHomeVariant = (variant: HomeVariant) => {
    setHomeVariantState(variant);
    try {
      localStorage.setItem(HOME_VARIANT_STORAGE_KEY, String(variant));
      localStorage.setItem(HOME_VARIANT_ORDER_KEY, '1');
    } catch (e) { /* noop */ }
  };

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
    <DashboardContext.Provider value={{ enabledWidgets, toggleWidget, isChartSelectorOpen, setChartSelectorOpen, navStyle, setNavStyle, refreshCount, triggerRefresh, insightsOpen, setInsightsOpen, homeVariant, setHomeVariant }}>
      {children}
    </DashboardContext.Provider>
  );
}
