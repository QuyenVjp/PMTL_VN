import { Link } from "@tanstack/react-router";
import { FileTextIcon, ListChecksIcon, ShieldCheckIcon } from "lucide-react";

import { SacredFormTemplatesTable } from "@/features/sacred-forms/sacred-forms-templates-table";
import { Button } from "@/components/ui/button";

export function SpiritualApplicationsTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn từ tâm linh</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý mẫu đơn đang dùng trong Niệm kinh qua owner Đơn Pháp Bảo: mẫu đơn, đơn đăng ký và quy tắc xử lý.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/don-phap-bao/mau-don">
              <FileTextIcon className="size-4" />
              Mẫu đơn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/don-phap-bao/don-dang-ky">
              <ListChecksIcon className="size-4" />
              Đơn đăng ký
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/don-phap-bao/quy-tac-xu-ly">
              <ShieldCheckIcon className="size-4" />
              Quy tắc xử lý
            </Link>
          </Button>
        </div>
      </div>

      <SacredFormTemplatesTable />
    </div>
  );
}
