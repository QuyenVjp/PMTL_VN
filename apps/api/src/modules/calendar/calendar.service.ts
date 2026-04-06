import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { nanoid } from "nanoid";
import pino from "pino";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { StorageService } from "../../platform/storage/storage.service.js";
import { mapQ161ForCalendar } from "../wisdom-qa/q161-rule-pack.data.js";
import { mapEventToAdminItem } from "./calendar.mapper.js";
import { CalendarRepository } from "./calendar.repository.js";
import type {
  AdminCreateEventInput,
  AdminEventQuery,
  AdminUpdateEventInput,
  AdvisoryRuntimeStatusResponse,
  CreateAgendaItemInput,
  EventQuery,
  Q161CalendarRulePackResponse,
  ReorderAgendaItemsInput,
  RescheduleEventInput,
  UpdateAgendaItemInput,
} from "./calendar.schemas.js";

@Injectable()
export class CalendarService {
  private readonly logger = pino({ name: CalendarService.name });

  constructor(
    private readonly repo: CalendarRepository,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  // ── Yin-time deadzone guard ──────────────────────────────────────────────
  // Design: design/03-domains/calendar/USE_CASES/yin-time-deadzone-2-5am.md
  // Stateless utility — call from any recitation write endpoint before persisting.

  checkYinDeadzone(userTimezone: string): void {
    const now = new Date();
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        hour: "numeric",
        hour12: false,
      }).format(now),
    );

    if (localHour >= 2 && localHour < 5) {
      // Compute the next 05:00 local time for the blockUntil field
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const localDateParts = formatter.formatToParts(now);
      const year = localDateParts.find((p) => p.type === "year")?.value ?? "";
      const month = localDateParts.find((p) => p.type === "month")?.value ?? "";
      const day = localDateParts.find((p) => p.type === "day")?.value ?? "";
      const blockUntil = `${year}-${month}-${day}T05:00:00`;

      this.logger.warn({ userTimezone, localHour, blockUntil }, "Yin-time deadzone active — recitation blocked");

      throw new ForbiddenException({
        code: "yin_time_deadzone_active",
        message:
          "KHUNG GIỜ CẤM KỴ: Tuyệt đối KHÔNG tụng niệm bất kỳ Kinh văn nào từ 2:00 – 5:00 sáng. Âm khí cực thịnh, niệm Kinh sẽ rước Ngạ quỷ và biến công đức thành ác nghiệp.",
        blockUntil,
        userTimezone,
      });
    }
  }

  // ── Public ──────────────────────────────────────────────────────────────

  async listEvents(query: EventQuery) {
    const { data, total, offset, limit } = await this.repo.findManyPublished(query);
    const mapped = await Promise.all(
      data.map(async (event) => ({
        ...event,
        coverImageUrl: (await this.storage.resolveAssetUrl(event.coverImage?.publicId)) ?? event.coverImage?.url ?? null,
        posterImageUrl: (await this.storage.resolveAssetUrl(event.posterImage?.publicId)) ?? event.posterImage?.url ?? null,
      })),
    );
    return {
      data: mapped,
      meta: {
        pagination: { total, limit, offset, hasMore: offset + mapped.length < total },
      },
    };
  }

  async getEventByPublicId(publicId: string) {
    const event = await this.repo.findPublicByPublicId(publicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    return {
      ...event,
      coverImageUrl: (await this.storage.resolveAssetUrl(event.coverImage?.publicId)) ?? event.coverImage?.url ?? null,
      posterImageUrl: (await this.storage.resolveAssetUrl(event.posterImage?.publicId)) ?? event.posterImage?.url ?? null,
    };
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminListEvents(query: AdminEventQuery) {
    const { data, total } = await this.repo.findManyAdmin(query);
    const { limit, offset } = query;
    const mapped = await Promise.all(
      data.map(async (event) => {
        const base = mapEventToAdminItem(event);
        return {
          ...base,
          coverImageUrl: (await this.storage.resolveAssetUrl(base.coverImagePublicId)) ?? base.coverImageUrl,
          posterImageUrl: (await this.storage.resolveAssetUrl(base.posterImagePublicId)) ?? base.posterImageUrl,
        };
      }),
    );
    return {
      data: mapped,
      meta: {
        pagination: { total, limit, offset, hasMore: offset + mapped.length < total },
      },
    };
  }

  async adminGetEvent(publicId: string) {
    const event = await this.repo.findAdminByPublicId(publicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");
    const base = mapEventToAdminItem(event);
    return {
      ...base,
      coverImageUrl: (await this.storage.resolveAssetUrl(base.coverImagePublicId)) ?? base.coverImageUrl,
      posterImageUrl: (await this.storage.resolveAssetUrl(base.posterImagePublicId)) ?? base.posterImageUrl,
    };
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

  // ── Agenda items ─────────────────────────────────────────────────────────

  async getPublicAgenda(eventPublicId: string) {
    const items = await this.repo.findAgendaItemsByEventPublicId(eventPublicId);
    if (items === null) throw new NotFoundException("Không tìm thấy sự kiện");
    return { data: items };
  }

  async adminCreateAgendaItem(eventPublicId: string, input: CreateAgendaItemInput, actorId: string) {
    const event = await this.repo.findAdminByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");

    const item = await this.repo.createAgendaItem(event.id, input, nanoid());

    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.create", "calendar_event", event.id, {
      eventPublicId,
      agendaItemPublicId: item.publicId,
      title: input.title,
    });

    return item;
  }

  async adminUpdateAgendaItem(eventPublicId: string, itemPublicId: string, input: UpdateAgendaItemInput, actorId: string) {
    const event = await this.repo.findAdminByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");

    const existing = await this.repo.findAgendaItemByPublicId(itemPublicId);
    if (!existing || existing.event.publicId !== eventPublicId) {
      throw new NotFoundException("Không tìm thấy mục chương trình");
    }

    const updated = await this.repo.updateAgendaItem(itemPublicId, input);

    const changedFields = Object.keys(input).filter((k) => input[k as keyof typeof input] !== undefined);
    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.update", "calendar_event", event.id, {
      eventPublicId,
      agendaItemPublicId: itemPublicId,
      changedFields,
    });

    return updated;
  }

  async adminDeleteAgendaItem(eventPublicId: string, itemPublicId: string, actorId: string) {
    const event = await this.repo.findAdminByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");

    const existing = await this.repo.findAgendaItemByPublicId(itemPublicId);
    if (!existing || existing.event.publicId !== eventPublicId) {
      throw new NotFoundException("Không tìm thấy mục chương trình");
    }

    await this.repo.deleteAgendaItem(itemPublicId);

    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.delete", "calendar_event", event.id, {
      eventPublicId,
      agendaItemPublicId: itemPublicId,
      title: existing.title,
    });

    return { success: true };
  }

  async adminReorderAgendaItems(eventPublicId: string, input: ReorderAgendaItemsInput, actorId: string) {
    const event = await this.repo.findAdminByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Không tìm thấy sự kiện");

    await this.repo.reorderAgendaItems(input.items);

    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.reorder", "calendar_event", event.id, {
      eventPublicId,
      itemCount: input.items.length,
    });

    return { success: true };
  }

  // ── Event lifecycle ─────────────────────────────────────────────────────

  async adminRescheduleEvent(publicId: string, input: RescheduleEventInput, actorId: string) {
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const updated = await this.repo.rescheduleEvent(
      publicId,
      new Date(input.startAt),
      input.endAt ? new Date(input.endAt) : undefined,
    );

    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.reschedule", "calendar_event", updated.id, {
      publicId,
      previousStartAt: existing.startAt.toISOString(),
      newStartAt: input.startAt,
      ...(input.note && { note: input.note }),
    });

    return updated;
  }

  async adminCancelEvent(publicId: string, actorId: string) {
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    const updated = await this.repo.cancelEvent(publicId);

    const auditCtx: AuditContext = { actorId, actorType: "user" };
    await this.audit.append(auditCtx, "admin.calendar_event.cancel", "calendar_event", updated.id, {
      publicId,
      title: updated.title,
      previousStatus: existing.status,
    });

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
