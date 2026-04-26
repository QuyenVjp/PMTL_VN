import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

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
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { useCreatePost } from "@/features/content/mutations";
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

// ── Constants ─────────────────────────────────────────────────────────

const POST_TYPE_OPTIONS = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi (Transcript)", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];

const postCreateSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  postType: z.string().trim().min(1),
  sourceRef: z.string().trim().optional(),
});

function excerptTextLength(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function normalizeEditorHtml(value: string): string {
  return excerptTextLength(value) > 0 ? value.trim() : "";
}

function readPostBodyHtml(content: unknown): string {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "";
  }

  const candidate = content as Record<string, unknown>;
  if (typeof candidate.bodyHtml === "string") return candidate.bodyHtml;
  if (typeof candidate.html === "string") return candidate.html;
  if (typeof candidate.body === "string") return candidate.body;
  return "";
}

function buildPostContent(bodyHtml: string): Record<string, unknown> {
  const normalizedBody = normalizeEditorHtml(bodyHtml);
  return normalizedBody ? { bodyHtml: normalizedBody } : {};
}

// ── Sidebar ───────────────────────────────────────────────────────────

function CreateSidebar({
  featured,
  setFeatured,
  allowComments,
  setAllowComments,
}: {
  featured: boolean;
  setFeatured: (v: boolean) => void;
  allowComments: boolean;
  setAllowComments: (v: boolean) => void;
}) {
  return (
    <>
      <AdminDetailSection title="Cài đặt">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="create-featured"
              checked={featured}
              onCheckedChange={(v) => setFeatured(Boolean(v))}
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <label htmlFor="create-featured" className="cursor-pointer text-sm font-medium leading-none">
                Bài nổi bật
              </label>
              <span className="text-xs text-muted-foreground">Hiển thị ở vị trí ưu tiên</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="create-allow-comments"
              checked={allowComments}
              onCheckedChange={(v) => setAllowComments(Boolean(v))}
              className="mt-0.5"
            />
            <label htmlFor="create-allow-comments" className="cursor-pointer text-sm font-medium leading-none mt-0.5">
              Cho phép bình luận
            </label>
          </div>
        </div>
      </AdminDetailSection>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function PostCreatePage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const form = useAdminZodForm(postCreateSchema, {
    defaultValues: {
      title: "",
      postType: "ARTICLE",
      sourceRef: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, slugStatus } = useSlugField({ title: values.title, entityType: "POST" });
  const [bodyHtml, setBodyHtml] = useState(() => readPostBodyHtml({}));
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("root.server", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." });
      return;
    }

    createPost.mutate(
      {
        title: formValues.title,
        slug: slug.trim() || undefined,
        postType: formValues.postType,
        sourceRef: formValues.sourceRef || undefined,
        content: buildPostContent(bodyHtml),
        featuredImageId: featuredImageId.trim() || undefined,
        featured,
        allowComments,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/noi-dung/bai-viet" });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/bai-viet"
      backLabel="Bài viết"
      title="Tạo bài viết mới"
      status={
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          Nháp
        </Badge>
      }
      onSave={() => {
        void handleSave();
      }}
      isSaving={createPost.isPending}
      saveLabel="Tạo"
      saveDisabled={!values.title.trim() || slugStatus === "taken"}
      sidebar={
        <CreateSidebar
          featured={featured}
          setFeatured={setFeatured}
          allowComments={allowComments}
          setAllowComments={setAllowComments}
        />
      }
    >
      <AdminDetailSection title="Thông tin cơ bản">
        <div className="space-y-4">
          <FieldError message={errors.root?.server?.message} />
          <AdminFormField label="Tiêu đề *">
            <Input
              {...form.register("title")}
              placeholder="Nhập tiêu đề bài viết..."
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </AdminFormField>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <AdminFormField label="Slug">
              <div className="relative">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  className={invalidFieldClass(slugStatus === "taken")}
                  style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
                />
                {slugStatus !== "idle" && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SlugStatusIcon status={slugStatus} />
                  </span>
                )}
              </div>
              <FieldError message={slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined} />
            </AdminFormField>

            <AdminFormField label="Loại bài viết">
              <Select value={values.postType} onValueChange={(value) => form.setValue("postType", value, { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
          </div>
<AdminFormField label="Nguồn tham chiếu" hint="Tham chiếu nguồn chính thống nếu có">
            <Input
              {...form.register("sourceRef")}
              placeholder="VD: Pháp thoại 2024-08-08..."
            />
          </AdminFormField>

          <AdminFormField label="Nội dung bài viết" hint="Dùng editor đầy đủ để biên tập nội dung hiển thị công khai.">
            <RichTextEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              placeholder="Soạn nội dung bài viết, chèn đoạn mở đầu, bullet và trích dẫn dễ đọc cho người lớn tuổi..."
              minHeight={320}
            />
          </AdminFormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Ảnh đại diện" description="Chọn ảnh từ thư viện media hoặc upload ảnh mới ngay trong cửa sổ chọn ảnh.">
        <MediaPickerField
          value={featuredImageId}
          onChange={setFeaturedImageId}
          placeholder="Chọn ảnh đại diện từ thư viện..."
        />
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
