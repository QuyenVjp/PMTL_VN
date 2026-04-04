/**
 * Daily Recitation Admin Workspace
 * Quản lý Kinh Văn Tự Tu — Bài Tập Hàng Ngày
 *
 * Design source: design/03-domains/wisdom-qa/USE_CASES/daily-recitation-system.md
 */
import { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  CloudLightningIcon,
  FlameIcon,
  InfoIcon,
  ListChecksIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
  HeartPulseIcon,
  BrainIcon,
  StarIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  VolumeXIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────

type SutraGroup = "foundation" | "short-mantra";

type TimeRestriction = "none" | "no-after-22" | "no-22-to-5" | "anytime";

interface SutraItem {
  id: string;
  name: string;
  nameVi: string;
  group: SutraGroup;
  purpose: string;
  dosageNormal: string;
  dosageIll?: string;
  prayerTemplate: string;
  timeRestriction: TimeRestriction;
  weatherRestriction: boolean;
  mustBeFirst?: boolean;
  warningNotes: string[];
  defaultCounts: number[];
}

interface PracticePreset {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  badgeVariant: "default" | "secondary" | "warning" | "destructive" | "success" | "outline";
  sutras: { name: string; dose: string; note?: string }[];
  specialNote?: string;
}

interface BusinessRule {
  id: string;
  title: string;
  severity: "block" | "warn" | "info";
  icon: React.ElementType;
  description: string;
  detail: string;
}

type WorkflowStep = {
  step: number;
  title: string;
  detail: string;
  icon: React.ElementType;
};

// ── Data ──────────────────────────────────────────────────────────────

const SUTRAS: SutraItem[] = [
  {
    id: "chu-dai-bi",
    name: "Chú Đại Bi",
    nameVi: "Great Compassion Mantra",
    group: "foundation",
    purpose: "Tăng công lực, chữa bệnh, cầu nguyện thành tựu",
    dosageNormal: "3–7 biến",
    dosageIll: "21–49 biến (trước phẫu thuật / bệnh nặng)",
    prayerTemplate:
      "Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát bảo vệ và ban phước cho con [Tên], ban cho con sức khỏe và tăng cường công lực",
    timeRestriction: "anytime",
    weatherRestriction: false,
    mustBeFirst: true,
    warningNotes: ["Luôn đọc đầu tiên trong thời khóa hàng ngày"],
    defaultCounts: [3, 7, 21, 49],
  },
  {
    id: "tam-kinh",
    name: "Tâm Kinh",
    nameVi: "Heart Sutra",
    group: "foundation",
    purpose: "Mở trí tuệ, bình ổn cảm xúc, hóa giải phiền não",
    dosageNormal: "3–7 biến",
    prayerTemplate:
      "Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát bảo vệ và ban phước cho con [Tên], ban cho con trí tuệ, sự bình tĩnh, tâm thanh tịnh và xua tan phiền não",
    timeRestriction: "no-after-22",
    weatherRestriction: true,
    warningNotes: [
      "Cấm đọc sau 22:00",
      "Cấm đọc khi trời mưa bão, sấm chớp, mây đen",
    ],
    defaultCounts: [3, 7, 21, 49],
  },
  {
    id: "le-phat-dai-sam-hoi-van",
    name: "Lễ Phật Đại Sám Hối Văn",
    nameVi: "88 Buddhas Great Repentance",
    group: "foundation",
    purpose: "Sám hối lỗi lầm quá khứ/hiện tại, tiêu trừ nghiệp chướng",
    dosageNormal: "1–3 biến",
    dosageIll: "Tối đa 5–7 biến (vượt quá sẽ kích hoạt nghiệp)",
    prayerTemplate:
      "Xin Đại Từ Đại Bi... giúp con [Tên] sám hối và tiêu trừ nghiệp chướng (trên thân / bộ phận cơ thể), ban cho con sức khỏe và trí tuệ",
    timeRestriction: "no-22-to-5",
    weatherRestriction: false,
    warningNotes: [
      "Cấm đọc từ 22:00 đến 5:00 sáng",
      "Nếu đau nhức khi đọc → đốt ngay 4–7 Tiểu Phương Tử",
    ],
    defaultCounts: [1, 3, 5, 7],
  },
  {
    id: "vang-sinh-chu",
    name: "Vãng Sinh Chú",
    nameVi: "Rebirth Mantra",
    group: "short-mantra",
    purpose: "Cầu vãng sinh, siêu độ côn trùng / động vật nhỏ đã giết/ăn",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate:
      "Xin Bồ Tát giúp siêu độ các vong linh động vật nhỏ vì con mà chết, giúp con tiêu trừ nghiệp chướng",
    timeRestriction: "no-after-22",
    weatherRestriction: true,
    warningNotes: ["Cấm đọc sau 22:00", "Cấm đọc khi mưa bão"],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "giai-ket-chu",
    name: "Giải Kết Chú",
    nameVi: "Mantra to Untie Karmic Knots",
    group: "short-mantra",
    purpose: "Hóa giải mâu thuẫn gia đình, đồng nghiệp",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin hóa giải ác duyên giữa con [Tên] và [Tên đối phương]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "tieu-tai-cat-tuong",
    name: "Tiêu Tai Cát Tường Thần Chú",
    nameVi: "Auspicious Mantra for Removing Disasters",
    group: "short-mantra",
    purpose: "Hóa giải rắc rối đột xuất, kiện tụng, xui xẻo",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Bồ Tát giúp tiêu tai giải nạn cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "chuan-de-than-chu",
    name: "Chuẩn Đề Thần Chú",
    nameVi: "Cundi Mantra",
    group: "short-mantra",
    purpose: "Cầu thành công công việc, thi cử, hôn nhân",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Bồ Tát phù hộ cho con [Tên] thành tựu [mục tiêu]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "cong-duc-bao-son",
    name: "Công Đức Bảo Sơn Thần Chú",
    nameVi: "Merit Mountain Mantra",
    group: "short-mantra",
    purpose: "Chuyển hóa việc thiện thành công đức (có thể đọc cho thai nhi)",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Bồ Tát gia trì chuyển thiện thành công đức cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "that-phat-diet-toi",
    name: "Thất Phật Diệt Tội Chân Ngôn",
    nameVi: "Seven Buddhas Mantra for Eradicating Sins",
    group: "short-mantra",
    purpose: "Tiêu trừ nghiệp chướng nhỏ mới phát sinh (dùng trong bước Bổ Khuyết)",
    dosageNormal: "3 biến (bước Thanh Lọc) / 21–49 biến",
    prayerTemplate: "Xin Bồ Tát giúp con [Tên] tiêu trừ nghiệp chướng nhỏ trong ngày",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: ["Bắt buộc niệm 3 biến ở bước 6 (Thanh lọc) mỗi ngày"],
    defaultCounts: [3, 21, 27, 49],
  },
  {
    id: "thanh-vo-luong-tho",
    name: "Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni",
    nameVi: "Mantra of the King of Definitive Light of Immeasurable Life",
    group: "short-mantra",
    purpose: "Kéo dài tuổi thọ",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Bồ Tát gia trì kéo dài tuổi thọ và sức khỏe cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: ["Ưu tiên trong phác đồ Người Cao Tuổi (49 biến)"],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "nhu-y-bao-luan",
    name: "Như Ý Bảo Luân Vương Đà La Ni",
    nameVi: "Cintamani Dharani",
    group: "short-mantra",
    purpose: "Cầu thành công, nhận ánh sáng Phật",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Bồ Tát ban ánh sáng và phù hộ thành công cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "dai-cat-tuong-thien-nu",
    name: "Đại Cát Tường Thiên Nữ Chú",
    nameVi: "Great Auspicious Goddess Mantra",
    group: "short-mantra",
    purpose: "Cầu thoát nghèo, may mắn tình cảm",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Thiên Nữ Cát Tường gia trì may mắn và thịnh vượng cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: [],
    defaultCounts: [21, 27, 49],
  },
  {
    id: "quan-am-linh-cam",
    name: "Quán Âm Linh Cảm Chân Ngôn",
    nameVi: "Guanyin Spiritual Response Mantra",
    group: "short-mantra",
    purpose: "Cầu nguyện linh ứng nhanh",
    dosageNormal: "21, 27 hoặc 49 biến",
    prayerTemplate: "Xin Quán Thế Âm Bồ Tát linh ứng và gia hộ cho con [Tên]",
    timeRestriction: "none",
    weatherRestriction: false,
    warningNotes: ["Yêu cầu tâm cực tịnh khi niệm"],
    defaultCounts: [21, 27, 49],
  },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: "Khởi động",
    detail: "Niệm Tịnh Khẩu Nghiệp Chân Ngôn — 7 biến",
    icon: SparklesIcon,
  },
  {
    step: 2,
    title: "Kết nối",
    detail: "Thắp hương trước Phật đài. Không có bàn thờ: chọn \"Thắp Tâm Hương\" (quán tưởng trong đầu).",
    icon: FlameIcon,
  },
  {
    step: 3,
    title: "Thỉnh an",
    detail: "Đọc 3 lần: \"Cảm tạ Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát\"",
    icon: BookOpenIcon,
  },
  {
    step: 4,
    title: "Tụng kinh chính",
    detail: "Chú Đại Bi luôn đọc đầu tiên. Các kinh sau không cần thứ tự cố định. Mỗi kinh: Đọc Lời Khấn → Đọc Tên Đầy Đủ → Đọc Nội Dung.",
    icon: ListChecksIcon,
  },
  {
    step: 5,
    title: "Bổ khuyết",
    detail: "Niệm Bổ Khuyết Chân Ngôn 3–7 biến để bù đắp sai sót trong khi tụng.",
    icon: CheckCircle2Icon,
  },
  {
    step: 6,
    title: "Thanh lọc",
    detail: "Niệm Thất Phật Diệt Tội Chân Ngôn 3 biến để gột rửa nghiệp nhỏ trong ngày.",
    icon: ShieldAlertIcon,
  },
  {
    step: 7,
    title: "Hoàn mãn",
    detail: "Cảm tạ Quán Thế Âm Bồ Tát đã gia hộ cho [Tên người niệm].",
    icon: StarIcon,
  },
];

const BUSINESS_RULES: BusinessRule[] = [
  {
    id: "rule-dead-zone",
    title: "Khung giờ cấm tuyệt đối",
    severity: "block",
    icon: ClockIcon,
    description: "Block 2:00 AM – 5:00 AM",
    detail:
      "Không cho đánh dấu hoàn thành bất kỳ kinh nào trong khung giờ này. Ứng dụng phải block hoàn toàn, không phải chỉ cảnh báo.",
  },
  {
    id: "rule-yin-sutras",
    title: "Kinh Âm — giờ & thời tiết",
    severity: "warn",
    icon: CloudLightningIcon,
    description: "Tâm Kinh / Vãng Sinh Chú: cấm sau 22:00 hoặc mưa bão. Lễ Phật: cấm 22:00 – 5:00.",
    detail:
      "Tích hợp API thời tiết: nếu báo mưa bão / sấm chớp → popup nhắc nhở ngưng niệm Tâm Kinh và Vãng Sinh Chú. Cảnh báo màu đỏ.",
  },
  {
    id: "rule-interruption",
    title: "Xử lý gián đoạn",
    severity: "info",
    icon: InfoIcon,
    description: "Nút Tạm Dừng bắt buộc. Câu phục hồi: \"Ông Lai Mu Suo He\".",
    detail:
      "Khi có người gọi: nhấn Pause → đọc \"Ông Lai Mu Suo He\" 1 lần. Khi quay lại: đọc 1 lần nữa rồi niệm tiếp. Thần chú ngắn: nhắc niệm lại từ đầu.",
  },
  {
    id: "rule-wish-limit",
    title: "Giới hạn cầu nguyện",
    severity: "warn",
    icon: ShieldAlertIcon,
    description: "Tối đa 3 lời cầu xin trước bài tập.",
    detail:
      "Tham cầu quá nhiều sẽ mất linh nghiệm. Giao diện giới hạn user nhập tối đa 3 lời nguyện cầu trước khi bắt đầu tụng.",
  },
  {
    id: "rule-volume",
    title: "Âm lượng",
    severity: "info",
    icon: VolumeXIcon,
    description: "Đọc nhẩm thành tiếng nhỏ vừa đủ nghe.",
    detail:
      "Không đọc thầm (trệ máu huyết). Không đọc quá to (tổn khí). Cảnh báo nhắc nhở hiển thị ở đầu mỗi thời khóa.",
  },
  {
    id: "rule-separate-count",
    title: "Tách biệt Tiểu Phương Tử",
    severity: "block",
    icon: AlertTriangleIcon,
    description: "Số biến bài tập KHÔNG tính gộp vào Tiểu Phương Tử.",
    detail:
      "Đây là phân biệt cốt lõi. Hệ thống phải lưu hai counter riêng biệt. Kinh bài tập = nạp năng lượng. Tiểu Phương Tử = trả nợ nghiệp. Không được trộn lẫn.",
  },
];

const PRESETS: PracticePreset[] = [
  {
    id: "beginner",
    name: "Người Mới Bắt Đầu",
    icon: UserIcon,
    description: "Thời khóa nhập môn, phù hợp cho người mới tu học",
    badgeVariant: "secondary",
    sutras: [
      { name: "Chú Đại Bi", dose: "7 biến" },
      { name: "Tâm Kinh", dose: "7 biến" },
      { name: "Lễ Phật Đại Sám Hối Văn", dose: "1–3 biến" },
      { name: "Vãng Sinh Chú", dose: "21 hoặc 49 biến" },
    ],
  },
  {
    id: "elder",
    name: "Người Cao Tuổi",
    icon: UsersIcon,
    description: "Thời khóa chú trọng kéo dài tuổi thọ và cầu vãng sinh",
    badgeVariant: "default",
    sutras: [
      { name: "Chú Đại Bi", dose: "21–49 biến" },
      { name: "Tâm Kinh", dose: "7–21 biến" },
      { name: "Lễ Phật Đại Sám Hối Văn", dose: "~3 biến" },
      { name: "Vãng Sinh Chú", dose: "21 hoặc 49 biến" },
      { name: "Thánh Vô Lượng Thọ", dose: "49 biến" },
      { name: "A Di Đà Kinh", dose: "3–7 biến", note: "Người trên 60–70 tuổi cầu vãng sinh" },
    ],
  },
  {
    id: "severe-illness",
    name: "Người Bệnh Nặng / Ung Thư",
    icon: HeartPulseIcon,
    description: "Thời khóa tăng cường tiêu nghiệp, kết hợp Tiểu Phương Tử liên tục",
    badgeVariant: "warning",
    sutras: [
      { name: "Chú Đại Bi", dose: "21 biến (giai đoạn bùng phát) → 49 biến (khi ổn định)", note: "Bắt buộc đọc suốt đời" },
      { name: "Tâm Kinh", dose: "49 biến" },
      { name: "Lễ Phật Đại Sám Hối Văn", dose: "3–5 biến" },
    ],
    specialNote:
      "Bắt buộc kết hợp: đốt Tiểu Phương Tử liên tục (từng đợt 21 hoặc 49 tờ) + Phóng sinh số lượng lớn + Phát Đại Nguyện.",
  },
  {
    id: "mental-illness",
    name: "Người Trầm Cảm / Tâm Thần",
    icon: BrainIcon,
    description: "Thời khóa ổn định tâm trí, Tâm Kinh là trọng tâm",
    badgeVariant: "secondary",
    sutras: [
      { name: "Chú Đại Bi", dose: "Không vượt quá 21 biến" },
      { name: "Tâm Kinh", dose: "21–49 biến" },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────

function TimeRestrictionBadge({ restriction, weather }: { restriction: TimeRestriction; weather: boolean }) {
  const badges: React.ReactNode[] = [];

  if (restriction === "anytime") {
    badges.push(
      <Badge key="anytime" variant="success" className="gap-1">
        <ClockIcon className="h-3 w-3" /> Mọi giờ
      </Badge>,
    );
  } else if (restriction === "no-after-22") {
    badges.push(
      <Badge key="no22" variant="warning" className="gap-1">
        <ClockIcon className="h-3 w-3" /> Cấm sau 22:00
      </Badge>,
    );
  } else if (restriction === "no-22-to-5") {
    badges.push(
      <Badge key="no22to5" variant="destructive" className="gap-1">
        <ClockIcon className="h-3 w-3" /> Cấm 22:00–5:00
      </Badge>,
    );
  }

  if (weather) {
    badges.push(
      <Badge key="weather" variant="warning" className="gap-1">
        <CloudLightningIcon className="h-3 w-3" /> Cấm mưa bão
      </Badge>,
    );
  }

  return <div className="flex flex-wrap gap-1.5">{badges}</div>;
}

function SutraCard({ sutra }: { sutra: SutraItem }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {sutra.mustBeFirst && (
                <Badge variant="default" className="gap-1 text-[10px]">
                  <StarIcon className="h-2.5 w-2.5" /> Đầu tiên
                </Badge>
              )}
              <CardTitle className="text-base">{sutra.name}</CardTitle>
            </div>
            <CardDescription className="text-xs">{sutra.nameVi}</CardDescription>
          </div>
          <TimeRestrictionBadge restriction={sutra.timeRestriction} weather={sutra.weatherRestriction} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
          <p className="text-muted-foreground">{sutra.purpose}</p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Liều lượng thường</p>
            <p className="font-semibold text-foreground">{sutra.dosageNormal}</p>
          </div>
          {sutra.dosageIll && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Liều lượng bệnh nặng</p>
              <p className="font-semibold text-amber-600 dark:text-amber-400">{sutra.dosageIll}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Số biến mặc định</p>
          <div className="flex flex-wrap gap-1.5">
            {sutra.defaultCounts.map((c) => (
              <span
                key={c}
                className="inline-flex h-6 w-8 items-center justify-center rounded border bg-background text-xs font-mono font-semibold"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Lời khấn mẫu</p>
          <p className="rounded-lg border border-dashed px-3 py-2 text-xs leading-relaxed text-foreground/80 italic">
            {sutra.prayerTemplate}
          </p>
        </div>

        {sutra.warningNotes.length > 0 && (
          <div className="space-y-1.5">
            {sutra.warningNotes.map((note) => (
              <div
                key={note}
                className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RuleCard({ rule }: { rule: BusinessRule }) {
  const Icon = rule.icon;
  const colors = {
    block: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
    warn: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
  };
  const iconColors = {
    block: "text-red-600 dark:text-red-400",
    warn: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };
  const badgeMap: Record<string, "destructive" | "warning" | "secondary"> = {
    block: "destructive",
    warn: "warning",
    info: "secondary",
  };
  const labelMap = { block: "Chặn", warn: "Cảnh báo", info: "Thông tin" };

  return (
    <div className={cn("rounded-xl border p-4 space-y-2", colors[rule.severity])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className={cn("h-4 w-4 shrink-0", iconColors[rule.severity])} />
          <p className="text-sm font-semibold text-foreground">{rule.title}</p>
        </div>
        <Badge variant={badgeMap[rule.severity]}>{labelMap[rule.severity]}</Badge>
      </div>
      <p className="text-sm font-medium text-foreground/80">{rule.description}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{rule.detail}</p>
    </div>
  );
}

function WorkflowStepCard({ step }: { step: WorkflowStep }) {
  const Icon = step.icon;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {step.step}
        </div>
        {step.step < 7 && <div className="mt-1 h-full w-px bg-border" />}
      </div>
      <div className="pb-5 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{step.title}</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
      </div>
    </div>
  );
}

function PresetCard({ preset }: { preset: PracticePreset }) {
  const Icon = preset.icon;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{preset.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{preset.description}</CardDescription>
            </div>
          </div>
          <Badge variant={preset.badgeVariant}>{preset.sutras.length} kinh</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {preset.sutras.map((s) => (
          <div key={s.name} className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
            <div>
              <p className="text-sm font-medium">{s.name}</p>
              {s.note && <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>}
            </div>
            <span className="shrink-0 rounded border bg-background px-2 py-0.5 text-xs font-semibold">
              {s.dose}
            </span>
          </div>
        ))}

        {preset.specialNote && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{preset.specialNote}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function DailyRecitationWorkspace() {
  const [activeTab, setActiveTab] = useState<string>("sutra-list");

  const foundationSutras = SUTRAS.filter((s) => s.group === "foundation");
  const shortMantras = SUTRAS.filter((s) => s.group === "short-mantra");

  return (
    <div className="space-y-5">
      {/* Page header */}
      <section className="rounded-2xl border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Nội dung / Niệm kinh / Kinh Bài Tập Hàng Ngày</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Kinh Bài Tập Hàng Ngày
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Quản lý toàn bộ catalog kinh văn tự tu: Kinh lớn nền tảng, Thập Tiểu Chú, quy tắc thời gian & thời tiết,
              phác đồ tu học theo đối tượng, và luồng 7 bước hàng ngày.
            </p>
          </div>

          <div className="rounded-xl border bg-destructive/5 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-destructive" />
              <p className="font-semibold text-destructive">Nguyên tắc cốt lõi</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Số biến bài tập <strong>KHÔNG</strong> tính gộp vào Tiểu Phương Tử.<br />
              Đây là hai counter riêng biệt hoàn toàn.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpenIcon className="h-4 w-4" />
            <strong className="text-foreground">{foundationSutras.length}</strong> Kinh lớn nền tảng
          </span>
          <span className="flex items-center gap-1.5">
            <SparklesIcon className="h-4 w-4" />
            <strong className="text-foreground">{shortMantras.length}</strong> Thập Tiểu Chú
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldAlertIcon className="h-4 w-4" />
            <strong className="text-foreground">{BUSINESS_RULES.length}</strong> Business rules
          </span>
          <span className="flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4" />
            <strong className="text-foreground">{PRESETS.length}</strong> Phác đồ
          </span>
        </div>
      </section>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="sutra-list" className="gap-2">
            <BookOpenIcon className="h-4 w-4" /> Kinh văn
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <ListChecksIcon className="h-4 w-4" /> Luồng 7 bước
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <ShieldAlertIcon className="h-4 w-4" /> Quy tắc nghiệp vụ
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <UsersIcon className="h-4 w-4" /> Phác đồ tu học
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Sutra catalog */}
        <TabsContent value="sutra-list" className="mt-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Kinh Lớn Nền Tảng</h2>
              <Badge variant="outline">{foundationSutras.length} kinh</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Bắt buộc có trong mọi thời khóa hàng ngày. <strong>Chú Đại Bi phải đọc đầu tiên.</strong>
            </p>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {foundationSutras.map((s) => (
                <SutraCard key={s.id} sutra={s} />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Thập Tiểu Chú</h2>
              <Badge variant="outline">{shortMantras.length} chú</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Thường set mặc định 21, 27 hoặc 49 biến. Chọn theo nhu cầu cầu nguyện cụ thể.
            </p>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {shortMantras.map((s) => (
                <SutraCard key={s.id} sutra={s} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: 7-step workflow */}
        <TabsContent value="workflow" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecksIcon className="h-5 w-5" /> Luồng Thực Hành 7 Bước Hàng Ngày
              </CardTitle>
              <CardDescription>
                Hệ thống phải hướng dẫn người dùng thực hiện đúng thứ tự 7 bước này mỗi ngày.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                {WORKFLOW_STEPS.map((step) => (
                  <WorkflowStepCard key={step.step} step={step} />
                ))}
              </div>

              <Separator className="my-4" />

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="flex items-start gap-2">
                  <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Ghi chú khi gián đoạn</p>
                    <p className="text-xs leading-relaxed">
                      Khi bị gián đoạn: đọc <strong>"Ông Lai Mu Suo He"</strong> 1 lần trước khi dừng.
                      Khi quay lại: đọc lại 1 lần rồi niệm tiếp.
                      Nếu là thần chú ngắn: niệm lại từ đầu.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Business rules */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlertIcon className="h-5 w-5" /> Quy Tắc Nghiệp Vụ
              </CardTitle>
              <CardDescription>
                Các rule cần cài đặt validation trong App / Web để đảm bảo thực hành đúng chuẩn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> Chặn: block hoàn toàn
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Cảnh báo: popup / nhắc nhở
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Thông tin: hiển thị nhắc nhở
                </span>
              </div>
              {BUSINESS_RULES.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Practice presets */}
        <TabsContent value="presets" className="mt-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Phác Đồ Tu Học Theo Đối Tượng</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hệ thống gợi ý phác đồ dựa trên độ tuổi và tình trạng sức khỏe người dùng.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {PRESETS.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
