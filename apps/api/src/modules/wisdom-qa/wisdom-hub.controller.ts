import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import {
  wisdomEntryPublicQuerySchema,
  type WisdomEntryPublicQuery,
} from "./wisdom-qa.schemas.js";

@ApiTags("wisdom-hub")
@Controller("wisdom")
export class WisdomHubController {
  constructor(private readonly wisdomQaService: WisdomQaService) {}

  @Get("entries")
  @Public()
  @ApiOperation({ summary: "Danh sách bài tri tuệ công khai (hub)" })
  @ApiResponse({ status: 200, description: "Danh sách bài tri tuệ đã xuất bản" })
  listPublicEntries(
    @Query(ZodValidate(wisdomEntryPublicQuerySchema)) query: WisdomEntryPublicQuery,
  ) {
    return this.wisdomQaService.listPublicWisdomEntries(query);
  }

  @Get("entries/:slugOrPublicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài tri tuệ công khai" })
  @ApiParam({ name: "slugOrPublicId", description: "Slug hoặc Public ID" })
  @ApiResponse({ status: 200, description: "Chi tiết bài tri tuệ" })
  getPublicEntry(@Param("slugOrPublicId") slugOrPublicId: string) {
    return this.wisdomQaService.getPublicWisdomEntry(slugOrPublicId);
  }
}
