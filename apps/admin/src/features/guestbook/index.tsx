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

import { guestbookListOptions, guestbookKeys, type GuestbookFilters } from "./queries.js";
import { useUpdateGuestbookStatus } from "./mutations.js";

// ── Helpers ──────────────────────────────────────────────────────────

function statusLabel(status: string): string {
  if (status === "PENDING") return "Chờ duyệt";
  if (status === "APPROVED") return "Đã duyệt";
  if (status === "REJECTED") return "Đã từ chối";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "APPROVED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "PENDING")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (status === "REJECTED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
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
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
];

// ── Page ─────────────────────────────────────────────────────────────

export function GuestbookPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const updateStatus = useUpdateGuestbookStatus();

  const filters: GuestbookFilters = {
    limit: 20,
    offset: 0,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(guestbookListOptions(filters));
  const entries = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sổ lưu niệm</h1>
          <p className="text-sm text-muted-foreground">
            Rà soát và duyệt nội dung sổ lưu niệm của thành viên.
            {total > 0 && ` (${total} mục)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: guestbookKeys.lists() })}
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
            Không tải được danh sách sổ lưu niệm.
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Người duyệt</TableHead>
                  <TableHead className="w-[160px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.publicId}>
                    <TableCell className="max-w-[350px] truncate font-medium">
                      {entry.content}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {entry.author.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(entry.status)}>
                        {statusLabel(entry.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(entry.createdAt)}
                    </TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {entry.approvedBy?.displayName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {entry.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({
                                  publicId: entry.publicId,
                                  status: "APPROVED",
                                })
                              }
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({
                                  publicId: entry.publicId,
                                  status: "REJECTED",
                                })
                              }
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có lưu niệm nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
