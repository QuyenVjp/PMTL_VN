import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { VowsMeritService } from "./vows-merit.service.js";
import {
  assistedEntryHistorySchema,
  memberSearchSchema,
  assistedEntrySchema,
  lifeReleaseEntrySchema,
  type AssistedEntryHistoryQuery,
  type MemberSearchQuery,
  type AssistedEntryInput,
  type LifeReleaseEntryInput,
} from "./vows-merit.schemas.js";

@ApiTags("admin-vows")
@Controller("admin/vows")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminVowsController {
  constructor(private readonly vowsMeritService: VowsMeritService) {}

  @Get("assisted-entry/history")
  @ApiOperation({ summary: "Lịch sử nhập hộ phát nguyện" })
  @ApiResponse({ status: 200, description: "Danh sách phát nguyện" })
  async assistedEntryHistory(@Query() query: AssistedEntryHistoryQuery) {
    const validated = assistedEntryHistorySchema.parse(query);
    return this.vowsMeritService.adminAssistedEntryHistory(validated);
  }

  @Get("assisted-entry/members/search")
  @ApiOperation({ summary: "Tìm kiếm thành viên" })
  @ApiResponse({ status: 200, description: "Danh sách thành viên" })
  async searchMembers(@Query() query: MemberSearchQuery) {
    const validated = memberSearchSchema.parse(query);
    return this.vowsMeritService.adminSearchMembers(validated);
  }

  @Get("assisted-entry/members/:memberPublicId/vows")
  @ApiOperation({ summary: "Danh sách phát nguyện của thành viên" })
  @ApiParam({ name: "memberPublicId", description: "Public ID của thành viên" })
  @ApiResponse({ status: 200, description: "Danh sách phát nguyện" })
  async getMemberVows(@Param("memberPublicId") memberPublicId: string) {
    return this.vowsMeritService.adminGetMemberVows(memberPublicId);
  }

  @Post("assisted-entry")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidate(assistedEntrySchema))
  @ApiOperation({ summary: "Nhập hộ phát nguyện cho thành viên" })
  @ApiResponse({ status: 201, description: "Đã tạo phát nguyện" })
  async createAssistedEntry(
    @Body() input: AssistedEntryInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.vowsMeritService.adminCreateAssistedEntry(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("assisted-entry/life-release")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidate(lifeReleaseEntrySchema))
  @ApiOperation({ summary: "Nhập hộ phóng sanh cho thành viên" })
  @ApiResponse({ status: 201, description: "Đã tạo nhật ký phóng sanh" })
  async createLifeReleaseEntry(
    @Body() input: LifeReleaseEntryInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.vowsMeritService.adminCreateLifeReleaseEntry(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
