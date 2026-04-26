import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { AdminDateTimePicker } from "@/components/ui/date-picker";
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
  AdminFormField,
} from "@/components/workspace";
import { useCreateEvent, type CreateEventInput } from "./mutations.js";
import type { DeliveryMode, EventType } from "./types.js";

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

export function EventCreatePage() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  const [titleVi, setTitleVi] = useState("");
  const [eventType, setEventType] = useState<EventType | "">("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | "">("");
  const [startAt, setStartAt] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");

  const canSave = Boolean(titleVi.trim() && eventType && deliveryMode && startAt);

  function handleSave() {
    if (!titleVi.trim() || !eventType || !deliveryMode || !startAt) return;
    const payload: CreateEventInput = {
      titleVi: titleVi.trim(),
      eventType,
      deliveryMode,
      startAt: new Date(startAt).toISOString(),
    };
    if (locationName.trim()) payload.locationName = locationName.trim();
    if (description.trim()) payload.description = description.trim();

    createEvent.mutate(payload, {
      onSuccess: () => void navigate({ to: "/su-kien/danh-sach" }),
    });
  }

  return (
    <AdminDetailPage
      backHref="/su-kien/danh-sach"
      backLabel="Sự kiện Phật pháp"
      title="Tạo sự kiện mới"
      status={
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
        >
          Nháp
        </Badge>
      }
      onSave={handleSave}
      isSaving={createEvent.isPending}
      saveLabel="Tạo sự kiện"
      saveDisabled={!canSave}
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

          <AdminFormField label="Ngày bắt đầu *">
            <AdminDateTimePicker
              value={startAt}
              onChange={setStartAt}
              placeholder="Chọn ngày giờ bắt đầu"
            />
          </AdminFormField>

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
  );
}
