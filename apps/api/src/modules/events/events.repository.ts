import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateEventInput, UpdateEventInput, EventQuery, RegistrationQuery } from "./events.schemas.js";

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: EventQuery) {
    const where = {
      ...(query.status && { status: query.status as never }),
      ...(query.eventType && { eventType: query.eventType as never }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: "insensitive" as const } },
          { titleVi: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.buddhistEvent.findMany({
        where,
        orderBy: { startAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: { organizer: { select: { publicId: true, displayName: true } } },
      }),
      this.prisma.buddhistEvent.count({ where }),
    ]);
    return { data, total };
  }

  async findByPublicId(publicId: string) {
    return this.prisma.buddhistEvent.findUnique({
      where: { publicId },
      include: {
        organizer: { select: { publicId: true, displayName: true } },
        registrations: {
          include: { user: { select: { publicId: true, displayName: true } } },
          take: 20,
        },
      },
    });
  }

  async create(input: CreateEventInput, organizerId: string, publicId: string) {
    return this.prisma.buddhistEvent.create({
      data: {
        publicId,
        organizerId,
        title: input.title,
        titleVi: input.titleVi,
        description: input.description,
        eventType: input.eventType as never,
        deliveryMode: input.deliveryMode as never,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        locationName: input.locationName,
        locationAddress: input.locationAddress,
        onlineUrl: input.onlineUrl,
        maxAttendees: input.maxAttendees,
        isFree: input.isFree,
        coverImageUrl: input.coverImageUrl,
        recitationTarget: input.recitationTarget,
        status: "DRAFT",
      },
    });
  }

  async update(id: string, input: UpdateEventInput) {
    return this.prisma.buddhistEvent.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.titleVi && { titleVi: input.titleVi }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.eventType && { eventType: input.eventType as never }),
        ...(input.deliveryMode && { deliveryMode: input.deliveryMode as never }),
        ...(input.status && { status: input.status as never }),
        ...(input.startAt && { startAt: new Date(input.startAt) }),
        ...(input.endAt && { endAt: new Date(input.endAt) }),
        ...(input.locationName !== undefined && { locationName: input.locationName }),
        ...(input.locationAddress !== undefined && { locationAddress: input.locationAddress }),
        ...(input.onlineUrl !== undefined && { onlineUrl: input.onlineUrl }),
        ...(input.maxAttendees !== undefined && { maxAttendees: input.maxAttendees }),
        ...(input.isFree !== undefined && { isFree: input.isFree }),
        ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
        ...(input.recitationTarget !== undefined && { recitationTarget: input.recitationTarget }),
      },
    });
  }

  async findRegistrations(eventId: string, query: RegistrationQuery) {
    const where = {
      eventId,
      ...(query.status && { status: query.status }),
    };
    const [data, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        include: { user: { select: { publicId: true, displayName: true, email: true } } },
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);
    return { data, total };
  }

  async findRegistration(eventId: string, userId: string) {
    return this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  async createRegistration(eventId: string, userId: string) {
    return this.prisma.eventRegistration.create({
      data: { eventId, userId, status: "REGISTERED" },
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    return this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status: "CANCELLED" },
    });
  }

  async checkIn(eventId: string, userId: string) {
    return this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { checkedInAt: new Date(), status: "ATTENDED" },
    });
  }

  async appendAudit(eventId: string, actor: string, action: string, details?: string) {
    return this.prisma.eventAuditLog.create({
      data: { eventId, actor, action, details },
    });
  }
}
