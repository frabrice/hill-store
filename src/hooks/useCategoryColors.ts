import { useMemo } from 'react';
import { useCategories } from './useCatalog';
import type { ColorKey } from '@/lib/services/types';

/**
 * Category slug → brand pastel. Products only store their category, so this is
 * how any product-shaped component learns which colour to wear.
 */
export function useCategoryColors() {
  const { data: categories } = useCategories();

  return useMemo(() => {
    const map = new Map<string, ColorKey>();
    categories?.forEach((c) => map.set(c.slug, c.colorKey));
    return (slug: string): ColorKey => map.get(slug) ?? 'pink';
  }, [categories]);
}
