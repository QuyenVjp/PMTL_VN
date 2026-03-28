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
import { useQuery } from "@tanstack/react-query";
import { EyeOffIcon, ForwardIcon, MinusCircleIcon } from "lucide-react";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import {
  moderationCommentListOptions,
  type ModerationCommentItem,
} from "@/features/moderation-comments/queries";
import {
  useDecideCommentReport,
  type CommentDecision,
} from "@/features/moderation-comments/mutations";

// ── Context ──────────────────────────────────────────────────────────

type CommentDialogType = "hide" | "ignore" | "escalate" | null;

type CommentContextValue = {
  open: CommentDialogType;
  currentRow: ModerationCommentItem | null;
  setOpen: (value: CommentDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<ModerationCommentItem | null>>;
};

const CommentContext = createContext<CommentContextValue | null>(null);

function CommentProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CommentDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ModerationCommentItem | null>(null);
  return (
    <CommentContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </CommentContext.Provider>
  );
}

function useComment() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error("useComment must be used within CommentProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đã ẩn", value: "RESOLVED_HIDE" },
  { label: "Bỏ qua", value: "RESOLVED_IGNORE" },
  { label: "Leo thang", value: "RESOLVED_ESCALATE" },
];

const targetTypeOptions = [
  { label: "Bình luận", value: "COMMENT" },
  { label: "Bài viết", value: "POST" },
  { label: "Lưu niệm", value: "GUESTBOOK" },
];

function statusLabel(s: string): string {
  if (s === "PENDING") return "Chờ xử lý";
  if (s === "RESOLVED_HIDE") return "Đã ẩn";
  if (s === "RESOLVED_IGNORE") return "Bỏ qua";
  if (s === "RESOLVED_ESCALATE") return "Leo thang";
  return s;
}

function statusBadgeClass(s: string): string {
  if (s === "PENDING")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "RESOLVED_HIDE")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  if (s === "RESOLVED_IGNORE")
    return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
  if (s === "RESOLVED_ESCALATE")
    return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400";
  return "";
}

function targetTypeLabel(t: string): string {
  if (t === "COMMENT") return "Bình luận";
  if (t === "POST") return "Bài viết";
  if (t === "GUESTBOOK") return "Lưu niệm";
  return t;
}

// ── Row actions ───────────────────────────────────────────────────────

function CommentRowActions({ row }: { row: ModerationCommentItem }) {
  const { setOpen, setCurrentRow } = useComment();
  if (row.status !== "PENDING") return null;

  const open = (dialog: "hide" | "ignore" | "escalate") => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        { label: "Ẩn nội dung", icon: EyeOffIcon, onClick: () => open("hide") },
        { label: "Bỏ qua", icon: MinusCircleIcon, onClick: () => open("ignore") },
        {
          label: "Leo thang",
          icon: ForwardIcon,
          onClick: () => open("escalate"),
          variant: "destructive",
          separator: true,
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function ModerationCommentsTable() {
  const { data: envelope, isLoading } = useQuery(
    moderationCommentListOptions({ limit: 100 }),
  );
  const reports = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<ModerationCommentItem>[]>(
    () => [
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
        cell: ({ row }) => (
          <div className="max-w-[280px] truncate font-medium">
            {row.original.description ?? row.original.reasonCode}
          </div>
        ),
        meta: { label: "Nội dung" },
        enableHiding: false,
      },
      {
        accessorKey: "targetType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <Badge variant="secondary">{targetTypeLabel(row.original.targetType)}</Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Loại" },
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
        id: "reporter",
        accessorFn: (row) => row.reporterSummary?.displayName ?? "—",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người báo cáo" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.reporterSummary?.displayName ?? "—"}</div>
        ),
        meta: { label: "Người báo cáo" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày báo cáo" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày báo cáo" },
      },
      {
        id: "actions",
        cell: ({ row }) => <CommentRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: reports,
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
        searchKey="description"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "status", title: "Trạng thái", options: statusOptions },
          { columnId: "targetType", title: "Loại", options: targetTypeOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có báo cáo bình luận nào."
      />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

const decisionMeta: Record<
  "hide" | "ignore" | "escalate",
  { title: string; description: (name: string) => React.ReactNode; confirmLabel: string; variant?: "destructive" }
> = {
  hide: {
    title: "Ẩn nội dung",
    description: (name) => (
      <>Ẩn báo cáo <span className="font-semibold text-foreground">{name}</span>? Nội dung sẽ không hiển thị với thành viên.</>
    ),
    confirmLabel: "Ẩn",
    variant: "destructive",
  },
  ignore: {
    title: "Bỏ qua báo cáo",
    description: (name) => (
      <>Bỏ qua báo cáo <span className="font-semibold text-foreground">{name}</span>? Nội dung sẽ được giữ nguyên.</>
    ),
    confirmLabel: "Bỏ qua",
  },
  escalate: {
    title: "Leo thang xử lý",
    description: (name) => (
      <>Leo thang báo cáo <span className="font-semibold text-foreground">{name}</span> lên cấp cao hơn?</>
    ),
    confirmLabel: "Leo thang",
    variant: "destructive",
  },
};

function CommentDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useComment();
  const decideReport = useDecideCommentReport();

  const handleClose = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 200);
  };

  if (!currentRow || !open) return null;

  const meta = decisionMeta[open];
  const displayName = currentRow.description ?? currentRow.reasonCode;

  return (
    <WorkspaceConfirmDialog
      open={true}
      onOpenChange={(v) => (!v ? handleClose() : undefined)}
      title={meta.title}
      description={meta.description(displayName)}
      confirmLabel={meta.confirmLabel}
      variant={meta.variant}
      isPending={decideReport.isPending}
      onConfirm={() =>
        decideReport.mutate(
          { publicId: currentRow.publicId, decision: open as CommentDecision },
          { onSuccess: handleClose },
        )
      }
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function ModerationCommentsPage() {
  return (
    <CommentProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bình luận kiểm duyệt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Xem xét và xử lý các báo cáo vi phạm liên quan đến bình luận.
          </p>
        </div>

        <ModerationCommentsTable />
      </div>

      <CommentDialogs />
    </CommentProvider>
  );
}
