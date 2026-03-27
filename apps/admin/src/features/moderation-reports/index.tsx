import { useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from "@/components/data-table";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportListOptions, reportKeys } from "./queries.js";
import { useResolveReport } from "./mutations.js";
import {
  DECISION_LABELS,
  reportStatusLabel,
  reportStatusVariant,
  statusFilterOptions,
  type DecisionType,
  type ModerationReportListItem,
} from "./types.js";

export function ModerationReportsPage() {
  const { data: envelope, isLoading } = useQuery(reportListOptions({ limit: 50 }));
  const reports = envelope?.data ?? [];
  const qc = useQueryClient();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Decision dialog state
  const [decisionTarget, setDecisionTarget] = useState<ModerationReportListItem | null>(null);
  const [decision, setDecision] = useState<DecisionType>("hide");
  const [note, setNote] = useState("");
  const resolveReport = useResolveReport();

  const columns = useMemo<ColumnDef<ModerationReportListItem>[]>(
    () => [
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
        cell: ({ row }) => <div>{row.original.targetType}</div>,
        meta: { label: "Loại" },
      },
      {
        accessorKey: "reasonCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lý do" />,
        cell: ({ row }) => <div>{row.original.reasonCode}</div>,
        meta: { label: "Lý do" },
      },
      {
        id: "reporter",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người gửi" />,
        accessorFn: (row) => row.reporterSummary?.displayName ?? "—",
        cell: ({ row }) => (
          <div>{row.original.reporterSummary?.displayName ?? "—"}</div>
        ),
        meta: { label: "Người gửi" },
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
          <div className="text-nowrap">
            {new Date(row.original.createdAt).toLocaleString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tạo" },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          if (row.original.status !== "PENDING") return null;
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDecisionTarget(row.original);
                setDecision("hide");
                setNote("");
              }}
            >
              Xử lý
            </Button>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting, columnVisibility },
    getRowId: (row) => row.publicId,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleResolve = () => {
    if (!decisionTarget) return;
    resolveReport.mutate(
      { publicId: decisionTarget.publicId, decision, note: note || undefined },
      {
        onSuccess: () => setDecisionTarget(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo kiểm duyệt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bàn điều phối cho các báo cáo từ thành viên, ưu tiên theo mức độ ảnh hưởng.
          </p>
        </div>
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => void qc.invalidateQueries({ queryKey: reportKeys.lists() })}
        >
          <span>Làm mới</span>
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Lọc theo mã, loại hoặc người gửi..."
          searchKey="publicId"
          viewButtonLabel="Xem"
          filters={[
            { columnId: "status", title: "Trạng thái", options: statusFilterOptions },
          ]}
        />

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Không có báo cáo nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} className="mt-auto" />
      </div>

      {/* Decision dialog */}
      <Dialog open={!!decisionTarget} onOpenChange={(v) => !v && setDecisionTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xử lý báo cáo</DialogTitle>
            <DialogDescription>
              Chọn quyết định cho báo cáo{" "}
              <span className="font-mono font-semibold">{decisionTarget?.publicId.slice(0, 12)}</span>.
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
                  {(Object.entries(DECISION_LABELS) as [DecisionType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
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
            <Button variant="outline" onClick={() => setDecisionTarget(null)}>
              Hủy
            </Button>
            <Button onClick={handleResolve} disabled={resolveReport.isPending}>
              {resolveReport.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
