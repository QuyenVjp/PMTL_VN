import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../../../common/decorators/public.decorator.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import { PracticeSupportService } from "./practice-support.service.js";
import {
  updateVietnamHomePracticeGuideSchema,
  type UpdateVietnamHomePracticeGuideInput,
} from "./practice-support.schemas.js";

// ============================================================================
// Public Controller
// ============================================================================

@ApiTags("practice-support")
@Controller("content/practice-support")
export class PracticeSupportController {
  constructor(private readonly practiceSupportService: PracticeSupportService) {}

  @Get("vietnam-home-practice-guide")
  @Public()
  @ApiOperation({ summary: "Hướng dẫn tự tu tại gia Việt Nam (public)" })
  @ApiResponse({ status: 200, description: "Trả về toàn bộ guide shape theo canon" })
  async getVietnamHomePracticeGuide() {
    return this.practiceSupportService.getVietnamHomePracticeGuide();
  }
}

// ============================================================================
// Admin Controller
// ============================================================================

@ApiTags("admin-practice-support")
@Controller("admin/content/practice-support")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminPracticeSupportController {
  constructor(private readonly practiceSupportService: PracticeSupportService) {}

  @Get("vietnam-home-practice-guide")
  @ApiOperation({ summary: "Hướng dẫn tự tu tại gia Việt Nam (admin)" })
  @ApiResponse({ status: 200, description: "Trả về toàn bộ guide shape + metadata cho admin" })
  async adminGetVietnamHomePracticeGuide() {
    return this.practiceSupportService.adminGetVietnamHomePracticeGuide();
  }

  @Patch("vietnam-home-practice-guide")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cập nhật hướng dẫn tự tu tại gia (admin)" })
  @ApiResponse({ status: 200, description: "Đã cập nhật thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  async adminUpdateVietnamHomePracticeGuide(
    @Body(ZodValidate(updateVietnamHomePracticeGuideSchema)) input: UpdateVietnamHomePracticeGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.practiceSupportService.adminUpdateVietnamHomePracticeGuide(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
