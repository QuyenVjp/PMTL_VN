import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
} from "@/components/workspace";
import { eventDetailOptions } from "./queries.js";
import { useUpdateEvent, type UpdateEventInput } from "./mutations.js";
import { EventsCheckInDialog } from "./events-check-in-dialog.js";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANT,
  EVENT_TYPE_LABELS,
  type DeliveryMode,
  type EventType,
} from "./types.js";

const EVENT_TYPE_OPTIONS: { label: string; value: EventType }[] = [
  { label: "Pháp thoại", value: "DHARMA_TALK" },
  { label: "Thời khóa tụng kinh", value: "RECITATION_SESSION" },
  { label: "Phóng sinh", value: "LIFE_LIBERATION" },
  { label: "Khóa tu thiền", value: "MEDITATION_RETREAT" },
  { label: "Phụng sự cộng đồng", value: "COMMUNITY_SERVICE" },
  { label: "Học kinh", value: "SUTRA_STUDY" },
];

const DELIVERY_MODE_OPTIONS: { label: string; value: DeliveryMode }[] = [
  { label: "Trực tuyến", value: "ONLINE" },
  { label: "Trực tiếp", value: "OFFLINE" },
  { label: "Kết hợp", value: "HYBRID" },
];

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventDetailPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const params = useParams({ strict: false });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const publicId = String(params.publicId ?? "");

  const { data: event, isLoading } = useQuery(eventDetailOptions(publicId));
  const updateEvent = useUpdateEvent();

  const [titleVi, setTitleVi] = useState("");
  const [eventType, setEventType] = useState<EventType | "">("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | "">("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [checkInOpen, setCheckInOpen] = useState(false);

  useEffect(() => {
    if (!event) return;
    setTitleVi(event.titleVi);
    setEventType(event.eventType);
    setDeliveryMode(event.deliveryMode);
    setStartAt(toLocalDatetimeValue(event.startAt));
    setEndAt(toLocalDatetimeValue(event.endAt));
    setLocationName(event.locationName ?? "");
    setDescription(event.description ?? "");
  }, [event]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Sự kiện không tìm thấy</h1>
        <Button onClick={() => void navigate({ to: "/su-kien/danh-sach" })}>Quay lại</Button>
      </div>
    );
  }

  const canCheckIn = event.status === "IN_PROGRESS" || event.status === "REGISTRATION_CLOSED";

  const actions = canCheckIn
    ? [{ label: "Điểm danh thành viên", onClick: () => setCheckInOpen(true) }]
    : [];

  function handleSave() {
    if (!titleVi.trim() || !eventType || !deliveryMode || !startAt) return;
    const payload: UpdateEventInput = {
      titleVi: titleVi.trim(),
      eventType,
      deliveryMode,
      startAt: new Date(startAt).toISOString(),
    };
    if (endAt) payload.endAt = new Date(endAt).toISOString();
    if (locationName.trim()) payload.locationName = locationName.trim();
    if (description.trim()) payload.description = description.trim();

    updateEvent.mutate({ publicId, data: payload });
  }

  const canSave = Boolean(titleVi.trim() && eventType && deliveryMode && startAt);

  const sidebar = (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Trạng thái" value={
          <Badge variant={EVENT_STATUS_VARIANT[event.status]}>
            {EVENT_STATUS_LABELS[event.status]}
          </Badge>
        } />
        <AdminDetailField label="Loại" value={EVENT_TYPE_LABELS[event.eventType]} />
        <AdminDetailField label="Hình thức" value={event.deliveryMode} />
        <AdminDetailField label="Miễn phí" value={event.isFree ? "Có" : "Không"} />
        {event.maxAttendees !== null && (
          <AdminDetailField label="Số người tối đa" value={event.maxAttendees} />
        )}
        {event.organizer && (
          <AdminDetailField label="Tổ chức" value={event.organizer.name} />
        )}
        <AdminDetailField
          label="Ngày tạo"
          value={new Date(event.createdAt).toLocaleDateString("vi-VN")}
        />
      </AdminDetailSection>
    </>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/su-kien/danh-sach"
        backLabel="Sự kiện Phật pháp"
        title={event.titleVi}
        status={
          <Badge variant={EVENT_STATUS_VARIANT[event.status]}>
            {EVENT_STATUS_LABELS[event.status]}
          </Badge>
        }
        onSave={handleSave}
        isSaving={updateEvent.isPending}
        saveLabel="Lưu"
        saveDisabled={!canSave}
        actions={actions}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Thông tin sự kiện">
          <div className="space-y-4">
            <AdminFormField label="Tên sự kiện *">
              <Input
                value={titleVi}
                onChange={(e) => setTitleVi(e.target.value)}
                placeholder="Nhập tên sự kiện..."
              />
            </AdminFormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Loại sự kiện *">
                <Select
                  value={eventType}
                  onValueChange={(v) => setEventType(v as EventType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sự kiện" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminFormField>

              <AdminFormField label="Hình thức *">
                <Select
                  value={deliveryMode}
                  onValueChange={(v) => setDeliveryMode(v as DeliveryMode)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_MODE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminFormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Ngày bắt đầu *">
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </AdminFormField>

              <AdminFormField label="Ngày kết thúc">
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </AdminFormField>
            </div>

            <AdminFormField label="Địa điểm">
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Nhập địa điểm (tùy chọn)"
              />
            </AdminFormField>

            <AdminFormField label="Mô tả ngắn">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về sự kiện..."
                rows={3}
              />
            </AdminFormField>
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      {canCheckIn && (
        <EventsCheckInDialog
          eventPublicId={publicId}
          eventTitle={event.titleVi}
          open={checkInOpen}
          onOpenChange={setCheckInOpen}
        />
      )}
    </>
  );
}
