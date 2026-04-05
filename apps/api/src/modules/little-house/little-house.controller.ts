import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { LittleHouseService } from "./little-house.service.js";
import {
  lhQuerySchema,
  createLhRecordSchema,
  logRecitationSchema,
  dottingSessionSchema,
  combustionLogSchema,
  flagFraudSchema,
  resolveFraudSchema,
  fraudQuerySchema,
  type LhQuery,
  type CreateLhRecordInput,
  type LogRecitationInput,
  type DottingSessionInput,
  type CombustionLogInput,
  type FlagFraudInput,
  type ResolveFraudInput,
  type FraudQuery,
} from "./little-house.schemas.js";

@ApiTags("admin-little-house")
@Controller("admin/little-house")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminLittleHouseController {
  constructor(private readonly svc: LittleHouseService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách hồ sơ sớ" })
  async list(@Query() query: LhQuery) {
    return this.svc.listRecords(lhQuerySchema.parse(query));
  }

  @Get("fraud")
  @ApiOperation({ summary: "Hàng đợi gian lận sớ" })
  async listFraud(@Query() query: FraudQuery) {
    return this.svc.listFraud(fraudQuerySchema.parse(query));
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết hồ sơ sớ" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getRecord(publicId);
  }

  @Patch(":publicId/advance")
  @ApiOperation({ summary: "Chuyển trạng thái sớ" })
  async advance(
    @Param("publicId") publicId: string,
    @Body("status") status: string,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.advanceStatus(publicId, status, user.id, auditCtx);
  }

  @Post(":publicId/dotting")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Bắt đầu phiên điểm nhãn" })
  async startDotting(
    @Param("publicId") publicId: string,
    @Body() body: DottingSessionInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.startDotting(publicId, dottingSessionSchema.parse(body), user.id, auditCtx);
  }

  @Patch("dotting/:sessionId/complete")
  @ApiOperation({ summary: "Hoàn thành phiên điểm nhãn" })
  async completeDotting(
    @Param("sessionId") sessionId: string,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.completeDotting(sessionId, auditCtx);
  }

  @Post(":publicId/combust")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi nhận hóa sớ" })
  async combust(
    @Param("publicId") publicId: string,
    @Body() body: CombustionLogInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.logCombustion(publicId, combustionLogSchema.parse(body), user.id, auditCtx);
  }

  @Post(":publicId/fraud")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Gắn cờ gian lận" })
  async flagFraud(
    @Param("publicId") publicId: string,
    @Body() body: FlagFraudInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.flagFraud(publicId, flagFraudSchema.parse(body), user.id, auditCtx);
  }

  @Patch("fraud/:fraudId/resolve")
  @ApiOperation({ summary: "Xử lý gian lận" })
  async resolveFraud(
    @Param("fraudId") fraudId: string,
    @Body() body: ResolveFraudInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.resolveFraud(fraudId, resolveFraudSchema.parse(body), user.id, auditCtx);
  }
}

@ApiTags("member-little-house")
@Controller("member/little-house")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberLittleHouseController {
  constructor(private readonly svc: LittleHouseService) {}

  @Get()
  @ApiOperation({ summary: "Hồ sơ sớ của tôi" })
  async list(@Query() query: LhQuery, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.listRecords(lhQuerySchema.parse({ ...query, userId: user.id }));
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết hồ sơ sớ" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getRecord(publicId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hồ sơ sớ mới" })
  async create(
    @Body() body: CreateLhRecordInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createRecord(createLhRecordSchema.parse(body), user.id, auditCtx);
  }

  @Post(":publicId/recitations")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi nhật ký tụng kinh" })
  async logRecitation(
    @Param("publicId") publicId: string,
    @Body() body: LogRecitationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.logRecitation(publicId, logRecitationSchema.parse(body), user.id, auditCtx);
  }
}
