import { useMemo, useState } from "react";
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
import { Trash2Icon } from "lucide-react";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { pushJobListOptions, type PushJobItem } from "./queries.js";
import { useNotif } from "./notifications-provider.js";

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

const audienceOptions = [
  { label: "Tất cả thành viên", value: "all_members" },
  { label: "Chỉ quản trị viên", value: "admin_only" },
  { label: "Điều phối viên và biên tập", value: "operators" },
  { label: "Người đang bật nhắc nhở niệm kinh", value: "chanting_reminder_subscribers" },
];

function audienceLabel(value: string | null): string {
  return audienceOptions.find((option) => option.value === value)?.label ?? "Tất cả thành viên";
}

function NotifRowActions({ row }: { row: PushJobItem }) {
  const { setOpen, setCurrentRow } = useNotif();
  const actions = [];
  if (row.status === "FAILED") {
    actions.push({
      label: "Gửi lại",
      onClick: () => {
        setCurrentRow(row);
        setOpen("redrive");
      },
    });
  }

  actions.push({
    label: "Xoá",
    icon: Trash2Icon,
    variant: "destructive" as const,
    separator: true,
    onClick: () => {
      setCurrentRow(row);
      setOpen("delete");
    },
  });

  return (
    <WorkspaceRowActions actions={actions} />
  );
}

export function NotificationsTable() {
  const { data: envelope, isLoading } = useQuery(pushJobListOptions({ limit: 100 }));
  const jobs = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<PushJobItem>[]>(
    () => [
      createSelectColumn<PushJobItem>(),
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
        accessorKey: "targetAudience",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đối tượng" />,
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{audienceLabel(row.original.targetAudience)}</div>
        ),
        meta: { label: "Đối tượng" },
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

  const table = useSafeReactTable({
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
      <DataTableBulkActions table={table} entityName="job thông báo" />
    </div>
  );
}
