export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type EventType =
  | "DHARMA_TALK"
  | "RECITATION_SESSION"
  | "LIFE_LIBERATION"
  | "MEDITATION_RETREAT"
  | "COMMUNITY_SERVICE"
  | "SUTRA_STUDY";

export type DeliveryMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface EventListItem {
  id: string;
  title: string;
  titleVi: string;
  eventType: EventType;
  deliveryMode: DeliveryMode;
  status: EventStatus;
  startAt: string;
  endAt: string;
  locationName: string | null;
  isFree: boolean;
  maxAttendees: number | null;
  coverImageUrl: string | null;
  organizer: { id: string; name: string } | null;
  createdAt: string;
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã đăng",
  REGISTRATION_OPEN: "Mở đăng ký",
  REGISTRATION_CLOSED: "Đóng đăng ký",
  IN_PROGRESS: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  DHARMA_TALK: "Pháp thoại",
  RECITATION_SESSION: "Buổi tụng kinh",
  LIFE_LIBERATION: "Phóng sinh",
  MEDITATION_RETREAT: "Khóa tu thiền",
  COMMUNITY_SERVICE: "Phục vụ cộng đồng",
  SUTRA_STUDY: "Học kinh",
};

export const EVENT_STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PUBLISHED: "secondary",
  REGISTRATION_OPEN: "default",
  REGISTRATION_CLOSED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};
