import { AlertTriangleIcon, PlusIcon, ShieldCheckIcon, WorkflowIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { WorkspaceScopeCards } from "@/components/workspace";
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

      <WorkspaceScopeCards
        items={[
          {
            title: "Contract-backed",
            description: "Danh sách tổ chức từ thiện có route admin backing trong dharma-compliance CONTRACTS.",
            badge: "Hygiene tier",
            icon: ShieldCheckIcon,
          },
          {
            title: "Chưa đủ admin triple",
            description: "Design chưa có MODULE_SPECS và PAGE_API_MAPPING riêng, nên không mở thêm lifecycle phức tạp ở đây.",
            badge: "Không mở rộng mutation",
            icon: AlertTriangleIcon,
          },
          {
            title: "Public surface liên quan",
            description: "Bản ghi được dùng để bảo vệ danh sách tài khoản/tổ chức hợp lệ, không thay thế audit pháp lý.",
            badge: "Dharma compliance",
            icon: WorkflowIcon,
          },
        ]}
      />

      <DharmaComplianceCharitiesTable />
    </div>
  );
}
