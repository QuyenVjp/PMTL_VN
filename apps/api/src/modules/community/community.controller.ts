import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { CommunityService } from "./community.service.js";
import {
  createCommunityPostSchema,
  communityPostQuerySchema,
  adminUpdateCommunityPostSchema,
  createGuestbookEntrySchema,
  guestbookQuerySchema,
  adminUpdateGuestbookSchema,
  type CreateCommunityPostInput,
  type CommunityPostQuery,
  type AdminUpdateCommunityPostInput,
  type CreateGuestbookEntryInput,
  type GuestbookQuery,
  type AdminUpdateGuestbookInput,
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

  @Get("posts/:publicId")
  @Public()
  @ApiOperation({ summary: "Chi tiết bài đăng cộng đồng" })
  @ApiResponse({ status: 200, description: "Chi tiết bài đăng" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  getPost(@Param("publicId") publicId: string) {
    return this.communityService.getPostById(publicId);
  }

  @Post("posts")
  @ApiOperation({ summary: "Tạo bài đăng cộng đồng" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createPost(
    @Body(ZodValidate(createCommunityPostSchema)) input: CreateCommunityPostInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.createPost(input, user.id);
  }
}

@ApiTags("admin-community")
@Controller("admin/community")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminCommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ── Posts ──────────────────────────────────────────────────────────

  @Get("posts")
  @UsePipes(ZodValidate(communityPostQuerySchema))
  @ApiOperation({ summary: "Danh sách bài đăng (quản trị)" })
  @ApiResponse({ status: 200, description: "Lấy danh sách thành công" })
  listPosts(@Query() query: CommunityPostQuery) {
    return this.communityService.adminListPosts(query);
  }

  @Get("posts/:publicId")
  @ApiOperation({ summary: "Chi tiết bài đăng (quản trị)" })
  @ApiResponse({ status: 200, description: "Chi tiết bài đăng" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  getPost(@Param("publicId") publicId: string) {
    return this.communityService.adminGetPost(publicId);
  }

  @Patch("posts/:publicId")
  @ApiOperation({ summary: "Cập nhật trạng thái bài đăng" })
  @ApiResponse({ status: 200, description: "Cập nhật thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  updatePostStatus(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminUpdateCommunityPostSchema)) input: AdminUpdateCommunityPostInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.adminUpdatePostStatus(publicId, input, user.id);
  }

  @Delete("posts/:publicId")
  @ApiOperation({ summary: "Xoá bài đăng cộng đồng" })
  @ApiResponse({ status: 200, description: "Xoá thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  async deletePost(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.communityService.adminDeletePost(publicId, user.id);
    return { success: true };
  }

  // ── Guestbook ─────────────────────────────────────────────────────

  @Get("guestbook")
  @UsePipes(ZodValidate(guestbookQuerySchema))
  @ApiOperation({ summary: "Danh sách sổ lưu bút (quản trị)" })
  @ApiResponse({ status: 200, description: "Lấy danh sách thành công" })
  listGuestbook(@Query() query: GuestbookQuery) {
    return this.communityService.adminListGuestbook(query);
  }

  @Get("guestbook/:publicId")
  @ApiOperation({ summary: "Chi tiết sổ lưu bút (quản trị)" })
  @ApiResponse({ status: 200, description: "Chi tiết bản ghi" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  getGuestbookEntry(@Param("publicId") publicId: string) {
    return this.communityService.adminGetGuestbookEntry(publicId);
  }

  @Post("guestbook")
  @ApiOperation({ summary: "Tạo bản ghi sổ lưu bút" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createGuestbookEntry(
    @Body(ZodValidate(createGuestbookEntrySchema)) input: CreateGuestbookEntryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.adminCreateGuestbookEntry(input, user.id);
  }

  @Patch("guestbook/:publicId")
  @ApiOperation({ summary: "Duyệt / từ chối sổ lưu bút" })
  @ApiResponse({ status: 200, description: "Cập nhật thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  updateGuestbookStatus(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminUpdateGuestbookSchema)) input: AdminUpdateGuestbookInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.adminUpdateGuestbookStatus(publicId, input, user.id);
  }

  @Delete("guestbook/:publicId")
  @ApiOperation({ summary: "Xoá bản ghi sổ lưu bút" })
  @ApiResponse({ status: 200, description: "Xoá thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  async deleteGuestbookEntry(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.communityService.adminDeleteGuestbookEntry(publicId, user.id);
    return { success: true };
  }
}
