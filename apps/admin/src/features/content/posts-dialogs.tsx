import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceConfirmDialog } from "@/components/workspace";
import { useCreatePost, useDeletePost, usePublishPost, useUpdatePost } from "@/features/content/mutations";
import { usePosts } from "@/features/content/posts-context";
import type { PostListItem } from "@/features/content/queries";

const POST_TYPE_OPTIONS = [
  { label: "Bài viết", value: "ARTICLE" },
  { label: "Bản ghi (Transcript)", value: "TRANSCRIPT" },
  { label: "Ghi chú nguồn", value: "SOURCE_NOTE" },
  { label: "Tóm tắt sự kiện", value: "EVENT_RECAP" },
];

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
  const [excerpt, setExcerpt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const reset = () => {
    setTitle(""); setSlug(""); setPostType("ARTICLE");
    setSourceRef(""); setExcerpt(""); setFeatured(false); setAllowComments(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Tiêu đề không được để trống."); return; }
    createPost.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content: {},
        featured,
        allowComments,
      },
      { onSuccess: () => { reset(); onOpenChange(false); } },
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
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
          <Field label="Tóm tắt">
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Mô tả ngắn..." rows={2} />
          </Field>
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
  const [excerpt, setExcerpt] = useState(currentRow.excerpt ?? "");
  const [featured, setFeatured] = useState(currentRow.featured);
  const [allowComments, setAllowComments] = useState(currentRow.allowComments);

  useEffect(() => {
    setTitle(currentRow.title);
    setSlug(currentRow.slug);
    setPostType(currentRow.postType);
    setSourceRef(currentRow.sourceRef ?? "");
    setExcerpt(currentRow.excerpt ?? "");
    setFeatured(currentRow.featured);
    setAllowComments(currentRow.allowComments);
  }, [currentRow, open]);

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Tiêu đề không được để trống."); return; }
    updatePost.mutate(
      {
        publicId: currentRow.id,
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        sourceRef: sourceRef.trim() || null,
        excerpt: excerpt.trim() || null,
        featured,
        allowComments,
      },
      { onSuccess: () => onOpenChange(false) },
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <Field label="Tóm tắt">
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
          </Field>
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
