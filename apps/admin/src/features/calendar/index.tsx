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

import { eventListOptions, eventKeys, type CalendarEventFilters } from "./queries.js";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  usePublishEvent,
  type CreateEventInput,
} from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "CANCELLED") return "Đã huỷ";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (status === "CANCELLED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function eventTypeLabel(type: string): string {
  if (type === "CEREMONY") return "Lễ";
  if (type === "RETREAT") return "Khoá tu";
  if (type === "DHARMA_TALK") return "Pháp thoại";
  if (type === "COMMUNITY") return "Cộng đồng";
  if (type === "OTHER") return "Khác";
  return type;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ── Main Page ───────────────────────────────────────────────────────

export function CalendarEventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const qc = useQueryClient();
  const publishEvent = usePublishEvent();
  const deleteEvent = useDeleteEvent();

  const filters: CalendarEventFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(eventListOptions(filters));
  const events = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  // Find the event being edited
  const editingEvent = editTarget ? events.find((e) => e.publicId === editTarget) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Lịch & Sự kiện</h1>
          <p className="text-sm text-muted-foreground">
            Quản trị sự kiện, lịch hoạt động và xuất bản.
            {total > 0 && ` (${total} sự kiện)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void qc.invalidateQueries({ queryKey: eventKeys.lists() })}
          >
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Tạo sự kiện
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "DRAFT", "PUBLISHED", "CANCELLED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "Tất cả" : statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách sự kiện.
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại sự kiện</TableHead>
                  <TableHead>Thời gian bắt đầu</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[200px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.publicId}>
                    <TableCell className="max-w-[250px] truncate font-medium">
                      {event.title}
                    </TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {eventTypeLabel(event.eventType)}
                    </TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {formatDate(event.startAt)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {event.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(event.status)}>
                        {statusLabel(event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {event.status === "DRAFT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={publishEvent.isPending}
                            onClick={() => publishEvent.mutate(event.publicId)}
                          >
                            Xuất bản
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditTarget(event.publicId)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteEvent.isPending}
                          onClick={() => deleteEvent.mutate(event.publicId)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có sự kiện nào.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ── Create Dialog ───────────────────────────────────────────────────

function CreateEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createEvent = useCreateEvent();
  const [form, setForm] = useState<CreateEventInput>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    location: "",
    eventType: "CEREMONY",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createEvent.mutate(
      {
        title: form.title,
        description: form.description || undefined,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        location: form.location || undefined,
        eventType: form.eventType,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ title: "", description: "", startAt: "", endAt: "", location: "", eventType: "CEREMONY" });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
          <DialogDescription>Điền thông tin sự kiện để tạo mới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề *</label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tên sự kiện"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả sự kiện..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bắt đầu *</label>
              <Input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kết thúc</label>
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa điểm</label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Nơi tổ chức"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại sự kiện *</label>
            <Select
              value={form.eventType}
              onValueChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEREMONY">Lễ</SelectItem>
                <SelectItem value="RETREAT">Khoá tu</SelectItem>
                <SelectItem value="DHARMA_TALK">Pháp thoại</SelectItem>
                <SelectItem value="COMMUNITY">Cộng đồng</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ─────────────────────────────────────────────────────

function EditEventDialog({
  event,
  open,
  onOpenChange,
}: {
  event: { publicId: string; title: string; description: string | null; startAt: string; endAt: string | null; location: string | null; eventType: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateEvent = useUpdateEvent();
  const [form, setForm] = useState({
    title: event.title,
    description: event.description ?? "",
    startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : "",
    endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "",
    location: event.location ?? "",
    eventType: event.eventType,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateEvent.mutate(
      {
        publicId: event.publicId,
        input: {
          title: form.title,
          description: form.description || undefined,
          startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
          endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
          location: form.location || undefined,
          eventType: form.eventType,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          <DialogDescription>Cập nhật thông tin sự kiện.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề *</label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bắt đầu *</label>
              <Input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kết thúc</label>
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa điểm</label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại sự kiện *</label>
            <Select
              value={form.eventType}
              onValueChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEREMONY">Lễ</SelectItem>
                <SelectItem value="RETREAT">Khoá tu</SelectItem>
                <SelectItem value="DHARMA_TALK">Pháp thoại</SelectItem>
                <SelectItem value="COMMUNITY">Cộng đồng</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={updateEvent.isPending}>
              {updateEvent.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
