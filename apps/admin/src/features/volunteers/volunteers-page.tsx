import { useNavigate } from "@tanstack/react-router";
import { ContactIcon, PlusIcon, SortAscIcon, UserCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceScopeCards } from "@/components/workspace";
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

      <WorkspaceScopeCards
        items={[
          {
            title: "Danh bạ phụng sự",
            description: "Quản lý người phụng sự hiển thị/được liên hệ trong hệ thống, không phải role tài khoản admin.",
            badge: "Volunteers",
            icon: UserCheckIcon,
          },
          {
            title: "Thứ tự hiển thị",
            description: "Display order là dữ liệu vận hành; thay đổi thứ tự phải đi qua mutation sort của volunteer owner.",
            badge: "Sort owner",
            icon: SortAscIcon,
          },
          {
            title: "Tách contact-info",
            description: "Thông tin liên hệ chung của tổ chức nằm ở trang riêng và có quyền ghi hẹp hơn.",
            badge: "Contact boundary",
            icon: ContactIcon,
          },
        ]}
      />

      <VolunteersTable />
    </div>
  );
}
