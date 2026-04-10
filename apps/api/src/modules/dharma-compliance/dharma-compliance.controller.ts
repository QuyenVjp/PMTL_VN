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
import { Public } from "../../common/decorators/public.decorator.js";
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
  suspendCharitySchema,
  revokeCharitySchema,
  createCharityRuleSchema,
  updateCharityRuleSchema,
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

// ─── Public: Charity ─────────────────────────────────────────────────────────

@ApiTags("dharma-compliance-public")
@Controller("dharma-compliance")
export class PublicDharmaComplianceController {
  constructor(private readonly svc: DharmaComplianceService) {}

  @Get("approved-accounts")
  @Public()
  @ApiOperation({ summary: "Danh sách tài khoản từ thiện chính thức (public)" })
  async approvedAccounts() {
    return this.svc.listApprovedAccounts();
  }

  @Get("charities")
  @Public()
  @ApiOperation({ summary: "Danh sách tổ chức từ thiện đã xác minh (public)" })
  async listPublicCharities(@Query() query: CharityQuery) {
    const q = charityQuerySchema.parse(query);
    // Public endpoint only returns verified charities
    return this.svc.listCharities({ ...q, status: "VERIFIED" });
  }

  @Get("charities/:publicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết tổ chức từ thiện (public)" })
  async getPublicCharity(@Param("publicId") publicId: string) {
    return this.svc.getPublicCharity(publicId);
  }
}

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

  @Post(":publicId/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xác minh tổ chức từ thiện" })
  async verify(
    @Param("publicId") publicId: string,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.verifyCharity(publicId, auditCtx);
  }

  @Post(":publicId/suspend")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tạm ngừng tổ chức từ thiện" })
  async suspend(
    @Param("publicId") publicId: string,
    @Body() body: Record<string, unknown>,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = suspendCharitySchema.parse(body);
    return this.svc.suspendCharity(publicId, input.reason, auditCtx);
  }

  @Post(":publicId/revoke")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Thu hồi tổ chức từ thiện (vĩnh viễn)" })
  async revoke(
    @Param("publicId") publicId: string,
    @Body() body: Record<string, unknown>,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = revokeCharitySchema.parse(body);
    return this.svc.revokeCharity(publicId, input.reason, auditCtx);
  }

  @Get(":publicId/rules")
  @ApiOperation({ summary: "Danh sách tiêu chí xác minh tổ chức" })
  async listRules(@Param("publicId") publicId: string) {
    return this.svc.listCharityRules(publicId);
  }

  @Post(":publicId/rules")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Thêm tiêu chí xác minh" })
  async createRule(
    @Param("publicId") publicId: string,
    @Body() body: Record<string, unknown>,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = createCharityRuleSchema.parse(body);
    return this.svc.createCharityRule(publicId, input, auditCtx);
  }

  @Patch(":publicId/rules/:rulePublicId")
  @ApiOperation({ summary: "Cập nhật tiêu chí xác minh" })
  async updateRule(
    @Param("publicId") publicId: string,
    @Param("rulePublicId") rulePublicId: string,
    @Body() body: Record<string, unknown>,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    const input = updateCharityRuleSchema.parse(body);
    return this.svc.updateCharityRule(publicId, rulePublicId, input, auditCtx);
  }
}

// ─── Admin: Status & Interactions ────────────────────────────────────────────

@ApiTags("admin-dharma-compliance")
@Controller("admin/dharma-compliance")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDharmaComplianceStatusController {
  constructor(private readonly svc: DharmaComplianceService) {}

  @Get("status")
  @ApiOperation({ summary: "Tổng quan tuân thủ pháp (admin dashboard)" })
  async getStatus() {
    return this.svc.getAdminStatus();
  }

  @Get("interactions")
  @ApiOperation({ summary: "Lịch sử tương tác từ thiện của người dùng" })
  async listInteractions(@Query() query: Record<string, unknown>) {
    return this.svc.listInteractions({
      limit: query.limit ? Number(query.limit) : 20,
      offset: query.offset ? Number(query.offset) : 0,
      userId: typeof query.userId === "string" ? query.userId : undefined,
      interactionType: typeof query.interactionType === "string" ? query.interactionType : undefined,
    });
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
