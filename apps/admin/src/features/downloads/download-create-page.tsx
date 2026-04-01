import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigateTo } from "@/lib/router-utils";
import { toast } from "sonner";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
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
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { useCreateDownload } from "@/features/downloads/mutations";
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";

type DownloadCreatePageProps = {
  backHref: string;
  backLabel: string;
  defaultCategory?: string;
};

export function DownloadCreatePage({ backHref, backLabel, defaultCategory }: DownloadCreatePageProps) {
  const navigateTo = useNavigateTo();
  const createDownload = useCreateDownload();
  const uploadMedia = useUploadMediaAsset();
  const uploadDocRef = useRef<HTMLInputElement>(null);
  const uploadThumbRef = useRef<HTMLInputElement>(null);

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

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = mediaEnvelope?.data ?? [];
  const imageAssets = useMemo(
    () => assets.filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [assets],
  );
  const selectedFileAsset = assets.find((a) => a.publicId === fileMediaPublicId) ?? null;

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
          navigateTo(backHref);
        },
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  return (
    <AdminDetailPage
      backHref={backHref}
      backLabel={backLabel}
      title="Thêm tài liệu mới"
      onSave={handleSave}
      isSaving={createDownload.isPending}
      saveLabel="Tạo"
      saveDisabled={!title.trim()}
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
              placeholder="Nhập tiêu đề..."
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
                placeholder="PDF, DOCX, MP4..."
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
                  const publicId = payload?.publicId;
                  if (publicId) setFileMediaPublicId(publicId);
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
                  const publicId = payload?.publicId;
                  if (publicId) setThumbnailMediaPublicId(publicId);
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
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
