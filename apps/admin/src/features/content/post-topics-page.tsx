import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Edit3Icon, PlusIcon, TagsIcon, Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import {
  useCreatePostTopic,
  useDeletePostTopic,
  useUpdatePostTopic,
} from "@/features/content/mutations";
import { PostTopicSelect, topicDisplayName } from "@/features/content/post-topic-select";
import { postTopicListOptions, type PostTopic } from "@/features/content/queries";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { createSelectColumn } from "@/lib/table/select-column";

interface TopicFormState {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  sortOrder: string;
}

const emptyForm: TopicFormState = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  sortOrder: "0",
};

const levelOptions = [
  { label: "Chủ đề gốc", value: "0" },
  { label: "Cấp 2", value: "1" },
  { label: "Cấp 3", value: "2" },
  { label: "Cấp sâu", value: "3" },
];

function levelLabel(level: number) {
  if (level === 0) return "Chủ đề gốc";
  if (level === 1) return "Cấp 2";
  if (level === 2) return "Cấp 3";
  return `Cấp ${level + 1}`;
}

function levelBadgeClass(level: number) {
  if (level === 0) return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (level === 1) return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (level === 2) return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
}

function canDeleteTopic(topic: PostTopic) {
  return topic.postCount === 0 && topic.children.length === 0;
}

function TopicDialog({
  open,
  onOpenChange,
  topics,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: PostTopic[];
  current: PostTopic | null;
}) {
  const createTopic = useCreatePostTopic();
  const updateTopic = useUpdatePostTopic();
  const [form, setForm] = useState<TopicFormState>(() => current ? {
    name: current.name,
    slug: current.slug,
    description: current.description ?? "",
    parentId: current.parentId ?? "",
    sortOrder: String(current.sortOrder),
  } : emptyForm);

  const parentOptions = useMemo(
    () => topics.filter((topic) => topic.id !== current?.id),
    [current?.id, topics],
  );

  const submit = () => {
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || null,
      parentId: form.parentId || null,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    };

    if (current) {
      updateTopic.mutate(
        { publicId: current.id, ...payload },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    createTopic.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  const pending = createTopic.isPending || updateTopic.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{current ? "Sửa chủ đề" : "Tạo chủ đề"}</DialogTitle>
          <DialogDescription>
            Chủ đề phân cấp cha/con giúp mỗi bài khai thị nằm đúng nhánh tra cứu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tên chủ đề *</span>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="VD: Niệm Kinh"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Slug</span>
            <Input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="Để trống để tự sinh"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Chủ đề cha</span>
            <PostTopicSelect
              topics={parentOptions}
              value={form.parentId}
              onChange={(value) => setForm((prev) => ({ ...prev, parentId: value }))}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Thứ tự</span>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Mô tả</span>
            <Textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Ghi chú ngắn cho người quản trị..."
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Hủy
          </Button>
          <Button onClick={submit} disabled={pending || !form.name.trim()}>
            {pending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TopicRowActions({
  topic,
  onEdit,
  onDelete,
}: {
  topic: PostTopic;
  onEdit: (topic: PostTopic) => void;
  onDelete: (topic: PostTopic) => void;
}) {
  const actions = [
    {
      label: "Sửa chủ đề",
      icon: Edit3Icon,
      onClick: () => onEdit(topic),
    },
    ...(canDeleteTopic(topic)
      ? [
          {
            label: "Xóa",
            icon: Trash2Icon,
            onClick: () => onDelete(topic),
            variant: "destructive" as const,
            separator: true,
          },
        ]
      : []),
  ];

  return <WorkspaceRowActions actions={actions} />;
}

export function PostTopicsPage() {
  const { data, isLoading } = useQuery(postTopicListOptions());
  const topics = data?.items ?? [];
  const [editing, setEditing] = useState<PostTopic | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<PostTopic | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const deleteTopic = useDeletePostTopic();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (topic: PostTopic) => {
    setEditing(topic);
    setDialogOpen(true);
  };

  const requestDelete = (topic: PostTopic) => {
    if (!canDeleteTopic(topic)) return;
    setDeleting(topic);
  };

  const columns = useMemo<ColumnDef<PostTopic>[]>(
    () => [
      createSelectColumn<PostTopic>(),
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chủ đề" />,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded border bg-muted text-muted-foreground">
              <TagsIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{topicDisplayName(row.original)}</div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.parentName ?? "Chủ đề gốc"}
              </div>
            </div>
          </div>
        ),
        meta: { label: "Chủ đề" },
        enableHiding: false,
      },
      {
        id: "level",
        accessorFn: (row) => String(Math.min(row.level, 3)),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cấp" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={levelBadgeClass(row.original.level)}>
            {levelLabel(row.original.level)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Cấp" },
        enableSorting: false,
      },
      {
        accessorKey: "slug",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
        cell: ({ row }) => (
          <div className="max-w-[280px] truncate font-mono text-xs text-muted-foreground">
            {row.original.slug}
          </div>
        ),
        meta: { label: "Slug" },
      },
      {
        accessorKey: "postCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bài viết" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.postCount}</div>
        ),
        meta: { label: "Bài viết" },
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
        cell: ({ row }) => (
          <TopicRowActions
            topic={row.original}
            onEdit={openEdit}
            onDelete={requestDelete}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: topics,
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
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chủ đề bài viết</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản lý phân cấp chủ đề để gắn bài khai thị vào đúng nhánh tra cứu.
            </p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 size-4" />
            Tạo chủ đề
          </Button>
        </div>

        <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
          <DataTableToolbar
            table={table}
            searchPlaceholder="Lọc chủ đề..."
            searchKey="name"
            viewButtonLabel="Xem"
            filters={[
              { columnId: "level", title: "Cấp", options: levelOptions },
            ]}
          />

          <WorkspaceDataTable
            table={table}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Chưa có chủ đề nào."
            onRowClick={openEdit}
          />

          <DataTableBulkActions table={table} entityName="chủ đề">
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteTopic.isPending}
              onClick={() => {
                const selected = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
                const deletable = selected.filter(canDeleteTopic);
                if (!deletable.length) return;
                void Promise.all(deletable.map((topic) => deleteTopic.mutateAsync(topic.id))).then(() => {
                  table.resetRowSelection();
                });
              }}
            >
              <Trash2Icon className="mr-1.5 size-3.5" />
              Xóa chủ đề trống
            </Button>
          </DataTableBulkActions>
        </div>
      </div>

      {dialogOpen && (
        <TopicDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          topics={topics}
          current={editing}
        />
      )}

      <WorkspaceConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Xóa chủ đề"
        description={
          <>
            Xóa <span className="font-semibold text-foreground">{deleting?.name}</span>?
            Chỉ xóa được chủ đề chưa có bài viết và chưa có chủ đề con.
          </>
        }
        confirmLabel="Xóa"
        variant="destructive"
        isPending={deleteTopic.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteTopic.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </>
  );
}
