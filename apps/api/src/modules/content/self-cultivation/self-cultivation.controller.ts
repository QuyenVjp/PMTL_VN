import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import {
  createSelfCultivationFaqSchema,
  createSelfCultivationGuideSchema,
  publishSelfCultivationSchema,
  selfCultivationGuideGroupSchema,
  type CreateSelfCultivationFaqInput,
  type CreateSelfCultivationGuideInput,
  type PublishSelfCultivationInput,
  type SelfCultivationGuideGroup,
  type UpdateSelfCultivationFaqInput,
  type UpdateSelfCultivationGuideInput,
  updateSelfCultivationFaqSchema,
  updateSelfCultivationGuideSchema,
} from "./self-cultivation.schemas.js";
import { SelfCultivationService } from "./self-cultivation.service.js";

@ApiTags("self-cultivation")
@Controller()
export class SelfCultivationController {
  constructor(private readonly selfCultivationService: SelfCultivationService) {}

  @Get("content/hub-pages/kinh-van-tu-tu")
  @Public()
  @ApiOperation({ summary: "Hub page aggregate cho Kinh văn tự tu" })
  getHubPage() {
    return this.selfCultivationService.getHubPage();
  }

  @Get("content/self-cultivation/guide-map")
  @Public()
  @ApiOperation({ summary: "Guide map public cho Kinh văn tự tu" })
  getGuideMap() {
    return this.selfCultivationService.getGuideMap();
  }

  @Get("content/self-cultivation/slug-check")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Kiểm tra slug self-cultivation guide có bị trùng không" })
  checkGuideSlug(
    @Query("slug") slug: string,
    @Query("excludeSlug") excludeSlug?: string,
  ) {
    return this.selfCultivationService.checkGuideSlugAvailability(slug, excludeSlug);
  }

  @Get("content/self-cultivation/guides")
  @Public()
  getGuides() {
    return this.selfCultivationService.getGuides();
  }

  @Get("content/self-cultivation/guides/:slug")
  @Public()
  getGuideBySlug(@Param("slug") slug: string) {
    return this.selfCultivationService.getGuideBySlug(slug);
  }

  @Get("content/self-cultivation/groups/:groupKey")
  @Public()
  getGuideGroup(@Param("groupKey", ZodValidate(selfCultivationGuideGroupSchema)) groupKey: SelfCultivationGuideGroup) {
    return this.selfCultivationService.getGuideGroup(groupKey);
  }

  @Get("content/self-cultivation/faq")
  @Public()
  getFaq() {
    return this.selfCultivationService.getFaq();
  }

  @Get("content/self-cultivation/downloads")
  @Public()
  getDownloads() {
    return this.selfCultivationService.getDownloads();
  }
}

@ApiTags("admin-self-cultivation")
@Controller("admin/content/self-cultivation")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminSelfCultivationController {
  constructor(private readonly selfCultivationService: SelfCultivationService) {}

  @Get("overview")
  @ApiResponse({ status: 200, description: "Overview editor workspace Kinh văn tự tu" })
  adminGetOverview() {
    return this.selfCultivationService.adminGetOverview();
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  adminCreateGuide(
    @Body(ZodValidate(createSelfCultivationGuideSchema)) input: CreateSelfCultivationGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.selfCultivationService.adminCreateGuide(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("guides/:publicId")
  adminUpdateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateSelfCultivationGuideSchema)) input: UpdateSelfCultivationGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.selfCultivationService.adminUpdateGuide(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("faq")
  @HttpCode(HttpStatus.CREATED)
  adminCreateFaq(
    @Body(ZodValidate(createSelfCultivationFaqSchema)) input: CreateSelfCultivationFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.selfCultivationService.adminCreateFaq(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("faq/:publicId")
  adminUpdateFaq(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateSelfCultivationFaqSchema)) input: UpdateSelfCultivationFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.selfCultivationService.adminUpdateFaq(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Publish hoặc unpublish workspace Kinh văn tự tu" })
  adminPublish(
    @Body(ZodValidate(publishSelfCultivationSchema)) input: PublishSelfCultivationInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.selfCultivationService.adminPublish(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
