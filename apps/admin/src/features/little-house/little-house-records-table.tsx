import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { WorkspaceRowActions } from "@/components/workspace/workspace-row-actions";
import { Badge } from "@/components/ui/badge";
import { lhListOptions, type LhListItem } from "./queries.js";
import { LH_STATUS_LABELS, LH_STATUS_VARIANT, NEXT_STATES, type LhStatus } from "./types.js";
import { AdvanceDialog } from "./little-house-advance-dialog.js";
import { FraudFlagDialog } from "./little-house-fraud-flag-dialog.js";

const ADVANCE_ACTION_LABELS: Partial<Record<LhStatus, string>> = {
  SIGNED: "Ký nhận",
  CHANTED: "Hoàn thành tụng",
  BURNED: "Ghi nhận đốt",
  CANCELLED: "Huỷ",
};

function LhRecordRowActions({ item }: { item: LhListItem }) {
  const [advanceTarget, setAdvanceTarget] = useState<LhStatus | null>(null);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  const nextStates = NEXT_STATES[item.status];
  const isTerminal = nextStates.length === 0;

  const actions = [
    ...nextStates.map((s) => ({
      label: ADVANCE_ACTION_LABELS[s] ?? s,
      onClick: () => setAdvanceTarget(s),
      variant: s === "CANCELLED" ? ("destructive" as const) : ("default" as const),
      separator: s === "CANCELLED" && nextStates.length > 1,
    })),
    {
      label: "Đánh dấu gian lận",
      onClick: () => setShowFraudDialog(true),
      separator: !isTerminal,
      variant: "destructive" as const,
    },
  ];

  if (isTerminal) {
    return (
      <>
        <WorkspaceRowActions
          actions={[
            {
              label: "Đánh dấu gian lận",
              onClick: () => setShowFraudDialog(true),
              variant: "destructive",
            },
          ]}
        />
        <FraudFlagDialog open={showFraudDialog} onClose={() => setShowFraudDialog(false)} item={item} />
      </>
    );
  }

  return (
    <>
      <WorkspaceRowActions actions={actions} />
      <AdvanceDialog
        open={advanceTarget !== null}
        onClose={() => setAdvanceTarget(null)}
        item={item}
        targetStatus={advanceTarget}
      />
      <FraudFlagDialog
        open={showFraudDialog}
        onClose={() => setShowFraudDialog(false)}
        item={item}
      />
    </>
  );
}

export function LhRecordsTable() {
  const { data: envelope, isLoading } = useQuery(lhListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const lhColumns: ColumnDef<LhListItem>[] = useMemo(
    () => [
      { accessorKey: "beneficiaryName", header: "Tên người thụ hưởng" },
      { accessorKey: "user", header: "Người lập sớ", cell: ({ row }) => row.original.user?.name ?? "—" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={LH_STATUS_VARIANT[row.original.status]}>
            {LH_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "signedAt",
        header: "Ngày ký",
        cell: ({ row }) => row.original.signedAt ? new Date(row.original.signedAt).toLocaleDateString("vi-VN") : "—",
      },
      {
        accessorKey: "chantedAt",
        header: "Ngày tụng",
        cell: ({ row }) => row.original.chantedAt ? new Date(row.original.chantedAt).toLocaleDateString("vi-VN") : "—",
      },
      {
        accessorKey: "burnedAt",
        header: "Ngày hóa",
        cell: ({ row }) => row.original.burnedAt ? new Date(row.original.burnedAt).toLocaleDateString("vi-VN") : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <LhRecordRowActions item={row.original} />,
      },
    ],
    []
  );

  const table = useSafeReactTable({
    data: records,
    columns: lhColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={lhColumns} isLoading={isLoading} emptyMessage="Chưa có sớ nào." />
  );
}
