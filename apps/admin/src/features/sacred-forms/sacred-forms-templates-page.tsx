import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SacredFormTemplatesTable } from "./sacred-forms-templates-table.js";

export function SacredFormTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý các mẫu đơn đăng ký</p>
        </div>
        <Button
          onClick={() => toast.info("Tính năng đang phát triển")}
        >
          Tạo mẫu đơn
        </Button>
      </div>
      <SacredFormTemplatesTable />
    </div>
  );
}
