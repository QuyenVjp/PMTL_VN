import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { EngagementService } from "./engagement.service.js";
import { DailyGongkeService } from "./daily-gongke.service.js";
import { RepentanceService } from "./repentance.service.js";
import { LittleHouseService } from "./little-house.service.js";
import { PracticeProfileService, updatePracticeProfileSchema, type UpdatePracticeProfileInput } from "./practice-profile.service.js";
import { ActivationService } from "./activation.service.js";
import { MeritDashboardService } from "./merit-dashboard.service.js";
import {
  toggleReactionSchema,
  toggleBookmarkSchema,
  getBookmarksQuerySchema,
  type ToggleReactionInput,
  type ToggleBookmarkInput,
  type GetBookmarksQuery,
} from "./engagement.schemas.js";
import {
  upsertDailyGongkeSchema,
  dailyGongkeQuerySchema,
  type UpsertDailyGongkeInput,
  type DailyGongkeQuery,
} from "./daily-gongke.schemas.js";
import {
  upsertRepentanceSchema,
  repentanceQuerySchema,
  type UpsertRepentanceInput,
  type RepentanceQuery,
} from "./repentance.schemas.js";
import {
  createLittleHouseSchema,
  advanceLittleHouseSchema,
  littleHouseQuerySchema,
  type CreateLittleHouseInput,
  type AdvanceLittleHouseInput,
  type LittleHouseQuery,
} from "./little-house.schemas.js";
import {
  createActivationLogSchema,
  activationLogQuerySchema,
  type CreateActivationLogInput,
  type ActivationLogQuery,
} from "./activation.schemas.js";

// ─── Existing: Reactions & Bookmarks ────────────────────────────────────────

@ApiTags("engagement")
@Controller("engagement")
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post("reactions")
  @ApiOperation({ summary: "Toggle reaction (like, pray, inspire, gratitude)" })
  @ApiResponse({ status: 200, description: "Reaction toggled" })
  toggleReaction(
    @Body(ZodValidate(toggleReactionSchema)) input: ToggleReactionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.engagementService.toggleReaction(input, user.id);
  }

  @Post("bookmarks")
  @ApiOperation({ summary: "Toggle bookmark" })
  @ApiResponse({ status: 200, description: "Bookmark toggled" })
  toggleBookmark(
    @Body(ZodValidate(toggleBookmarkSchema)) input: ToggleBookmarkInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.engagementService.toggleBookmark(input, user.id);
  }

  @Get("bookmarks")
  @ApiOperation({ summary: "Lấy danh sách bookmark của user" })
  @ApiResponse({ status: 200, description: "Danh sách bookmark" })
  getBookmarks(
    @Query(ZodValidate(getBookmarksQuerySchema)) query: GetBookmarksQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.engagementService.getBookmarks(user.id, query);
  }
}

// ─── Module 3: DailyGongkeTracker ───────────────────────────────────────────

@ApiTags("me-gongke")
@Controller("me/gongke")
export class DailyGongkeController {
  constructor(private readonly gongkeService: DailyGongkeService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách nhật ký công khóa" })
  listLogs(
    @Query(ZodValidate(dailyGongkeQuerySchema)) query: DailyGongkeQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gongkeService.listLogs(user.id, query);
  }

  @Get(":date")
  @ApiOperation({ summary: "Nhật ký công khóa theo ngày (YYYY-MM-DD)" })
  @ApiParam({ name: "date", example: "2026-03-29" })
  getLog(@Param("date") date: string, @CurrentUser() user: AuthenticatedUser) {
    return this.gongkeService.getLog(user.id, date);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Ghi / cập nhật công khóa hôm nay (upsert theo ngày)" })
  upsertLog(
    @Body(ZodValidate(upsertDailyGongkeSchema)) input: UpsertDailyGongkeInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gongkeService.upsertLog(input, user.id);
  }
}

// ─── Module 4: RepentanceJournal ─────────────────────────────────────────────

@ApiTags("me-repentance")
@Controller("me/repentance")
export class RepentanceController {
  constructor(private readonly repentanceService: RepentanceService) {}

  @Get()
  @ApiOperation({ summary: "Nhật ký sám hối (private)" })
  listLogs(
    @Query(ZodValidate(repentanceQuerySchema)) query: RepentanceQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repentanceService.listLogs(user.id, query);
  }

  @Get(":date")
  @ApiOperation({ summary: "Sám hối theo ngày (YYYY-MM-DD)" })
  @ApiParam({ name: "date", example: "2026-03-29" })
  getLog(@Param("date") date: string, @CurrentUser() user: AuthenticatedUser) {
    return this.repentanceService.getLog(user.id, date);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Ghi / cập nhật sám hối (upsert theo ngày)" })
  upsertLog(
    @Body(ZodValidate(upsertRepentanceSchema)) input: UpsertRepentanceInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repentanceService.upsertLog(input, user.id);
  }
}

// ─── Module 1: LittleHouseLifecycle ──────────────────────────────────────────

@ApiTags("me-little-house")
@Controller("me/little-house")
export class LittleHouseController {
  constructor(private readonly littleHouseService: LittleHouseService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách ngôi nhà nhỏ" })
  list(
    @Query(ZodValidate(littleHouseQuerySchema)) query: LittleHouseQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.littleHouseService.list(user.id, query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết ngôi nhà nhỏ" })
  @ApiParam({ name: "publicId" })
  getOne(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.littleHouseService.getOne(publicId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo ngôi nhà nhỏ mới (bắt đầu ở DRAFT)" })
  create(
    @Body(ZodValidate(createLittleHouseSchema)) input: CreateLittleHouseInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.littleHouseService.create(input, user.id);
  }

  @Post("advance")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Chuyển trạng thái ngôi nhà nhỏ (SIGNED/CHANTED/BURNED)" })
  advance(
    @Body(ZodValidate(advanceLittleHouseSchema)) input: AdvanceLittleHouseInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.littleHouseService.advance(input, user.id);
  }
}

// ─── Module 6: ElderlyPracticeMode ───────────────────────────────────────────

@ApiTags("me-practice-profile")
@Controller("me/practice-profile")
export class PracticeProfileController {
  constructor(private readonly profileService: PracticeProfileService) {}

  @Get()
  @ApiOperation({ summary: "Lấy profile tu học (chế độ cao niên, hỗ trợ)" })
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getOrCreate(user.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cập nhật chế độ tu học (elderly mode, assist mode)" })
  update(
    @Body(ZodValidate(updatePracticeProfileSchema)) input: UpdatePracticeProfileInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profileService.update(input, user.id);
  }
}

// ─── Module 7: LinhTinhActivationGuard ───────────────────────────────────────

@ApiTags("me-activation")
@Controller("me/activation")
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @Get()
  @ApiOperation({ summary: "Nhật ký triệu chứng (linh tinh)" })
  listLogs(
    @Query(ZodValidate(activationLogQuerySchema)) query: ActivationLogQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.activationService.listLogs(user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Ghi triệu chứng + nhận gợi ý lane thực hành (advisory)" })
  createLog(
    @Body(ZodValidate(createActivationLogSchema)) input: CreateActivationLogInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.activationService.createLog(input, user.id);
  }
}

// ─── Module 8: PersonalMeritDashboard ────────────────────────────────────────

@ApiTags("me-dashboard")
@Controller("me/dashboard")
export class MeritDashboardController {
  constructor(private readonly dashboardService: MeritDashboardService) {}

  @Get("merit-summary")
  @ApiOperation({ summary: "Tóm tắt công đức cá nhân (5 pháp bảo lanes, private)" })
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getSummary(user.id);
  }
}
