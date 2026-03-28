import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { AdminCreateEventInput, AdminEventQuery, AdminUpdateEventInput, EventQuery } from "./calendar.schemas.js";

const CREATOR_SELECT = {
  select: { publicId: true, displayName: true, email: true },
} as const;

const PUBLIC_EVENT_SELECT = {
  select: {
    publicId: true,
    title: true,
    description: true,
    startAt: true,
    endAt: true,
    location: true,
    eventType: true,
    publishedAt: true,
  },
} as const;

@Injectable()
export class CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyPublished(query: EventQuery) {
    const { page, pageSize, from, to } = query;
    const offset = (page - 1) * pageSize;

    const startAtFilter: { gte?: Date; lte?: Date } = {};
    if (from) startAtFilter.gte = new Date(from);
    if (to) startAtFilter.lte = new Date(to);

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (Object.keys(startAtFilter).length > 0) where.startAt = startAtFilter;

    const [data, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        orderBy: { startAt: "asc" },
        skip: offset,
        take: pageSize,
        ...PUBLIC_EVENT_SELECT,
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return { data, total, offset, limit: pageSize };
  }

  async findPublicByPublicId(publicId: string) {
    return this.prisma.calendarEvent.findUnique({
      where: { publicId, status: "PUBLISHED" },
      ...PUBLIC_EVENT_SELECT,
    });
  }

  async findManyAdmin(query: AdminEventQuery) {
    const { limit, offset, status, search, eventType } = query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: { createdBy: CREATOR_SELECT },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return { data, total };
  }

  async findAdminByPublicId(publicId: string) {
    return this.prisma.calendarEvent.findUnique({
      where: { publicId },
      include: { createdBy: CREATOR_SELECT },
    });
  }

  async createEvent(input: AdminCreateEventInput, createdById: string, publicId: string) {
    return this.prisma.calendarEvent.create({
      data: {
        publicId,
        title: input.title,
        startAt: new Date(input.startAt),
        eventType: input.eventType ?? "general",
        status: "DRAFT",
        createdById,
        ...(input.description !== undefined && { description: input.description }),
        ...(input.endAt !== undefined && { endAt: new Date(input.endAt) }),
        ...(input.location !== undefined && { location: input.location }),
      },
    });
  }

  async updateEvent(publicId: string, input: AdminUpdateEventInput) {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.startAt !== undefined) data.startAt = new Date(input.startAt);
    if (input.endAt !== undefined) data.endAt = new Date(input.endAt);
    if (input.location !== undefined) data.location = input.location;
    if (input.eventType !== undefined) data.eventType = input.eventType;

    return this.prisma.calendarEvent.update({ where: { publicId }, data });
  }

  async deleteEvent(publicId: string) {
    await this.prisma.calendarEvent.delete({ where: { publicId } });
  }

  async publishEvent(publicId: string) {
    return this.prisma.calendarEvent.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
}
