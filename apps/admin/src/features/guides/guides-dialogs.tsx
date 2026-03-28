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
import type { GuideItem } from "@/features/guides/queries";
import { useCreateGuide, usePublishGuide, useUpdateGuide } from "@/features/guides/mutations";
import { useGuides } from "@/features/guides/context";

// ── Shared field wrapper ─────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Create dialog ────────────────────────────────────────────────────

function GuideCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createGuide = useCreateGuide();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("BEGINNER");
  const [excerpt, setExcerpt] = useState("");

  const reset = () => {
    setTitle("");
    setSlug("");
    setCategory("BEGINNER");
    setExcerpt("");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    createGuide.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        excerpt: excerpt.trim() || undefined,
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
          <DialogTitle>Tạo hướng dẫn mới</DialogTitle>
          <DialogDescription>Điền thông tin cơ bản để tạo bài hướng dẫn mới.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </Field>
          <Field label="Slug">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tự-động-tạo-từ-tiêu-đề"
            />
          </Field>
          <Field label="Danh mục">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Nhập môn</SelectItem>
                <SelectItem value="DAILY_PRACTICE">Hành trì hằng ngày</SelectItem>
                <SelectItem value="LITTLE_HOUSE">Ngôi Nhà Nhỏ</SelectItem>
                <SelectItem value="LIFE_RELEASE">Phóng sanh</SelectItem>
                <SelectItem value="GENERAL">Chung</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tóm tắt">
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Mô tả ngắn cho bài hướng dẫn..."
              rows={3}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createGuide.isPending || !title.trim()}>
            {createGuide.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ──────────────────────────────────────────────────────

function GuideEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: GuideItem;
}) {
  const updateGuide = useUpdateGuide();
  const [title, setTitle] = useState(currentRow.title);
  const [category, setCategory] = useState(currentRow.category);
  const [excerpt, setExcerpt] = useState(currentRow.excerpt ?? "");

  useEffect(() => {
    setTitle(currentRow.title);
    setCategory(currentRow.category);
    setExcerpt(currentRow.excerpt ?? "");
  }, [currentRow, open]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    updateGuide.mutate(
      {
        publicId: currentRow.publicId,
        title: title.trim(),
        category,
        excerpt: excerpt.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa hướng dẫn</DialogTitle>
          <DialogDescription>Cập nhật thông tin bài hướng dẫn.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Danh mục">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Nhập môn</SelectItem>
                <SelectItem value="DAILY_PRACTICE">Hành trì hằng ngày</SelectItem>
                <SelectItem value="LITTLE_HOUSE">Ngôi Nhà Nhỏ</SelectItem>
                <SelectItem value="LIFE_RELEASE">Phóng sanh</SelectItem>
                <SelectItem value="GENERAL">Chung</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tóm tắt">
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Mô tả ngắn..."
              rows={3}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={updateGuide.isPending || !title.trim()}>
            {updateGuide.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Publish confirm dialog ───────────────────────────────────────────

function GuidePublishDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: GuideItem;
}) {
  const publishGuide = usePublishGuide();

  return (
    <WorkspaceConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xuất bản hướng dẫn"
      description={
        <>
          Xuất bản{" "}
          <span className="font-semibold text-foreground">{currentRow.title}</span>? Bài viết sẽ
          hiển thị công khai ngay lập tức.
        </>
      }
      confirmLabel="Xuất bản"
      isPending={publishGuide.isPending}
      onConfirm={() =>
        publishGuide.mutate(currentRow.publicId, {
          onSuccess: () => onOpenChange(false),
        })
      }
    />
  );
}

// ── Dialog switcher ──────────────────────────────────────────────────

export function GuidesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useGuides();

  const handleClose = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 200);
  };

  return (
    <>
      <GuideCreateDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
      />
      {currentRow && (
        <>
          <GuideEditDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <GuidePublishDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
