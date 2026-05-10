import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { EventsService } from "./events.service.js";
import {
  eventQuerySchema,
  createEventSchema,
  updateEventSchema,
  registrationQuerySchema,
  checkInSchema,
  type EventQuery,
  type CreateEventInput,
  type UpdateEventInput,
  type RegistrationQuery,
  type CheckInInput,
} from "./events.schemas.js";

@ApiTags("admin-events")
@Controller("admin/events")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminEventsController {
  constructor(private readonly svc: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách sự kiện" })
  async list(@Query() query: EventQuery) {
    return this.svc.listEvents(eventQuerySchema.parse(query));
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết sự kiện" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getEvent(publicId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo sự kiện mới" })
  async create(
    @Body(ZodValidate(createEventSchema)) input: CreateEventInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createEvent(input, user.id, auditCtx);
  }

  @Patch(":publicId")
  @ApiOperation({ summary: "Cập nhật sự kiện" })
  async update(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateEventSchema)) input: UpdateEventInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.updateEvent(publicId, input, user.id, auditCtx);
  }

  @Get(":publicId/registrations")
  @ApiOperation({ summary: "Danh sách đăng ký sự kiện" })
  async listRegistrations(
    @Param("publicId") publicId: string,
    @Query() query: RegistrationQuery,
  ) {
    return this.svc.listRegistrations(publicId, registrationQuerySchema.parse(query));
  }

  @Post(":publicId/check-in")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Check-in thành viên" })
  async checkIn(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(checkInSchema)) input: CheckInInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.checkIn(publicId, input, user.id, auditCtx);
  }
}

@ApiTags("member-events")
@Controller("member/events")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberEventsController {
  constructor(private readonly svc: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách sự kiện công khai" })
  async list(@Query() query: EventQuery) {
    const q = eventQuerySchema.parse({ ...query, status: "REGISTRATION_OPEN" });
    return this.svc.listEvents(q);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết sự kiện" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getEvent(publicId);
  }

  @Post(":publicId/register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Đăng ký tham dự" })
  async register(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.registerForEvent(publicId, user.id, auditCtx);
  }

  @Patch(":publicId/cancel")
  @ApiOperation({ summary: "Hủy đăng ký" })
  async cancel(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.cancelRegistration(publicId, user.id, auditCtx);
  }
}
