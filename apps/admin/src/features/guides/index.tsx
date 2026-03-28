import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuidesProvider, useGuides } from "@/features/guides/context";
import { GuidesDialogs } from "@/features/guides/guides-dialogs";
import { GuidesTable } from "@/features/guides/guides-table";

function GuidesPrimaryButtons() {
  const { setOpen } = useGuides();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Tạo hướng dẫn
    </Button>
  );
}

type GuidesPageProps = {
  title?: string;
  description?: string;
  defaultCategory?: string;
};

export function GuidesPage({
  title = "Hướng dẫn",
  description = "Quản trị nội dung nhập môn và hướng dẫn thực hành cho thành viên.",
  defaultCategory,
}: GuidesPageProps = {}) {
  return (
    <GuidesProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <GuidesPrimaryButtons />
        </div>

        <GuidesTable defaultCategory={defaultCategory} />
      </div>

      <GuidesDialogs />
    </GuidesProvider>
  );
}

export function DailyPracticePage() {
  return (
    <GuidesPage
      title="Kinh Bài Tập"
      description="Quản lý hướng dẫn hành trì hằng ngày cho thành viên."
      defaultCategory="DAILY_PRACTICE"
    />
  );
}

export function LittleHousePage() {
  return (
    <GuidesPage
      title="Ngôi Nhà Nhỏ"
      description="Quản lý hướng dẫn chương trình Ngôi Nhà Nhỏ."
      defaultCategory="LITTLE_HOUSE"
    />
  );
}

export function LifeReleasePage() {
  return (
    <GuidesPage
      title="Phóng Sanh"
      description="Quản lý hướng dẫn phát nguyện và thực hành phóng sanh."
      defaultCategory="LIFE_RELEASE"
    />
  );
}
