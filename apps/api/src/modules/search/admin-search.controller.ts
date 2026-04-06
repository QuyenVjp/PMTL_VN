import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus, UseGuards, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { SearchService } from "./search.service.js";
import { adminReindexSchema, type AdminReindexInput } from "./search.schemas.js";

const REINDEX_SOURCE_ALLOWLIST = ["posts", "guides", "wisdom", "little_house_guides", "sutras", "qa"] as const;
type ReindexSource = (typeof REINDEX_SOURCE_ALLOWLIST)[number];

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
    @Body() body: AdminReindexInput,
    @AuditContext() _auditCtx: AuditCtxType,
  ) {
    const input = adminReindexSchema.parse(body);
    const target = input.scope === "source" && input.source ? input.source : "all";
    return this.searchService.reindex(target);
  }

  @Post("reindex/:source")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Trigger reindex một nguồn cụ thể (admin)" })
  async reindexBySource(@Param("source") source: string) {
    if (!(REINDEX_SOURCE_ALLOWLIST as readonly string[]).includes(source)) {
      throw new BadRequestException(
        `Nguồn reindex không hợp lệ. Các giá trị được phép: ${REINDEX_SOURCE_ALLOWLIST.join(", ")}`,
      );
    }
    return this.searchService.reindex(source as ReindexSource);
  }
}
