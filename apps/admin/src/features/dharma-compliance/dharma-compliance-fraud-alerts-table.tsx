import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { fraudAlertListOptions } from "./queries.js";
import {
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  type FraudAlertItem,
} from "./types.js";

function FraudAlertRowActions({ item, onResolve }: { item: FraudAlertItem; onResolve: (item: FraudAlertItem) => void }) {
  if (item.resolved) return null;
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Giải quyết",
          onClick: () => onResolve(item),
        },
      ]}
    />
  );
}

export function DharmaComplianceFraudAlertsTable({
  isLoading,
  onResolve,
}: {
  isLoading: boolean;
  onResolve: (item: FraudAlertItem) => void;
}) {
  const { data: envelope } = useQuery(fraudAlertListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const fraudColumns: ColumnDef<FraudAlertItem>[] = useMemo(
    () => [
      {
        accessorKey: "charity",
        header: "Tổ chức liên quan",
        cell: ({ row }) => row.original.charity?.name ?? "—",
      },
      { accessorKey: "alertType", header: "Loại cảnh báo" },
      {
        accessorKey: "severity",
        header: "Mức độ",
        cell: ({ row }) => (
          <Badge variant={FRAUD_SEVERITY_VARIANT[row.original.severity]}>
            {FRAUD_SEVERITY_LABELS[row.original.severity]}
          </Badge>
        ),
      },
      {
        accessorKey: "description",
        header: "Trích đoạn nội dung",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-sm">{row.original.description}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày phát hiện",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        accessorKey: "resolved",
        header: "Đã xử lý",
        cell: ({ row }) => (
          <Badge variant={row.original.resolved ? "secondary" : "destructive"}>
            {row.original.resolved ? "Đã xử lý" : "Chưa xử lý"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <FraudAlertRowActions item={row.original} onResolve={onResolve} />,
      },
    ],
    [onResolve],
  );

  const table = useSafeReactTable({ data: items, columns: fraudColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <WorkspaceDataTable table={table} columns={fraudColumns} isLoading={isLoading} emptyMessage="Không có cảnh báo nào." />
  );
}
