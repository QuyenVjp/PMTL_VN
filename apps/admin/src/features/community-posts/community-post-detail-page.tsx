import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import { communityPostDetailOptions } from "@/features/community-posts/queries";
import {
  useDeleteCommunityPost,
  useUpdateCommunityPostStatus,
  useHidePost,
  useRestorePost,
} from "@/features/community-posts/mutations";

// ── Helpers ───────────────────────────────────────────────────────────

function statusBadge(status: string, isHidden: boolean) {
  if (isHidden)
    return (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
        Đã ẩn
      </Badge>
    );
  if (status === "APPROVED")
    return (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
        Đã duyệt
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
        Từ chối
      </Badge>
    );
  if (status === "HIDDEN")
    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Đã ẩn
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      Chờ duyệt
    </Badge>
  );
}

function statusLabel(s: string, isHidden: boolean): string {
  if (isHidden) return "Đã ẩn";
  if (s === "APPROVED") return "Đã duyệt";
  if (s === "REJECTED") return "Từ chối";
  if (s === "HIDDEN") return "Đã ẩn";
  return "Chờ duyệt";
}

// ── Page ──────────────────────────────────────────────────────────────

export function CommunityPostDetailPage() {
  const { publicId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [confirmHide, setConfirmHide] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: post, isLoading } = useQuery(
    communityPostDetailOptions(publicId ?? ""),
  );

  const updateStatus = useUpdateCommunityPostStatus();
  const deletePost = useDeleteCommunityPost();
  const hidePost = useHidePost();
  const restorePost = useRestorePost();

  const goBack = () => { void navigate({ to: "/cong-dong/bai-dang" }); };

  if (isLoading || !post) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  const rawTitle = post.content ?? "";
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 60) + "..." : rawTitle;

  const actions = [
    ...(post.status === "APPROVED" && !post.isHidden
      ? [{ label: "Ẩn bài", onClick: () => setConfirmHide(true) }]
      : []),
    ...(post.isHidden
      ? [{ label: "Khôi phục", onClick: () => setConfirmRestore(true) }]
      : []),
    ...(post.status !== "REJECTED"
      ? [
          {
            label: "Từ chối",
            onClick: () => setConfirmReject(true),
            variant: "destructive" as const,
            separator: true,
          },
        ]
      : []),
    {
      label: "Xoá",
      onClick: () => setConfirmDelete(true),
      variant: "destructive" as const,
      separator: post.status === "REJECTED",
    },
  ];

  const sidebar = (
    <AdminDetailSection title="Thông tin">
      <AdminDetailField label="Tác giả" value={post.author.displayName} />
      <AdminDetailField
        label="Trạng thái"
        value={statusLabel(post.status, post.isHidden)}
      />
      <AdminDetailField
        label="Ngày đăng"
        value={new Date(post.createdAt).toLocaleDateString("vi-VN")}
      />
      <AdminDetailField
        label="Số bình luận"
        value={String(post.commentCount)}
      />
      <AdminDetailField label="Lượt tim" value={String(post.heartCount)} />
      <AdminDetailField
        label="Báo cáo"
        value={
          post.reportCount > 0 ? (
            <span className="font-semibold text-destructive">{post.reportCount}</span>
          ) : (
            String(post.reportCount)
          )
        }
      />
    </AdminDetailSection>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/cong-dong/bai-dang"
        backLabel="Bài đăng"
        title={title}
        status={statusBadge(post.status, post.isHidden)}
        actions={actions}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Nội dung bài đăng">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</div>
        </AdminDetailSection>

        <AdminDetailSection title="Thông tin tác giả">
          <AdminDetailField label="Tên hiển thị" value={post.author.displayName} />
          <AdminDetailField label="Email" value={post.author.email} />
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmHide}
        onOpenChange={setConfirmHide}
        title="Ẩn bài đăng"
        description="Bài đăng sẽ bị ẩn khỏi cộng đồng nhưng không bị xoá."
        confirmLabel="Ẩn"
        isPending={hidePost.isPending}
        onConfirm={() =>
          hidePost.mutate(post.publicId, {
            onSuccess: () => {
              setConfirmHide(false);
              goBack();
            },
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Khôi phục bài đăng"
        description="Bài đăng sẽ hiển thị trở lại trong cộng đồng."
        confirmLabel="Khôi phục"
        isPending={restorePost.isPending}
        onConfirm={() =>
          restorePost.mutate(post.publicId, {
            onSuccess: () => {
              setConfirmRestore(false);
              goBack();
            },
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Từ chối bài đăng"
        description="Bài đăng sẽ bị từ chối và không hiển thị công khai."
        confirmLabel="Từ chối"
        variant="destructive"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          updateStatus.mutate(
            { publicId: post.publicId, status: "REJECTED" },
            {
              onSuccess: () => {
                setConfirmReject(false);
                goBack();
              },
            },
          )
        }
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá bài đăng"
        description={
          <>
            Xoá bài đăng của{" "}
            <span className="font-semibold text-foreground">{post.author.displayName}</span>?{" "}
            Hành động này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deletePost.isPending}
        onConfirm={() =>
          deletePost.mutate(post.publicId, {
            onSuccess: () => {
              setConfirmDelete(false);
              goBack();
            },
          })
        }
      />
    </>
  );
}
