import { Controller, Get, Post, Body, Query, UsePipes, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { NotificationService } from "./notification.service.js";
import {
  notificationQuerySchema,
  markReadSchema,
  type NotificationQuery,
  type MarkReadInput,
} from "./notification.schemas.js";

@ApiTags("notification")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UsePipes(ZodValidate(notificationQuerySchema))
  @ApiOperation({ summary: "Danh sách thông báo của user" })
  @ApiResponse({ status: 200, description: "Danh sách thông báo" })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationQuery,
  ) {
    return this.notificationService.listNotifications(user.id, query);
  }

  @Post("mark-read")
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidate(markReadSchema))
  @ApiOperation({ summary: "Đánh dấu đã đọc" })
  @ApiResponse({ status: 200, description: "Đã đánh dấu" })
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: MarkReadInput,
  ) {
    return this.notificationService.markAsRead(user.id, input);
  }

  @Post("mark-all-read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đánh dấu tất cả đã đọc" })
  @ApiResponse({ status: 200, description: "Đã đánh dấu tất cả" })
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.markAllAsRead(user.id);
  }
}
