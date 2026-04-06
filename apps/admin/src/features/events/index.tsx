import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { eventListOptions } from "./queries.js";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANT,
  EVENT_TYPE_LABELS,
  type EventListItem,
  type EventType,
  type DeliveryMode,
} from "./types.js";
import { useCreateEvent, useCheckIn } from "./mutations.js";

// ─── Create Event Dialog ──────────────────────────────────────────────────────

interface CreateEventForm {
  titleVi: string;
  eventType: EventType | "";
  deliveryMode: DeliveryMode | "";
  startAt: string;
  locationName: string;
  description: string;
}

const EMPTY_FORM: CreateEventForm = {
  titleVi: "",
  eventType: "",
  deliveryMode: "",
  startAt: "",
  locationName: "",
  description: "",
};

function CreateEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CreateEventForm>(EMPTY_FORM);
  const createEvent = useCreateEvent();

  function handleChange(field: keyof CreateEventForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titleVi || !form.eventType || !form.deliveryMode || !form.startAt) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    const payload: Record<string, unknown> = {
      titleVi: form.titleVi,
      eventType: form.eventType,
      deliveryMode: form.deliveryMode,
      startAt: new Date(form.startAt).toISOString(),
    };
    if (form.locationName) payload.locationName = form.locationName;
    if (form.description) payload.description = form.description;

    createEvent.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        onClose();
      },
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(EMPTY_FORM);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titleVi">
              Tên sự kiện <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titleVi"
              value={form.titleVi}
              onChange={(e) => handleChange("titleVi", e.target.value)}
              placeholder="Nhập tên sự kiện"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">
              Loại sự kiện <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.eventType}
              onValueChange={(v) => handleChange("eventType", v)}
            >
              <SelectTrigger id="eventType">
                <SelectValue placeholder="Chọn loại sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DHARMA_TALK">Pháp thoại</SelectItem>
                <SelectItem value="RECITATION_SESSION">Thời khóa tụng kinh</SelectItem>
                <SelectItem value="LIFE_LIBERATION">Phóng sinh</SelectItem>
                <SelectItem value="MEDITATION_RETREAT">Khóa tu thiền</SelectItem>
                <SelectItem value="COMMUNITY_SERVICE">Phụng sự cộng đồng</SelectItem>
                <SelectItem value="SUTRA_STUDY">Học kinh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryMode">
              Hình thức <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.deliveryMode}
              onValueChange={(v) => handleChange("deliveryMode", v)}
            >
              <SelectTrigger id="deliveryMode">
                <SelectValue placeholder="Chọn hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Trực tuyến</SelectItem>
                <SelectItem value="OFFLINE">Trực tiếp</SelectItem>
                <SelectItem value="HYBRID">Kết hợp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startAt">
              Ngày bắt đầu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => handleChange("startAt", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Địa điểm</Label>
            <Input
              id="locationName"
              value={form.locationName}
              onChange={(e) => handleChange("locationName", e.target.value)}
              placeholder="Nhập địa điểm (tùy chọn)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả ngắn</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về sự kiện (tùy chọn)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
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

// ─── Row Actions ──────────────────────────────────────────────────────────────

function EventRowActions({ row }: { row: EventListItem }) {
  const checkIn = useCheckIn();

  const actions = [
    {
      label: "Xem / Sửa",
      onClick: () => {
        toast.info("Tính năng đang phát triển.");
      },
    },
    ...(row.status === "IN_PROGRESS" || row.status === "REGISTRATION_CLOSED"
      ? [
          {
            label: "Điểm danh",
            separator: true,
            onClick: () => {
              const memberId = window.prompt("Nhập mã thành viên để điểm danh:");
              if (!memberId?.trim()) return;
              checkIn.mutate({ eventPublicId: row.id, userId: memberId.trim() });
            },
          },
        ]
      : []),
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<EventListItem>[] = [
  { accessorKey: "titleVi", header: "Tên sự kiện" },
  {
    accessorKey: "eventType",
    header: "Loại",
    cell: ({ row }) => EVENT_TYPE_LABELS[row.original.eventType],
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={EVENT_STATUS_VARIANT[row.original.status]}>
        {EVENT_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  { accessorKey: "deliveryMode", header: "Hình thức" },
  {
    accessorKey: "startAt",
    header: "Ngày bắt đầu",
    cell: ({ row }) => new Date(row.original.startAt).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "isFree",
    header: "Miễn phí",
    cell: ({ row }) => (
      <Badge variant={row.original.isFree ? "secondary" : "destructive"}>
        {row.original.isFree ? "Miễn phí" : "Có phí"}
      </Badge>
    ),
  },
  {
    accessorKey: "organizer",
    header: "Tổ chức",
    cell: ({ row }) => row.original.organizer?.name ?? "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <EventRowActions row={row.original} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventsListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: envelope, isLoading } = useQuery(eventListOptions());
  const events = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện Phật pháp</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý các sự kiện tu học và cộng đồng</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          Tạo sự kiện
        </Button>
      </div>

      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có sự kiện nào." />

      <CreateEventDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
