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
import { DharmaComplianceService } from "./dharma-compliance.service.js";
import { DharmaCompliancePolicy } from "./dharma-compliance.policy.js";
import {
  charityQuerySchema,
  createCharitySchema,
  updateCharityStatusSchema,
  fraudAlertQuerySchema,
  resolveFraudAlertSchema,
  vowQuerySchema,
  registerVowSchema,
  logThoughtSchema,
  guidanceRequestSchema,
  respondGuidanceSchema,
  reportViolationSchema,
  thoughtLogQuerySchema,
  guidanceQueueQuerySchema,
  type CharityQuery,
  type CreateCharityInput,
  type UpdateCharityStatusInput,
  type FraudAlertQuery,
  type ResolveFraudAlertInput,
  type VowQuery,
  type RegisterVowInput,
  type LogThoughtInput,
  type GuidanceRequestInput,
  type RespondGuidanceInput,
  type ReportViolationInput,
  type ThoughtLogQuery,
  type GuidanceQueueQuery,
} from "./dharma-compliance.schemas.js";

// ─── Admin: Charity ──────────────────────────────────────────────────────────

@ApiTags("admin-dharma-compliance")
@Controller("admin/dharma-compliance/charities")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminCharityController {
  constructor(
    private readonly svc: DharmaComplianceService,
    private readonly policy: DharmaCompliancePolicy,
  ) {}

  @Get()
  @ApiOperation({ summary: "Danh sách tổ chức từ thiện" })
  async list(@Query() query: CharityQuery) {
    const q = charityQuerySchema.parse(query);
    return this.svc.listCharities(q);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết tổ chức từ thiện" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getCharity(publicId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo tổ chức từ thiện" })
  async create(
    @Body() body: CreateCharityInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = createCharitySchema.parse(body);
    return this.svc.createCharity(input, user.id, auditCtx);
  }

  @Patch(":publicId/status")
  @ApiOperation({ summary: "Cập nhật trạng thái tổ chức" })
  async updateStatus(
    @Param("publicId") publicId: string,
    @Body() body: UpdateCharityStatusInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = updateCharityStatusSchema.parse(body);
    return this.svc.updateCharityStatus(publicId, input, user.id, auditCtx);
  }
}

// ─── Admin: Fraud Alerts ─────────────────────────────────────────────────────

@ApiTags("admin-dharma-compliance")
@Controller("admin/dharma-compliance/fraud-alerts")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminFraudAlertController {
  constructor(private readonly svc: DharmaComplianceService) {}

  @Get()
  @ApiOperation({ summary: "Hàng đợi cảnh báo gian lận" })
  async list(@Query() query: FraudAlertQuery) {
    const q = fraudAlertQuerySchema.parse(query);
    return this.svc.listFraudAlerts(q);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết cảnh báo gian lận" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getFraudAlert(publicId);
  }

  @Patch(":publicId/resolve")
  @ApiOperation({ summary: "Xử lý cảnh báo gian lận" })
  async resolve(
    @Param("publicId") publicId: string,
    @Body() body: ResolveFraudAlertInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = resolveFraudAlertSchema.parse(body);
    return this.svc.resolveFraudAlert(publicId, input, user.id, auditCtx);
  }
}

// ─── Admin: Marital Purity Vow ───────────────────────────────────────────────

@ApiTags("admin-dharma-compliance")
@Controller("admin/dharma-compliance/vows")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminVowController {
  constructor(private readonly svc: DharmaComplianceService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách lời nguyện thanh tu" })
  async list(@Query() query: VowQuery) {
    const q = vowQuerySchema.parse(query);
    return this.svc.listVows(q);
  }

  @Get("guidance-queue")
  @ApiOperation({ summary: "Hàng đợi yêu cầu hướng dẫn" })
  async guidanceQueue(@Query() query: GuidanceQueueQuery) {
    const q = guidanceQueueQuerySchema.parse(query);
    return this.svc.listGuidanceQueue(q);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết lời nguyện thanh tu" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getVow(publicId);
  }

  @Patch("guidance/:id/respond")
  @ApiOperation({ summary: "Phản hồi yêu cầu hướng dẫn" })
  async respondGuidance(
    @Param("id") id: string,
    @Body() body: RespondGuidanceInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = respondGuidanceSchema.parse(body);
    return this.svc.respondToGuidance(id, input, user.id, auditCtx);
  }
}

// ─── Member: Marital Purity Vow ──────────────────────────────────────────────

@ApiTags("member-dharma-compliance")
@Controller("member/dharma-compliance/vow")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberVowController {
  constructor(
    private readonly svc: DharmaComplianceService,
    private readonly policy: DharmaCompliancePolicy,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Đăng ký lời nguyện thanh tu" })
  async register(
    @Body() body: RegisterVowInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = registerVowSchema.parse(body);
    return this.svc.registerVow(input, user.id, auditCtx);
  }

  @Get()
  @ApiOperation({ summary: "Xem lời nguyện của tôi" })
  async getMyVow(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getMyVow(user.id);
  }

  @Post("thoughts")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi nhật ký tâm niệm" })
  async logThought(
    @Body() body: LogThoughtInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = logThoughtSchema.parse(body);
    return this.svc.logThought(input, user.id, auditCtx);
  }

  @Get("thoughts")
  @ApiOperation({ summary: "Lịch sử nhật ký tâm niệm" })
  async getThoughts(@Query() query: ThoughtLogQuery, @CurrentUser() user: AuthenticatedUser) {
    const q = thoughtLogQuerySchema.parse(query);
    return this.svc.getThoughtLogs(user.id, q);
  }

  @Post("guidance")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Gửi yêu cầu hướng dẫn Dharma" })
  async requestGuidance(
    @Body() body: GuidanceRequestInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = guidanceRequestSchema.parse(body);
    return this.svc.submitGuidanceRequest(input, user.id, auditCtx);
  }

  @Post("violation")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Báo cáo vi phạm lời nguyện" })
  async reportViolation(
    @Body() body: ReportViolationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = reportViolationSchema.parse(body);
    return this.svc.reportViolation(input, user.id, auditCtx);
  }
}
