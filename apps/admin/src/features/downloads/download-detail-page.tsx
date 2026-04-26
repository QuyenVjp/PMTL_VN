import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useNavigateTo } from "@/lib/router-utils";
import { z } from "zod";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
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
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { mediaListOptions } from "@/features/media/queries";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { downloadDetailOptions } from "@/features/downloads/queries";
import {
  useUpdateDownload,
  useDeleteDownload,
  usePublishDownload,
} from "@/features/downloads/mutations";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";

const downloadDetailSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  description: z.string().trim().optional(),
  category: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1, "Đường dẫn file không được để trống."),
  fileType: z.string().trim().min(1, "Loại file không được để trống."),
  fileSize: z.coerce.number().catch(0),
});

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

function readPublicId(params: unknown): string {
  if (!params || typeof params !== "object" || !("publicId" in params)) return "";
  const publicId = (params as { publicId?: unknown }).publicId;
  return typeof publicId === "string" ? publicId : "";
}

export function DownloadDetailPage({ backHref, backLabel }: DownloadDetailPageProps) {
  const navigateTo = useNavigateTo();
  const publicId = readPublicId(useParams({ strict: false }));

  const { data: download, isLoading } = useQuery(downloadDetailOptions(publicId));

  const updateDownload = useUpdateDownload();
  const deleteDownload = useDeleteDownload();
  const publishDownload = usePublishDownload();
  const uploadMedia = useUploadMediaAsset();
  const uploadDocRef = useRef<HTMLInputElement>(null);

  const form = useAdminZodForm(downloadDetailSchema, {
    defaultValues: {
      title: "",
      description: "",
      category: "GUIDE",
      fileUrl: "",
      fileType: "",
      fileSize: 0,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const [fileMediaPublicId, setFileMediaPublicId] = useState("");
  const [thumbnailMediaPublicId, setThumbnailMediaPublicId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    if (!download) return;
    form.reset({
      title: download.title,
      description: download.description ?? "",
      category: download.category,
      fileUrl: download.fileUrl,
      fileType: download.fileType,
      fileSize: download.fileSize,
    });
    setFileMediaPublicId(download.fileMediaPublicId ?? "");
    setThumbnailMediaPublicId(download.thumbnailMediaPublicId ?? "");
  }, [download]);

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = mediaEnvelope?.data ?? [];
  const selectedFileAsset = assets.find((a) => a.publicId === fileMediaPublicId) ?? null;

  const handleSave = form.handleSubmit((formValues) => {
    if (!download) return;
    updateDownload.mutate(
      {
        publicId: download.publicId,
        title: formValues.title,
        description: formValues.description || undefined,
        category: formValues.category,
        fileUrl: formValues.fileUrl,
        fileType: formValues.fileType,
        fileSize: Number(formValues.fileSize) || 0,
        fileMediaPublicId: fileMediaPublicId || null,
        thumbnailMediaPublicId: thumbnailMediaPublicId || null,
      },
      {
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  if (isLoading || !download) {
    return isLoading ? <WorkspaceDetailSkeleton /> : <div className="flex h-64 items-center justify-center text-muted-foreground">Không tìm thấy tài liệu.</div>;
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
        onSave={() => {
          void handleSave();
        }}
        isSaving={updateDownload.isPending}
        saveLabel="Lưu"
        saveDisabled={!values.title.trim()}
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
                {...form.register("title")}
                className={invalidFieldClass(Boolean(errors.title))}
              />
              <FieldError message={errors.title?.message} />
            </AdminFormField>

            <AdminFormField label="Danh mục">
              <Select
                value={values.category}
                onValueChange={(value) => form.setValue("category", value, { shouldDirty: true })}
              >
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
                {...form.register("fileUrl")}
                placeholder="https://..."
                className={invalidFieldClass(Boolean(errors.fileUrl))}
              />
              <FieldError message={errors.fileUrl?.message} />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Loại file">
                <Input
                  {...form.register("fileType")}
                  placeholder="PDF, DOCX..."
                  className={invalidFieldClass(Boolean(errors.fileType))}
                />
                <FieldError message={errors.fileType?.message} />
              </AdminFormField>
              <AdminFormField label="Kích thước (bytes)">
                <Input
                  type="number"
                  {...form.register("fileSize")}
                  placeholder="0"
                />
              </AdminFormField>
            </div>

            <AdminFormField label="Mô tả">
              <Textarea
                {...form.register("description")}
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
                    if (payload?.url) form.setValue("fileUrl", payload.url, { shouldDirty: true, shouldValidate: true });
                    if (payload?.mimeType) form.setValue("fileType", payload.mimeType, { shouldDirty: true, shouldValidate: true });
                    if (typeof payload?.size === "number") form.setValue("fileSize", payload.size, { shouldDirty: true });
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
                  form.setValue("fileUrl", selected.url, { shouldDirty: true, shouldValidate: true });
                  form.setValue("fileType", selected.mimeType, { shouldDirty: true, shouldValidate: true });
                  form.setValue("fileSize", selected.size, { shouldDirty: true });
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

        <AdminDetailSection title="Thumbnail (tuỳ chọn)" description="Chọn ảnh từ thư viện media hoặc upload ảnh mới ngay trong cửa sổ chọn ảnh.">
          <MediaPickerField
            value={thumbnailMediaPublicId}
            onChange={setThumbnailMediaPublicId}
            currentImageUrl={download.thumbnailUrl}
            placeholder="Chọn thumbnail từ thư viện..."
          />
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
