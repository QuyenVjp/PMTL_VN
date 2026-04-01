import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useNavigateTo } from "@/lib/router-utils";
import { toast } from "sonner";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageAssetPicker } from "@/components/media/image-asset-picker";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { resolveMediaSrc } from "@/lib/media-src";
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { downloadDetailOptions } from "@/features/downloads/queries";
import {
  useUpdateDownload,
  useDeleteDownload,
  usePublishDownload,
} from "@/features/downloads/mutations";
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Đã ẩn";
  return s;
}

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

const CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Template",
  REFERENCE: "Tham khảo",
  FAQ: "FAQ",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DownloadDetailPageProps = {
  backHref: string;
  backLabel: string;
};

export function DownloadDetailPage({ backHref, backLabel }: DownloadDetailPageProps) {
  const navigateTo = useNavigateTo();
  const { publicId } = useParams({ strict: false });

  const { data: download, isLoading } = useQuery(downloadDetailOptions(publicId ?? ""));

  const updateDownload = useUpdateDownload();
  const deleteDownload = useDeleteDownload();
  const publishDownload = usePublishDownload();
  const uploadMedia = useUploadMediaAsset();
  const uploadDocRef = useRef<HTMLInputElement>(null);
  const uploadThumbRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GUIDE");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileMediaPublicId, setFileMediaPublicId] = useState("");
  const [thumbnailMediaPublicId, setThumbnailMediaPublicId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    if (!download) return;
    setTitle(download.title);
    setDescription(download.description ?? "");
    setCategory(download.category);
    setFileUrl(download.fileUrl);
    setFileType(download.fileType);
    setFileSize(String(download.fileSize));
    setFileMediaPublicId(download.fileMediaPublicId ?? "");
    setThumbnailMediaPublicId(download.thumbnailMediaPublicId ?? "");
    setFieldErrors({});
  }, [download]);

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = mediaEnvelope?.data ?? [];
  const imageAssets = useMemo(
    () => assets.filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [assets],
  );
  const selectedFileAsset = assets.find((a) => a.publicId === fileMediaPublicId) ?? null;
  const selectedThumbnailAsset = imageAssets.find((a) => a.publicId === thumbnailMediaPublicId) ?? null;

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!fileUrl.trim()) nextErrors.fileUrl = "Đường dẫn file không được để trống.";
    if (!fileType.trim()) nextErrors.fileType = "Loại file không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    if (!download) return;
    setFieldErrors({});
    updateDownload.mutate(
      {
        publicId: download.publicId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: Number(fileSize) || 0,
        fileMediaPublicId: fileMediaPublicId || null,
        thumbnailMediaPublicId: thumbnailMediaPublicId || null,
      },
      {
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  if (isLoading || !download) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {isLoading ? "Đang tải..." : "Không tìm thấy tài liệu."}
      </div>
    );
  }

  const sidebar = (
    <>
      <AdminDetailSection title="Trạng thái">
        <div className="space-y-1">
          <AdminDetailField
            label="Trạng thái"
            value={
              <Badge variant="outline" className={statusBadgeClass(download.status)}>
                {statusLabel(download.status)}
              </Badge>
            }
          />
          <AdminDetailField
            label="Danh mục"
            value={CATEGORY_LABELS[download.category] ?? download.category}
          />
          <AdminDetailField
            label="Loại file"
            value={download.fileType}
          />
          <AdminDetailField
            label="Kích thước"
            value={formatFileSize(download.fileSize)}
          />
          <AdminDetailField
            label="Người tải lên"
            value={download.uploader.displayName}
          />
          <AdminDetailField
            label="Tạo lúc"
            value={new Date(download.createdAt).toLocaleString("vi-VN")}
          />
          {download.publishedAt && (
            <AdminDetailField
              label="Xuất bản lúc"
              value={new Date(download.publishedAt).toLocaleString("vi-VN")}
            />
          )}
        </div>
      </AdminDetailSection>
    </>
  );

  return (
    <>
      <AdminDetailPage
        backHref={backHref}
        backLabel={backLabel}
        title={download.title}
        status={
          <Badge variant="outline" className={statusBadgeClass(download.status)}>
            {statusLabel(download.status)}
          </Badge>
        }
        onSave={handleSave}
        isSaving={updateDownload.isPending}
        saveLabel="Lưu"
        saveDisabled={!title.trim()}
        actions={[
          ...(download.status === "DRAFT"
            ? [{ label: "Xuất bản", onClick: () => setConfirmPublish(true) }]
            : []),
          {
            label: "Xoá",
            onClick: () => setConfirmDelete(true),
            variant: "destructive" as const,
            separator: download.status === "DRAFT",
          },
        ]}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Thông tin tài liệu">
          <div className="space-y-4">
            <AdminFormField label="Tiêu đề">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={invalidFieldClass(Boolean(fieldErrors.title))}
              />
              <FieldError message={fieldErrors.title} />
            </AdminFormField>

            <AdminFormField label="Danh mục">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUIDE">Hướng dẫn</SelectItem>
                  <SelectItem value="TEMPLATE">Template</SelectItem>
                  <SelectItem value="REFERENCE">Tham khảo</SelectItem>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Đường dẫn file">
              <Input
                value={fileUrl}
                onChange={(e) => {
                  setFileUrl(e.target.value);
                  if (fieldErrors.fileUrl) setFieldErrors((prev) => ({ ...prev, fileUrl: "" }));
                }}
                placeholder="https://..."
                className={invalidFieldClass(Boolean(fieldErrors.fileUrl))}
              />
              <FieldError message={fieldErrors.fileUrl} />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Loại file">
                <Input
                  value={fileType}
                  onChange={(e) => {
                    setFileType(e.target.value);
                    if (fieldErrors.fileType) setFieldErrors((prev) => ({ ...prev, fileType: "" }));
                  }}
                  placeholder="PDF, DOCX..."
                  className={invalidFieldClass(Boolean(fieldErrors.fileType))}
                />
                <FieldError message={fieldErrors.fileType} />
              </AdminFormField>
              <AdminFormField label="Kích thước (bytes)">
                <Input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="0"
                />
              </AdminFormField>
            </div>

            <AdminFormField label="Mô tả">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về tài liệu..."
                rows={3}
              />
            </AdminFormField>
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="File media nội bộ (tuỳ chọn)">
          <div className="space-y-3">
            <input
              ref={uploadDocRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void (async () => {
                  try {
                    const result = await uploadMedia.mutateAsync(file);
                    const payload = extractUploadMediaPayload(result);
                    const pid = payload?.publicId;
                    if (pid) setFileMediaPublicId(pid);
                    if (payload?.url) setFileUrl(payload.url);
                    if (payload?.mimeType) setFileType(payload.mimeType);
                    if (typeof payload?.size === "number") setFileSize(String(payload.size));
                  } finally {
                    event.target.value = "";
                  }
                })();
              }}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => uploadDocRef.current?.click()}>
                Upload file
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFileMediaPublicId("")}
                disabled={!fileMediaPublicId}
              >
                Bỏ chọn
              </Button>
            </div>
            <Select
              value={fileMediaPublicId || "__none__"}
              onValueChange={(value) => {
                const nextId = value === "__none__" ? "" : value;
                setFileMediaPublicId(nextId);
                const selected = assets.find((a) => a.publicId === nextId);
                if (selected) {
                  setFileUrl(selected.url);
                  setFileType(selected.mimeType);
                  setFileSize(String(selected.size));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn file từ media..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Không chọn</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.publicId} value={asset.publicId}>
                    {asset.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFileAsset && (
              <p className="text-xs text-muted-foreground">
                Đã chọn file: {selectedFileAsset.filename}
              </p>
            )}
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Thumbnail (tuỳ chọn)">
          <div className="space-y-3">
            <input
              ref={uploadThumbRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void (async () => {
                  try {
                    const result = await uploadMedia.mutateAsync(file);
                    const payload = extractUploadMediaPayload(result);
                    const pid = payload?.publicId;
                    if (pid) setThumbnailMediaPublicId(pid);
                  } finally {
                    event.target.value = "";
                  }
                })();
              }}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => uploadThumbRef.current?.click()}>
                Upload thumbnail
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setThumbnailMediaPublicId("")}
                disabled={!thumbnailMediaPublicId}
              >
                Bỏ chọn
              </Button>
            </div>
            <ImageAssetPicker
              assets={imageAssets}
              value={thumbnailMediaPublicId}
              onChange={setThumbnailMediaPublicId}
              placeholder="Chọn thumbnail từ thư viện..."
            />
            {selectedThumbnailAsset ? (
              <div className="flex items-center gap-2 rounded border p-2">
                <img
                  src={resolveMediaSrc(selectedThumbnailAsset.url) ?? undefined}
                  alt={selectedThumbnailAsset.filename}
                  className="size-12 rounded border object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{selectedThumbnailAsset.filename}</p>
                  <p className="text-xs text-muted-foreground">{selectedThumbnailAsset.publicId}</p>
                </div>
              </div>
            ) : download.thumbnailUrl ? (
              <img
                src={resolveMediaSrc(download.thumbnailUrl) ?? undefined}
                alt={download.title}
                className="h-16 w-auto rounded border object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Xuất bản tài liệu"
        description={
          <>
            Xuất bản <span className="font-semibold text-foreground">{download.title}</span>? Tài
            liệu sẽ hiển thị công khai ngay lập tức.
          </>
        }
        confirmLabel="Xuất bản"
        isPending={publishDownload.isPending}
        onConfirm={() =>
          publishDownload.mutate(download.publicId, {
            onSuccess: () => setConfirmPublish(false),
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá tài liệu"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{download.title}</span>? Thao tác
            này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteDownload.isPending}
        onConfirm={() =>
          deleteDownload.mutate(download.publicId, {
            onSuccess: () => {
              setConfirmDelete(false);
              navigateTo(backHref);
            },
          })
        }
      />
    </>
  );
}
