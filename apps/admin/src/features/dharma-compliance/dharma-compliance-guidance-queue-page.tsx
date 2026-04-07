import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { guidanceQueueOptions } from "./queries.js";
import { useRespondGuidance } from "./mutations.js";
import { GUIDANCE_URGENCY_VARIANT, type GuidanceQueueItem } from "./types.js";
import { DharmaComplianceGuidanceQueueTable } from "./dharma-compliance-guidance-queue-table";

type RespondDialogState = {
  item: GuidanceQueueItem;
  response: string;
} | null;

export function DharmaComplianceGuidanceQueuePage() {
  const { isLoading } = useQuery(guidanceQueueOptions());
  const respondGuidance = useRespondGuidance();
  const [respondDialog, setRespondDialog] = useState<RespondDialogState>(null);

  function handleConfirmRespond() {
    if (!respondDialog) return;
    respondGuidance.mutate(
      { id: respondDialog.item.id, response: respondDialog.response },
      { onSuccess: () => setRespondDialog(null) },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi hướng dẫn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi câu hỏi cần phản hồi</p>
      </div>

      <DharmaComplianceGuidanceQueueTable
        isLoading={isLoading}
        onRespond={(item) => setRespondDialog({ item, response: "" })}
      />

      {respondDialog && (
        <Dialog open onOpenChange={() => setRespondDialog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Phản hồi yêu cầu hướng dẫn</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={GUIDANCE_URGENCY_VARIANT[respondDialog.item.urgency]}>
                  {respondDialog.item.urgency}
                </Badge>
                <span className="text-sm text-muted-foreground">{respondDialog.item.category}</span>
                {respondDialog.item.practitioner && (
                  <span className="text-sm font-medium">{respondDialog.item.practitioner}</span>
                )}
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-sm">{respondDialog.item.question}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guidance-response">Phản hồi hướng dẫn Pháp</Label>
                <Textarea
                  id="guidance-response"
                  value={respondDialog.response}
                  onChange={(e) => setRespondDialog((d) => d ? { ...d, response: e.target.value } : d)}
                  placeholder="Nhập nội dung phản hồi hướng dẫn..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespondDialog(null)}>Huỷ</Button>
              <Button
                onClick={handleConfirmRespond}
                disabled={!respondDialog.response.trim() || respondGuidance.isPending}
              >
                {respondGuidance.isPending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
