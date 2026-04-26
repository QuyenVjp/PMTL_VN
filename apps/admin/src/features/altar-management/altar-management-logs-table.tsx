import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailStandardSections,
  WorkspaceDetailField,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { validationLogListOptions, type ValidationLogItem } from "./queries.js";
import { PROTOCOL_LABELS } from "./types.js";

export function AltarManagementLogsTable() {
  const [detailLog, setDetailLog] = useState<ValidationLogItem | null>(null);
  const { data: envelope, isLoading } = useQuery(validationLogListOptions());
  const logs = useMemo(() => envelope?.data ?? [], [envelope]);

  const logColumns: ColumnDef<ValidationLogItem>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "Người kiểm tra",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
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
      {
        accessorKey: "item",
        header: "Vật phẩm",
        cell: ({ row }) => row.original.item?.name ?? "—",
      },
      {
        accessorKey: "performedAt",
        header: "Ngày kiểm tra",
        cell: ({ row }) => new Date(row.original.performedAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setDetailLog(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: logs,
    columns: logColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={logColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có nhật ký nào."
        onRowClick={setDetailLog}
      />

      <WorkspaceDetailSheet
        open={detailLog !== null}
        onOpenChange={(v) => {
          if (!v) setDetailLog(null);
        }}
        title={detailLog ? PROTOCOL_LABELS[detailLog.protocolType] : "Nhật ký kiểm tra"}
        subtitle={detailLog?.item?.name ?? undefined}
        status={
          detailLog && (
            <Badge variant={detailLog.passed ? "secondary" : "destructive"}>
              {detailLog.passed ? "Đạt" : "Không đạt"}
            </Badge>
          )
        }
      >
        {detailLog && (
          <WorkspaceDetailSection title="Thông tin kiểm tra">
            <WorkspaceDetailField
              label="Quy trình"
              value={PROTOCOL_LABELS[detailLog.protocolType]}
            />
            <WorkspaceDetailField
              label="Vật phẩm"
              value={detailLog.item?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Người kiểm tra"
              value={detailLog.user?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Kết quả"
              value={
                <Badge variant={detailLog.passed ? "secondary" : "destructive"}>
                  {detailLog.passed ? "Đạt" : "Không đạt"}
                </Badge>
              }
            />
            <WorkspaceDetailField
              label="Ngày kiểm tra"
              value={new Date(detailLog.performedAt).toLocaleDateString("vi-VN")}
            />
            {detailLog.notes && (
              <WorkspaceDetailField label="Ghi chú" value={detailLog.notes} stacked />
            )}
          </WorkspaceDetailSection>
        )}
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>
    </>
  );
}
