import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  moderationCommentListOptions,
  moderationCommentKeys,
  type ModerationCommentFilters,
} from "./queries.js";
import { useDecideCommentReport } from "./mutations.js";

// ── Helpers ──────────────────────────────────────────────────────────

function reportStatusLabel(status: string): string {
  if (status === "PENDING") return "Chờ xử lý";
  if (status === "RESOLVED_HIDE") return "Đã ẩn";
  if (status === "RESOLVED_IGNORE") return "Bỏ qua";
  if (status === "RESOLVED_ESCALATE") return "Đã leo thang";
  return status;
}

function reportStatusBadgeClass(status: string): string {
  if (status === "PENDING")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (status === "RESOLVED_HIDE")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  if (status === "RESOLVED_IGNORE")
    return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
  if (status === "RESOLVED_ESCALATE")
    return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400";
  return "";
}

function targetTypeLabel(targetType: string): string {
  if (targetType === "COMMENT") return "Bình luận";
  if (targetType === "POST") return "Bài viết";
  if (targetType === "GUESTBOOK") return "Lưu niệm";
  return targetType;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ── Status filter options ────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "RESOLVED_HIDE", label: "Đã ẩn" },
  { value: "RESOLVED_IGNORE", label: "Bỏ qua" },
  { value: "RESOLVED_ESCALATE", label: "Đã leo thang" },
];

// ── Page ─────────────────────────────────────────────────────────────

export function ModerationCommentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const decideReport = useDecideCommentReport();

  const filters: ModerationCommentFilters = {
    limit: 20,
    offset: 0,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(moderationCommentListOptions(filters));
  const reports = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bình luận kiểm duyệt</h1>
          <p className="text-sm text-muted-foreground">
            Xem xét và xử lý các báo cáo vi phạm liên quan đến bình luận.
            {total > 0 && ` (${total} báo cáo)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            void qc.invalidateQueries({ queryKey: moderationCommentKeys.lists() })
          }
        >
          <RefreshCcwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách báo cáo bình luận.
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung mục tiêu</TableHead>
                  <TableHead>Loại mục tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người báo cáo</TableHead>
                  <TableHead>Ngày báo cáo</TableHead>
                  <TableHead className="w-[220px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.publicId}>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {report.description ?? report.reasonCode}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      <Badge variant="secondary">{targetTypeLabel(report.targetType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={reportStatusBadgeClass(report.status)}
                      >
                        {reportStatusLabel(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {report.reporterSummary?.displayName ?? "—"}
                    </TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      {report.status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decideReport.isPending}
                            onClick={() =>
                              decideReport.mutate({
                                publicId: report.publicId,
                                decision: "hide",
                              })
                            }
                          >
                            Ẩn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decideReport.isPending}
                            onClick={() =>
                              decideReport.mutate({
                                publicId: report.publicId,
                                decision: "ignore",
                              })
                            }
                          >
                            Bỏ qua
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decideReport.isPending}
                            onClick={() =>
                              decideReport.mutate({
                                publicId: report.publicId,
                                decision: "escalate",
                              })
                            }
                          >
                            Leo thang
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có báo cáo bình luận nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
