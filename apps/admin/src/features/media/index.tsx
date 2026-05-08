import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  CopyIcon,
  Edit2Icon,
  EyeIcon,
  FileImageIcon,
  FolderIcon,
  FolderPlusIcon,
  MoveRightIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { ImagePreviewDialog, PreviewableImage } from "@/components/media/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  mediaFoldersOptions,
  mediaListOptions,
  type MediaAssetListItem,
  type MediaFolderListItem,
} from "@/features/media/queries";
import {
  useCreateMediaFolder,
  useDeleteMediaAsset,
  useDeleteMediaFolder,
  useMoveMediaAssetToFolder,
  useUpdateMediaAsset,
  useUpdateMediaFolder,
  useUploadMediaAsset,
} from "@/features/media/mutations";
import { resolveMediaSrc } from "@/lib/media-src";
import {
  MEDIA_ASSET_STATUS_OPTIONS,
  formatFileSize,
  mediaAssetStatusBadgeClass as statusBadgeClass,
  mediaAssetStatusLabel as statusLabel,
} from "@/components/workspace/workspace-helpers";

// ── Context ──────────────────────────────────────────────────────────

type MediaDialogType = "delete" | "upload" | "detail" | "lightbox" | null;
type MediaAssetMode = "all" | "image" | "video" | "document";

type MediaContextValue = {
  open: MediaDialogType;
  mode: MediaAssetMode;
  activeFolderPublicId: string | null;
  folderAssets: MediaAssetListItem[] | null;
  isFolderLoading: boolean;
  currentRow: MediaAssetListItem | null;
  setOpen: (value: MediaDialogType) => void;
  selectFolder: (publicId: string | null) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<MediaAssetListItem | null>>;
  lightboxIndex: number | null;
  setLightboxIndex: (i: number | null) => void;
};

const MediaContext = createContext<MediaContextValue | null>(null);

function MediaProvider({ children, mode }: { children: React.ReactNode; mode: MediaAssetMode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<MediaDialogType>(null);
  const [activeFolderPublicId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("folder");
  });
  const [folderAssets, setFolderAssets] = useState<MediaAssetListItem[] | null>(null);
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [currentRow, setCurrentRow] = useState<MediaAssetListItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!activeFolderPublicId) {
      setFolderAssets(null);
      setIsFolderLoading(false);
      return;
    }

    let cancelled = false;
    setIsFolderLoading(true);
    void queryClient
      .fetchQuery(
        mediaListOptions({
          limit: 100,
          mimeType: modeMimePrefix(mode),
          mediaKind: modeMediaKind(mode),
          folderPublicId: activeFolderPublicId,
        }),
      )
      .then((envelope) => {
        if (!cancelled) setFolderAssets(envelope?.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setIsFolderLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFolderPublicId, mode, queryClient]);

  function selectFolder(publicId: string | null) {
    const url = new URL(window.location.href);
    if (publicId) url.searchParams.set("folder", publicId);
    else url.searchParams.delete("folder");
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <MediaContext.Provider
      value={{
        open,
        mode,
        activeFolderPublicId,
        folderAssets,
        isFolderLoading,
        currentRow,
        setOpen,
        selectFolder,
        setCurrentRow,
        lightboxIndex,
        setLightboxIndex,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error("useMedia must be used within MediaProvider");
  return context;
}

function modeMimePrefix(mode: MediaAssetMode) {
  if (mode === "image") return "image/";
  if (mode === "video") return "video/";
  return undefined;
}

function modeMediaKind(mode: MediaAssetMode) {
  if (mode === "image" || mode === "video" || mode === "document") return mode;
  return undefined;
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
  const { mode, activeFolderPublicId, folderAssets, isFolderLoading } = useMedia();
  const { data: envelope, isLoading: isBaseLoading } = useQuery(
    mediaListOptions({
      limit: 100,
      mimeType: modeMimePrefix(mode),
      mediaKind: modeMediaKind(mode),
    }),
  );
  const assets = activeFolderPublicId ? (folderAssets ?? []) : (envelope?.data ?? []);
  const isLoading = isBaseLoading || isFolderLoading;
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
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
              {isImage ? (
                <PreviewableImage
                  src={row.original.url}
                  alt={filename}
                  title={filename}
                  className="size-10 shrink-0 rounded border-border"
                  imageClassName="object-cover"
                />
              ) : (
                <button
                  type="button"
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-border bg-muted transition-opacity hover:opacity-80"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentRow(row.original);
                    setOpen("lightbox");
                  }}
                >
                  <FileImageIcon className="size-5 text-muted-foreground" />
                </button>
              )}
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
    state: { sorting, rowSelection, columnVisibility, pagination },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: (updater) => {
      if (mountedRef.current) setSorting(updater);
    },
    onRowSelectionChange: (updater) => {
      if (mountedRef.current) setRowSelection(updater);
    },
    onColumnVisibilityChange: (updater) => {
      if (mountedRef.current) setColumnVisibility(updater);
    },
    onPaginationChange: (updater) => {
      if (mountedRef.current) setPagination(updater);
    },
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
        filters={[{ columnId: "status", title: "Trạng thái", options: MEDIA_ASSET_STATUS_OPTIONS.filter((o) => o.value !== "") }]}
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

// ── Folder management ─────────────────────────────────────────────────

function MediaFolderPanel() {
  const { mode, activeFolderPublicId, selectFolder } = useMedia();
  const { data, isLoading } = useQuery(mediaFoldersOptions({ mimeType: modeMimePrefix(mode), mediaKind: modeMediaKind(mode) }));
  const folders: MediaFolderListItem[] = data?.data ?? [];
  const createFolder = useCreateMediaFolder();
  const updateFolder = useUpdateMediaFolder();
  const deleteFolder = useDeleteMediaFolder();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<MediaFolderListItem | null>(null);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createFolder.mutate(
      { name },
      {
        onSuccess: (result) => {
          const folder = result?.data;
          if (folder?.publicId) selectFolder(folder.publicId);
          setNewName("");
        },
      },
    );
  }

  function handleUpdate(publicId: string) {
    const name = editingName.trim();
    if (!name) return;
    updateFolder.mutate(
      { publicId, name },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName("");
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!folderToDelete) return;

    deleteFolder.mutate(folderToDelete.publicId, {
      onSuccess: () => {
        if (activeFolderPublicId === folderToDelete.publicId) selectFolder(null);
        setFolderToDelete(null);
      },
    });
  }

  return (
    <aside className="rounded-lg border bg-card p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Thư mục media</h2>
          <p className="text-xs text-muted-foreground">Chọn folder để lọc và upload vào đúng nơi.</p>
        </div>
        <FolderIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="mb-3 flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleCreate();
          }}
          placeholder="Tên thư mục mới"
          className="h-9"
        />
        <Button
          type="button"
          size="icon"
          className="size-9 shrink-0"
          onClick={handleCreate}
          disabled={!newName.trim() || createFolder.isPending}
          aria-label="Tạo thư mục"
        >
          <FolderPlusIcon className="size-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => selectFolder(null)}
          className={[
            "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm",
            activeFolderPublicId === null ? "bg-primary/10 text-primary" : "hover:bg-muted",
          ].join(" ")}
        >
          <span className="font-medium">Tất cả media</span>
        </button>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-9 rounded-md bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
        ) : folders.length ? (
          folders.map((folder) => (
            <div
              key={folder.publicId}
              className={[
                "group rounded-md px-2 py-2",
                activeFolderPublicId === folder.publicId ? "bg-primary/10" : "hover:bg-muted",
              ].join(" ")}
            >
              {editingId === folder.publicId ? (
                <div className="flex gap-1">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleUpdate(folder.publicId);
                      if (event.key === "Escape") {
                        setEditingId(null);
                        setEditingName("");
                      }
                    }}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="icon" className="size-8" onClick={() => handleUpdate(folder.publicId)}>
                    <CheckIcon className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => selectFolder(folder.publicId)}
                  >
                    <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{folder.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {folder.itemCount}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-70 hover:opacity-100"
                    onClick={() => {
                      setEditingId(folder.publicId);
                      setEditingName(folder.name);
                    }}
                  >
                    <Edit2Icon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive opacity-70 hover:opacity-100"
                    onClick={() => setFolderToDelete(folder)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            Chưa có thư mục nào.
          </div>
        )}
      </div>
      <WorkspaceConfirmDialog
        open={Boolean(folderToDelete)}
        onOpenChange={(open) => {
          if (!open) setFolderToDelete(null);
        }}
        title="Xoá thư mục media?"
        description={
          folderToDelete
            ? `Xoá thư mục "${folderToDelete.name}"? File bên trong không bị xoá, chỉ bỏ khỏi thư mục.`
            : ""
        }
        confirmLabel="Xoá thư mục"
        cancelLabel="Hủy"
        variant="destructive"
        isPending={deleteFolder.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </aside>
  );
}

// ── Upload dialog ─────────────────────────────────────────────────────

function MediaUploadDialog() {
  const { open, setOpen, mode, activeFolderPublicId } = useMedia();
  const upload = useUploadMediaAsset();
  const inputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  function handleClose() {
    setStaged([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setOpen(null);
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    const nextFiles = Array.from(files);
    setStaged(nextFiles);
    setPreviewUrls(nextFiles.filter((file) => file.type.startsWith("image/")).slice(0, 6).map((file) => URL.createObjectURL(file)));
  }

  function handleConfirm() {
    if (!staged.length) return;
    void (async () => {
      for (const file of staged) {
        await upload.mutateAsync({ file, folderPublicId: activeFolderPublicId });
      }
      handleClose();
    })();
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
    <Dialog open={open === "upload"} onOpenChange={(v) => {
      if (!v && open === "upload") handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{uploadDialogTitle}</DialogTitle>
        </DialogHeader>

        {!staged.length ? (
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
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {previewUrls.length ? (
              <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-md border bg-background">
                    <PreviewableImage
                      src={url}
                      alt={staged[index]?.name ?? "Preview"}
                      title={staged[index]?.name ?? "Preview"}
                      className="size-full rounded-none border-0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-lg border bg-muted">
                <FileImageIcon className="size-10 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số file</span>
                <span className="font-medium">{staged.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lưu vào thư mục</span>
                <span>{activeFolderPublicId ? "Thư mục đang chọn" : "Tất cả media"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng dung lượng</span>
                <span className="tabular-nums">{formatFileSize(staged.reduce((sum, file) => sum + file.size, 0))}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStaged([]);
                  previewUrls.forEach((url) => URL.revokeObjectURL(url));
                  setPreviewUrls([]);
                }}
                disabled={upload.isPending}
              >
                Chọn lại
              </Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={upload.isPending}>
                {upload.isPending ? "Đang tải lên..." : `Tải ${staged.length} file`}
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

  if (isImage) {
    return (
      <ImagePreviewDialog
        open={open === "lightbox"}
        onOpenChange={(next) => {
          if (!next) setOpen(null);
        }}
        src={currentRow.url}
        alt={currentRow.filename}
        title={currentRow.filename}
      />
    );
  }

  return (
    <Dialog open={open === "lightbox"} onOpenChange={(v) => !v && setOpen(null)}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          <div className="flex h-64 items-center justify-center bg-muted">
            <FileImageIcon className="size-16 text-muted-foreground" />
          </div>
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
  const { open, mode, setOpen, currentRow, setCurrentRow } = useMedia();
  const { data: folderData } = useQuery(mediaFoldersOptions({ mimeType: modeMimePrefix(mode), mediaKind: modeMediaKind(mode) }));
  const folders: MediaFolderListItem[] = folderData?.data ?? [];
  const update = useUpdateMediaAsset();
  const moveAsset = useMoveMediaAssetToFolder();
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [targetFolderPublicId, setTargetFolderPublicId] = useState<string>("__none");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentRow && open === "detail") {
      const meta = currentRow.metadata ?? null;
      setAltText(meta?.altText ?? "");
      setCaption(meta?.caption ?? "");
      setDescription(meta?.description ?? "");
      setTargetFolderPublicId("__none");
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

  function handleMoveToFolder() {
    if (!currentRow) return;
    moveAsset.mutate({
      publicId: currentRow.publicId,
      folderPublicId: targetFolderPublicId === "__none" ? null : targetFolderPublicId,
    });
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
              <PreviewableImage
                src={resolvedUrl}
                alt={currentRow.filename}
                title={currentRow.filename}
                className="max-h-[280px] min-h-[200px] w-full justify-center rounded-none border-0 bg-transparent"
                imageClassName="max-h-[280px] w-auto object-contain"
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

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Thư mục</p>
              <div className="flex gap-2">
                <Select value={targetFolderPublicId} onValueChange={setTargetFolderPublicId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn thư mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Không nằm trong thư mục</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.publicId} value={folder.publicId}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={handleMoveToFolder} disabled={moveAsset.isPending}>
                  <MoveRightIcon className="mr-2 size-4" />
                  Chuyển
                </Button>
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
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <MediaFolderPanel />
          <MediaAssetsTable />
        </div>
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
