import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { OrderStatusBadge } from '@/components/admin/Badge';
import { Select } from '@/components/admin/Field';
import { DataTable } from '@/components/admin/DataTable';
import { useOrders } from '@/hooks/useCatalog';
import { rwfFull } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/services/types';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const columnHelper = createColumnHelper<Order>();

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Orders() {
  const { data: orders, isLoading } = useOrders();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (status && o.status !== status) return false;
      if (search) {
        const needle = search.toLowerCase();
        if (!`${o.customerName} ${o.reference} ${o.customerPhone}`.toLowerCase().includes(needle)) {
          return false;
        }
      }
      return true;
    });
  }, [orders, search, status]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('reference', {
        header: 'Order',
        cell: (info) => <span className="font-semibold text-ink">{info.getValue()}</span>,
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: (info) => {
          const o = info.row.original;
          return (
            <div>
              <p className="font-medium text-ink">{o.customerName}</p>
              <p className="text-xs text-ink-faint">{o.customerPhone}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => <span className="text-ink-soft">{formatDateTime(info.getValue())}</span>,
      }),
      columnHelper.accessor('lines', {
        header: 'Items',
        enableSorting: false,
        cell: (info) => (
          <span className="text-ink-soft">
            {info.getValue().reduce((n, l) => n + l.quantity, 0)}
          </span>
        ),
      }),
      columnHelper.accessor('totalRwf', {
        header: 'Total',
        cell: (info) => <span className="tabular-nums font-semibold">{rwfFull(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <OrderStatusBadge status={info.getValue()} />,
      }),
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-soft">{orders?.length ?? 0} orders total</p>
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
              placeholder="Search by customer, phone or reference…"
              className="w-full rounded-lg border border-hairline bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-[hsl(var(--accent-ink))]"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[160px]">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
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
              onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
              emptyMessage="No orders match your search."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
