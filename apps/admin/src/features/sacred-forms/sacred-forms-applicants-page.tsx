import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, FileCheckIcon, FileTextIcon, HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SacredFormApplicantsTable } from "./sacred-forms-applicants-table.js";

export function SacredFormApplicantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Theo dõi luồng tiếp nhận hồ sơ, trạng thái xét duyệt và lịch sử lưu vết của đơn Pháp Bảo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheckIcon className="size-4 text-muted-foreground" />
              Trạng thái hồ sơ
            </CardTitle>
            <CardDescription>Hồ sơ đăng ký và khu xét duyệt</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Màn này chỉ xử lý trạng thái đơn, ghi chú xét duyệt và kết quả phê duyệt.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4 text-muted-foreground" />
              Mẫu đơn
            </CardTitle>
            <CardDescription>Mẫu đơn và điều kiện tiên quyết không sửa trực tiếp trong hồ sơ nộp.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/don-phap-bao/mau-don">
                Mở mẫu đơn
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HistoryIcon className="size-4 text-muted-foreground" />
              Audit bắt buộc
            </CardTitle>
            <CardDescription>Duyệt, từ chối hay xử lý tiếp đều phải có lưu vết.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Các thao tác nhạy cảm không được xử lý bằng ghi chú tự do ngoài API.
          </CardContent>
        </Card>
      </div>
      <SacredFormApplicantsTable />
    </div>
  );
}
