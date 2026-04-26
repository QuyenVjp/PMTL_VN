import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailStandardSections,
  WorkspaceDetailField,
} from "@/components/workspace";
import { fraudAlertListOptions } from "./queries.js";
import {
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  type FraudAlertItem,
} from "./types.js";

export function DharmaComplianceFraudAlertsTable({
  isLoading,
  onResolve,
}: {
  isLoading: boolean;
  onResolve: (item: FraudAlertItem) => void;
}) {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertItem | null>(null);
  const { data: envelope } = useQuery(fraudAlertListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  function handleResolve() {
    if (!selectedAlert) return;
    const alert = selectedAlert;
    setSelectedAlert(null);
    onResolve(alert);
  }

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
        cell: ({ row }) => (
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setSelectedAlert(row.original),
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
        emptyMessage="Không có cảnh báo nào."
        onRowClick={setSelectedAlert}
      />

      <WorkspaceDetailSheet
        open={selectedAlert !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedAlert(null);
        }}
        title={selectedAlert?.alertType ?? "Cảnh báo"}
        subtitle={selectedAlert?.charity?.name ?? undefined}
        status={
          selectedAlert && (
            <Badge variant={selectedAlert.resolved ? "secondary" : "destructive"}>
              {selectedAlert.resolved ? "Đã xử lý" : "Chưa xử lý"}
            </Badge>
          )
        }
        primaryActions={
          selectedAlert && !selectedAlert.resolved ? (
            <Button size="sm" variant="destructive" onClick={handleResolve}>
              Giải quyết
            </Button>
          ) : undefined
        }
      >
        {selectedAlert && (
          <WorkspaceDetailSection title="Chi tiết cảnh báo">
            <WorkspaceDetailField
              label="Tổ chức liên quan"
              value={selectedAlert.charity?.name ?? "—"}
            />
            <WorkspaceDetailField label="Loại cảnh báo" value={selectedAlert.alertType} />
            <WorkspaceDetailField
              label="Mức độ"
              value={
                <Badge variant={FRAUD_SEVERITY_VARIANT[selectedAlert.severity]}>
                  {FRAUD_SEVERITY_LABELS[selectedAlert.severity]}
                </Badge>
              }
            />
            <WorkspaceDetailField
              label="Mô tả"
              value={selectedAlert.description}
              stacked
            />
            <WorkspaceDetailField
              label="Ngày phát hiện"
              value={new Date(selectedAlert.createdAt).toLocaleDateString("vi-VN")}
            />
            {selectedAlert.resolvedAt && (
              <WorkspaceDetailField
                label="Ngày xử lý"
                value={new Date(selectedAlert.resolvedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {selectedAlert.resolution && (
              <WorkspaceDetailField
                label="Kết quả xử lý"
                value={selectedAlert.resolution}
                stacked
              />
            )}
          </WorkspaceDetailSection>
        )}
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>
    </>
  );
}
