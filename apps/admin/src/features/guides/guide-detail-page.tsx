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
import { ImageAssetPicker } from "@/components/media/image-asset-picker";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { resolveMediaSrc } from "@/lib/media-src";
import { extractUploadMediaPayload } from "@/lib/media-upload";
import { guideDetailOptions } from "@/features/guides/queries";
import { useUpdateGuide, usePublishGuide, useDeleteGuide } from "@/features/guides/mutations";
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

function readGuideBodyHtml(content: unknown): string {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "";
  }

  const candidate = content as Record<string, unknown>;
  if (typeof candidate.bodyHtml === "string") return candidate.bodyHtml;
  if (typeof candidate.html === "string") return candidate.html;
  if (typeof candidate.body === "string") return candidate.body;
  return "";
}

function buildGuideContent(bodyHtml: string): Record<string, unknown> {
  const normalizedBody = normalizeEditorHtml(bodyHtml);
  return normalizedBody ? { bodyHtml: normalizedBody } : {};
}

const CATEGORY_LABELS: Record<string, string> = {
  BEGINNER: "Nhập môn",
  DAILY_PRACTICE: "Hành trì hằng ngày",
  LITTLE_HOUSE: "Ngôi Nhà Nhỏ",
  LIFE_RELEASE: "Phóng sanh",
  GENERAL: "Chung",
};

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

type GuideDetailPageProps = {
  backHref: string;
  backLabel: string;
};

export function GuideDetailPage({ backHref, backLabel }: GuideDetailPageProps) {
  const navigateTo = useNavigateTo();
  const { publicId } = useParams({ strict: false });

  const { data: guide, isLoading } = useQuery(guideDetailOptions(publicId ?? ""));

  const updateGuide = useUpdateGuide();
  const publishGuide = usePublishGuide();
  const deleteGuide = useDeleteGuide();
  const uploadMedia = useUploadMediaAsset();
  const uploadRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("BEGINNER");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [versionNote, setVersionNote] = useState("");
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    if (!guide) return;
    setTitle(guide.title);
    setSlug(guide.slug);
    setCategory(guide.category);
    setBodyHtml(readGuideBodyHtml(guide.content));
    setSortOrder("0");
    setVersionNote("");
    setCoverMediaPublicId(guide.coverMediaPublicId ?? "");
    setFieldErrors({});
  }, [guide]);

  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100, mimeType: "image/" }));
  const imageAssets = useMemo(
    () => (mediaEnvelope?.data ?? []).filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [mediaEnvelope],
  );
  const selectedCover = imageAssets.find((a) => a.publicId === coverMediaPublicId) ?? null;

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    if (!guide) return;
    setFieldErrors({});
    updateGuide.mutate(
      {
        publicId: guide.publicId,
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        content: buildGuideContent(bodyHtml),
        coverMediaPublicId: coverMediaPublicId || null,
        sortOrder: Number(sortOrder) || undefined,
        versionNote: versionNote.trim() || undefined,
      },
      {
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  if (isLoading || !guide) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {isLoading ? "Đang tải..." : "Không tìm thấy hướng dẫn."}
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
              <Badge variant="outline" className={statusBadgeClass(guide.status)}>
                {statusLabel(guide.status)}
              </Badge>
            }
          />
          <AdminDetailField
            label="Danh mục"
            value={CATEGORY_LABELS[guide.category] ?? guide.category}
          />
          <AdminDetailField
            label="Tác giả"
            value={guide.author.displayName}
          />
          <AdminDetailField
            label="Tạo lúc"
            value={new Date(guide.createdAt).toLocaleString("vi-VN")}
          />
          <AdminDetailField
            label="Cập nhật lúc"
            value={new Date(guide.updatedAt).toLocaleString("vi-VN")}
          />
          {guide.publishedAt && (
            <AdminDetailField
              label="Xuất bản lúc"
              value={new Date(guide.publishedAt).toLocaleString("vi-VN")}
            />
          )}
        </div>
      </AdminDetailSection>

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
              id="detail-guide-featured"
              checked={isFeatured}
              onCheckedChange={(v) => setIsFeatured(v === true)}
            />
            <label htmlFor="detail-guide-featured" className="cursor-pointer text-sm font-medium">
              Nổi bật
            </label>
          </div>
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id="detail-guide-downloadable"
              checked={isDownloadable}
              onCheckedChange={(v) => setIsDownloadable(v === true)}
            />
            <label htmlFor="detail-guide-downloadable" className="cursor-pointer text-sm font-medium">
              Có thể tải xuống
            </label>
          </div>
        </div>
      </AdminDetailSection>
    </>
  );

  return (
    <>
      <AdminDetailPage
        backHref={backHref}
        backLabel={backLabel}
        title={guide.title}
        status={
          <Badge variant="outline" className={statusBadgeClass(guide.status)}>
            {statusLabel(guide.status)}
          </Badge>
        }
        onSave={handleSave}
        isSaving={updateGuide.isPending}
        saveLabel="Lưu"
        saveDisabled={!title.trim()}
        actions={[
          ...(guide.status === "DRAFT"
            ? [{ label: "Xuất bản", onClick: () => setConfirmPublish(true) }]
            : []),
          {
            label: "Xoá",
            onClick: () => setConfirmDelete(true),
            variant: "destructive" as const,
            separator: guide.status === "DRAFT",
          },
        ]}
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
                className={invalidFieldClass(Boolean(fieldErrors.title))}
              />
              <FieldError message={fieldErrors.title} />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Slug">
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </AdminFormField>
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
            {!selectedCover && guide.coverImageUrl ? (
              <img
                src={resolveMediaSrc(guide.coverImageUrl) ?? undefined}
                alt={guide.title}
                className="h-20 w-auto rounded border object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Xuất bản hướng dẫn"
        description={
          <>
            Xuất bản <span className="font-semibold text-foreground">{guide.title}</span>? Bài viết
            sẽ hiển thị công khai ngay lập tức.
          </>
        }
        confirmLabel="Xuất bản"
        isPending={publishGuide.isPending}
        onConfirm={() =>
          publishGuide.mutate(guide.publicId, {
            onSuccess: () => setConfirmPublish(false),
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá hướng dẫn"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{guide.title}</span>? Thao tác này
            không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteGuide.isPending}
        onConfirm={() =>
          deleteGuide.mutate(guide.publicId, {
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
