import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { mapQ161ForCalendar } from "../wisdom-qa/q161-rule-pack.data.js";
import { mapEventToAdminItem } from "./calendar.mapper.js";
import { CalendarRepository } from "./calendar.repository.js";
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
    private readonly repo: CalendarRepository,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async listEvents(query: EventQuery) {
    const { data, total, offset, limit } = await this.repo.findManyPublished(query);
    return {
      data,
      meta: {
        pagination: { total, limit, offset, hasMore: offset + data.length < total },
      },
    };
  }

  async getEventByPublicId(publicId: string) {
    const event = await this.repo.findPublicByPublicId(publicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    return event;
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminListEvents(query: AdminEventQuery) {
    const { data, total } = await this.repo.findManyAdmin(query);
    const { limit, offset } = query;
    return {
      data: data.map(mapEventToAdminItem),
      meta: {
        pagination: { total, limit, offset, hasMore: offset + data.length < total },
      },
    };
  }

  async adminGetEvent(publicId: string) {
    const event = await this.repo.findAdminByPublicId(publicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    return mapEventToAdminItem(event);
  }

  async adminCreateEvent(input: AdminCreateEventInput, userId: string) {
    const event = await this.repo.createEvent(input, userId, nanoid());

    const auditCtx: AuditContext = { actorId: userId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.create", "calendar_event", event.id, {
      publicId: event.publicId,
      title: event.title,
    });

    return event;
  }

  async adminUpdateEvent(publicId: string, input: AdminUpdateEventInput, actorId?: string) {
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const updated = await this.repo.updateEvent(publicId, input);

    if (actorId) {
      const changedFields = Object.keys(input).filter((k) => input[k as keyof typeof input] !== undefined);
      const auditCtx: AuditContext = { actorId, actorType: "user" };
      await this.audit.append(auditCtx, "admin.calendar_event.update", "calendar_event", updated.id, {
        publicId,
        changedFields,
      });
    }

    return updated;
  }

  async adminDeleteEvent(publicId: string, actorId?: string) {
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    await this.repo.deleteEvent(publicId);

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
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const updated = await this.repo.publishEvent(publicId);

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
    await this.prisma.extended.$queryRaw`SELECT 1`;
    return {
      generatedAt: new Date().toISOString(),
      cacheMode: "live",
    };
  }
}
