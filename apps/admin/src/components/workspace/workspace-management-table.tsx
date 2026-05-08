import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace/workspace-data-table";

type WorkspaceManagementTableProps<TData> = {
  rows: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
};

export function WorkspaceManagementTable<TData>({
  rows,
  columns,
  isLoading,
  emptyMessage,
  onRowClick,
}: WorkspaceManagementTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const data = useMemo(() => rows, [rows]);

  const table = useSafeReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <WorkspaceDataTable
      table={table}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
    />
  );
}
