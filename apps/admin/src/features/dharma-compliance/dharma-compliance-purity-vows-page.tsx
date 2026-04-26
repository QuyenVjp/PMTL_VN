import { EyeIcon, LockIcon, ScaleIcon } from "lucide-react";

import { WorkspaceScopeCards } from "@/components/workspace";
import { DharmaCompliancePurityVowsTable } from "./dharma-compliance-purity-vows-table";

export function DharmaCompliancePurityVowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lời nguyện thanh tu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ xem — lời nguyện do đồng tu tự đăng ký
        </p>
      </div>
      <WorkspaceScopeCards
        items={[
          {
            title: "Chỉ đọc",
            description: "Surface này chưa có admin contract nên không tạo, sửa, duyệt hoặc phản hồi từ admin.",
            badge: "Blocked / stop",
            icon: EyeIcon,
          },
          {
            title: "Không phải content editor",
            description: "Dữ liệu lời nguyện thuộc trạng thái thành viên, không phải bài hướng dẫn Thanh Tịnh Pháp.",
            badge: "Member state",
            icon: ScaleIcon,
          },
          {
            title: "Khóa hành động",
            description: "Mọi write action cần owner, role narrowing và audit vocabulary trước khi mở.",
            badge: "No mutation",
            icon: LockIcon,
          },
        ]}
      />
      <DharmaCompliancePurityVowsTable />
    </div>
  );
}
