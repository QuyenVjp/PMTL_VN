import { useQuery } from "@tanstack/react-query";

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

      <DharmaComplianceGuidanceQueueTable isLoading={isLoading} />
    </div>
  );
}
