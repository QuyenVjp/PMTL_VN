import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { LockIcon, UnlockIcon, UserRoundPenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUserListItem } from "@/features/users/types";
import { useUsers } from "@/features/users/context";

export function DataTableRowActions({ row }: { row: AdminUserListItem }) {
  const { setOpen, setCurrentRow } = useUsers();
  const isSuspended = row.status === "SUSPENDED";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="size-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[168px] rounded-xl">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row);
            setOpen("edit");
          }}
        >
          Chỉnh sửa
          <DropdownMenuShortcut>
            <UserRoundPenIcon className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row);
            setOpen("role");
          }}
        >
          Đổi vai trò
          <DropdownMenuShortcut>
            <UserRoundPenIcon className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isSuspended ? (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row);
              setOpen("unblock");
            }}
          >
            Mở khóa
            <DropdownMenuShortcut>
              <UnlockIcon className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row);
              setOpen("block");
            }}
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
  );
}
