import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceConfirmDialog, WorkspaceDataTable, WorkspaceDetailSheet, WorkspaceDetailStandardSections, WorkspaceRowActions } from "@/components/workspace";
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { createSelectColumn } from "@/lib/table/select-column";

import {
  collectionsListOptions,
  collectionItemsOptions,
  mediaLibraryKeys,
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
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries.js";
import { resolveMediaSrc } from "@/lib/media-src";

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

const collectionFormSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
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

// ── Row actions ────────────────────────────────────────────────────────

function CollectionRowActions({ row }: { row: CollectionListItem }) {
  const { setOpen, setCurrentRow } = useML();

  const actions = [
    {
      label: "Xem chi tiết",
      icon:  ListIcon,
      onClick: () => { setCurrentRow(row); setOpen("items"); },
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
  const { setOpen, setCurrentRow } = useML();
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
                    src={resolveMediaSrc(coverImageUrl) ?? undefined}
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
        emptyMessage="Chưa có bộ sưu tập nào. Nhấn 'Tạo bộ sưu tập' để bắt đầu."
        onRowClick={(row) => {
          setCurrentRow(row);
          setOpen("items");
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

// ── Image grid picker ──────────────────────────────────────────────────

function ImageGridPicker({
  images,
  value,
  onChange,
}: {
  images: MediaAssetListItem[];
  value: string;
  onChange: (publicId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = images.find((a) => a.publicId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-start gap-3 h-auto py-2 px-3"
        >
          {selected ? (
            <>
              <img
                src={resolveMediaSrc(selected.url) ?? undefined}
                alt={selected.filename}
                className="size-8 rounded object-cover shrink-0"
              />
              <span className="flex-1 text-left text-sm truncate">{selected.filename}</span>
              <span
                className="text-xs text-muted-foreground shrink-0"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
              >
                ✕
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Chọn ảnh đại diện...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-3" align="start">
        {images.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Chưa có ảnh nào.</p>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-4 gap-2 pr-2">
              {images.map((a) => (
                <button
                  key={a.publicId}
                  type="button"
                  onClick={() => { onChange(a.publicId); setOpen(false); }}
                  className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    value === a.publicId
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-muted-foreground/40"
                  }`}
                >
                  <img
                    src={resolveMediaSrc(a.url) ?? undefined}
                    alt={a.filename}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  {value === a.publicId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <div className="rounded-full bg-primary p-0.5 text-primary-foreground">
                        <svg className="size-3" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate text-[10px] text-white leading-tight">{a.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
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
  const qc = useQueryClient();
  
  const { data: assetsEnvelope, isLoading: assetsLoading, error: assetsError } = useQuery({
    ...mediaListOptions({ limit: 100 }), // Backend max is 100
    enabled: open,
  });
  const assets = assetsEnvelope?.data ?? [];
  const imageAssets = assets.filter((a: MediaAssetListItem) => a.mimeType.startsWith("image/"));
  const videoAssets = assets.filter((a: MediaAssetListItem) => a.mimeType.startsWith("video/"));

  const form = useAdminZodForm(collectionFormSchema, {
    defaultValues: {
      title: "",
      collectionType: "PHOTO_ALBUM",
      description: "",
      sourceNote: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, resetSlug, slugStatus } = useSlugField({ title: values.title, entityType: "MEDIA_COLLECTION" });
  const [coverMediaPublicId,   setCoverMediaPublicId]   = useState("");
  const [featured,             setFeatured]             = useState(false);
  const [selectedMediaIds,     setSelectedMediaIds]     = useState<string[]>([]);
  const [isSubmitting,         setIsSubmitting]         = useState(false);

  // Filter available media based on collection type
  const availableMedia = useMemo(() => {
    if (values.collectionType === "PHOTO_ALBUM") return imageAssets;
    if (values.collectionType === "VIDEO_PLAYLIST") return videoAssets;
    return assets; // MIXED_GALLERY and others can have both
  }, [values.collectionType, imageAssets, videoAssets, assets]);

  function reset() {
    form.reset({
      title: "",
      collectionType: "PHOTO_ALBUM",
      description: "",
      sourceNote: "",
    });
    resetSlug();
    setCoverMediaPublicId("");
    setFeatured(false);
    setSelectedMediaIds([]);
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open]);

  useEffect(() => {
    // Clear selection when collection type changes
    setSelectedMediaIds([]);
  }, [values.collectionType]);

  function toggleMediaSelection(publicId: string) {
    setSelectedMediaIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId]
    );
  }

  const handleSubmit = form.handleSubmit(async (formValues) => {
    if (slugStatus === "taken") {
      form.setError("root.server", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." });
      return;
    }
    if (selectedMediaIds.length === 0) {
      form.setError("root.server", { type: "manual", message: "Vui lòng chọn ít nhất một media item." });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Step 1: Create collection
      const result = await create.mutateAsync({
        title: formValues.title,
        slug: slug.trim(),
        collectionType: formValues.collectionType,
        description: formValues.description || undefined,
        coverMediaPublicId: coverMediaPublicId || undefined,
        featured
      });

      const collectionPublicId = result.publicId;

      // Step 2: Add items in batch
      const itemType = formValues.collectionType === "VIDEO_PLAYLIST" ? "UPLOADED_VIDEO" : "IMAGE";
      
      await Promise.all(
        selectedMediaIds.map((mediaPublicId, index) =>
          addCollectionItem(collectionPublicId, {
            itemType,
            mediaAssetPublicId: mediaPublicId,
            sortOrder: index,
          })
        )
      );

      toast.success(`Đã tạo bộ sưu tập với ${selectedMediaIds.length} items.`);
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
      reset();
      onOpenChange(false);
    } catch (err) {
      applyApiFieldErrors(form, err);
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tạo bộ sưu tập mới"
      subtitle="Điền thông tin và chọn media items cho album/playlist."
    >

        <div className="space-y-4">
          <FieldError message={errors.root?.server?.message} />
          <Field label="Tiêu đề">
            <Input
              {...form.register("title")}
              placeholder="Ảnh pháp hội 2026..."
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </Field>
          <Field label="Slug (URL)">
            <div className="relative">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="anh-phap-hoi-2026"
                className={cn("font-mono text-sm", invalidFieldClass(slugStatus === "taken"))}
                style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
              />
              {slugStatus !== "idle" && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SlugStatusIcon status={slugStatus} />
                </span>
              )}
            </div>
            <FieldError message={slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined} />
          </Field>
          <Field label="Loại bộ sưu tập">
            <Select value={values.collectionType} onValueChange={(value) => form.setValue("collectionType", value as CollectionType, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          
          <Field label={`Chọn media items (${selectedMediaIds.length} đã chọn)`}>
            <div className="border rounded-md p-3 bg-muted/20">
              {assetsLoading ? (
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="aspect-square w-full" />
                  ))}
                </div>
              ) : assetsError ? (
                <p className="text-sm text-destructive text-center py-8">
                  Lỗi khi tải media. Vui lòng thử lại.
                </p>
              ) : availableMedia.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có media nào. Vui lòng upload ảnh/video trước.
                </p>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="grid grid-cols-4 gap-3 pr-3">
                    {availableMedia.map((media) => {
                      const isSelected = selectedMediaIds.includes(media.publicId);
                      return (
                        <button
                          key={media.publicId}
                          type="button"
                          onClick={() => toggleMediaSelection(media.publicId)}
                          className={cn(
                            "relative group rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                            isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <div className="aspect-square bg-muted">
                            {media.mimeType.startsWith("image/") ? (
                              <img
                                src={resolveMediaSrc(media.url) ?? undefined}
                                alt={media.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <VideoIcon className="size-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className={cn(
                            "absolute top-2 right-2 size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background/80 border-muted-foreground/50 text-transparent group-hover:border-muted-foreground"
                          )}>
                            {isSelected && "✓"}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                            <p className="text-xs text-white truncate font-medium">{media.filename}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </Field>
          
          <Field label="Ảnh đại diện (nếu có)">
            <MediaPickerField
              value={coverMediaPublicId}
              onChange={setCoverMediaPublicId}
              placeholder="Chọn ảnh đại diện từ thư viện..."
            />
          </Field>
          <Field label="Mô tả">
            <Textarea {...form.register("description")} placeholder="Mô tả ngắn..." rows={2} />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured-create"
              checked={featured}
              onCheckedChange={(checked) => setFeatured(checked === true)}
            />
            <label htmlFor="featured-create" className="text-sm font-medium cursor-pointer">
              Đánh dấu nổi bật
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
          <Button
            onClick={() => { void handleSubmit(); }}
            disabled={isSubmitting || !values.title.trim() || !slug.trim() || selectedMediaIds.length === 0}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo"}
          </Button>
        </div>
    <WorkspaceDetailStandardSections />
    </WorkspaceDetailSheet>
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
  const form = useAdminZodForm(collectionFormSchema, {
    defaultValues: {
      title: currentRow.title,
      collectionType: currentRow.collectionType,
      description: currentRow.description ?? "",
      sourceNote: currentRow.sourceNote ?? "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, slugStatus } = useSlugField({
    title: values.title,
    entityType: "MEDIA_COLLECTION",
    excludePublicId: currentRow.publicId,
    initialSlug: currentRow.slug,
  });
  const [featured,    setFeatured]    = useState(currentRow.featured);

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: currentRow.title,
      collectionType: currentRow.collectionType,
      description: currentRow.description ?? "",
      sourceNote: currentRow.sourceNote ?? "",
    });
    setSlug(currentRow.slug);
    setFeatured(currentRow.featured);
  }, [currentRow, form, open, setSlug]);

  const handleSubmit = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("root.server", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." });
      return;
    }
    update.mutate(
      {
        publicId:    currentRow.publicId,
        title:       formValues.title,
        slug:        slug.trim() || undefined,
        description: formValues.description || null,
        sourceNote:  formValues.sourceNote || null,
        featured,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={currentRow.title}
      subtitle="Xem chi tiết và cập nhật thông tin bộ sưu tập."
    >

        <div className="space-y-4">
          <FieldError message={errors.root?.server?.message} />
          <Field label="Tiêu đề">
            <Input
              {...form.register("title")}
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </Field>
          <Field label="Slug">
            <div className="relative">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={cn("font-mono text-sm", invalidFieldClass(slugStatus === "taken"))}
                style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
              />
              {slugStatus !== "idle" && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SlugStatusIcon status={slugStatus} />
                </span>
              )}
            </div>
            <FieldError message={slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined} />
          </Field>
          <Field label="Mô tả">
            <Textarea {...form.register("description")} rows={2} placeholder="Mô tả ngắn..." />
          </Field>
          <Field label="Ghi chú nguồn">
            <Textarea {...form.register("sourceNote")} rows={2} placeholder="Nguồn / provenance..." />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured-edit"
              checked={featured}
              onCheckedChange={(checked) => setFeatured(checked === true)}
            />
            <label htmlFor="featured-edit" className="text-sm font-medium cursor-pointer">
              Đánh dấu nổi bật
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={() => void handleSubmit()} disabled={update.isPending || !values.title.trim()}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
    <WorkspaceDetailStandardSections />
    </WorkspaceDetailSheet>
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
  const { data: itemsEnvelope, isLoading: itemsLoading } = useQuery({
    ...collectionItemsOptions(collection.publicId),
    enabled: open,
  });
  const items = itemsEnvelope?.data ?? [];

  const { data: assetsEnvelope } = useQuery({
    ...mediaListOptions({ limit: 50 }),
    enabled: open,
  });
  const assets = assetsEnvelope?.data ?? [];
  const imageAssets = assets.filter((a: MediaAssetListItem) => a.mimeType.startsWith("image/"));

  const addItem    = useAddCollectionItem(collection.publicId);
  const removeItem = useRemoveCollectionItem(collection.publicId);

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [externalUrl,     setExternalUrl]     = useState("");
  const [addMode,         setAddMode]         = useState<"asset" | "embed">("asset");
  const [addErrors,       setAddErrors]       = useState<{ selectedAssetId?: string; externalUrl?: string }>({});

  function handleAdd() {
    if (addMode === "asset") {
      if (!selectedAssetId) {
        const nextErrors = { selectedAssetId: "Chọn ảnh để thêm." };
        setAddErrors(nextErrors);
        toast.error(nextErrors.selectedAssetId);
        return;
      }
      setAddErrors({});
      addItem.mutate({ itemType: "IMAGE", mediaAssetPublicId: selectedAssetId });
      setSelectedAssetId("");
    } else {
      if (!externalUrl.trim()) {
        const nextErrors = { externalUrl: "Nhập URL video để thêm." };
        setAddErrors(nextErrors);
        toast.error(nextErrors.externalUrl);
        return;
      }
      setAddErrors({});
      addItem.mutate({ itemType: "VIDEO_EMBED", externalUrl: externalUrl.trim() });
      setExternalUrl("");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nội dung — {collection.title}</SheetTitle>
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
              <ImageGridPicker
                images={imageAssets}
                value={selectedAssetId}
                onChange={(next) => {
                  setSelectedAssetId(next);
                  if (addErrors.selectedAssetId) setAddErrors((prev) => ({ ...prev, selectedAssetId: "" }));
                }}
              />
            ) : (
              <Input
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  if (addErrors.externalUrl) setAddErrors((prev) => ({ ...prev, externalUrl: "" }));
                }}
                placeholder="https://youtube.com/watch?v=..."
                className={cn("text-sm", invalidFieldClass(Boolean(addErrors.externalUrl)))}
              />
            )}
            <FieldError message={addMode === "asset" ? addErrors.selectedAssetId : addErrors.externalUrl} />

            <Button size="sm" onClick={handleAdd} disabled={addItem.isPending} className="w-full">
              <PlusIcon className="mr-1.5 size-3.5" />
              {addItem.isPending ? "Đang thêm..." : "Thêm vào bộ sưu tập"}
            </Button>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{items.length} items</p>

            {itemsLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Chưa có item nào. Thêm ảnh hoặc video embed bên trên.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item: CollectionItem) => (
                  <div
                    key={item.publicId}
                    className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                  >
                    <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted flex items-center justify-center">
                      {item.mediaAssetUrl ? (
                        <img
                          src={resolveMediaSrc(item.mediaAssetUrl) ?? undefined}
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

          {currentRow && (
            <CollectionItemsSheet
              open={open === "items"}
              onOpenChange={(v) => (!v ? handleClose() : setOpen("items"))}
              collection={currentRow}
            />
          )}

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
        Tạo bộ sưu tập
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
