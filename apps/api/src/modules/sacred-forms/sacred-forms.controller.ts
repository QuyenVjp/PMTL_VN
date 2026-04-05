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
  type TemplateQuery,
  type CreateTemplateInput,
  type ApplicantQuery,
  type SubmitApplicationInput,
  type ReviewApplicationInput,
  type UpdatePrerequisiteInput,
  type DisposalPolarityInput,
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
}
