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
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import {
  pushJobListOptions,
  pushStatusOptions,
  subscriptionStatsOptions,
  pushKeys,
  type PushJobItem,
} from "@/features/notifications/queries";
import {
  useCreatePushJob,
  useRedrivePushJob,
} from "@/features/notifications/mutations";

// ── Context ──────────────────────────────────────────────────────────

type NotifDialogType = "create" | "redrive" | null;

type NotifContextValue = {
  open: NotifDialogType;
  currentRow: PushJobItem | null;
  setOpen: (value: NotifDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<PushJobItem | null>>;
};

const NotifContext = createContext<NotifContextValue | null>(null);

function NotifProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<NotifDialogType>(null);
  const [currentRow, setCurrentRow] = useState<PushJobItem | null>(null);
  return (
    <NotifContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </NotifContext.Provider>
  );
}

function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotif must be used within NotifProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đang gửi", value: "PROCESSING" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Thất bại", value: "FAILED" },
];

function statusBadgeClass(s: string): string {
  if (s === "COMPLETED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "PENDING" || s === "PROCESSING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (s === "FAILED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "PENDING") return "Chờ xử lý";
  if (s === "PROCESSING") return "Đang gửi";
  if (s === "COMPLETED") return "Hoàn thành";
  if (s === "FAILED") return "Thất bại";
  return s;
}

// ── Stats cards ───────────────────────────────────────────────────────

function StatsCards() {
  const { data: pushStatus, isLoading: statusLoading } = useQuery(pushStatusOptions());
  const { data: subStats, isLoading: subLoading } = useQuery(subscriptionStatsOptions());

  const cards = [
    { label: "Tổng jobs", value: pushStatus?.total, loading: statusLoading },
    { label: "Chờ xử lý", value: pushStatus?.pending, loading: statusLoading },
    { label: "Hoàn thành", value: pushStatus?.completed, loading: statusLoading },
    { label: "Thất bại", value: pushStatus?.failed, loading: statusLoading },
    { label: "Subscriptions hoạt động", value: subStats?.active, loading: subLoading },
    { label: "Subscriptions ngưng", value: subStats?.inactive, loading: subLoading },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            {card.loading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums">{card.value ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Create dialog ─────────────────────────────────────────────────────

function CreatePushJobDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createPushJob = useCreatePushJob();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const reset = () => { setTitle(""); setBody(""); setTargetAudience(""); };

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Tiêu đề và nội dung không được để trống.");
      return;
    }
    createPushJob.mutate(
      { title: title.trim(), body: body.trim(), targetAudience: targetAudience.trim() || undefined },
      { onSuccess: () => { reset(); onOpenChange(false); } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Tạo đợt gửi thông báo</DialogTitle>
          <DialogDescription>Gửi push notification đến thiết bị của thành viên.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thông báo mới từ PMTL..." />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Nội dung</span>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nội dung thông báo..." rows={3} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Đối tượng (tuỳ chọn)</span>
            <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="ALL, MEMBER, ADMIN..." />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createPushJob.isPending || !title.trim() || !body.trim()}>
            {createPushJob.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Row actions ───────────────────────────────────────────────────────

function NotifRowActions({ row }: { row: PushJobItem }) {
  const { setOpen, setCurrentRow } = useNotif();
  if (row.status !== "FAILED") return null;
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Gửi lại",
          onClick: () => { setCurrentRow(row); setOpen("redrive"); },
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function NotificationsTable() {
  const { data: envelope, isLoading } = useQuery(pushJobListOptions({ limit: 100 }));
  const jobs = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<PushJobItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="max-w-[240px] truncate font-medium">{row.original.title}</div>
        ),
        meta: { label: "Tiêu đề" },
        enableHiding: false,
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
        accessorKey: "sentCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đã gửi" />,
        cell: ({ row }) => (
          <div className="tabular-nums">{row.original.sentCount}</div>
        ),
        meta: { label: "Đã gửi" },
      },
      {
        accessorKey: "failedCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thất bại" />,
        cell: ({ row }) => (
          <div className={row.original.failedCount > 0 ? "font-medium text-destructive tabular-nums" : "tabular-nums text-muted-foreground"}>
            {row.original.failedCount}
          </div>
        ),
        meta: { label: "Thất bại" },
      },
      {
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tạo" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.createdBy.displayName}</div>
        ),
        meta: { label: "Người tạo" },
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
        cell: ({ row }) => <NotifRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: jobs,
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
        searchPlaceholder="Lọc theo tiêu đề..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có đợt gửi thông báo nào."
      />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function NotifDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useNotif();
  const redrivePushJob = useRedrivePushJob();

  const handleClose = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 200);
  };

  return (
    <>
      <CreatePushJobDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />
      {currentRow && (
        <WorkspaceConfirmDialog
          open={open === "redrive"}
          onOpenChange={(v) => (!v ? handleClose() : setOpen("redrive"))}
          title="Gửi lại thông báo"
          description={
            <>
              Gửi lại đợt thông báo <span className="font-semibold text-foreground">{currentRow.title}</span>?
            </>
          }
          confirmLabel="Gửi lại"
          isPending={redrivePushJob.isPending}
          onConfirm={() =>
            redrivePushJob.mutate(currentRow.publicId, { onSuccess: handleClose })
          }
        />
      )}
    </>
  );
}

// ── Primary buttons ───────────────────────────────────────────────────

function NotifPrimaryButtons() {
  const { setOpen } = useNotif();
  const qc = useQueryClient();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => {
          void qc.invalidateQueries({ queryKey: pushKeys.lists() });
          void qc.invalidateQueries({ queryKey: pushKeys.status() });
          void qc.invalidateQueries({ queryKey: pushKeys.subscriptionStats() });
        }}
      >
        <RefreshCwIcon className="size-4" />
        Làm mới
      </Button>
      <Button onClick={() => setOpen("create")}>
        <PlusIcon className="size-4" />
        Tạo đợt gửi
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function NotificationsPage() {
  return (
    <NotifProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi push jobs, subscription stats và gửi thông báo.
            </p>
          </div>
          <NotifPrimaryButtons />
        </div>

        <StatsCards />
        <NotificationsTable />
      </div>

      <NotifDialogs />
    </NotifProvider>
  );
}
