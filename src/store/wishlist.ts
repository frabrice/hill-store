import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Just product IDs, not a snapshot like the cart — a saved-for-later list
 * always wants the *current* price/stock/photo when it's shown again,
 * unlike a cart line which must not silently change under someone.
 */
interface WishlistState {
  productIds: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      has: (id) => get().productIds.includes(id),

      toggle: (id) =>
        set((s) => ({
          productIds: s.productIds.includes(id)
            ? s.productIds.filter((p) => p !== id)
            : [...s.productIds, id],
        })),

      remove: (id) => set((s) => ({ productIds: s.productIds.filter((p) => p !== id) })),
    }),
    { name: 'ibibondo-wishlist' },
  ),
);

export const selectWishlistCount = (s: WishlistState) => s.productIds.length;
