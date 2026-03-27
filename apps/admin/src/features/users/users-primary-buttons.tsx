import { RefreshCwIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { userAdminKeys } from "@/features/users/queries";

export function UsersPrimaryButtons() {
  const qc = useQueryClient();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="space-x-1"
        onClick={() => void qc.invalidateQueries({ queryKey: userAdminKeys.lists() })}
      >
        <span>Làm mới</span>
        <RefreshCwIcon className="size-4" />
      </Button>
    </div>
  );
}
