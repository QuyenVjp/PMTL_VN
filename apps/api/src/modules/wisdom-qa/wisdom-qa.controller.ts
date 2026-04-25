import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import {
  askQuestionSchema,
  submitAnswerSchema,
  wisdomQaQuerySchema,
  offlineBundleListQuerySchema,
  offlineBundleStatusQuerySchema,
  offlineBundleCheckUpdatesSchema,
  offlineBundleDeltaQuerySchema,
  type AskQuestionInput,
  type SubmitAnswerInput,
  type WisdomQaQuery,
  type OfflineBundleListQuery,
  type OfflineBundleStatusQuery,
  type OfflineBundleCheckUpdatesInput,
  type OfflineBundleDeltaQuery,
} from "./wisdom-qa.schemas.js";

@ApiTags("wisdom-qa")
@Controller("wisdom-qa")
export class WisdomQaController {
  constructor(private readonly wisdomQaService: WisdomQaService) {}

  @Get("questions")
  @Public()
  @UsePipes(ZodValidate(wisdomQaQuerySchema))
  @ApiOperation({ summary: "Danh sách câu hỏi Phật pháp" })
  @ApiResponse({ status: 200, description: "Danh sách câu hỏi" })
  listQuestions(@Query() query: WisdomQaQuery) {
    return this.wisdomQaService.listQuestions(query);
  }

  @Get("questions/:id")
  @Public()
  @ApiOperation({ summary: "Chi tiết câu hỏi" })
  @ApiResponse({ status: 200, description: "Chi tiết câu hỏi và câu trả lời" })
  getQuestion(@Param("id") id: string) {
    return this.wisdomQaService.getQuestionById(id);
  }

  @Post("questions")
  @ApiOperation({ summary: "Đặt câu hỏi Phật pháp" })
  @ApiResponse({ status: 201, description: "Đã gửi câu hỏi" })
  askQuestion(
    @Body(ZodValidate(askQuestionSchema)) input: AskQuestionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.askQuestion(input, user.id);
  }

  @Post("answers")
  @ApiOperation({ summary: "Gửi câu trả lời" })
  @ApiResponse({ status: 201, description: "Đã gửi câu trả lời" })
  submitAnswer(
    @Body(ZodValidate(submitAnswerSchema)) input: SubmitAnswerInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.submitAnswer(input, user.id);
  }

  @Get("rule-packs/q161")
  @Public()
  @ApiOperation({ summary: "Lấy canonical rule-pack Q161 từ Wisdom-QA owner layer" })
  @ApiResponse({ status: 200, description: "Q161 canonical rule-pack" })
  getQ161RulePack() {
    return this.wisdomQaService.getQ161RulePack();
  }
}

@ApiTags("offline-bundles")
@Controller("offline-bundles")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class WisdomOfflineBundleController {
  constructor(private readonly wisdomQaService: WisdomQaService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách offline bundle cho member" })
  @ApiResponse({ status: 200, description: "Danh sách offline bundle" })
  listBundles(@Query(ZodValidate(offlineBundleListQuerySchema)) query: OfflineBundleListQuery) {
    return this.wisdomQaService.listOfflineBundles(query);
  }

  @Get(":publicId/status")
  @ApiOperation({ summary: "Trạng thái đồng bộ của một offline bundle" })
  @ApiResponse({ status: 200, description: "Trạng thái đồng bộ bundle" })
  getBundleStatus(
    @Param("publicId") publicId: string,
    @Query(ZodValidate(offlineBundleStatusQuerySchema)) query: OfflineBundleStatusQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.getOfflineBundleStatus(publicId, query, user.id);
  }

  @Post(":publicId/check-updates")
  @ApiOperation({ summary: "Kiểm tra cập nhật offline bundle cho thiết bị hiện tại" })
  @ApiResponse({ status: 200, description: "Trạng thái cập nhật bundle" })
  checkBundleUpdates(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(offlineBundleCheckUpdatesSchema)) input: OfflineBundleCheckUpdatesInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.getOfflineBundleStatus(publicId, input, user.id);
  }

  @Get(":publicId/delta")
  @ApiOperation({ summary: "Delta bundle để đồng bộ tăng dần cho offline reader" })
  @ApiResponse({ status: 200, description: "Delta manifest hoặc full sync manifest" })
  getBundleDelta(
    @Param("publicId") publicId: string,
    @Query(ZodValidate(offlineBundleDeltaQuerySchema)) query: OfflineBundleDeltaQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.getOfflineBundleDelta(publicId, query, user.id);
  }
}
