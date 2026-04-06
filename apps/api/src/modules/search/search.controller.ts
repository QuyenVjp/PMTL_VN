import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import { SearchService } from "./search.service.js";
import { searchQuerySchema, type SearchQuery } from "./search.schemas.js";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("status")
  @Public()
  @ApiOperation({ summary: "Trạng thái search engine (public)" })
  @ApiResponse({ status: 200, description: "Trạng thái hoạt động của search engine" })
  getStatus() {
    return this.searchService.getPublicStatus();
  }

  @Get()
  @Public()
  @RateLimit("search.query")
  @UsePipes(ZodValidate(searchQuerySchema))
  @ApiOperation({ summary: "Tìm kiếm nội dung (Meilisearch)" })
  @ApiResponse({ status: 200, description: "Kết quả tìm kiếm" })
  search(@Query() query: SearchQuery) {
    return this.searchService.search(query);
  }
}
