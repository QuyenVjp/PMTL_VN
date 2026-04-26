import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { CheckIcon, CopyIcon, EyeIcon, FileImageIcon, Trash2Icon, UploadIcon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useDeleteMediaAsset, useUpdateMediaAsset, useUploadMediaAsset } from "@/features/media/mutations";
import { resolveMediaSrc } from "@/lib/media-src";

// ── Context ──────────────────────────────────────────────────────────

type MediaDialogType = "delete" | "upload" | "detail" | "lightbox" | null;
type MediaAssetMode = "all" | "image" | "video" | "document";

type MediaContextValue = {
  open: MediaDialogType;
  mode: MediaAssetMode;
  currentRow: MediaAssetListItem | null;
  setOpen: (value: MediaDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<MediaAssetListItem | null>>;
  lightboxIndex: number | null;
  setLightboxIndex: (i: number | null) => void;
};

const MediaContext = createContext<MediaContextValue | null>(null);

function MediaProvider({ children, mode }: { children: React.ReactNode; mode: MediaAssetMode }) {
  const [open, setOpen] = useState<MediaDialogType>(null);
  const [currentRow, setCurrentRow] = useState<MediaAssetListItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <MediaContext.Provider value={{ open, mode, currentRow, setOpen, setCurrentRow, lightboxIndex, setLightboxIndex }}>
      {children}
    </MediaContext.Provider>
  );
}

function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error("useMedia must be used within MediaProvider");
  return context;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Sẵn sàng", value: "READY" },
  { label: "Đang tải", value: "UPLOADING" },
  { label: "Mồ côi", value: "ORPHANED" },
  { label: "Đã xoá", value: "DELETED" },
];

function statusBadgeClass(s: string): string {
  if (s === "READY")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "UPLOADING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (s === "ORPHANED")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function statusLabel(s: string): string {
  if (s === "READY") return "Sẵn sàng";
  if (s === "UPLOADING") return "Đang tải";
  if (s === "ORPHANED") return "Mồ côi";
  if (s === "DELETED") return "Đã xoá";
  return s;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Row actions ───────────────────────────────────────────────────────

function MediaRowActions({ row }: { row: MediaAssetListItem }) {
  const { setOpen, setCurrentRow } = useMedia();

  if (row.status === "DELETED") return null;

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          icon: EyeIcon,
          onClick: () => {
            setCurrentRow(row);
            setOpen("detail");
          },
        },
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => {
            setCurrentRow(row);
            setOpen("delete");
          },
          variant: "destructive",
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function MediaAssetsTable() {
  const { mode } = useMedia();
  const { data: envelope, isLoading } = useQuery(mediaListOptions({ limit: 100 }));
  const allAssets = envelope?.data ?? [];
  const assets = useMemo(
    () => {
      if (mode === "video") return allAssets.filter((asset) => asset.mimeType.startsWith("video/"));
      if (mode === "image") return allAssets.filter((asset) => asset.mimeType.startsWith("image/"));
      if (mode === "document")
        return allAssets.filter((asset) => !asset.mimeType.startsWith("image/") && !asset.mimeType.startsWith("video/"));
      return allAssets;
    },
    [allAssets, mode],
  );
  const emptyMessage = mode === "video"
    ? "Chưa có video asset nào."
    : mode === "image"
      ? "Chưa có ảnh asset nào."
      : mode === "document"
        ? "Chưa có tệp tài liệu nào."
        : "Chưa có media asset nào.";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { setOpen, setCurrentRow } = useMedia();

  const columns = useMemo<ColumnDef<MediaAssetListItem>[]>(
    () => [
      createSelectColumn<MediaAssetListItem>(),
      {
        accessorKey: "filename",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên file" />,
        cell: ({ row }) => {
          const { filename, mimeType } = row.original;
          const isImage = mimeType.startsWith("image/");
          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="size-10 shrink-0 overflow-hidden rounded border border-border bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen("lightbox");
                }}
              >
                {isImage ? (
                  <img
                    src={resolveMediaSrc(row.original.url) ?? undefined}
                    alt={filename}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <FileImageIcon className="size-5 text-muted-foreground" />
                )}
              </button>
              <div className="max-w-[200px] truncate font-medium">{filename}</div>
            </div>
          );
        },
        meta: { label: "Tên file" },
        enableHiding: false,
      },
      {
        accessorKey: "mimeType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">{row.original.mimeType}</div>
        ),
        meta: { label: "Loại" },
        enableSorting: false,
      },
      {
        accessorKey: "size",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kích thước" />,
        cell: ({ row }) => (
          <div className="text-nowrap tabular-nums">{formatFileSize(row.original.size)}</div>
        ),
        meta: { label: "Kích thước" },
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
        accessorKey: "uploaderName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tải" />,
        cell: ({ row }) => (
          <div className="text-nowrap">{row.original.uploaderName}</div>
        ),
        meta: { label: "Người tải" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tải" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tải" },
      },
      {
        id: "actions",
        cell: ({ row }) => <MediaRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [setCurrentRow, setOpen],
  );

  const table = useSafeReactTable({
    data: assets,
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
        searchPlaceholder="Lọc theo tên file..."
        searchKey="filename"
        viewButtonLabel="Xem"
        filters={[{ columnId: "status", title: "Trạng thái", options: statusOptions }]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={(row) => {
          setCurrentRow(row);
          setOpen("detail");
        }}
      />
      <DataTableBulkActions table={table} entityName="media asset" />
    </div>
  );
}

// ── Upload dialog ─────────────────────────────────────────────────────

function MediaUploadDialog() {
  const { open, setOpen, mode } = useMedia();
  const upload = useUploadMediaAsset();
  const inputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleClose() {
    setStaged(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOpen(null);
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStaged(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  }

  function handleConfirm() {
    if (!staged) return;
    upload.mutate(staged, { onSuccess: handleClose });
  }

  const uploadDialogTitle = mode === "video"
    ? "Tải video lên"
    : mode === "image"
      ? "Tải ảnh lên"
      : mode === "document"
        ? "Tải tệp tài liệu lên"
        : "Tải media lên";
  const uploadAccept = mode === "video"
    ? "video/*"
    : mode === "image"
      ? "image/*"
      : mode === "document"
        ? ".pdf,.csv,.zip,.json,.xls,.xlsx"
        : "image/*,video/*,application/pdf";
  const uploadHint = mode === "video"
    ? "MP4, WEBM… tối đa 100 MB"
    : mode === "image"
      ? "JPG, PNG, GIF, WebP… tối đa 10 MB"
      : mode === "document"
        ? "PDF, CSV, ZIP, JSON, XLS/XLSX."
        : "JPG, PNG, MP4, PDF…";

  return (
    <Dialog open={open === "upload"} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{uploadDialogTitle}</DialogTitle>
        </DialogHeader>

        {!staged ? (
          <div
            className="mt-2 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center transition-colors hover:border-primary/50 cursor-pointer"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <UploadIcon className="size-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Nhấn để chọn file</span>{" "}
              hoặc kéo thả vào đây
            </div>
            <div className="text-xs text-muted-foreground">
              {uploadHint}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={uploadAccept}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {previewUrl ? (
              <div className="overflow-hidden rounded-lg border bg-muted aspect-video flex items-center justify-center">
                <img src={previewUrl} alt={staged.name} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-lg border bg-muted">
                <FileImageIcon className="size-10 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tên file</span>
                <span className="font-medium truncate max-w-[220px]">{staged.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loại</span>
                <span>{staged.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kích thước</span>
                <span className="tabular-nums">{formatFileSize(staged.size)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setStaged(null); setPreviewUrl(null); }} disabled={upload.isPending}>
                Chọn lại
              </Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={upload.isPending}>
                {upload.isPending ? "Đang tải lên…" : "Xác nhận tải lên"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────

function MediaLightbox() {
  const { open, setOpen, currentRow } = useMedia();

  if (!currentRow) return null;
  const isImage = currentRow.mimeType.startsWith("image/");

  return (
    <Dialog open={open === "lightbox"} onOpenChange={(v) => !v && setOpen(null)}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          {isImage ? (
            <img
              src={resolveMediaSrc(currentRow.url) ?? undefined}
              alt={currentRow.filename}
              className="max-h-[80vh] w-full object-contain bg-black/5"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-muted">
              <FileImageIcon className="size-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm">
            <div className="font-medium">{currentRow.filename}</div>
            <div className="text-muted-foreground">{currentRow.mimeType} · {formatFileSize(currentRow.size)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Detail sheet ──────────────────────────────────────────────────────

function MediaDetailSheet() {
  const { open, setOpen, currentRow, setCurrentRow } = useMedia();
  const update = useUpdateMediaAsset();
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentRow && open === "detail") {
      const meta = currentRow.metadata ?? null;
      setAltText(meta?.altText ?? "");
      setCaption(meta?.caption ?? "");
      setDescription(meta?.description ?? "");
    }
  }, [currentRow, open]);

  function handleClose() {
    setOpen(null);
    setCurrentRow(null);
  }

  function handleSave() {
    if (!currentRow) return;
    update.mutate({ publicId: currentRow.publicId, altText: altText || undefined, caption: caption || undefined, description: description || undefined });
  }

  function copyUrl() {
    const resolved = resolveMediaSrc(currentRow?.url ?? "") ?? currentRow?.url ?? "";
    void navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!currentRow) return null;
  const isImage = currentRow.mimeType.startsWith("image/");
  const isVideo = currentRow.mimeType.startsWith("video/");
  const resolvedUrl = resolveMediaSrc(currentRow.url) ?? currentRow.url;

  // Derived mime label
  const mimeLabel = currentRow.mimeType.split("/")[1]?.toUpperCase() ?? currentRow.mimeType;

  return (
    <Sheet open={open === "detail"} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col p-0 gap-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Chi tiết media</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Preview */}
          <div className="relative bg-muted/40 flex items-center justify-center min-h-[200px] max-h-[280px] border-b">
            {isImage ? (
              <img
                src={resolvedUrl}
                alt={currentRow.filename}
                className="max-h-[280px] max-w-full object-contain"
              />
            ) : isVideo ? (
              <video src={resolvedUrl} controls className="max-h-[280px] max-w-full" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <FileImageIcon className="size-14" />
                <span className="text-sm">{mimeLabel}</span>
              </div>
            )}
            {/* Type badge overlay */}
            <Badge className="absolute top-2 right-2 text-[10px] uppercase">{mimeLabel}</Badge>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Filename + status */}
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-snug break-all">{currentRow.filename}</h3>
              <Badge variant="outline" className={statusBadgeClass(currentRow.status)}>
                {statusLabel(currentRow.status)}
              </Badge>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Kích thước file</div>
              <div className="tabular-nums text-right font-medium">{formatFileSize(currentRow.size)}</div>

              {currentRow.width && currentRow.height ? (
                <>
                  <div className="text-muted-foreground">Độ phân giải</div>
                  <div className="tabular-nums text-right font-medium">{currentRow.width} × {currentRow.height} px</div>
                </>
              ) : null}

              <div className="text-muted-foreground">Người tải</div>
              <div className="text-right truncate font-medium">{currentRow.uploaderName}</div>

              <div className="text-muted-foreground">Ngày tải lên</div>
              <div className="text-right font-medium">
                {new Date(currentRow.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </div>

              <div className="text-muted-foreground">Giờ</div>
              <div className="text-right font-medium tabular-nums">
                {new Date(currentRow.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* URL copy */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Đường dẫn công khai</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={resolvedUrl}
                  className="text-xs font-mono bg-muted/30"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="sm" onClick={copyUrl} className="shrink-0">
                  {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                </Button>
              </div>
            </div>

            {/* Metadata editor */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Metadata SEO / CMS</p>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Alt text</label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Mô tả nội dung ảnh (dùng cho screen reader và SEO)..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Caption</label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chú thích hiển thị dưới ảnh..."
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Ghi chú nội bộ</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú chỉ dành cho admin, không hiển thị công khai..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t px-6 py-4">
          <Button onClick={handleSave} disabled={update.isPending} className="w-full">
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function MediaDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMedia();
  const deleteAsset = useDeleteMediaAsset();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  if (!currentRow) return null;

  return (
    <WorkspaceConfirmDialog
      open={open === "delete"}
      onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
      title="Xoá media asset"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{currentRow.filename}</span>? Thao
          tác này không thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={deleteAsset.isPending}
      onConfirm={() =>
        deleteAsset.mutate(currentRow.publicId, { onSuccess: handleClose })
      }
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────

function MediaPageHeader() {
  const { setOpen, mode } = useMedia();
  const title = mode === "video"
    ? "Video Assets"
    : mode === "image"
      ? "Ảnh Assets"
      : mode === "document"
        ? "Tệp Tài Liệu Assets"
        : "Media Assets";
  const description = mode === "video"
    ? "Lane chuyên quản lý video, tách khỏi ảnh và tài liệu."
    : mode === "image"
      ? "Lane chuyên quản lý ảnh, không lẫn video hoặc tài liệu."
      : mode === "document"
        ? "Lane chuyên quản lý file tài liệu vận hành."
        : "Theo dõi asset upload, owner và tình trạng xử lý media.";
  const cta = mode === "video"
    ? "Tải video lên"
    : mode === "image"
      ? "Tải ảnh lên"
      : mode === "document"
        ? "Tải tệp tài liệu"
        : "Tải media";

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Button onClick={() => setOpen("upload")} className="shrink-0">
        <UploadIcon className="mr-2 size-4" />
        {cta}
      </Button>
    </div>
  );
}

function MediaAssetsPageBase({ mode }: { mode: MediaAssetMode }) {
  return (
    <MediaProvider mode={mode}>
      <div className="space-y-6">
        <MediaPageHeader />
        <MediaAssetsTable />
      </div>

      <MediaUploadDialog />
      <MediaLightbox />
      <MediaDetailSheet />
      <MediaDialogs />
    </MediaProvider>
  );
}

export function MediaAssetsPage() {
  return <MediaAssetsPageBase mode="all" />;
}

export function ImageAssetsPage() {
  return <MediaAssetsPageBase mode="image" />;
}

export function VideoAssetsPage() {
  return <MediaAssetsPageBase mode="video" />;
}

export function DocumentAssetsPage() {
  return <MediaAssetsPageBase mode="document" />;
}
