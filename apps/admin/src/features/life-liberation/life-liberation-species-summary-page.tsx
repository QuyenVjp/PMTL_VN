import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { speciesSummaryOptions } from "./queries.js";
import { SPECIES_LABELS, type SpeciesSummaryItem } from "./types.js";

export function SpeciesSummaryPage() {
  const { data: envelope, isLoading } = useQuery(speciesSummaryOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<SpeciesSummaryItem>[] = useMemo(
    () => [
      { accessorKey: "species", header: "Loài", cell: ({ row }) => SPECIES_LABELS[row.original.species] },
      { accessorKey: "totalReleased", header: "Tổng số đã phóng sinh" },
    ],
    []
  );

  const table = useSafeReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê theo loài</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tổng hợp operational từ journal phóng sinh, dùng để rà xu hướng và cảnh báo loài nhạy cảm.</p>
      </div>

      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có dữ liệu thống kê." />
    </div>
  );
}
