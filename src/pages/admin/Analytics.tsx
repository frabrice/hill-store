import { useMemo, type ReactNode } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bike, Boxes, ReceiptText, TrendingUp, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { DataTable } from '@/components/admin/DataTable';
import { useCategories, useOrders, useProducts } from '@/hooks/useCatalog';
import { ACCENTS } from '@/lib/theme';
import { rwfFull } from '@/lib/format';
import { deliveryMethodFor } from '@/lib/delivery';
import type { Product } from '@/lib/services/types';

const LOW_STOCK_THRESHOLD = 8;

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</p>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-sunk text-ink-soft">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-ink">{value}</p>
        {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function startOfWeek(iso: string): string {
  const date = new Date(iso);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

interface TopProductRow {
  name: string;
  units: number;
  revenue: number;
}

interface CategoryRow {
  name: string;
  units: number;
  revenue: number;
  sharePct: number;
}

const topProductColumns = createColumnHelper<TopProductRow>();
const categoryColumns = createColumnHelper<CategoryRow>();
const riskColumns = createColumnHelper<Product>();

export function Analytics() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: productsData, isLoading: productsLoading } = useProducts({});
  const { data: categories } = useCategories();

  const products = productsData?.items ?? [];
  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const liveOrders = useMemo(() => (orders ?? []).filter((o) => o.status !== 'cancelled'), [orders]);

  const totalRevenue = liveOrders.reduce((sum, o) => sum + o.totalRwf, 0);
  const totalOrders = liveOrders.length;
  const overallAOV = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const atRiskProducts = useMemo(
    () =>
      [...products]
        .filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => b.priceRwf * b.stock - a.priceRwf * a.stock),
    [products],
  );
  const stockValueAtRisk = atRiskProducts.reduce((sum, p) => sum + p.priceRwf * p.stock, 0);

  const revenueByDay = useMemo(() => {
    const buckets = new Map<string, number>();
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    liveOrders.forEach((o) => {
      const key = dayKey(o.createdAt);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + o.totalRwf);
    });
    return Array.from(buckets.entries()).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue,
    }));
  }, [liveOrders]);

  const aovByWeek = useMemo(() => {
    const buckets = new Map<string, { revenue: number; count: number }>();
    [...liveOrders]
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .forEach((o) => {
        const key = startOfWeek(o.createdAt);
        const bucket = buckets.get(key) ?? { revenue: 0, count: 0 };
        bucket.revenue += o.totalRwf;
        bucket.count += 1;
        buckets.set(key, bucket);
      });
    return Array.from(buckets.entries()).map(([week, { revenue, count }]) => ({
      week: new Date(week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      aov: count ? Math.round(revenue / count) : 0,
    }));
  }, [liveOrders]);

  const deliverySplit = useMemo(() => {
    let motorbike = 0;
    let van = 0;
    liveOrders.forEach((o) => {
      o.lines.forEach((line) => {
        const product = productById.get(line.productId);
        if (!product) return;
        if (deliveryMethodFor(product.dimensions) === 'van') van += line.quantity;
        else motorbike += line.quantity;
      });
    });
    const total = motorbike + van || 1;
    return [
      { name: 'Motorbike', value: motorbike, pct: Math.round((motorbike / total) * 100), color: `hsl(${ACCENTS.mint.ink})` },
      { name: 'Van', value: van, pct: Math.round((van / total) * 100), color: `hsl(${ACCENTS.coral.ink})` },
    ];
  }, [liveOrders, productById]);

  const categoryPerformance = useMemo(() => {
    const bySlug = new Map<string, { units: number; revenue: number }>();
    liveOrders.forEach((o) => {
      o.lines.forEach((line) => {
        const product = productById.get(line.productId);
        if (!product) return;
        const bucket = bySlug.get(product.categorySlug) ?? { units: 0, revenue: 0 };
        bucket.units += line.quantity;
        bucket.revenue += product.priceRwf * line.quantity;
        bySlug.set(product.categorySlug, bucket);
      });
    });
    const grandTotal = Array.from(bySlug.values()).reduce((sum, b) => sum + b.revenue, 0) || 1;
    return (categories ?? [])
      .map((c) => {
        const bucket = bySlug.get(c.slug) ?? { units: 0, revenue: 0 };
        return {
          name: c.name,
          units: bucket.units,
          revenue: bucket.revenue,
          sharePct: Math.round((bucket.revenue / grandTotal) * 100),
        };
      })
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [liveOrders, categories, productById]);

  const topProducts = useMemo(() => {
    const byProduct = new Map<string, { units: number; revenue: number }>();
    liveOrders.forEach((o) => {
      o.lines.forEach((line) => {
        const bucket = byProduct.get(line.productId) ?? { units: 0, revenue: 0 };
        const product = productById.get(line.productId);
        bucket.units += line.quantity;
        bucket.revenue += (product?.priceRwf ?? 0) * line.quantity;
        byProduct.set(line.productId, bucket);
      });
    });
    return Array.from(byProduct.entries())
      .map(([productId, bucket]) => ({
        name: productById.get(productId)?.name ?? 'Unknown product',
        units: bucket.units,
        revenue: bucket.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [liveOrders, productById]);

  const topProductCols = useMemo(
    () => [
      topProductColumns.accessor('name', { header: 'Product' }),
      topProductColumns.accessor('units', {
        header: 'Units sold',
        cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
      }),
      topProductColumns.accessor('revenue', {
        header: 'Revenue',
        cell: (info) => <span className="tabular-nums font-semibold">{rwfFull(info.getValue())}</span>,
      }),
    ],
    [],
  );

  const categoryCols = useMemo(
    () => [
      categoryColumns.accessor('name', { header: 'Category' }),
      categoryColumns.accessor('units', {
        header: 'Units sold',
        cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
      }),
      categoryColumns.accessor('revenue', {
        header: 'Revenue',
        cell: (info) => <span className="tabular-nums font-semibold">{rwfFull(info.getValue())}</span>,
      }),
      categoryColumns.accessor('sharePct', {
        header: 'Share',
        cell: (info) => <span className="tabular-nums text-ink-soft">{info.getValue()}%</span>,
      }),
    ],
    [],
  );

  const riskCols = useMemo(
    () => [
      riskColumns.accessor('name', { header: 'Product' }),
      riskColumns.accessor('stock', {
        header: 'Stock left',
        cell: (info) => <span className="tabular-nums font-semibold text-amber-600">{info.getValue()}</span>,
      }),
      riskColumns.accessor('priceRwf', {
        header: 'Unit price',
        cell: (info) => <span className="tabular-nums">{rwfFull(info.getValue())}</span>,
      }),
      riskColumns.display({
        id: 'atRisk',
        header: 'Value at risk',
        cell: (info) => (
          <span className="tabular-nums font-semibold">
            {rwfFull(info.row.original.priceRwf * info.row.original.stock)}
          </span>
        ),
      }),
    ],
    [],
  );

  const loading = ordersLoading || productsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Lifetime performance across every order placed so far — cancelled orders excluded.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Lifetime revenue" value={rwfFull(totalRevenue)} icon={TrendingUp} />
            <KpiCard label="Total orders" value={String(totalOrders)} icon={ReceiptText} />
            <KpiCard label="Overall AOV" value={rwfFull(overallAOV)} icon={ReceiptText} />
            <KpiCard
              label="Stock value at risk"
              value={rwfFull(stockValueAtRisk)}
              sub={`${atRiskProducts.length} products low`}
              icon={Boxes}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Revenue — last 30 days">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueByDay}>
                    <defs>
                      <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={`hsl(${ACCENTS.sky.surface})`} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={`hsl(${ACCENTS.sky.surface})`} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--hairline))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(var(--ink-faint))' }}
                      axisLine={{ stroke: 'hsl(var(--hairline))' }}
                      tickLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--ink-faint))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      width={40}
                    />
                    <Tooltip
                      formatter={(value) => rwfFull(Number(value))}
                      contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--hairline))', fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={`hsl(${ACCENTS.sky.ink})`}
                      strokeWidth={2}
                      fill="url(#analyticsRevenueFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Delivery method split">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deliverySplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {deliverySplit.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--hairline))', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {deliverySplit.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name === 'Motorbike' ? (
                        <Bike className="h-3 w-3" aria-hidden />
                      ) : (
                        <Truck className="h-3 w-3" aria-hidden />
                      )}
                      {entry.name}
                    </span>
                    <span className="font-semibold text-ink">
                      {entry.value} · {entry.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Average order value — by week">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={aovByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--hairline))" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: 'hsl(var(--ink-faint))' }}
                  axisLine={{ stroke: 'hsl(var(--hairline))' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--ink-faint))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  width={40}
                />
                <Tooltip
                  formatter={(value) => rwfFull(Number(value))}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--hairline))', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="aov"
                  stroke={`hsl(${ACCENTS.orchid.ink})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: `hsl(${ACCENTS.orchid.ink})` }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable columns={categoryCols} data={categoryPerformance} emptyMessage="No sales yet." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable columns={topProductCols} data={topProducts} emptyMessage="No sales yet." />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock value at risk</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={riskCols}
                data={atRiskProducts.slice(0, 10)}
                emptyMessage="Nothing is running low right now."
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
