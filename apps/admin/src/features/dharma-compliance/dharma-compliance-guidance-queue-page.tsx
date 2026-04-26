import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, EyeIcon, LockIcon } from "lucide-react";

import { WorkspaceScopeCards } from "@/components/workspace";
import { guidanceQueueOptions } from "./queries.js";
import { DharmaComplianceGuidanceQueueTable } from "./dharma-compliance-guidance-queue-table";

export function DharmaComplianceGuidanceQueuePage() {
  const { isLoading } = useQuery(guidanceQueueOptions());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi hướng dẫn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi câu hỏi cần phản hồi</p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Read-only tạm thời",
            description: "Route này chưa có domain contract, nên admin chỉ được xem projection hiện có.",
            badge: "Blocked / stop",
            icon: EyeIcon,
          },
          {
            title: "Không có mutation",
            description: "Không khôi phục phản hồi hướng dẫn cho tới khi owner và vòng đời được chốt trong design.",
            badge: "No write action",
            icon: LockIcon,
          },
          {
            title: "Cần chốt owner",
            description: "Design đang để ngỏ đây là pastoral support, dharma-compliance hay vows-merit.",
            badge: "Cần design pass",
            icon: AlertTriangleIcon,
          },
        ]}
      />

      <DharmaComplianceGuidanceQueueTable isLoading={isLoading} />
    </div>
  );
}
