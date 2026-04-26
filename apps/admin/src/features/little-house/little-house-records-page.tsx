import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, BookOpenIcon, FlameIcon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LhRecordsTable } from "./little-house-records-table.js";

export function LhRecordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Theo dõi operational records của Ngôi Nhà Nhỏ: ký, tụng, điểm nhãn, hóa và audit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlameIcon className="size-4 text-muted-foreground" />
              Engagement owner
            </CardTitle>
            <CardDescription>Hồ sơ, trạng thái, dotting, combustion</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Đây là state vận hành. Không sửa nội dung nghi thức hoặc wording hướng dẫn từ màn này.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenIcon className="size-4 text-muted-foreground" />
              Content guide
            </CardTitle>
            <CardDescription>Ngôi Nhà Nhỏ knowledge hub riêng.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/noi-dung/ngoi-nha-nho">
                Mở hướng dẫn
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlertIcon className="size-4 text-muted-foreground" />
              Fraud queue
            </CardTitle>
            <CardDescription>Rà bất thường và xử lý theo audit trail.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/so/gian-lan">
                Mở hàng đợi
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <LhRecordsTable />
    </div>
  );
}
