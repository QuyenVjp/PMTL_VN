import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable } from "@/components/workspace";
import { DownloadsRowActions } from "@/features/downloads/data-table-row-actions";
import { downloadListOptions, type DownloadItem } from "@/features/downloads/queries";

// ── Options ──────────────────────────────────────────────────────────

const categoryOptions = [
  { label: "Hướng dẫn", value: "GUIDE" },
  { label: "Template", value: "TEMPLATE" },
  { label: "Tham khảo", value: "REFERENCE" },
  { label: "FAQ", value: "FAQ" },
];

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã ẩn", value: "ARCHIVED" },
];

// ── Helpers ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Template",
  REFERENCE: "Tham khảo",
  FAQ: "FAQ",
};

function categoryLabel(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat;
}

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Đã ẩn";
  return s;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Table component ───────────────────────────────────────────────────

type DownloadsTableProps = {
  /** Pre-set the category column filter (used by category-scoped pages) */
  defaultCategory?: string;
};

export function DownloadsTable({ defaultCategory }: DownloadsTableProps) {
  const { data: envelope, isLoading } = useQuery(downloadListOptions({ limit: 100 }));
  const downloads = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    defaultCategory ? [{ id: "category", value: [defaultCategory] }] : [],
  );

  const columns = useMemo<ColumnDef<DownloadItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="max-w-[280px] truncate font-medium">{row.original.title}</div>
        ),
        meta: { label: "Tiêu đề" },
        enableHiding: false,
      },
      {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
        cell: ({ row }) => (
          <Badge variant="outline">{categoryLabel(row.original.category)}</Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Danh mục" },
        enableSorting: false,
      },
      {
        accessorKey: "fileType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại file" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">{row.original.fileType}</div>
        ),
        meta: { label: "Loại file" },
        enableSorting: false,
      },
      {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kích thước" />,
        cell: ({ row }) => (
          <div className="text-nowrap tabular-nums">{formatFileSize(row.original.fileSize)}</div>
        ),
        meta: { label: "Kích thước" },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "uploader",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tải" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.uploader.displayName}</div>
        ),
        meta: { label: "Người tải" },
        enableSorting: false,
      },
      {
        id: "actions",
        cell: ({ row }) => <DownloadsRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: downloads,
    columns,
    state: { sorting, rowSelection, columnVisibility, columnFilters },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc tài liệu..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "category", title: "Danh mục", options: categoryOptions },
          { columnId: "status", title: "Trạng thái", options: statusOptions },
        ]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có tài liệu nào."
      />
    </div>
  );
}
