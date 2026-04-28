import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VolunteersTable } from "./volunteers-table.js";

export function VolunteersPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phụng sự viên</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý danh sách phụng sự viên và thông tin liên lạc.
          </p>
        </div>
        <Button onClick={() => { void navigate({ to: "/he-thong/phung-su-vien/tao-moi" }); }}>
          <PlusIcon className="size-4" />
          Thêm phụng sự viên
        </Button>
      </div>

      <VolunteersTable />
    </div>
  );
}
