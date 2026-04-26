import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { moderationCommentDetailOptions } from "@/features/moderation-comments/queries";
import {
  useDecideCommentReport,
  type CommentDecision,
} from "@/features/moderation-comments/mutations";
import { readRouteParam } from "@/lib/router-utils";

// ── Helpers ───────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === "RESOLVED_HIDE")
    return (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
        Đã ẩn
      </Badge>
    );
  if (status === "RESOLVED_IGNORE")
    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Bỏ qua
      </Badge>
    );
  if (status === "RESOLVED_ESCALATE")
    return (
      <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400">
        Leo thang
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      Chờ xử lý
    </Badge>
  );
}

function statusLabel(s: string): string {
  if (s === "RESOLVED_HIDE") return "Đã ẩn";
  if (s === "RESOLVED_IGNORE") return "Bỏ qua";
  if (s === "RESOLVED_ESCALATE") return "Leo thang";
  return "Chờ xử lý";
}

function targetTypeLabel(t: string): string {
  if (t === "COMMENT") return "Bình luận";
  if (t === "POST") return "Bài viết";
  if (t === "GUESTBOOK") return "Lưu niệm";
  return t;
}

// ── Confirm meta ──────────────────────────────────────────────────────

type ConfirmKey = CommentDecision | null;

const confirmMeta: Record<
  CommentDecision,
  { title: string; description: React.ReactNode; confirmLabel: string; variant?: "destructive" }
> = {
  hide: {
    title: "Ẩn nội dung",
    description: "Nội dung sẽ không hiển thị với thành viên.",
    confirmLabel: "Ẩn",
    variant: "destructive",
  },
  ignore: {
    title: "Bỏ qua báo cáo",
    description: "Báo cáo sẽ được đóng lại. Nội dung được giữ nguyên.",
    confirmLabel: "Bỏ qua",
  },
  escalate: {
    title: "Leo thang xử lý",
    description: "Báo cáo sẽ được chuyển lên cấp xử lý cao hơn.",
    confirmLabel: "Leo thang",
    variant: "destructive",
  },
};

// ── Page ──────────────────────────────────────────────────────────────

export function CommentDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "publicId");
  const navigate = useNavigate();

  const [confirm, setConfirm] = useState<ConfirmKey>(null);

  const { data: comment, isLoading } = useQuery(
    moderationCommentDetailOptions(publicId ?? ""),
  );

  const decideReport = useDecideCommentReport();

  const goBack = () => { void navigate({ to: "/kiem-duyet/binh-luan" }); };

  if (isLoading || !comment) {
    return <WorkspaceDetailSkeleton />;
  }

  const title = `Bình luận #${comment.publicId.slice(-8)}`;
  const isPending = comment.status === "PENDING";

  const actions = [
    ...(isPending
      ? [
          { label: "Ẩn nội dung", onClick: () => setConfirm("hide") },
          { label: "Bỏ qua", onClick: () => setConfirm("ignore") },
          {
            label: "Leo thang",
            onClick: () => setConfirm("escalate"),
            variant: "destructive" as const,
            separator: true,
          },
        ]
      : []),
  ];

  const sidebar = (
    <AdminDetailSection title="Thông tin">
      <AdminDetailField
        label="Người báo cáo"
        value={comment.reporterSummary?.displayName ?? "—"}
      />
      <AdminDetailField
        label="Bài viết liên quan"
        value={targetTypeLabel(comment.targetType)}
      />
      <AdminDetailField label="Trạng thái" value={statusLabel(comment.status)} />
      <AdminDetailField
        label="Ngày đăng"
        value={new Date(comment.createdAt).toLocaleDateString("vi-VN")}
      />
    </AdminDetailSection>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/kiem-duyet/binh-luan"
        backLabel="Bình luận"
        title={title}
        status={statusBadge(comment.status)}
        actions={actions}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Nội dung bình luận">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {comment.description ?? comment.reasonCode}
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Thông tin tác giả">
          <AdminDetailField
            label="Tên hiển thị"
            value={comment.reporterSummary?.displayName ?? "—"}
          />
          <AdminDetailField
            label="Vai trò"
            value={comment.reporterSummary?.role ?? "—"}
          />
          <AdminDetailField label="Mã lý do" value={comment.reasonCode} />
          <AdminDetailField
            label="Loại đối tượng"
            value={targetTypeLabel(comment.targetType)}
          />
        </AdminDetailSection>
      </AdminDetailPage>

      {confirm && (
        <WorkspaceConfirmDialog
          open={true}
          onOpenChange={(v) => { if (!v) setConfirm(null); }}
          title={confirmMeta[confirm].title}
          description={confirmMeta[confirm].description}
          confirmLabel={confirmMeta[confirm].confirmLabel}
          variant={confirmMeta[confirm].variant}
          isPending={decideReport.isPending}
          onConfirm={() =>
            decideReport.mutate(
              { publicId: comment.publicId, decision: confirm },
              {
                onSuccess: () => {
                  setConfirm(null);
                  goBack();
                },
              },
            )
          }
        />
      )}
    </>
  );
}
