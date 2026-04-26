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
import { altarItemListOptions, type AltarItemListItem } from "./queries.js";
import {
  ALTAR_ITEM_TYPE_LABELS,
  CONDITION_LABELS,
  CONDITION_VARIANT,
} from "./types.js";

export function AltarManagementItemsTable() {
  const [detailItem, setDetailItem] = useState<AltarItemListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(altarItemListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const itemColumns: ColumnDef<AltarItemListItem>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Tên vật phẩm" },
      {
        accessorKey: "itemType",
        header: "Loại",
        cell: ({ row }) => ALTAR_ITEM_TYPE_LABELS[row.original.itemType],
      },
      {
        accessorKey: "condition",
        header: "Tình trạng",
        cell: ({ row }) => (
          <Badge variant={CONDITION_VARIANT[row.original.condition]}>
            {CONDITION_LABELS[row.original.condition]}
          </Badge>
        ),
      },
      {
        accessorKey: "user",
        header: "Chủ nhân",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Đang dùng",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "secondary" : "outline"}>
            {row.original.isActive ? "Có" : "Không"}
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
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={itemColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có vật phẩm nào."
        onRowClick={setDetailItem}
      />

      <WorkspaceDetailSheet
        open={detailItem !== null}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null);
        }}
        title={detailItem?.name ?? "Vật phẩm"}
        subtitle={detailItem ? ALTAR_ITEM_TYPE_LABELS[detailItem.itemType] : undefined}
        status={
          detailItem && (
            <Badge variant={CONDITION_VARIANT[detailItem.condition]}>
              {CONDITION_LABELS[detailItem.condition]}
            </Badge>
          )
        }
      >
        {detailItem && (
          <WorkspaceDetailSection title="Thông tin vật phẩm">
            <WorkspaceDetailField label="Tên vật phẩm" value={detailItem.name} />
            <WorkspaceDetailField
              label="Loại"
              value={ALTAR_ITEM_TYPE_LABELS[detailItem.itemType]}
            />
            <WorkspaceDetailField
              label="Tình trạng"
              value={
                <Badge variant={CONDITION_VARIANT[detailItem.condition]}>
                  {CONDITION_LABELS[detailItem.condition]}
                </Badge>
              }
            />
            <WorkspaceDetailField
              label="Đang dùng"
              value={detailItem.isActive ? "Có" : "Không"}
            />
            <WorkspaceDetailField
              label="Chủ nhân"
              value={detailItem.user?.name ?? "—"}
            />
            {detailItem.acquisitionAt && (
              <WorkspaceDetailField
                label="Ngày tiếp nhận"
                value={new Date(detailItem.acquisitionAt).toLocaleDateString("vi-VN")}
              />
            )}
          </WorkspaceDetailSection>
        )}
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>

    </>
  );
}
