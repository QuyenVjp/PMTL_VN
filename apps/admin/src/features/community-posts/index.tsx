import React, { createContext, useContext, useMemo, useState } from "react";
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
import { CheckCircleIcon, EyeOffIcon, EyeIcon, PinIcon, Trash2Icon, XCircleIcon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import {
  communityPostListOptions,
  type CommunityPostItem,
} from "@/features/community-posts/queries";
import {
  useDeleteCommunityPost,
  useUpdateCommunityPostStatus,
  useHidePost,
  useRestorePost,
  usePinPost,
  useUnpinPost,
} from "@/features/community-posts/mutations";

// ── Context ──────────────────────────────────────────────────────────

type CommunityDialogType = "approve" | "reject" | "hide" | "restore" | "pin" | "unpin" | "delete" | null;

type CommunityContextValue = {
  open: CommunityDialogType;
  currentRow: CommunityPostItem | null;
  setOpen: (value: CommunityDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<CommunityPostItem | null>>;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CommunityDialogType>(null);
  const [currentRow, setCurrentRow] = useState<CommunityPostItem | null>(null);
  return (
    <CommunityContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </CommunityContext.Provider>
  );
}

function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đã ẩn", value: "HIDDEN" },
];

function statusBadgeClass(s: string): string {
  if (s === "APPROVED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "PENDING")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "REJECTED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  if (s === "HIDDEN")
    return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "PENDING") return "Chờ duyệt";
  if (s === "APPROVED") return "Đã duyệt";
  if (s === "REJECTED") return "Từ chối";
  if (s === "HIDDEN") return "Đã ẩn";
  return s;
}

// ── Row actions ───────────────────────────────────────────────────────

function CommunityRowActions({ row }: { row: CommunityPostItem }) {
  const { setOpen, setCurrentRow } = useCommunity();
  const navigate = useNavigate();

  const open = (dialog: CommunityDialogType) => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          onClick: () => { void navigate({ to: "/cong-dong/bai-dang/$publicId", params: { publicId: row.publicId } }); },
        },
        ...(row.status !== "APPROVED"
          ? [{ label: "Duyệt", icon: CheckCircleIcon, onClick: () => open("approve") }]
          : []),
        ...(row.status === "APPROVED" && !row.isHidden
          ? [{ label: "Ẩn", icon: EyeOffIcon, onClick: () => open("hide") }]
          : []),
        ...(row.isHidden
          ? [{ label: "Khôi phục", icon: EyeIcon, onClick: () => open("restore") }]
          : []),
        ...(!row.isPinned
          ? [{ label: "Ghim", icon: PinIcon, onClick: () => open("pin") }]
          : [{ label: "Bỏ ghim", icon: PinIcon, onClick: () => open("unpin") }]),
        ...(row.status !== "REJECTED"
          ? [
              {
                label: "Từ chối",
                icon: XCircleIcon,
                onClick: () => open("reject"),
                variant: "destructive" as const,
                separator: true,
              },
            ]
          : []),
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => open("delete"),
          variant: "destructive" as const,
          separator: row.status === "REJECTED",
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function CommunityPostsTable() {
  const { data: envelope, isLoading } = useQuery(communityPostListOptions({ limit: 100 }));
  const posts = envelope?.items ?? [];
  const navigate = useNavigate();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<CommunityPostItem>[]>(
    () => [
      createSelectColumn<CommunityPostItem>(),
      {
        accessorKey: "content",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
        cell: ({ row }) => (
          <div className="max-w-[320px] truncate text-sm">{row.original.content}</div>
        ),
        meta: { label: "Nội dung" },
        enableHiding: false,
        enableSorting: false,
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
        accessorKey: "author",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tác giả" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.author.displayName}</div>
        ),
        meta: { label: "Tác giả" },
        enableSorting: false,
      },
      {
        accessorKey: "heartCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tim" />,
        cell: ({ row }) => (
          <div className="tabular-nums text-muted-foreground">{row.original.heartCount}</div>
        ),
        meta: { label: "Tim" },
      },
      {
        accessorKey: "commentCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bình luận" />,
        cell: ({ row }) => (
          <div className="tabular-nums text-muted-foreground">{row.original.commentCount}</div>
        ),
        meta: { label: "Bình luận" },
      },
      {
        accessorKey: "reportCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Báo cáo" />,
        cell: ({ row }) => (
          <div className={row.original.reportCount > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
            {row.original.reportCount}
          </div>
        ),
        meta: { label: "Báo cáo" },
      },
      {
        accessorKey: "isPinned",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ghim" />,
        cell: ({ row }) =>
          row.original.isPinned ? (
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400">
              Đã ghim
            </Badge>
          ) : null,
        meta: { label: "Ghim" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đăng" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày đăng" },
      },
      {
        id: "actions",
        cell: ({ row }) => <CommunityRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: posts,
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
        searchPlaceholder="Lọc bài đăng..."
        viewButtonLabel="Xem"
        filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có bài đăng nào."
        onRowClick={(row) => { void navigate({ to: "/cong-dong/bai-dang/$publicId", params: { publicId: row.publicId } }); }}
      />
      <DataTableBulkActions table={table} entityName="bài đăng" />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function CommunityDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCommunity();
  const updateStatus = useUpdateCommunityPostStatus();
  const deletePost = useDeleteCommunityPost();
  const hidePost = useHidePost();
  const restorePost = useRestorePost();
  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  if (!currentRow) return null;

  return (
    <>
      <WorkspaceConfirmDialog
        open={open === "approve"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("approve"))}
        title="Duyệt bài đăng"
        description="Bài đăng sẽ hiển thị công khai trong cộng đồng."
        confirmLabel="Duyệt"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          updateStatus.mutate(
            { publicId: currentRow.publicId, status: "APPROVED" },
            { onSuccess: handleClose },
          )
        }
      />
      <WorkspaceConfirmDialog
        open={open === "hide"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("hide"))}
        title="Ẩn bài đăng"
        description="Bài đăng sẽ bị ẩn khỏi cộng đồng nhưng không bị xoá."
        confirmLabel="Ẩn"
        isPending={hidePost.isPending}
        onConfirm={() => hidePost.mutate(currentRow.publicId, { onSuccess: handleClose })}
      />
      <WorkspaceConfirmDialog
        open={open === "restore"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("restore"))}
        title="Khôi phục bài đăng"
        description="Bài đăng sẽ hiển thị trở lại trong cộng đồng."
        confirmLabel="Khôi phục"
        isPending={restorePost.isPending}
        onConfirm={() => restorePost.mutate(currentRow.publicId, { onSuccess: handleClose })}
      />
      <WorkspaceConfirmDialog
        open={open === "pin"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("pin"))}
        title="Ghim bài đăng"
        description="Bài đăng sẽ được hiển thị ở vị trí ưu tiên đầu danh sách."
        confirmLabel="Ghim"
        isPending={pinPost.isPending}
        onConfirm={() => pinPost.mutate(currentRow.publicId, { onSuccess: handleClose })}
      />
      <WorkspaceConfirmDialog
        open={open === "unpin"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("unpin"))}
        title="Bỏ ghim bài đăng"
        description="Bài đăng sẽ không còn được ưu tiên hiển thị."
        confirmLabel="Bỏ ghim"
        isPending={unpinPost.isPending}
        onConfirm={() => unpinPost.mutate(currentRow.publicId, { onSuccess: handleClose })}
      />
      <WorkspaceConfirmDialog
        open={open === "reject"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("reject"))}
        title="Từ chối bài đăng"
        description="Bài đăng sẽ bị từ chối và không hiển thị công khai."
        confirmLabel="Từ chối"
        variant="destructive"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          updateStatus.mutate(
            { publicId: currentRow.publicId, status: "REJECTED" },
            { onSuccess: handleClose },
          )
        }
      />
      <WorkspaceConfirmDialog
        open={open === "delete"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
        title="Xoá bài đăng"
        description={
          <>
            Xoá bài đăng của{" "}
            <span className="font-semibold text-foreground">{currentRow.author.displayName}</span>?
            Hành động này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deletePost.isPending}
        onConfirm={() => deletePost.mutate(currentRow.publicId, { onSuccess: handleClose })}
      />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function CommunityPostsPage() {
  return (
    <CommunityProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài đăng cộng đồng</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kiểm duyệt và quản lý bài đăng từ thành viên cộng đồng.
          </p>
        </div>

        <CommunityPostsTable />
      </div>

      <CommunityDialogs />
    </CommunityProvider>
  );
}



