export type CalendarEvent = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  isRecurring: boolean;
  status: "draft" | "published" | "cancelled";
};

export type CalendarEventDetail = CalendarEvent & {
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
