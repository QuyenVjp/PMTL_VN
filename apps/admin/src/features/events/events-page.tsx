import { useNavigate } from "@tanstack/react-router";
import { CalendarCheckIcon, CalendarDaysIcon, PlusIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventsTable } from "./events-table";

export function EventsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện Phật pháp</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý sự kiện tu học, agenda, đăng ký và trạng thái vận hành.</p>
        </div>
        <Button onClick={() => void navigate({ to: "/su-kien/danh-sach/tao-moi" })}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Tạo sự kiện
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
              Nội dung sự kiện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Thông tin, agenda, speaker, CTA và gallery/file thuộc event content owner.</p>
            <Badge variant="outline">Content / Events</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersIcon className="size-4 text-muted-foreground" />
              Đăng ký & check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Registration, attendee status và check-in là operation state, không sửa bằng rich text.</p>
            <Badge variant="outline">Events operation</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheckIcon className="size-4 text-muted-foreground" />
              Lịch hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Lịch âm/advisory là calendar owner riêng; sự kiện chỉ publish thời gian và context cần thiết.</p>
            <Badge variant="outline">Calendar downstream</Badge>
          </CardContent>
        </Card>
      </div>

      <EventsTable />
    </div>
  );
}
