import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ClipboardListIcon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LhFraudQueueTable } from "./little-house-fraud-queue-table.js";

export function LhFraudQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi gian lận sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Xử lý cảnh báo bất thường của hồ sơ Ngôi Nhà Nhỏ với lý do, severity và audit rõ ràng.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlertIcon className="size-4 text-muted-foreground" />
              Review queue
            </CardTitle>
            <CardDescription>Không tự động kết luận, operator cần ghi resolution.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cờ gian lận là operational signal. Mọi xử lý phải đi qua API để giữ audit trail.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardListIcon className="size-4 text-muted-foreground" />
              Hồ sơ gốc
            </CardTitle>
            <CardDescription>Đối chiếu người lập, trạng thái, dotting và combustion trước khi resolve.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/so/danh-sach">
                Mở danh sách sớ
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <LhFraudQueueTable />
    </div>
  );
}
