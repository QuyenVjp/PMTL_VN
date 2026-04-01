import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";
import { Badge } from "@/components/ui/badge";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import type { GuestbookItem } from "@/features/guestbook/queries";
import {
  useDeleteGuestbook,
  useUpdateGuestbookStatus,
} from "@/features/guestbook/mutations";

// ── Query ─────────────────────────────────────────────────────────────

function guestbookDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: ["admin-guestbook", "detail", publicId],
    queryFn: () => adminClient.get<GuestbookItem>(`/admin/community/guestbook/${publicId}`),
    enabled: Boolean(publicId),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────

function statusBadge(status: string) {
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
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      Chờ duyệt
    </Badge>
  );
}

function statusLabel(s: string): string {
  if (s === "APPROVED") return "Đã duyệt";
  if (s === "REJECTED") return "Từ chối";
  return "Chờ duyệt";
}

// ── Page ──────────────────────────────────────────────────────────────

export function GuestbookDetailPage() {
  const { publicId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: entry, isLoading } = useQuery(
    guestbookDetailOptions(publicId ?? ""),
  );

  const updateStatus = useUpdateGuestbookStatus();
  const deleteGuestbook = useDeleteGuestbook();

  const goBack = () => { void navigate({ to: "/cong-dong/so-luu-niem" }); };

  if (isLoading || !entry) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  const title = entry.content.length > 60 ? entry.content.slice(0, 60) + "..." : entry.content;

  const actions = [
    ...(entry.status !== "APPROVED"
      ? [{ label: "Duyệt", onClick: () => setConfirmApprove(true) }]
      : []),
    ...(entry.status !== "REJECTED"
      ? [
          {
            label: "Từ chối",
            onClick: () => setConfirmReject(true),
            variant: "destructive" as const,
            separator: entry.status === "APPROVED",
          },
        ]
      : []),
    {
      label: "Xoá",
      onClick: () => setConfirmDelete(true),
      variant: "destructive" as const,
      separator: true,
    },
  ];

  const sidebar = (
    <AdminDetailSection title="Thông tin">
      <AdminDetailField label="Tác giả" value={entry.author.displayName} />
      <AdminDetailField label="Email" value={entry.author.email} />
      <AdminDetailField label="Trạng thái" value={statusLabel(entry.status)} />
      <AdminDetailField
        label="Ngày gửi"
        value={new Date(entry.createdAt).toLocaleDateString("vi-VN")}
      />
      <AdminDetailField
        label="Duyệt lúc"
        value={
          entry.approvedAt
            ? new Date(entry.approvedAt).toLocaleDateString("vi-VN")
            : undefined
        }
      />
    </AdminDetailSection>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/cong-dong/so-luu-niem"
        backLabel="Sổ lưu niệm"
        title={title}
        status={statusBadge(entry.status)}
        actions={actions}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Nội dung lưu niệm">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</div>
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Duyệt lưu niệm"
        description="Lưu niệm sẽ hiển thị công khai trong sổ lưu niệm."
        confirmLabel="Duyệt"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          updateStatus.mutate(
            { publicId: entry.publicId, status: "APPROVED" },
            {
              onSuccess: () => {
                setConfirmApprove(false);
                goBack();
              },
            },
          )
        }
      />

      <WorkspaceConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Từ chối lưu niệm"
        description="Lưu niệm sẽ bị từ chối và không hiển thị công khai."
        confirmLabel="Từ chối"
        variant="destructive"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          updateStatus.mutate(
            { publicId: entry.publicId, status: "REJECTED" },
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
        title="Xoá lưu niệm"
        description={
          <>
            Xoá lưu niệm <span className="font-semibold text-foreground">{entry.publicId}</span>?{" "}
            Hành động này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteGuestbook.isPending}
        onConfirm={() =>
          deleteGuestbook.mutate(entry.publicId, {
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
