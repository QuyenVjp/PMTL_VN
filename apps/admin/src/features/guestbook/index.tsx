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
import { useNavigate } from "@tanstack/react-router";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { CheckCircleIcon, Trash2Icon, XCircleIcon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { guestbookListOptions, type GuestbookItem } from "@/features/guestbook/queries";
import {
  useDeleteGuestbook,
  useUpdateGuestbookStatus,
} from "@/features/guestbook/mutations";

// ── Context ──────────────────────────────────────────────────────────

type GuestbookDialogType = "approve" | "reject" | "delete" | null;

type GuestbookContextValue = {
  open: GuestbookDialogType;
  currentRow: GuestbookItem | null;
  setOpen: (value: GuestbookDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<GuestbookItem | null>>;
};

const GuestbookContext = createContext<GuestbookContextValue | null>(null);

function GuestbookProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<GuestbookDialogType>(null);
  const [currentRow, setCurrentRow] = useState<GuestbookItem | null>(null);
  return (
    <GuestbookContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </GuestbookContext.Provider>
  );
}

function useGuestbook() {
  const ctx = useContext(GuestbookContext);
  if (!ctx) throw new Error("useGuestbook must be used within GuestbookProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
];

function statusBadgeClass(s: string): string {
  if (s === "APPROVED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "PENDING")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "REJECTED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "PENDING") return "Chờ duyệt";
  if (s === "APPROVED") return "Đã duyệt";
  if (s === "REJECTED") return "Từ chối";
  return s;
}

// ── Row actions ───────────────────────────────────────────────────────

function GuestbookRowActions({ row }: { row: GuestbookItem }) {
  const { setOpen, setCurrentRow } = useGuestbook();
  const navigate = useNavigate();

  const open = (dialog: GuestbookDialogType) => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          onClick: () => { void navigate({ to: "/cong-dong/so-luu-niem/$publicId", params: { publicId: row.publicId } }); },
        },
        ...(row.status !== "APPROVED"
          ? [{ label: "Duyệt", icon: CheckCircleIcon, onClick: () => open("approve") }]
          : []),
        ...(row.status !== "REJECTED"
          ? [
              {
                label: "Từ chối",
                icon: XCircleIcon,
                onClick: () => open("reject"),
                variant: "destructive" as const,
                separator: row.status === "APPROVED",
              },
            ]
          : []),
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => open("delete"),
          variant: "destructive" as const,
          separator: true,
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function GuestbookTable() {
  const { data: envelope, isLoading } = useQuery(guestbookListOptions({ limit: 100 }));
  const entries = envelope?.data ?? [];
  const navigate = useNavigate();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<GuestbookItem>[]>(
    () => [
      createSelectColumn<GuestbookItem>(),
      {
        accessorKey: "content",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
        cell: ({ row }) => (
          <div className="max-w-[360px] truncate text-sm">{row.original.content}</div>
        ),
        meta: { label: "Nội dung" },
        enableHiding: false,
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
        accessorKey: "approvedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Duyệt lúc" />,
        cell: ({ row }) =>
          row.original.approvedAt ? (
            <div className="text-nowrap text-muted-foreground">
              {new Date(row.original.approvedAt).toLocaleDateString("vi-VN")}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { label: "Duyệt lúc" },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày gửi" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày gửi" },
      },
      {
        id: "actions",
        cell: ({ row }) => <GuestbookRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: entries,
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
        searchPlaceholder="Lọc theo nội dung..."
        viewButtonLabel="Xem"
        filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có lưu niệm nào."
        onRowClick={(row) => { void navigate({ to: "/cong-dong/so-luu-niem/$publicId", params: { publicId: row.publicId } }); }}
      />
      <DataTableBulkActions table={table} entityName="lưu niệm" />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function GuestbookDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useGuestbook();
  const updateStatus = useUpdateGuestbookStatus();
  const deleteGuestbookEntry = useDeleteGuestbook();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  const mutate = (status: "APPROVED" | "REJECTED") =>
    updateStatus.mutate(
      { publicId: currentRow!.publicId, status },
      { onSuccess: handleClose },
    );

  if (!currentRow) return null;

  return (
    <>
      <WorkspaceConfirmDialog
        open={open === "approve"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("approve"))}
        title="Duyệt lưu niệm"
        description="Lưu niệm sẽ hiển thị công khai trong sổ lưu niệm."
        confirmLabel="Duyệt"
        isPending={updateStatus.isPending}
        onConfirm={() => mutate("APPROVED")}
      />
      <WorkspaceConfirmDialog
        open={open === "reject"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("reject"))}
        title="Từ chối lưu niệm"
        description="Lưu niệm sẽ bị từ chối và không hiển thị công khai."
        confirmLabel="Từ chối"
        variant="destructive"
        isPending={updateStatus.isPending}
        onConfirm={() => mutate("REJECTED")}
      />
      <WorkspaceConfirmDialog
        open={open === "delete"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
        title="Xoá lưu niệm"
        description={
          <>
            Xoá lưu niệm <span className="font-semibold text-foreground">{currentRow.publicId}</span>?
            Hành động này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteGuestbookEntry.isPending}
        onConfirm={() =>
          deleteGuestbookEntry.mutate(currentRow.publicId, { onSuccess: handleClose })
        }
      />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function GuestbookPage() {
  return (
    <GuestbookProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sổ lưu niệm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kiểm duyệt và quản lý lưu niệm từ thành viên.
          </p>
        </div>

        <GuestbookTable />
      </div>

      <GuestbookDialogs />
    </GuestbookProvider>
  );
}



