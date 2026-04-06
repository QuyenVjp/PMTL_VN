import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { RichTextEditor } from "@/features/content/rich-text-editor";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import {
  useUpdatePost,
  usePublishPost,
  useUnpublishPost,
  useDeletePost,
} from "@/features/content/mutations";
import { postDetailOptions } from "@/features/content/queries";
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

// ── Badge helpers ─────────────────────────────────────────────────────

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
}

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Đã ẩn";
  return s;
}

// ── Sidebar ───────────────────────────────────────────────────────────

function DetailSidebar({
  status,
  publishedAt,
  createdAt,
  updatedAt,
  featured,
  setFeatured,
  allowComments,
  setAllowComments,
}: {
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  setFeatured: (v: boolean) => void;
  allowComments: boolean;
  setAllowComments: (v: boolean) => void;
}) {
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("vi-VN") : null;

  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Trạng thái" value={
          <Badge variant="outline" className={statusBadgeClass(status)}>
            {statusLabel(status)}
          </Badge>
        } />
        <AdminDetailField label="Xuất bản lúc" value={fmt(publishedAt)} />
        <AdminDetailField label="Tạo lúc" value={fmt(createdAt)} />
        <AdminDetailField label="Cập nhật lúc" value={fmt(updatedAt)} />
      </AdminDetailSection>

      <AdminDetailSection title="Cài đặt">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="detail-featured"
              checked={featured}
              onCheckedChange={(v) => setFeatured(Boolean(v))}
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <label htmlFor="detail-featured" className="cursor-pointer text-sm font-medium leading-none">
                Bài nổi bật
              </label>
              <span className="text-xs text-muted-foreground">Hiển thị ở vị trí ưu tiên</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="detail-allow-comments"
              checked={allowComments}
              onCheckedChange={(v) => setAllowComments(Boolean(v))}
              className="mt-0.5"
            />
            <label htmlFor="detail-allow-comments" className="cursor-pointer text-sm font-medium leading-none mt-0.5">
              Cho phép bình luận
            </label>
          </div>
        </div>
      </AdminDetailSection>
    </>
  );
}

function FeaturedImageSection({
  featuredImageId,
  setFeaturedImageId,
  currentFeaturedImageUrl,
}: {
  featuredImageId: string;
  setFeaturedImageId: (value: string) => void;
  currentFeaturedImageUrl: string | null;
}) {
  return (
    <AdminDetailSection
      title="Ảnh đại diện"
      description="Chọn ảnh từ thư viện media hoặc upload ảnh mới ngay trong cửa sổ chọn ảnh."
    >
      <MediaPickerField
        value={featuredImageId}
        onChange={(publicId) => {
          setFeaturedImageId(publicId);
        }}
        currentImageUrl={currentFeaturedImageUrl}
        placeholder="Chọn ảnh đại diện từ thư viện..."
      />
    </AdminDetailSection>
  );
}

// ── Editable form ─────────────────────────────────────────────────────

function EditableForm({
  title,
  setTitle,
  slug,
  setSlug,
  postType,
  setPostType,
  sourceRef,
  setSourceRef,
  bodyHtml,
  setBodyHtml,
  fieldErrors,
  setFieldErrors,
}: {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  postType: string;
  setPostType: (v: string) => void;
  sourceRef: string;
  setSourceRef: (v: string) => void;
  bodyHtml: string;
  setBodyHtml: (v: string) => void;
  fieldErrors: FieldErrors;
  setFieldErrors: (updater: (prev: FieldErrors) => FieldErrors) => void;
}) {
  return (
    <AdminDetailSection title="Thông tin cơ bản">
      <div className="space-y-4">
        <AdminFormField label="Tiêu đề *">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title)
                setFieldErrors((prev) => ({ ...prev, title: "" }));
            }}
            className={invalidFieldClass(Boolean(fieldErrors.title))}
          />
          <FieldError message={fieldErrors.title} />
        </AdminFormField>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <AdminFormField label="Slug">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
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
        <p className="text-xs text-muted-foreground">Để trống — hệ thống sẽ tự động tạo slug từ tiêu đề nếu cần.</p>

        <AdminFormField label="Nguồn tham chiếu" hint="Tham chiếu nguồn chính thống nếu có">
          <Input
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
            placeholder="VD: Pháp thoại 2024-08-08..."
          />
        </AdminFormField>

        <AdminFormField label="Nội dung bài viết" hint="Nội dung hiển thị ở web public và phần đọc bài viết.">
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            placeholder="Biên tập nội dung bài viết theo bố cục dễ đọc cho người lớn tuổi..."
            minHeight={320}
          />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

// ── Read-only published view ──────────────────────────────────────────

function PublishedView({
  title,
  slug,
  bodyHtml,
}: {
  title: string;
  slug: string;
  bodyHtml: string;
}) {
  return (
    <AdminDetailSection title="Bản đã xuất bản">
      <div className="space-y-4">
        <AdminDetailField label="Tiêu đề" value={title} />
        <AdminDetailField label="Slug" value={slug} />
        <div className="space-y-1 py-2 text-sm">
          <span className="text-xs text-muted-foreground">Nội dung</span>
          {bodyHtml ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <span className="text-xs italic text-muted-foreground/50">—</span>
          )}
        </div>
      </div>
    </AdminDetailSection>
  );
}

// ── Unpublish dialog ──────────────────────────────────────────────────

type UnpublishMode = "keepDraft" | "replaceDraftWithPublished";

function UnpublishDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: (mode: UnpublishMode) => void;
}) {
  const [mode, setMode] = useState<UnpublishMode>("keepDraft");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gỡ xuất bản bài viết</DialogTitle>
          <DialogDescription>
            Chọn cách xử lý bản nháp sau khi gỡ xuất bản.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mode === "keepDraft"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name="unpublish-mode"
              value="keepDraft"
              checked={mode === "keepDraft"}
              onChange={() => setMode("keepDraft")}
              className="mt-0.5 accent-primary"
            />
            <div className="grid gap-0.5">
              <span className="text-sm font-medium leading-none">
                Giữ bản nháp hiện tại
              </span>
              <span className="text-xs text-muted-foreground">
                Bài viết được gỡ xuống; bản nháp đang chỉnh sửa được giữ nguyên.
              </span>
            </div>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mode === "replaceDraftWithPublished"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name="unpublish-mode"
              value="replaceDraftWithPublished"
              checked={mode === "replaceDraftWithPublished"}
              onChange={() => setMode("replaceDraftWithPublished")}
              className="mt-0.5 accent-primary"
            />
            <div className="grid gap-0.5">
              <span className="text-sm font-medium leading-none">
                Thay bản nháp bằng bản đã xuất bản
              </span>
              <span className="text-xs text-muted-foreground">
                Bản nháp sẽ được ghi đè bởi nội dung đã xuất bản trước đó.
              </span>
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => onConfirm(mode)}
          >
            {isPending ? "Đang xử lý..." : "Gỡ xuất bản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function PostDetailPage() {
  const navigate = useNavigate();
  const { publicId } = useParams({ strict: false });

  const { data: post, isLoading, isError } = useQuery(
    postDetailOptions(publicId ?? ""),
  );

  const updatePost = useUpdatePost();
  const publishPost = usePublishPost();
  const unpublishPost = useUnpublishPost();
  const deletePost = useDeletePost();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [postType, setPostType] = useState("ARTICLE");
  const [sourceRef, setSourceRef] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [featuredImageChanged, setFeaturedImageChanged] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form state when post loads
  useEffect(() => {
    if (!post) return;
    setTitle(post.title);
    setSlug(post.slug);
    setPostType(post.postType);
    setSourceRef(post.sourceRef ?? "");
    setBodyHtml(readPostBodyHtml(post.content));
    setFeaturedImageId("");
    setFeaturedImageChanged(false);
    setFeatured(post.featured);
    setAllowComments(post.allowComments);
    setFieldErrors({});
  }, [post]);

  const handleSave = () => {
    const postKey = post?.publicId ?? post?.id ?? publicId ?? "";
    if (!postKey) {
      toast.error("Không xác định được mã bài viết.");
      return;
    }
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setFieldErrors({});

    updatePost.mutate(
      {
        publicId: postKey,
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || null,
        content: buildPostContent(bodyHtml),
        ...(featuredImageChanged
          ? { featuredImageId: featuredImageId.trim() || null }
          : {}),
        featured,
        allowComments,
      },
      {
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  // ── Loading / error states ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        Đang tải bài viết...
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-destructive">
        Không thể tải bài viết. Vui lòng thử lại.
      </div>
    );
  }

  // ── Actions ─────────────────────────────────────────────────────────

  const actions = [
    ...(post.status === "DRAFT"
      ? [{ label: "Xuất bản", onClick: () => setConfirmPublish(true) }]
      : []),
    ...(post.status === "PUBLISHED"
      ? [{ label: "Gỡ xuất bản", onClick: () => setConfirmUnpublish(true) }]
      : []),
    {
      label: "Xoá bài viết",
      onClick: () => setConfirmDelete(true),
      variant: "destructive" as const,
      separator: true,
    },
  ];

  // ── Main content ─────────────────────────────────────────────────────

  const editableForm = (
    <EditableForm
      title={title}
      setTitle={setTitle}
      slug={slug}
      setSlug={setSlug}
      postType={postType}
      setPostType={setPostType}
      sourceRef={sourceRef}
      setSourceRef={setSourceRef}
      bodyHtml={bodyHtml}
      setBodyHtml={setBodyHtml}
      fieldErrors={fieldErrors}
      setFieldErrors={setFieldErrors}
    />
  );

  const mainContent =
    post.status === "PUBLISHED" ? (
      <Tabs defaultValue="draft">
        <TabsList className="mb-4">
          <TabsTrigger value="draft">Nháp</TabsTrigger>
          <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
        </TabsList>
        <TabsContent value="draft">{editableForm}</TabsContent>
        <TabsContent value="published">
          <PublishedView
            title={post.title}
            slug={post.slug}
            bodyHtml={readPostBodyHtml(post.content)}
          />
        </TabsContent>
      </Tabs>
    ) : (
      editableForm
    );

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/bai-viet"
        backLabel="Bài viết"
        title={post.title}
        status={
          <Badge variant="outline" className={statusBadgeClass(post.status)}>
            {statusLabel(post.status)}
          </Badge>
        }
        onSave={handleSave}
        isSaving={updatePost.isPending}
        saveLabel="Lưu"
        saveDisabled={!title.trim()}
        actions={actions}
        sidebar={
          <>
            <DetailSidebar
              status={post.status}
              publishedAt={post.publishedAt}
              createdAt={post.createdAt}
              updatedAt={post.updatedAt}
              featured={featured}
              setFeatured={setFeatured}
              allowComments={allowComments}
              setAllowComments={setAllowComments}
            />
          </>
        }
      >
        {mainContent}
        <FeaturedImageSection
          featuredImageId={featuredImageId}
          setFeaturedImageId={(value) => {
            setFeaturedImageId(value);
            setFeaturedImageChanged(true);
          }}
          currentFeaturedImageUrl={post.featuredImageUrl}
        />
      </AdminDetailPage>

      {/* ── Confirm dialogs ───────────────────────────────────────── */}
      <WorkspaceConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Xuất bản bài viết"
        description={
          <>
            Xuất bản{" "}
            <span className="font-semibold text-foreground">{post.title}</span>?
            Bài viết sẽ hiển thị công khai ngay lập tức.
          </>
        }
        confirmLabel="Xuất bản"
        isPending={publishPost.isPending}
        onConfirm={() => {
          const postKey = post?.publicId ?? post?.id ?? publicId ?? "";
          if (!postKey) {
            toast.error("Không xác định được mã bài viết.");
            return;
          }
          publishPost.mutate(postKey, {
            onSuccess: () => setConfirmPublish(false),
          });
        }}
      />

      <UnpublishDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        isPending={unpublishPost.isPending}
        onConfirm={(mode) => {
          const postKey = post?.publicId ?? post?.id ?? publicId ?? "";
          if (!postKey) {
            toast.error("Không xác định được mã bài viết.");
            return;
          }
          unpublishPost.mutate(
            { publicId: postKey, mode },
            { onSuccess: () => setConfirmUnpublish(false) },
          );
        }}
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá bài viết"
        description={
          <>
            Xoá{" "}
            <span className="font-semibold text-foreground">{post.title}</span>?
            Thao tác này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deletePost.isPending}
        onConfirm={() => {
          const postKey = post?.publicId ?? post?.id ?? publicId ?? "";
          if (!postKey) {
            toast.error("Không xác định được mã bài viết.");
            return;
          }
          deletePost.mutate(postKey, {
            onSuccess: () => {
              setConfirmDelete(false);
              void navigate({ to: "/noi-dung/bai-viet" });
            },
          });
        }}
      />
    </>
  );
}
