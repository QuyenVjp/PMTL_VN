import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { validationLogListOptions, type ValidationLogItem } from "./queries.js";
import { PROTOCOL_LABELS } from "./types.js";

export function AltarManagementLogsTable() {
  const { data: envelope, isLoading } = useQuery(validationLogListOptions());
  const logs = useMemo(() => envelope?.data ?? [], [envelope]);

  const logColumns: ColumnDef<ValidationLogItem>[] = useMemo(
    () => [
      { accessorKey: "user", header: "Người kiểm tra", cell: ({ row }) => row.original.user?.name ?? "—" },
      {
        accessorKey: "protocolType",
        header: "Quy trình",
        cell: ({ row }) => PROTOCOL_LABELS[row.original.protocolType],
      },
      {
        accessorKey: "passed",
        header: "Kết quả",
        cell: ({ row }) => (
          <Badge variant={row.original.passed ? "secondary" : "destructive"}>
            {row.original.passed ? "Đạt" : "Không đạt"}
          </Badge>
        ),
      },
      { accessorKey: "item", header: "Vật phẩm", cell: ({ row }) => row.original.item?.name ?? "—" },
      {
        accessorKey: "performedAt",
        header: "Ngày kiểm tra",
        cell: ({ row }) => new Date(row.original.performedAt).toLocaleDateString("vi-VN"),
      },
    ],
    []
  );

  const table = useSafeReactTable({
    data: logs,
    columns: logColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={logColumns} isLoading={isLoading} emptyMessage="Chưa có nhật ký nào." />
  );
}
