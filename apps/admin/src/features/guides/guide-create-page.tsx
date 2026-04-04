import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigateTo } from "@/lib/router-utils";
import { toast } from "sonner";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageAssetPicker } from "@/components/media/image-asset-picker";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { useCreateGuide } from "@/features/guides/mutations";
import { RichTextEditor } from "@/features/content/rich-text-editor";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation";

function editorTextLength(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function normalizeEditorHtml(value: string): string {
  return editorTextLength(value) > 0 ? value.trim() : "";
}

function buildGuideContent(bodyHtml: string): Record<string, unknown> {
  const normalizedBody = normalizeEditorHtml(bodyHtml);
  return normalizedBody ? { bodyHtml: normalizedBody } : {};
}

type GuideCreatePageProps = {
  backHref: string;
  backLabel: string;
  defaultCategory?: string;
};

export function GuideCreatePage({ backHref, backLabel, defaultCategory }: GuideCreatePageProps) {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateGuide();
  const uploadMedia = useUploadMediaAsset();
  const uploadRef = useRef<HTMLInputElement>(null);

  const resolvedDefaultCategory = defaultCategory ?? "BEGINNER";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(resolvedDefaultCategory);
  const [bodyHtml, setBodyHtml] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [versionNote, setVersionNote] = useState("");
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100, mimeType: "image/" }));
  const imageAssets = useMemo(
    () => (mediaEnvelope?.data ?? []).filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [mediaEnvelope],
  );

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setFieldErrors({});
    createGuide.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        content: buildGuideContent(bodyHtml),
        coverMediaPublicId: coverMediaPublicId || undefined,
        sortOrder: Number(sortOrder) || 0,
        versionNote: versionNote.trim() || undefined,
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

  const sidebar = (
    <>
      <AdminDetailSection title="Cài đặt hiển thị">
        <div className="space-y-4">
          <AdminFormField label="Thứ tự hiển thị">
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </AdminFormField>
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id="create-guide-featured"
              checked={isFeatured}
              onCheckedChange={(v) => setIsFeatured(v === true)}
            />
            <label htmlFor="create-guide-featured" className="cursor-pointer text-sm font-medium">
              Nổi bật
            </label>
          </div>
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id="create-guide-downloadable"
              checked={isDownloadable}
              onCheckedChange={(v) => setIsDownloadable(v === true)}
            />
            <label htmlFor="create-guide-downloadable" className="cursor-pointer text-sm font-medium">
              Có thể tải xuống
            </label>
          </div>
        </div>
      </AdminDetailSection>
    </>
  );

  return (
    <AdminDetailPage
      backHref={backHref}
      backLabel={backLabel}
      title="Tạo hướng dẫn mới"
      onSave={handleSave}
      isSaving={createGuide.isPending}
      saveLabel="Tạo"
      saveDisabled={!title.trim()}
      sidebar={sidebar}
    >
      <AdminDetailSection title="Thông tin cơ bản">
        <div className="space-y-4">
          <AdminFormField label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Nhập tiêu đề hướng dẫn..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </AdminFormField>

          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Slug">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tự-động-tạo"
              />
            </AdminFormField>
            {!defaultCategory && (
              <AdminFormField label="Danh mục">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Nhập môn</SelectItem>
                    <SelectItem value="DAILY_PRACTICE">Hành trì hằng ngày</SelectItem>
                    <SelectItem value="LITTLE_HOUSE">Ngôi Nhà Nhỏ</SelectItem>
                    <SelectItem value="LIFE_RELEASE">Phóng sanh</SelectItem>
                    <SelectItem value="GENERAL">Chung</SelectItem>
                  </SelectContent>
                </Select>
              </AdminFormField>
            )}
            {defaultCategory && (
              <AdminFormField label="Danh mục">
                <div className="flex h-9 items-center">
                  <Badge variant="outline">{category}</Badge>
                </div>
              </AdminFormField>
            )}
          </div>

          <AdminFormField label="Nội dung" hint="Nội dung chi tiết của bài hướng dẫn">
            <RichTextEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              placeholder="Biên tập nội dung hướng dẫn theo bố cục rõ ràng, có thể dùng bullet và trích dẫn..."
              minHeight={320}
            />
          </AdminFormField>

          <AdminFormField label="Ghi chú phiên bản" hint="Dùng để ghi lại thay đổi nội dung">
            <Input
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              placeholder="VD: Cập nhật theo pháp thoại 2025..."
            />
          </AdminFormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Ảnh cover">
        <div className="space-y-3">
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void (async () => {
                try {
                  const result = await uploadMedia.mutateAsync(file);
                  const publicId = extractUploadMediaPayload(result)?.publicId;
                  if (publicId) setCoverMediaPublicId(publicId);
                } finally {
                  event.target.value = "";
                }
              })();
            }}
          />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()}>
              Upload ảnh mới
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCoverMediaPublicId("")}
              disabled={!coverMediaPublicId}
            >
              Bỏ chọn
            </Button>
          </div>
          <ImageAssetPicker
            assets={imageAssets}
            value={coverMediaPublicId}
            onChange={setCoverMediaPublicId}
            placeholder="Chọn ảnh cover từ thư viện..."
          />
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
