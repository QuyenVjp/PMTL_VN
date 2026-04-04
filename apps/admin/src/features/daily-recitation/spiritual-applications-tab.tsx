/**
 * Spiritual Applications Tab — Đơn Từ Tâm Linh
 * Catalog of spiritual application forms with burn rules + ritual instructions.
 *
 * Design: design/03-domains/content/USE_CASES/spiritual-applications.md
 */
import {
  AlertTriangleIcon,
  DownloadIcon,
  FileTextIcon,
  FlameIcon,
  FlameKindlingIcon,
  InfoIcon,
  ShieldXIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────

type BurnRule = "MUST_BURN" | "NEVER_BURN" | "OPTIONAL";

interface SpiritualApplication {
  id: string;
  name: string;
  nameEn: string;
  purpose: string;
  burnRule: BurnRule;
  paperSizes: string[];
  ritualSteps: string[];
  criticalWarning?: string;
}

// ── Data ──────────────────────────────────────────────────────────────

const APPLICATIONS: SpiritualApplication[] = [
  {
    id: "name-change",
    name: "Đơn Thăng Văn Đổi Tên",
    nameEn: "Application for Change of Name",
    purpose:
      "Dành cho người muốn dùng tên mới (đã dùng trên 1 năm) để niệm kinh và ghi lên Tiểu Phương Tử.",
    burnRule: "MUST_BURN",
    paperSizes: ["A4", "Letter"],
    ritualSteps: [
      "Điền đầy đủ thông tin: tên cũ, tên mới, ngày tháng năm sinh",
      "Quỳ trước bàn thờ, thắp hương (hoặc dâng Tâm Hương)",
      "Đọc nội dung đơn 1 lần trước Quán Thế Âm Bồ Tát",
      "ĐỐT đơn ngay sau khi đọc xong",
      "Từ đây dùng tên mới cho tất cả hoạt động niệm kinh",
    ],
  },
  {
    id: "family-persuasion",
    name: "Đơn Khuyến Đạo Người Nhà",
    nameEn: "Application for Convincing Family Members",
    purpose:
      "Dành cho đồng tu muốn xin Bồ Tát khai mở trí tuệ cho người nhà chưa tin Phật pháp.",
    burnRule: "NEVER_BURN",
    paperSizes: ["A4", "Letter"],
    ritualSteps: [
      "Điền thông tin: tên người cầu, tên người nhà, quan hệ",
      "Quỳ trước bàn thờ, thắp hương (hoặc dâng Tâm Hương)",
      "Đọc nội dung đơn 1 lần trước Quán Thế Âm Bồ Tát",
      "CẤT GIỮ CẨN THẬN — TUYỆT ĐỐI KHÔNG ĐỐT",
    ],
    criticalWarning:
      "Đốt đơn này có thể ảnh hưởng đến hồn phách người nhà. Hệ thống phải BLOCK và cảnh báo đỏ nếu user cố đánh dấu đã đốt.",
  },
];

// ── Components ────────────────────────────────────────────────────────

function BurnRuleBadge({ rule }: { rule: BurnRule }) {
  if (rule === "MUST_BURN") {
    return (
      <Badge variant="warning" className="gap-1">
        <FlameIcon className="h-3 w-3" /> Bắt buộc đốt
      </Badge>
    );
  }
  if (rule === "NEVER_BURN") {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldXIcon className="h-3 w-3" /> CẤM đốt
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <InfoIcon className="h-3 w-3" /> Tùy chọn
    </Badge>
  );
}

function ApplicationCard({ app }: { app: SpiritualApplication }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              app.burnRule === "NEVER_BURN"
                ? "bg-red-100 dark:bg-red-950/40"
                : "bg-amber-100 dark:bg-amber-950/40",
            )}>
              <FileTextIcon className={cn(
                "h-5 w-5",
                app.burnRule === "NEVER_BURN"
                  ? "text-red-700 dark:text-red-400"
                  : "text-amber-700 dark:text-amber-400",
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{app.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{app.nameEn}</CardDescription>
            </div>
          </div>
          <BurnRuleBadge rule={app.burnRule} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {app.purpose}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Nghi thức sử dụng
          </p>
          <ol className="space-y-1.5">
            {app.ritualSteps.map((step, i) => {
              const isWarningStep = step.startsWith("CẤT GIỮ") || step.startsWith("ĐỐT");
              return (
                <li key={step} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className={cn(
                    "text-sm",
                    isWarningStep && "font-semibold text-foreground",
                  )}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <p className="text-xs text-muted-foreground mr-1">Khổ giấy:</p>
          {app.paperSizes.map((size) => (
            <Badge key={size} variant="outline" className="gap-1 text-xs">
              <DownloadIcon className="h-3 w-3" /> {size}
            </Badge>
          ))}
        </div>

        {app.criticalWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/30">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-red-800 dark:text-red-300">
              {app.criticalWarning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Export ────────────────────────────────────────────────────────

export function SpiritualApplicationsTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FlameKindlingIcon className="h-5 w-5 text-primary" />
          Đơn Từ Tâm Linh (Spiritual Applications)
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Các mẫu đơn giấy vàng A4 "gửi lên Bồ Tát". Admin quản lý PDF template + hướng dẫn nghi thức.
          PDF thực tế quản lý trong module <strong>Tải xuống</strong> với category = SPIRITUAL_APPLICATION.
        </p>
      </div>

      {/* Burn Rule Legend */}
      <div className="flex flex-wrap gap-4 rounded-xl border px-4 py-3 text-xs">
        <span className="flex items-center gap-1.5">
          <FlameIcon className="h-3.5 w-3.5 text-amber-500" />
          <strong>MUST_BURN:</strong> Bắt buộc đốt sau khi đọc
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldXIcon className="h-3.5 w-3.5 text-destructive" />
          <strong>NEVER_BURN:</strong> Cấm đốt tuyệt đối — block + cảnh báo đỏ
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {APPLICATIONS.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>

      <Separator />

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quy tắc quản trị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-muted-foreground">
              <strong>Download tracking:</strong> Chỉ thu thập aggregate (tổng lượt tải/loại/tháng). Không lưu thông tin cá nhân người tải.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-muted-foreground">
              <strong>Instruction mandatory:</strong> User không thể tải PDF mà bỏ qua hướng dẫn nghi thức. Modal hiển thị trước nút Download.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-muted-foreground">
              <strong>NEVER_BURN enforcement:</strong> Nếu frontend gửi request đánh dấu "đã đốt" cho đơn Khuyến Đạo, backend phải reject với HTTP 422.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
