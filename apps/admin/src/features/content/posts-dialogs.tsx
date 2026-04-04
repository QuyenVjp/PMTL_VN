import { type ChangeEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImagePlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkspaceConfirmDialog } from "@/components/workspace";
import { useCreatePost, useDeletePost, usePublishPost, useUpdatePost } from "@/features/content/mutations";
import { usePosts } from "@/features/content/posts-context";
import type { PostListItem } from "@/features/content/queries";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries.js";
import { useUploadMediaAsset } from "@/features/media/mutations.js";
import { resolveMediaSrc } from "@/lib/media-src";
import { extractUploadMediaPayload } from "@/lib/media-upload";

const POST_TYPE_OPTIONS = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi (Transcript)", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];
function FeaturedImageField({
  open,
  value,
  onChange,
}: {
  open: boolean;
  value: string;
  onChange: (next: string) => void;
}) {
  const uploadMedia = useUploadMediaAsset();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: mediaEnvelope, isLoading } = useQuery({
    ...mediaListOptions({ limit: 100, mimeType: "image/" }),
    enabled: open,
  });

  const images = useMemo(
    () => (mediaEnvelope?.data ?? []).filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [mediaEnvelope],
  );

  const selected = images.find((item) => item.publicId === value);

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        const result: Record<string, unknown> = await uploadMedia.mutateAsync(file);
        const publicId = extractUploadMediaPayload(result)?.publicId;
        if (!publicId) {
          toast.error("Upload xong nhưng không đọc được media ID.");
          return;
        }
        onChange(publicId);
      } finally {
        event.target.value = "";
      }
    })();
  };

  return (
    <Field label="Ảnh đại diện bài viết">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <ImagePlusIcon className="size-4" />
          Upload ảnh mới
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} disabled={!value}>
          Bỏ chọn ảnh
        </Button>
      </div>
      {selected ? (
        <div className="flex items-center gap-3 rounded-md border p-2">
          <img src={resolveMediaSrc(selected.url) ?? undefined} alt={selected.filename} className="size-12 rounded object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{selected.filename}</p>
            <p className="text-xs text-muted-foreground">{selected.publicId}</p>
          </div>
        </div>
      ) : null}
      <div className="rounded-md border p-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải ảnh...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có ảnh trong thư viện media.</p>
        ) : (
          <ScrollArea className="h-[160px]">
            <div className="grid grid-cols-5 gap-2 pr-2">
              {images.map((img) => {
                const active = value === img.publicId;
                return (
                  <button
                    key={img.publicId}
                    type="button"
                    onClick={() => onChange(img.publicId)}
                    className={cn(
                      "overflow-hidden rounded border-2 transition",
                      active ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
                    )}
                  >
                    <img src={resolveMediaSrc(img.url) ?? undefined} alt={img.filename} className="aspect-square w-full object-cover" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Field>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function CheckField({ label, checked, onCheckedChange, hint }: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <div className="grid gap-0.5">
        <span className="text-sm font-medium leading-none">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

function PostCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createPost = useCreatePost();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [postType, setPostType] = useState("ARTICLE");
  const [sourceRef, setSourceRef] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = () => {
    setTitle(""); setSlug(""); setPostType("ARTICLE");
    setSourceRef(""); setFeatured(false); setAllowComments(true); setFeaturedImageId("");
    setFieldErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    createPost.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || undefined,
        featuredImageId: featuredImageId || undefined,
        content: {},
        featured,
        allowComments,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (error) => { setFieldErrors(extractValidationFieldErrors(error)); },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="text-start">
          <DialogTitle>Tạo bài viết mới</DialogTitle>
          <DialogDescription>Điền thông tin cơ bản để tạo bài viết mới.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Nhập tiêu đề..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tự-động-tạo" />
            </Field>
            <Field label="Loại bài viết">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POST_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Nguồn tham chiếu" hint="Tham chiếu nguồn chính thống nếu có">
            <Input value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} placeholder="VD: Pháp thoại 2024-08-08..." />
          </Field>
          <FeaturedImageField open={open} value={featuredImageId} onChange={setFeaturedImageId} />
          <div className="flex gap-6 pt-1">
            <CheckField label="Bài nổi bật" checked={featured} onCheckedChange={setFeatured} hint="Hiển thị ở vị trí ưu tiên" />
            <CheckField label="Cho phép bình luận" checked={allowComments} onCheckedChange={setAllowComments} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createPost.isPending || !title.trim()}>
            {createPost.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: PostListItem;
}) {
  const updatePost = useUpdatePost();
  const [title, setTitle] = useState(currentRow.title);
  const [slug, setSlug] = useState(currentRow.slug);
  const [postType, setPostType] = useState(currentRow.postType);
  const [sourceRef, setSourceRef] = useState(currentRow.sourceRef ?? "");
  const [featured, setFeatured] = useState(currentRow.featured);
  const [allowComments, setAllowComments] = useState(currentRow.allowComments);
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [featuredImageChanged, setFeaturedImageChanged] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setTitle(currentRow.title);
    setSlug(currentRow.slug);
    setPostType(currentRow.postType);
    setSourceRef(currentRow.sourceRef ?? "");
    setFeatured(currentRow.featured);
    setAllowComments(currentRow.allowComments);
    setFeaturedImageId("");
    setFeaturedImageChanged(false);
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    updatePost.mutate(
      {
        publicId: currentRow.id,
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || null,
        ...(featuredImageChanged
          ? { featuredImageId: featuredImageId || null }
          : {}),
        featured,
        allowComments,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => { setFieldErrors(extractValidationFieldErrors(error)); },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          <DialogDescription>Cập nhật thông tin bài viết.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </Field>
            <Field label="Loại bài viết">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POST_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Nguồn tham chiếu" hint="Tham chiếu nguồn chính thống nếu có">
            <Input value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} placeholder="VD: Pháp thoại 2024-08-08..." />
          </Field>
          <FeaturedImageField
            open={open}
            value={featuredImageId}
            onChange={(next) => {
              setFeaturedImageId(next);
              setFeaturedImageChanged(true);
            }}
          />
          {!featuredImageChanged && currentRow.featuredImageUrl ? (
            <div className="text-xs text-muted-foreground">Ảnh hiện tại đang giữ nguyên nếu không chọn lại.</div>
          ) : null}
          <div className="flex gap-6 pt-1">
            <CheckField label="Bài nổi bật" checked={featured} onCheckedChange={setFeatured} hint="Hiển thị ở vị trí ưu tiên" />
            <CheckField label="Cho phép bình luận" checked={allowComments} onCheckedChange={setAllowComments} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updatePost.isPending || !title.trim()}>
            {updatePost.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostPublishDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string;
  postTitle: string;
}) {
  const publishPost = usePublishPost();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xuất bản bài viết"
      description={
        <>
          Xuất bản <span className="font-semibold text-foreground">{postTitle}</span>? Bài viết sẽ
          hiển thị công khai ngay lập tức.
        </>
      }
      confirmLabel="Xuất bản"
      isPending={publishPost.isPending}
      onConfirm={() => publishPost.mutate(postId, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

function PostDeleteDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string;
  postTitle: string;
}) {
  const deletePost = useDeletePost();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xoá bài viết"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{postTitle}</span>? Thao tác này
          không thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={deletePost.isPending}
      onConfirm={() => deletePost.mutate(postId, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

export function PostsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePosts();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <PostCreateDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />
      {currentRow && (
        <>
          <PostEditDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <PostPublishDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            postId={currentRow.id}
            postTitle={currentRow.title}
          />
          <PostDeleteDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            postId={currentRow.id}
            postTitle={currentRow.title}
          />
        </>
      )}
    </>
  );
}
