import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { volunteerListOptions, type VolunteerItem } from "@/features/volunteers/queries";
import { useDeleteVolunteer } from "@/features/volunteers/mutations";

const activeOptions = [
  { label: "Đang hoạt động", value: "true" },
  { label: "Không hoạt động", value: "false" },
];

function VolunteerRowActions({ row }: { row: VolunteerItem }) {
  const navigate = useNavigate();
  const deleteVolunteer = useDeleteVolunteer();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Chỉnh sửa",
            icon: PencilIcon,
            onClick: () => { void navigate({ to: "/he-thong/phung-su-vien/$publicId", params: { publicId: row.publicId } }); },
          },
          {
            label: "Xoá",
            icon: Trash2Icon,
            onClick: () => setConfirmDelete(true),
            variant: "destructive" as const,
            separator: true,
          },
        ]}
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá phụng sự viên"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{row.displayName}</span>?
            Thao tác này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteVolunteer.isPending}
        onConfirm={() =>
          deleteVolunteer.mutate(row.publicId, {
            onSuccess: () => setConfirmDelete(false),
          })
        }
      />
    </>
  );
}

export function VolunteersTable() {
  const navigate = useNavigate();
  const { data: envelope, isLoading } = useQuery(volunteerListOptions({ limit: 100 }));
  const volunteers = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "sortOrder", desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<VolunteerItem>[]>(
    () => [
      createSelectColumn<VolunteerItem>(),
      {
        accessorKey: "displayName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
        cell: ({ row }) => <div className="font-medium">{row.original.displayName}</div>,
        meta: { label: "Tên" },
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
        cell: ({ row }) => <div className="text-nowrap">{row.original.role}</div>,
        meta: { label: "Vai trò" },
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              Đang hoạt động
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              Không hoạt động
            </Badge>
          ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Điện thoại" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">{row.original.phone ?? "—"}</div>
        ),
        meta: { label: "Điện thoại" },
        enableSorting: false,
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
        cell: ({ row }) => (
          <div className="tabular-nums text-muted-foreground">{row.original.sortOrder}</div>
        ),
        meta: { label: "Thứ tự" },
      },
      {
        id: "actions",
        cell: ({ row }) => <VolunteerRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: volunteers,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc phụng sự viên..."
        searchKey="displayName"
        viewButtonLabel="Xem"
        filters={[{ columnId: "isActive", title: "Trạng thái", options: activeOptions }]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có phụng sự viên nào."
        onRowClick={(row) => { void navigate({ to: "/he-thong/phung-su-vien/$publicId", params: { publicId: row.publicId } }); }}
      />
      <DataTableBulkActions table={table} entityName="phụng sự viên" />
    </div>
  );
}
