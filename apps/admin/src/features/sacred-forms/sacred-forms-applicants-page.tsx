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
          Theo dõi applicant workflow, trạng thái xét duyệt và audit của đơn Pháp Bảo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheckIcon className="size-4 text-muted-foreground" />
              Applicant state
            </CardTitle>
            <CardDescription>Form applicant / review owner</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Màn này chỉ xử lý trạng thái đơn, ghi chú review và kết quả xét duyệt.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4 text-muted-foreground" />
              Mẫu đơn
            </CardTitle>
            <CardDescription>Template và prerequisite không sửa trực tiếp trong applicant.</CardDescription>
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
            <CardDescription>Approve/reject/dispose đều phải có trace.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Các thao tác sensitive không được xử lý bằng ghi chú tự do ngoài API.
          </CardContent>
        </Card>
      </div>
      <SacredFormApplicantsTable />
    </div>
  );
}
