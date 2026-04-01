import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";

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
import { WorkspaceConfirmDialog } from "@/components/workspace";
import type { DownloadItem } from "@/features/downloads/queries";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries.js";
import { useUploadMediaAsset } from "@/features/media/mutations.js";
import {
  useCreateDownload,
  useUpdateDownload,
  useDeleteDownload,
  usePublishDownload,
  useUnpublishDownload,
} from "@/features/downloads/mutations";
import { useDownloads } from "@/features/downloads/context";
import { resolveMediaSrc } from "@/lib/media-src";
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { ImageAssetPicker } from "@/components/media/image-asset-picker";

// ── Shared field wrapper ─────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Category select (shared) ─────────────────────────────────────────

function CategorySelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
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
  );
}

// ── Create dialog ────────────────────────────────────────────────────

function DownloadCreateDialog({
  open,
  onOpenChange,
  defaultCategory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: string;
}) {
  const createDownload = useCreateDownload();
  const resolvedDefaultCategory = defaultCategory ?? "GUIDE";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(resolvedDefaultCategory);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileMediaPublicId, setFileMediaPublicId] = useState("");
  const [thumbnailMediaPublicId, setThumbnailMediaPublicId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const uploadMedia = useUploadMediaAsset();
  const uploadDocRef = useRef<HTMLInputElement>(null);
  const uploadThumbRef = useRef<HTMLInputElement>(null);
  const { data: mediaEnvelope } = useQuery({
    ...mediaListOptions({ limit: 100 }),
    enabled: open,
  });
  const assets = mediaEnvelope?.data ?? [];
  const imageAssets = useMemo(
    () => assets.filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [assets],
  );
  const selectedFileAsset = assets.find((asset) => asset.publicId === fileMediaPublicId) ?? null;
  const selectedThumbnailAsset = imageAssets.find((asset) => asset.publicId === thumbnailMediaPublicId) ?? null;

  useEffect(() => {
    if (open) {
      setCategory(resolvedDefaultCategory);
    }
  }, [open, resolvedDefaultCategory]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory(resolvedDefaultCategory);
    setFileUrl("");
    setFileType("");
    setFileSize("");
    setFileMediaPublicId("");
    setThumbnailMediaPublicId("");
    setFieldErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!fileUrl.trim()) nextErrors.fileUrl = "Đường dẫn file không được để trống.";
    if (!fileType.trim()) nextErrors.fileType = "Loại file không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    createDownload.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: Number(fileSize) || 0,
        fileMediaPublicId: fileMediaPublicId || undefined,
        thumbnailMediaPublicId: thumbnailMediaPublicId || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm tài liệu mới</DialogTitle>
          <DialogDescription>Điền thông tin tài liệu cần thêm vào thư viện.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Nhập tiêu đề..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Danh mục">
            <CategorySelect value={category} onValueChange={setCategory} />
          </Field>
          <Field label="Đường dẫn file">
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
          </Field>
          <Field label="Loại file">
            <Input
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                if (fieldErrors.fileType) setFieldErrors((prev) => ({ ...prev, fileType: "" }));
              }}
              placeholder="PDF, DOCX, MP4..."
              className={invalidFieldClass(Boolean(fieldErrors.fileType))}
            />
            <FieldError message={fieldErrors.fileType} />
          </Field>
          <Field label="Kích thước (bytes)">
            <Input
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="File media nội bộ (tuỳ chọn)">
            <input
              ref={uploadDocRef}
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadMedia.mutateAsync(file);
                  const payload = extractUploadMediaPayload(result);
                  const publicId = payload?.publicId;
                  if (publicId) setFileMediaPublicId(publicId);
                  if (payload?.url) setFileUrl(payload.url);
                  if (payload?.mimeType) setFileType(payload.mimeType);
                  if (typeof payload?.size === "number") setFileSize(String(payload.size));
                } finally {
                  event.target.value = "";
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => uploadDocRef.current?.click()}>
                Upload file
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFileMediaPublicId("")} disabled={!fileMediaPublicId}>
                Bỏ chọn
              </Button>
            </div>
            <Select
              value={fileMediaPublicId || "__none__"}
              onValueChange={(value) => {
                const nextId = value === "__none__" ? "" : value;
                setFileMediaPublicId(nextId);
                const selected = assets.find((asset) => asset.publicId === nextId);
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
            {selectedFileAsset ? (
              <p className="text-xs text-muted-foreground">
                Đã chọn file: {selectedFileAsset.filename}
              </p>
            ) : null}
          </Field>
          <Field label="Thumbnail media (tuỳ chọn)">
            <input
              ref={uploadThumbRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadMedia.mutateAsync(file);
                  const payload = extractUploadMediaPayload(result);
                  const publicId = payload?.publicId;
                  if (publicId) setThumbnailMediaPublicId(publicId);
                } finally {
                  event.target.value = "";
                }
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
            ) : null}
          </Field>
          <Field label="Mô tả">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về tài liệu..."
              rows={2}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createDownload.isPending || !title.trim()}>
            {createDownload.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ──────────────────────────────────────────────────────

function DownloadEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const updateDownload = useUpdateDownload();
  const [title, setTitle] = useState(currentRow.title);
  const [description, setDescription] = useState(currentRow.description ?? "");
  const [category, setCategory] = useState(currentRow.category);
  const [fileUrl, setFileUrl] = useState(currentRow.fileUrl);
  const [fileType, setFileType] = useState(currentRow.fileType);
  const [fileSize, setFileSize] = useState(String(currentRow.fileSize));
  const [fileMediaPublicId, setFileMediaPublicId] = useState(currentRow.fileMediaPublicId ?? "");
  const [thumbnailMediaPublicId, setThumbnailMediaPublicId] = useState(currentRow.thumbnailMediaPublicId ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const uploadMedia = useUploadMediaAsset();
  const uploadDocRef = useRef<HTMLInputElement>(null);
  const uploadThumbRef = useRef<HTMLInputElement>(null);
  const { data: mediaEnvelope } = useQuery({
    ...mediaListOptions({ limit: 100 }),
    enabled: open,
  });
  const assets = mediaEnvelope?.data ?? [];
  const imageAssets = useMemo(
    () => assets.filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [assets],
  );
  const selectedFileAsset = assets.find((asset) => asset.publicId === fileMediaPublicId) ?? null;
  const selectedThumbnailAsset = imageAssets.find((asset) => asset.publicId === thumbnailMediaPublicId) ?? null;

  useEffect(() => {
    setTitle(currentRow.title);
    setDescription(currentRow.description ?? "");
    setCategory(currentRow.category);
    setFileUrl(currentRow.fileUrl);
    setFileType(currentRow.fileType);
    setFileSize(String(currentRow.fileSize));
    setFileMediaPublicId(currentRow.fileMediaPublicId ?? "");
    setThumbnailMediaPublicId(currentRow.thumbnailMediaPublicId ?? "");
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!fileUrl.trim()) nextErrors.fileUrl = "Đường dẫn file không được để trống.";
    if (!fileType.trim()) nextErrors.fileType = "Loại file không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    updateDownload.mutate(
      {
        publicId: currentRow.publicId,
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
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
          <DialogDescription>Cập nhật thông tin tài liệu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Danh mục">
            <CategorySelect value={category} onValueChange={setCategory} />
          </Field>
          <Field label="Đường dẫn file">
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
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại file">
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
            </Field>
            <Field label="Kích thước (bytes)">
              <Input type="number" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="0" />
            </Field>
          </div>
          <Field label="File media nội bộ (tuỳ chọn)">
            <input
              ref={uploadDocRef}
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadMedia.mutateAsync(file);
                  const payload = extractUploadMediaPayload(result);
                  const publicId = payload?.publicId;
                  if (publicId) setFileMediaPublicId(publicId);
                  if (payload?.url) setFileUrl(payload.url);
                  if (payload?.mimeType) setFileType(payload.mimeType);
                  if (typeof payload?.size === "number") setFileSize(String(payload.size));
                } finally {
                  event.target.value = "";
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => uploadDocRef.current?.click()}>
                Upload file
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFileMediaPublicId("")} disabled={!fileMediaPublicId}>
                Bỏ chọn
              </Button>
            </div>
            <Select
              value={fileMediaPublicId || "__none__"}
              onValueChange={(value) => {
                const nextId = value === "__none__" ? "" : value;
                setFileMediaPublicId(nextId);
                const selected = assets.find((asset) => asset.publicId === nextId);
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
            {selectedFileAsset ? (
              <p className="text-xs text-muted-foreground">
                Đã chọn file: {selectedFileAsset.filename}
              </p>
            ) : null}
          </Field>
          <Field label="Thumbnail media (tuỳ chọn)">
            <input
              ref={uploadThumbRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadMedia.mutateAsync(file);
                  const payload = extractUploadMediaPayload(result);
                  const publicId = payload?.publicId;
                  if (publicId) setThumbnailMediaPublicId(publicId);
                } finally {
                  event.target.value = "";
                }
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
            ) : currentRow.thumbnailUrl ? (
              <img
                src={resolveMediaSrc(currentRow.thumbnailUrl) ?? undefined}
                alt={currentRow.title}
                className="h-16 w-auto rounded border object-cover"
                loading="lazy"
              />
            ) : null}
          </Field>
          <Field label="Mô tả">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn..." />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateDownload.isPending || !title.trim()}>
            {updateDownload.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Publish + Delete confirm dialogs ─────────────────────────────────

function DownloadPublishDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const publishDownload = usePublishDownload();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xuất bản tài liệu"
      description={
        <>
          Xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>? Tài
          liệu sẽ hiển thị công khai ngay lập tức.
        </>
      }
      confirmLabel="Xuất bản"
      isPending={publishDownload.isPending}
      onConfirm={() =>
        publishDownload.mutate(currentRow.publicId, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}

function DownloadDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const deleteDownload = useDeleteDownload();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xoá tài liệu"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{currentRow.title}</span>? Thao tác
          này không thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={deleteDownload.isPending}
      onConfirm={() =>
        deleteDownload.mutate(currentRow.publicId, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}

// ── Dialog switcher ──────────────────────────────────────────────────

export function DownloadsDialogs({ defaultCategory }: { defaultCategory?: string } = {}) {
  const { open, setOpen, currentRow, setCurrentRow } = useDownloads();
  const unpublishDownload = useUnpublishDownload();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <DownloadCreateDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
        defaultCategory={defaultCategory}
      />
      {currentRow && (
        <>
          <DownloadEditDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <DownloadPublishDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            currentRow={currentRow}
          />
          <WorkspaceConfirmDialog
            open={open === "unpublish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("unpublish"))}
            title="Gỡ xuất bản tài liệu"
            description={
              <>
                Gỡ xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Tài liệu sẽ chuyển về nháp.
              </>
            }
            confirmLabel="Gỡ xuất bản"
            isPending={unpublishDownload.isPending}
            onConfirm={() => unpublishDownload.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />
          <DownloadDeleteDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
