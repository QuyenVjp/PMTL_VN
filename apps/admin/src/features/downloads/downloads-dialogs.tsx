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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceConfirmDialog } from "@/components/workspace";
import type { DownloadItem } from "@/features/downloads/queries";
import {
  useCreateDownload,
  useUpdateDownload,
  useDeleteDownload,
  usePublishDownload,
  useUnpublishDownload,
} from "@/features/downloads/mutations";
import { useDownloads } from "@/features/downloads/context";

// ── Shared field wrapper ─────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Category select (shared) ─────────────────────────────────────────

function CategorySelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="GUIDE">Hướng dẫn</SelectItem>
        <SelectItem value="TEMPLATE">Template</SelectItem>
        <SelectItem value="REFERENCE">Tham khảo</SelectItem>
        <SelectItem value="FAQ">FAQ</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ── Create dialog ────────────────────────────────────────────────────

function DownloadCreateDialog({
  open,
  onOpenChange,
  defaultCategory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: string;
}) {
  const createDownload = useCreateDownload();
  const resolvedDefaultCategory = defaultCategory ?? "GUIDE";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(resolvedDefaultCategory);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");

  useEffect(() => {
    if (open) {
      setCategory(resolvedDefaultCategory);
    }
  }, [open, resolvedDefaultCategory]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory(resolvedDefaultCategory);
    setFileUrl("");
    setFileType("");
    setFileSize("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !fileUrl.trim() || !fileType.trim()) {
      toast.error("Tiêu đề, đường dẫn file và loại file không được để trống.");
      return;
    }
    createDownload.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: Number(fileSize) || 0,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm tài liệu mới</DialogTitle>
          <DialogDescription>Điền thông tin tài liệu cần thêm vào thư viện.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
          </Field>
          <Field label="Danh mục">
            <CategorySelect value={category} onValueChange={setCategory} />
          </Field>
          <Field label="Đường dẫn file">
            <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Loại file">
            <Input value={fileType} onChange={(e) => setFileType(e.target.value)} placeholder="PDF, DOCX, MP4..." />
          </Field>
          <Field label="Kích thước (bytes)">
            <Input
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Mô tả">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về tài liệu..."
              rows={2}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createDownload.isPending || !title.trim()}>
            {createDownload.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ──────────────────────────────────────────────────────

function DownloadEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const updateDownload = useUpdateDownload();
  const [title, setTitle] = useState(currentRow.title);
  const [description, setDescription] = useState(currentRow.description ?? "");
  const [category, setCategory] = useState(currentRow.category);
  const [fileUrl, setFileUrl] = useState(currentRow.fileUrl);
  const [fileType, setFileType] = useState(currentRow.fileType);
  const [fileSize, setFileSize] = useState(String(currentRow.fileSize));

  useEffect(() => {
    setTitle(currentRow.title);
    setDescription(currentRow.description ?? "");
    setCategory(currentRow.category);
    setFileUrl(currentRow.fileUrl);
    setFileType(currentRow.fileType);
    setFileSize(String(currentRow.fileSize));
  }, [currentRow, open]);

  const handleSubmit = () => {
    if (!title.trim() || !fileUrl.trim() || !fileType.trim()) {
      toast.error("Tiêu đề, đường dẫn file và loại file không được để trống.");
      return;
    }
    updateDownload.mutate(
      {
        publicId: currentRow.publicId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: Number(fileSize) || 0,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
          <DialogDescription>Cập nhật thông tin tài liệu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Danh mục">
            <CategorySelect value={category} onValueChange={setCategory} />
          </Field>
          <Field label="Đường dẫn file">
            <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại file">
              <Input value={fileType} onChange={(e) => setFileType(e.target.value)} placeholder="PDF, DOCX..." />
            </Field>
            <Field label="Kích thước (bytes)">
              <Input type="number" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="0" />
            </Field>
          </div>
          <Field label="Mô tả">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn..." />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateDownload.isPending || !title.trim()}>
            {updateDownload.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Publish + Delete confirm dialogs ─────────────────────────────────

function DownloadPublishDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const publishDownload = usePublishDownload();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xuất bản tài liệu"
      description={
        <>
          Xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>? Tài
          liệu sẽ hiển thị công khai ngay lập tức.
        </>
      }
      confirmLabel="Xuất bản"
      isPending={publishDownload.isPending}
      onConfirm={() =>
        publishDownload.mutate(currentRow.publicId, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}

function DownloadDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: DownloadItem;
}) {
  const deleteDownload = useDeleteDownload();
  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xoá tài liệu"
      description={
        <>
          Xoá <span className="font-semibold text-foreground">{currentRow.title}</span>? Thao tác
          này không thể hoàn tác.
        </>
      }
      confirmLabel="Xoá"
      variant="destructive"
      isPending={deleteDownload.isPending}
      onConfirm={() =>
        deleteDownload.mutate(currentRow.publicId, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}

// ── Dialog switcher ──────────────────────────────────────────────────

export function DownloadsDialogs({ defaultCategory }: { defaultCategory?: string } = {}) {
  const { open, setOpen, currentRow, setCurrentRow } = useDownloads();
  const unpublishDownload = useUnpublishDownload();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <DownloadCreateDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
        defaultCategory={defaultCategory}
      />
      {currentRow && (
        <>
          <DownloadEditDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <DownloadPublishDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            currentRow={currentRow}
          />
          <WorkspaceConfirmDialog
            open={open === "unpublish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("unpublish"))}
            title="Gỡ xuất bản tài liệu"
            description={
              <>
                Gỡ xuất bản <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Tài liệu sẽ chuyển về nháp.
              </>
            }
            confirmLabel="Gỡ xuất bản"
            isPending={unpublishDownload.isPending}
            onConfirm={() => unpublishDownload.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />
          <DownloadDeleteDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}

