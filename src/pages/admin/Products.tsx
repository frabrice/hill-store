import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Badge } from '@/components/admin/Badge';
import { Select } from '@/components/admin/Field';
import { DataTable } from '@/components/admin/DataTable';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { ProductImage } from '@/components/shop/ProductImage';
import { ACCENTS } from '@/lib/theme';
import { rwfFull } from '@/lib/format';
import type { Product } from '@/lib/services/types';

const LOW_STOCK_THRESHOLD = 8;
const columnHelper = createColumnHelper<Product>();

export function Products() {
  const navigate = useNavigate();
  const { data: productsData, isLoading } = useProducts({});
  const { data: categories } = useCategories();
  const colorFor = useCategoryColors();

  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  const products = productsData?.items ?? [];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      if (search) {
        const needle = search.toLowerCase();
        if (!`${p.name} ${p.brand} ${p.tags.join(' ')}`.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [products, search, categorySlug]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Product',
        cell: (info) => {
          const p = info.row.original;
          const colorKey = colorFor(p.categorySlug);
          return (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-sunk">
                <ProductImage publicId={p.images[0]} alt={p.name} colorKey={colorKey} art={p.art} width={88} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{p.name}</p>
                <p className="truncate text-xs text-ink-faint">{p.subtitle}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('categorySlug', {
        header: 'Category',
        cell: (info) => {
          const slug = info.getValue();
          const category = categories?.find((c) => c.slug === slug);
          const colorKey = colorFor(slug);
          return (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `hsl(${ACCENTS[colorKey].soft})`,
                color: `hsl(${ACCENTS[colorKey].ink})`,
              }}
            >
              {category?.name ?? slug}
            </span>
          );
        },
      }),
      columnHelper.accessor('priceRwf', {
        header: 'Price',
        cell: (info) => <span className="tabular-nums">{rwfFull(info.getValue())}</span>,
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => {
          const stock = info.getValue();
          const low = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
          const out = stock <= 0;
          return (
            <span
              className={
                out
                  ? 'font-semibold tabular-nums text-red-600'
                  : low
                    ? 'font-semibold tabular-nums text-amber-600'
                    : 'tabular-nums text-ink'
              }
            >
              {stock}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'flags',
        header: 'Flags',
        cell: (info) => {
          const p = info.row.original;
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {p.isFeatured && (
                <Badge tone="info">
                  <Sparkles className="h-3 w-3" aria-hidden /> Featured
                </Badge>
              )}
              {p.isBestseller && (
                <Badge tone="success">
                  <Star className="h-3 w-3" aria-hidden /> Bestseller
                </Badge>
              )}
            </div>
          );
        },
      }),
    ],
    [categories, colorFor],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">{products.length} products in the catalogue</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="h-4 w-4" aria-hidden />
          Add product
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-hairline p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand or tag…"
              className="w-full rounded-lg border border-hairline bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-[hsl(var(--accent-ink))]"
            />
          </div>
          <Select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-auto min-w-[180px]"
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-ink-faint">Loading…</p>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={(p) => navigate(`/admin/products/${p.slug}/edit`)}
              emptyMessage="No products match your search."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
