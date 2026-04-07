import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { WorkspaceConfirmDialog } from "@/components/workspace";
import { pushKeys } from "./queries.js";
import { useRedrivePushJob, useDeletePushJob } from "./mutations.js";
import { useNotif } from "./notifications-provider.js";
import { CreatePushJobDialog } from "./notifications-create-dialog.js";

export function NotifPrimaryButtons() {
  const { setOpen } = useNotif();
  const qc = useQueryClient();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => {
          void qc.invalidateQueries({ queryKey: pushKeys.lists() });
          void qc.invalidateQueries({ queryKey: pushKeys.status() });
          void qc.invalidateQueries({ queryKey: pushKeys.subscriptionStats() });
        }}
      >
        <RefreshCwIcon className="size-4" />
        Làm mới
      </Button>
      <Button onClick={() => setOpen("create")}>
        <PlusIcon className="size-4" />
        Tạo đợt gửi
      </Button>
    </div>
  );
}

export function NotifDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useNotif();
  const redrivePushJob = useRedrivePushJob();
  const deletePushJob = useDeletePushJob();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <CreatePushJobDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />
      {currentRow && (
        <>
          <WorkspaceConfirmDialog
            open={open === "redrive"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("redrive"))}
            title="Gửi lại thông báo"
            description={
              <>
                Gửi lại đợt thông báo <span className="font-semibold text-foreground">{currentRow.title}</span>?
              </>
            }
            confirmLabel="Gửi lại"
            isPending={redrivePushJob.isPending}
            onConfirm={() =>
              redrivePushJob.mutate(currentRow.publicId, { onSuccess: handleClose })
            }
          />
          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá đợt thông báo"
            description={
              <>
                Xoá đợt gửi <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Hành động này không thể hoàn tác.
              </>
            }
            confirmLabel="Xoá"
            variant="destructive"
            isPending={deletePushJob.isPending}
            onConfirm={() =>
              deletePushJob.mutate(currentRow.publicId, { onSuccess: handleClose })
            }
          />
        </>
      )}
    </>
  );
}
