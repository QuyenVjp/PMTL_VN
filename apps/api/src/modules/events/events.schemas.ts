import { z } from "zod";

export const eventQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  eventType: z.string().optional(),
  search: z.string().optional(),
});
export type EventQuery = z.infer<typeof eventQuerySchema>;

export const createEventSchema = z.object({
  titleVi: z.string().min(2).max(200),
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  eventType: z.enum([
    "DHARMA_TALK",
    "RECITATION_SESSION",
    "LIFE_LIBERATION",
    "MEDITATION_RETREAT",
    "COMMUNITY_SERVICE",
    "SUTRA_STUDY",
  ]),
  deliveryMode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  locationName: z.string().max(200).optional(),
  locationAddress: z.string().max(500).optional(),
  onlineUrl: z.string().url().optional(),
  maxAttendees: z.number().int().min(1).optional(),
  isFree: z.boolean().default(true),
  coverImageUrl: z.string().url().optional(),
  recitationTarget: z.string().max(200).optional(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().extend({
  status: z
    .enum([
      "DRAFT",
      "PUBLISHED",
      "REGISTRATION_OPEN",
      "REGISTRATION_CLOSED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
});
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const registrationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
});
export type RegistrationQuery = z.infer<typeof registrationQuerySchema>;

export const checkInSchema = z.object({
  userId: z.string().min(1),
});
export type CheckInInput = z.infer<typeof checkInSchema>;
