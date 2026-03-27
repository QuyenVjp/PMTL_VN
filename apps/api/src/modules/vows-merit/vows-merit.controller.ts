import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { VowsMeritService } from "./vows-merit.service.js";
import {
  createVowSchema,
  logMeritSchema,
  vowQuerySchema,
  type CreateVowInput,
  type LogMeritInput,
  type VowQuery,
} from "./vows-merit.schemas.js";

@ApiTags("vows-merit")
@Controller("vows-merit")
export class VowsMeritController {
  constructor(private readonly vowsMeritService: VowsMeritService) {}

  @Get("vows")
  @UsePipes(ZodValidate(vowQuerySchema))
  @ApiOperation({ summary: "Danh sách phát nguyện của user" })
  @ApiResponse({ status: 200, description: "Danh sách phát nguyện" })
  listVows(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VowQuery,
  ) {
    return this.vowsMeritService.listVows(user.id, query);
  }

  @Get("vows/:id")
  @ApiOperation({ summary: "Chi tiết phát nguyện" })
  @ApiResponse({ status: 200, description: "Chi tiết phát nguyện" })
  getVow(@Param("id") id: string) {
    return this.vowsMeritService.getVowById(id);
  }

  @Post("vows")
  @UsePipes(ZodValidate(createVowSchema))
  @ApiOperation({ summary: "Tạo phát nguyện mới" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createVow(
    @Body() input: CreateVowInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowsMeritService.createVow(input, user.id);
  }

  @Post("merit-log")
  @UsePipes(ZodValidate(logMeritSchema))
  @ApiOperation({ summary: "Ghi nhận công đức" })
  @ApiResponse({ status: 201, description: "Ghi nhận thành công" })
  logMerit(
    @Body() input: LogMeritInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vowsMeritService.logMerit(input, user.id);
  }
}
