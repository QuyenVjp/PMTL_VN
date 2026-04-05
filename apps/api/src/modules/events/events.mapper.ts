import type { BuddhistEvent, EventRegistration } from "../../generated/prisma/client.js";

type EventWithOrganizer = BuddhistEvent & {
  organizer?: { publicId: string; displayName: string } | null;
};

export function mapEventToItem(e: EventWithOrganizer) {
  return {
    id: e.publicId,
    title: e.title,
    titleVi: e.titleVi,
    eventType: e.eventType,
    deliveryMode: e.deliveryMode,
    status: e.status,
    startAt: e.startAt,
    endAt: e.endAt,
    locationName: e.locationName,
    isFree: e.isFree,
    maxAttendees: e.maxAttendees,
    coverImageUrl: e.coverImageUrl,
    organizer: e.organizer ? { id: e.organizer.publicId, name: e.organizer.displayName } : null,
    createdAt: e.createdAt,
  };
}

export function mapEventToDetail(
  e: EventWithOrganizer & {
    registrations?: (EventRegistration & { user: { publicId: string; displayName: string } })[],
  },
) {
  return {
    ...mapEventToItem(e),
    description: e.description,
    locationAddress: e.locationAddress,
    onlineUrl: e.onlineUrl,
    recitationTarget: e.recitationTarget,
    recentRegistrations: (e.registrations ?? []).map((r) => ({
      userId: r.user.publicId,
      name: r.user.displayName,
      status: r.status,
      checkedInAt: r.checkedInAt,
    })),
  };
}

export function mapRegistrationToItem(
  r: EventRegistration & { user?: { publicId: string; displayName: string; email?: string } | null },
) {
  return {
    id: r.id,
    status: r.status,
    checkedInAt: r.checkedInAt,
    user: r.user ? { id: r.user.publicId, name: r.user.displayName } : null,
    createdAt: r.createdAt,
  };
}
