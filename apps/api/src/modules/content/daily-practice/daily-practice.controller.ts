import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { RolesGuard } from "../../../common/auth/roles.guard.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import { DailyPracticeService } from "./daily-practice.service.js";
import {
  listGuidesSchema,
  createGuideSchema,
  updateGuideSchema,
  createPresetSchema,
  updatePresetSchema,
  createFaqSchema,
  updateFaqSchema,
  type ListGuidesQuery,
  type CreateGuideInput,
  type UpdateGuideInput,
  type CreatePresetInput,
  type UpdatePresetInput,
  type CreateFaqInput,
  type UpdateFaqInput,
} from "./daily-practice.schemas.js";

@ApiTags("admin-daily-practice")
@Controller("admin/daily-practice")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDailyPracticeController {
  constructor(private readonly service: DailyPracticeService) {}

  /** Build the audit context from the request — actor is the external publicId, IP is hashed downstream. */
  private auditContext(user: AuthenticatedUser, req: Request): AuditContext {
    return {
      actorId: user.publicId,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };
  }

  // ── Overview ─────────────────────────────────────────────────────────────

  @Get("overview")
  @ApiOperation({ summary: "Tổng quan quản trị tu tập hằng ngày" })
  async getOverview() {
    return this.service.getOverview();
  }

  // ── Guides ────────────────────────────────────────────────────────────────

  @Get("guides")
  @ApiOperation({ summary: "Danh sách hướng dẫn tu tập (admin)" })
  async listGuides(@Query(ZodValidate(listGuidesSchema)) query: ListGuidesQuery) {
    return this.service.listGuides(query);
  }

  @Get("guides/:publicId")
  @ApiOperation({ summary: "Chi tiết hướng dẫn tu tập (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getGuide(@Param("publicId") publicId: string) {
    return this.service.getGuide(publicId);
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hướng dẫn tu tập" })
  async createGuide(
    @Body(ZodValidate(createGuideSchema)) input: CreateGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.createGuide(input, this.auditContext(user, req));
  }

  @Patch("guides/:publicId")
  @ApiOperation({ summary: "Cập nhật hướng dẫn tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateGuideSchema)) input: UpdateGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.updateGuide(publicId, input, this.auditContext(user, req));
  }

  @Delete("guides/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá hướng dẫn tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deleteGuide(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.service.deleteGuide(publicId, this.auditContext(user, req));
  }

  // ── Presets ───────────────────────────────────────────────────────────────

  @Get("presets")
  @ApiOperation({ summary: "Danh sách kịch bản tu tập (admin)" })
  async listPresets() {
    return this.service.listPresets();
  }

  @Get("presets/:publicId")
  @ApiOperation({ summary: "Chi tiết kịch bản tu tập (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getPreset(@Param("publicId") publicId: string) {
    return this.service.getPreset(publicId);
  }

  @Post("presets")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo kịch bản tu tập" })
  async createPreset(
    @Body(ZodValidate(createPresetSchema)) input: CreatePresetInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.createPreset(input, this.auditContext(user, req));
  }

  @Patch("presets/:publicId")
  @ApiOperation({ summary: "Cập nhật kịch bản tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updatePreset(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updatePresetSchema)) input: UpdatePresetInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.updatePreset(publicId, input, this.auditContext(user, req));
  }

  @Delete("presets/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá kịch bản tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deletePreset(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.service.deletePreset(publicId, this.auditContext(user, req));
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────

  @Get("faq")
  @ApiOperation({ summary: "Danh sách câu hỏi thường gặp (admin)" })
  async listFaq() {
    return this.service.listFaq();
  }

  @Get("faq/:publicId")
  @ApiOperation({ summary: "Chi tiết câu hỏi thường gặp (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getFaq(@Param("publicId") publicId: string) {
    return this.service.getFaq(publicId);
  }

  @Post("faq")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo câu hỏi thường gặp" })
  async createFaq(
    @Body(ZodValidate(createFaqSchema)) input: CreateFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.createFaq(input, this.auditContext(user, req));
  }

  @Patch("faq/:publicId")
  @ApiOperation({ summary: "Cập nhật câu hỏi thường gặp" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateFaq(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateFaqSchema)) input: UpdateFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.updateFaq(publicId, input, this.auditContext(user, req));
  }

  @Delete("faq/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá câu hỏi thường gặp" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deleteFaq(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.service.deleteFaq(publicId, this.auditContext(user, req));
  }
}
