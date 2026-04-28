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
import { PreviewableImage } from "@/components/media/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceConfirmDialog, WorkspaceDataTable } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { GuidesRowActions } from "@/features/guides/data-table-row-actions";
import { guideListOptions, type GuideItem } from "@/features/guides/queries";
import { usePublishGuide, useDeleteGuide } from "@/features/guides/mutations";
import { mediaListOptions } from "@/features/media/queries";
import { resolveMediaSrc } from "@/lib/media-src";
import { useNavigateTo } from "@/lib/router-utils";

// ── Options for toolbar faceted filters ─────────────────────────────

const categoryOptions = [
  { label: "Nhập môn", value: "BEGINNER" },
  { label: "Hành trì hằng ngày", value: "DAILY_PRACTICE" },
  { label: "Ngôi Nhà Nhỏ", value: "LITTLE_HOUSE" },
  { label: "Phóng sanh", value: "LIFE_RELEASE" },
  { label: "Chung", value: "GENERAL" },
];

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã ẩn", value: "ARCHIVED" },
];

// ── Label / badge helpers ────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  BEGINNER: "Nhập môn",
  DAILY_PRACTICE: "Hành trì hằng ngày",
  LITTLE_HOUSE: "Ngôi Nhà Nhỏ",
  LIFE_RELEASE: "Phóng sanh",
  GENERAL: "Chung",
};

function categoryLabel(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat;
}

function categoryBadgeClass(cat: string): string {
  if (cat === "BEGINNER")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (cat === "DAILY_PRACTICE")
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
  if (cat === "LITTLE_HOUSE")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400";
  if (cat === "LIFE_RELEASE")
    return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400";
  return "";
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

// ── Table component ──────────────────────────────────────────────────

type GuidesTableProps = {
  /** Pre-set the category column filter (used by category-scoped pages) */
  defaultCategory?: string;
  /** Base path for row detail navigation, e.g. "/noi-dung/huong-dan" */
  detailBasePath?: string;
};

export function GuidesTable({ defaultCategory, detailBasePath = "/noi-dung/huong-dan" }: GuidesTableProps) {
  const navigateTo = useNavigateTo();
  const { data: envelope, isLoading } = useQuery(guideListOptions({ limit: 100 }));
  const guides = envelope?.data ?? [];
  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100, mimeType: "image/" }));
  
  const publishGuide = usePublishGuide();
  const deleteGuide = useDeleteGuide();

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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const columns = useMemo<ColumnDef<GuideItem>[]>(
    () => [
      createSelectColumn<GuideItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 max-w-[320px]">
            <div className="size-9 shrink-0 overflow-hidden rounded border bg-muted">
              {(() => {
                const mediaUrl = row.original.coverMediaPublicId
                  ? mediaUrlByPublicId.get(row.original.coverMediaPublicId)
                  : undefined;
                const src = resolveMediaSrc(row.original.coverImageUrl ?? mediaUrl);
                return src ? (
                <PreviewableImage
                  src={src}
                  alt={row.original.title}
                  title={row.original.title}
                  className="size-full rounded-none border-0"
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
          <Badge variant="outline" className={categoryBadgeClass(row.original.category)}>
            {categoryLabel(row.original.category)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Danh mục" },
        enableSorting: false,
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
        accessorKey: "author",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tác giả" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.author.displayName}</div>
        ),
        meta: { label: "Tác giả" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tạo" },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <GuidesRowActions row={row.original} detailBasePath={detailBasePath} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [mediaUrlByPublicId, detailBasePath],
  );

  const table = useSafeReactTable({
    data: guides,
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
    const drafts = selectedRows.filter((g) => g.status === "DRAFT");
    if (!drafts.length) return;
    await Promise.all(drafts.map((g) => publishGuide.mutateAsync(g.publicId)));
    table.resetRowSelection();
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedRows.length) return;
    await Promise.all(selectedRows.map((g) => deleteGuide.mutateAsync(g.publicId)));
    table.resetRowSelection();
    setBulkDeleteOpen(false);
  };

  return (
    <>
      <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Lọc hướng dẫn..."
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
          emptyMessage="Chưa có hướng dẫn nào."
          onRowClick={(row) => {
            navigateTo(`${detailBasePath}/${row.publicId}`);
          }}
        />
        <DataTableBulkActions table={table} entityName="hướng dẫn">
          <Button
            size="sm"
            variant="outline"
            disabled={publishGuide.isPending}
            onClick={() => void handleBulkPublish()}
          >
            <CheckCircleIcon className="mr-1.5 size-3.5" />
            Xuất bản đã chọn
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={deleteGuide.isPending}
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2Icon className="mr-1.5 size-3.5" />
            Xóa đã chọn
          </Button>
        </DataTableBulkActions>
      </div>
      <WorkspaceConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Xóa hướng dẫn đã chọn?"
        description={`Xác nhận xóa ${selectedRows.length} hướng dẫn. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa đã chọn"
        cancelLabel="Hủy"
        variant="destructive"
        isPending={deleteGuide.isPending}
        onConfirm={() => void handleBulkDeleteConfirm()}
      />
    </>
  );
}
