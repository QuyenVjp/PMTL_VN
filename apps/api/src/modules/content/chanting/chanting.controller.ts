import { Body, Controller, Get, Param, Patch, Post, Delete, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import { ChantingService } from "./chanting.service.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import {
  adminUpdateEnvironmentRuleSchema,
  groupKeySchema,
  createChantingSessionSchema,
  updateChantingSessionSchema,
  type AdminUpdateEnvironmentRuleInput,
  type CreateChantingSessionInput,
  type UpdateChantingSessionInput,
} from "./chanting.schemas.js";

@ApiTags("content/chanting")
@Controller("content/chanting")
export class ChantingController {
  constructor(private readonly chantingService: ChantingService) {}

  @Get("environment-rules")
  @Public()
  @ApiOperation({
    summary: "Lấy trang hướng dẫn môi trường và thời gian niệm kinh",
    description: "Trả về đầy đủ dữ liệu cho trang /niem-kinh/luu-y-moi-truong-va-thoi-gian",
  })
  @ApiResponse({
    status: 200,
    description: "Dữ liệu trang hướng dẫn môi trường niệm kinh",
  })
  async getEnvironmentRulesPage() {
    return this.chantingService.getEnvironmentRulesPage();
  }

  @Get("environment-rules/:groupKey")
  @Public()
  @ApiOperation({
    summary: "Lấy chi tiết nhóm quy tắc",
    description: "Trả về một nhóm quy tắc cụ thể với đầy đủ các quy tắc con",
  })
  @ApiParam({
    name: "groupKey",
    description: "Khóa nhóm quy tắc",
    enum: [
      "time-rules",
      "place-rules",
      "food-body-rules",
      "posture-hygiene-rules",
      "special-location-cautions",
      "non-interpretive-cautions",
    ],
  })
  @ApiResponse({
    status: 200,
    description: "Chi tiết nhóm quy tắc",
  })
  @ApiResponse({
    status: 404,
    description: "Nhóm quy tắc không tồn tại",
  })
  async getEnvironmentRuleGroup(@Param("groupKey") groupKey: string) {
    // Validate groupKey format
    const parsed = groupKeySchema.safeParse(groupKey);
    if (!parsed.success) {
      // Still attempt lookup - will throw 404 from service if not found
    }

    return this.chantingService.getEnvironmentRuleGroup(groupKey);
  }

  @Get("rule-packs/q161")
  @Public()
  @ApiOperation({
    summary: "Lấy Q161 rule-pack theo projection của content/chanting",
  })
  @ApiResponse({
    status: 200,
    description: "Q161 content rule-pack",
  })
  async getQ161RulePack() {
    return this.chantingService.getQ161RulePack();
  }

  @Get("sessions")
  @Roles("MEMBER", "ADMIN", "SUPER_ADMIN") 
  @ApiOperation({
    summary: "Lấy danh sách phiên niệm kinh của người dùng",
  })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Trang hiện tại (mặc định: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Số lượng mỗi trang (mặc định: 20, tối đa: 100)" })
  @ApiResponse({
    status: 200,
    description: "Danh sách phiên niệm kinh",
  })
  async getUserChantingSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.chantingService.getUserChantingSessions(pageNum, limitNum, user.id);
  }

  @Post("sessions")
  @Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Tạo phiên niệm kinh mới",
  })
  @ApiResponse({
    status: 201,
    description: "Phiên niệm kinh đã tạo thành công",
  })
  async createChantingSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(createChantingSessionSchema))
    input: CreateChantingSessionInput,
  ) {
    return this.chantingService.createChantingSession(input, user.id, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Get("sessions/:sessionId")
  @Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Lấy chi tiết phiên niệm kinh",
  })
  @ApiParam({
    name: "sessionId",
    description: "ID phiên niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Chi tiết phiên niệm kinh",
  })
  @ApiResponse({
    status: 404,
    description: "Phiên niệm kinh không tồn tại",
  })
  async getChantingSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
  ) {
    return this.chantingService.getChantingSession(sessionId, user.id);
  }

  @Patch("sessions/:sessionId")
  @Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Cập nhật phiên niệm kinh",
  })
  @ApiParam({
    name: "sessionId",
    description: "ID phiên niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Phiên niệm kinh đã cập nhật thành công",
  })
  @ApiResponse({
    status: 404,
    description: "Phiên niệm kinh không tồn tại",
  })
  async updateChantingSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
    @Body(ZodValidate(updateChantingSessionSchema))
    input: UpdateChantingSessionInput,
  ) {
    return this.chantingService.updateChantingSession(sessionId, input, user.id, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Delete("sessions/:sessionId")
  @Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Xóa phiên niệm kinh",
  })
  @ApiParam({
    name: "sessionId",
    description: "ID phiên niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Phiên niệm kinh đã xóa thành công",
  })
  @ApiResponse({
    status: 404,
    description: "Phiên niệm kinh không tồn tại",
  })
  async deleteChantingSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
  ) {
    return this.chantingService.deleteChantingSession(sessionId, user.id, {
      actorId: user.id,
      actorType: "user",
    });
  }
}

@ApiTags("admin-content-chanting")
@Controller("admin/content/chanting")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminChantingController {
  constructor(private readonly chantingService: ChantingService) {}

  @Get("environment-rules")
  @ApiOperation({
    summary: "Lấy dữ liệu quản trị môi trường & thời gian niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Dữ liệu nhóm quy tắc phục vụ admin workspace",
  })
  async getEnvironmentRulesPage() {
    return this.chantingService.getEnvironmentRulesPage();
  }

  @Patch("environment-rules/:ruleKey")
  @ApiOperation({
    summary: "Cập nhật một quy tắc môi trường niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Nhóm quy tắc sau khi cập nhật thành công",
  })
  async updateEnvironmentRule(
    @Param("ruleKey") ruleKey: string,
    @Body(ZodValidate(adminUpdateEnvironmentRuleSchema))
    input: AdminUpdateEnvironmentRuleInput,
  ) {
    return this.chantingService.adminUpdateEnvironmentRule(ruleKey, input);
  }

  @Get("sessions")
  @ApiOperation({
    summary: "Lấy danh sách tất cả phiên niệm kinh (admin)",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userId", required: false, type: String, description: "Lọc theo user ID" })
  @ApiResponse({
    status: 200,
    description: "Danh sách phiên niệm kinh cho admin",
  })
  async getAllChantingSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page") page = "1",
    @Query("limit") limit = "20", 
    @Query("userId") userId?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.chantingService.getAllChantingSessions(pageNum, limitNum, userId, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Get("sessions/:sessionId")
  @ApiOperation({
    summary: "Lấy chi tiết phiên niệm kinh (admin)",
  })
  @ApiParam({
    name: "sessionId",
    description: "ID phiên niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Chi tiết phiên niệm kinh",
  })
  async getChantingSessionAdmin(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
  ) {
    return this.chantingService.getChantingSessionAdmin(sessionId, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Delete("sessions/:sessionId")
  @ApiOperation({
    summary: "Xóa phiên niệm kinh (admin)",
  })
  @ApiParam({
    name: "sessionId",
    description: "ID phiên niệm kinh",
  })
  @ApiResponse({
    status: 200,
    description: "Phiên niệm kinh đã xóa thành công",
  })
  async deleteChantingSessionAdmin(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
  ) {
    return this.chantingService.deleteChantingSessionAdmin(sessionId, {
      actorId: user.id,
      actorType: "user",
    });
  }
}
