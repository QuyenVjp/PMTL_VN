import { useEffect, useRef, useState } from "react";
import { useNavigateTo } from "@/lib/router-utils";
import { z } from "zod";
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
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { useCreateGuide } from "@/features/guides/mutations";
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

function buildGuideContent(bodyHtml: string): Record<string, unknown> {
  const normalizedBody = normalizeEditorHtml(bodyHtml);
  return normalizedBody ? { bodyHtml: normalizedBody } : {};
}

type GuideCreatePageProps = {
  backHref: string;
  backLabel: string;
  defaultCategory?: string;
};

const guideCreateSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  category: z.string().trim().min(1),
  sortOrder: z.coerce.number().catch(0),
  versionNote: z.string().trim().optional(),
});

export function GuideCreatePage({ backHref, backLabel, defaultCategory }: GuideCreatePageProps) {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateGuide();

  const resolvedDefaultCategory = defaultCategory ?? "BEGINNER";

  const form = useAdminZodForm(guideCreateSchema, {
    defaultValues: {
      title: "",
      slug: "",
      category: resolvedDefaultCategory,
      sortOrder: 0,
      versionNote: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, slugStatus } = useSlugField({ title: values.title, entityType: "GUIDE" });
  const lastSlugRef = useRef(slug);
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverMediaPublicId, setCoverMediaPublicId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    createGuide.mutate(
      {
        title: formValues.title,
        slug: slug.trim() || undefined,
        category: formValues.category,
        content: buildGuideContent(bodyHtml),
        coverMediaPublicId: coverMediaPublicId || undefined,
        sortOrder: Number(formValues.sortOrder) || 0,
        versionNote: formValues.versionNote || undefined,
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

  const sidebar = (
    <>
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
      onSave={() => {
        void handleSave();
      }}
      isSaving={createGuide.isPending}
      saveLabel="Tạo"
      saveDisabled={!values.title.trim() || slugStatus === "taken"}
      sidebar={sidebar}
    >
      <AdminDetailSection title="Thông tin cơ bản">
        <div className="space-y-4">
          <AdminFormField label="Tiêu đề">
            <Input
              {...form.register("title")}
              placeholder="Nhập tiêu đề hướng dẫn..."
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
                  placeholder="tu-dong-tao-tu-tieu-de"
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
            {!defaultCategory && (
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
            )}
            {defaultCategory && (
              <AdminFormField label="Danh mục">
                <div className="flex h-9 items-center">
                  <Badge variant="outline">{values.category}</Badge>
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
          placeholder="Chọn ảnh cover từ thư viện..."
        />
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
