import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { PowerIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { createSelectColumn } from "@/lib/table/select-column";

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

const flagKeys = {
  all: ["admin-feature-flags"] as const,
  list: () => [...flagKeys.all, "list"] as const,
};

const statusOptions = [
  { label: "Đang bật", value: "enabled" },
  { label: "Đang tắt", value: "disabled" },
];

function flagListOptions() {
  return queryOptions({
    queryKey: flagKeys.list(),
    queryFn: () => adminClient.get<{ data: FeatureFlag[] }>("/admin/feature-flags"),
  });
}

function useToggleFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      adminClient.patch(`/admin/feature-flags/${key}`, { enabled }),
    onSuccess: (_data, { key, enabled }) => {
      toast.success(enabled ? `Đã bật cờ "${key}".` : `Đã tắt cờ "${key}".`);
      void queryClient.invalidateQueries({ queryKey: flagKeys.list() });
    },
    onError: handleApiError,
  });
}

function FeatureFlagRowActions({
  row,
  onToggle,
}: {
  row: FeatureFlag;
  onToggle: (row: FeatureFlag) => void;
}) {
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: row.enabled ? "Tắt cờ" : "Bật cờ",
          icon: PowerIcon,
          onClick: () => onToggle(row),
        },
      ]}
    />
  );
}

export function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const { data: envelope, isLoading } = useQuery(flagListOptions());
  const toggleFlag = useToggleFlag();

  const flags = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<FeatureFlag>[]>(
    () => [
      createSelectColumn<FeatureFlag>(),
      {
        accessorKey: "key",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Flag key" />,
        cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.original.key}</div>,
        meta: { label: "Flag key" },
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
        cell: ({ row }) => (
          <div className="max-w-[480px] truncate text-sm text-muted-foreground">
            {row.original.description ?? "Không có mô tả"}
          </div>
        ),
        meta: { label: "Mô tả" },
        enableSorting: false,
      },
      {
        id: "status",
        accessorFn: (row) => (row.enabled ? "enabled" : "disabled"),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge
            variant={row.original.enabled ? "secondary" : "outline"}
            className={row.original.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
          >
            {row.original.enabled ? "Đang bật" : "Đang tắt"}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {new Date(row.original.updatedAt).toLocaleString("vi-VN")}
          </div>
        ),
        meta: { label: "Cập nhật" },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <FeatureFlagRowActions row={row.original} onToggle={(flag) => toggleFlag.mutate({ key: flag.key, enabled: !flag.enabled })} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [toggleFlag],
  );

  const table = useSafeReactTable({
    data: flags,
    columns,
    state: { sorting, columnVisibility, columnFilters, rowSelection },
    getRowId: (row) => row.key,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const bulkToggle = async (enabled: boolean) => {
    if (!selectedRows.length) {
      return;
    }
    await Promise.all(
      selectedRows.map((flag) =>
        toggleFlag.mutateAsync({ key: flag.key, enabled }),
      ),
    );
    table.resetRowSelection();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Feature flags</h1>
          <p className="text-sm text-muted-foreground">
            Quản trị cờ hệ thống theo pattern DataTable để thao tác nhanh và đồng nhất.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void queryClient.invalidateQueries({ queryKey: flagKeys.list() })}
        >
          Làm mới
        </Button>
      </div>

      <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Tìm theo key hoặc mô tả..."
          searchKey="key"
          viewButtonLabel="Xem"
          filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
        />

        <WorkspaceDataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Không tìm thấy feature flag nào."
        />

        <DataTableBulkActions table={table} entityName="feature flag">
          <Button
            size="sm"
            variant="outline"
            disabled={toggleFlag.isPending}
            onClick={() => void bulkToggle(true)}
          >
            Bật đã chọn
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={toggleFlag.isPending}
            onClick={() => void bulkToggle(false)}
          >
            Tắt đã chọn
          </Button>
        </DataTableBulkActions>
      </div>
    </div>
  );
}
