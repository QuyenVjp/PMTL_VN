import { Controller, Get, Post, Body, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { EngagementService } from "./engagement.service.js";
import {
  toggleReactionSchema,
  toggleBookmarkSchema,
  type ToggleReactionInput,
  type ToggleBookmarkInput,
} from "./engagement.schemas.js";

@ApiTags("engagement")
@Controller("engagement")
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post("reactions")
  @UsePipes(ZodValidate(toggleReactionSchema))
  @ApiOperation({ summary: "Toggle reaction (like, pray, inspire, gratitude)" })
  @ApiResponse({ status: 200, description: "Reaction toggled" })
  toggleReaction(
    @Body() input: ToggleReactionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.engagementService.toggleReaction(input, user.id);
  }

  @Post("bookmarks")
  @UsePipes(ZodValidate(toggleBookmarkSchema))
  @ApiOperation({ summary: "Toggle bookmark" })
  @ApiResponse({ status: 200, description: "Bookmark toggled" })
  toggleBookmark(
    @Body() input: ToggleBookmarkInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.engagementService.toggleBookmark(input, user.id);
  }

  @Get("bookmarks")
  @ApiOperation({ summary: "Lấy danh sách bookmark của user" })
  @ApiResponse({ status: 200, description: "Danh sách bookmark" })
  getBookmarks(@CurrentUser() user: AuthenticatedUser) {
    return this.engagementService.getBookmarks(user.id);
  }
}
