import { useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheckIcon } from "lucide-react";

import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableRowActions } from "@/features/users/data-table-row-actions";
import { userListOptions } from "@/features/users/queries";
import {
  initials,
  roleLabel,
  roleOptions,
  statusBadgeClass,
  statusLabel,
  statusOptions,
  type AdminUserListItem,
} from "@/features/users/types";

export function UsersTable() {
  const { data: envelope, isLoading } = useQuery(userListOptions({ limit: 100 }));
  const users = envelope?.data ?? [];

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "displayName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-xl">
              <AvatarImage src={row.original.avatarUrl ?? undefined} alt={row.original.displayName} />
              <AvatarFallback className="rounded-xl">{initials(row.original.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{row.original.displayName}</div>
              <div className="truncate text-sm text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        ),
        meta: { label: "Tên" },
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div className="text-nowrap">{row.original.email}</div>,
        meta: { label: "Email" },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
            <span>{roleLabel(row.original.role)}</span>
          </div>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Vai trò" },
        enableSorting: false,
      },
      {
        accessorKey: "lastLoginAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đăng nhập lần cuối" />,
        cell: ({ row }) => {
          const v = row.original.lastLoginAt;
          if (!v) return <span className="text-muted-foreground">—</span>;
          return <div className="text-nowrap">{new Date(v).toLocaleDateString("vi-VN")}</div>;
        },
        meta: { label: "Đăng nhập lần cuối" },
      },
      {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
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
        searchPlaceholder="Lọc người dùng..."
        searchKey="displayName"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "status", title: "Trạng thái", options: statusOptions },
          { columnId: "role", title: "Vai trò", options: roleOptions },
        ]}
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Không có kết quả phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
