import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { ImageAssetPicker } from "@/components/media/image-asset-picker";
import { useCreatePost } from "@/features/content/mutations";
import { useUploadMediaAsset } from "@/features/media/mutations";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries";
import { RichTextEditor } from "@/features/content/rich-text-editor";
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";
import { extractUploadMediaPayload } from "@/lib/media-upload";

// ── Constants ─────────────────────────────────────────────────────────

const POST_TYPE_OPTIONS = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi (Transcript)", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];

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
  const uploadMedia = useUploadMediaAsset();
  const uploadRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [postType, setPostType] = useState("ARTICLE");
  const [sourceRef, setSourceRef] = useState("");
  const [bodyHtml, setBodyHtml] = useState(() => readPostBodyHtml({}));
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
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

    createPost.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || undefined,
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
          featured={featured}
          setFeatured={setFeatured}
          allowComments={allowComments}
          setAllowComments={setAllowComments}
        />
      }
    >
      <AdminDetailSection title="Thông tin cơ bản">
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

          <div className="grid items-start gap-4 md:grid-cols-2">
            <AdminFormField label="Slug">
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
          <p className="text-xs text-muted-foreground">Để trống — hệ thống sẽ tự động tạo slug từ tiêu đề.</p>

          <AdminFormField label="Nguồn tham chiếu" hint="Tham chiếu nguồn chính thống nếu có">
            <Input
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
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

      <AdminDetailSection title="Ảnh đại diện" description="Chọn ảnh từ thư viện media hoặc upload ảnh mới, luôn có preview trước khi lưu.">
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
                  if (publicId) setFeaturedImageId(publicId);
                } finally {
                  event.target.value = "";
                }
              })();
            }}
          />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()} disabled={uploadMedia.isPending}>
              {uploadMedia.isPending ? "Đang upload..." : "Upload ảnh mới"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFeaturedImageId("")}
              disabled={!featuredImageId}
            >
              Bỏ chọn
            </Button>
          </div>
          <ImageAssetPicker
            assets={imageAssets}
            value={featuredImageId}
            onChange={setFeaturedImageId}
            placeholder="Chọn ảnh đại diện từ thư viện..."
          />
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
