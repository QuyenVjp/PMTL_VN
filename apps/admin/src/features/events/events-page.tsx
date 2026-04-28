import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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

      <EventsTable />
    </div>
  );
}
