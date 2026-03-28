import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { mapQ161ForCalendar } from "../wisdom-qa/q161-rule-pack.data.js";
import type {
  AdminCreateEventInput,
  AdminEventQuery,
  AdminUpdateEventInput,
  AdvisoryRuntimeStatusResponse,
  EventQuery,
  Q161CalendarRulePackResponse,
} from "./calendar.schemas.js";

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async listEvents(query: EventQuery) {
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
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: { total, limit: pageSize, offset, hasMore: offset + data.length < total },
      },
    };
  }

  async getEventByPublicId(publicId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { publicId, status: "PUBLISHED" },
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
    });
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    return event;
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminListEvents(query: AdminEventQuery) {
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
        include: {
          createdBy: {
            select: { publicId: true, displayName: true, email: true },
          },
        },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: { total, limit, offset, hasMore: offset + data.length < total },
      },
    };
  }

  async adminGetEvent(publicId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { publicId },
      include: {
        createdBy: {
          select: { publicId: true, displayName: true, email: true },
        },
      },
    });
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    return event;
  }

  async adminCreateEvent(input: AdminCreateEventInput, userId: string) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        publicId: nanoid(),
        title: input.title,
        startAt: new Date(input.startAt),
        eventType: input.eventType ?? "general",
        status: "DRAFT",
        createdById: userId,
        ...(input.description !== undefined && { description: input.description }),
        ...(input.endAt !== undefined && { endAt: new Date(input.endAt) }),
        ...(input.location !== undefined && { location: input.location }),
      },
    });

    const auditCtx: AuditContext = { actorId: userId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.create", "calendar_event", event.id, {
      publicId: event.publicId,
      title: event.title,
    });

    return event;
  }

  async adminUpdateEvent(publicId: string, input: AdminUpdateEventInput, actorId?: string) {
    const existing = await this.prisma.calendarEvent.findUnique({ where: { publicId } });
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.startAt !== undefined) data.startAt = new Date(input.startAt);
    if (input.endAt !== undefined) data.endAt = new Date(input.endAt);
    if (input.location !== undefined) data.location = input.location;
    if (input.eventType !== undefined) data.eventType = input.eventType;

    const updated = await this.prisma.calendarEvent.update({
      where: { publicId },
      data,
    });

    if (actorId) {
      const auditCtx: AuditContext = { actorId, actorType: "user" };
      await this.audit.append(auditCtx, "admin.calendar_event.update", "calendar_event", updated.id, {
        publicId,
        changedFields: Object.keys(data),
      });
    }

    return updated;
  }

  async adminDeleteEvent(publicId: string, actorId?: string) {
    const existing = await this.prisma.calendarEvent.findUnique({ where: { publicId } });
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    await this.prisma.calendarEvent.delete({ where: { publicId } });

    if (actorId) {
      const auditCtx: AuditContext = { actorId, actorType: "user" };
      await this.audit.append(auditCtx, "admin.calendar_event.delete", "calendar_event", existing.id, {
        publicId,
        title: existing.title,
      });
    }

    return { success: true };
  }

  async adminPublishEvent(publicId: string, actorId?: string) {
    const existing = await this.prisma.calendarEvent.findUnique({ where: { publicId } });
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const updated = await this.prisma.calendarEvent.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    if (actorId) {
      const auditCtx: AuditContext = { actorId, actorType: "user" };
      await this.audit.append(auditCtx, "admin.calendar_event.publish", "calendar_event", updated.id, {
        publicId,
        title: updated.title,
      });
    }

    return updated;
  }

  // ── Advisory / Q161 (preserved) ─────────────────────────────────────────

  async getQ161RulePack(): Promise<Q161CalendarRulePackResponse> {
    return this.cacheService.getOrSet("calendar:q161:rule-pack:v1", 60 * 30, async () => {
      const payload = mapQ161ForCalendar() as Q161CalendarRulePackResponse;
      return await Promise.resolve(payload);
    });
  }

  async getAdvisoryRuntimeStatus(): Promise<AdvisoryRuntimeStatusResponse> {
    // Touch DB through extended client so this endpoint also reflects DB connectivity lane.
    await this.prisma.extended.$queryRaw`SELECT 1`;

    return {
      generatedAt: new Date().toISOString(),
      cacheMode: "live",
    };
  }
}
