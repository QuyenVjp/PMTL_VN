import { PlusIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DownloadsTable } from "@/features/downloads/downloads-table";

type DownloadsPageProps = {
  title?: string;
  description?: string;
  defaultCategory?: string;
};

export function DownloadsPage({
  title = "Tài liệu",
  description = "Quản trị tài liệu tải về cho thành viên.",
  defaultCategory,
}: DownloadsPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => void navigate({ to: "/noi-dung/tai-lieu/tao-moi" })}>
          <PlusIcon className="size-4" />
          Thêm tài liệu
        </Button>
      </div>

      <DownloadsTable
        defaultCategory={defaultCategory}
        detailBasePath="/noi-dung/tai-lieu"
      />
    </div>
  );
}
