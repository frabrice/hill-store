import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorKey } from '@/lib/services/types';
import type { ThemeMode } from '@/lib/theme';

interface UIState {
  theme: ThemeMode;
  /** Which category colour the whole interface is currently wearing. */
  accent: ColorKey;
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;

  toggleTheme: () => void;
  setAccent: (accent: ColorKey) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: 'day',
      accent: 'pink',
      cartOpen: false,
      searchOpen: false,
      mobileNavOpen: false,

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'day' ? 'night' : 'day' })),
      setAccent: (accent) => set({ accent }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
    }),
    {
      name: 'ibibondo-ui',
      // Only the durable preferences survive a reload — never open panels.
      partialize: (s) => ({ theme: s.theme, accent: s.accent }),
    },
  ),
);
