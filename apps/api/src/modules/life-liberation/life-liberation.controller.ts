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
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { PredatorySpeciesGuard } from "./guards/predatory-species.guard.js";
import { LifeLiberationService } from "./life-liberation.service.js";
import {
  lifeReleaseQuerySchema,
  createLifeReleaseSchema,
  updateLifeReleaseStatusSchema,
  proxyReleaseSchema,
  type LifeReleaseQuery,
  type CreateLifeReleaseInput,
  type UpdateLifeReleaseStatusInput,
  type ProxyReleaseInput,
} from "./life-liberation.schemas.js";

@ApiTags("admin-life-liberation")
@Controller("admin/life-liberation")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminLifeLiberationController {
  constructor(private readonly svc: LifeLiberationService) {}

  @Get("status")
  @ApiOperation({ summary: "Tổng quan phóng sinh (admin dashboard)" })
  async adminStatus() {
    return this.svc.getAdminStatus();
  }

  @Get()
  @ApiOperation({ summary: "Danh sách hồ sơ phóng sinh" })
  async list(@Query() query: LifeReleaseQuery) {
    return this.svc.listRecords(lifeReleaseQuerySchema.parse(query));
  }

  @Get("species-summary")
  @ApiOperation({ summary: "Thống kê theo loài" })
  async speciesSummary() {
    return this.svc.getSpeciesSummary();
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết hồ sơ phóng sinh" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getRecord(publicId);
  }

  @Patch(":publicId/status")
  @ApiOperation({ summary: "Cập nhật trạng thái hồ sơ" })
  async updateStatus(
    @Param("publicId") publicId: string,
    @Body() body: UpdateLifeReleaseStatusInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.updateStatus(publicId, updateLifeReleaseStatusSchema.parse(body), user.id, auditCtx);
  }
}

@ApiTags("member-life-liberation")
@Controller("member/life-liberation")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberLifeLiberationController {
  constructor(private readonly svc: LifeLiberationService) {}

  @Get()
  @ApiOperation({ summary: "Hồ sơ phóng sinh của tôi" })
  async list(@Query() query: LifeReleaseQuery, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.listRecords(lifeReleaseQuerySchema.parse({ ...query, userId: user.id }));
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết hồ sơ phóng sinh" })
  async getOne(@Param("publicId") publicId: string) {
    return this.svc.getRecord(publicId);
  }

  @Post()
  @UseGuards(PredatorySpeciesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hồ sơ phóng sinh" })
  async create(
    @Body() body: CreateLifeReleaseInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createRecord(createLifeReleaseSchema.parse(body), user.id, auditCtx);
  }

  @Post(":publicId/proxy")
  @UseGuards(PredatorySpeciesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Thêm người thụ hưởng phóng sinh hộ" })
  async addProxy(
    @Param("publicId") publicId: string,
    @Body() body: ProxyReleaseInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.addProxyRelease(publicId, proxyReleaseSchema.parse(body), user.id, auditCtx);
  }
}
