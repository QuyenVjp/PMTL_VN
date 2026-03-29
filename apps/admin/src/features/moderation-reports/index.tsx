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

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  if (row.status !== "PENDING") return null;
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xử lý",
          onClick: () => { setCurrentRow(row); setOpen("resolve"); },
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function ModerationReportsTable() {
  const { data: envelope, isLoading } = useQuery(reportListOptions({ limit: 100 }));
  const reports = envelope?.data ?? [];

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
      />
      <DataTableBulkActions table={table} entityName="báo cáo" />
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
  return (
    <ReportProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo kiểm duyệt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bàn điều phối cho các báo cáo từ thành viên, ưu tiên theo mức độ ảnh hưởng.
          </p>
        </div>

        <ModerationReportsTable />
      </div>

      <ReportDialogs />
    </ReportProvider>
  );
}



