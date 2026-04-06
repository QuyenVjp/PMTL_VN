import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import type { Request } from "express";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { ModerationService } from "./moderation.service.js";
import {
  moderationReportListQuerySchema,
  moderationDecisionSchema,
  submitReportSchema,
  adminCommentQuerySchema,
  type ModerationReportListQuery,
  type ModerationDecisionInput,
  type SubmitReportInput,
  type AdminCommentQuery,
} from "./moderation.schemas.js";

// ─── Admin: Report Management ───────────────────────────────────────────────

@ApiTags("moderation")
@Controller("moderation/reports")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách báo cáo kiểm duyệt" })
  async list(@Query() rawQuery: Record<string, unknown>) {
    const query: ModerationReportListQuery = moderationReportListQuerySchema.parse(rawQuery);
    return this.moderationService.list(query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết báo cáo kiểm duyệt" })
  async detail(@Param("publicId") publicId: string) {
    return this.moderationService.getDetail(publicId);
  }

  @Post(":publicId/decision")
  @ApiOperation({ summary: "Quyết định xử lý báo cáo" })
  async decide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(moderationDecisionSchema)) input: ModerationDecisionInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.moderationService.resolveReport(publicId, input, actor.id, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("recompute-summary")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tính lại tổng hợp thống kê kiểm duyệt (recovery path)" })
  @ApiResponse({ status: 200, description: "Thống kê đã được tính lại" })
  async recomputeSummary(@AuditContext() auditCtx: AuditCtxType) {
    return this.moderationService.recomputeSummary(auditCtx);
  }
}

// ─── Public: Report Submission ──────────────────────────────────────────────

@ApiTags("moderation")
@Controller("moderation/reports")
export class PublicModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit("moderation.report")
  @ApiOperation({ summary: "Gửi báo cáo vi phạm" })
  @ApiResponse({ status: 201, description: "Báo cáo đã được gửi" })
  @ApiResponse({ status: 409, description: "Đã có báo cáo đang chờ xử lý" })
  @ApiResponse({ status: 429, description: "Quá nhiều yêu cầu" })
  async submitReport(
    @Body(ZodValidate(submitReportSchema)) input: SubmitReportInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.moderationService.submitReport(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}

// ─── Admin: Comment Moderation ──────────────────────────────────────────────

@ApiTags("admin-moderation")
@Controller("admin/moderation/comments")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminCommentModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách bình luận cần kiểm duyệt" })
  async listComments(@Query() rawQuery: Record<string, unknown>) {
    const query: AdminCommentQuery = adminCommentQuerySchema.parse(rawQuery);
    return this.moderationService.listCommentsForModeration(query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết bình luận cần kiểm duyệt" })
  @ApiParam({ name: "publicId", description: "Public ID của bình luận" })
  @ApiResponse({ status: 200, description: "Chi tiết bình luận kèm báo cáo đang chờ" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bình luận" })
  async getComment(@Param("publicId") publicId: string) {
    return this.moderationService.getCommentDetail(publicId);
  }

  @Post(":publicId/hide")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Ẩn bình luận" })
  @ApiParam({ name: "publicId", description: "Public ID của bình luận" })
  @ApiResponse({ status: 200, description: "Bình luận đã bị ẩn" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bình luận" })
  @ApiResponse({ status: 409, description: "Bình luận đã bị ẩn" })
  async hideComment(
    @Param("publicId") publicId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.moderationService.hideComment(publicId, actor.id, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":publicId/restore")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Khôi phục bình luận đã ẩn" })
  @ApiParam({ name: "publicId", description: "Public ID của bình luận" })
  @ApiResponse({ status: 200, description: "Bình luận đã được khôi phục" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bình luận" })
  @ApiResponse({ status: 409, description: "Bình luận không ở trạng thái ẩn" })
  async restoreComment(
    @Param("publicId") publicId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.moderationService.restoreComment(publicId, actor.id, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
