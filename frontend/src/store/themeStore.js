import { create } from 'zustand';

const THEME_KEY = 'tudestino_theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    const next = theme === 'dark' ? 'dark' : 'light';
    window.localStorage.setItem(THEME_KEY, next);
    set({ theme: next });
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(THEME_KEY, next);
      return { theme: next };
    });
  },
}));
