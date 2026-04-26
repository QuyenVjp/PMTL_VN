import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, FileTextIcon, ShieldAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SacredFormTemplatesTable } from "./sacred-forms-templates-table.js";

export function SacredFormTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý template, prerequisite và rule source cho từng loại đơn Pháp Bảo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4 text-muted-foreground" />
              Template owner
            </CardTitle>
            <CardDescription>Content / Sacred Forms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Template giữ wording, prerequisite, tài liệu hướng dẫn và trạng thái publish.</p>
            <Badge variant="outline">Không phải applicant state</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlertIcon className="size-4 text-muted-foreground" />
              Quy tắc xử lý
            </CardTitle>
            <CardDescription>Đốt / lưu trữ / niêm phong</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/don-phap-bao/quy-tac-xu-ly">
                Mở quy tắc xử lý
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Đơn đăng ký</CardTitle>
            <CardDescription>Applicant workflow riêng, có review/audit riêng.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/don-phap-bao/don-dang-ky">
                Mở đơn đăng ký
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <SacredFormTemplatesTable />
    </div>
  );
}
