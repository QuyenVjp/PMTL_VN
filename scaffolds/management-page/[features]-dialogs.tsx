/**
 * SCAFFOLD — [features]-dialogs.tsx
 *
 * Dialog switcher. Only contains:
 *   - Create dialog (modal form — complex input before any record exists)
 *   - Publish confirm  (optional — WorkspaceConfirmDialog)
 *   - Delete confirm   (optional — can also be handled inside detail sheet)
 *
 * Edit dialog is NOT here — editing lives in [features]-detail.tsx inline form.
 * Use WorkspaceConfirmDialog for any confirmation — never custom Dialog for confirms.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WorkspaceConfirmDialog } from "@/components/workspace";
import { useCreate[Feature], useDelete[Feature], usePublish[Feature] } from "@/features/[features]/mutations";
import { use[Feature]s } from "@/features/[features]/context";

// ── Create dialog ─────────────────────────────────────────────────────

function [Feature]CreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const create = useCreate[Feature]();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle("");
  }, [open]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    create.mutate(
      { title: title.trim() },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Tạo mới</DialogTitle>
          <DialogDescription>Điền thông tin để tạo mục mới.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </label>
          {/* Add more create fields here */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={create.isPending || !title.trim()}>
            {create.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Publish confirm (remove if not needed) ────────────────────────────

function [Feature]PublishDialog({
  open,
  onOpenChange,
  title,
  publicId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  publicId: string;
}) {
  const publish = usePublish[Feature]();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xuất bản?"
      description={
        <>
          Xuất bản <span className="font-semibold text-foreground">{title}</span>? Nội dung sẽ
          hiển thị công khai ngay lập tức.
        </>
      }
      confirmLabel="Xuất bản"
      isPending={publish.isPending}
      onConfirm={() => publish.mutate(publicId, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

// ── Delete confirm (can be omitted if delete is only in detail sheet) ─

function [Feature]DeleteDialog({
  open,
  onOpenChange,
  title,
  publicId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  publicId: string;
}) {
  const remove = useDelete[Feature]();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xoá mục này?"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{title}</span>? Thao tác này không
          thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={remove.isPending}
      onConfirm={() => remove.mutate(publicId, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

// ── Dialog switcher ───────────────────────────────────────────────────

export function [Feature]sDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = use[Feature]s();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <[Feature]CreateDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />
      {currentRow && (
        <>
          <[Feature]PublishDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            title={currentRow.title}
            publicId={currentRow.publicId}
          />
          <[Feature]DeleteDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title={currentRow.title}
            publicId={currentRow.publicId}
          />
        </>
      )}
    </>
  );
}
