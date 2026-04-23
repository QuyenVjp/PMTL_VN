import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailField,
} from "@/components/workspace";
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

function LhRecordRowActions({
  item,
  onViewDetail,
}: {
  item: LhListItem;
  onViewDetail: (item: LhListItem) => void;
}) {
  const [advanceTarget, setAdvanceTarget] = useState<LhStatus | null>(null);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  const nextStates = NEXT_STATES[item.status];
  const isTerminal = nextStates.length === 0;

  const advanceActions = nextStates.map((s) => ({
    label: ADVANCE_ACTION_LABELS[s] ?? s,
    onClick: () => setAdvanceTarget(s),
    variant: s === "CANCELLED" ? ("destructive" as const) : ("default" as const),
    separator: s === "CANCELLED" && nextStates.length > 1,
  }));

  const actions = [
    {
      label: "Xem chi tiết",
      onClick: () => onViewDetail(item),
    },
    ...advanceActions,
    {
      label: "Đánh dấu gian lận",
      onClick: () => setShowFraudDialog(true),
      separator: !isTerminal,
      variant: "destructive" as const,
    },
  ];

  return (
    <>
      <WorkspaceRowActions actions={actions} />
      {!isTerminal && (
        <AdvanceDialog
          open={advanceTarget !== null}
          onClose={() => setAdvanceTarget(null)}
          item={item}
          targetStatus={advanceTarget}
        />
      )}
      <FraudFlagDialog
        open={showFraudDialog}
        onClose={() => setShowFraudDialog(false)}
        item={item}
      />
    </>
  );
}

export function LhRecordsTable() {
  const [detailItem, setDetailItem] = useState<LhListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(lhListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const lhColumns: ColumnDef<LhListItem>[] = useMemo(
    () => [
      { accessorKey: "beneficiaryName", header: "Tên người thụ hưởng" },
      {
        accessorKey: "user",
        header: "Người lập sớ",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
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
        cell: ({ row }) =>
          row.original.signedAt
            ? new Date(row.original.signedAt).toLocaleDateString("vi-VN")
            : "—",
      },
      {
        accessorKey: "chantedAt",
        header: "Ngày tụng",
        cell: ({ row }) =>
          row.original.chantedAt
            ? new Date(row.original.chantedAt).toLocaleDateString("vi-VN")
            : "—",
      },
      {
        accessorKey: "burnedAt",
        header: "Ngày hóa",
        cell: ({ row }) =>
          row.original.burnedAt
            ? new Date(row.original.burnedAt).toLocaleDateString("vi-VN")
            : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <LhRecordRowActions item={row.original} onViewDetail={setDetailItem} />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: records,
    columns: lhColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={lhColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có sớ nào."
      />

      <WorkspaceDetailSheet
        open={detailItem !== null}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null);
        }}
        title={detailItem?.beneficiaryName ?? "Chưa xác định"}
        subtitle={detailItem?.user?.name ? `Người lập: ${detailItem.user.name}` : undefined}
        status={
          detailItem && (
            <Badge variant={LH_STATUS_VARIANT[detailItem.status]}>
              {LH_STATUS_LABELS[detailItem.status]}
            </Badge>
          )
        }
      >
        {detailItem && (
          <WorkspaceDetailSection title="Thông tin sớ">
            <WorkspaceDetailField
              label="Tên người thụ hưởng"
              value={detailItem.beneficiaryName}
            />
            <WorkspaceDetailField
              label="Người lập sớ"
              value={detailItem.user?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Trạng thái"
              value={
                <Badge variant={LH_STATUS_VARIANT[detailItem.status]}>
                  {LH_STATUS_LABELS[detailItem.status]}
                </Badge>
              }
            />
            {detailItem.draftedAt && (
              <WorkspaceDetailField
                label="Ngày lập"
                value={new Date(detailItem.draftedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {detailItem.signedAt && (
              <WorkspaceDetailField
                label="Ngày ký"
                value={new Date(detailItem.signedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {detailItem.chantedAt && (
              <WorkspaceDetailField
                label="Ngày tụng"
                value={new Date(detailItem.chantedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {detailItem.burnedAt && (
              <WorkspaceDetailField
                label="Ngày hóa"
                value={new Date(detailItem.burnedAt).toLocaleDateString("vi-VN")}
              />
            )}
          </WorkspaceDetailSection>
        )}
      </WorkspaceDetailSheet>
    </>
  );
}
