import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { NotificationService } from "./notification.service.js";
import {
  adminPushJobQuerySchema,
  adminCreatePushJobSchema,
  type AdminPushJobQuery,
  type AdminCreatePushJobInput,
} from "./notification.schemas.js";

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
  @UsePipes(ZodValidate(adminCreatePushJobSchema))
  @ApiOperation({ summary: "Tạo push job mới" })
  @ApiResponse({ status: 201, description: "Đã tạo push job" })
  createJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: AdminCreatePushJobInput,
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
