import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { charityListOptions, type CharityListItem } from "@/features/dharma-compliance/queries";
import { CHARITY_STATUS_LABELS } from "@/features/dharma-compliance/types";

function statusBadgeClass(s: string): string {
  if (s === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "PENDING_REVIEW") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "SUSPENDED") return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400";
  if (s === "FLAGGED") return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function CharityRowActions({ item }: { item: CharityListItem }) {
  const navigate = useNavigate();

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          icon: PencilIcon,
          onClick: () => void navigate({ to: `/phap-luat/to-chuc-tu-thien/${item.id}` }),
        },
      ]}
    />
  );
}

export function DharmaComplianceCharitiesTable() {
  const { data: envelope, isLoading } = useQuery(charityListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const charityColumns: ColumnDef<CharityListItem>[] = useMemo(
    () => [
      createSelectColumn<CharityListItem>(),
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên tổ chức" />,
      },
      {
        accessorKey: "charityType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge className={statusBadgeClass(row.original.status)} variant="outline">
            {CHARITY_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "registrationNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đăng ký" />,
        cell: ({ row }) => row.original.registrationNumber ?? "—",
      },
      {
        accessorKey: "contactEmail",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => row.original.contactEmail ?? "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <CharityRowActions item={row.original} />,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: items,
    columns: charityColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable
      table={table}
      columns={charityColumns}
      isLoading={isLoading}
      emptyMessage="Chưa có tổ chức nào."
    />
  );
}
