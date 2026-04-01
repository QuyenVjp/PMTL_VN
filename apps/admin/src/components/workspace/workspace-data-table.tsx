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
  /**
   * When provided, the whole row becomes clickable (Strapi v5 style).
   * Cells with id "select" or "actions" call stopPropagation internally
   * so checkbox/action clicks don't trigger navigation.
   */
  onRowClick?: (row: TData) => void;
};

export function WorkspaceDataTable<TData>({
  table,
  columns,
  isLoading = false,
  loadingMessage = "Đang tải dữ liệu...",
  emptyMessage = "Không có kết quả phù hợp.",
  onRowClick,
}: WorkspaceDataTableProps<TData>) {
  const clickable = Boolean(onRowClick);

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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={clickable ? () => onRowClick!(row.original) : undefined}
                  className={clickable ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      // Stop propagation for select/actions columns so
                      // checkbox and ⋮ clicks don't trigger row navigation
                      onClick={
                        clickable && (cell.column.id === "select" || cell.column.id === "actions")
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
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
