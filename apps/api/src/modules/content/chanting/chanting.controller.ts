import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator.js";
import { ChantingService } from "./chanting.service.js";
import { groupKeySchema } from "./chanting.schemas.js";

@ApiTags("content/chanting")
@Controller("content/chanting")
export class ChantingController {
  constructor(private readonly chantingService: ChantingService) {}

  @Get("environment-rules")
  @Public()
  @ApiOperation({
    summary: "Lấy trang hướng dẫn môi trường và thời gian niệm kinh",
    description: "Trả về đầy đủ dữ liệu cho trang /niem-kinh/luu-y-moi-truong-va-thoi-gian",
  })
  @ApiResponse({
    status: 200,
    description: "Dữ liệu trang hướng dẫn môi trường niệm kinh",
  })
  async getEnvironmentRulesPage() {
    return this.chantingService.getEnvironmentRulesPage();
  }

  @Get("environment-rules/:groupKey")
  @Public()
  @ApiOperation({
    summary: "Lấy chi tiết nhóm quy tắc",
    description: "Trả về một nhóm quy tắc cụ thể với đầy đủ các quy tắc con",
  })
  @ApiParam({
    name: "groupKey",
    description: "Khóa nhóm quy tắc",
    enum: [
      "time-rules",
      "place-rules",
      "food-body-rules",
      "posture-hygiene-rules",
      "special-location-cautions",
      "non-interpretive-cautions",
    ],
  })
  @ApiResponse({
    status: 200,
    description: "Chi tiết nhóm quy tắc",
  })
  @ApiResponse({
    status: 404,
    description: "Nhóm quy tắc không tồn tại",
  })
  async getEnvironmentRuleGroup(@Param("groupKey") groupKey: string) {
    // Validate groupKey format
    const parsed = groupKeySchema.safeParse(groupKey);
    if (!parsed.success) {
      // Still attempt lookup - will throw 404 from service if not found
    }

    return this.chantingService.getEnvironmentRuleGroup(groupKey);
  }

  @Get("rule-packs/q161")
  @Public()
  @ApiOperation({
    summary: "Lấy Q161 rule-pack theo projection của content/chanting",
  })
  @ApiResponse({
    status: 200,
    description: "Q161 content rule-pack",
  })
  async getQ161RulePack() {
    return this.chantingService.getQ161RulePack();
  }
}
