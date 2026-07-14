import { useState } from "react";
import { RefreshCwIcon, UserPlusIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { UserCreateDialog } from "@/features/users/user-create-dialog";
import { userAdminKeys } from "@/features/users/queries";
import { currentUserQueryOptions } from "@/lib/query/use-current-user";

export function UsersPrimaryButtons() {
  const qc = useQueryClient();
  const { data: currentUser } = useQuery(currentUserQueryOptions);
  const [createOpen, setCreateOpen] = useState(false);
  const canCreateUser = currentUser?.role === "SUPER_ADMIN";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canCreateUser && (
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlusIcon className="mr-2 size-4" />
            Thêm phụng sự viên
          </Button>
        )}
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => void qc.invalidateQueries({ queryKey: userAdminKeys.lists() })}
        >
          <span>Làm mới</span>
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>
      {canCreateUser && <UserCreateDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </>
  );
}
