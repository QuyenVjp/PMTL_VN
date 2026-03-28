import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import {
  pushJobListOptions,
  pushStatusOptions,
  subscriptionStatsOptions,
  pushKeys,
  type PushJobFilters,
} from "./queries.js";
import { useCreatePushJob, useRedrivePushJob, type CreatePushJobInput } from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

function jobStatusLabel(status: string): string {
  if (status === "PENDING") return "Chờ xử lý";
  if (status === "PROCESSING") return "Đang gửi";
  if (status === "COMPLETED") return "Hoàn thành";
  if (status === "FAILED") return "Thất bại";
  return status;
}

function jobStatusBadgeClass(status: string): string {
  if (status === "COMPLETED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "PENDING" || status === "PROCESSING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (status === "FAILED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
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

// ── Stats Cards ─────────────────────────────────────────────────────

function StatsCards() {
  const { data: pushStatus, isLoading: statusLoading } = useQuery(pushStatusOptions());
  const { data: subStats, isLoading: subLoading } = useQuery(subscriptionStatsOptions());

  const cards = [
    { label: "Tổng jobs", value: pushStatus?.total, loading: statusLoading },
    { label: "Chờ xử lý", value: pushStatus?.pending, loading: statusLoading },
    { label: "Hoàn thành", value: pushStatus?.completed, loading: statusLoading },
    { label: "Thất bại", value: pushStatus?.failed, loading: statusLoading },
    { label: "Subscriptions hoạt động", value: subStats?.active, loading: subLoading },
    { label: "Subscriptions ngưng", value: subStats?.inactive, loading: subLoading },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            {card.loading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums">{card.value ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export function NotificationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);

  const qc = useQueryClient();
  const redrivePush = useRedrivePushJob();

  const filters: PushJobFilters = {
    limit: 20,
    offset: 0,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(pushJobListOptions(filters));
  const jobs = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi push jobs, subscription stats và gửi thông báo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void qc.invalidateQueries({ queryKey: pushKeys.lists() });
              void qc.invalidateQueries({ queryKey: pushKeys.status() });
              void qc.invalidateQueries({ queryKey: pushKeys.subscriptionStats() });
            }}
          >
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Tạo đợt gửi
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Filters */}
      <div className="flex gap-2">
        {["", "PENDING", "PROCESSING", "COMPLETED", "FAILED"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "" ? "Tất cả" : jobStatusLabel(s)}
          </Button>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách push jobs.
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Đã gửi</TableHead>
                  <TableHead>Thất bại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.publicId}>
                    <TableCell className="max-w-[180px] truncate font-medium">
                      {job.title}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {truncate(job.body, 50)}
                    </TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {job.targetAudience ?? "Tất cả"}
                    </TableCell>
                    <TableCell className="tabular-nums">{job.sentCount}</TableCell>
                    <TableCell className="tabular-nums">{job.failedCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={jobStatusBadgeClass(job.status)}>
                        {jobStatusLabel(job.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-nowrap text-sm">
                      {job.createdBy.displayName}
                    </TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {formatDateTime(job.createdAt)}
                    </TableCell>
                    <TableCell>
                      {job.status === "FAILED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={redrivePush.isPending}
                          onClick={() => redrivePush.mutate(job.publicId)}
                        >
                          Gửi lại
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có đợt gửi thông báo nào.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreatePushJobDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

// ── Create Dialog ───────────────────────────────────────────────────

function CreatePushJobDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createJob = useCreatePushJob();
  const [form, setForm] = useState<CreatePushJobInput>({
    title: "",
    body: "",
    targetAudience: undefined,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createJob.mutate(
      {
        title: form.title,
        body: form.body,
        targetAudience: form.targetAudience || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ title: "", body: "", targetAudience: undefined });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đợt gửi thông báo</DialogTitle>
          <DialogDescription>Soạn nội dung và chọn đối tượng nhận.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề *</label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề thông báo"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung *</label>
            <Textarea
              required
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Nội dung thông báo..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Đối tượng</label>
            <Select
              value={form.targetAudience ?? "ALL"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, targetAudience: v === "ALL" ? undefined : v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="MEMBERS">Thành viên</SelectItem>
                <SelectItem value="VOLUNTEERS">Phụng sự viên</SelectItem>
                <SelectItem value="ADMINS">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Đang tạo..." : "Tạo đợt gửi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
