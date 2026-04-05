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
import { AltarManagementService } from "./altar-management.service.js";
import {
  altarItemQuerySchema,
  createAltarItemSchema,
  updateAltarItemConditionSchema,
  validationLogQuerySchema,
  createValidationLogSchema,
  type AltarItemQuery,
  type CreateAltarItemInput,
  type UpdateAltarItemConditionInput,
  type ValidationLogQuery,
  type CreateValidationLogInput,
} from "./altar-management.schemas.js";

@ApiTags("admin-altar-management")
@Controller("admin/altar-management")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminAltarManagementController {
  constructor(private readonly svc: AltarManagementService) {}

  @Get("items")
  @ApiOperation({ summary: "Danh sách vật phẩm thờ cúng" })
  async listItems(@Query() query: AltarItemQuery) {
    return this.svc.listItems(altarItemQuerySchema.parse(query));
  }

  @Get("items/:publicId")
  @ApiOperation({ summary: "Chi tiết vật phẩm thờ cúng" })
  async getItem(@Param("publicId") publicId: string) {
    return this.svc.getItem(publicId);
  }

  @Patch("items/:publicId/condition")
  @ApiOperation({ summary: "Cập nhật tình trạng vật phẩm" })
  async updateCondition(
    @Param("publicId") publicId: string,
    @Body() body: UpdateAltarItemConditionInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.updateCondition(publicId, updateAltarItemConditionSchema.parse(body), user.id, auditCtx);
  }

  @Get("validation-logs")
  @ApiOperation({ summary: "Nhật ký kiểm tra thờ cúng (read-only audit)" })
  async listLogs(@Query() query: ValidationLogQuery) {
    return this.svc.listValidationLogs(validationLogQuerySchema.parse(query));
  }

  @Get("protocol-templates")
  @ApiOperation({ summary: "Danh sách quy trình thờ cúng" })
  async listTemplates() {
    return this.svc.listProtocolTemplates();
  }
}

@ApiTags("member-altar-management")
@Controller("member/altar-management")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberAltarManagementController {
  constructor(private readonly svc: AltarManagementService) {}

  @Get("items")
  @ApiOperation({ summary: "Vật phẩm thờ cúng của tôi" })
  async listMyItems(@Query() query: AltarItemQuery, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.listItems(altarItemQuerySchema.parse({ ...query, userId: user.id }));
  }

  @Post("items")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Thêm vật phẩm thờ cúng" })
  async createItem(
    @Body() body: CreateAltarItemInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createItem(createAltarItemSchema.parse(body), user.id, auditCtx);
  }

  @Post("validation-logs")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi nhật ký kiểm tra thờ cúng" })
  async logValidation(
    @Body() body: CreateValidationLogInput,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createValidationLog(createValidationLogSchema.parse(body), user.id, auditCtx);
  }

  @Get("protocol-templates")
  @ApiOperation({ summary: "Danh sách quy trình thờ cúng" })
  async listTemplates() {
    return this.svc.listProtocolTemplates();
  }
}
