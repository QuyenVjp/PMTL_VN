import type { CalendarEvent, User } from "../../generated/prisma/client.js";

type CreatorRow = Pick<User, "publicId" | "displayName" | "email">;
type EventWithCreator = CalendarEvent & { createdBy: CreatorRow };

export function mapEventToAdminItem(event: EventWithCreator) {
  return {
    publicId: event.publicId,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    location: event.location,
    eventType: event.eventType,
    status: event.status,
    publishedAt: event.publishedAt?.toISOString() ?? null,
    createdBy: {
      publicId: event.createdBy.publicId,
      displayName: event.createdBy.displayName,
      email: event.createdBy.email,
    },
    createdAt: event.createdAt.toISOString(),
  };
}
