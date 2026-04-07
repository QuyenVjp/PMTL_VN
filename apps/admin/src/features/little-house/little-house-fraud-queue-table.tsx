import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { WorkspaceRowActions } from "@/components/workspace/workspace-row-actions";
import { Badge } from "@/components/ui/badge";
import { lhFraudListOptions, type LhFraudItem } from "./queries.js";
import { FRAUD_SEVERITY_LABELS, FRAUD_SEVERITY_VARIANT } from "./types.js";
import { ResolveDialog } from "./little-house-resolve-dialog.js";

function FraudQueueRowActions({ item }: { item: LhFraudItem }) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  if (item.resolvedAt) return null;

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Giải quyết",
            onClick: () => setShowResolveDialog(true),
          },
        ]}
      />
      <ResolveDialog
        open={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        item={item}
      />
    </>
  );
}

export function LhFraudQueueTable() {
  const { data: envelope, isLoading } = useQuery(lhFraudListOptions({ resolved: false }));
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const fraudColumns: ColumnDef<LhFraudItem>[] = useMemo(
    () => [
      { accessorKey: "record", header: "Hồ sơ sớ", cell: ({ row }) => row.original.record?.beneficiary ?? "—" },
      { accessorKey: "reason", header: "Lý do", cell: ({ row }) => <span className="line-clamp-2">{row.original.reason}</span> },
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
        accessorKey: "resolvedAt",
        header: "Đã xử lý",
        cell: ({ row }) => (
          <Badge variant={row.original.resolvedAt ? "secondary" : "destructive"}>
            {row.original.resolvedAt ? "Đã xử lý" : "Chưa xử lý"}
          </Badge>
        ),
      },
      {
        accessorKey: "flaggedAt",
        header: "Ngày phát hiện",
        cell: ({ row }) => new Date(row.original.flaggedAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <FraudQueueRowActions item={row.original} />,
      },
    ],
    []
  );

  const table = useSafeReactTable({
    data: items,
    columns: fraudColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={fraudColumns} isLoading={isLoading} emptyMessage="Không có hồ sơ gian lận nào." />
  );
}
