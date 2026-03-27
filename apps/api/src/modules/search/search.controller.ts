import { Controller, Get, Post, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { SearchService } from "./search.service.js";
import { searchQuerySchema, type SearchQuery } from "./search.schemas.js";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @UsePipes(ZodValidate(searchQuerySchema))
  @ApiOperation({ summary: "Tìm kiếm nội dung (Meilisearch)" })
  @ApiResponse({ status: 200, description: "Kết quả tìm kiếm" })
  search(@Query() query: SearchQuery) {
    return this.searchService.search(query);
  }

  @Post("reindex/:indexName")
  @ApiOperation({ summary: "Trigger reindex cho một index" })
  @ApiResponse({ status: 200, description: "Reindex triggered" })
  reindex(@Param("indexName") indexName: string) {
    return this.searchService.reindex(indexName);
  }
}
