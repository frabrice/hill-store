import { useMemo, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bike,
  Boxes,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { ORDER_STATUS_LABEL } from '@/components/admin/Badge';
import { useCategories, useOrders, useProducts } from '@/hooks/useCatalog';
import { ACCENTS } from '@/lib/theme';
import { rwfFull } from '@/lib/format';
import { deliveryMethodFor } from '@/lib/delivery';
import type { OrderStatus, Product } from '@/lib/services/types';

const LOW_STOCK_THRESHOLD = 8;

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  paid: `hsl(${ACCENTS.sky.surface})`,
  processing: `hsl(${ACCENTS.indigo.surface})`,
  shipped: '#94a3b8',
  delivered: `hsl(${ACCENTS.mint.ink})`,
  cancelled: '#ef4444',
};

function startOfWeek(iso: string): string {
  const date = new Date(iso);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function weekLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
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

export function Overview() {
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const { data: productsData, isLoading: productsLoading } = useProducts({});
  const { data: categories } = useCategories();

  const orders = ordersData ?? [];
  const products = productsData?.items ?? [];

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const now = new Date();
  const thisMonthOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = new Date(o.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          o.status !== 'cancelled'
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders],
  );

  const revenueThisMonth = thisMonthOrders.reduce((sum, o) => sum + o.totalRwf, 0);
  const avgOrderValue = thisMonthOrders.length
    ? Math.round(revenueThisMonth / thisMonthOrders.length)
    : 0;

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD,
  ).length;

  const deliverySplit = useMemo(() => {
    let motorbike = 0;
    let van = 0;
    thisMonthOrders.forEach((o) => {
      o.lines.forEach((line) => {
        const product = productById.get(line.productId);
        if (!product) return;
        if (deliveryMethodFor(product.dimensions) === 'van') van += line.quantity;
        else motorbike += line.quantity;
      });
    });
    const total = motorbike + van || 1;
    return { motorbike, van, motorbikePct: Math.round((motorbike / total) * 100) };
  }, [thisMonthOrders, productById]);

  const revenueOverTime = useMemo(() => {
    const buckets = new Map<string, number>();
    [...orders]
      .filter((o) => o.status !== 'cancelled')
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .forEach((o) => {
        const key = startOfWeek(o.createdAt);
        buckets.set(key, (buckets.get(key) ?? 0) + o.totalRwf);
      });
    return Array.from(buckets.entries()).map(([week, revenue]) => ({
      week: weekLabel(week),
      revenue,
    }));
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<OrderStatus, number>();
    orders.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, count]) => ({
      status,
      count,
      label: ORDER_STATUS_LABEL[status],
      color: STATUS_COLOR[status],
    }));
  }, [orders]);

  const categoryBreakdown = useMemo(() => {
    const revenueBySlug = new Map<string, number>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        o.lines.forEach((line) => {
          const product = productById.get(line.productId);
          if (!product) return;
          revenueBySlug.set(
            product.categorySlug,
            (revenueBySlug.get(product.categorySlug) ?? 0) + product.priceRwf * line.quantity,
          );
        });
      });
    return (categories ?? [])
      .map((c) => ({
        name: c.name,
        revenue: revenueBySlug.get(c.slug) ?? 0,
        color: `hsl(${ACCENTS[c.colorKey].surface})`,
      }))
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, categories, productById]);

  const loading = ordersLoading || productsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A snapshot of the shop — orders, stock and where revenue is coming from.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard
              label="Revenue this month"
              value={rwfFull(revenueThisMonth)}
              sub={`${thisMonthOrders.length} orders`}
              icon={TrendingUp}
            />
            <KpiCard
              label="Orders this month"
              value={String(thisMonthOrders.length)}
              icon={ShoppingBag}
            />
            <KpiCard
              label="Avg. order value"
              value={rwfFull(avgOrderValue)}
              icon={ReceiptText}
            />
            <KpiCard
              label="Low stock"
              value={String(lowStockCount)}
              sub={`≤ ${LOW_STOCK_THRESHOLD} units left`}
              icon={Boxes}
            />
            <KpiCard
              label="Motorbike vs van"
              value={`${deliverySplit.motorbikePct}%`}
              sub={
                <span className="inline-flex items-center gap-1">
                  <Bike className="h-3 w-3" aria-hidden /> motorbike ·{' '}
                  <Truck className="h-3 w-3" aria-hidden /> van
                </span>
              }
              icon={Bike}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Revenue over time">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueOverTime}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={`hsl(${ACCENTS.mint.surface})`} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={`hsl(${ACCENTS.mint.surface})`} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
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
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid hsl(var(--hairline))',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={`hsl(${ACCENTS.mint.ink})`}
                      strokeWidth={2}
                      fill="url(#revenueFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Orders by status">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid hsl(var(--hairline))',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {statusBreakdown.map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.label} · {entry.count}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Revenue by category">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--hairline))" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'hsl(var(--ink-faint))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(var(--ink))' }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  formatter={(value) => rwfFull(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--hairline))',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}
