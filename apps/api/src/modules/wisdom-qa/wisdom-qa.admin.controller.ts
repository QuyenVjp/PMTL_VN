import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import {
  wisdomEntryQuerySchema,
  createWisdomEntrySchema,
  updateWisdomEntrySchema,
  type WisdomEntryQuery,
  type CreateWisdomEntryInput,
  type UpdateWisdomEntryInput,
} from "./wisdom-qa.schemas.js";

@ApiTags("admin-wisdom")
@Controller("admin/wisdom")
export class WisdomQaAdminController {
  constructor(private readonly wisdomQaService: WisdomQaService) {}

  @Get("entries")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Danh sách bài tri tuệ (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách bài tri tuệ" })
  listEntries(@Query(ZodValidate(wisdomEntryQuerySchema)) query: WisdomEntryQuery) {
    return this.wisdomQaService.listWisdomEntries(query);
  }

  @Get("entries/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Chi tiết bài tri tuệ (admin)" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Chi tiết bài tri tuệ" })
  getEntry(@Param("id") id: string) {
    return this.wisdomQaService.getWisdomEntry(id);
  }

  @Post("entries")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo bài tri tuệ" })
  @ApiResponse({ status: 201, description: "Đã tạo bài tri tuệ" })
  createEntry(
    @Body(ZodValidate(createWisdomEntrySchema)) input: CreateWisdomEntryInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.wisdomQaService.createWisdomEntry(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: (req as any).ip,
      userAgent: (req as any).headers["user-agent"],
    });
  }

  @Patch("entries/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Cập nhật bài tri tuệ" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  updateEntry(
    @Param("id") id: string,
    @Body(ZodValidate(updateWisdomEntrySchema)) input: UpdateWisdomEntryInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.wisdomQaService.updateWisdomEntry(id, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: (req as any).ip,
      userAgent: (req as any).headers["user-agent"],
    });
  }

  @Post("entries/:id/publish")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xuất bản bài tri tuệ" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xuất bản" })
  publishEntry(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.wisdomQaService.publishWisdomEntry(id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: (req as any).ip,
      userAgent: (req as any).headers["user-agent"],
    });
  }

  @Delete("entries/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá bài tri tuệ" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 204, description: "Đã xoá" })
  deleteEntry(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.wisdomQaService.deleteWisdomEntry(id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: (req as any).ip,
      userAgent: (req as any).headers["user-agent"],
    });
  }
}
