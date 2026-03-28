/**
 * WorkspaceDataTable
 *
 * Thin rendering shell for TanStack Table instances.
 * Handles: header groups, row rendering (with selection state),
 * loading/empty fallback rows, and the pagination footer.
 *
 * Does NOT include the toolbar — feature table components own that.
 */
import { flexRender, type Table, type ColumnDef } from "@tanstack/react-table";

import { DataTablePagination } from "@/components/data-table";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WorkspaceDataTableProps<TData> = {
  table: Table<TData>;
  /** Only used for colSpan calculation in loading/empty rows */
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
};

export function WorkspaceDataTable<TData>({
  table,
  columns,
  isLoading = false,
  loadingMessage = "Đang tải dữ liệu...",
  emptyMessage = "Không có kết quả phù hợp.",
}: WorkspaceDataTableProps<TData>) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border">
        <UiTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UiTable>
      </div>

      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
