/**
 * Self-Cultivation Template Management Tab
 * Admin manages PDF templates (yellow paper) for user download & print.
 *
 * Design: design/03-domains/engagement/USE_CASES/self-cultivation-sutras-burn-flow.md §3
 */
import { useState } from "react";
import {
  FileTextIcon,
  PlusIcon,
  UploadIcon,
  DownloadIcon,
  ArchiveIcon,
  CheckCircle2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────

type SutraType = "LE_PHAT_DAI_SAM_HOI_VAN" | "CHU_DAI_BI" | "TAM_KINH" | "VANG_SINH_CHU";
type PaperSize = "A4" | "LETTER";

interface TemplateItem {
  publicId: string;
  sutraType: SutraType;
  slotsCount: number;
  paperSize: PaperSize;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

// ── Static Data ───────────────────────────────────────────────────────

const SUTRA_LABELS: Record<SutraType, string> = {
  LE_PHAT_DAI_SAM_HOI_VAN: "Lễ Phật Đại Sám Hối Văn",
  CHU_DAI_BI: "Chú Đại Bi",
  TAM_KINH: "Tâm Kinh",
  VANG_SINH_CHU: "Vãng Sinh Chú",
};

const SLOT_PRESETS = [27, 49, 87];

// Mock templates — replace with API query when backend is ready
const MOCK_TEMPLATES: TemplateItem[] = [
  { publicId: "tpl-1", sutraType: "LE_PHAT_DAI_SAM_HOI_VAN", slotsCount: 27, paperSize: "A4", status: "PUBLISHED", updatedAt: "2026-03-15T00:00:00Z" },
  { publicId: "tpl-2", sutraType: "LE_PHAT_DAI_SAM_HOI_VAN", slotsCount: 49, paperSize: "A4", status: "PUBLISHED", updatedAt: "2026-03-15T00:00:00Z" },
  { publicId: "tpl-3", sutraType: "LE_PHAT_DAI_SAM_HOI_VAN", slotsCount: 87, paperSize: "A4", status: "DRAFT", updatedAt: "2026-03-20T00:00:00Z" },
  { publicId: "tpl-4", sutraType: "CHU_DAI_BI", slotsCount: 49, paperSize: "A4", status: "PUBLISHED", updatedAt: "2026-03-10T00:00:00Z" },
  { publicId: "tpl-5", sutraType: "LE_PHAT_DAI_SAM_HOI_VAN", slotsCount: 27, paperSize: "LETTER", status: "PUBLISHED", updatedAt: "2026-03-15T00:00:00Z" },
];

// ── Components ────────────────────────────────────────────────────────

function TemplateCard({ item }: { item: TemplateItem }) {
  const isPublished = item.status === "PUBLISHED";
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
              <FileTextIcon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{SUTRA_LABELS[item.sutraType]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.slotsCount} biến · Khổ {item.paperSize}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
            )}
          >
            {isPublished ? "Đang dùng" : "Nháp"}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <DownloadIcon className="h-3.5 w-3.5" /> Xem PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <UploadIcon className="h-3.5 w-3.5" /> Thay PDF
          </Button>
          {isPublished ? (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArchiveIcon className="h-3.5 w-3.5" /> Lưu trữ
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-1.5 text-emerald-600">
              <CheckCircle2Icon className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Cập nhật: {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
        </p>
      </CardContent>
    </Card>
  );
}

function CreateTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [sutraType, setSutraType] = useState<SutraType>("LE_PHAT_DAI_SAM_HOI_VAN");
  const [slotsCount, setSlotsCount] = useState("27");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm biểu mẫu tự tu</DialogTitle>
          <DialogDescription>
            Tạo biểu mẫu giấy vàng mới. Upload PDF sau khi tạo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Loại kinh</span>
            <Select value={sutraType} onValueChange={(v) => setSutraType(v as SutraType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SUTRA_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Số biến trên tờ</span>
            <Input
              type="number"
              value={slotsCount}
              onChange={(e) => setSlotsCount(e.target.value)}
              placeholder="27, 49, 87..."
            />
            <span className="text-xs text-muted-foreground">
              Gợi ý: {SLOT_PRESETS.join(", ")} biến
            </span>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Khổ giấy</span>
            <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="LETTER">Letter (8.5 × 11 in)</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={() => onOpenChange(false)}>Tạo biểu mẫu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Export ────────────────────────────────────────────────────────

export function TemplatesTab() {
  const [createOpen, setCreateOpen] = useState(false);

  // Group by sutra type
  const grouped = MOCK_TEMPLATES.reduce<Record<string, TemplateItem[]>>((acc, item) => {
    const key = item.sutraType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Biểu mẫu tự tu (PDF Templates)</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý file PDF giấy vàng chuẩn để đồng tu tải về in ấn. Mỗi biểu mẫu chứa các vòng tròn để chấm đỏ.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <PlusIcon className="h-4 w-4" /> Thêm biểu mẫu
        </Button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
        <p className="font-medium text-blue-800 dark:text-blue-300">Lưu ý biên tập</p>
        <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
          PDF phải in trên giấy vàng chanh chuẩn. Vòng tròn phải đủ lớn để chấm bút đỏ.
          Mỗi tờ phải có trường ghi: Ngày bắt đầu, Ngày hoàn thành, Tên người niệm, Loại kinh.
        </p>
      </div>

      {Object.entries(grouped).map(([sutraType, items]) => (
        <div key={sutraType} className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {SUTRA_LABELS[sutraType as SutraType]}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <TemplateCard key={item.publicId} item={item} />
            ))}
          </div>
        </div>
      ))}

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
