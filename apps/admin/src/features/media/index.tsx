import React, { createContext, useContext, useMemo, useState } from "react";
import {
  type ColumnDef,
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
import { Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useDeleteMediaAsset } from "@/features/media/mutations";

// ── Context ──────────────────────────────────────────────────────────

type MediaDialogType = "delete" | null;

type MediaContextValue = {
  open: MediaDialogType;
  currentRow: MediaAssetListItem | null;
  setOpen: (value: MediaDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<MediaAssetListItem | null>>;
};

const MediaContext = createContext<MediaContextValue | null>(null);

function MediaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<MediaDialogType>(null);
  const [currentRow, setCurrentRow] = useState<MediaAssetListItem | null>(null);

  return (
    <MediaContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </MediaContext.Provider>
  );
}

function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error("useMedia must be used within MediaProvider");
  return context;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Sẵn sàng", value: "READY" },
  { label: "Đang tải", value: "UPLOADING" },
  { label: "Mồ côi", value: "ORPHANED" },
  { label: "Đã xoá", value: "DELETED" },
];

function statusBadgeClass(s: string): string {
  if (s === "READY")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "UPLOADING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (s === "ORPHANED")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "READY") return "Sẵn sàng";
  if (s === "UPLOADING") return "Đang tải";
  if (s === "ORPHANED") return "Mồ côi";
  if (s === "DELETED") return "Đã xoá";
  return s;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Row actions ───────────────────────────────────────────────────────

function MediaRowActions({ row }: { row: MediaAssetListItem }) {
  const { setOpen, setCurrentRow } = useMedia();

  if (row.status === "DELETED") return null;

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => {
            setCurrentRow(row);
            setOpen("delete");
          },
          variant: "destructive",
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function MediaAssetsTable() {
  const { data: envelope, isLoading } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<MediaAssetListItem>[]>(
    () => [
      createSelectColumn<MediaAssetListItem>(),
      {
        accessorKey: "filename",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên file" />,
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate font-medium">{row.original.filename}</div>
        ),
        meta: { label: "Tên file" },
        enableHiding: false,
      },
      {
        accessorKey: "mimeType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">{row.original.mimeType}</div>
        ),
        meta: { label: "Loại" },
        enableSorting: false,
      },
      {
        accessorKey: "size",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kích thước" />,
        cell: ({ row }) => (
          <div className="text-nowrap tabular-nums">{formatFileSize(row.original.size)}</div>
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
        accessorKey: "uploaderName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tải" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.uploaderName}</div>
        ),
        meta: { label: "Người tải" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tải" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tải" },
      },
      {
        id: "actions",
        cell: ({ row }) => <MediaRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: assets,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
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
        searchPlaceholder="Lọc theo tên file..."
        searchKey="filename"
        viewButtonLabel="Xem"
        filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có media asset nào."
      />
      <DataTableBulkActions table={table} entityName="media asset" />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function MediaDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMedia();
  const deleteAsset = useDeleteMediaAsset();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  if (!currentRow) return null;

  return (
    <WorkspaceConfirmDialog
      open={open === "delete"}
      onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
      title="Xoá media asset"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{currentRow.filename}</span>? Thao
          tác này không thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={deleteAsset.isPending}
      onConfirm={() =>
        deleteAsset.mutate(currentRow.publicId, { onSuccess: handleClose })
      }
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function MediaAssetsPage() {
  return (
    <MediaProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Assets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi asset upload, owner và tình trạng xử lý media.
          </p>
        </div>

        <MediaAssetsTable />
      </div>

      <MediaDialogs />
    </MediaProvider>
  );
}



