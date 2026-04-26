import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigateTo } from "@/lib/router-utils";
import { z } from "zod";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
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
import { useCreateDownload } from "@/features/downloads/mutations";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";

const downloadCreateSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  description: z.string().trim().optional(),
  category: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1, "Đường dẫn file không được để trống."),
  fileType: z.string().trim().min(1, "Loại file không được để trống."),
  fileSize: z.coerce.number().catch(0),
});

type DownloadCreatePageProps = {
  backHref: string;
  backLabel: string;
  defaultCategory?: string;
};

export function DownloadCreatePage({ backHref, backLabel, defaultCategory }: DownloadCreatePageProps) {
  const navigateTo = useNavigateTo();
  const createDownload = useCreateDownload();

  const resolvedDefaultCategory = defaultCategory ?? "GUIDE";

  const [fileMediaPublicId, setFileMediaPublicId] = useState("");
  const [thumbnailMediaPublicId, setThumbnailMediaPublicId] = useState("");
  const form = useAdminZodForm(downloadCreateSchema, {
    defaultValues: {
      title: "",
      description: "",
      category: resolvedDefaultCategory,
      fileUrl: "",
      fileType: "",
      fileSize: 0,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100 }));
  const assets = mediaEnvelope?.data ?? [];
  const selectedFileAsset = assets.find((a) => a.publicId === fileMediaPublicId) ?? null;

  useEffect(() => {
    if (!selectedFileAsset) return;
    form.setValue("fileUrl", selectedFileAsset.url, { shouldDirty: true, shouldValidate: true });
    form.setValue("fileType", selectedFileAsset.mimeType, { shouldDirty: true, shouldValidate: true });
    form.setValue("fileSize", selectedFileAsset.size, { shouldDirty: true });
  }, [form, selectedFileAsset]);

  const handleSave = form.handleSubmit((formValues) => {
    createDownload.mutate(
      {
        title: formValues.title,
        description: formValues.description || undefined,
        category: formValues.category,
        fileUrl: formValues.fileUrl,
        fileType: formValues.fileType,
        fileSize: Number(formValues.fileSize) || 0,
        fileMediaPublicId: fileMediaPublicId || undefined,
        thumbnailMediaPublicId: thumbnailMediaPublicId || undefined,
      },
      {
        onSuccess: () => {
          navigateTo(backHref);
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <AdminDetailPage
      backHref={backHref}
      backLabel={backLabel}
      title="Thêm tài liệu mới"
      onSave={() => {
        void handleSave();
      }}
      isSaving={createDownload.isPending}
      saveLabel="Tạo"
      saveDisabled={!values.title.trim()}
    >
      <AdminDetailSection title="Thông tin tài liệu">
        <div className="space-y-4">
          <AdminFormField label="Tiêu đề">
            <Input
              {...form.register("title")}
              placeholder="Nhập tiêu đề..."
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
                placeholder="PDF, DOCX, MP4..."
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
        <div className="space-y-2">
          <MediaPickerField
            value={fileMediaPublicId}
            onChange={setFileMediaPublicId}
            defaultTab="document"
            placeholder="Chọn hoặc upload tệp từ thư viện media..."
          />
          {selectedFileAsset && (
            <p className="text-xs text-muted-foreground">
              Đã chọn tệp: {selectedFileAsset.filename}
            </p>
          )}
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Thumbnail (tuỳ chọn)" description="Chọn ảnh từ thư viện media hoặc upload ảnh mới ngay trong cửa sổ chọn ảnh.">
        <MediaPickerField
          value={thumbnailMediaPublicId}
          onChange={setThumbnailMediaPublicId}
          placeholder="Chọn thumbnail từ thư viện..."
        />
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
