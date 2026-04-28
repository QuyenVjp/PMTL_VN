import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import {
  createLifeReleaseFaqSchema,
  createLifeReleaseGuideSchema,
  createLifeReleaseVariantSchema,
  lifeReleaseGuideGroupSchema,
  publishLifeReleaseSchema,
  type CreateLifeReleaseFaqInput,
  type CreateLifeReleaseGuideInput,
  type CreateLifeReleaseVariantInput,
  type LifeReleaseGuideGroup,
  type PublishLifeReleaseInput,
  type UpdateLifeReleaseFaqInput,
  type UpdateLifeReleaseGuideInput,
  type UpdateLifeReleaseVariantInput,
  updateLifeReleaseFaqSchema,
  updateLifeReleaseGuideSchema,
  updateLifeReleaseVariantSchema,
} from "./life-release.schemas.js";
import { LifeReleaseContentService } from "./life-release.service.js";

@ApiTags("life-release-content")
@Controller()
export class LifeReleaseContentController {
  constructor(private readonly lifeReleaseService: LifeReleaseContentService) {}

  @Get("content/hub-pages/phong-sanh")
  @Public()
  @ApiOperation({ summary: "Hub page aggregate cho Phóng sanh" })
  getHubPage() {
    return this.lifeReleaseService.getHubPage();
  }

  @Get("content/life-release/guide-map")
  @Public()
  getGuideMap() {
    return this.lifeReleaseService.getGuideMap();
  }

  @Get("content/life-release/guides")
  @Public()
  getGuides() {
    return this.lifeReleaseService.getGuides();
  }

  @Get("content/life-release/guides/:slug")
  @Public()
  getGuideBySlug(@Param("slug") slug: string) {
    return this.lifeReleaseService.getGuideBySlug(slug);
  }

  @Get("content/life-release/groups/:groupKey")
  @Public()
  getGuideGroup(@Param("groupKey", ZodValidate(lifeReleaseGuideGroupSchema)) groupKey: LifeReleaseGuideGroup) {
    return this.lifeReleaseService.getGuideGroup(groupKey);
  }

  @Get("content/life-release/ritual-variants")
  @Public()
  getRitualVariants() {
    return this.lifeReleaseService.getRitualVariants();
  }

  @Get("content/life-release/faq")
  @Public()
  getFaq() {
    return this.lifeReleaseService.getFaq();
  }

  @Get("content/life-release/downloads")
  @Public()
  getDownloads() {
    return this.lifeReleaseService.getDownloads();
  }
}

@ApiTags("admin-life-release-content")
@Controller("admin/content/life-release")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminLifeReleaseContentController {
  constructor(private readonly lifeReleaseService: LifeReleaseContentService) {}

  @Get("overview")
  @ApiResponse({ status: 200, description: "Overview editor workspace Phóng sanh" })
  adminGetOverview() {
    return this.lifeReleaseService.adminGetOverview();
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  adminCreateGuide(
    @Body(ZodValidate(createLifeReleaseGuideSchema)) input: CreateLifeReleaseGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminCreateGuide(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("guides/:publicId")
  adminUpdateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLifeReleaseGuideSchema)) input: UpdateLifeReleaseGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminUpdateGuide(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("guides/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteGuide(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.lifeReleaseService.adminDeleteGuide(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("ritual-variants")
  @HttpCode(HttpStatus.CREATED)
  adminCreateVariant(
    @Body(ZodValidate(createLifeReleaseVariantSchema)) input: CreateLifeReleaseVariantInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminCreateVariant(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("ritual-variants/:publicId")
  adminUpdateVariant(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLifeReleaseVariantSchema)) input: UpdateLifeReleaseVariantInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminUpdateVariant(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("ritual-variants/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteVariant(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.lifeReleaseService.adminDeleteVariant(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("faq")
  @HttpCode(HttpStatus.CREATED)
  adminCreateFaq(
    @Body(ZodValidate(createLifeReleaseFaqSchema)) input: CreateLifeReleaseFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminCreateFaq(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("faq/:publicId")
  adminUpdateFaq(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLifeReleaseFaqSchema)) input: UpdateLifeReleaseFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminUpdateFaq(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("faq/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteFaq(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.lifeReleaseService.adminDeleteFaq(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("publish")
  @HttpCode(HttpStatus.OK)
  adminPublish(
    @Body(ZodValidate(publishLifeReleaseSchema)) input: PublishLifeReleaseInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lifeReleaseService.adminPublish(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
