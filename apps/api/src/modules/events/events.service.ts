import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { nanoid } from "nanoid";
import pino from "pino";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { EventsRepository } from "./events.repository.js";
import { mapEventToItem, mapEventToDetail, mapRegistrationToItem } from "./events.mapper.js";
import type {
  EventQuery,
  CreateEventInput,
  UpdateEventInput,
  RegistrationQuery,
  CheckInInput,
} from "./events.schemas.js";

const ZERO_MONETIZATION_MESSAGE =
  "CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!";

@Injectable()
export class EventsService {
  private readonly logger = pino({ name: EventsService.name });

  constructor(
    private readonly repo: EventsRepository,
    private readonly audit: AuditService,
  ) {}

  async listEvents(query: EventQuery) {
    const { data, total } = await this.repo.findMany(query);
    return {
      data: data.map(mapEventToItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getEvent(publicId: string) {
    const event = await this.repo.findByPublicId(publicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    return mapEventToDetail(event);
  }

  async createEvent(input: CreateEventInput, organizerId: string, auditCtx: AuditContext) {
    // Zero-monetization guard — design/03-domains/events/USE_CASES/zero-monetization-event-gate.md
    if (!input.isFree) {
      this.logger.warn({ organizerId, eventType: input.eventType }, "events.monetization.forbidden_mutation_attempt");
      throw new ForbiddenException({
        code: "monetization_forbidden_for_dharma_events",
        message: ZERO_MONETIZATION_MESSAGE,
      });
    }
    const event = await this.repo.create(input, organizerId, nanoid(21));
    await this.repo.appendAudit(event.id, organizerId, "EVENT_CREATED");
    await this.audit.append(auditCtx, "admin.event.create", "buddhist_event", event.publicId, {
      eventType: input.eventType,
      titleVi: input.titleVi,
    });
    return mapEventToItem(event);
  }

  async updateEvent(publicId: string, input: UpdateEventInput, adminId: string, auditCtx: AuditContext) {
    const event = await this.repo.findByPublicId(publicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
      throw new BadRequestException("Không thể chỉnh sửa sự kiện đã kết thúc hoặc đã hủy");
    }
    if (input.isFree === false) {
      this.logger.warn({ adminId, eventPublicId: publicId }, "events.monetization.forbidden_mutation_attempt");
      throw new ForbiddenException({
        code: "monetization_forbidden_for_dharma_events",
        message: ZERO_MONETIZATION_MESSAGE,
      });
    }
    const updated = await this.repo.update(event.id, input);
    await this.repo.appendAudit(event.id, adminId, "EVENT_UPDATED", `Status: ${updated.status}`);
    await this.audit.append(auditCtx, "admin.event.update", "buddhist_event", publicId, {
      status: input.status,
    });
    return mapEventToItem(updated);
  }

  async listRegistrations(eventPublicId: string, query: RegistrationQuery) {
    const event = await this.repo.findByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    const { data, total } = await this.repo.findRegistrations(event.id, query);
    return {
      data: data.map(mapRegistrationToItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async registerForEvent(eventPublicId: string, userId: string, auditCtx: AuditContext) {
    const event = await this.repo.findByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    if (!["PUBLISHED", "REGISTRATION_OPEN"].includes(event.status)) {
      throw new BadRequestException("Sự kiện chưa mở đăng ký");
    }
    if (event.maxAttendees && event.registrations && event.registrations.length >= event.maxAttendees) {
      throw new BadRequestException("Sự kiện đã đủ số lượng tham dự");
    }
    const existing = await this.repo.findRegistration(event.id, userId);
    if (existing && existing.status !== "CANCELLED") {
      throw new BadRequestException("Bạn đã đăng ký sự kiện này");
    }
    const reg = await this.repo.createRegistration(event.id, userId);
    await this.audit.append(auditCtx, "member.event.register", "event_registration", reg.id, {
      eventPublicId,
    });
    return mapRegistrationToItem(reg);
  }

  async cancelRegistration(eventPublicId: string, userId: string, auditCtx: AuditContext) {
    const event = await this.repo.findByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    const existing = await this.repo.findRegistration(event.id, userId);
    if (!existing || existing.status === "CANCELLED") {
      throw new BadRequestException("Không tìm thấy đăng ký");
    }
    await this.repo.cancelRegistration(event.id, userId);
    await this.audit.append(auditCtx, "member.event.cancel", "event_registration", existing.id, {
      eventPublicId,
    });
    return { message: "Đã hủy đăng ký" };
  }

  async checkIn(eventPublicId: string, input: CheckInInput, adminId: string, _auditCtx: AuditContext) {
    const event = await this.repo.findByPublicId(eventPublicId);
    if (!event) throw new NotFoundException("Sự kiện không tồn tại");
    const reg = await this.repo.findRegistration(event.id, input.userId);
    if (!reg || reg.status === "CANCELLED") {
      throw new BadRequestException("Thành viên chưa đăng ký sự kiện này");
    }
    if (reg.checkedInAt) throw new BadRequestException("Thành viên đã check-in rồi");
    const updated = await this.repo.checkIn(event.id, input.userId);
    await this.repo.appendAudit(event.id, adminId, "ATTENDEE_CHECKED_IN", `userId: ${input.userId}`);
    return mapRegistrationToItem(updated);
  }
}
