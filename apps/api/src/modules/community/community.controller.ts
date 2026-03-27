import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { CommunityService } from "./community.service.js";
import {
  createCommunityPostSchema,
  communityPostQuerySchema,
  type CreateCommunityPostInput,
  type CommunityPostQuery,
} from "./community.schemas.js";

@ApiTags("community")
@Controller("community")
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get("posts")
  @Public()
  @UsePipes(ZodValidate(communityPostQuerySchema))
  @ApiOperation({ summary: "Danh sách bài đăng cộng đồng" })
  @ApiResponse({ status: 200, description: "Lấy danh sách thành công" })
  listPosts(@Query() query: CommunityPostQuery) {
    return this.communityService.listPosts(query);
  }

  @Get("posts/:id")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài đăng cộng đồng" })
  @ApiResponse({ status: 200, description: "Chi tiết bài đăng" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  getPost(@Param("id") id: string) {
    return this.communityService.getPostById(id);
  }

  @Post("posts")
  @UsePipes(ZodValidate(createCommunityPostSchema))
  @ApiOperation({ summary: "Tạo bài đăng cộng đồng" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createPost(
    @Body() input: CreateCommunityPostInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.createPost(input, user.id);
  }
}
