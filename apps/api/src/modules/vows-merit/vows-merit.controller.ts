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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { VowsMeritService } from "./vows-merit.service.js";
import { VowMemberService } from "./vow-member.service.js";
import { AltarService } from "./altar.service.js";
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
import {
  createVowSchema,
  updateVowProgressSchema,
  fulfillVowSchema,
  addMeritTransferSchema,
  memberVowQuerySchema,
  type CreateVowInput,
  type UpdateVowProgressInput,
  type FulfillVowInput,
  type AddMeritTransferInput,
  type MemberVowQuery,
} from "./vow-member.schemas.js";
import {
  createAltarLogSchema,
  altarLogQuerySchema,
  type CreateAltarLogInput,
  type AltarLogQuery,
} from "./altar.schemas.js";

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
  @ApiOperation({ summary: "Nhập hộ phát nguyện cho thành viên" })
  @ApiResponse({ status: 201, description: "Đã tạo phát nguyện" })
  async createAssistedEntry(
    @Body(ZodValidate(assistedEntrySchema)) input: AssistedEntryInput,
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
  @ApiOperation({ summary: "Nhập hộ phóng sanh cho thành viên" })
  @ApiResponse({ status: 201, description: "Đã tạo nhật ký phóng sanh" })
  async createLifeReleaseEntry(
    @Body(ZodValidate(lifeReleaseEntrySchema)) input: LifeReleaseEntryInput,
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

// ─── Member: Vow Engine ─────────────────────────────────────────────────────

@ApiTags("me-vows")
@Controller("me/vows")
export class MemberVowsController {
  constructor(private readonly vowMemberService: VowMemberService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách nguyện lực của tôi" })
  listVows(
    @Query(ZodValidate(memberVowQuerySchema)) query: MemberVowQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowMemberService.listVows(user.id, query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết một nguyện lực" })
  @ApiParam({ name: "publicId" })
  getVow(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vowMemberService.getVow(publicId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Phát nguyện mới" })
  createVow(
    @Body(ZodValidate(createVowSchema)) input: CreateVowInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowMemberService.createVow(input, user.id);
  }

  @Post("progress")
  @ApiOperation({ summary: "Cập nhật tiến độ nguyện lực" })
  updateProgress(
    @Body(ZodValidate(updateVowProgressSchema)) input: UpdateVowProgressInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowMemberService.updateProgress(input, user.id);
  }

  @Post("fulfill")
  @ApiOperation({ summary: "Hoàn nguyện" })
  fulfillVow(
    @Body(ZodValidate(fulfillVowSchema)) input: FulfillVowInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowMemberService.fulfillVow(input, user.id);
  }

  @Post("merit-transfer")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Thêm hồi hướng công đức" })
  addMeritTransfer(
    @Body(ZodValidate(addMeritTransferSchema)) input: AddMeritTransferInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowMemberService.addMeritTransfer(input, user.id);
  }
}

// ─── Member: Altar Maintenance ───────────────────────────────────────────────

@ApiTags("me-altar")
@Controller("me/altar")
export class AltarController {
  constructor(private readonly altarService: AltarService) {}

  @Get()
  @ApiOperation({ summary: "Lịch sử bảo dưỡng bàn thờ" })
  listLogs(
    @Query(ZodValidate(altarLogQuerySchema)) query: AltarLogQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.altarService.listLogs(user.id, query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết nhật ký bảo dưỡng" })
  @ApiParam({ name: "publicId" })
  getLog(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.altarService.getLog(publicId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi nhật ký bảo dưỡng bàn thờ" })
  createLog(
    @Body(ZodValidate(createAltarLogSchema)) input: CreateAltarLogInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.altarService.createLog(input, user.id);
  }
}
