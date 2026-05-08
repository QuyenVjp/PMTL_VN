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
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { z } from "zod";
import {
  CheckCircle2Icon,
  FolderOpenIcon,
  ImageIcon,
  ListIcon,
  LoaderCircleIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XCircleIcon,
} from "lucide-react";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  if (status === "taken") return <XCircleIcon className="size-4 text-destructive" />;
  return null;
}
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/ui/field-error";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation.js";
import { handleApiError } from "@/lib/handle-api-error.js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import {
  AdminDetailField,
  AdminDetailPage,
  AdminDetailSection,
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRouteSkeleton,
  WorkspaceRowActions,
} from "@/components/workspace";
import { MediaMultiPickerField, MediaPickerField } from "@/components/media/media-picker-modal";
import { PreviewableImage } from "@/components/media/image-preview-dialog";
import { createSelectColumn } from "@/lib/table/select-column";

import {
  collectionsListOptions,
  collectionDetailOptions,
  collectionItemsOptions,
  type CollectionListItem,
  type CollectionType,
  type CollectionItem,
} from "./queries.js";
import {
  addCollectionItem,
  useCreateCollection,
  useUpdateCollection,
  usePublishCollection,
  useUnpublishCollection,
  useDeleteCollection,
  useAddCollectionItem,
  useRemoveCollectionItem,
} from "./mutations.js";
import { type MediaAssetListItem } from "@/features/media/queries.js";

// ── Context ────────────────────────────────────────────────────────────

type MLDialogType = "delete" | "publish" | "unpublish" | null;

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

const collectionFormSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  collectionType: z.enum(["PHOTO_ALBUM", "VIDEO_PLAYLIST", "MIXED_GALLERY", "FEATURED_STORY_GALLERY"]),
  description: z.string().trim().optional(),
  sourceNote: z.string().trim().optional(),
});

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


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function itemTypeForAsset(asset: MediaAssetListItem): "IMAGE" | "UPLOADED_VIDEO" {
  return asset.mimeType.startsWith("video/") ? "UPLOADED_VIDEO" : "IMAGE";
}

function fallbackItemTypeForCollection(collectionType: CollectionType): "IMAGE" | "UPLOADED_VIDEO" {
  return collectionType === "VIDEO_PLAYLIST" ? "UPLOADED_VIDEO" : "IMAGE";
}

// ── Row actions ────────────────────────────────────────────────────────

function CollectionRowActions({ row }: { row: CollectionListItem }) {
  const { setOpen, setCurrentRow } = useML();
  const navigate = useNavigate();

  const actions = [
    {
      label: "Xem chi tiết",
      icon:  ListIcon,
      onClick: () => { void navigate({ to: "/noi-dung/thu-vien-phap-mon/$publicId", params: { publicId: row.publicId } }); },
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
      separator: true,
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
  const navigate = useNavigate();
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
                  <PreviewableImage
                    src={coverImageUrl}
                    alt={title}
                    title={title}
                    className="size-full rounded-none border-0"
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
        emptyMessage="Chưa có bộ sưu tập nào. Nhấn 'Tạo bộ sưu tập' để bắt đầu."
        onRowClick={(row) => {
          void navigate({ to: "/noi-dung/thu-vien-phap-mon/$publicId", params: { publicId: row.publicId } });
        }}
      />
      <DataTableBulkActions table={table} entityName="bộ sưu tập" />
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

// ── Dialogs switcher ───────────────────────────────────────────────────

function MediaLibraryDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useML();
  const publishCollection   = usePublishCollection();
  const unpublishCollection = useUnpublishCollection();
  const deleteCollection    = useDeleteCollection();

  function handleClose() { setOpen(null); setCurrentRow(null); }

  return (
    <>
      {currentRow && (
        <>
          <WorkspaceConfirmDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            title="Xuất bản bộ sưu tập"
            description={
              <>
                Xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Bộ sưu tập sẽ hiển thị công khai ngay lập tức.
              </>
            }
            confirmLabel="Xuất bản"
            isPending={publishCollection.isPending}
            onConfirm={() => publishCollection.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />

          <WorkspaceConfirmDialog
            open={open === "unpublish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("unpublish"))}
            title="Gỡ xuất bản bộ sưu tập"
            description={
              <>
                Gỡ xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Bộ sưu tập sẽ không còn hiển thị công khai.
              </>
            }
            confirmLabel="Gỡ xuất bản"
            isPending={unpublishCollection.isPending}
            onConfirm={() => unpublishCollection.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />

          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá bộ sưu tập"
            description={
              <>
                Xoá <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Tất cả nội dung trong bộ sưu tập cũng sẽ bị xoá. Thao tác này không thể hoàn tác.
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

function CollectionItemsPanel({ collection }: { collection: CollectionListItem }) {
  const { data: itemsEnvelope, isLoading: itemsLoading } = useQuery(collectionItemsOptions(collection.publicId));
  const items = itemsEnvelope?.data ?? [];

  const addItem = useAddCollectionItem(collection.publicId);
  const removeItem = useRemoveCollectionItem(collection.publicId);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetListItem | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [addMode, setAddMode] = useState<"asset" | "embed">("asset");
  const [itemToRemove, setItemToRemove] = useState<CollectionItem | null>(null);

  function handleAdd() {
    if (addMode === "asset") {
      if (!selectedAssetId) {
        toast.error(collection.collectionType === "VIDEO_PLAYLIST" ? "Chọn video để thêm." : "Chọn ảnh để thêm.");
        return;
      }
      addItem.mutate(
        {
          itemType: selectedAsset ? itemTypeForAsset(selectedAsset) : fallbackItemTypeForCollection(collection.collectionType),
          mediaAssetPublicId: selectedAssetId,
        },
        {
          onSuccess: () => {
            setSelectedAssetId("");
            setSelectedAsset(null);
          },
        },
      );
      return;
    }

    if (!externalUrl.trim()) {
      toast.error("Nhập URL video để thêm.");
      return;
    }
    addItem.mutate({ itemType: "VIDEO_EMBED", externalUrl: externalUrl.trim() }, { onSuccess: () => setExternalUrl("") });
  }

  return (
    <AdminDetailSection title="Nội dung bộ sưu tập" description="Thêm, kiểm tra và gỡ item trong bộ sưu tập.">
      <div className="space-y-5">
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">Thêm item mới</p>
            <div className="flex gap-2">
              <Button size="sm" variant={addMode === "asset" ? "default" : "outline"} onClick={() => setAddMode("asset")}>
                <ImageIcon className="mr-1.5 size-3.5" /> Media
              </Button>
              <Button size="sm" variant={addMode === "embed" ? "default" : "outline"} onClick={() => setAddMode("embed")}>
                <VideoIcon className="mr-1.5 size-3.5" /> Video embed
              </Button>
            </div>
          </div>

          {addMode === "asset" ? (
            <MediaMultiPickerField
              values={selectedAssetId ? [selectedAssetId] : []}
              onChange={(ids) => {
                const nextId = ids.at(-1) ?? "";
                setSelectedAssetId(nextId);
                if (!nextId) setSelectedAsset(null);
              }}
              onSelectedAssetsChange={(assets) => {
                setSelectedAsset(assets.at(-1) ?? null);
              }}
              defaultTab={collection.collectionType === "VIDEO_PLAYLIST" ? "video" : "image"}
              allowedTabs={collection.collectionType === "VIDEO_PLAYLIST" ? ["video"] : ["image"]}
              placeholder={collection.collectionType === "VIDEO_PLAYLIST" ? "Chọn video từ thư viện..." : "Chọn ảnh từ thư viện..."}
            />
          ) : (
            <Input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." />
          )}
          <Button size="sm" onClick={handleAdd} disabled={addItem.isPending} className="w-full">
            <PlusIcon className="mr-1.5 size-3.5" />
            {addItem.isPending ? "Đang thêm..." : "Thêm vào bộ sưu tập"}
          </Button>
        </div>

        {itemsLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            Chưa có item nào.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: CollectionItem) => (
              <div key={item.publicId} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                  {item.mediaAssetUrl ? (
                    <PreviewableImage
                      src={item.mediaAssetUrl}
                      alt={item.mediaAssetFilename ?? "Media"}
                      title={item.mediaAssetFilename ?? "Media"}
                      className="size-full rounded-none border-0"
                    />
                  ) : (
                    <VideoIcon className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.mediaAssetFilename ?? item.externalUrl ?? item.itemType}</div>
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
                  onClick={() => setItemToRemove(item)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <WorkspaceConfirmDialog
          open={itemToRemove !== null}
          onOpenChange={(open) => !open && setItemToRemove(null)}
          title="Xoá item khỏi bộ sưu tập?"
          description={
            <>
              Xoá{" "}
              <span className="font-semibold text-foreground">
                {itemToRemove?.mediaAssetFilename ?? itemToRemove?.externalUrl ?? itemToRemove?.itemType ?? "item này"}
              </span>{" "}
              khỏi bộ sưu tập <span className="font-semibold text-foreground">{collection.title}</span>?
            </>
          }
          confirmLabel="Xoá item"
          variant="destructive"
          isPending={removeItem.isPending}
          onConfirm={() => {
            if (!itemToRemove) return;
            removeItem.mutate(itemToRemove.publicId, { onSuccess: () => setItemToRemove(null) });
          }}
        />
      </div>
    </AdminDetailSection>
  );
}

export function MediaLibraryCreatePage() {
  const navigate = useNavigate();
  const create = useCreateCollection();

  const form = useAdminZodForm(collectionFormSchema, {
    defaultValues: {
      title: "",
      slug: "",
      collectionType: "PHOTO_ALBUM",
      description: "",
      sourceNote: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, slugStatus } = useSlugField({ title: values.title, entityType: "MEDIA_COLLECTION" });
  const lastSlugRef = useRef(slug);
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedMediaAssetMap, setSelectedMediaAssetMap] = useState<Record<string, MediaAssetListItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  useEffect(() => {
    setSelectedMediaIds([]);
    setSelectedMediaAssetMap({});
  }, [values.collectionType]);

  const handleSubmit = form.handleSubmit(async (formValues) => {
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    if (selectedMediaIds.length === 0) {
      form.setError("root.server", { type: "manual", message: "Vui lòng chọn ít nhất một media item." });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await create.mutateAsync({
        title: formValues.title,
        slug: slug.trim(),
        collectionType: formValues.collectionType,
        description: formValues.description || undefined,
        sourceNote: formValues.sourceNote || undefined,
        coverMediaPublicId: coverMediaPublicId || undefined,
        featured,
      });
      const collectionPublicId = result.data.publicId;
      await Promise.all(
        selectedMediaIds.map((mediaPublicId, index) => {
          const asset = selectedMediaAssetMap[mediaPublicId];
          return addCollectionItem(collectionPublicId, {
            itemType: asset ? itemTypeForAsset(asset) : fallbackItemTypeForCollection(formValues.collectionType),
            mediaAssetPublicId: mediaPublicId,
            sortOrder: index,
          });
        }),
      );
      toast.success(`Đã tạo bộ sưu tập với ${selectedMediaIds.length} item.`);
      void navigate({ to: "/noi-dung/thu-vien-phap-mon/$publicId", params: { publicId: collectionPublicId } });
    } catch (err) {
      applyApiFieldErrors(form, err);
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/thu-vien-phap-mon"
      backLabel="Thư viện pháp môn"
      title="Tạo bộ sưu tập"
      onSave={() => void handleSubmit()}
      isSaving={isSubmitting || create.isPending}
      saveLabel="Tạo"
      saveDisabled={!values.title.trim() || !slug.trim() || slugStatus === "taken" || selectedMediaIds.length === 0}
      sidebar={
        <AdminDetailSection title="Thiết lập">
          <div className="space-y-4">
            <Field label="Ảnh đại diện">
              <MediaPickerField value={coverMediaPublicId} onChange={setCoverMediaPublicId} placeholder="Chọn ảnh đại diện từ thư viện..." />
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox id="featured-create-page" checked={featured} onCheckedChange={(checked) => setFeatured(checked === true)} />
              <label htmlFor="featured-create-page" className="cursor-pointer text-sm font-medium">Đánh dấu nổi bật</label>
            </div>
          </div>
        </AdminDetailSection>
      }
    >
      <AdminDetailSection title="Thông tin bộ sưu tập">
        <div className="grid gap-4">
          <FieldError message={errors.root?.server?.message} />
          <Field label="Tiêu đề">
            <Input {...form.register("title")} placeholder="Ảnh pháp hội 2026..." className={invalidFieldClass(Boolean(errors.title))} />
            <FieldError message={errors.title?.message} />
          </Field>
          <Field label="Slug (URL)">
            <div className="relative">
              <Input
                name="slug"
                value={slug}
                onChange={(event) => {
                  form.clearErrors("slug");
                  form.setValue("slug", event.target.value, { shouldDirty: true });
                  setSlug(event.target.value);
                }}
                placeholder="anh-phap-hoi-2026"
                className={cn("font-mono text-sm", invalidFieldClass(slugStatus === "taken" || Boolean(errors.slug)))}
              />
              {(slugStatus !== "idle" || errors.slug) && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SlugStatusIcon status={errors.slug ? "taken" : slugStatus} />
                </span>
              )}
            </div>
            <FieldError message={errors.slug?.message ?? (slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined)} />
          </Field>
          <Field label="Loại bộ sưu tập">
            <Select value={values.collectionType} onValueChange={(value) => form.setValue("collectionType", value as CollectionType, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mô tả">
            <Textarea {...form.register("description")} placeholder="Mô tả ngắn..." rows={3} />
          </Field>
          <Field label="Ghi chú nguồn">
            <Textarea {...form.register("sourceNote")} placeholder="Nguồn / provenance..." rows={2} />
          </Field>
        </div>
      </AdminDetailSection>

      <AdminDetailSection title={`Chọn media items (${selectedMediaIds.length} đã chọn)`}>
        <MediaMultiPickerField
          values={selectedMediaIds}
          onChange={(ids) => {
            setSelectedMediaIds(ids);
            setSelectedMediaAssetMap((current) => {
              const next: Record<string, MediaAssetListItem> = {};
              for (const id of ids) {
                if (current[id]) next[id] = current[id];
              }
              return next;
            });
          }}
          onSelectedAssetsChange={(assets) => {
            setSelectedMediaAssetMap((current) => ({
              ...current,
              ...Object.fromEntries(assets.map((asset) => [asset.publicId, asset])),
            }));
          }}
          defaultTab={values.collectionType === "VIDEO_PLAYLIST" ? "video" : "image"}
          allowedTabs={
            values.collectionType === "PHOTO_ALBUM"
              ? ["image"]
              : values.collectionType === "VIDEO_PLAYLIST"
                ? ["video"]
                : ["image", "video"]
          }
          placeholder="Chọn media items từ thư viện..."
        />
      </AdminDetailSection>
    </AdminDetailPage>
  );
}

export function MediaLibraryDetailPage() {
  const params = useParams({ strict: false });
  const publicId = params.publicId ?? "";
  const navigate = useNavigate();
  const { data: envelope, isLoading } = useQuery(collectionDetailOptions(publicId));
  const collection = envelope?.data ?? null;
  const update = useUpdateCollection();
  const publishCollection = usePublishCollection();
  const unpublishCollection = useUnpublishCollection();
  const deleteCollection = useDeleteCollection();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublishAction, setConfirmPublishAction] = useState<"publish" | "unpublish" | null>(null);

  const form = useAdminZodForm(collectionFormSchema, {
    defaultValues: {
      title: "",
      slug: "",
      collectionType: "PHOTO_ALBUM",
      description: "",
      sourceNote: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, setSlugFromServer, slugStatus } = useSlugField({
    title: values.title,
    entityType: "MEDIA_COLLECTION",
    excludePublicId: publicId,
    initialSlug: collection?.slug,
  });
  const lastSlugRef = useRef(slug);
  const [featured, setFeatured] = useState(false);
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");

  useEffect(() => {
    if (!collection) return;
    form.reset({
      title: collection.title,
      slug: collection.slug,
      collectionType: collection.collectionType,
      description: collection.description ?? "",
      sourceNote: collection.sourceNote ?? "",
    });
    setSlugFromServer(collection.slug, collection.title);
    setFeatured(collection.featured);
    setCoverMediaPublicId(collection.coverMediaPublicId ?? "");
  }, [collection, form, setSlugFromServer]);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  const handleSubmit = form.handleSubmit((formValues) => {
    if (!collection) return;
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    update.mutate(
      {
        publicId: collection.publicId,
        title: formValues.title,
        slug: slug.trim() || undefined,
        description: formValues.description || null,
        sourceNote: formValues.sourceNote || null,
        coverMediaPublicId: coverMediaPublicId || null,
        featured,
      },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (isLoading) return <WorkspaceRouteSkeleton />;
  if (!collection) {
    return (
      <AdminDetailPage backHref="/noi-dung/thu-vien-phap-mon" backLabel="Thư viện pháp môn" title="Không tìm thấy bộ sưu tập">
        <AdminDetailSection>
          <p className="text-sm text-muted-foreground">Bộ sưu tập không tồn tại hoặc đã bị xoá.</p>
        </AdminDetailSection>
      </AdminDetailPage>
    );
  }

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/thu-vien-phap-mon"
        backLabel="Thư viện pháp môn"
        title={collection.title}
        status={<Badge variant="outline" className={statusBadgeClass(collection.status)}>{statusLabel(collection.status)}</Badge>}
        onSave={() => void handleSubmit()}
        isSaving={update.isPending}
        saveLabel="Lưu"
        saveDisabled={!values.title.trim() || slugStatus === "taken"}
        actions={[
          collection.status === "DRAFT"
            ? { label: "Xuất bản", icon: UploadIcon, onClick: () => setConfirmPublishAction("publish") }
            : { label: "Gỡ xuất bản", icon: UploadIcon, onClick: () => setConfirmPublishAction("unpublish") },
          { label: "Xoá", icon: Trash2Icon, variant: "destructive", separator: true, onClick: () => setConfirmDelete(true) },
        ]}
        sidebar={
          <>
            <AdminDetailSection title="Metadata">
              <AdminDetailField label="Loại" value={COLLECTION_TYPE_LABELS[collection.collectionType]} />
              <AdminDetailField label="Số item" value={collection.itemCount} />
              <AdminDetailField label="Người tạo" value={collection.createdByName} />
              <AdminDetailField label="Ngày tạo" value={new Date(collection.createdAt).toLocaleDateString("vi-VN")} />
            </AdminDetailSection>
            <AdminDetailSection title="Thiết lập">
              <div className="space-y-4">
                <Field label="Ảnh đại diện">
                  <MediaPickerField
                    value={coverMediaPublicId}
                    onChange={setCoverMediaPublicId}
                    currentImageUrl={collection.coverImageUrl}
                    placeholder="Chọn ảnh đại diện từ thư viện..."
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox id="featured-detail-page" checked={featured} onCheckedChange={(checked) => setFeatured(checked === true)} />
                  <label htmlFor="featured-detail-page" className="cursor-pointer text-sm font-medium">Đánh dấu nổi bật</label>
                </div>
              </div>
            </AdminDetailSection>
          </>
        }
        footer={<CollectionItemsPanel collection={collection} />}
      >
        <AdminDetailSection title="Thông tin bộ sưu tập">
          <div className="grid gap-4">
            <FieldError message={errors.root?.server?.message} />
            <Field label="Tiêu đề">
              <Input {...form.register("title")} className={invalidFieldClass(Boolean(errors.title))} />
              <FieldError message={errors.title?.message} />
            </Field>
            <Field label="Slug">
              <div className="relative">
                <Input
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    form.clearErrors("slug");
                    form.setValue("slug", event.target.value, { shouldDirty: true });
                    setSlug(event.target.value);
                  }}
                  className={cn("font-mono text-sm", invalidFieldClass(slugStatus === "taken" || Boolean(errors.slug)))}
                />
                {(slugStatus !== "idle" || errors.slug) && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SlugStatusIcon status={errors.slug ? "taken" : slugStatus} />
                  </span>
                )}
              </div>
              <FieldError message={errors.slug?.message ?? (slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined)} />
            </Field>
            <Field label="Loại bộ sưu tập">
              <Select value={values.collectionType} disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mô tả">
              <Textarea {...form.register("description")} rows={3} placeholder="Mô tả ngắn..." />
            </Field>
            <Field label="Ghi chú nguồn">
              <Textarea {...form.register("sourceNote")} rows={2} placeholder="Nguồn / provenance..." />
            </Field>
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá bộ sưu tập"
        description={<>Xoá <span className="font-semibold text-foreground">{collection.title}</span>? Tất cả nội dung trong bộ sưu tập cũng sẽ bị xoá.</>}
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteCollection.isPending}
        onConfirm={() => deleteCollection.mutate(collection.publicId, { onSuccess: () => void navigate({ to: "/noi-dung/thu-vien-phap-mon" }) })}
      />
      <WorkspaceConfirmDialog
        open={confirmPublishAction !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmPublishAction(null);
        }}
        title={confirmPublishAction === "unpublish" ? "Gỡ xuất bản bộ sưu tập?" : "Xuất bản bộ sưu tập?"}
        description={
          confirmPublishAction === "unpublish"
            ? `Gỡ xuất bản "${collection.title}" khỏi bề mặt công khai?`
            : `Xuất bản "${collection.title}" ra bề mặt công khai?`
        }
        confirmLabel={confirmPublishAction === "unpublish" ? "Gỡ xuất bản" : "Xuất bản"}
        variant={confirmPublishAction === "unpublish" ? "destructive" : "default"}
        isPending={publishCollection.isPending || unpublishCollection.isPending}
        onConfirm={() => {
          const action = confirmPublishAction;
          if (action === "publish") {
            publishCollection.mutate(collection.publicId, { onSuccess: () => setConfirmPublishAction(null) });
          }
          if (action === "unpublish") {
            unpublishCollection.mutate(collection.publicId, { onSuccess: () => setConfirmPublishAction(null) });
          }
        }}
      />
    </>
  );
}

// ── Page header ────────────────────────────────────────────────────────

function MediaLibraryHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thư viện pháp môn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý album ảnh, playlist video và gallery nội dung pháp môn.
        </p>
      </div>
      <Button asChild>
        <Link to="/noi-dung/thu-vien-phap-mon/tao-moi">
          <PlusIcon className="mr-2 size-4" />
          Tạo bộ sưu tập
        </Link>
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
