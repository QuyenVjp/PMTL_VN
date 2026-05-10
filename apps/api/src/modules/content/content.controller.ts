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
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { ContentService } from "./content.service.js";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  type CreatePostRequest,
  type UpdatePostRequest,
  type ListPostsQuery,
  guideQuerySchema,
  createGuideSchema,
  updateGuideSchema,
  type GuideQuery,
  type CreateGuideRequest,
  type UpdateGuideRequest,
  downloadQuerySchema,
  createDownloadSchema,
  updateDownloadSchema,
  type DownloadQuery,
  type CreateDownloadRequest,
  type UpdateDownloadRequest,
  beginnerGuidePublicQuerySchema,
  type BeginnerGuidePublicQuery,
  downloadPublicQuerySchema,
  type DownloadPublicQuery,
  unpublishPostSchema,
  type UnpublishPostRequest,
  slugCheckQuerySchema,
  type SlugCheckQuery,
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
}

@ApiTags("admin-content-posts")
@Controller("admin/content/posts")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminContentPostsController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách bài viết (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách bài viết cho admin" })
  async listAdminPosts(
    @Query() query: ListPostsQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const validated = listPostsQuerySchema.parse(query);
    return this.contentService.listPosts(validated, user.role);
  }

  @Get("slug-check")
  @ApiOperation({ summary: "Kiểm tra slug có bị trùng không (POST / GUIDE)" })
  @ApiResponse({ status: 200, description: "{ available: boolean }" })
  async checkSlug(@Query() query: SlugCheckQuery) {
    const validated = slugCheckQuerySchema.parse(query);
    return this.contentService.checkSlugAvailability(validated.slug, validated.type, validated.excludePublicId);
  }

  @Get(":publicIdOrSlug")
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

  @Post()
  @RateLimit("content.create")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo bài viết mới" })
  @ApiResponse({ status: 201, description: "Bài viết đã được tạo" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  async createPost(
    @Body(ZodValidate(createPostSchema)) input: CreatePostRequest,
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

  @Patch(":publicId")
  @RateLimit("content.update")
  @ApiOperation({ summary: "Cập nhật bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được cập nhật" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async updatePost(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updatePostSchema)) input: UpdatePostRequest,
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

  @Post(":publicId/publish")
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

  @Post(":publicId/unpublish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Gỡ xuất bản bài viết" })
  @ApiParam({ name: "publicId", description: "Public ID của bài viết" })
  @ApiResponse({ status: 200, description: "Bài viết đã được gỡ xuất bản" })
  @ApiResponse({ status: 403, description: "Không có quyền" })
  @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
  async unpublishPost(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(unpublishPostSchema)) body: UnpublishPostRequest,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.unpublishPost(publicId, body.mode, user.role, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete(":publicId")
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

@ApiTags("guides")
@Controller("admin/content/guides")
export class GuideController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
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

  @Get(":id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Chi tiết bài hướng dẫn (admin)" })
  @ApiParam({ name: "id", description: "Public ID hoặc slug" })
  @ApiResponse({ status: 200, description: "Chi tiết bài hướng dẫn cho admin" })
  async getAdminGuide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.getGuide(id, user.role);
  }

  @Post()
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo bài hướng dẫn" })
  @ApiResponse({ status: 201, description: "Đã tạo bài hướng dẫn" })
  async createGuide(
    @Body(ZodValidate(createGuideSchema)) input: CreateGuideRequest,
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

  @Patch(":id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Cập nhật bài hướng dẫn" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  async updateGuide(
    @Param("id") id: string,
    @Body(ZodValidate(updateGuideSchema)) input: UpdateGuideRequest,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.updateGuide(id, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":id/publish")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xuất bản bài hướng dẫn" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xuất bản" })
  async publishGuide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.publishGuide(id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":id/unpublish")
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Huỷ xuất bản bài hướng dẫn" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã huỷ xuất bản" })
  async unpublishGuide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.unpublishGuide(id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Xoá bài hướng dẫn" })
  @ApiParam({ name: "id", description: "Public ID" })
  @ApiResponse({ status: 200, description: "Đã xoá" })
  async deleteGuide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.deleteGuide(id, {
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
    @Body(ZodValidate(createDownloadSchema)) input: CreateDownloadRequest,
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
    @Body(ZodValidate(updateDownloadSchema)) input: UpdateDownloadRequest,
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
  async deleteDownload(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.contentService.adminDeleteDownload(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
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

// ======================== Public Beginner Guide Controller ========================

@ApiTags("content")
@Controller("content/beginner-guides")
export class PublicBeginnerGuideController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Danh sách bài hướng dẫn sơ học (công khai)" })
  @ApiResponse({ status: 200, description: "Danh sách bài hướng dẫn đã xuất bản" })
  async listPublicGuides(@Query() query: BeginnerGuidePublicQuery) {
    const validated = beginnerGuidePublicQuerySchema.parse(query);
    return this.contentService.publicListBeginnerGuides(validated);
  }

  @Get(":slugOrPublicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài hướng dẫn sơ học (công khai)" })
  @ApiParam({ name: "slugOrPublicId", description: "Slug hoặc Public ID của bài hướng dẫn" })
  @ApiResponse({ status: 200, description: "Chi tiết bài hướng dẫn" })
  @ApiResponse({ status: 404, description: "Bài hướng dẫn không tồn tại" })
  async getPublicGuide(@Param("slugOrPublicId") slugOrPublicId: string) {
    return this.contentService.publicGetBeginnerGuide(slugOrPublicId);
  }
}

// ======================== Public Download Controller ========================

@ApiTags("content")
@Controller("content/downloads")
export class PublicDownloadController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Danh sách tài liệu tải về (công khai)" })
  @ApiResponse({ status: 200, description: "Danh sách tài liệu đã xuất bản" })
  async listPublicDownloads(@Query() query: DownloadPublicQuery) {
    const validated = downloadPublicQuerySchema.parse(query);
    return this.contentService.publicListDownloads(validated);
  }

  @Get(":publicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết tài liệu tải về (công khai)" })
  @ApiParam({ name: "publicId", description: "Public ID của tài liệu" })
  @ApiResponse({ status: 200, description: "Chi tiết tài liệu" })
  @ApiResponse({ status: 404, description: "Tài liệu không tồn tại" })
  async getPublicDownload(@Param("publicId") publicId: string) {
    return this.contentService.publicGetDownload(publicId);
  }
}

// ======================== Public Chant Items Controller ========================

@ApiTags("content")
@Controller("content/chant-items")
export class PublicChantItemsController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Danh sách quy tắc niệm kinh (công khai)" })
  @ApiResponse({ status: 200, description: "Nhóm quy tắc niệm kinh với các quy tắc con" })
  async listPublicChantItems() {
    return this.contentService.publicListChantItems();
  }
}
