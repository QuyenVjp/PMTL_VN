import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { eventDetailOptions } from "./queries.js";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANT,
  EVENT_TYPE_LABELS,
} from "./types.js";

function formatDateTime(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

function readPublicId(params: unknown): string {
  if (!params || typeof params !== "object" || !("publicId" in params)) return "";
  const publicId = (params as { publicId?: unknown }).publicId;
  return typeof publicId === "string" ? publicId : "";
}

export function EventDetailPage() {
  const navigate = useNavigate();
  const publicId = readPublicId(useParams({ strict: false }));

  const { data: event, isLoading } = useQuery(eventDetailOptions(publicId));

  if (isLoading) {
    return <WorkspaceDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Sự kiện không tìm thấy</h1>
        <Button onClick={() => void navigate({ to: "/su-kien/danh-sach" })}>Quay lại</Button>
      </div>
    );
  }

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
          value={formatDateTime(event.createdAt)}
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
        sidebar={sidebar}
      >
        <AdminDetailSection
          title="Thông tin sự kiện"
          description="Sự kiện Phật pháp hiện ở phạm vi hygiene-only theo design; admin chỉ xem dữ liệu operational, chưa mở sửa hoặc điểm danh."
        >
          <AdminDetailField label="Tên sự kiện" value={event.titleVi} />
          <AdminDetailField label="Loại sự kiện" value={EVENT_TYPE_LABELS[event.eventType]} />
          <AdminDetailField label="Hình thức" value={event.deliveryMode} />
          <AdminDetailField label="Ngày bắt đầu" value={formatDateTime(event.startAt)} />
          <AdminDetailField label="Ngày kết thúc" value={formatDateTime(event.endAt)} />
          <AdminDetailField label="Địa điểm" value={event.locationName ?? "—"} />
          <AdminDetailField label="Mô tả" value={event.description ?? "—"} stacked />
        </AdminDetailSection>
      </AdminDetailPage>
    </>
  );
}
