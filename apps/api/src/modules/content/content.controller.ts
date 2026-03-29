import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
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
  guideQuerySchema,
  createGuideSchema,
  updateGuideSchema,
  type GuideQuery,
  type CreateGuideInput,
  type UpdateGuideInput,
  downloadQuerySchema,
  createDownloadSchema,
  updateDownloadSchema,
  type DownloadQuery,
  type CreateDownloadInput,
  type UpdateDownloadInput,
} from "./content.schemas.js";

@ApiTags("content")
@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("admin/posts")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Danh sách bài viết (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách bài viết cho admin" })
  async listAdminPosts(
    @Query() query: ListPostsQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const validated = listPostsQuerySchema.parse(query);
    return this.contentService.listPosts(validated, user.role);
  }

  @Get("admin/posts/:publicIdOrSlug")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Chi tiết bài viết (admin)" })
  @ApiParam({ name: "publicIdOrSlug", description: "Public ID hoặc slug của bài viết" })
  @ApiResponse({ status: 200, description: "Chi tiết bài viết cho admin" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async getAdminPost(
    @Param("publicIdOrSlug") publicIdOrSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.getPost(publicIdOrSlug, user.role);
  }

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
  @ApiOperation({ summary: "Tạo bài viết mới" })
  @ApiResponse({ status: 201, description: "Bài viết đã được tạo" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  async createPost(
    @Body(ZodValidate(createPostSchema)) input: CreatePostInput,
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
  @ApiOperation({ summary: "Cập nhật bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được cập nhật" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async updatePost(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updatePostSchema)) input: UpdatePostInput,
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

  @Delete("posts/:publicId")
  @ApiOperation({ summary: "Xoá bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được xoá" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async deletePost(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.deletePost(publicId, user.id, user.role, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}

// ======================== Guide Controller ========================

@ApiTags("beginner-guides")
@Controller("content/beginner-guides")
export class GuideController {
  constructor(private readonly contentService: ContentService) {}

  @Get("admin")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Danh sách bài hướng dẫn (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách bài hướng dẫn cho admin" })
  async listAdminGuides(
    @Query() query: GuideQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const validated = guideQuerySchema.parse(query);
    return this.contentService.listGuides(validated, user.role);
  }

  @Get("admin/:slugOrId")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Chi tiết bài hướng dẫn (admin)" })
  @ApiParam({ name: "slugOrId", description: "Public ID hoặc slug" })
  @ApiResponse({ status: 200, description: "Chi tiết bài hướng dẫn cho admin" })
  async getAdminGuide(
    @Param("slugOrId") slugOrId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.getGuide(slugOrId, user.role);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Danh sách bài hướng dẫn" })
  @ApiResponse({ status: 200, description: "Danh sách bài hướng dẫn" })
  async listGuides(
    @Query() query: GuideQuery,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const validated = guideQuerySchema.parse(query);
    return this.contentService.listGuides(validated, user?.role);
  }

  @Get(":slugOrId")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài hướng dẫn" })
  @ApiParam({ name: "slugOrId", description: "Public ID hoặc slug" })
  @ApiResponse({ status: 200, description: "Chi tiết bài hướng dẫn" })
  async getGuide(
    @Param("slugOrId") slugOrId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.contentService.getGuide(slugOrId, user?.role);
  }

  @Post()
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo bài hướng dẫn" })
  @ApiResponse({ status: 201, description: "Đã tạo bài hướng dẫn" })
  async createGuide(
    @Body(ZodValidate(createGuideSchema)) input: CreateGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.createGuide(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch(":publicId")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Cập nhật bài hướng dẫn" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  async updateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateGuideSchema)) input: UpdateGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.updateGuide(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":publicId/publish")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xuất bản bài hướng dẫn" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xuất bản" })
  async publishGuide(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.publishGuide(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete(":publicId")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Xoá bài hướng dẫn" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xoá" })
  async deleteGuide(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.deleteGuide(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}

// ======================== Admin Download Controller ========================

@ApiTags("admin-downloads")
@Controller("admin/content/downloads")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDownloadController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách tài liệu" })
  @ApiResponse({ status: 200, description: "Danh sách tài liệu" })
  async listDownloads(@Query() query: DownloadQuery) {
    const validated = downloadQuerySchema.parse(query);
    return this.contentService.adminListDownloads(validated);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết tài liệu" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Chi tiết tài liệu" })
  async getDownload(@Param("publicId") publicId: string) {
    return this.contentService.adminGetDownload(publicId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo tài liệu" })
  @ApiResponse({ status: 201, description: "Đã tạo tài liệu" })
  async createDownload(
    @Body(ZodValidate(createDownloadSchema)) input: CreateDownloadInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.adminCreateDownload(input, user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch(":publicId")
  @ApiOperation({ summary: "Cập nhật tài liệu" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  async updateDownload(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateDownloadSchema)) input: UpdateDownloadInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.adminUpdateDownload(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete(":publicId")
  @ApiOperation({ summary: "Xóa tài liệu" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xóa" })
  async deleteDownload(@Param("publicId") publicId: string) {
    return this.contentService.adminDeleteDownload(publicId);
  }

  @Post(":publicId/publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xuất bản tài liệu" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xuất bản" })
  async publishDownload(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.adminPublishDownload(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
