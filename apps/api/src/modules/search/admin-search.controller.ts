import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { SearchService } from "./search.service.js";
import {
  adminReindexSchema,
  adminReindexSourceSchema,
  type AdminReindexInput,
  type AdminReindexSourceInput,
} from "./search.schemas.js";

@ApiTags("admin-search")
@Controller("admin/search")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminSearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("status")
  @ApiOperation({ summary: "Trạng thái search engine (admin)" })
  getStatus() {
    return this.searchService.getAdminStatus();
  }

  @Post("reindex")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Trigger reindex toàn bộ hoặc theo phạm vi (admin)" })
  async reindexFull(
    @Body(ZodValidate(adminReindexSchema)) input: AdminReindexInput,
    @AuditContext() _auditCtx: AuditCtxType,
  ) {
    const target = input.scope === "source" && input.source ? input.source : "all";
    return this.searchService.reindex(target);
  }

  @Post("reindex/:source")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Trigger reindex một nguồn cụ thể (admin)" })
  async reindexBySource(@Param("source", ZodValidate(adminReindexSourceSchema)) source: AdminReindexSourceInput) {
    return this.searchService.reindex(source);
  }
}
