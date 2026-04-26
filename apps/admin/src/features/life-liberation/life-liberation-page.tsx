import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, BookOpenIcon, ClipboardListIcon, ShieldAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeReleaseTable } from "./life-liberation-table";

export function LifeReleaseListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ phóng sinh</h1>
        <p className="mt-2 text-sm text-muted-foreground">Theo dõi journal phóng sinh của đồng tu; nội dung nghi thức nằm ở workspace Phóng Sanh.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardListIcon className="size-4 text-muted-foreground" />
              Journal member
            </CardTitle>
            <CardDescription>Vows-merit / engagement owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Lưu factual record: loài, số lượng, địa điểm, ngày thực hiện và audit nhập hộ nếu có.</p>
            <Badge variant="outline">Không giữ full ritual script</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenIcon className="size-4 text-muted-foreground" />
              Guide context
            </CardTitle>
            <CardDescription>Content owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Script, variants và checklist chuẩn bị phải sửa ở hướng dẫn Phóng Sanh.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/noi-dung/phong-sanh">
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
              Guardrails
            </CardTitle>
            <CardDescription>Predatory species / habitat verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Các cảnh báo về loài, nơi thả và trường hợp tử vong ngoài ý muốn phải có source/review note.</p>
          </CardContent>
        </Card>
      </div>

      <LifeReleaseTable />
    </div>
  );
}
