import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuidesTable } from "@/features/guides/guides-table";
import { useNavigateTo } from "@/lib/router-utils";

type GuidesPageProps = {
  title?: string;
  description?: string;
  defaultCategory?: string;
  createHref?: string;
  detailBasePath?: string;
};

export function GuidesPage({
  title = "Hướng dẫn",
  description = "Quản trị nội dung nhập môn và hướng dẫn thực hành cho thành viên.",
  defaultCategory,
  createHref = "/noi-dung/huong-dan/tao-moi",
  detailBasePath = "/noi-dung/huong-dan",
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

      <GuidesTable
        defaultCategory={defaultCategory}
        detailBasePath={detailBasePath}
      />
    </div>
  );
}

export function DailyPracticePage() {
  return (
    <GuidesPage
      title="Kinh bài tập"
      description="Quản lý hướng dẫn hành trì hằng ngày cho thành viên."
      defaultCategory="DAILY_PRACTICE"
      createHref="/noi-dung/kinh-bai-tap/tao-moi"
      detailBasePath="/noi-dung/kinh-bai-tap"
    />
  );
}

export function LittleHousePage() {
  return (
    <GuidesPage
      title="Ngôi Nhà Nhỏ"
      description="Quản lý hướng dẫn chương trình Ngôi Nhà Nhỏ."
      defaultCategory="LITTLE_HOUSE"
      createHref="/noi-dung/ngoi-nha-nho/tao-moi"
      detailBasePath="/noi-dung/ngoi-nha-nho"
    />
  );
}

export function LifeReleasePage() {
  return (
    <GuidesPage
      title="Phóng Sanh"
      description="Quản lý hướng dẫn phát nguyện và thực hành phóng sanh."
      defaultCategory="LIFE_RELEASE"
      createHref="/noi-dung/phong-sanh/tao-moi"
      detailBasePath="/noi-dung/phong-sanh"
    />
  );
}
