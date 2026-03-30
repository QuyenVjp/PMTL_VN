/**
 * SCAFFOLD — [features]-detail.tsx
 *
 * This is the STANDARD detail sheet. Every management page must have one.
 * It owns: readonly info view, inline edit form, status transitions, delete.
 * The table only has quick actions; everything else lives here.
 *
 * Constitution §12 required sections:
 *   - "Thông tin"  — WorkspaceDetailField rows (readonly)
 *   - "Chỉnh sửa" — inline edit form with "Lưu thay đổi" button
 *   - primaryActions — publish/unpublish buttons in sheet header
 *   - onDelete — footer delete with internal confirm dialog
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailField,
  WorkspaceDetailDivider,
  contentStatusLabel,
  contentStatusBadgeClass,
} from "@/components/workspace";
import type { [Feature]Item } from "@/features/[features]/queries";
import {
  useUpdate[Feature],
  useDelete[Feature],
  usePublish[Feature],
  useUnpublish[Feature],
} from "@/features/[features]/mutations";

// ── Props ─────────────────────────────────────────────────────────────

interface [Feature]sDetailSheetProps {
  open: boolean;
  onClose: () => void;
  currentRow: [Feature]Item;
}

// ── Component ─────────────────────────────────────────────────────────

export function [Feature]sDetailSheet({ open, onClose, currentRow }: [Feature]sDetailSheetProps) {
  const update   = useUpdate[Feature]();
  const remove   = useDelete[Feature]();
  const publish  = usePublish[Feature]();
  const unpublish = useUnpublish[Feature]();

  // ── Form state (sync when row or open changes) ────────────────────
  const [title, setTitle] = useState(currentRow.title);
  // Add more fields as needed

  useEffect(() => {
    setTitle(currentRow.title);
  }, [currentRow.publicId, open]);

  const isDirty = title !== currentRow.title;

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    update.mutate({ publicId: currentRow.publicId, title: title.trim() });
  };

  const handleDelete = () => {
    remove.mutate(currentRow.publicId, { onSuccess: onClose });
  };

  const isPublished = currentRow.status === "PUBLISHED";

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={currentRow.title}
      subtitle={`Ngày tạo: ${new Date(currentRow.createdAt).toLocaleDateString("vi-VN")}`}
      status={
        <Badge variant="outline" className={contentStatusBadgeClass(currentRow.status)}>
          {contentStatusLabel(currentRow.status)}
        </Badge>
      }
      primaryActions={
        isPublished ? (
          <Button
            size="sm"
            variant="outline"
            disabled={unpublish.isPending}
            onClick={() => unpublish.mutate(currentRow.publicId)}
          >
            {unpublish.isPending ? "Đang xử lý..." : "Gỡ xuất bản"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={publish.isPending}
            onClick={() => publish.mutate(currentRow.publicId)}
          >
            {publish.isPending ? "Đang xuất bản..." : "Xuất bản"}
          </Button>
        )
      }
      onDelete={handleDelete}
      deleteItemName={currentRow.title}
      isPendingDelete={remove.isPending}
    >
      {/* ── Thông tin (readonly) ──────────────────────────────────── */}
      <WorkspaceDetailSection title="Thông tin">
        <WorkspaceDetailField label="Trạng thái" value={contentStatusLabel(currentRow.status)} />
        <WorkspaceDetailField
          label="Ngày tạo"
          value={new Date(currentRow.createdAt).toLocaleDateString("vi-VN")}
        />
        {/* Add more readonly fields as needed */}
      </WorkspaceDetailSection>

      <WorkspaceDetailDivider />

      {/* ── Chỉnh sửa (inline edit form) ─────────────────────────── */}
      <WorkspaceDetailSection title="Chỉnh sửa">
        <div className="space-y-4 pt-1">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          {/* Add more editable fields as needed */}
          <Button
            size="sm"
            className="w-full"
            disabled={!isDirty || update.isPending}
            onClick={handleSave}
          >
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </WorkspaceDetailSection>
    </WorkspaceDetailSheet>
  );
}
