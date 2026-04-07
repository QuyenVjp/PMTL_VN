import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { altarItemListOptions, type AltarItemListItem } from "./queries.js";
import { ALTAR_ITEM_TYPE_LABELS, CONDITION_LABELS, CONDITION_VARIANT, type AltarItemType, type AltarCondition } from "./types.js";
import { ConditionUpdateDialog } from "./altar-management-condition-dialog.js";

function AltarItemRowActions({ item }: { item: AltarItemListItem }) {
  const [showConditionDialog, setShowConditionDialog] = useState(false);

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Cập nhật tình trạng",
            onClick: () => setShowConditionDialog(true),
          },
        ]}
      />
      <ConditionUpdateDialog
        open={showConditionDialog}
        onClose={() => setShowConditionDialog(false)}
        item={item}
      />
    </>
  );
}

export function AltarManagementItemsTable() {
  const { data: envelope, isLoading } = useQuery(altarItemListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const itemColumns: ColumnDef<AltarItemListItem>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Tên vật phẩm" },
      {
        accessorKey: "itemType",
        header: "Loại",
        cell: ({ row }) => ALTAR_ITEM_TYPE_LABELS[row.original.itemType as AltarItemType],
      },
      {
        accessorKey: "condition",
        header: "Tình trạng",
        cell: ({ row }) => (
          <Badge variant={CONDITION_VARIANT[row.original.condition as AltarCondition]}>
            {CONDITION_LABELS[row.original.condition as AltarCondition]}
          </Badge>
        ),
      },
      { accessorKey: "user", header: "Chủ nhân", cell: ({ row }) => row.original.user?.name ?? "—" },
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
        cell: ({ row }) => <AltarItemRowActions item={row.original} />,
      },
    ],
    []
  );

  const table = useSafeReactTable({
    data: items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={itemColumns} isLoading={isLoading} emptyMessage="Chưa có vật phẩm nào." />
  );
}
