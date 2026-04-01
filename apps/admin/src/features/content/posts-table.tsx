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
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { CheckCircleIcon, PencilIcon, StarIcon, Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { postListOptions, type PostListItem } from "@/features/content/queries";
import { usePosts } from "@/features/content/posts-context";
import { usePublishPost, useDeletePost } from "@/features/content/mutations";
import { resolveMediaSrc } from "@/lib/media-src";

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã ẩn", value: "ARCHIVED" },
];

const postTypeOptions = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Đã ẩn";
  return s;
}

function postTypeLabel(t: string): string {
  const map: Record<string, string> = {
    ARTICLE: "Bài viết",
    TRANSCRIPT: "Bản ghi",
    SOURCE_NOTE: "Ghi chú nguồn",
    EVENT_RECAP: "Tóm tắt sự kiện",
  };
  return map[t] ?? t;
}

function postTypeBadgeClass(t: string): string {
  if (t === "ARTICLE") return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (t === "TRANSCRIPT") return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
  if (t === "SOURCE_NOTE") return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400";
  if (t === "EVENT_RECAP") return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400";
  return "";
}

// ── Row actions ───────────────────────────────────────────────────────

function PostsRowActions({ row }: { row: PostListItem }) {
  const { setOpen, setCurrentRow } = usePosts();

  const actions = [
    {
      label: "Chỉnh sửa",
      icon: PencilIcon,
      onClick: () => {
        setCurrentRow(row);
        setOpen("edit");
      },
    },
    ...(row.status === "DRAFT"
      ? [
          {
            label: "Xuất bản",
            icon: CheckCircleIcon,
            onClick: () => {
              setCurrentRow(row);
              setOpen("publish");
            },
          },
        ]
      : []),
    {
      label: "Xoá",
      icon: Trash2Icon,
      onClick: () => {
        setCurrentRow(row);
        setOpen("delete");
      },
      variant: "destructive" as const,
      separator: true,
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ── Table component ───────────────────────────────────────────────────

export function PostsTable() {
  const { data, isLoading } = useQuery(postListOptions({ limit: 100 }));
  const posts = data?.items ?? [];

  const publishPost = usePublishPost();
  const deletePost = useDeletePost();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<PostListItem>[]>(
    () => [
      createSelectColumn<PostListItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 max-w-[320px]">
            <div className="size-9 shrink-0 overflow-hidden rounded border bg-muted">
              {row.original.featuredImageUrl ? (
                <img
                  src={resolveMediaSrc(row.original.featuredImageUrl) ?? undefined}
                  alt={row.original.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              {row.original.featured && (
                <StarIcon className="size-3.5 shrink-0 text-amber-500 fill-amber-500" />
              )}
              <span className="truncate font-medium">{row.original.title}</span>
            </div>
          </div>
        ),
        meta: { label: "Tiêu đề" },
        enableHiding: false,
      },
      {
        accessorKey: "postType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={postTypeBadgeClass(row.original.postType)}>
            {postTypeLabel(row.original.postType)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Loại" },
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
        accessorKey: "primaryCategory",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground text-sm">
            {row.original.primaryCategory?.name ?? "—"}
          </div>
        ),
        meta: { label: "Danh mục" },
        enableSorting: false,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Cập nhật" },
      },
      {
        id: "actions",
        cell: ({ row }) => <PostsRowActions row={row.original} />,
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
    getRowId: (row) => row.id,
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
        searchPlaceholder="Lọc bài viết..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "postType", title: "Loại", options: postTypeOptions },
          { columnId: "status", title: "Trạng thái", options: statusOptions },
        ]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có bài viết nào."
      />
      <DataTableBulkActions table={table} entityName="bài viết">
        <Button
          size="sm"
          variant="outline"
          disabled={publishPost.isPending}
          onClick={async () => {
            const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
            const drafts = selected.filter((r) => r.status === "DRAFT");
            if (!drafts.length) return;
            await Promise.all(drafts.map((r) => publishPost.mutateAsync(r.id)));
            table.resetRowSelection();
          }}
        >
          <CheckCircleIcon className="mr-1.5 size-3.5" />
          Xuất bản
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={deletePost.isPending}
          onClick={async () => {
            const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
            if (!selected.length) return;
            await Promise.all(selected.map((r) => deletePost.mutateAsync(r.id)));
            table.resetRowSelection();
          }}
        >
          <Trash2Icon className="mr-1.5 size-3.5" />
          Xoá
        </Button>
      </DataTableBulkActions>
    </div>
  );
}
