import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
import { Textarea } from "@/components/ui/textarea";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
import { useCreatePost } from "@/features/content/mutations";
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";

// ── Constants ─────────────────────────────────────────────────────────

const POST_TYPE_OPTIONS = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi (Transcript)", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];

const EXCERPT_MAX_LENGTH = 500;

// ── Sidebar ───────────────────────────────────────────────────────────

function CreateSidebar({
  featuredImageId,
  setFeaturedImageId,
  featured,
  setFeatured,
  allowComments,
  setAllowComments,
}: {
  featuredImageId: string;
  setFeaturedImageId: (v: string) => void;
  featured: boolean;
  setFeatured: (v: boolean) => void;
  allowComments: boolean;
  setAllowComments: (v: boolean) => void;
}) {
  return (
    <>
      <AdminDetailSection title="Ảnh đại diện">
        <AdminFormField label="ID ảnh đại diện" hint="Nhập publicId của media asset">
          <Input
            value={featuredImageId}
            onChange={(e) => setFeaturedImageId(e.target.value)}
            placeholder="VD: img_abc123..."
          />
        </AdminFormField>
      </AdminDetailSection>

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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [postType, setPostType] = useState("ARTICLE");
  const [sourceRef, setSourceRef] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (excerpt.trim().length > EXCERPT_MAX_LENGTH)
      nextErrors.excerpt = "Tóm tắt tối đa 500 ký tự.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setFieldErrors({});

    createPost.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        featuredImageId: featuredImageId.trim() || undefined,
        content: {},
        featured,
        allowComments,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/noi-dung/bai-viet" });
        },
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

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
      onSave={handleSave}
      isSaving={createPost.isPending}
      saveLabel="Tạo"
      saveDisabled={!title.trim()}
      sidebar={
        <CreateSidebar
          featuredImageId={featuredImageId}
          setFeaturedImageId={setFeaturedImageId}
          featured={featured}
          setFeatured={setFeatured}
          allowComments={allowComments}
          setAllowComments={setAllowComments}
        />
      }
    >
      <AdminDetailSection title="Nội dung chính">
        <div className="space-y-4">
          <AdminFormField label="Tiêu đề *">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Nhập tiêu đề bài viết..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </AdminFormField>

          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Slug" hint="Để trống — tự động tạo từ tiêu đề">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tự-động-tạo"
              />
            </AdminFormField>

            <AdminFormField label="Loại bài viết">
              <Select value={postType} onValueChange={setPostType}>
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
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder="VD: Pháp thoại 2024-08-08..."
            />
          </AdminFormField>

          <AdminFormField label="Tóm tắt">
            <Textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                if (fieldErrors.excerpt) setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
              }}
              placeholder="Mô tả ngắn về bài viết..."
              maxLength={EXCERPT_MAX_LENGTH}
              className={invalidFieldClass(Boolean(fieldErrors.excerpt))}
              rows={3}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <FieldError message={fieldErrors.excerpt} />
              <span className={cn(Boolean(fieldErrors.excerpt) && "text-destructive")}>
                {excerpt.length}/{EXCERPT_MAX_LENGTH}
              </span>
            </div>
          </AdminFormField>
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
