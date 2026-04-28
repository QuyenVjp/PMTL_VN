import { PlusIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DharmaComplianceCharitiesTable } from "@/features/dharma-compliance/dharma-compliance-charities-table";

export function DharmaComplianceCharitiesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổ chức từ thiện</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Danh sách, quản lý và xác minh các tổ chức từ thiện đã đăng ký.
          </p>
        </div>
        <Button onClick={() => { void navigate({ to: "/phap-luat/to-chuc-tu-thien/tao-moi" }); }}>
          <PlusIcon className="size-4" />
          Thêm tổ chức
        </Button>
      </div>

      <DharmaComplianceCharitiesTable />
    </div>
  );
}
