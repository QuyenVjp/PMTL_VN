import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { lifeReleaseListOptions, speciesSummaryOptions } from "./queries.js";
import {
  LIFE_RELEASE_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  STATUS_VARIANT,
  SPECIES_LABELS,
  type LifeReleaseListItem,
  type SpeciesSummaryItem,
} from "./types.js";

// ─── Life Release Records ─────────────────────────────────────────────────────

const columns: ColumnDef<LifeReleaseListItem>[] = [
  { accessorKey: "user", header: "Người phóng sinh", cell: ({ row }) => row.original.user?.name ?? "—" },
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
  { accessorKey: "locationName", header: "Địa điểm", cell: ({ row }) => row.original.locationName ?? "—" },
  {
    accessorKey: "releaseDate",
    header: "Ngày phóng sinh",
    cell: ({ row }) => new Date(row.original.releaseDate).toLocaleDateString("vi-VN"),
  },
];

export function LifeReleaseListPage() {
  const { data: envelope, isLoading } = useQuery(lifeReleaseListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ phóng sinh</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý các hồ sơ phóng sinh của đồng tu</p>
      </div>
      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có hồ sơ phóng sinh nào." />
    </div>
  );
}

// ─── Species Summary ──────────────────────────────────────────────────────────

const speciesColumns: ColumnDef<SpeciesSummaryItem>[] = [
  { accessorKey: "species", header: "Loài", cell: ({ row }) => SPECIES_LABELS[row.original.species] },
  { accessorKey: "totalReleased", header: "Tổng số đã phóng sinh" },
];

export function SpeciesSummaryPage() {
  const { data: envelope, isLoading } = useQuery(speciesSummaryOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: items,
    columns: speciesColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê theo loài</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tổng số lượng sinh vật đã được phóng sinh theo loài</p>
      </div>
      <WorkspaceDataTable table={table} columns={speciesColumns} isLoading={isLoading} emptyMessage="Chưa có dữ liệu thống kê." />
    </div>
  );
}
