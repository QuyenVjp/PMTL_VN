import { useRef, useState, useMemo, useCallback } from "react";
import {
  CheckIcon,
  SearchIcon,
  UploadIcon,
  ImageIcon,
  FolderIcon,
  XIcon,
  FileTextIcon,
  VideoIcon,
  FileIcon,
  PlayIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { extractUploadMediaPayload } from "@/lib/media-upload";

// ── Media type tabs ────────────────────────────────────────────────────

type MediaTab = "image" | "video" | "document";

interface TabDef {
  key: MediaTab;
  label: string;
  mimePrefix: string;
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
    uploadAccept: "image/*",
    uploadLabel: "Tải ảnh lên",
    emptyLabel: "Không có ảnh nào",
    searchPlaceholder: "Tìm theo tên ảnh...",
  },
  {
    key: "video",
    label: "Video",
    mimePrefix: "video/",
    uploadAccept: "video/*",
    uploadLabel: "Tải video lên",
    emptyLabel: "Không có video nào",
    searchPlaceholder: "Tìm theo tên video...",
  },
  {
    key: "document",
    label: "Tệp tài liệu",
    mimePrefix: "application/pdf",
    uploadAccept: ".pdf",
    uploadLabel: "Tải tài liệu lên",
    emptyLabel: "Không có tài liệu nào",
    searchPlaceholder: "Tìm theo tên tài liệu...",
  },
];

// ── Virtual folder types ───────────────────────────────────────────────

type FolderKey = "all" | "this-month" | "last-month" | "older";

interface VirtualFolder {
  key: FolderKey;
  label: string;
  icon: React.ReactNode;
}

const FOLDERS: VirtualFolder[] = [
  { key: "all", label: "Tất cả", icon: <FolderIcon className="size-4" /> },
  { key: "this-month", label: "Tháng này", icon: <FolderIcon className="size-4" /> },
  { key: "last-month", label: "Tháng trước", icon: <FolderIcon className="size-4" /> },
  { key: "older", label: "Cũ hơn", icon: <FolderIcon className="size-4" /> },
];

function getAssetFolder(asset: MediaAssetListItem): FolderKey {
  const now = new Date();
  const created = new Date(asset.createdAt);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  if (created >= thisMonthStart) return "this-month";
  if (created >= lastMonthStart) return "last-month";
  return "older";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 transition-all",
        active
          ? "border-primary shadow-md shadow-primary/20"
          : "border-transparent hover:border-border",
      )}
    >
      <div className="aspect-square bg-muted">
        <img
          src={resolveMediaSrc(asset.url) ?? undefined}
          alt={asset.filename}
          className="size-full object-cover"
          loading="lazy"
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
  const [activeFolder, setActiveFolder] = useState<FolderKey>("all");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string>(value);
  const uploadRef = useRef<HTMLInputElement>(null);

  const uploadMedia = useUploadMediaAsset();

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const { data, isLoading } = useQuery(
    mediaListOptions({ limit: 100, mimeType: currentTab.mimePrefix }),
  );
  const assets: MediaAssetListItem[] = data?.data ?? [];

  const folderCounts = useMemo(() => {
    const counts: Record<FolderKey, number> = { all: 0, "this-month": 0, "last-month": 0, older: 0 };
    for (const asset of assets) {
      counts.all++;
      counts[getAssetFolder(asset)]++;
    }
    return counts;
  }, [assets]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (activeFolder !== "all" && getAssetFolder(asset) !== activeFolder) return false;
      if (keyword && !asset.filename.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [assets, activeFolder, search]);

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
          const result = await uploadMedia.mutateAsync(file);
          const payload = extractUploadMediaPayload(result);
          if (payload?.publicId) {
            lastId = payload.publicId;
          }
        }
        if (lastId) setPendingId(lastId);
      })();
    },
    [uploadMedia],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setPendingId(value);
        setActiveTab(defaultTab);
        setActiveFolder("all");
        setSearch("");
      }
      onOpenChange(next);
    },
    [value, defaultTab, onOpenChange],
  );

  const handleTabChange = useCallback((tab: MediaTab) => {
    setActiveTab(tab);
    setActiveFolder("all");
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
          {/* Left sidebar — virtual folders */}
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
              <p className="hidden md:block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Thư mục
              </p>
              <nav className="flex flex-row md:flex-col gap-1.5 md:space-y-0.5 w-max md:w-auto">
                {FOLDERS.map((folder) => (
                  <button
                    key={folder.key}
                    type="button"
                    onClick={() => setActiveFolder(folder.key)}
                    className={cn(
                      "flex items-center gap-2 md:gap-2.5 rounded-md px-3 py-1.5 md:px-2 md:py-2 text-sm transition-colors border md:border-transparent",
                      activeFolder === folder.key
                        ? "bg-primary/10 text-primary font-medium border-primary/20 md:border-transparent"
                        : "text-foreground/70 border-border bg-background/60 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        activeFolder === folder.key ? "text-primary" : "text-muted-foreground",
                        "hidden sm:inline-flex",
                      )}
                    >
                      {folder.icon}
                    </span>
                    <span className="text-left">{folder.label}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground ml-1 md:ml-auto md:flex-1 md:text-right">
                      {folderCounts[folder.key]}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Search bar */}
            <div className="flex-none border-b px-4 py-3">
              <div className="relative max-w-sm">
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
            </div>

            {/* Asset grid / list */}
            <ScrollArea className="flex-1">
              <div className="p-4">
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
                        <img
                          src={resolveMediaSrc(selectedAsset.url) ?? undefined}
                          alt={selectedAsset.filename}
                          className="size-10 shrink-0 rounded-md border object-cover"
                          loading="lazy"
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

  const { data } = useQuery(mediaListOptions({ limit: 100, mimeType: fieldTab.mimePrefix }));
  const assets: MediaAssetListItem[] = data?.data ?? [];
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

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted/40",
          value || currentImageUrl ? "border-border" : "border-dashed",
        )}
      >
        {displayUrl ? (
          fieldTab.key === "image" ? (
            <img
              src={displayUrl}
              alt="Preview"
              className="size-12 shrink-0 rounded-md border object-cover"
              loading="lazy"
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
        <div className="min-w-0 flex-1">
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
        </div>
        <span className="shrink-0 text-xs text-primary font-medium">Thay đổi →</span>
      </button>
    </>
  );
}
