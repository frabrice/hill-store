import { useEffect, useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Minus, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Badge } from '@/components/admin/Badge';
import { Select } from '@/components/admin/Field';
import { DataTable } from '@/components/admin/DataTable';
import { useAdjustStock, useCategories, useProducts } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { ProductImage } from '@/components/shop/ProductImage';
import { ACCENTS } from '@/lib/theme';
import { rwfFull } from '@/lib/format';
import type { Product } from '@/lib/services/types';

const LOW_STOCK_THRESHOLD = 8;
const columnHelper = createColumnHelper<Product>();

function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (stock <= LOW_STOCK_THRESHOLD) return <Badge tone="warning">Low stock</Badge>;
  return <Badge tone="success">In stock</Badge>;
}

function StockAdjuster({ product }: { product: Product }) {
  const [value, setValue] = useState(product.stock);
  const adjustStock = useAdjustStock();

  useEffect(() => setValue(product.stock), [product.stock]);

  // Debounced so a burst of +/- clicks collapses into one write instead of
  // racing several — a plain click handler that reads `value` from its own
  // render closure would silently drop clicks that land before React
  // re-renders (each `commit` sees the same stale number).
  useEffect(() => {
    if (value === product.stock) return;
    const t = setTimeout(() => adjustStock.mutate({ id: product.id, stock: value }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adjustStock's identity isn't part of the debounce condition
  }, [value, product.id, product.stock]);

  const step = (delta: number) => setValue((v) => Math.max(0, v + delta));
  const setFromInput = (raw: string) => setValue(Math.max(0, Math.round(Number(raw) || 0)));

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => step(-1)}
        aria-label="Decrease stock"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hairline text-ink-soft hover:bg-surface-sunk"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setFromInput(e.target.value)}
        className="w-14 rounded-md border border-hairline bg-cream px-1.5 py-1 text-center text-sm tabular-nums outline-none focus:border-[hsl(var(--accent-ink))]"
      />
      <button
        onClick={() => step(1)}
        aria-label="Increase stock"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hairline text-ink-soft hover:bg-surface-sunk"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function Inventory() {
  const { data: productsData, isLoading } = useProducts({});
  const { data: categories } = useCategories();
  const colorFor = useCategoryColors();

  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const products = productsData?.items ?? [];
  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;
  const stockValueAtRisk = products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .reduce((sum, p) => sum + p.priceRwf * p.stock, 0);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (categorySlug && p.categorySlug !== categorySlug) return false;
        if (lowStockOnly && p.stock > LOW_STOCK_THRESHOLD) return false;
        if (search) {
          const needle = search.toLowerCase();
          if (!`${p.name} ${p.brand}`.toLowerCase().includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, search, categorySlug, lowStockOnly]);

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
                <p className="text-xs text-ink-faint">{rwfFull(p.priceRwf)}</p>
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
      columnHelper.accessor('stock', {
        header: 'Status',
        cell: (info) => <StockStatus stock={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'adjust',
        header: 'Stock',
        cell: (info) => <StockAdjuster product={info.row.original} />,
      }),
    ],
    [categories, colorFor],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Inventory</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {lowStockCount} products at or below {LOW_STOCK_THRESHOLD} units · {rwfFull(stockValueAtRisk)} in
          stock value at risk
        </p>
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
              placeholder="Search by name or brand…"
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
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-hairline text-[hsl(var(--accent-ink))] focus:ring-[hsl(var(--accent-ink))]"
            />
            Low stock only
          </label>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-ink-faint">Loading…</p>
          ) : (
            <DataTable columns={columns} data={filtered} emptyMessage="No products match your search." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
