import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { Request } from "express";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { ModerationService } from "./moderation.service.js";
import {
  moderationReportListQuerySchema,
  moderationDecisionSchema,
  type ModerationReportListQuery,
  type ModerationDecisionInput,
} from "./moderation.schemas.js";

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
  @UsePipes(ZodValidate(moderationDecisionSchema))
  @ApiOperation({ summary: "Quyết định xử lý báo cáo" })
  async decide(
    @Param("publicId") publicId: string,
    @Body() input: ModerationDecisionInput,
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
}
