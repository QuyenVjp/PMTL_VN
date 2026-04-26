import { useState } from "react";
import { EyeIcon, LockIcon, UnlockIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { WorkspaceConfirmDialog, WorkspaceRowActions } from "@/components/workspace";
import type { AdminUserListItem } from "@/features/users/types";
import { useBlockUser, useUnblockUser } from "@/features/users/mutations";

export function DataTableRowActions({ row }: { row: AdminUserListItem }) {
  const navigate = useNavigate();
  const isSuspended = row.status === "SUSPENDED";

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmUnblock, setConfirmUnblock] = useState(false);

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Xem chi tiết",
            icon: EyeIcon,
            onClick: () => { void navigate({ to: "/nguoi-dung/$publicId", params: { publicId: row.publicId } }); },
          },
          isSuspended
            ? {
                label: "Mở khóa",
                icon: UnlockIcon,
                onClick: () => setConfirmUnblock(true),
              }
            : {
                label: "Khóa tài khoản",
                icon: LockIcon,
                onClick: () => setConfirmBlock(true),
                variant: "destructive" as const,
                separator: true,
              },
        ]}
      />

      <WorkspaceConfirmDialog
        open={confirmBlock}
        onOpenChange={(v) => { if (!v) setConfirmBlock(false); }}
        title="Khóa tài khoản"
        description={
          <>
            Khóa{" "}
            <span className="font-semibold text-foreground">{row.displayName}</span>?
            Tất cả phiên đăng nhập sẽ bị thu hồi ngay lập tức.
          </>
        }
        confirmLabel="Khóa tài khoản"
        variant="destructive"
        isPending={blockUser.isPending}
        onConfirm={() =>
          blockUser.mutate(
            { publicId: row.publicId },
            { onSuccess: () => setConfirmBlock(false) },
          )
        }
      />

      <WorkspaceConfirmDialog
        open={confirmUnblock}
        onOpenChange={(v) => { if (!v) setConfirmUnblock(false); }}
        title="Mở khóa tài khoản"
        description={
          <>
            Mở khóa{" "}
            <span className="font-semibold text-foreground">{row.displayName}</span>{" "}
            để họ có thể đăng nhập lại?
          </>
        }
        confirmLabel="Xác nhận mở khóa"
        isPending={unblockUser.isPending}
        onConfirm={() =>
          unblockUser.mutate(
            { publicId: row.publicId },
            { onSuccess: () => setConfirmUnblock(false) },
          )
        }
      />
    </>
  );
}
