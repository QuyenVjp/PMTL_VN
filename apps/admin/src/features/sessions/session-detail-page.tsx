import { useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";

import { adminClient } from "@/lib/api/admin-client";
import { useRevokeSession } from "@/features/sessions/mutations";
import { sessionStatusLabel, sessionStatusVariant, type AdminSessionListItem } from "@/features/sessions/types";

export function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams({ strict: false });

  const { data: envelope, isLoading, isError } = useQuery(
    queryOptions({
      queryKey: ["admin-sessions", "detail", sessionId],
      queryFn: () => adminClient.get<{ data: AdminSessionListItem }>(`/admin/sessions/${sessionId ?? ""}`),
      enabled: !!sessionId,
    }),
  );
  const session = envelope?.data;

  const revokeSession = useRevokeSession();
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const handleRevoke = () => {
    if (!session) return;
    revokeSession.mutate(
      { sessionId: session.sessionId },
      {
        onSuccess: () => {
          setConfirmRevoke(false);
          void navigate({ to: "/nguoi-dung/phien" });
        },
      },
    );
  };

  // ── Loading / error states ────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-destructive">
        Không tải được thông tin phiên đăng nhập.
      </div>
    );
  }

  const shortId = session.sessionId.slice(-8);

  const actions =
    session.status === "active"
      ? [
          {
            label: "Thu hồi phiên",
            onClick: () => setConfirmRevoke(true),
            variant: "destructive" as const,
            icon: Trash2Icon,
          },
        ]
      : [];

  return (
    <>
      <AdminDetailPage
        backHref="/nguoi-dung/phien"
        backLabel="Phiên đăng nhập"
        title={`Phiên #${shortId}`}
        status={
          <Badge variant={sessionStatusVariant(session.status)}>
            {sessionStatusLabel(session.status)}
          </Badge>
        }
        actions={actions}
      >
        <AdminDetailSection title="Thông tin phiên">
          <AdminDetailField
            label="Người dùng"
            value={
              <span>
                <span className="font-medium">{session.userDisplayName}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({session.userEmail})
                </span>
              </span>
            }
          />
          <AdminDetailField
            label="Thiết bị"
            value={
              session.userAgent ? (
                <span className="max-w-[260px] truncate text-right" title={session.userAgent}>
                  {session.userAgent}
                </span>
              ) : undefined
            }
          />
          <AdminDetailField label="Địa chỉ IP" value={session.ipAddress ?? undefined} />
          <AdminDetailField
            label="Trạng thái"
            value={
              <Badge variant={sessionStatusVariant(session.status)}>
                {sessionStatusLabel(session.status)}
              </Badge>
            }
          />
          <AdminDetailField
            label="Tạo lúc"
            value={new Date(session.createdAt).toLocaleString("vi-VN")}
          />
          <AdminDetailField
            label="Hết hạn lúc"
            value={
              session.expiresAt
                ? new Date(session.expiresAt).toLocaleString("vi-VN")
                : undefined
            }
          />
        </AdminDetailSection>

        {session.status === "active" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setConfirmRevoke(true)}
              disabled={revokeSession.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2Icon className="size-3.5" />
              Thu hồi phiên
            </button>
          </div>
        )}
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmRevoke}
        onOpenChange={(v) => { if (!v) setConfirmRevoke(false); }}
        title="Thu hồi phiên"
        description={
          <>
            Thu hồi phiên của{" "}
            <span className="font-semibold text-foreground">{session.userDisplayName}</span>?
            Người dùng sẽ bị đăng xuất ngay lập tức.
          </>
        }
        confirmLabel="Thu hồi"
        variant="destructive"
        isPending={revokeSession.isPending}
        onConfirm={handleRevoke}
      />
    </>
  );
}
