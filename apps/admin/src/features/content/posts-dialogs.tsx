import { WorkspaceConfirmDialog } from "@/components/workspace";
import { usePublishPost } from "@/features/content/mutations";
import { usePosts } from "@/features/content/posts-context";

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
      onConfirm={() =>
        publishPost.mutate(postId, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}

export function PostsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePosts();

  const handleClose = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 200);
  };

  if (!currentRow) return null;

  return (
    <PostPublishDialog
      open={open === "publish"}
      onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
      postId={currentRow.id}
      postTitle={currentRow.title}
    />
  );
}
