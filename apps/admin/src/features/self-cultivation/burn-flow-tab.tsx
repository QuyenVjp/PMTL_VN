/**
 * Self-Cultivation Burn Flow & Risk Monitoring Tab
 * Displays business rules for the burn ceremony + admin risk dashboard.
 *
 * Design: design/03-domains/engagement/USE_CASES/self-cultivation-sutras-burn-flow.md §2–4
 */
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  InfoIcon,
  MessageSquareWarningIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Burn Flow Steps ───────────────────────────────────────────────────

interface BurnStep {
  step: number;
  title: string;
  detail: string;
  severity: "critical" | "warn" | "info";
  icon: React.ElementType;
}

const BURN_STEPS: BurnStep[] = [
  {
    step: 1,
    title: "Red Alert Popup",
    detail:
      "Màn hình làm mờ, hiện bảng thông báo viền đỏ: \"CẢNH BÁO: Đốt bản tự tu Lễ Phật Đại Sám Hối Văn rất dễ kích hoạt nghiệp chướng. Bạn có chắc chắn muốn sử dụng không?\"",
    severity: "critical",
    icon: ShieldAlertIcon,
  },
  {
    step: 2,
    title: "Lời khuyên Sư Phụ",
    detail:
      "Hiển thị: \"Tự thành tâm quỳ niệm tụng Lễ Phật Đại Sám Hối Văn trực tiếp sẽ có hiệu quả sám hối tốt hơn là đốt bản tự tu.\"",
    severity: "info",
    icon: MessageSquareWarningIcon,
  },
  {
    step: 3,
    title: "Hard Validation Checkbox",
    detail:
      "User bắt buộc tích: \"Tôi đã chuẩn bị sẵn Tiểu Phương Tử (Ngôi Nhà Nhỏ) để đốt kèm theo.\" — Nút [Xác nhận Đốt] disabled cho đến khi tích checkbox.",
    severity: "critical",
    icon: ShieldCheckIcon,
  },
  {
    step: 4,
    title: "Instruction Modal (Nghi thức)",
    detail:
      "Hiển thị hướng dẫn: (1) Ghi ngày đốt lên bản tự tu, (2) Thắp hương / dâng Tâm Hương, (3) Đọc lời khấn cầu Bồ Tát chứng minh, (4) Luôn đốt kèm Tiểu Phương Tử.",
    severity: "info",
    icon: CheckCircle2Icon,
  },
];

// ── Business Rules ────────────────────────────────────────────────────

interface BurnRule {
  id: string;
  title: string;
  severity: "block" | "warn" | "info";
  description: string;
  detail: string;
}

const BURN_RULES: BurnRule[] = [
  {
    id: "karmic-activation",
    title: "Nguy cơ kích hoạt nghiệp chướng",
    severity: "block",
    description: "Đốt 1 tờ SCS (27 biến cùng lúc) có rủi ro cao hơn rất nhiều so với niệm rải rác mỗi ngày.",
    detail: "Hệ thống phải hiển thị CRITICAL warning. Đây là quy tắc cốt lõi không được bỏ qua.",
  },
  {
    id: "mandatory-nnn",
    title: "Bắt buộc có Tiểu Phương Tử đi kèm",
    severity: "block",
    description: "KHÔNG BAO GIỜ cho phép đốt SCS Lễ Phật đơn độc — phải có NNN làm điều kiện tiên quyết.",
    detail: "Sám hối = gọi chủ nợ đến → phải có NNN để trả nợ. Nếu không sẽ gặp nguy hiểm tâm linh.",
  },
  {
    id: "recommendation",
    title: "Luôn hiển thị lời khuyên niệm trực tiếp",
    severity: "info",
    description: "\"Tự thành tâm quỳ niệm tụng trực tiếp sẽ có hiệu quả tốt hơn là đốt bản tự tu.\"",
    detail: "Dòng chữ này phải hiển thị mặc định trên mọi trang liên quan đến Kinh Văn Tự Tu.",
  },
  {
    id: "separate-counter",
    title: "Counter tách biệt hoàn toàn",
    severity: "block",
    description: "SCS counter ≠ Kinh Bài Tập counter ≠ Tiểu Phương Tử counter.",
    detail: "Ba loại phục vụ ba mục đích khác nhau. Không bao giờ được trộn lẫn trong hệ thống.",
  },
];

// ── Risk Monitoring Mock Data ─────────────────────────────────────────

interface RiskAlert {
  userId: string;
  displayName: string;
  event: string;
  nnnInventory: number;
  timestamp: string;
  resolved: boolean;
}

const MOCK_RISK_ALERTS: RiskAlert[] = [
  {
    userId: "u-1",
    displayName: "Nguyễn Văn A",
    event: "Đốt SCS Lễ Phật (27 biến)",
    nnnInventory: 0,
    timestamp: "2026-04-03T14:30:00Z",
    resolved: false,
  },
  {
    userId: "u-2",
    displayName: "Trần Thị B",
    event: "Đốt SCS Lễ Phật (49 biến)",
    nnnInventory: 2,
    timestamp: "2026-04-02T09:15:00Z",
    resolved: true,
  },
];

// ── Sub-components ────────────────────────────────────────────────────

function BurnStepCard({ step }: { step: BurnStep }) {
  const Icon = step.icon;
  const colors = {
    critical: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
    warn: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
  };
  const iconColors = {
    critical: "text-red-600 dark:text-red-400",
    warn: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {step.step}
        </div>
        {step.step < 4 && <div className="mt-1 h-full w-px bg-border" />}
      </div>
      <div className={cn("mb-4 flex-1 rounded-xl border p-4", colors[step.severity])}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4 shrink-0", iconColors[step.severity])} />
          <p className="text-sm font-semibold text-foreground">{step.title}</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
      </div>
    </div>
  );
}

function RuleRow({ rule }: { rule: BurnRule }) {
  const severityMap = {
    block: { badge: "destructive" as const, label: "Chặn", dot: "bg-destructive" },
    warn: { badge: "warning" as const, label: "Cảnh báo", dot: "bg-amber-500" },
    info: { badge: "secondary" as const, label: "Thông tin", dot: "bg-blue-500" },
  };
  const s = severityMap[rule.severity];

  return (
    <div className="rounded-xl border p-4 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", s.dot)} />
          <p className="text-sm font-semibold">{rule.title}</p>
        </div>
        <Badge variant={s.badge}>{s.label}</Badge>
      </div>
      <p className="text-sm text-foreground/80">{rule.description}</p>
      <p className="text-xs text-muted-foreground">{rule.detail}</p>
    </div>
  );
}

function RiskAlertRow({ alert }: { alert: RiskAlert }) {
  const isZero = alert.nnnInventory === 0;
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 rounded-xl border p-4",
      !alert.resolved && isZero
        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
        : "bg-card",
    )}>
      <div className="flex items-center gap-3">
        {!alert.resolved && isZero ? (
          <AlertTriangleIcon className="h-5 w-5 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
        <div>
          <p className="text-sm font-medium">{alert.displayName}</p>
          <p className="text-xs text-muted-foreground">{alert.event}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">NNN:</span>
          <Badge variant={isZero ? "destructive" : "outline"}>{alert.nnnInventory} tờ</Badge>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {new Date(alert.timestamp).toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────

export function BurnFlowTab() {
  return (
    <div className="space-y-6">
      {/* Burn Flow Safety Gate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlameIcon className="h-5 w-5 text-orange-500" /> Luồng Đốt 4 Bước (Burn Flow Safety Gate)
          </CardTitle>
          <CardDescription>
            Khi user bấm [Đốt tờ tự tu Lễ Phật], hệ thống phải qua 4 bước xác nhận an toàn. Không bước nào được bỏ qua.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {BURN_STEPS.map((step) => (
            <BurnStepCard key={step.step} step={step} />
          ))}
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlertIcon className="h-5 w-5" /> Quy Tắc Nghiệp Vụ Kinh Văn Tự Tu
          </CardTitle>
          <CardDescription>
            Các rule validation bắt buộc — admin có thể tùy chỉnh nội dung cảnh báo nhưng không thể tắt rule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {BURN_RULES.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Risk Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" /> Giám Sát Rủi Ro
          </CardTitle>
          <CardDescription>
            Theo dõi đồng tu đốt SCS Lễ Phật nhưng không có Tiểu Phương Tử đi kèm.
            Admin cần liên hệ nhắc nhở kịp thời.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> NNN = 0: Cần nhắc nhở ngay
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Đã xử lý
            </span>
          </div>

          {MOCK_RISK_ALERTS.map((alert) => (
            <RiskAlertRow key={`${alert.userId}-${alert.timestamp}`} alert={alert} />
          ))}

          <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            <ClockIcon className="mx-auto mb-2 h-5 w-5" />
            Dữ liệu giám sát sẽ cập nhật realtime khi backend API hoàn thiện.
            <br />
            <span className="text-xs">Mock data hiển thị để preview giao diện.</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Lời khuyên mặc định (luôn hiển thị trên mọi trang SCS)
            </p>
            <p className="mt-1 text-sm italic text-amber-700 dark:text-amber-400">
              "Tự thành tâm quỳ niệm tụng Lễ Phật Đại Sám Hối Văn trực tiếp sẽ có hiệu quả sám hối tốt hơn là đốt bản tự tu."
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Rule 3 — Recommendation Logic. Admin có thể sửa wording nhưng không thể ẩn message này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
