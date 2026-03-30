import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  FileImageIcon,
  FolderOpenIcon,
  ImageIcon,
  ListIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceConfirmDialog, WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";

import {
  collectionsListOptions,
  collectionItemsOptions,
  type CollectionListItem,
  type CollectionType,
} from "./queries.js";
import {
  useCreateCollection,
  useUpdateCollection,
  usePublishCollection,
  useUnpublishCollection,
  useDeleteCollection,
  useAddCollectionItem,
  useRemoveCollectionItem,
} from "./mutations.js";
import { mediaListOptions } from "@/features/media/queries.js";

// ── Context ────────────────────────────────────────────────────────────

type MLDialogType = "create" | "edit" | "delete" | "publish" | "unpublish" | "items" | null;

interface MLContextValue {
  open:         MLDialogType;
  currentRow:   CollectionListItem | null;
  setOpen:      (v: MLDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<CollectionListItem | null>>;
}

const MLContext = createContext<MLContextValue | null>(null);

function MLProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen]               = useState<MLDialogType>(null);
  const [currentRow, setCurrentRow]   = useState<CollectionListItem | null>(null);
  return (
    <MLContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </MLContext.Provider>
  );
}

function useML() {
  const ctx = useContext(MLContext);
  if (!ctx) throw new Error("useML must be used inside MLProvider");
  return ctx;
}

// ── Helpers ────────────────────────────────────────────────────────────

const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  PHOTO_ALBUM:            "Album ảnh",
  VIDEO_PLAYLIST:         "Playlist video",
  MIXED_GALLERY:          "Gallery tổng hợp",
  FEATURED_STORY_GALLERY: "Gallery nổi bật",
};

const COLLECTION_TYPE_ICONS: Record<CollectionType, React.ElementType> = {
  PHOTO_ALBUM:            ImageIcon,
  VIDEO_PLAYLIST:         VideoIcon,
  MIXED_GALLERY:          FolderOpenIcon,
  FEATURED_STORY_GALLERY: ListIcon,
};

function statusBadgeClass(s: string) {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function statusLabel(s: string) {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT")     return "Nháp";
  if (s === "ARCHIVED")  return "Đã ẩn";
  return s;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Row actions ────────────────────────────────────────────────────────

function CollectionRowActions({ row }: { row: CollectionListItem }) {
  const { setOpen, setCurrentRow } = useML();

  const actions = [
    {
      label: "Quản lý items",
      icon:  ListIcon,
      onClick: () => { setCurrentRow(row); setOpen("items"); },
    },
    {
      label: "Chỉnh sửa",
      icon:  FileImageIcon,
      onClick: () => { setCurrentRow(row); setOpen("edit"); },
    },
    row.status === "DRAFT"
      ? {
          label: "Xuất bản",
          icon:  UploadIcon,
          onClick: () => { setCurrentRow(row); setOpen("publish"); },
        }
      : {
          label: "Gỡ xuất bản",
          icon:  UploadIcon,
          onClick: () => { setCurrentRow(row); setOpen("unpublish"); },
        },
    {
      label:   "Xoá",
      icon:    Trash2Icon,
      onClick: () => { setCurrentRow(row); setOpen("delete"); },
      variant: "destructive" as const,
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ── Collections table ──────────────────────────────────────────────────

const collectionTypeOptions = Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp",        value: "DRAFT" },
  { label: "Đã ẩn",       value: "ARCHIVED" },
];

function CollectionsTable() {
  const { data: envelope, isLoading } = useQuery(collectionsListOptions({ limit: 100 }));
  const collections = envelope?.data ?? [];

  const [sorting,          setSorting]          = useState<SortingState>([]);
  const [rowSelection,     setRowSelection]     = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<CollectionListItem>[]>(
    () => [
      createSelectColumn<CollectionListItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => {
          const { collectionType, title, coverImageUrl, slug } = row.original;
          const Icon = COLLECTION_TYPE_ICONS[collectionType];
          return (
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 overflow-hidden rounded border border-border bg-muted flex items-center justify-center">
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt={title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Icon className="size-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="max-w-[220px] truncate font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">/{slug}</div>
              </div>
            </div>
          );
        },
        meta:          { label: "Tiêu đề" },
        enableHiding:  false,
      },
      {
        accessorKey: "collectionType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-nowrap">
            {COLLECTION_TYPE_LABELS[row.original.collectionType]}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta:         { label: "Loại" },
        enableSorting: false,
      },
      {
        accessorKey: "itemCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số items" />,
        cell: ({ row }) => (
          <div className="tabular-nums text-center">{row.original.itemCount}</div>
        ),
        meta: { label: "Số items" },
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
        meta:         { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "featured",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nổi bật" />,
        cell: ({ row }) =>
          row.original.featured ? (
            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-400">
              Nổi bật
            </Badge>
          ) : null,
        meta:         { label: "Nổi bật" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tạo" },
      },
      {
        id:            "actions",
        cell:          ({ row }) => <CollectionRowActions row={row.original} />,
        enableSorting: false,
        enableHiding:  false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data:    collections,
    columns,
    state:   { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection:       true,
    onSortingChange:          setSorting,
    onRowSelectionChange:     setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel:          getCoreRowModel(),
    getFilteredRowModel:      getFilteredRowModel(),
    getSortedRowModel:        getSortedRowModel(),
    getPaginationRowModel:    getPaginationRowModel(),
    getFacetedRowModel:       getFacetedRowModel(),
    getFacetedUniqueValues:   getFacetedUniqueValues(),
  });

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc theo tiêu đề..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "collectionType", title: "Loại",        options: collectionTypeOptions },
          { columnId: "status",         title: "Trạng thái",  options: statusOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có collection nào. Nhấn 'Tạo collection' để bắt đầu."
      />
      <DataTableBulkActions table={table} entityName="collection" />
    </div>
  );
}

// ── Shared field helper ────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Create dialog ──────────────────────────────────────────────────────

function CreateCollectionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const create = useCreateCollection();
  const [title,          setTitle]          = useState("");
  const [slug,           setSlug]           = useState("");
  const [collectionType, setCollectionType] = useState<CollectionType>("PHOTO_ALBUM");
  const [description,    setDescription]    = useState("");
  const [featured,       setFeatured]       = useState(false);

  const slugEdited = useRef(false);

  function reset() {
    setTitle(""); setSlug(""); setCollectionType("PHOTO_ALBUM");
    setDescription(""); setFeatured(false);
    slugEdited.current = false;
  }

  useEffect(() => {
    if (!open) return;
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugEdited.current) setSlug(slugify(v));
  }

  function handleSubmit() {
    if (!title.trim() || !slug.trim()) {
      toast.error("Tiêu đề và slug không được để trống.");
      return;
    }
    create.mutate(
      { title: title.trim(), slug: slug.trim(), collectionType, description: description.trim() || undefined, featured },
      { onSuccess: () => { reset(); onOpenChange(false); } },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Tạo collection mới</DialogTitle>
          <DialogDescription>Điền thông tin để tạo album/playlist cho thư viện pháp môn.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Ảnh pháp hội 2026..." />
          </Field>
          <Field label="Slug (URL)">
            <Input
              value={slug}
              onChange={(e) => { slugEdited.current = true; setSlug(e.target.value); }}
              placeholder="anh-phap-hoi-2026"
              className="font-mono text-sm"
            />
          </Field>
          <Field label="Loại collection">
            <Select value={collectionType} onValueChange={(v) => setCollectionType(v as CollectionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mô tả">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn..." rows={2} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border"
            />
            Đánh dấu nổi bật
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || !title.trim() || !slug.trim()}>
            {create.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ────────────────────────────────────────────────────────

function EditCollectionDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: CollectionListItem;
}) {
  const update = useUpdateCollection();
  const [title,       setTitle]       = useState(currentRow.title);
  const [slug,        setSlug]        = useState(currentRow.slug);
  const [description, setDescription] = useState(currentRow.description ?? "");
  const [sourceNote,  setSourceNote]  = useState(currentRow.sourceNote ?? "");
  const [featured,    setFeatured]    = useState(currentRow.featured);

  useEffect(() => {
    if (!open) return;
    setTitle(currentRow.title);
    setSlug(currentRow.slug);
    setDescription(currentRow.description ?? "");
    setSourceNote(currentRow.sourceNote ?? "");
    setFeatured(currentRow.featured);
  }, [currentRow, open]);

  function handleSubmit() {
    if (!title.trim()) { toast.error("Tiêu đề không được để trống."); return; }
    update.mutate(
      {
        publicId:    currentRow.publicId,
        title:       title.trim(),
        slug:        slug.trim() || undefined,
        description: description.trim() || null,
        sourceNote:  sourceNote.trim() || null,
        featured,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa collection</DialogTitle>
          <DialogDescription>Cập nhật thông tin collection.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
          </Field>
          <Field label="Mô tả">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn..." />
          </Field>
          <Field label="Ghi chú nguồn">
            <Textarea value={sourceNote} onChange={(e) => setSourceNote(e.target.value)} rows={2} placeholder="Nguồn / provenance..." />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border" />
            Đánh dấu nổi bật
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending || !title.trim()}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Items management sheet ─────────────────────────────────────────────

function CollectionItemsSheet({
  open,
  onOpenChange,
  collection,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  collection: CollectionListItem;
}) {
  const { data: itemsEnvelope, isLoading: itemsLoading } = useQuery(
    collectionItemsOptions(collection.publicId),
  );
  const items = itemsEnvelope?.data ?? [];

  const { data: assetsEnvelope } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = assetsEnvelope?.data ?? [];
  const imageAssets = assets.filter((a) => a.mimeType.startsWith("image/"));

  const addItem    = useAddCollectionItem(collection.publicId);
  const removeItem = useRemoveCollectionItem(collection.publicId);

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [externalUrl,     setExternalUrl]     = useState("");
  const [addMode,         setAddMode]         = useState<"asset" | "embed">("asset");

  function handleAdd() {
    if (addMode === "asset") {
      if (!selectedAssetId) { toast.error("Chọn ảnh để thêm."); return; }
      addItem.mutate({ itemType: "IMAGE", mediaAssetPublicId: selectedAssetId });
      setSelectedAssetId("");
    } else {
      if (!externalUrl.trim()) { toast.error("Nhập URL video để thêm."); return; }
      addItem.mutate({ itemType: "VIDEO_EMBED", externalUrl: externalUrl.trim() });
      setExternalUrl("");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Items — {collection.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Add item panel */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Thêm item mới</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={addMode === "asset" ? "default" : "outline"}
                onClick={() => setAddMode("asset")}
              >
                <ImageIcon className="mr-1.5 size-3.5" /> Ảnh
              </Button>
              <Button
                size="sm"
                variant={addMode === "embed" ? "default" : "outline"}
                onClick={() => setAddMode("embed")}
              >
                <VideoIcon className="mr-1.5 size-3.5" /> Video embed
              </Button>
            </div>

            {addMode === "asset" ? (
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Chọn ảnh từ Media Assets..." />
                </SelectTrigger>
                <SelectContent>
                  {imageAssets.map((a) => (
                    <SelectItem key={a.publicId} value={a.publicId}>
                      <span className="flex items-center gap-2">
                        <img
                          src={`/api/admin/media/${a.publicId}/content`}
                          className="size-5 rounded object-cover"
                          loading="lazy"
                          alt=""
                        />
                        <span className="truncate max-w-[260px]">{a.filename}</span>
                        <span className="text-muted-foreground shrink-0">{formatFileSize(a.size)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="text-sm"
              />
            )}

            <Button size="sm" onClick={handleAdd} disabled={addItem.isPending} className="w-full">
              <PlusIcon className="mr-1.5 size-3.5" />
              {addItem.isPending ? "Đang thêm..." : "Thêm vào collection"}
            </Button>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{items.length} items</p>

            {itemsLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Chưa có item nào. Thêm ảnh hoặc video embed bên trên.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.publicId}
                    className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                  >
                    <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted flex items-center justify-center">
                      {item.mediaAssetPublicId ? (
                        <img
                          src={`/api/admin/media/${item.mediaAssetPublicId}/content`}
                          className="size-full object-cover"
                          loading="lazy"
                          alt=""
                        />
                      ) : (
                        <VideoIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {item.mediaAssetFilename ?? item.externalUrl ?? item.itemType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.mediaAssetMimeType ?? item.itemType}
                        {item.mediaAssetSize ? ` · ${formatFileSize(item.mediaAssetSize)}` : ""}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.publicId)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Dialogs switcher ───────────────────────────────────────────────────

function MediaLibraryDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useML();
  const publishCollection   = usePublishCollection();
  const unpublishCollection = useUnpublishCollection();
  const deleteCollection    = useDeleteCollection();

  function handleClose() { setOpen(null); setCurrentRow(null); }

  return (
    <>
      <CreateCollectionDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />

      {currentRow && (
        <>
          <EditCollectionDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />

          <CollectionItemsSheet
            open={open === "items"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("items"))}
            collection={currentRow}
          />

          <WorkspaceConfirmDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            title="Xuất bản collection"
            description={
              <>
                Xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Collection sẽ hiển thị công khai ngay lập tức.
              </>
            }
            confirmLabel="Xuất bản"
            isPending={publishCollection.isPending}
            onConfirm={() => publishCollection.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />

          <WorkspaceConfirmDialog
            open={open === "unpublish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("unpublish"))}
            title="Gỡ xuất bản collection"
            description={
              <>
                Gỡ xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Collection sẽ không còn hiển thị công khai.
              </>
            }
            confirmLabel="Gỡ xuất bản"
            isPending={unpublishCollection.isPending}
            onConfirm={() => unpublishCollection.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />

          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá collection"
            description={
              <>
                Xoá <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Tất cả items trong collection cũng sẽ bị xoá. Thao tác này không thể hoàn tác.
              </>
            }
            confirmLabel="Xoá"
            variant="destructive"
            isPending={deleteCollection.isPending}
            onConfirm={() => deleteCollection.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />
        </>
      )}
    </>
  );
}

// ── Page header ────────────────────────────────────────────────────────

function MediaLibraryHeader() {
  const { setOpen } = useML();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thư viện pháp môn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý album ảnh, playlist video và gallery nội dung pháp môn.
        </p>
      </div>
      <Button onClick={() => setOpen("create")}>
        <PlusIcon className="mr-2 size-4" />
        Tạo collection
      </Button>
    </div>
  );
}

// ── Page export ────────────────────────────────────────────────────────

export function MediaLibraryPage() {
  return (
    <MLProvider>
      <div className="space-y-6">
        <MediaLibraryHeader />
        <CollectionsTable />
      </div>
      <MediaLibraryDialogs />
    </MLProvider>
  );
}
