import { useRef, useState, useMemo, useCallback } from "react";
import {
  CheckIcon,
  SearchIcon,
  UploadIcon,
  ImageIcon,
  FolderIcon,
  FolderPlusIcon,
  Maximize2Icon,
  XIcon,
  FileTextIcon,
  VideoIcon,
  FileIcon,
  PlayIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ImagePreviewDialog, PreviewableImage } from "@/components/media/image-preview-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";
import {
  mediaFoldersOptions,
  mediaListOptions,
  type MediaAssetListItem,
  type MediaFolderListItem,
} from "@/features/media/queries";
import { useCreateMediaFolder, useUploadMediaAsset } from "@/features/media/mutations";
import { extractUploadMediaPayload } from "@/lib/media-upload";

// ── Media type tabs ────────────────────────────────────────────────────

type MediaTab = "image" | "video" | "document";

interface TabDef {
  key: MediaTab;
  label: string;
  mimePrefix?: string;
  mediaKind: MediaTab;
  uploadAccept: string;
  uploadLabel: string;
  emptyLabel: string;
  searchPlaceholder: string;
}

const TABS: TabDef[] = [
  {
    key: "image",
    label: "Ảnh",
    mimePrefix: "image/",
    mediaKind: "image",
    uploadAccept: "image/*",
    uploadLabel: "Tải ảnh lên",
    emptyLabel: "Không có ảnh nào",
    searchPlaceholder: "Tìm theo tên ảnh...",
  },
  {
    key: "video",
    label: "Video",
    mimePrefix: "video/",
    mediaKind: "video",
    uploadAccept: "video/*",
    uploadLabel: "Tải video lên",
    emptyLabel: "Không có video nào",
    searchPlaceholder: "Tìm theo tên video...",
  },
  {
    key: "document",
    label: "Tệp tài liệu",
    mediaKind: "document",
    uploadAccept: ".pdf,.csv,.zip,.json,.xls,.xlsx,.doc,.docx",
    uploadLabel: "Tải tài liệu lên",
    emptyLabel: "Không có tài liệu nào",
    searchPlaceholder: "Tìm theo tên tài liệu...",
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaImagePreview({
  asset,
  className,
}: {
  asset: Pick<MediaAssetListItem, "url" | "filename">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaSrc(asset.url);

  if (!src || failed || src.startsWith("data:image/gif;base64,")) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <ImageIcon className="size-7 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={asset.filename}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// ── Asset grid items ───────────────────────────────────────────────────

function ImageGridItem({
  asset,
  active,
  onToggle,
}: {
  asset: MediaAssetListItem;
  active: boolean;
  onToggle: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 transition-all",
        active
          ? "border-primary shadow-md shadow-primary/20"
          : "border-transparent hover:border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="block w-full text-left"
        aria-label={active ? `Bỏ chọn ${asset.filename}` : `Chọn ${asset.filename}`}
      >
        <div className="aspect-square bg-muted">
          <MediaImagePreview
            asset={asset}
            className="size-full object-cover"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="truncate text-[10px] leading-tight text-white">{asset.filename}</p>
        </div>
        {active ? (
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <CheckIcon className="size-3" />
          </span>
        ) : null}
      </button>
      <button
        type="button"
        className="absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(event) => {
          event.stopPropagation();
          setPreviewOpen(true);
        }}
        aria-label={`Xem preview ${asset.filename}`}
      >
        <Maximize2Icon className="size-3.5" />
      </button>
      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={asset.url}
        alt={asset.filename}
        title={asset.filename}
      />
    </div>
  );
}

function VideoGridItem({
  asset,
  active,
  onToggle,
}: {
  asset: MediaAssetListItem;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 transition-all text-left",
        active
          ? "border-primary shadow-md shadow-primary/20"
          : "border-transparent hover:border-border",
      )}
    >
      <div className="aspect-video bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="flex size-10 items-center justify-center rounded-full bg-black/20 group-hover:bg-black/30 transition-colors">
            <PlayIcon className="size-5 text-white/80" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
          <p className="truncate text-[10px] leading-tight text-white">{asset.filename}</p>
          <p className="text-[9px] text-white/60">{formatFileSize(asset.size)}</p>
        </div>
      </div>
      {active ? (
        <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <CheckIcon className="size-3" />
        </span>
      ) : null}
    </button>
  );
}

function DocumentListItem({
  asset,
  active,
  onToggle,
}: {
  asset: MediaAssetListItem;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 w-full rounded-lg border-2 px-3 py-2.5 text-left transition-all",
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-50 border border-red-100">
        <FileTextIcon className="size-5 text-red-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{asset.filename}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</p>
      </div>
      {active ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-3" />
        </span>
      ) : null}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────

interface MediaPickerModalProps {
  value: string;
  onChange: (publicId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: MediaTab;
}

export function MediaPickerModal({
  value,
  onChange,
  open,
  onOpenChange,
  defaultTab = "image",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>(defaultTab);
  const [activeFolderPublicId, setActiveFolderPublicId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [pendingId, setPendingId] = useState<string>(value);
  const uploadRef = useRef<HTMLInputElement>(null);

  const uploadMedia = useUploadMediaAsset();
  const createFolder = useCreateMediaFolder();

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const { data: folderData, isLoading: foldersLoading } = useQuery(
    mediaFoldersOptions({ mimeType: currentTab.mimePrefix, mediaKind: currentTab.mediaKind }),
  );
  const folders: MediaFolderListItem[] = folderData?.data ?? [];

  const activeFolder = folders.find((folder) => folder.publicId === activeFolderPublicId) ?? null;

  const { data, isLoading } = useQuery(
    mediaListOptions({
      limit: 100,
      mimeType: currentTab.mimePrefix,
      mediaKind: currentTab.mediaKind,
      search: search.trim() || undefined,
      folderPublicId: activeFolderPublicId ?? undefined,
    }),
  );
  // Phase 4.2 batch 3a: media list returns { items, pagination }.
  const assets: MediaAssetListItem[] = data?.items ?? [];

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (keyword && !asset.filename.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [assets, search]);

  const selectedAsset = assets.find((a) => a.publicId === pendingId) ?? null;

  const handleConfirm = useCallback(() => {
    onChange(pendingId);
    onOpenChange(false);
  }, [pendingId, onChange, onOpenChange]);

  const handleUpload = useCallback(
    (files: FileList | File[]) => {
      void (async () => {
        let lastId = "";
        for (const file of Array.from(files)) {
          const result = await uploadMedia.mutateAsync({
            file,
            folderPublicId: activeFolderPublicId,
          });
          const payload = extractUploadMediaPayload(result);
          if (payload?.publicId) {
            lastId = payload.publicId;
          }
        }
        if (lastId) setPendingId(lastId);
      })();
    },
    [activeFolderPublicId, uploadMedia],
  );

  const handleCreateFolder = useCallback(() => {
    const name = newFolderName.trim();
    if (!name) return;
    void (async () => {
      const result = await createFolder.mutateAsync({ name });
      const folder = result?.data;
      if (folder?.publicId) {
        setActiveFolderPublicId(folder.publicId);
      }
      setNewFolderName("");
      setIsCreatingFolder(false);
    })();
  }, [createFolder, newFolderName]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setPendingId(value);
        setActiveTab(defaultTab);
        setActiveFolderPublicId(null);
        setSearch("");
        setNewFolderName("");
        setIsCreatingFolder(false);
      }
      onOpenChange(next);
    },
    [value, defaultTab, onOpenChange],
  );

  const handleTabChange = useCallback((tab: MediaTab) => {
    setActiveTab(tab);
    setActiveFolderPublicId(null);
    setSearch("");
    setPendingId("");
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] gap-0 overflow-hidden p-0 h-[82vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-none border-b px-6 py-4">
          <DialogTitle className="text-base font-semibold">Thư viện media</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-none border-b bg-muted/20 px-6">
          <nav className="flex gap-0" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* Left sidebar — media folders */}
          <aside className="flex-none w-full md:w-52 border-b md:border-b-0 md:border-r bg-muted/30 flex flex-col shrink-0">
            <div className="order-1 md:order-2 md:mt-auto p-3 md:px-3 md:pb-4 flex flex-row md:flex-col items-center justify-between gap-4 border-b md:border-0 bg-background/50 md:bg-transparent">
              <span className="md:hidden text-sm font-semibold text-foreground">Thư mục</span>
              <div className="w-auto md:w-full shrink-0">
                <input
                  ref={uploadRef}
                  type="file"
                  multiple
                  accept={currentTab.uploadAccept}
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleUpload(files);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="w-full gap-2 shadow-sm"
                  onClick={() => uploadRef.current?.click()}
                  disabled={uploadMedia.isPending}
                >
                  <UploadIcon className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {uploadMedia.isPending ? "Đang upload..." : currentTab.uploadLabel}
                  </span>
                  <span className="sm:hidden">{uploadMedia.isPending ? "Đang tải..." : "Tải lên"}</span>
                </Button>
              </div>
            </div>

            <div className="order-2 md:order-1 px-3 pt-3 pb-2 overflow-x-auto whitespace-nowrap md:pt-4 w-full">
              <div className="hidden md:flex items-center justify-between gap-2 px-2 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Thư mục
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setIsCreatingFolder((current) => !current)}
                  aria-label="Tạo thư mục media"
                >
                  <FolderPlusIcon className="size-4" />
                </Button>
              </div>
              {isCreatingFolder ? (
                <div className="mb-3 rounded-md border bg-background p-2">
                  <Input
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleCreateFolder();
                      if (event.key === "Escape") {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    placeholder="Tên thư mục"
                    className="h-8"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }}
                    >
                      Huỷ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || createFolder.isPending}
                    >
                      Tạo
                    </Button>
                  </div>
                </div>
              ) : null}
              <nav className="flex flex-row md:flex-col gap-1.5 md:space-y-0.5 w-max md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveFolderPublicId(null)}
                  className={cn(
                    "flex items-center gap-2 md:gap-2.5 rounded-md px-3 py-1.5 md:px-2 md:py-2 text-sm transition-colors border md:border-transparent",
                    activeFolderPublicId === null
                      ? "bg-primary/10 text-primary font-medium border-primary/20 md:border-transparent"
                      : "text-foreground/70 border-border bg-background/60 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <FolderIcon className="hidden size-4 sm:inline-flex" />
                  <span className="text-left">Tất cả</span>
                </button>
                {foldersLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-36 md:w-full" />
                  ))
                ) : folders.length ? (
                  folders.map((folder) => (
                  <button
                    key={folder.publicId}
                    type="button"
                    onClick={() => setActiveFolderPublicId(folder.publicId)}
                    className={cn(
                      "flex items-center gap-2 md:gap-2.5 rounded-md px-3 py-1.5 md:px-2 md:py-2 text-sm transition-colors border md:border-transparent",
                      activeFolderPublicId === folder.publicId
                        ? "bg-primary/10 text-primary font-medium border-primary/20 md:border-transparent"
                        : "text-foreground/70 border-border bg-background/60 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        activeFolderPublicId === folder.publicId ? "text-primary" : "text-muted-foreground",
                        "hidden sm:inline-flex",
                      )}
                    >
                      <FolderIcon className="size-4" />
                    </span>
                    <span className="max-w-28 truncate text-left md:max-w-[7.5rem]">{folder.name}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground ml-1 md:ml-auto md:flex-1 md:text-right">
                      {folder.itemCount}
                    </span>
                  </button>
                  ))
                ) : null}
              </nav>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-2 md:hidden"
                onClick={() => setIsCreatingFolder((current) => !current)}
              >
                <FolderPlusIcon className="size-4" />
                Tạo thư mục
              </Button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Search bar */}
            <div className="flex-none border-b px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9"
                    placeholder={currentTab.searchPlaceholder}
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-4" />
                    </button>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  Upload mới sẽ lưu vào:{" "}
                  <span className="font-medium text-foreground">
                    {activeFolder?.name ?? "Tất cả media"}
                  </span>
                </div>
              </div>
            </div>

            {/* Asset grid / list */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {!activeFolderPublicId && !search.trim() && folders.length > 0 ? (
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Thư mục
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {folders.map((folder) => (
                        <button
                          key={folder.publicId}
                          type="button"
                          onClick={() => setActiveFolderPublicId(folder.publicId)}
                          className="flex min-h-24 flex-col items-start justify-between rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FolderIcon className="size-5" />
                          </span>
                          <span className="mt-3 w-full truncate text-sm font-medium text-foreground">
                            {folder.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{folder.itemCount} tệp</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {isLoading ? (
                  <div
                    className={cn(
                      "grid gap-3",
                      activeTab === "document"
                        ? "grid-cols-1"
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5",
                    )}
                  >
                    {Array.from({ length: activeTab === "document" ? 6 : 12 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className={cn(
                          activeTab === "document" ? "h-12" : "aspect-square",
                        )}
                      />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    {activeTab === "image" ? (
                      <ImageIcon className="size-10 text-muted-foreground/40 mb-3" />
                    ) : activeTab === "video" ? (
                      <VideoIcon className="size-10 text-muted-foreground/40 mb-3" />
                    ) : (
                      <FileIcon className="size-10 text-muted-foreground/40 mb-3" />
                    )}
                    <p className="text-sm text-muted-foreground">{currentTab.emptyLabel}</p>
                    {search ? (
                      <p className="text-xs text-muted-foreground mt-1">Thử từ khoá khác</p>
                    ) : null}
                  </div>
                ) : activeTab === "image" ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filtered.map((asset) => (
                      <ImageGridItem
                        key={asset.publicId}
                        asset={asset}
                        active={pendingId === asset.publicId}
                        onToggle={() =>
                          setPendingId(pendingId === asset.publicId ? "" : asset.publicId)
                        }
                      />
                    ))}
                  </div>
                ) : activeTab === "video" ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {filtered.map((asset) => (
                      <VideoGridItem
                        key={asset.publicId}
                        asset={asset}
                        active={pendingId === asset.publicId}
                        onToggle={() =>
                          setPendingId(pendingId === asset.publicId ? "" : asset.publicId)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filtered.map((asset) => (
                      <DocumentListItem
                        key={asset.publicId}
                        asset={asset}
                        active={pendingId === asset.publicId}
                        onToggle={() =>
                          setPendingId(pendingId === asset.publicId ? "" : asset.publicId)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom bar — selected preview + actions */}
            <div className="flex-none border-t bg-muted/20 px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Selected preview */}
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  {selectedAsset ? (
                    <>
                      {activeTab === "image" ? (
                        <PreviewableImage
                          src={selectedAsset.url}
                          alt={selectedAsset.filename}
                          title={selectedAsset.filename}
                          className="size-10 shrink-0"
                        />
                      ) : activeTab === "video" ? (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                          <VideoIcon className="size-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-red-50">
                          <FileTextIcon className="size-4 text-red-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{selectedAsset.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {activeTab === "image" &&
                          selectedAsset.width &&
                          selectedAsset.height
                            ? `${selectedAsset.width}×${selectedAsset.height} · `
                            : ""}
                          {formatFileSize(selectedAsset.size)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "image"
                        ? "Chưa chọn ảnh nào"
                        : activeTab === "video"
                        ? "Chưa chọn video nào"
                        : "Chưa chọn tài liệu nào"}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex shrink-0 items-center justify-end w-full sm:w-auto gap-2">
                  {pendingId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingId("")}
                    >
                      Bỏ chọn
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    Huỷ
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={!pendingId && !value}
                  >
                    {pendingId ? "Xác nhận chọn" : "Bỏ chọn"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Trigger wrapper — drop-in replacement for the old picker ───────────

interface MediaPickerFieldProps {
  value: string;
  onChange: (publicId: string) => void;
  currentImageUrl?: string | null;
  placeholder?: string;
  defaultTab?: MediaTab;
}

const MEDIA_FIELD_COPY: Record<
  MediaTab,
  {
    selectedTitle: string;
    currentTitle: string;
    currentHint: string;
    emptyIcon: React.ReactNode;
  }
> = {
  image: {
    selectedTitle: "Đã chọn ảnh",
    currentTitle: "Ảnh hiện tại",
    currentHint: "Nhấn để đổi ảnh khác",
    emptyIcon: <ImageIcon className="size-5 text-muted-foreground" />,
  },
  video: {
    selectedTitle: "Đã chọn video",
    currentTitle: "Video hiện tại",
    currentHint: "Nhấn để đổi video khác",
    emptyIcon: <VideoIcon className="size-5 text-muted-foreground" />,
  },
  document: {
    selectedTitle: "Đã chọn tệp",
    currentTitle: "Tệp hiện tại",
    currentHint: "Nhấn để đổi tệp khác",
    emptyIcon: <FileTextIcon className="size-5 text-muted-foreground" />,
  },
};

export function MediaPickerField({
  value,
  onChange,
  currentImageUrl,
  placeholder = "Chọn ảnh từ thư viện...",
  defaultTab = "image",
}: MediaPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const fieldTab = TABS.find((tab) => tab.key === defaultTab) ?? TABS[0];
  const fieldCopy = MEDIA_FIELD_COPY[fieldTab.key];

  const { data } = useQuery(mediaListOptions({ limit: 100, mimeType: fieldTab.mimePrefix, mediaKind: fieldTab.mediaKind }));
  // Phase 4.2 batch 3a: media list returns { items, pagination }.
  const assets: MediaAssetListItem[] = data?.items ?? [];
  const selectedAsset = assets.find((a) => a.publicId === value) ?? null;

  const displayUrl = selectedAsset
    ? (resolveMediaSrc(selectedAsset.url) ?? undefined)
    : currentImageUrl ?? undefined;

  return (
    <>
      <MediaPickerModal
        value={value}
        onChange={onChange}
        open={open}
        onOpenChange={setOpen}
        defaultTab={defaultTab}
      />

      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted/40",
          value || currentImageUrl ? "border-border" : "border-dashed",
        )}
      >
        {displayUrl ? (
          fieldTab.key === "image" ? (
            <PreviewableImage
              src={displayUrl}
              alt={selectedAsset?.filename ?? "Preview ảnh"}
              title={selectedAsset?.filename ?? fieldCopy.currentTitle}
              className="size-12 shrink-0"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
              {fieldCopy.emptyIcon}
            </div>
          )
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted">
            {fieldCopy.emptyIcon}
          </div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
          {selectedAsset ? (
            <>
              <p className="text-sm font-medium text-foreground">{fieldCopy.selectedTitle}</p>
              <p className="truncate text-xs text-muted-foreground">{selectedAsset.filename}</p>
            </>
          ) : currentImageUrl ? (
            <>
              <p className="text-sm font-medium text-foreground">{fieldCopy.currentTitle}</p>
              <p className="truncate text-xs text-muted-foreground">{fieldCopy.currentHint}</p>
            </>
          ) : (
            <p className="text-muted-foreground">{placeholder}</p>
          )}
        </button>
        <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => setOpen(true)}>
          Thay đổi
        </Button>
      </div>
    </>
  );
}

interface MediaMultiPickerFieldProps {
  values: string[];
  onChange: (publicIds: string[]) => void;
  onSelectedAssetsChange?: (assets: MediaAssetListItem[]) => void;
  defaultTab?: MediaTab;
  allowedTabs?: MediaTab[];
  placeholder?: string;
}

const MULTI_PICKER_PAGE_SIZE = 24;

export function MediaMultiPickerField({
  values,
  onChange,
  onSelectedAssetsChange,
  defaultTab = "image",
  allowedTabs,
  placeholder = "Chọn media từ thư viện...",
}: MediaMultiPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MediaTab>(defaultTab);
  const [activeFolderPublicId, setActiveFolderPublicId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pendingIds, setPendingIds] = useState<string[]>(values);
  const [pendingAssetMap, setPendingAssetMap] = useState<Record<string, MediaAssetListItem>>({});
  const uploadRef = useRef<HTMLInputElement>(null);

  const tabs = useMemo(
    () => TABS.filter((tab) => !allowedTabs || allowedTabs.includes(tab.key)),
    [allowedTabs],
  );
  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0] ?? TABS[0];
  const offset = pageIndex * MULTI_PICKER_PAGE_SIZE;

  const { data: folderData } = useQuery({
    ...mediaFoldersOptions({ mimeType: currentTab.mimePrefix, mediaKind: currentTab.mediaKind }),
    enabled: open,
  });
  const folders: MediaFolderListItem[] = folderData?.data ?? [];

  const { data, isLoading, error } = useQuery({
    ...mediaListOptions({
      limit: MULTI_PICKER_PAGE_SIZE,
      offset,
      search: search.trim() || undefined,
      mimeType: currentTab.mimePrefix,
      mediaKind: currentTab.mediaKind,
      folderPublicId: activeFolderPublicId ?? undefined,
    }),
    enabled: open,
  });

  // Phase 4.2 batch 3a: media list returns { items, pagination }.
  const assets: MediaAssetListItem[] = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MULTI_PICKER_PAGE_SIZE));
  const pendingSet = useMemo(() => new Set(pendingIds), [pendingIds]);
  const selectedOnPage = assets.filter((asset) => pendingSet.has(asset.publicId));
  const uploadMedia = useUploadMediaAsset();

  function resetBrowseState(tab: MediaTab) {
    setActiveTab(tab);
    setActiveFolderPublicId(null);
    setSearch("");
    setPageIndex(0);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setPendingIds(values);
      setPendingAssetMap({});
      resetBrowseState(defaultTab);
    }
    setOpen(next);
  }

  function toggleAsset(asset: MediaAssetListItem) {
    setPendingIds((current) => {
      if (current.includes(asset.publicId)) {
        setPendingAssetMap((currentMap) => {
          const nextMap = { ...currentMap };
          delete nextMap[asset.publicId];
          return nextMap;
        });
        return current.filter((item) => item !== asset.publicId);
      }

      setPendingAssetMap((currentMap) => ({ ...currentMap, [asset.publicId]: asset }));
      return [...current, asset.publicId];
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPageIndex(0);
  }

  function handleUpload(files: FileList | File[]) {
    void (async () => {
      const uploadedIds: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadMedia.mutateAsync({
          file,
          folderPublicId: activeFolderPublicId,
        });
        const payload = extractUploadMediaPayload(result);
        if (payload?.publicId) uploadedIds.push(payload.publicId);
      }
      if (uploadedIds.length) {
        setPendingIds((current) => [...new Set([...current, ...uploadedIds])]);
      }
    })();
  }

  const activeFolder = folders.find((folder) => folder.publicId === activeFolderPublicId) ?? null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[82vh] w-[95vw] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">
              Chọn media ({pendingIds.length} đã chọn)
            </DialogTitle>
          </DialogHeader>

          <div className="border-b bg-muted/20 px-6">
            <nav className="flex gap-0" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => resetBrowseState(tab.key)}
                  className={cn(
                    "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex min-h-0 flex-1">
            <aside className="hidden w-56 shrink-0 border-r bg-muted/30 p-3 md:block">
              <div className="mb-3 flex items-center justify-between gap-2 px-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Thư mục</p>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFolderPublicId(null);
                    setPageIndex(0);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                    activeFolderPublicId === null ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  <FolderIcon className="size-4" />
                  Tất cả media
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.publicId}
                    type="button"
                    onClick={() => {
                      setActiveFolderPublicId(folder.publicId);
                      setPageIndex(0);
                    }}
                    className={cn(
                      "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                      activeFolderPublicId === folder.publicId ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                  >
                    <FolderIcon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder.itemCount}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b px-4 py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative max-w-md flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => handleSearchChange(event.target.value)}
                      className="h-9 pl-8"
                      placeholder={currentTab.searchPlaceholder}
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      >
                        <XIcon className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {activeFolder?.name ?? "Tất cả media"} · {total.toLocaleString("vi-VN")} tệp
                    </span>
                    <input
                      ref={uploadRef}
                      type="file"
                      multiple
                      accept={currentTab.uploadAccept}
                      className="hidden"
                      onChange={(event) => {
                        if (event.target.files?.length) handleUpload(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => uploadRef.current?.click()}
                      disabled={uploadMedia.isPending}
                    >
                      <UploadIcon className="mr-2 size-4" />
                      {uploadMedia.isPending ? "Đang tải..." : "Tải lên"}
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {isLoading ? (
                    <div className={cn("grid gap-3", activeTab === "document" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6")}>
                      {Array.from({ length: activeTab === "document" ? 8 : 12 }).map((_, index) => (
                        <Skeleton key={index} className={activeTab === "document" ? "h-14" : "aspect-square"} />
                      ))}
                    </div>
                  ) : error ? (
                    <p className="py-12 text-center text-sm text-destructive">Không tải được media. Vui lòng thử lại.</p>
                  ) : assets.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">Không có media phù hợp.</p>
                  ) : activeTab === "document" ? (
                    <div className="space-y-2">
                      {assets.map((asset) => (
                        <DocumentListItem
                          key={asset.publicId}
                          asset={asset}
                          active={pendingSet.has(asset.publicId)}
                          onToggle={() => toggleAsset(asset)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={cn("grid gap-3", activeTab === "video" ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6")}>
                      {assets.map((asset) =>
                        activeTab === "video" ? (
                          <VideoGridItem
                            key={asset.publicId}
                            asset={asset}
                            active={pendingSet.has(asset.publicId)}
                            onToggle={() => toggleAsset(asset)}
                          />
                        ) : (
                          <ImageGridItem
                            key={asset.publicId}
                            asset={asset}
                            active={pendingSet.has(asset.publicId)}
                            onToggle={() => toggleAsset(asset)}
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t bg-muted/20 px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 text-sm">
                    <span className="font-medium">{pendingIds.length} media đã chọn</span>
                    {selectedOnPage.length ? (
                      <span className="ml-2 text-muted-foreground">
                        Trang này: {selectedOnPage.map((asset) => asset.filename).slice(0, 2).join(", ")}
                        {selectedOnPage.length > 2 ? "..." : ""}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pageIndex === 0}
                        onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                      >
                        Trước
                      </Button>
                      <span className="px-2 text-sm text-muted-foreground">
                        Trang {pageIndex + 1} / {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!pagination?.hasMore}
                        onClick={() => setPageIndex((current) => current + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                    {pendingIds.length ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPendingIds([])}>
                        Bỏ chọn hết
                      </Button>
                    ) : null}
                    <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                      Huỷ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onChange(pendingIds);
                        onSelectedAssetsChange?.(pendingIds.map((id) => pendingAssetMap[id]).filter(Boolean));
                        setOpen(false);
                      }}
                    >
                      Xác nhận chọn
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted/40"
      >
        <span className="min-w-0">
          <span className="block font-medium text-foreground">
            {values.length ? `${values.length} media đã chọn` : placeholder}
          </span>
          <span className="block text-xs text-muted-foreground">
            Tìm kiếm, lọc thư mục và chọn theo từng trang.
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-primary">Mở thư viện</span>
      </button>
    </>
  );
}
