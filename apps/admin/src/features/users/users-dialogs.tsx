import { UsersActionDialog } from "@/features/users/users-action-dialog";
import { UsersBlockDialog, UsersUnblockDialog } from "@/features/users/users-delete-dialog";
import { UsersRoleDialog } from "@/features/users/users-invite-dialog";
import { useUsers } from "@/features/users/context";

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  if (!currentRow) return null;

  return (
    <>
      <UsersActionDialog
        open={open === "edit"}
        onOpenChange={(value) => (!value ? handleClose() : setOpen("edit"))}
        currentRow={currentRow}
      />
      <UsersRoleDialog
        open={open === "role"}
        onOpenChange={(value) => (!value ? handleClose() : setOpen("role"))}
        currentRow={currentRow}
      />
      <UsersBlockDialog
        open={open === "block"}
        onOpenChange={(value) => (!value ? handleClose() : setOpen("block"))}
        currentRow={currentRow}
      />
      <UsersUnblockDialog
        open={open === "unblock"}
        onOpenChange={(value) => (!value ? handleClose() : setOpen("unblock"))}
        currentRow={currentRow}
      />
    </>
  );
}

