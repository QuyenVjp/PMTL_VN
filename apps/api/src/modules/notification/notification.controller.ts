import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { NotificationService } from "./notification.service.js";
import {
  adminPushJobQuerySchema,
  adminCreatePushJobSchema,
  updatePreferencesSchema,
  pushSubscribeSchema,
  pushUnsubscribeSchema,
  updatePracticeReminderSchema,
  updateEventReminderSchema,
  type AdminPushJobQuery,
  type AdminCreatePushJobInput,
  type UpdatePreferencesInput,
  type PushSubscribeInput,
  type PushUnsubscribeInput,
  type UpdatePracticeReminderInput,
  type UpdateEventReminderInput,
} from "./notification.schemas.js";

// ─── Member-facing Notification Controller ──────────────────────────────────

@ApiTags("notifications")
@Controller("notifications")
export class MemberNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("preferences")
  @ApiOperation({ summary: "Lấy tuỳ chọn thông báo của tôi" })
  @ApiResponse({ status: 200, description: "Tuỳ chọn thông báo" })
  getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getPreferences(user.id);
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Cập nhật tuỳ chọn thông báo" })
  @ApiResponse({ status: 200, description: "Đã cập nhật tuỳ chọn" })
  updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(updatePreferencesSchema)) input: UpdatePreferencesInput,
  ) {
    return this.notificationService.updatePreferences(user.id, input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Post("push/subscribe")
  @ApiOperation({ summary: "Đăng ký nhận push notification" })
  @ApiResponse({ status: 201, description: "Đã đăng ký push" })
  subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(pushSubscribeSchema)) input: PushSubscribeInput,
  ) {
    return this.notificationService.subscribe(user.id, input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Post("push/unsubscribe")
  @ApiOperation({ summary: "Huỷ đăng ký push notification" })
  @ApiResponse({ status: 200, description: "Đã huỷ đăng ký push" })
  unsubscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(pushUnsubscribeSchema)) input: PushUnsubscribeInput,
  ) {
    return this.notificationService.unsubscribe(user.id, input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Get("push/stats")
  @ApiOperation({ summary: "Thống kê push subscription của tôi" })
  @ApiResponse({ status: 200, description: "Thống kê push" })
  getPushStats(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getPushStats(user.id);
  }

  @Get("reminders/practice")
  @ApiOperation({ summary: "Lấy cài đặt nhắc nhở tu tập" })
  @ApiResponse({ status: 200, description: "Cài đặt nhắc nhở tu tập" })
  getPracticeReminder(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getPracticeReminder(user.id);
  }

  @Patch("reminders/practice")
  @ApiOperation({ summary: "Cập nhật cài đặt nhắc nhở tu tập" })
  @ApiResponse({ status: 200, description: "Đã cập nhật nhắc nhở tu tập" })
  updatePracticeReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(updatePracticeReminderSchema)) input: UpdatePracticeReminderInput,
  ) {
    return this.notificationService.updatePracticeReminder(user.id, input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Get("reminders/events")
  @ApiOperation({ summary: "Lấy cài đặt nhắc nhở sự kiện" })
  @ApiResponse({ status: 200, description: "Cài đặt nhắc nhở sự kiện" })
  getEventReminder(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getEventReminder(user.id);
  }

  @Patch("reminders/events")
  @ApiOperation({ summary: "Cập nhật cài đặt nhắc nhở sự kiện" })
  @ApiResponse({ status: 200, description: "Đã cập nhật nhắc nhở sự kiện" })
  updateEventReminder(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(updateEventReminderSchema)) input: UpdateEventReminderInput,
  ) {
    return this.notificationService.updateEventReminder(user.id, input, {
      actorId: user.id,
      actorType: "user",
    });
  }
}

// ─── Admin Notification Controller ──────────────────────────────────────────

@ApiTags("admin-notifications")
@Controller("admin/notifications")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("push/jobs")
  @UsePipes(ZodValidate(adminPushJobQuerySchema))
  @ApiOperation({ summary: "Danh sách push jobs" })
  @ApiResponse({ status: 200, description: "Danh sách push jobs" })
  listJobs(@Query() query: AdminPushJobQuery) {
    return this.notificationService.adminListPushJobs(query);
  }

  @Get("push/jobs/:publicId")
  @ApiOperation({ summary: "Chi tiết push job" })
  @ApiResponse({ status: 200, description: "Chi tiết push job" })
  getJob(@Param("publicId") publicId: string) {
    return this.notificationService.adminGetPushJob(publicId);
  }

  @Post("push/jobs")
  @ApiOperation({ summary: "Tạo push job mới" })
  @ApiResponse({ status: 201, description: "Đã tạo push job" })
  createJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(adminCreatePushJobSchema)) input: AdminCreatePushJobInput,
  ) {
    return this.notificationService.adminCreatePushJob(input, user.id, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Post("push/jobs/:publicId/redrive")
  @ApiOperation({ summary: "Redrive push job đã thất bại" })
  @ApiResponse({ status: 200, description: "Đã redrive push job" })
  redriveJob(
    @CurrentUser() user: AuthenticatedUser,
    @Param("publicId") publicId: string,
  ) {
    return this.notificationService.adminRedrivePushJob(publicId, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Delete("push/jobs/:publicId")
  @ApiOperation({ summary: "Xoá push job" })
  @ApiResponse({ status: 200, description: "Đã xoá push job" })
  async deleteJob(
    @CurrentUser() user: AuthenticatedUser,
    @Param("publicId") publicId: string,
  ) {
    await this.notificationService.adminDeletePushJob(publicId, {
      actorId: user.id,
      actorType: "user",
    });
    return { success: true };
  }

  @Get("push/status")
  @ApiOperation({ summary: "Thống kê push jobs" })
  @ApiResponse({ status: 200, description: "Thống kê push jobs" })
  getPushStatus() {
    return this.notificationService.adminGetPushStatus();
  }

  @Get("push/subscription-stats")
  @ApiOperation({ summary: "Thống kê push subscriptions" })
  @ApiResponse({ status: 200, description: "Thống kê subscriptions" })
  getSubscriptionStats() {
    return this.notificationService.adminGetSubscriptionStats();
  }
}
