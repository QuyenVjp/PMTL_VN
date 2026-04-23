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
import { Button } from "@/components/ui/button";
import { lhFraudListOptions, type LhFraudItem } from "./queries.js";
import { FRAUD_SEVERITY_LABELS, FRAUD_SEVERITY_VARIANT } from "./types.js";
import { ResolveDialog } from "./little-house-resolve-dialog.js";

export function LhFraudQueueTable() {
  const [detailItem, setDetailItem] = useState<LhFraudItem | null>(null);
  const [resolveItem, setResolveItem] = useState<LhFraudItem | null>(null);
  const { data: envelope, isLoading } = useQuery(lhFraudListOptions({ resolved: false }));
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  function handleResolveFromSheet() {
    if (!detailItem) return;
    const item = detailItem;
    setDetailItem(null);
    setResolveItem(item);
  }

  const fraudColumns: ColumnDef<LhFraudItem>[] = useMemo(
    () => [
      {
        accessorKey: "record",
        header: "Hồ sơ sớ",
        cell: ({ row }) => row.original.record?.beneficiary ?? "—",
      },
      {
        accessorKey: "reason",
        header: "Lý do",
        cell: ({ row }) => <span className="line-clamp-2">{row.original.reason}</span>,
      },
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
        cell: ({ row }) => (
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setDetailItem(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: items,
    columns: fraudColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={fraudColumns}
        isLoading={isLoading}
        emptyMessage="Không có hồ sơ gian lận nào."
      />

      <WorkspaceDetailSheet
        open={detailItem !== null}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null);
        }}
        title={detailItem?.record?.beneficiary ?? "Hồ sơ gian lận"}
        subtitle={
          detailItem
            ? `Mức độ: ${FRAUD_SEVERITY_LABELS[detailItem.severity]}`
            : undefined
        }
        status={
          detailItem && (
            <Badge variant={detailItem.resolvedAt ? "secondary" : "destructive"}>
              {detailItem.resolvedAt ? "Đã xử lý" : "Chưa xử lý"}
            </Badge>
          )
        }
        primaryActions={
          detailItem && !detailItem.resolvedAt ? (
            <Button size="sm" variant="destructive" onClick={handleResolveFromSheet}>
              Giải quyết
            </Button>
          ) : undefined
        }
      >
        {detailItem && (
          <WorkspaceDetailSection title="Thông tin gian lận">
            <WorkspaceDetailField
              label="Hồ sơ sớ"
              value={detailItem.record?.beneficiary ?? "—"}
            />
            <WorkspaceDetailField
              label="Mức độ"
              value={
                <Badge variant={FRAUD_SEVERITY_VARIANT[detailItem.severity]}>
                  {FRAUD_SEVERITY_LABELS[detailItem.severity]}
                </Badge>
              }
            />
            <WorkspaceDetailField label="Lý do" value={detailItem.reason} stacked />
            <WorkspaceDetailField
              label="Ngày phát hiện"
              value={new Date(detailItem.flaggedAt).toLocaleDateString("vi-VN")}
            />
            {detailItem.resolvedAt && (
              <WorkspaceDetailField
                label="Ngày xử lý"
                value={new Date(detailItem.resolvedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {detailItem.resolution && (
              <WorkspaceDetailField
                label="Kết quả xử lý"
                value={detailItem.resolution}
                stacked
              />
            )}
          </WorkspaceDetailSection>
        )}
      </WorkspaceDetailSheet>

      <ResolveDialog
        open={resolveItem !== null}
        onClose={() => setResolveItem(null)}
        item={resolveItem}
      />
    </>
  );
}
