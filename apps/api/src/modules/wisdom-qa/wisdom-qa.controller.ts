import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import {
  askQuestionSchema,
  submitAnswerSchema,
  wisdomQaQuerySchema,
  type AskQuestionInput,
  type SubmitAnswerInput,
  type WisdomQaQuery,
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
  @UsePipes(ZodValidate(askQuestionSchema))
  @ApiOperation({ summary: "Đặt câu hỏi Phật pháp" })
  @ApiResponse({ status: 201, description: "Đã gửi câu hỏi" })
  askQuestion(
    @Body() input: AskQuestionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wisdomQaService.askQuestion(input, user.id);
  }

  @Post("answers")
  @UsePipes(ZodValidate(submitAnswerSchema))
  @ApiOperation({ summary: "Gửi câu trả lời" })
  @ApiResponse({ status: 201, description: "Đã gửi câu trả lời" })
  submitAnswer(
    @Body() input: SubmitAnswerInput,
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
