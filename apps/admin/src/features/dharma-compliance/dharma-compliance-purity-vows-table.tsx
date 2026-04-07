import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable } from "@/components/workspace";
import { vowListOptions } from "./queries.js";
import { VOW_STATUS_LABELS, type VowListItem } from "./types.js";

export function DharmaCompliancePurityVowsTable() {
  const { data: envelope, isLoading } = useQuery(vowListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const vowColumns: ColumnDef<VowListItem>[] = useMemo(
    () => [
      {
        accessorKey: "practitioner",
        header: "Người nguyện",
        cell: ({ row }) => row.original.practitioner?.name ?? "—",
      },
      { accessorKey: "purityLevel", header: "Mức độ" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant="outline">
            {VOW_STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "vowDate",
        header: "Ngày nguyện",
        cell: ({ row }) => new Date(row.original.vowDate).toLocaleDateString("vi-VN"),
      },
      {
        accessorKey: "sleepArrangement",
        header: "Quy tắc ngủ",
        cell: ({ row }) => row.original.sleepArrangement ?? "—",
      },
    ],
    [],
  );

  const table = useSafeReactTable({ data: items, columns: vowColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <WorkspaceDataTable table={table} columns={vowColumns} isLoading={isLoading} emptyMessage="Chưa có lời nguyện nào." />
  );
}
