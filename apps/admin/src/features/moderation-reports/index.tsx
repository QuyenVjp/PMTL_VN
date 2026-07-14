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
import { KanbanIcon, ListIcon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { reportListOptions } from "@/features/moderation-reports/queries";
import { useResolveReport } from "@/features/moderation-reports/mutations";
import {
  DECISION_LABELS,
  reportStatusLabel,
  reportStatusVariant,
  statusFilterOptions,
  type DecisionType,
  type ModerationReportListItem,
} from "@/features/moderation-reports/types";

// ── Context ──────────────────────────────────────────────────────────

type ReportDialogType = "resolve" | null;

type ReportContextValue = {
  open: ReportDialogType;
  currentRow: ModerationReportListItem | null;
  setOpen: (value: ReportDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<ModerationReportListItem | null>>;
};

const ReportContext = createContext<ReportContextValue | null>(null);

function ReportProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<ReportDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ModerationReportListItem | null>(null);
  return (
    <ReportContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </ReportContext.Provider>
  );
}

function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within ReportProvider");
  return ctx;
}

// ── Row actions ───────────────────────────────────────────────────────

function ReportRowActions({ row }: { row: ModerationReportListItem }) {
  const { setOpen, setCurrentRow } = useReport();
  const navigate = useNavigate();
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem",
          onClick: () => { void navigate({ to: "/kiem-duyet/bao-cao/$publicId", params: { publicId: row.publicId } }); },
        },
        ...(row.status === "PENDING"
          ? [{ label: "Xử lý", onClick: () => { setCurrentRow(row); setOpen("resolve"); } }]
          : []),
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function ModerationReportsTable() {
  const { data: envelope, isLoading } = useQuery(reportListOptions({ limit: 100 }));
  const reports = envelope?.items ?? [];
  const navigate = useNavigate();

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<ModerationReportListItem>[]>(
    () => [
      createSelectColumn<ModerationReportListItem>(),
      {
        accessorKey: "publicId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã" />,
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.original.publicId.slice(0, 12)}</div>
        ),
        meta: { label: "Mã" },
        enableHiding: false,
      },
      {
        accessorKey: "targetType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại mục tiêu" />,
        cell: ({ row }) => <div className="text-nowrap">{row.original.targetType}</div>,
        meta: { label: "Loại" },
        enableSorting: false,
      },
      {
        accessorKey: "reasonCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lý do" />,
        cell: ({ row }) => <div>{row.original.reasonCode}</div>,
        meta: { label: "Lý do" },
        enableSorting: false,
      },
      {
        id: "reporter",
        accessorFn: (row) => row.reporterSummary?.displayName ?? "—",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người gửi" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.reporterSummary?.displayName ?? "—"}</div>
        ),
        meta: { label: "Người gửi" },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant={reportStatusVariant(row.original.status)}>
            {reportStatusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
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
        cell: ({ row }) => <ReportRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
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
        searchPlaceholder="Lọc theo mã, loại hoặc người gửi..."
        searchKey="publicId"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "status", title: "Trạng thái", options: statusFilterOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Không có báo cáo nào."
        onRowClick={(row) => { void navigate({ to: "/kiem-duyet/bao-cao/$publicId", params: { publicId: row.publicId } }); }}
      />
      <DataTableBulkActions table={table} entityName="báo cáo" />
    </div>
  );
}

// ── Kanban view ───────────────────────────────────────────────────────

const KANBAN_COLUMNS: { key: ModerationReportListItem["status"]; label: string; headerCls: string; dotCls: string }[] = [
  {
    key: "PENDING",
    label: "Chờ xử lý",
    headerCls: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    dotCls: "bg-amber-400",
  },
  {
    key: "RESOLVED_HIDE",
    label: "Đã ẩn",
    headerCls: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    dotCls: "bg-emerald-400",
  },
  {
    key: "RESOLVED_IGNORE",
    label: "Bỏ qua",
    headerCls: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
    dotCls: "bg-slate-400",
  },
  {
    key: "RESOLVED_ESCALATE",
    label: "Leo thang",
    headerCls: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    dotCls: "bg-red-400",
  },
];

const TARGET_TYPE_LABELS: Record<string, string> = {
  POST: "Bài viết",
  COMMENT: "Bình luận",
  USER: "Thành viên",
  COMMUNITY_POST: "Bài cộng đồng",
};

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  HATE_SPEECH: "Ngôn từ thù ghét",
  MISINFORMATION: "Thông tin sai",
  INAPPROPRIATE: "Không phù hợp",
  COPYRIGHT: "Vi phạm bản quyền",
  OTHER: "Lý do khác",
};

function KanbanReportCard({ report }: { report: ModerationReportListItem }) {
  const { setOpen, setCurrentRow } = useReport();
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
          {TARGET_TYPE_LABELS[report.targetType] ?? report.targetType}
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
          #{report.publicId.slice(0, 8)}
        </span>
      </div>

      <p className="text-xs font-medium leading-snug text-foreground">
        {REASON_LABELS[report.reasonCode] ?? report.reasonCode}
      </p>

      {report.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {report.description}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
        <span>{report.reporterSummary?.displayName ?? "Ẩn danh"}</span>
        <span>
          {new Date(report.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
      </div>

      <div className="flex gap-1.5 pt-0.5">
        <Button
          size="sm"
          variant="outline"
          className="h-6 flex-1 text-[10px] px-2"
          onClick={() =>
            void navigate({
              to: "/kiem-duyet/bao-cao/$publicId",
              params: { publicId: report.publicId },
            })
          }
        >
          Xem
        </Button>
        {report.status === "PENDING" && (
          <Button
            size="sm"
            className="h-6 flex-1 text-[10px] px-2"
            onClick={() => {
              setCurrentRow(report);
              setOpen("resolve");
            }}
          >
            Xử lý
          </Button>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ reports }: { reports: ModerationReportListItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((col) => {
        const colReports = reports.filter((r) => r.status === col.key);
        return (
          <div key={col.key} className="flex min-w-[220px] flex-col rounded-lg border">
            {/* Column header */}
            <div className={cn("flex items-center justify-between rounded-t-lg border-b px-3 py-2.5", col.headerCls)}>
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full shrink-0", col.dotCls)} />
                <span className="text-xs font-semibold">{col.label}</span>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                {colReports.length}
              </Badge>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 p-2 min-h-[200px]">
              {colReports.length === 0 ? (
                <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
                  Không có báo cáo
                </div>
              ) : (
                colReports.map((r) => <KanbanReportCard key={r.publicId} report={r} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Resolve dialog ────────────────────────────────────────────────────

function ResolveReportDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: ModerationReportListItem;
}) {
  const [decision, setDecision] = useState<DecisionType>("hide");
  const [note, setNote] = useState("");
  const resolveReport = useResolveReport();

  const handleResolve = () => {
    resolveReport.mutate(
      { publicId: currentRow.publicId, decision, note: note || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Xử lý báo cáo</DialogTitle>
          <DialogDescription>
            Chọn quyết định cho báo cáo{" "}
            <span className="font-mono font-semibold">{currentRow.publicId.slice(0, 12)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Quyết định</span>
            <Select value={decision} onValueChange={(v) => setDecision(v as DecisionType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DECISION_LABELS) as [DecisionType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Ghi chú (tuỳ chọn)</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do xử lý..."
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleResolve} disabled={resolveReport.isPending}>
            {resolveReport.isPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function ReportDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useReport();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      {currentRow && (
        <ResolveReportDialog
          open={open === "resolve"}
          onOpenChange={(v) => (!v ? handleClose() : setOpen("resolve"))}
          currentRow={currentRow}
        />
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function ModerationReportsPage() {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const { data: envelope, isLoading } = useQuery(reportListOptions({ limit: 100 }));
  const allReports = envelope?.items ?? [];

  const pendingCount = allReports.filter((r) => r.status === "PENDING").length;

  return (
    <ReportProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Báo cáo kiểm duyệt</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bàn điều phối cho các báo cáo từ thành viên, ưu tiên theo mức độ ảnh hưởng.
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {pendingCount} chờ xử lý
                </span>
              )}
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setView("kanban")}
            >
              <KanbanIcon className="size-3.5" />
              Kanban
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setView("table")}
            >
              <ListIcon className="size-3.5" />
              Bảng
            </Button>
          </div>
        </div>

        {view === "kanban" ? (
          isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, columnIndex) => (
                <div key={columnIndex} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-32" />
                    {Array.from({ length: 3 }).map((__, itemIndex) => (
                      <Skeleton key={itemIndex} className="h-20 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard reports={allReports} />
          )
        ) : (
          <ModerationReportsTable />
        )}
      </div>

      <ReportDialogs />
    </ReportProvider>
  );
}

