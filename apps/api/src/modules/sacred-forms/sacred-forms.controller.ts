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
import { SacredFormsService } from "./sacred-forms.service.js";
import {
  templateQuerySchema,
  createTemplateSchema,
  applicantQuerySchema,
  submitApplicationSchema,
  reviewApplicationSchema,
  updatePrerequisiteSchema,
  disposalPolaritySchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  burnApplicationSchema,
  probationQuerySchema,
  type TemplateQuery,
  type CreateTemplateInput,
  type ApplicantQuery,
  type SubmitApplicationInput,
  type ReviewApplicationInput,
  type UpdatePrerequisiteInput,
  type DisposalPolarityInput,
  type ApproveApplicationInput,
  type RejectApplicationInput,
  type BurnApplicationInput,
  type ProbationQuery,
} from "./sacred-forms.schemas.js";

@ApiTags("admin-sacred-forms")
@Controller("admin/sacred-forms")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminSacredFormsController {
  constructor(private readonly svc: SacredFormsService) {}

  @Get("templates")
  @ApiOperation({ summary: "Danh sách mẫu đơn" })
  async listTemplates(@Query() query: TemplateQuery) {
    return this.svc.listTemplates(templateQuerySchema.parse(query));
  }

  @Get("templates/:publicId")
  @ApiOperation({ summary: "Chi tiết mẫu đơn" })
  async getTemplate(@Param("publicId") publicId: string) {
    return this.svc.getTemplate(publicId);
  }

  @Post("templates")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo mẫu đơn" })
  async createTemplate(
    @Body() body: CreateTemplateInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createTemplate(createTemplateSchema.parse(body), user.id, auditCtx);
  }

  @Patch("templates/:publicId/toggle")
  @ApiOperation({ summary: "Bật/tắt mẫu đơn" })
  async toggleTemplate(
    @Param("publicId") publicId: string,
    @Body("isActive") isActive: boolean,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.toggleTemplate(publicId, isActive, user.id, auditCtx);
  }

  @Get("applicants")
  @ApiOperation({ summary: "Danh sách đơn đăng ký" })
  async listApplicants(@Query() query: ApplicantQuery) {
    return this.svc.listApplicants(applicantQuerySchema.parse(query));
  }

  @Get("applicants/:publicId")
  @ApiOperation({ summary: "Chi tiết đơn đăng ký" })
  async getApplicant(@Param("publicId") publicId: string) {
    return this.svc.getApplicant(publicId);
  }

  @Patch("applicants/:publicId/review")
  @ApiOperation({ summary: "Xét duyệt đơn" })
  async review(
    @Param("publicId") publicId: string,
    @Body() body: ReviewApplicationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.reviewApplication(publicId, reviewApplicationSchema.parse(body), user.id, auditCtx);
  }

  @Patch("applicants/:publicId/prerequisites")
  @ApiOperation({ summary: "Cập nhật điều kiện tiên quyết" })
  async updatePrerequisite(
    @Param("publicId") publicId: string,
    @Body() body: UpdatePrerequisiteInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.updatePrerequisite(publicId, updatePrerequisiteSchema.parse(body), user.id, auditCtx);
  }

  @Get("disposal-polarities")
  @ApiOperation({ summary: "Danh sách quy tắc xử lý đơn" })
  async listPolarities() {
    return this.svc.listDisposalPolarities();
  }

  @Post("disposal-polarities")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo quy tắc xử lý đơn" })
  async createPolarity(
    @Body() body: DisposalPolarityInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createDisposalPolarity(disposalPolaritySchema.parse(body), user.id, auditCtx);
  }

  @Post("applicants/:publicId/approve")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Duyệt đơn đăng ký" })
  async approveApplication(
    @Param("publicId") publicId: string,
    @Body() body: ApproveApplicationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.approveApplication(publicId, approveApplicationSchema.parse(body), user.id, auditCtx);
  }

  @Post("applicants/:publicId/reject")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Từ chối đơn đăng ký" })
  async rejectApplication(
    @Param("publicId") publicId: string,
    @Body() body: RejectApplicationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.rejectApplication(publicId, rejectApplicationSchema.parse(body), user.id, auditCtx);
  }

  @Post("applicants/:publicId/burn")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đốt đơn và kích hoạt probation 100 ngày" })
  async burnApplication(
    @Param("publicId") publicId: string,
    @Body() body: BurnApplicationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.burnApplication(publicId, burnApplicationSchema.parse(body), user.id, auditCtx);
  }

  @Get("status")
  @ApiOperation({ summary: "Tổng quan trạng thái sacred-forms" })
  async getStatus() {
    return this.svc.getStatusAggregate();
  }

  @Get("probations")
  @ApiOperation({ summary: "Danh sách probation (admin)" })
  async listProbations(@Query() query: ProbationQuery) {
    return this.svc.listAllProbations(probationQuerySchema.parse(query));
  }
}

@ApiTags("member-sacred-forms")
@Controller("member/sacred-forms")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberSacredFormsController {
  constructor(private readonly svc: SacredFormsService) {}

  @Get("templates")
  @ApiOperation({ summary: "Danh sách mẫu đơn hiện hành" })
  async listTemplates(@Query() query: TemplateQuery) {
    return this.svc.listTemplates(templateQuerySchema.parse({ ...query, isActive: true }));
  }

  @Post("apply")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Nộp đơn đăng ký" })
  async apply(
    @Body() body: SubmitApplicationInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.submitApplication(submitApplicationSchema.parse(body), user.id, auditCtx);
  }

  @Get("my-applications")
  @ApiOperation({ summary: "Đơn đăng ký của tôi" })
  async myApplications(@Query() query: ApplicantQuery, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.listApplicants(applicantQuerySchema.parse({ ...query, userId: user.id }));
  }

  @Get("my-applications/:publicId")
  @ApiOperation({ summary: "Chi tiết đơn của tôi" })
  async getMyApplication(@Param("publicId") publicId: string) {
    return this.svc.getApplicant(publicId);
  }

  @Get("my-probations")
  @ApiOperation({ summary: "Danh sách probation của tôi" })
  async myProbations(@Query() query: ProbationQuery, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.getMyProbations(user.id, probationQuerySchema.parse(query));
  }
}
