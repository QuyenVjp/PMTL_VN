import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailField,
} from "@/components/workspace";
import { vowListOptions } from "./queries.js";
import { VOW_STATUS_LABELS, type VowListItem } from "./types.js";

export function DharmaCompliancePurityVowsTable() {
  const [selectedVow, setSelectedVow] = useState<VowListItem | null>(null);
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setSelectedVow(row.original),
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
    columns: vowColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={vowColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có lời nguyện nào."
      />

      <WorkspaceDetailSheet
        open={selectedVow !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedVow(null);
        }}
        title={selectedVow?.practitioner?.name ?? "Chưa xác định"}
        subtitle={selectedVow ? `Mức độ: ${selectedVow.purityLevel}` : undefined}
        status={
          selectedVow && (
            <Badge variant="outline">
              {VOW_STATUS_LABELS[selectedVow.status] ?? selectedVow.status}
            </Badge>
          )
        }
      >
        {selectedVow && (
          <WorkspaceDetailSection title="Thông tin lời nguyện">
            <WorkspaceDetailField
              label="Người nguyện"
              value={selectedVow.practitioner?.name ?? "—"}
            />
            <WorkspaceDetailField label="Mức độ thanh tịnh" value={selectedVow.purityLevel} />
            <WorkspaceDetailField
              label="Trạng thái"
              value={VOW_STATUS_LABELS[selectedVow.status] ?? selectedVow.status}
            />
            <WorkspaceDetailField
              label="Ngày nguyện"
              value={new Date(selectedVow.vowDate).toLocaleDateString("vi-VN")}
            />
            <WorkspaceDetailField
              label="Cho phép hôn"
              value={selectedVow.kissAllowed ? "Có" : "Không"}
            />
            <WorkspaceDetailField
              label="Cho phép ôm"
              value={selectedVow.hugAllowed ? "Có" : "Không"}
            />
            <WorkspaceDetailField
              label="Quy tắc ngủ"
              value={selectedVow.sleepArrangement ?? "—"}
            />
          </WorkspaceDetailSection>
        )}
      </WorkspaceDetailSheet>
    </>
  );
}
