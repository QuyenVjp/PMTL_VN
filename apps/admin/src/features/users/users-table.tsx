import { useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { ShieldCheckIcon, UserXIcon, UserCheckIcon, LogOutIcon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceDataTable } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { DataTableRowActions } from "@/features/users/data-table-row-actions";
import { userListOptions } from "@/features/users/queries";
import { useBlockUser, useUnblockUser, useRevokeAllSessions } from "@/features/users/mutations";
import { resolveMediaSrc } from "@/lib/media-src";
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
  const navigate = useNavigate();
  const { data: envelope, isLoading } = useQuery(userListOptions({ limit: 100 }));
  const users = envelope?.data ?? [];

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const revokeSessions = useRevokeAllSessions();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(
    () => [
      createSelectColumn<AdminUserListItem>(),
      {
        accessorKey: "displayName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-xl">
              <AvatarImage src={resolveMediaSrc(row.original.avatarUrl) ?? undefined} alt={row.original.displayName} />
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

  const table = useSafeReactTable({
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

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const handleBulkBlock = async () => {
    if (!selectedRows.length) return;
    const activeUsers = selectedRows.filter((u) => u.status === "ACTIVE");
    if (!activeUsers.length) return;
    await Promise.all(activeUsers.map((u) => blockUser.mutateAsync({ publicId: u.publicId })));
    table.resetRowSelection();
  };

  const handleBulkUnblock = async () => {
    if (!selectedRows.length) return;
    const suspendedUsers = selectedRows.filter((u) => u.status === "SUSPENDED");
    if (!suspendedUsers.length) return;
    await Promise.all(suspendedUsers.map((u) => unblockUser.mutateAsync({ publicId: u.publicId })));
    table.resetRowSelection();
  };

  const handleBulkRevokeAllSessions = async () => {
    if (!selectedRows.length) return;
    await Promise.all(selectedRows.map((u) => revokeSessions.mutateAsync({ publicId: u.publicId })));
    table.resetRowSelection();
  };

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

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Không có kết quả phù hợp."
        onRowClick={(row) => { void navigate({ to: "/nguoi-dung/$publicId", params: { publicId: row.publicId } }); }}
      />
      <DataTableBulkActions table={table} entityName="người dùng">
        <Button
          size="sm"
          variant="outline"
          disabled={blockUser.isPending}
          onClick={() => void handleBulkBlock()}
        >
          <UserXIcon className="mr-1.5 size-3.5" />
          Khóa đã chọn
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={unblockUser.isPending}
          onClick={() => void handleBulkUnblock()}
        >
          <UserCheckIcon className="mr-1.5 size-3.5" />
          Mở khóa đã chọn
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={revokeSessions.isPending}
          onClick={() => void handleBulkRevokeAllSessions()}
        >
          <LogOutIcon className="mr-1.5 size-3.5" />
          Thu hồi phiên đã chọn
        </Button>
      </DataTableBulkActions>
    </div>
  );
}

