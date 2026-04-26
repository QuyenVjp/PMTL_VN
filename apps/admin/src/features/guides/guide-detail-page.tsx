import { useEffect, useRef, useState } from "react";
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
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { guideDetailOptions } from "@/features/guides/queries";
import { useUpdateGuide, usePublishGuide, useDeleteGuide } from "@/features/guides/mutations";
import { RichTextEditor } from "@/features/content/rich-text-editor";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";
import { LoaderCircleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  if (status === "taken") return <XCircleIcon className="size-4 text-destructive" />;
  return null;
}

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

const guideDetailSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  category: z.string().trim().min(1),
  sortOrder: z.coerce.number().catch(0),
  versionNote: z.string().trim().optional(),
});

function readPublicId(params: unknown): string {
  if (!params || typeof params !== "object" || !("publicId" in params)) return "";
  const publicId = (params as { publicId?: unknown }).publicId;
  return typeof publicId === "string" ? publicId : "";
}

export function GuideDetailPage({ backHref, backLabel }: GuideDetailPageProps) {
  const navigateTo = useNavigateTo();
  const publicId = readPublicId(useParams({ strict: false }));

  const { data: guide, isLoading } = useQuery(guideDetailOptions(publicId));

  const updateGuide = useUpdateGuide();
  const publishGuide = usePublishGuide();
  const deleteGuide = useDeleteGuide();

  const form = useAdminZodForm(guideDetailSchema, {
    defaultValues: {
      title: "",
      slug: "",
      category: "BEGINNER",
      sortOrder: 0,
      versionNote: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, setSlugFromServer, slugStatus } = useSlugField({
    title: values.title,
    entityType: "GUIDE",
    excludePublicId: guide?.publicId,
    initialSlug: guide?.slug,
  });
  const lastSlugRef = useRef(slug);
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  useEffect(() => {
    if (!guide) return;
    form.reset({
      title: guide.title,
      slug: guide.slug,
      category: guide.category,
      sortOrder: 0,
      versionNote: "",
    });
    setSlugFromServer(guide.slug, guide.title);
    setBodyHtml(readGuideBodyHtml(guide.content));
    setCoverMediaPublicId(guide.coverMediaPublicId ?? "");
  }, [guide, form, setSlugFromServer]);

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    if (!guide) return;
    updateGuide.mutate(
      {
        publicId: guide.publicId,
        title: formValues.title,
        slug: slug.trim() || undefined,
        category: formValues.category,
        content: buildGuideContent(bodyHtml),
        coverMediaPublicId: coverMediaPublicId || null,
        sortOrder: Number(formValues.sortOrder) || undefined,
        versionNote: formValues.versionNote || undefined,
      },
      {
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  if (isLoading || !guide) {
    return isLoading ? <WorkspaceDetailSkeleton /> : <div className="flex h-64 items-center justify-center text-muted-foreground">Không tìm thấy hướng dẫn.</div>;
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
              {...form.register("sortOrder")}
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
        onSave={() => {
          void handleSave();
        }}
        isSaving={updateGuide.isPending}
        saveLabel="Lưu"
        saveDisabled={!values.title.trim() || slugStatus === "taken"}
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
                {...form.register("title")}
                className={invalidFieldClass(Boolean(errors.title))}
              />
              <FieldError message={errors.title?.message} />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Slug">
                <div className="relative">
                  <Input
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      form.clearErrors("slug");
                      form.setValue("slug", e.target.value, { shouldDirty: true });
                      setSlug(e.target.value);
                    }}
                    className={invalidFieldClass(slugStatus === "taken" || Boolean(errors.slug))}
                    aria-invalid={slugStatus === "taken" || Boolean(errors.slug)}
                    style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
                  />
                  {(slugStatus !== "idle" || errors.slug) && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <SlugStatusIcon status={errors.slug ? "taken" : slugStatus} />
                    </span>
                  )}
                </div>
                <FieldError message={errors.slug?.message ?? (slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined)} />
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
                {...form.register("versionNote")}
                placeholder="VD: Cập nhật theo pháp thoại 2025..."
              />
            </AdminFormField>
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Ảnh cover" description="Chọn ảnh từ thư viện media hoặc upload ảnh mới ngay trong cửa sổ chọn ảnh.">
          <MediaPickerField
            value={coverMediaPublicId}
            onChange={setCoverMediaPublicId}
            currentImageUrl={guide.coverImageUrl}
            placeholder="Chọn ảnh cover từ thư viện..."
          />
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
