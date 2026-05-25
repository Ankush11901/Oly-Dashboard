'use client';
import { createContext, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force light mode
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('oly-theme', 'light');
  }, []);

  const toggle = () => {
    // Disabled theme toggling
  };

  return <Ctx.Provider value={{ theme: 'light', toggle }}>{children}</Ctx.Provider>;
}
