import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { CalendarService } from "./calendar.service.js";
import {
  eventQuerySchema,
  adminEventQuerySchema,
  adminCreateEventSchema,
  adminUpdateEventSchema,
  type EventQuery,
  type AdminEventQuery,
  type AdminCreateEventInput,
  type AdminUpdateEventInput,
} from "./calendar.schemas.js";

// ── Public controller ─────────────────────────────────────────────────────

@ApiTags("calendar")
@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("events")
  @Public()
  @UsePipes(ZodValidate(eventQuerySchema))
  @ApiOperation({ summary: "Danh sách sự kiện" })
  @ApiResponse({ status: 200, description: "Lấy danh sách sự kiện" })
  listEvents(@Query() query: EventQuery) {
    return this.calendarService.listEvents(query);
  }

  @Get("events/:publicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết sự kiện" })
  @ApiResponse({ status: 200, description: "Chi tiết sự kiện" })
  getEvent(@Param("publicId") publicId: string) {
    return this.calendarService.getEventByPublicId(publicId);
  }

  @Get("advisory/rule-packs/q161")
  @Public()
  @ApiOperation({ summary: "Lấy advisory rule-pack Q161 cho calendar compose layer" })
  @ApiResponse({ status: 200, description: "Q161 advisory rule-pack" })
  getQ161RulePack() {
    return this.calendarService.getQ161RulePack();
  }

  @Get("advisory/runtime-status")
  @Public()
  @ApiOperation({ summary: "Trạng thái runtime advisory (uncached lane)" })
  @ApiResponse({ status: 200, description: "Runtime advisory status" })
  getAdvisoryRuntimeStatus() {
    return this.calendarService.getAdvisoryRuntimeStatus();
  }
}

// ── Admin controller ──────────────────────────────────────────────────────

@ApiTags("admin-calendar")
@Controller("admin/calendar")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminCalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("events")
  @ApiOperation({ summary: "Danh sách sự kiện (admin)" })
  async listEvents(@Query() rawQuery: Record<string, unknown>) {
    const query: AdminEventQuery = adminEventQuerySchema.parse(rawQuery);
    return this.calendarService.adminListEvents(query);
  }

  @Get("events/:publicId")
  @ApiOperation({ summary: "Chi tiết sự kiện (admin)" })
  async getEvent(@Param("publicId") publicId: string) {
    return this.calendarService.adminGetEvent(publicId);
  }

  @Post("events")
  @UsePipes(ZodValidate(adminCreateEventSchema))
  @ApiOperation({ summary: "Tạo sự kiện mới (admin)" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  async createEvent(
    @Body() input: AdminCreateEventInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminCreateEvent(input, user.id);
  }

  @Patch("events/:publicId")
  @UsePipes(ZodValidate(adminUpdateEventSchema))
  @ApiOperation({ summary: "Cập nhật sự kiện (admin)" })
  async updateEvent(
    @Param("publicId") publicId: string,
    @Body() input: AdminUpdateEventInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminUpdateEvent(publicId, input, user.id);
  }

  @Delete("events/:publicId")
  @ApiOperation({ summary: "Xoá sự kiện (admin)" })
  async deleteEvent(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminDeleteEvent(publicId, user.id);
  }

  @Post("events/:publicId/publish")
  @ApiOperation({ summary: "Xuất bản sự kiện (admin)" })
  async publishEvent(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminPublishEvent(publicId, user.id);
  }
}
