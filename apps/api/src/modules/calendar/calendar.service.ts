import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import pino from "pino";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { StorageService } from "../../platform/storage/storage.service.js";
import { mapQ161ForCalendar } from "../wisdom-qa/q161-rule-pack.data.js";
import { mapEventToAdminItem } from "./calendar.mapper.js";
import { CalendarRepository } from "./calendar.repository.js";
import { LunarCalendarService } from "./lunar-calendar.service.js";
import type {
  AdminCreateEventInput,
  AdminEventQuery,
  AdminUpdateEventInput,
  AdvisoryComposeResult,
  AdvisoryCard,
  AdvisorySourceRef,
  AdvisoryRuntimeStatusResponse,
  CreateAgendaItemInput,
  DayRole,
  EventQuery,
  NotificationPlan,
  Q161CalendarRulePackResponse,
  RecommendedAction,
  ReorderAgendaItemsInput,
  RescheduleEventInput,
  SurfacePlan,
  UpdateAgendaItemInput,
  WarningProfile,
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
    private readonly lunar: LunarCalendarService,
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
    // Phase 4.2 batch 3a: canary list shape — rides inside transport `data`.
    return {
      items: mapped,
      pagination: { total, limit, offset, hasMore: offset + mapped.length < total },
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

  async adminCreateEvent(input: AdminCreateEventInput, userId: string, auditCtx: AuditContext) {
    const event = await this.repo.createEvent(input, userId, nanoid());

    await this.audit.append(auditCtx, "admin.calendar_event.create", "calendar_event", event.publicId, {
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
      await this.audit.append(auditCtx, "admin.calendar_event.update", "calendar_event", publicId, {
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
      await this.audit.append(auditCtx, "admin.calendar_event.delete", "calendar_event", publicId, {
        title: existing.title,
      });
    }

    return { success: true };
  }

  async adminPublishEvent(publicId: string, actorId?: string) {
    const existing = await this.repo.findAdminByPublicId(publicId);
    if (!existing) throw new NotFoundException("Không tìm thấy sự kiện");

    // Contract: organizational events must have ≥1 agenda item before publish.
    // design/03-domains/calendar/CONTRACTS.md → "type = organizational phải có ít nhất một agenda item"
    if (existing.eventType === "organizational") {
      const agendaCount = await this.prisma.eventAgendaItem.count({
        where: { eventId: existing.id },
      });
      if (agendaCount === 0) {
        throw new BadRequestException(
          "Sự kiện organizational phải có ít nhất một agenda item trước khi phát hành.",
        );
      }
    }

    const updated = await this.repo.publishEvent(publicId);

    if (actorId) {
      const auditCtx: AuditContext = { actorId, actorType: "user" };
      await this.audit.append(auditCtx, "admin.calendar_event.publish", "calendar_event", publicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.create", "calendar_event", eventPublicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.update", "calendar_event", eventPublicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.delete", "calendar_event", eventPublicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.agenda_item.reorder", "calendar_event", eventPublicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.reschedule", "calendar_event", publicId, {
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
    await this.audit.append(auditCtx, "admin.calendar_event.cancel", "calendar_event", publicId, {
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

  // ── Daily Practice Advisory Compose (Phase 1 — sync) ────────────────
  // Design: design/03-domains/calendar/USE_CASES/compose-daily-practice-advisory.md

  composeAdvisory(date: Date, userTimezone: string): AdvisoryComposeResult {
    const dateStr = this.formatDateInTimezone(date, userTimezone);
    const weekdayVi = this.resolveWeekdayVi(date, userTimezone);
    const dayTags = this.computeDayTags(date, userTimezone);
    const dayRole = this.resolveDayRole(dayTags);
    const isSpecial = dayRole !== "regular_day";
    const advisoryCards: AdvisoryCard[] = isSpecial
      ? this.composeSpecialDayCards(date, dayTags, dayRole, weekdayVi)
      : this.composeRegularDayCards(weekdayVi);
    const recommendedActions: RecommendedAction[] = isSpecial
      ? this.composeSpecialDayActions(dayTags)
      : this.composeRegularDayActions();
    const warningProfile: WarningProfile[] = isSpecial ? this.composeWarningProfile(dayTags) : [];
    const sourceRefs: AdvisorySourceRef[] = isSpecial
      ? [
          {
            sourceKey: "q161",
            sourceLabel: "Q&A 161 — Lễ Phật Đại Sám Hối Văn ngày đặc biệt",
            sourceUrl: "https://orientalradio.com.sg/chi-qna-173/q161/",
            reviewStatus: "human_review_required",
          },
        ]
      : [];
    const surfacePlan: SurfacePlan = this.resolveSurfacePlan(dayRole);
    const notificationPlan: NotificationPlan = this.resolveNotificationPlan(dayRole);
    const result: AdvisoryComposeResult = {
      date: dateStr,
      userTimezone,
      weekdayVi,
      dayTags,
      dayRole,
      advisoryCards,
      recommendedActions,
      warningProfile,
      sourceRefs,
      surfacePlan,
      notificationPlan,
      generatedAt: new Date().toISOString(),
    };
    this.logger.info(
      { date: dateStr, userTimezone, dayRole, dayTagCount: dayTags.length, cardCount: advisoryCards.length },
      "Advisory composed",
    );
    return result;
  }

  private formatDateInTimezone(date: Date, tz: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value ?? "0000";
    const month = parts.find((p) => p.type === "month")?.value ?? "01";
    const day = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${year}-${month}-${day}`;
  }

  private resolveWeekdayVi(date: Date, tz: string): string {
    const weekdayNum = new Date(
      new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
        .format(date),
    ).getDay();
    const WEEKDAY_VI: Record<number, string> = {
      0: "Chủ Nhật",
      1: "Thứ Hai",
      2: "Thứ Ba",
      3: "Thứ Tư",
      4: "Thứ Năm",
      5: "Thứ Sáu",
      6: "Thứ Bảy",
    };
    return WEEKDAY_VI[weekdayNum] ?? "Không xác định";
  }

  private computeDayTags(date: Date, tz: string): string[] {
    const tags: string[] = [];

    // ── Gregorian special days ───────────────────────────────────────────
    const dateStr = this.formatDateInTimezone(date, tz);
    const [, monthStr, dayStr] = dateStr.split("-");
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (month === 1 && day === 1)
      tags.push("tet_duong_lich", "major_holiday", "special_practice_day");
    if (month === 4 && day === 5)
      tags.push("thanh_minh", "special_practice_day");
    if (month === 12 && day === 22)
      tags.push("dong_chi", "special_practice_day");

    // ── Lunar special days (Phase 2: Lunar auspicious day detection) ──────
    try {
      const lunarDayTypes = this.lunar.detectDayTypes(date);

      if (lunarDayTypes.length > 0) {
        // Convert AuspiciousDayType to DayRole-compatible tags
        if (
          lunarDayTypes.includes("MONTHLY_FIRST") ||
          lunarDayTypes.includes("MONTHLY_FIFTEENTH")
        ) {
          tags.push("mung_ram_auspicious", "special_practice_day");
        }

        if (
          lunarDayTypes.includes("GUANYIN_BIRTHDAY") ||
          lunarDayTypes.includes("GUANYIN_ENLIGHTENMENT") ||
          lunarDayTypes.includes("GUANYIN_MONASTIC") ||
          lunarDayTypes.includes("SHAKYAMUNI_BIRTHDAY") ||
          lunarDayTypes.includes("SHAKYAMUNI_ENLIGHTENMENT") ||
          lunarDayTypes.includes("AMITABHA_BIRTHDAY") ||
          lunarDayTypes.includes("KSITIGARBHA_BIRTHDAY") ||
          lunarDayTypes.includes("MEDICINE_BUDDHA")
        ) {
          tags.push("buddha_bodhisattva_day");
        }

        if (
          lunarDayTypes.includes("TET_NGUYEN_DAN") ||
          lunarDayTypes.includes("VESAK")
        ) {
          tags.push("major_holiday");
        }

        if (lunarDayTypes.includes("VU_LAN") || lunarDayTypes.includes("TRUNG_NGUYEN")) {
          tags.push("spirit_day");
        }

        if (lunarDayTypes.includes("LUC_TRAI_DAY")) {
          tags.push("luc_trai_day", "special_practice_day");
        }

        // Other lunar festivals default to special_practice_day if not already added
        if (
          !tags.includes("special_practice_day") &&
          (lunarDayTypes.includes("NGUYEN_TIEU") ||
            lunarDayTypes.includes("TRUNG_THU") ||
            lunarDayTypes.includes("TRUNG_CUU") ||
            lunarDayTypes.includes("DOAN_NGO"))
        ) {
          tags.push("special_practice_day");
        }
      }
    } catch (error) {
      // Lunar conversion should not fail, but log if it does
      this.logger.warn(
        { date, error },
        "Failed to compute lunar day tags",
      );
    }

    // Remove duplicates
    return Array.from(new Set(tags));
  }

  private resolveDayRole(dayTags: readonly string[]): DayRole {
    if (dayTags.includes("major_holiday")) return "major_holiday";
    if (dayTags.includes("buddha_bodhisattva_day")) return "buddha_bodhisattva_day";
    if (dayTags.includes("tet_window_day")) return "tet_window_day";
    if (dayTags.includes("luc_trai_day")) return "luc_trai_day";
    if (dayTags.includes("spirit_day")) return "spirit_day";
    if (dayTags.includes("special_practice_day")) return "special_practice_day";
    return "regular_day";
  }

  private composeRegularDayCards(weekdayVi: string): AdvisoryCard[] {
    return [
      {
        title: `${weekdayVi} — Ngày tu học bình thường`,
        body: "Hôm nay thích hợp tu hành bình thường. Niệm Kinh, làm việc thiện, giữ tâm ôn hòa.",
        cardKind: "info",
      },
      {
        title: "Công khóa hằng ngày",
        body: "Duy trì niệm Kinh, tụng Chú theo công khóa cá nhân đã đặt ra.",
        cardKind: "recommendation",
      },
    ];
  }

  private composeSpecialDayCards(date: Date, dayTags: readonly string[], dayRole: DayRole, _weekdayVi: string): AdvisoryCard[] {
    const cards: AdvisoryCard[] = [];
    const dayLabel = this.resolveDayLabelVi(date, dayTags);
    cards.push({
      title: dayLabel,
      body: "Kính mong mọi người làm nhiều công đức, ăn chay niệm Kinh, tránh sát sinh, siêng làm các điều thiện.",
      cardKind: "info",
    });
    const recitationCap = this.resolveRecitationCap(date, dayRole, dayTags);
    if (recitationCap !== null) {
      cards.push({
        title: "Lễ Phật Đại Sám Hối Văn",
        body: `Hôm nay có thể tụng không quá ${recitationCap} biến cho một việc cụ thể.`,
        cardKind: "recommendation",
      });
    }
    cards.push({
      title: "Lưu ý thời gian",
      body: "Tốt nhất không tụng Lễ Phật từ 22:00 đến 05:00.",
      cardKind: "caution",
    });
    cards.push({
      title: "Nếu không có bàn thờ Phật",
      body: "Phải thắp Tâm hương trước khi tụng. Nếu niệm nhiều lần, mỗi lần đều phải thắp lại.",
      cardKind: "household",
    });
    return cards;
  }

  private resolveDayLabelVi(date: Date | undefined, dayTags: readonly string[]): string {
    // Buddhist festival dates (lunar)
    if (dayTags.includes("buddha_bodhisattva_day")) {
      // Try to get the specific lunar festival name if available
      if (date) {
        try {
          const lunarInfo = this.lunar.getAuspiciousDayInfo(date);
          if (lunarInfo.labelVi && lunarInfo.labelVi !== `${lunarInfo.lunarDay}`) {
            return lunarInfo.labelVi;
          }
        } catch {
          // Fall through to default
        }
      }
      return "Ngày Vía Phật Bồ Tát — Ngày đặc biệt";
    }

    // Gregorian special days
    if (dayTags.includes("tet_duong_lich"))
      return "Tết Dương Lịch — Ngày đặc biệt";
    if (dayTags.includes("thanh_minh"))
      return "Tiết Thanh Minh — Ngày đặc biệt";
    if (dayTags.includes("dong_chi")) return "Tiết Đông Chí — Ngày đặc biệt";

    // Lunar monthly auspicious days
    if (dayTags.includes("mung_ram_auspicious")) {
      if (date) {
        try {
          const lunarDate = this.lunar.getLunarDate(date);
          if (lunarDate.lunarDay === 1) {
            return "Mùng 1 Âm Lịch — Ngày niệm Kinh đặc biệt";
          } else if (lunarDate.lunarDay === 15) {
            return "Rằm Âm Lịch — Ngày niệm Kinh đặc biệt";
          }
        } catch {
          // Fall through
        }
      }
      return "Ngày Auspicious — Ngày niệm Kinh đặc biệt";
    }

    if (dayTags.includes("mung_1"))
      return "Mùng 1 — Ngày niệm Kinh đặc biệt";
    if (dayTags.includes("ram_15")) return "Rằm — Ngày niệm Kinh đặc biệt";

    // Luc Trai days
    if (dayTags.includes("luc_trai_day"))
      return "Ngày Lục Trai — Nên tăng cường tu tập";

    // Spirit days
    if (dayTags.includes("spirit_day"))
      return "Ngày Tâm Linh — Nên tăng cường tu tập";

    return "Ngày đặc biệt — Nên tăng cường tu tập";
  }

  private resolveRecitationCap(date: Date, dayRole: DayRole, dayTags: readonly string[]): number | null {
    const rulePack = mapQ161ForCalendar();

    // Try lunar-based caps first (for Buddhist festivals)
    if (dayRole === "buddha_bodhisattva_day") {
      try {
        const lunarDayTypes = this.lunar.detectDayTypes(date);
        for (const dayType of lunarDayTypes) {
          const cap = this.lunar.getRecitationCap(dayType);
          if (cap && cap > 0) {
            return cap;
          }
        }
      } catch {
        // Fall through to Q161 defaults
      }
    }

    // Luc Trai days - get from lunar service
    if (dayRole === "luc_trai_day") {
      try {
        const cap = this.lunar.getHighestRecitationCap(date);
        if (cap && cap > 0) {
          return cap;
        }
      } catch {
        // Fall through
      }
    }

    // Lunar monthly auspicious days (mùng 1, rằm)
    if (dayTags.includes("mung_ram_auspicious")) {
      return rulePack.recitationCaps.find((c) => c.key === "lphv_regular_mung_1_ram")?.maxCount ?? 49;
    }

    // Gregorian special days
    if (dayRole === "major_holiday" || dayTags.includes("tet_duong_lich")) {
      return rulePack.recitationCaps.find((c) => c.key === "lphv_major_holiday_standard")?.maxCount ?? 27;
    }

    if (dayTags.includes("thanh_minh") || dayTags.includes("dong_chi")) {
      return rulePack.recitationCaps.find((c) => c.key === "lphv_regular_mung_1_ram")?.maxCount ?? 21;
    }

    if (dayTags.includes("mung_1") || dayTags.includes("ram_15")) {
      return rulePack.recitationCaps.find((c) => c.key === "lphv_regular_mung_1_ram")?.maxCount ?? 21;
    }

    return dayRole !== "regular_day" ? 21 : null;
  }

  private composeSpecialDayActions(dayTags: readonly string[]): RecommendedAction[] {
    const actions: RecommendedAction[] = [
      { key: "do_good", labelVi: "Làm nhiều công đức", actionKind: "encourage" },
      { key: "filial_piety", labelVi: "Lấy hiếu làm đầu", actionKind: "encourage" },
      { key: "vegetarian", labelVi: "Ăn chay niệm Kinh", actionKind: "encourage" },
      { key: "avoid_harming", labelVi: "Tránh sát sinh", actionKind: "avoid" },
      { key: "life_release", labelVi: "Phóng sanh", actionKind: "encourage" },
    ];
    if (dayTags.includes("thanh_minh")) {
      actions.push({
        key: "honor_ancestors",
        labelVi: "Tưởng nhớ tổ tiên, hồi hướng công đức",
        actionKind: "encourage",
      });
    }
    return actions;
  }

  private composeRegularDayActions(): RecommendedAction[] {
    return [
      { key: "daily_recitation", labelVi: "Duy trì công khóa hằng ngày", actionKind: "encourage" },
      { key: "do_good", labelVi: "Làm việc thiện, giữ tâm ôn hòa", actionKind: "encourage" },
    ];
  }

  private composeWarningProfile(_dayTags: readonly string[]): WarningProfile[] {
    return [
      {
        key: "time_window_avoid",
        summaryVi: "Tốt nhất không tụng Lễ Phật Đại Sám Hối Văn từ 22:00 đến 05:00.",
        severity: "caution",
      },
      {
        key: "pregnant_postpartum_cap",
        summaryVi: "Phụ nữ mang thai hoặc đang ở cữ: tổng số Lễ Phật không vượt quá 7 biến trong ngày đặc biệt.",
        severity: "caution",
      },
    ];
  }

  private resolveSurfacePlan(dayRole: DayRole): SurfacePlan {
    if (dayRole === "major_holiday") {
      return { targets: ["calendar", "member_dashboard", "homepage_banner"], priority: "high" };
    }
    if (dayRole === "buddha_bodhisattva_day" || dayRole === "tet_window_day" || dayRole === "spirit_day") {
      return { targets: ["calendar", "member_dashboard"], priority: "high" };
    }
    if (dayRole === "special_practice_day" || dayRole === "luc_trai_day") {
      return { targets: ["calendar", "member_dashboard"], priority: "normal" };
    }
    return { targets: ["calendar"], priority: "low" };
  }

  private resolveNotificationPlan(dayRole: DayRole): NotificationPlan {
    if (dayRole === "major_holiday" || dayRole === "buddha_bodhisattva_day" || dayRole === "tet_window_day") {
      return {
        preNotifyEnabled: true,
        leadTimes: ["T-1", "same_day"],
        eligibleChannels: ["push", "email"],
      };
    }
    if (dayRole === "special_practice_day" || dayRole === "luc_trai_day" || dayRole === "spirit_day") {
      return {
        preNotifyEnabled: true,
        leadTimes: ["same_day"],
        eligibleChannels: ["push"],
      };
    }
    return { preNotifyEnabled: false, leadTimes: [], eligibleChannels: [] };
  }
}
