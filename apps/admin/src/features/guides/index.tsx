import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BellRingIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
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
    {
      title: "Bắt đầu cho người mới",
      route: "/kinh-bai-tap/bat-dau",
      icon: SparklesIcon,
      note: "Giải thích Kinh bài tập là gì, công khóa cơ bản gồm những gì, và khác gì với Ngôi Nhà Nhỏ, Kinh văn tự tu.",
    },
    {
      title: "Trình tự niệm",
      route: "/kinh-bai-tap/cac-buoc/cho-nguoi-moi",
      icon: ListChecksIcon,
      note: "Sắp đúng thứ tự các bước niệm, tên đầy đủ từng bài, và phần nào là bài chính, phần nào là bài bổ trợ.",
    },
    {
      title: "Lưu ý quan trọng",
      route: "/kinh-bai-tap/luu-y",
      icon: ShieldAlertIcon,
      note: "Nhắc rõ giờ giấc, nơi niệm, cách xử lý khi bị gián đoạn, và những điều không nên làm khi hành trì.",
    },
    {
      title: "Theo từng trường hợp",
      route: "/kinh-bai-tap/theo-tinh-huong",
      icon: MapIcon,
      note: "Gợi ý nội dung cho người mới, người cao tuổi, người bận rộn, người bệnh nặng và các trường hợp thường gặp.",
    },
  ];

  const intro = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Kiến trúc Kinh bài tập hằng ngày</CardTitle>
              <CardDescription>
                Đây là khu vực biên tập nội dung công khóa hằng ngày. Mục tiêu là giúp người quản trị nhìn rõ từng nhóm bài,
                sửa đúng chỗ, và không lẫn sang các surface khác.
              </CardDescription>
            </div>
            <Badge variant="outline">Kho nội dung chính</Badge>
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
            <CardTitle>Phân biệt rõ để khỏi sửa nhầm</CardTitle>
            <CardDescription>
              Kinh bài tập chỉ quản lý nội dung công khóa hằng ngày. Không gộp chung với Kinh văn tự tu, Ngôi Nhà Nhỏ,
              lịch nhắc riêng, hay sổ theo dõi cá nhân của thành viên.
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
            <CardTitle>Các phần liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-5">
            <div className="flex gap-2"><BookOpenIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Kho nội dung này giữ bài hướng dẫn, lưu ý, hỏi đáp và tài liệu đi kèm của Kinh bài tập.</span></div>
            <div className="flex gap-2"><ClipboardListIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Phần tu tập cá nhân giữ sổ hành trì, tiến độ, nhật ký và chuỗi duy trì của từng thành viên.</span></div>
            <div className="flex gap-2"><CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Lịch chỉ dùng để nhắc ngày đặc biệt và bối cảnh theo ngày, không sửa nội dung công khóa.</span></div>
            <div className="flex gap-2"><BellRingIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>Thông báo chỉ làm nhiệm vụ nhắc nhớ sau khi nội dung và lịch đã được cấu hình ở nơi phù hợp.</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <GuidesPage
      title="Kinh bài tập"
      description="Quản lý các bài hướng dẫn cốt lõi cho công khóa hằng ngày. Dùng ngôn ngữ rõ ràng, đúng nhóm nội dung, dễ đọc với người lớn tuổi."
      defaultCategory="DAILY_PRACTICE"
      createHref="/noi-dung/kinh-bai-tap/tao-moi"
      detailBasePath="/noi-dung/kinh-bai-tap"
      intro={intro}
    />
  );
}

export function LittleHousePage() {
  const intro = (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Lane nội dung Ngôi Nhà Nhỏ</CardTitle>
            <CardDescription>
              Danh sách dưới đây chỉ dành cho guide, FAQ và tài liệu của Ngôi Nhà Nhỏ. Không sửa hồ sơ sớ hay hàng đợi gian lận từ màn này.
            </CardDescription>
          </div>
          <Badge variant="outline">Content owner</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <SparklesIcon className="size-3.5" />
          Bắt đầu
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <BookOpenIcon className="size-3.5" />
          Trì tụng
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <ShieldAlertIcon className="size-3.5" />
          Đốt và hậu xử lý
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <SearchIcon className="size-3.5" />
          Tra cứu và hỏi đáp
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <ListChecksIcon className="size-3.5" />
          Thực hành
        </span>
      </CardContent>
    </Card>
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
  const intro = (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Lane nội dung Phóng sanh</CardTitle>
            <CardDescription>
              Màn này chỉ quản nghi thức, biến thể, FAQ và tài liệu của Phóng sanh. Hồ sơ phóng sinh và thống kê loài là lane vận hành riêng.
            </CardDescription>
          </div>
          <Badge variant="outline">Content owner</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <ListChecksIcon className="size-3.5" />
          Nghi thức cơ bản
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <SparklesIcon className="size-3.5" />
          Cho bản thân
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <BookOpenIcon className="size-3.5" />
          Cho người khác
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <ShieldAlertIcon className="size-3.5" />
          Lưu ý và chuẩn bị
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5">
          <SearchIcon className="size-3.5" />
          Hỏi đáp và tải xuống
        </span>
      </CardContent>
    </Card>
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
