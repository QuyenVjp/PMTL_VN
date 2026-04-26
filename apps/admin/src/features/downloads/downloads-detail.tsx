import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailStandardSections,
  WorkspaceDetailField,
  WorkspaceDetailDivider,
  contentStatusLabel,
  contentStatusBadgeClass,
  downloadCategoryLabel,
  formatFileSize,
} from "@/components/workspace";
import type { DownloadItem } from "@/features/downloads/queries";
import {
  useUpdateDownload,
  useDeleteDownload,
  usePublishDownload,
  useUnpublishDownload,
} from "@/features/downloads/mutations";

// ── Field wrapper (local) ─────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Category select (local) ───────────────────────────────────────────

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

// ── Detail sheet ──────────────────────────────────────────────────────

interface DownloadsDetailSheetProps {
  open: boolean;
  onClose: () => void;
  currentRow: DownloadItem;
}

export function DownloadsDetailSheet({ open, onClose, currentRow }: DownloadsDetailSheetProps) {
  const updateDownload = useUpdateDownload();
  const deleteDownload = useDeleteDownload();
  const publishDownload = usePublishDownload();
  const unpublishDownload = useUnpublishDownload();

  // ── Edit form state ───────────────────────────────────────────────
  const [title, setTitle] = useState(currentRow.title);
  const [description, setDescription] = useState(currentRow.description ?? "");
  const [category, setCategory] = useState(currentRow.category);

  // Sync form when row changes
  useEffect(() => {
    setTitle(currentRow.title);
    setDescription(currentRow.description ?? "");
    setCategory(currentRow.category);
  }, [currentRow.publicId, open]);

  const isDirty =
    title !== currentRow.title ||
    description !== (currentRow.description ?? "") ||
    category !== currentRow.category;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    updateDownload.mutate({
      publicId: currentRow.publicId,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
    });
  };

  const handleDelete = () => {
    deleteDownload.mutate(currentRow.publicId, { onSuccess: onClose });
  };

  const isPublished = currentRow.status === "PUBLISHED";

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={currentRow.title}
      subtitle={`Tạo bởi ${currentRow.uploader.displayName} · ${new Date(currentRow.createdAt).toLocaleDateString("vi-VN")}`}
      status={
        <Badge
          variant="outline"
          className={contentStatusBadgeClass(currentRow.status)}
        >
          {contentStatusLabel(currentRow.status)}
        </Badge>
      }
      primaryActions={
        isPublished ? (
          <Button
            size="sm"
            variant="outline"
            disabled={unpublishDownload.isPending}
            onClick={() => unpublishDownload.mutate(currentRow.publicId)}
          >
            {unpublishDownload.isPending ? "Đang xử lý..." : "Gỡ xuất bản"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={publishDownload.isPending}
            onClick={() => {
              publishDownload.mutate(currentRow.publicId);
            }}
          >
            {publishDownload.isPending ? "Đang xuất bản..." : "Xuất bản"}
          </Button>
        )
      }
      onDelete={handleDelete}
      deleteItemName={currentRow.title}
      isPendingDelete={deleteDownload.isPending}
    >
      {/* ── Thông tin ─────────────────────────────────────────────── */}
      <WorkspaceDetailSection title="Thông tin">
        <WorkspaceDetailField label="Danh mục" value={downloadCategoryLabel(currentRow.category)} />
        <WorkspaceDetailField label="Loại file" value={currentRow.fileType} />
        <WorkspaceDetailField label="Kích thước" value={formatFileSize(currentRow.fileSize)} />
        <WorkspaceDetailField
          label="Ngày tạo"
          value={new Date(currentRow.createdAt).toLocaleDateString("vi-VN")}
        />
        {currentRow.publishedAt && (
          <WorkspaceDetailField
            label="Ngày xuất bản"
            value={new Date(currentRow.publishedAt).toLocaleDateString("vi-VN")}
          />
        )}
        <WorkspaceDetailField
          label="Đường dẫn"
          value={
            <a
              href={currentRow.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary underline-offset-4 hover:underline"
            >
              {currentRow.fileUrl}
            </a>
          }
          stacked
        />
        {currentRow.description && (
          <WorkspaceDetailField label="Mô tả" value={currentRow.description} stacked />
        )}
      </WorkspaceDetailSection>

      <WorkspaceDetailDivider />

      {/* ── Biên tập ──────────────────────────────────────────────── */}
      <WorkspaceDetailSection title="Biên tập">
        <div className="space-y-4 pt-1">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Danh mục">
            <CategorySelect value={category} onValueChange={setCategory} />
          </Field>
          <Field label="Mô tả">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn..."
              rows={3}
            />
          </Field>
          <Button
            size="sm"
            className="w-full"
            disabled={!isDirty || updateDownload.isPending}
            onClick={handleSave}
          >
            {updateDownload.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </WorkspaceDetailSection>
    <WorkspaceDetailStandardSections />
    </WorkspaceDetailSheet>
  );
}
