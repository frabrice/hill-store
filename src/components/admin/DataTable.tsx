import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

/** Headless via @tanstack/react-table, styled plain — sortable columns, no
 * pagination or filtering built in, callers compose those around it. */
export function DataTable<T>({ columns, data, onRowClick, emptyMessage = 'Nothing here yet.' }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-hairline">
              {headerGroup.headers.map((header) => {
                const sortable = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink-faint',
                      sortable && 'cursor-pointer select-none hover:text-ink-soft',
                    )}
                    onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {sortable &&
                        (sortState === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden />
                        ) : sortState === 'desc' ? (
                          <ArrowDown className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-faint">
                {emptyMessage}
              </td>
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                'border-b border-hairline last:border-0',
                onRowClick && 'cursor-pointer hover:bg-surface-sunk',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle text-ink">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
