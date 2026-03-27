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
import { RefreshCwIcon, Trash2Icon } from "lucide-react";

import { DataTableColumnHeader, DataTablePagination, DataTableToolbar, DataTableBulkActions } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessionListOptions, sessionAdminKeys } from "./queries.js";
import { useRevokeSession, useRevokeBulk } from "./mutations.js";
import {
  sessionStatusLabel,
  sessionStatusVariant,
  type AdminSessionListItem,
} from "./types.js";

const statusFilterOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Đã thu hồi", value: "revoked" },
  { label: "Hết hạn", value: "expired" },
];

export function SessionsPage() {
  const { data: envelope, isLoading } = useQuery(sessionListOptions({ limit: 100 }));
  const sessions = envelope?.data ?? [];
  const qc = useQueryClient();
  const revokeSession = useRevokeSession();
  const revokeBulk = useRevokeBulk();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<AdminSessionListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
        cell: ({ row }) => <div className="text-nowrap">{row.original.ipAddress ?? "—"}</div>,
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
          <div className="text-nowrap">
            {new Date(row.original.createdAt).toLocaleString("vi-VN")}
          </div>
        ),
        meta: { label: "Tạo lúc" },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          if (row.original.status !== "active") return null;
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => revokeSession.mutate({ sessionId: row.original.sessionId })}
              disabled={revokeSession.isPending}
            >
              Thu hồi
            </Button>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [revokeSession],
  );

  const table = useReactTable({
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phiên đăng nhập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi session đang mở, thiết bị và thu hồi khi cần.
          </p>
        </div>
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => void qc.invalidateQueries({ queryKey: sessionAdminKeys.lists() })}
        >
          <span>Làm mới</span>
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Không có phiên nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} className="mt-auto" />
        <DataTableBulkActions table={table} entityName="phiên">
          <Button
            size="icon"
            variant="destructive"
            title="Thu hồi phiên đã chọn"
            onClick={() => revokeBulk.mutate({ sessionIds: selectedIds })}
            disabled={revokeBulk.isPending}
            className="rounded-xl"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </DataTableBulkActions>
      </div>
    </div>
  );
}
