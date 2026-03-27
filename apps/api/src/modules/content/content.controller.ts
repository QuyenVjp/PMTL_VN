import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { ContentService } from "./content.service.js";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  type CreatePostInput,
  type UpdatePostInput,
  type ListPostsQuery,
} from "./content.schemas.js";

@ApiTags("content")
@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("posts")
  @Public()
  @ApiOperation({ summary: "Danh sách bài viết" })
  @ApiResponse({ status: 200, description: "Danh sách bài viết" })
  async listPosts(
    @Query() query: ListPostsQuery,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const validated = listPostsQuerySchema.parse(query);
    return this.contentService.listPosts(validated, user?.role);
  }

  @Get("posts/:publicIdOrSlug")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài viết" })
  @ApiParam({ name: "publicIdOrSlug", description: "Public ID hoặc slug của bài viết" })
  @ApiResponse({ status: 200, description: "Chi tiết bài viết" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async getPost(
    @Param("publicIdOrSlug") publicIdOrSlug: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.contentService.getPost(publicIdOrSlug, user?.role);
  }

  @Post("posts")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidate(createPostSchema))
  @ApiOperation({ summary: "Tạo bài viết mới" })
  @ApiResponse({ status: 201, description: "Bài viết đã được tạo" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  async createPost(
    @Body() input: CreatePostInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.createPost(input, user.id, user.role, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("posts/:publicId")
  @UsePipes(ZodValidate(updatePostSchema))
  @ApiOperation({ summary: "Cập nhật bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được cập nhật" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async updatePost(
    @Param("publicId") publicId: string,
    @Body() input: UpdatePostInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.updatePost(publicId, input, user.id, user.role, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("posts/:publicId/publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xuất bản bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được xuất bản" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async publishPost(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.publishPost(publicId, user.role, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
