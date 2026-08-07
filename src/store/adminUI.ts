import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

/** Just the sidebar's collapsed/expanded preference — kept separate from the
 * storefront's `useUI` store since the two apps' UI state has nothing in
 * common beyond both being persisted locally. */
export const useAdminUI = create<AdminUIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'ibibondo-admin-ui' },
  ),
);
