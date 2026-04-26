import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BellRingIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  FlameIcon,
  HeartHandshakeIcon,
  ListChecksIcon,
  MapIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuidesTable } from "@/features/guides/guides-table";
import { useNavigateTo } from "@/lib/router-utils";

type GuidesPageProps = {
  title?: string;
  description?: string;
  defaultCategory?: string;
  createHref?: string;
  detailBasePath?: string;
  intro?: ReactNode;
};

export function GuidesPage({
  title = "Hướng dẫn",
  description = "Quản trị nội dung nhập môn và hướng dẫn thực hành cho thành viên.",
  defaultCategory,
  createHref = "/noi-dung/huong-dan/tao-moi",
  detailBasePath = "/noi-dung/huong-dan",
  intro,
}: GuidesPageProps = {}) {
  const navigateTo = useNavigateTo();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => void navigateTo(createHref)}>
          <PlusIcon className="size-4" />
          Tạo hướng dẫn
        </Button>
      </div>

      {intro}

      <GuidesTable
        defaultCategory={defaultCategory}
        detailBasePath={detailBasePath}
      />
    </div>
  );
}

export function DailyPracticePage() {
  const iaGroups = [
    { title: "Bắt đầu", route: "/kinh-bai-tap/bat-dau", icon: SparklesIcon, note: "Định nghĩa công khóa, baseline cho người mới, khác gì với Ngôi Nhà Nhỏ và Kinh văn tự tu." },
    { title: "Các bước", route: "/kinh-bai-tap/cac-buoc", icon: ListChecksIcon, note: "Step sequence 1-7, phần chú nhỏ, tên đầy đủ các bài kinh/chú cần đọc." },
    { title: "Lưu ý", route: "/kinh-bai-tap/luu-y", icon: ShieldAlertIcon, note: "Giờ giấc, địa điểm, cách bù, gián đoạn, posture và hygiene rules." },
    { title: "Theo tình huống", route: "/kinh-bai-tap/theo-tinh-huong", icon: MapIcon, note: "Scenario presets cho người mới, công việc, học hành, cao tuổi, bệnh nặng." },
  ];

  const intro = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Kiến trúc Kinh bài tập hằng ngày</CardTitle>
              <CardDescription>
                Đây là daily commitment surface: hướng dẫn, preset, FAQ và download. Không phải nơi sửa streak hoặc practice profile của member.
              </CardDescription>
            </div>
            <Badge variant="outline">Content owner</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {iaGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-background shadow-xs">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <p className="font-medium">{group.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.route}</p>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{group.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Boundary bắt buộc</CardTitle>
            <CardDescription>
              Kinh bài tập không ôm luôn Kinh văn tự tu, Ngôi Nhà Nhỏ, lịch advisory hay tracker cá nhân.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/noi-dung/kinh-van-tu-tu">
                Kinh văn tự tu
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/noi-dung/ngoi-nha-nho">
                Ngôi Nhà Nhỏ
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Các owner liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-5">
            <div className="flex gap-2"><BookOpenIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Content giữ ritual truth, presets, source notes và downloads.</span></div>
            <div className="flex gap-2"><ClipboardListIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Engagement giữ practice sheet, logs, counters và private streak.</span></div>
            <div className="flex gap-2"><CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Calendar chỉ compose advisory theo ngày đặc biệt, không sửa nội dung nghi thức.</span></div>
            <div className="flex gap-2"><BellRingIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Notification chỉ delivery reminder khi có cấu hình downstream.</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <GuidesPage
      title="Kinh bài tập"
      description="Quản lý hướng dẫn, baseline, scenario presets, FAQ và download cho công khóa hằng ngày."
      defaultCategory="DAILY_PRACTICE"
      createHref="/noi-dung/kinh-bai-tap/tao-moi"
      detailBasePath="/noi-dung/kinh-bai-tap"
      intro={intro}
    />
  );
}

export function LittleHousePage() {
  const iaGroups = [
    { title: "Bắt đầu", route: "/ngoi-nha-nho/bat-dau", icon: SparklesIcon, note: "Khái niệm, hiệu dụng, Phật cụ, cấu trúc 27/49/84/87." },
    { title: "Trì tụng", route: "/ngoi-nha-nho/tri-tung", icon: BookOpenIcon, note: "Lưu ý trước khi niệm, trình tự, Kính Tặng/Tặng, chấm đỏ." },
    { title: "Đốt & hậu xử lý", route: "/ngoi-nha-nho/dot-va-hau-xu-ly", icon: FlameIcon, note: "Quy trình đốt, bảo quản, xử lý tro, hủy tờ sai/bẩn." },
    { title: "Tra cứu", route: "/ngoi-nha-nho/tra-cuu", icon: SearchIcon, note: "Số lượng theo tình huống, FAQ, in ấn và tài liệu liên quan." },
    { title: "Thực hành", route: "/ngoi-nha-nho/thuc-hanh", icon: ListChecksIcon, note: "Checklist và cầu nối sang tracker cá nhân." },
  ];

  const intro = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Kiến trúc nội dung Ngôi Nhà Nhỏ</CardTitle>
              <CardDescription>
                Design gom 13 nhóm nguồn thành 5 nhóm IA để admin quản theo mental model, không còn một danh sách phẳng khó hiểu.
              </CardDescription>
            </div>
            <Badge variant="outline">Content owner</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {iaGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-background shadow-xs">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <p className="font-medium">{group.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.route}</p>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{group.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vận hành riêng</CardTitle>
            <CardDescription>
              Nội dung hướng dẫn và hồ sơ sớ không cùng owner. Hai lối này tách riêng để tránh sửa nhầm business state trong content editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/so/danh-sach">
                Hồ sơ sớ
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/so/gian-lan">
                Hàng đợi gian lận
                <ShieldAlertIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boundary với Kinh văn tự tu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-5 text-muted-foreground">
            <p>
              Flow hủy tờ sai/bẩn là source-of-truth ở Ngôi Nhà Nhỏ. Kinh văn tự tu chỉ link chéo với boundary note,
              không duplicate wording riêng.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/noi-dung/kinh-van-tu-tu">
                Mở Kinh văn tự tu
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <GuidesPage
      title="Ngôi Nhà Nhỏ"
      description="Quản lý knowledge hub, guide pages, case variants, FAQ, assets và downloads cho Ngôi Nhà Nhỏ."
      defaultCategory="LITTLE_HOUSE"
      createHref="/noi-dung/ngoi-nha-nho/tao-moi"
      detailBasePath="/noi-dung/ngoi-nha-nho"
      intro={intro}
    />
  );
}

export function LifeReleasePage() {
  const iaGroups = [
    { title: "Nghi thức cơ bản", route: "/huong-dan/phong-sanh/nghi-thuc-co-ban", icon: ListChecksIcon, note: "Step sequence từ chuẩn bị, cung thỉnh, khấn chính, tụng kinh/chú đến thả nhẹ nhàng." },
    { title: "Cho bản thân", route: "/huong-dan/phong-sanh/cho-ban-than", icon: SparklesIcon, note: "Variant phóng sanh cho chính mình, giữ placeholder và wording đúng nguồn." },
    { title: "Cho người khác", route: "/huong-dan/phong-sanh/cho-nguoi-khac", icon: HeartHandshakeIcon, note: "Variant hồi hướng/nguyện lực cho người khác, bắt buộc có sourceReference." },
    { title: "Lưu ý & chuẩn bị", route: "/huong-dan/phong-sanh/luu-y-va-chuan-bi", icon: ShieldAlertIcon, note: "Warning, checklist, ethical guidelines và xử lý loài vật tử vong ngoài ý muốn." },
    { title: "Hỏi đáp", route: "/huong-dan/phong-sanh/hoi-dap", icon: SearchIcon, note: "FAQ và tài liệu tải xuống đi qua content/download owner." },
  ];

  const intro = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Kiến trúc Phóng sanh</CardTitle>
              <CardDescription>
                Phóng sanh là ritual guide surface cộng với journal workflow. Màn này quản nội dung nghi thức, không thay journal của member.
              </CardDescription>
            </div>
            <Badge variant="outline">Content owner</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {iaGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-background shadow-xs">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <p className="font-medium">{group.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.route}</p>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{group.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vận hành riêng</CardTitle>
            <CardDescription>
              Journal, assisted entry và thống kê theo loài nằm ở lane vận hành/vows-merit, không chôn trong bài hướng dẫn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/phong-sinh/ho-so">
                Hồ sơ phóng sinh
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/phong-sinh/thong-ke">
                Thống kê theo loài
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/ho-tro/phat-nguyen/nhap-ho">
                Nhập hộ phát nguyện
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation nội dung nhạy cảm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-5 text-muted-foreground">
            <p>Script wording, biến thể cho người khác, ethical warning và species-specific note phải có nguồn và review note trước khi publish.</p>
            <p>Journal chỉ nhận `guideContextRef` / `ritualVariantRef`; không giữ full ritual script.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <GuidesPage
      title="Phóng Sanh"
      description="Quản lý nghi thức, variants, lưu ý, FAQ và downloads cho hướng dẫn phóng sanh."
      defaultCategory="LIFE_RELEASE"
      createHref="/noi-dung/phong-sanh/tao-moi"
      detailBasePath="/noi-dung/phong-sanh"
      intro={intro}
    />
  );
}
