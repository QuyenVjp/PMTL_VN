import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import {
  DECISION_LABELS,
  reportStatusLabel,
  type DecisionType,
  type ModerationReportDetail,
} from "@/features/moderation-reports/types";
import { useResolveReport } from "@/features/moderation-reports/mutations";
import { reportDetailOptions } from "@/features/moderation-reports/queries";
import { readRouteParam } from "@/lib/router-utils";

// ── Helpers ───────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === "RESOLVED")
    return (
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
        Đã xử lý
      </Badge>
    );
  if (status === "DISMISSED")
    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Đã bỏ qua
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      Chờ xử lý
    </Badge>
  );
}

function targetTypeLabel(t: string): string {
  if (t === "POST") return "Bài đăng";
  if (t === "COMMENT") return "Bình luận";
  if (t === "GUESTBOOK") return "Lưu niệm";
  return t;
}

// ── Resolve dialog ────────────────────────────────────────────────────

function ResolveDialog({
  open,
  onOpenChange,
  report,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  report: ModerationReportDetail;
}) {
  const [decision, setDecision] = useState<DecisionType>("hide");
  const [note, setNote] = useState("");
  const resolveReport = useResolveReport();

  const handleResolve = () => {
    resolveReport.mutate(
      { publicId: report.publicId, decision, note: note || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Xử lý báo cáo</DialogTitle>
          <DialogDescription>
            Chọn quyết định cho báo cáo{" "}
            <span className="font-mono font-semibold">{report.publicId.slice(0, 12)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Quyết định</span>
            <Select value={decision} onValueChange={(v) => setDecision(v as DecisionType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DECISION_LABELS) as [DecisionType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Ghi chú (tuỳ chọn)</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do xử lý..."
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleResolve} disabled={resolveReport.isPending}>
            {resolveReport.isPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function ReportDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "publicId");
  const navigate = useNavigate();

  const [resolveOpen, setResolveOpen] = useState(false);

  const { data: envelope, isLoading, isError } = useQuery(
    reportDetailOptions(publicId ?? ""),
  );
  const report = envelope;

  const goBack = () => { void navigate({ to: "/kiem-duyet/bao-cao" }); };

  if (isLoading) {
    return <WorkspaceDetailSkeleton />;
  }
  if (isError || !report) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-destructive">
        Không tải được báo cáo.
      </div>
    );
  }

  const title = `Báo cáo #${report.publicId.slice(-8)}`;

  const actions = [
    ...(report.status === "PENDING"
      ? [{ label: "Xử lý / Giải quyết", onClick: () => setResolveOpen(true) }]
      : []),
  ];

  const sidebar = (
    <AdminDetailSection title="Thông tin">
      <AdminDetailField
        label="Người báo cáo"
        value={report.reporterSummary?.displayName ?? "—"}
      />
      <AdminDetailField
        label="Đối tượng báo cáo"
        value={targetTypeLabel(report.targetType)}
      />
      <AdminDetailField
        label="Trạng thái"
        value={reportStatusLabel(report.status)}
      />
      <AdminDetailField
        label="Ngày báo cáo"
        value={new Date(report.createdAt).toLocaleDateString("vi-VN")}
      />
      <AdminDetailField
        label="Xử lý lúc"
        value={
          report.decisionAt
            ? new Date(report.decisionAt).toLocaleDateString("vi-VN")
            : undefined
        }
      />
    </AdminDetailSection>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/kiem-duyet/bao-cao"
        backLabel="Báo cáo"
        title={title}
        status={statusBadge(report.status)}
        actions={actions}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Lý do báo cáo">
          <div className="space-y-3">
            <AdminDetailField label="Mã lý do" value={report.reasonCode} />
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Nội dung bị báo cáo">
          <div className="space-y-2">
            <AdminDetailField label="Loại đối tượng" value={targetTypeLabel(report.targetType)} />
            <AdminDetailField
              label="Mã đối tượng"
              value={
                <span className="font-mono text-xs">{report.targetId}</span>
              }
            />
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      {resolveOpen && (
        <ResolveDialog
          open={resolveOpen}
          onOpenChange={(v) => {
            setResolveOpen(v);
            if (!v) goBack();
          }}
          report={report}
        />
      )}
    </>
  );
}
