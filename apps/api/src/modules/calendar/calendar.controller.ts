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
import { Bardo49DayService } from "./bardo-49-day.service.js";
import {
  eventQuerySchema,
  adminEventQuerySchema,
  adminCreateEventSchema,
  adminUpdateEventSchema,
  createAgendaItemSchema,
  updateAgendaItemSchema,
  reorderAgendaItemsSchema,
  rescheduleEventSchema,
  createDeceasedProfileSchema,
  type EventQuery,
  type AdminEventQuery,
  type AdminCreateEventInput,
  type AdminUpdateEventInput,
  type CreateAgendaItemInput,
  type UpdateAgendaItemInput,
  type ReorderAgendaItemsInput,
  type RescheduleEventInput,
  type CreateDeceasedProfileInput,
} from "./calendar.schemas.js";

// ── Public controller ─────────────────────────────────────────────────────

@ApiTags("calendar")
@Controller("calendar")
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly bardo49DayService: Bardo49DayService,
  ) {}

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

  @Get("events/:publicId/agenda")
  @Public()
  @ApiOperation({ summary: "Chương trình sự kiện" })
  @ApiResponse({ status: 200, description: "Danh sách mục chương trình" })
  getEventAgenda(@Param("publicId") publicId: string) {
    return this.calendarService.getPublicAgenda(publicId);
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

  @Get("advisory/yin-deadzone-check")
  @ApiOperation({ summary: "Kiểm tra khung giờ âm khí cấm kỵ 2–5 AM theo múi giờ người dùng" })
  @ApiResponse({ status: 200, description: "Không trong khung giờ cấm kỵ" })
  @ApiResponse({ status: 403, description: "Đang trong khung giờ cấm kỵ 2–5 AM" })
  checkYinDeadzone(@Query("timezone") timezone: string) {
    const tz = timezone && timezone.length > 0 ? timezone : "Asia/Ho_Chi_Minh";
    this.calendarService.checkYinDeadzone(tz);
    return { isInDeadzone: false, userTimezone: tz };
  }

  // ── Bardo 49-day tracker (authenticated) ─────────────────────────────

  @Post("deceased-relatives")
  @ApiOperation({ summary: "Tạo hồ sơ người quá cố — bắt đầu chiến dịch siêu độ 49 ngày" })
  @ApiResponse({ status: 201, description: "Chiến dịch siêu độ 49 ngày đã được tạo" })
  createDeceasedProfile(
    @Body(ZodValidate(createDeceasedProfileSchema)) input: CreateDeceasedProfileInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bardo49DayService.createDeceasedProfile(user.id, input);
  }

  @Get("deceased-relatives")
  @ApiOperation({ summary: "Danh sách chiến dịch siêu độ đang hoạt động" })
  @ApiResponse({ status: 200, description: "Danh sách hồ sơ người quá cố" })
  listActiveDeceasedProfiles(@CurrentUser() user: AuthenticatedUser) {
    return this.bardo49DayService.getActiveDeceasedProfiles(user.id);
  }

  @Get("deceased-relatives/:publicId")
  @ApiOperation({ summary: "Chi tiết chiến dịch siêu độ 49 ngày" })
  @ApiResponse({ status: 200, description: "Chi tiết hồ sơ người quá cố" })
  @ApiResponse({ status: 400, description: "Không tìm thấy hồ sơ" })
  getDeceasedProfile(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bardo49DayService.getDeceasedProfile(user.id, publicId);
  }

  @Post("deceased-relatives/:publicId/update-progress")
  @ApiOperation({ summary: "Cập nhật tiến độ chiến dịch siêu độ (sau khi đốt TPT)" })
  @ApiResponse({ status: 200, description: "Tiến độ đã cập nhật" })
  updateBardoProgress(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bardo49DayService.updateProgress(user.id, publicId);
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
  async listEvents(@Query(ZodValidate(adminEventQuerySchema)) query: AdminEventQuery) {
    return this.calendarService.adminListEvents(query);
  }

  @Get("events/:publicId")
  @ApiOperation({ summary: "Chi tiết sự kiện (admin)" })
  async getEvent(@Param("publicId") publicId: string) {
    return this.calendarService.adminGetEvent(publicId);
  }

  @Post("events")
  @ApiOperation({ summary: "Tạo sự kiện mới (admin)" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  async createEvent(
    @Body(ZodValidate(adminCreateEventSchema)) input: AdminCreateEventInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminCreateEvent(input, user.id);
  }

  @Patch("events/:publicId")
  @ApiOperation({ summary: "Cập nhật sự kiện (admin)" })
  async updateEvent(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminUpdateEventSchema)) input: AdminUpdateEventInput,
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

  // ── Agenda items ─────────────────────────────────────────────────────

  @Post("events/:publicId/agenda-items")
  @ApiOperation({ summary: "Thêm mục chương trình (admin)" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  async createAgendaItem(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(createAgendaItemSchema)) input: CreateAgendaItemInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminCreateAgendaItem(publicId, input, user.id);
  }

  @Patch("events/:publicId/agenda-items/:itemPublicId")
  @ApiOperation({ summary: "Cập nhật mục chương trình (admin)" })
  async updateAgendaItem(
    @Param("publicId") publicId: string,
    @Param("itemPublicId") itemPublicId: string,
    @Body(ZodValidate(updateAgendaItemSchema)) input: UpdateAgendaItemInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminUpdateAgendaItem(publicId, itemPublicId, input, user.id);
  }

  @Delete("events/:publicId/agenda-items/:itemPublicId")
  @ApiOperation({ summary: "Xoá mục chương trình (admin)" })
  async deleteAgendaItem(
    @Param("publicId") publicId: string,
    @Param("itemPublicId") itemPublicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminDeleteAgendaItem(publicId, itemPublicId, user.id);
  }

  @Post("events/:publicId/agenda-items/reorder")
  @ApiOperation({ summary: "Sắp xếp lại chương trình (admin)" })
  async reorderAgendaItems(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(reorderAgendaItemsSchema)) input: ReorderAgendaItemsInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminReorderAgendaItems(publicId, input, user.id);
  }

  // ── Event lifecycle ──────────────────────────────────────────────────

  @Post("events/:publicId/reschedule")
  @ApiOperation({ summary: "Dời lịch sự kiện (admin)" })
  async rescheduleEvent(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(rescheduleEventSchema)) input: RescheduleEventInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminRescheduleEvent(publicId, input, user.id);
  }

  @Post("events/:publicId/cancel")
  @ApiOperation({ summary: "Huỷ sự kiện (admin)" })
  async cancelEvent(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.adminCancelEvent(publicId, user.id);
  }
}
