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
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { CheckCircleIcon, Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceDataTable } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { DownloadsRowActions } from "@/features/downloads/data-table-row-actions";
import { downloadListOptions, type DownloadItem } from "@/features/downloads/queries";
import { usePublishDownload, useDeleteDownload } from "@/features/downloads/mutations";
import { mediaListOptions } from "@/features/media/queries";
import { resolveMediaSrc } from "@/lib/media-src";
import { useNavigateTo } from "@/lib/router-utils";

// ── Options ──────────────────────────────────────────────────────────

const categoryOptions = [
  { label: "Hướng dẫn", value: "GUIDE" },
  { label: "Biểu mẫu", value: "TEMPLATE" },
  { label: "Tham khảo", value: "REFERENCE" },
  { label: "Hỏi đáp", value: "FAQ" },
  { label: "Đơn từ tâm linh", value: "SPIRITUAL_APPLICATION" },
];

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã ẩn", value: "ARCHIVED" },
];

// ── Helpers ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Biểu mẫu",
  REFERENCE: "Tham khảo",
  FAQ: "Hỏi đáp",
  SPIRITUAL_APPLICATION: "Đơn từ tâm linh",
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
  /** Base path for row detail navigation, e.g. "/noi-dung/tai-lieu" */
  detailBasePath?: string;
  entityLabel?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
};

export function DownloadsTable({
  defaultCategory,
  detailBasePath = "/noi-dung/tai-lieu",
  entityLabel = "tài liệu",
  emptyMessage = "Chưa có tài liệu nào.",
  searchPlaceholder = "Lọc tài liệu...",
}: DownloadsTableProps) {
  const navigateTo = useNavigateTo();
  const { data: envelope, isLoading } = useQuery(downloadListOptions({ limit: 100 }));
  const downloads = envelope?.data ?? [];
  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100, mimeType: "image/" }));
  
  const publishDownload = usePublishDownload();
  const deleteDownload = useDeleteDownload();

  const mediaUrlByPublicId = useMemo(() => {
    const map = new Map<string, string>();
    for (const asset of mediaEnvelope?.data ?? []) {
      if (asset.publicId) map.set(asset.publicId, asset.url);
    }
    return map;
  }, [mediaEnvelope]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    defaultCategory ? [{ id: "category", value: [defaultCategory] }] : [],
  );

  const columns = useMemo<ColumnDef<DownloadItem>[]>(
    () => [
      createSelectColumn<DownloadItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 max-w-[280px]">
            <div className="size-9 shrink-0 overflow-hidden rounded border bg-muted">
              {(() => {
                const mediaUrl = row.original.thumbnailMediaPublicId
                  ? mediaUrlByPublicId.get(row.original.thumbnailMediaPublicId)
                  : undefined;
                const src = resolveMediaSrc(row.original.thumbnailUrl ?? mediaUrl);
                return src ? (
                <img
                  src={src ?? undefined}
                  alt={row.original.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
                ) : null;
              })()}
            </div>
            <div className="truncate font-medium">{row.original.title}</div>
          </div>
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
        cell: ({ row }) => (
          <DownloadsRowActions row={row.original} detailBasePath={detailBasePath} entityLabel={entityLabel} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [mediaUrlByPublicId, detailBasePath, entityLabel],
  );

  const table = useSafeReactTable({
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

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const handleBulkPublish = async () => {
    if (!selectedRows.length) return;
    const drafts = selectedRows.filter((d) => d.status === "DRAFT");
    if (!drafts.length) return;
    await Promise.all(drafts.map((d) => publishDownload.mutateAsync(d.publicId)));
    table.resetRowSelection();
  };

  const handleBulkDelete = async () => {
    if (!selectedRows.length) return;
    if (!confirm(`Xác nhận xóa ${selectedRows.length} ${entityLabel}?`)) return;
    await Promise.all(selectedRows.map((d) => deleteDownload.mutateAsync(d.publicId)));
    table.resetRowSelection();
  };

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
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
        emptyMessage={emptyMessage}
        onRowClick={(row) => {
          navigateTo(`${detailBasePath}/${row.publicId}`);
        }}
      />
      <DataTableBulkActions table={table} entityName={entityLabel}>
        <Button
          size="sm"
          variant="outline"
          disabled={publishDownload.isPending}
          onClick={() => void handleBulkPublish()}
        >
          <CheckCircleIcon className="mr-1.5 size-3.5" />
          Xuất bản đã chọn
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={deleteDownload.isPending}
          onClick={() => void handleBulkDelete()}
        >
          <Trash2Icon className="mr-1.5 size-3.5" />
          Xóa đã chọn
        </Button>
      </DataTableBulkActions>
    </div>
  );
}
