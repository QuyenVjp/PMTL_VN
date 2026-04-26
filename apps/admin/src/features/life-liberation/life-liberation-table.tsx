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
import { lifeReleaseListOptions } from "./queries.js";
import {
  LIFE_RELEASE_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  STATUS_VARIANT,
  type LifeReleaseListItem,
} from "./types.js";

export function LifeReleaseTable() {
  const [detailItem, setDetailItem] = useState<LifeReleaseListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(lifeReleaseListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<LifeReleaseListItem>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "Người phóng sinh",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
      {
        accessorKey: "recordType",
        header: "Loại",
        cell: ({ row }) => RECORD_TYPE_LABELS[row.original.recordType],
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]}>
            {LIFE_RELEASE_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      { accessorKey: "totalAnimals", header: "Tổng số lượng" },
      {
        accessorKey: "locationName",
        header: "Địa điểm",
        cell: ({ row }) => row.original.locationName ?? "—",
      },
      {
        accessorKey: "releaseDate",
        header: "Ngày phóng sinh",
        cell: ({ row }) => new Date(row.original.releaseDate).toLocaleDateString("vi-VN"),
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
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có hồ sơ phóng sinh nào."
        onRowClick={setDetailItem}
      />

      <WorkspaceDetailSheet
        open={detailItem !== null}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null);
        }}
        title={detailItem?.user?.name ?? "Chưa xác định"}
        subtitle={detailItem ? RECORD_TYPE_LABELS[detailItem.recordType] : undefined}
        status={
          detailItem && (
            <Badge variant={STATUS_VARIANT[detailItem.status]}>
              {LIFE_RELEASE_STATUS_LABELS[detailItem.status]}
            </Badge>
          )
        }
      >
        {detailItem && (
          <WorkspaceDetailSection title="Thông tin hồ sơ">
            <WorkspaceDetailField
              label="Người phóng sinh"
              value={detailItem.user?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Loại hồ sơ"
              value={RECORD_TYPE_LABELS[detailItem.recordType]}
            />
            <WorkspaceDetailField
              label="Tổng số lượng"
              value={detailItem.totalAnimals}
            />
            <WorkspaceDetailField
              label="Địa điểm"
              value={detailItem.locationName ?? "—"}
            />
            <WorkspaceDetailField
              label="Ngày phóng sinh"
              value={new Date(detailItem.releaseDate).toLocaleDateString("vi-VN")}
            />
          </WorkspaceDetailSection>
        )}
        <WorkspaceDetailStandardSections
          editNote="Màn Phóng sinh hiện ở phạm vi hygiene-only theo design; admin chỉ xem hồ sơ và chưa mở chuyển trạng thái vận hành."
          auditNote="Audit phóng sinh sẽ hiển thị khi API operational surface được đưa vào admin triple."
        />
      </WorkspaceDetailSheet>
    </>
  );
}
