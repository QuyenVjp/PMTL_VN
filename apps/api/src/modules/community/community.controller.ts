import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
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
  createVolunteerSchema,
  updateVolunteerSchema,
  volunteerQuerySchema,
  createCommentSchema,
  commentQuerySchema,
  createReportSchema,
  createTestimonialSchema,
  testimonialQuerySchema,
  type CreateCommunityPostInput,
  type CommunityPostQuery,
  type AdminUpdateCommunityPostInput,
  type CreateGuestbookEntryInput,
  type GuestbookQuery,
  type AdminUpdateGuestbookInput,
  type CreateVolunteerInput,
  type UpdateVolunteerInput,
  type VolunteerQuery,
  type CreateCommentInput,
  type CommentQuery,
  type CreateReportInput,
  type CreateTestimonialInput,
  type TestimonialQuery,
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
  @RateLimit("community.post")
  @ApiOperation({ summary: "Tạo bài đăng cộng đồng" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createPost(
    @Body(ZodValidate(createCommunityPostSchema)) input: CreateCommunityPostInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.createPost(input, user.id);
  }

  @Post("posts/:publicId/heart")
  @RateLimit("community.post")
  @ApiOperation({ summary: "Thả / bỏ tim bài đăng" })
  @ApiResponse({ status: 200, description: "Cập nhật tim thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài đăng" })
  toggleHeart(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.toggleHeart(publicId, user.id);
  }

  @Get("posts/:publicId/comments")
  @Public()
  @ApiOperation({ summary: "Danh sách bình luận bài đăng" })
  @ApiResponse({ status: 200, description: "Lấy danh sách bình luận thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài đăng" })
  listComments(
    @Param("publicId") publicId: string,
    @Query(ZodValidate(commentQuerySchema)) query: CommentQuery,
  ) {
    return this.communityService.listComments(publicId, query);
  }

  @Post("posts/:publicId/comments")
  @RateLimit("community.post")
  @ApiOperation({ summary: "Bình luận bài đăng" })
  @ApiResponse({ status: 201, description: "Bình luận thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài đăng" })
  createComment(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(createCommentSchema)) input: CreateCommentInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.createComment(publicId, input, user.id);
  }

  @Post("posts/:publicId/report")
  @RateLimit("community.post")
  @ApiOperation({ summary: "Báo cáo bài đăng" })
  @ApiResponse({ status: 201, description: "Báo cáo thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài đăng" })
  reportPost(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(createReportSchema)) input: CreateReportInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.reportPost(publicId, input, user.id);
  }

  // ── Testimonials ──────────────────────────────────────────────────────────

  @Get("testimonials")
  @Public()
  @ApiOperation({ summary: "Danh sách bài chia sẻ phụng sự viên" })
  @ApiResponse({ status: 200, description: "Danh sách testimonials" })
  listTestimonials(@Query(ZodValidate(testimonialQuerySchema)) query: TestimonialQuery) {
    return this.communityService.listTestimonials(query);
  }

  @Post("testimonials")
  @RateLimit("community.post")
  @ApiOperation({ summary: "Đăng bài chia sẻ — tự động chèn miễn trừ trách nhiệm cho phụng sự viên" })
  @ApiResponse({ status: 201, description: "Bài chia sẻ đã được đăng" })
  @ApiResponse({ status: 400, description: "Nội dung không hợp lệ hoặc chưa xác nhận disclaimer" })
  createTestimonial(
    @Body(ZodValidate(createTestimonialSchema)) input: CreateTestimonialInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.createTestimonial(input, user.id);
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

  @Post("posts/:publicId/pin")
  @ApiOperation({ summary: "Ghim bài đăng" })
  @ApiResponse({ status: 200, description: "Ghim thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  pinPost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminPinPost(publicId, user.id);
  }

  @Post("posts/:publicId/unpin")
  @ApiOperation({ summary: "Bỏ ghim bài đăng" })
  @ApiResponse({ status: 200, description: "Bỏ ghim thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  unpinPost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminUnpinPost(publicId, user.id);
  }

  @Post("posts/:publicId/hide")
  @ApiOperation({ summary: "Ẩn bài đăng" })
  @ApiResponse({ status: 200, description: "Ẩn thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  hidePost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminHidePost(publicId, user.id);
  }

  @Post("posts/:publicId/restore")
  @ApiOperation({ summary: "Khôi phục bài đăng" })
  @ApiResponse({ status: 200, description: "Khôi phục thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  restorePost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminRestorePost(publicId, user.id);
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

  // ── Volunteers ────────────────────────────────────────────────────────

  @Get("volunteers")
  @UsePipes(ZodValidate(volunteerQuerySchema))
  @ApiOperation({ summary: "Danh sách tình nguyện viên (quản trị)" })
  @ApiResponse({ status: 200, description: "Lấy danh sách thành công" })
  listVolunteers(@Query() query: VolunteerQuery) {
    return this.communityService.adminListVolunteers(query);
  }

  @Post("volunteers")
  @ApiOperation({ summary: "Tạo tình nguyện viên" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createVolunteer(
    @Body(ZodValidate(createVolunteerSchema)) input: CreateVolunteerInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.adminCreateVolunteer(input, user.id);
  }

  @Get("volunteers/:publicId")
  @ApiOperation({ summary: "Chi tiết tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Chi tiết tình nguyện viên" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  getVolunteer(@Param("publicId") publicId: string) {
    return this.communityService.adminGetVolunteer(publicId);
  }

  @Patch("volunteers/:publicId")
  @ApiOperation({ summary: "Cập nhật tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Cập nhật thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  updateVolunteer(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateVolunteerSchema)) input: UpdateVolunteerInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.adminUpdateVolunteer(publicId, input, user.id);
  }

  @Delete("volunteers/:publicId")
  @ApiOperation({ summary: "Xoá tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Xoá thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  async deleteVolunteer(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.communityService.adminDeleteVolunteer(publicId, user.id);
    return { success: true };
  }

  @Post("volunteers/:publicId/activate")
  @ApiOperation({ summary: "Kích hoạt tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Kích hoạt thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  activateVolunteer(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminActivateVolunteer(publicId, user.id);
  }

  @Post("volunteers/:publicId/deactivate")
  @ApiOperation({ summary: "Vô hiệu hoá tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Vô hiệu hoá thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy" })
  deactivateVolunteer(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityService.adminDeactivateVolunteer(publicId, user.id);
  }
}

@ApiTags("guestbook")
@Controller("guestbook")
export class GuestbookController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Danh sách sổ lưu bút công khai" })
  @ApiResponse({ status: 200, description: "Lấy danh sách thành công" })
  listGuestbook(@Query(ZodValidate(guestbookQuerySchema)) query: GuestbookQuery) {
    return this.communityService.publicListGuestbook(query);
  }

  @Post()
  @RateLimit("community.post")
  @ApiOperation({ summary: "Gửi lưu bút" })
  @ApiResponse({ status: 201, description: "Gửi lưu bút thành công" })
  createGuestbookEntry(
    @Body(ZodValidate(createGuestbookEntrySchema)) input: CreateGuestbookEntryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.communityService.publicCreateGuestbookEntry(input, user.id);
  }
}
