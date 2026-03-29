import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { type AuditLogItem, auditListOptions } from "./audit-queries.js";

export function AuditLogsPage() {
  const { data: envelope, isLoading } = useQuery(auditListOptions());
  const logs = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "occurredAt", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        accessorKey: "occurredAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thời gian" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm">
            {new Date(row.original.occurredAt).toLocaleString("vi-VN")}
          </div>
        ),
        meta: { label: "Thời gian" },
      },
      {
        accessorKey: "actorId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {row.original.actorId ?? "—"}
          </div>
        ),
        meta: { label: "Actor" },
        enableSorting: false,
      },
      {
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hành động" />,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.action}
          </Badge>
        ),
        meta: { label: "Hành động" },
        enableSorting: false,
      },
      {
        accessorKey: "resourceType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {row.original.resourceType ?? "—"}
          </div>
        ),
        meta: { label: "Resource" },
        enableSorting: false,
      },
      {
        accessorKey: "resourcePublicId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đối tượng" />,
        cell: ({ row }) => (
          <div className="max-w-[180px] truncate font-mono text-xs text-muted-foreground">
            {row.original.resourcePublicId ?? "—"}
          </div>
        ),
        meta: { label: "Đối tượng" },
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: logs,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit logs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Event stream tra cứu thao tác quản trị, phục vụ đối soát hành vi và truy nguyên thay đổi.
        </p>
      </div>

      <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Tìm theo actor, resource hoặc đối tượng..."
          viewButtonLabel="Xem"
        />

        <WorkspaceDataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có audit log nào."
        />
      </div>
    </div>
  );
}


