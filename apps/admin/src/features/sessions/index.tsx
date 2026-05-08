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
import { Trash2Icon } from "lucide-react";

import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableToolbar,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSelectColumn } from "@/lib/table/select-column";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { sessionListOptions } from "@/features/sessions/queries";
import { useRevokeSession, useRevokeBulk } from "@/features/sessions/mutations";
import {
  sessionStatusLabel,
  sessionStatusVariant,
  type AdminSessionListItem,
} from "@/features/sessions/types";

// ── Context ──────────────────────────────────────────────────────────

type SessionDialogType = "revoke" | null;

type SessionContextValue = {
  open: SessionDialogType;
  currentRow: AdminSessionListItem | null;
  setOpen: (value: SessionDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminSessionListItem | null>>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<SessionDialogType>(null);
  const [currentRow, setCurrentRow] = useState<AdminSessionListItem | null>(null);
  return (
    <SessionContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </SessionContext.Provider>
  );
}

function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusFilterOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Đã thu hồi", value: "revoked" },
  { label: "Hết hạn", value: "expired" },
];

// ── Row actions ───────────────────────────────────────────────────────

function SessionRowActions({ row }: { row: AdminSessionListItem }) {
  const { setOpen, setCurrentRow } = useSession();
  if (row.status !== "active") return null;
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Thu hồi",
          icon: Trash2Icon,
          onClick: () => { setCurrentRow(row); setOpen("revoke"); },
          variant: "destructive",
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function SessionsTable() {
  const navigate = useNavigate();
  const { data: envelope, isLoading } = useQuery(sessionListOptions({ limit: 100 }));
  const sessions = envelope?.data ?? [];
  const revokeBulk = useRevokeBulk();

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [confirmBulkRevoke, setConfirmBulkRevoke] = useState(false);

  const columns = useMemo<ColumnDef<AdminSessionListItem>[]>(
    () => [
      createSelectColumn<AdminSessionListItem>(),
      {
        accessorKey: "userDisplayName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người dùng" />,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.userDisplayName}</div>
            <div className="truncate text-sm text-muted-foreground">{row.original.userEmail}</div>
          </div>
        ),
        meta: { label: "Người dùng" },
        enableHiding: false,
      },
      {
        accessorKey: "userAgent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thiết bị" />,
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate text-sm">{row.original.userAgent ?? "—"}</div>
        ),
        meta: { label: "Thiết bị" },
      },
      {
        accessorKey: "ipAddress",
        header: ({ column }) => <DataTableColumnHeader column={column} title="IP" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.ipAddress ?? "—"}</div>
        ),
        meta: { label: "IP" },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant={sessionStatusVariant(row.original.status)}>
            {sessionStatusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tạo lúc" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleString("vi-VN")}
          </div>
        ),
        meta: { label: "Tạo lúc" },
      },
      {
        id: "actions",
        cell: ({ row }) => <SessionRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: sessions,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.sessionId,
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

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.sessionId);

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Tìm session theo email, IP hoặc thiết bị..."
        searchKey="userDisplayName"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "status", title: "Trạng thái", options: statusFilterOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Không có phiên nào."
        onRowClick={(row) => { void navigate({ to: "/nguoi-dung/phien/$sessionId", params: { sessionId: row.sessionId } }); }}
      />
      <DataTableBulkActions table={table} entityName="phiên">
        <Button
          size="icon"
          variant="destructive"
          title="Thu hồi phiên đã chọn"
          onClick={() => setConfirmBulkRevoke(true)}
          disabled={revokeBulk.isPending}
          className="rounded-xl"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </DataTableBulkActions>
      <WorkspaceConfirmDialog
        open={confirmBulkRevoke}
        onOpenChange={setConfirmBulkRevoke}
        title="Thu hồi phiên đã chọn?"
        description={`Thu hồi ${selectedIds.length} phiên đăng nhập đã chọn. Người dùng sẽ bị đăng xuất khỏi các phiên này ngay lập tức.`}
        confirmLabel="Thu hồi"
        variant="destructive"
        isPending={revokeBulk.isPending}
        onConfirm={() =>
          revokeBulk.mutate(
            { sessionIds: selectedIds },
            { onSuccess: () => setConfirmBulkRevoke(false) },
          )
        }
      />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function SessionDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSession();
  const revokeSession = useRevokeSession();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      {currentRow && (
        <WorkspaceConfirmDialog
          open={open === "revoke"}
          onOpenChange={(v) => (!v ? handleClose() : setOpen("revoke"))}
          title="Thu hồi phiên"
          description={
            <>
              Thu hồi phiên của{" "}
              <span className="font-semibold text-foreground">{currentRow.userDisplayName}</span>?
              Người dùng sẽ bị đăng xuất ngay lập tức.
            </>
          }
          confirmLabel="Thu hồi"
          variant="destructive"
          isPending={revokeSession.isPending}
          onConfirm={() =>
            revokeSession.mutate(
              { sessionId: currentRow.sessionId },
              { onSuccess: handleClose },
            )
          }
        />
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function SessionsPage() {
  return (
    <SessionProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phiên đăng nhập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi session đang mở, thiết bị và thu hồi khi cần.
          </p>
        </div>

        <SessionsTable />
      </div>

      <SessionDialogs />
    </SessionProvider>
  );
}


