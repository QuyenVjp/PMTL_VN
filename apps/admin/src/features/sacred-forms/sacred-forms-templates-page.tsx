import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SacredFormTemplatesTable } from "./sacred-forms-templates-table.js";
import { useCreateTemplate } from "./mutations.js";
import { FORM_TYPE_LABELS, type SacredFormType } from "./types.js";

const FORM_TYPE_OPTIONS: { label: string; value: SacredFormType }[] = [
  { label: FORM_TYPE_LABELS.REFUGE_FORM, value: "REFUGE_FORM" },
  { label: FORM_TYPE_LABELS.VOW_FORM, value: "VOW_FORM" },
  { label: FORM_TYPE_LABELS.MERIT_TRANSFER_FORM, value: "MERIT_TRANSFER_FORM" },
  { label: FORM_TYPE_LABELS.RECITATION_CERTIFICATE, value: "RECITATION_CERTIFICATE" },
  { label: FORM_TYPE_LABELS.DHARMA_STUDY_FORM, value: "DHARMA_STUDY_FORM" },
];

export function SacredFormTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState<SacredFormType | "">("");
  const [titleVi, setTitleVi] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [description, setDescription] = useState("");
  const createTemplate = useCreateTemplate();

  const canCreate = Boolean(formType && titleVi.trim());

  function handleClose() {
    setOpen(false);
    setFormType("");
    setTitleVi("");
    setTitleZh("");
    setDescription("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formType || !titleVi.trim()) return;
    createTemplate.mutate(
      {
        formType,
        titleVi: titleVi.trim(),
        titleZh: titleZh.trim() || undefined,
        description: description.trim() || undefined,
        isActive: true,
      },
      { onSuccess: handleClose },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Danh sách mẫu đơn đăng ký hiện hành. Mỗi mẫu có thể bật/tắt trực tiếp ở bảng dưới.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Tạo mẫu đơn
        </Button>
      </div>

      <SacredFormTemplatesTable />

      <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(true))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mẫu đơn mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="formType">
                Loại đơn <span className="text-destructive">*</span>
              </Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as SacredFormType)}>
                <SelectTrigger id="formType">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleVi">
                Tên mẫu đơn (tiếng Việt) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titleVi"
                value={titleVi}
                onChange={(e) => setTitleVi(e.target.value)}
                placeholder="Nhập tên mẫu đơn..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleZh">Tên mẫu đơn (Hán tự)</Label>
              <Input
                id="titleZh"
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                placeholder="Tuỳ chọn"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về mẫu đơn (tuỳ chọn)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Huỷ
              </Button>
              <Button type="submit" disabled={!canCreate || createTemplate.isPending}>
                {createTemplate.isPending ? "Đang tạo..." : "Tạo mẫu đơn"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
