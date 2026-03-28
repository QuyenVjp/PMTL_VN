import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { SearchService } from "./search.service.js";

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

  @Post("reindex/:indexName")
  @ApiOperation({ summary: "Trigger reindex cho một index (admin)" })
  reindex(@Param("indexName") indexName: string) {
    return this.searchService.reindex(indexName);
  }
}
