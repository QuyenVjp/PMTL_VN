import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { altarItemListOptions, validationLogListOptions } from "./queries.js";
import {
  ALTAR_ITEM_TYPE_LABELS,
  CONDITION_LABELS,
  CONDITION_VARIANT,
  PROTOCOL_LABELS,
  type AltarItemListItem,
  type ValidationLogItem,
} from "./types.js";

// ─── Altar Items ──────────────────────────────────────────────────────────────

const itemColumns: ColumnDef<AltarItemListItem>[] = [
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
];

export function AltarItemsPage() {
  const { data: envelope, isLoading } = useQuery(altarItemListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vật phẩm thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý vật phẩm trên bàn thờ</p>
      </div>
      <WorkspaceDataTable table={table} columns={itemColumns} isLoading={isLoading} emptyMessage="Chưa có vật phẩm nào." />
    </div>
  );
}

// ─── Validation Logs (read-only) ──────────────────────────────────────────────

const logColumns: ColumnDef<ValidationLogItem>[] = [
  { accessorKey: "user", header: "Người kiểm tra", cell: ({ row }) => row.original.user?.name ?? "—" },
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
  { accessorKey: "item", header: "Vật phẩm", cell: ({ row }) => row.original.item?.name ?? "—" },
  {
    accessorKey: "performedAt",
    header: "Ngày kiểm tra",
    cell: ({ row }) => new Date(row.original.performedAt).toLocaleDateString("vi-VN"),
  },
];

export function ValidationLogsPage() {
  const { data: envelope, isLoading } = useQuery(validationLogListOptions());
  const logs = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: logs,
    columns: logColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký kiểm tra thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lịch sử kiểm tra vật phẩm và quy trình thờ cúng (chỉ đọc)</p>
      </div>
      <WorkspaceDataTable table={table} columns={logColumns} isLoading={isLoading} emptyMessage="Chưa có nhật ký nào." />
    </div>
  );
}
