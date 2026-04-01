import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { LockIcon, UnlockIcon, UserRoundPenIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceConfirmDialog } from "@/components/workspace";
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[168px] rounded-xl">
          <DropdownMenuItem
            onClick={() => { void navigate({ to: "/nguoi-dung/$publicId", params: { publicId: row.publicId } }); }}
          >
            Chỉnh sửa
            <DropdownMenuShortcut>
              <UserRoundPenIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isSuspended ? (
            <DropdownMenuItem onClick={() => setConfirmUnblock(true)}>
              Mở khóa
              <DropdownMenuShortcut>
                <UnlockIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setConfirmBlock(true)}
              className="text-destructive focus:text-destructive"
            >
              Khóa tài khoản
              <DropdownMenuShortcut>
                <LockIcon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
