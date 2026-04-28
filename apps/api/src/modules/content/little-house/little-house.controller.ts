import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../../common/decorators/current-user.decorator.js";
import { Roles } from "../../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../../common/auth/auth-request.types.js";
import { ZodValidate } from "../../../common/validation/zod-validation.pipe.js";
import {
  createLittleHouseCaseVariantSchema,
  createLittleHouseFaqSchema,
  createLittleHouseGuideSchema,
  littleHouseGuideGroupSchema,
  publishLittleHouseSchema,
  type CreateLittleHouseCaseVariantInput,
  type CreateLittleHouseFaqInput,
  type CreateLittleHouseGuideInput,
  type LittleHouseGuideGroup,
  type PublishLittleHouseInput,
  type UpdateLittleHouseCaseVariantInput,
  type UpdateLittleHouseFaqInput,
  type UpdateLittleHouseGuideInput,
  updateLittleHouseCaseVariantSchema,
  updateLittleHouseFaqSchema,
  updateLittleHouseGuideSchema,
} from "./little-house.schemas.js";
import { LittleHouseService } from "./little-house.service.js";

@ApiTags("little-house-content")
@Controller()
export class LittleHouseController {
  constructor(private readonly littleHouseService: LittleHouseService) {}

  @Get("content/hub-pages/ngoi-nha-nho")
  @Public()
  @ApiOperation({ summary: "Hub page aggregate cho Ngôi Nhà Nhỏ" })
  getHubPage() {
    return this.littleHouseService.getHubPage();
  }

  @Get("content/little-house/guide-map")
  @Public()
  getGuideMap() {
    return this.littleHouseService.getGuideMap();
  }

  @Get("content/little-house/guides")
  @Public()
  getGuides() {
    return this.littleHouseService.getGuides();
  }

  @Get("content/little-house/guides/:slug")
  @Public()
  getGuideBySlug(@Param("slug") slug: string) {
    return this.littleHouseService.getGuideBySlug(slug);
  }

  @Get("content/little-house/groups/:groupKey")
  @Public()
  getGuideGroup(@Param("groupKey", ZodValidate(littleHouseGuideGroupSchema)) groupKey: LittleHouseGuideGroup) {
    return this.littleHouseService.getGuideGroup(groupKey);
  }

  @Get("content/little-house/case-variants")
  @Public()
  getCaseVariants() {
    return this.littleHouseService.getCaseVariants();
  }

  @Get("content/little-house/faq")
  @Public()
  getFaq() {
    return this.littleHouseService.getFaq();
  }

  @Get("content/little-house/downloads")
  @Public()
  getDownloads() {
    return this.littleHouseService.getDownloads();
  }
}

@ApiTags("admin-little-house-content")
@Controller("admin/content/little-house")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminLittleHouseController {
  constructor(private readonly littleHouseService: LittleHouseService) {}

  @Get("overview")
  @ApiResponse({ status: 200, description: "Overview editor workspace Ngôi Nhà Nhỏ" })
  adminGetOverview() {
    return this.littleHouseService.adminGetOverview();
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  adminCreateGuide(
    @Body(ZodValidate(createLittleHouseGuideSchema)) input: CreateLittleHouseGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminCreateGuide(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("guides/:publicId")
  adminUpdateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLittleHouseGuideSchema)) input: UpdateLittleHouseGuideInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminUpdateGuide(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("guides/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteGuide(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.littleHouseService.adminDeleteGuide(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("case-variants")
  @HttpCode(HttpStatus.CREATED)
  adminCreateCaseVariant(
    @Body(ZodValidate(createLittleHouseCaseVariantSchema)) input: CreateLittleHouseCaseVariantInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminCreateCaseVariant(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("case-variants/:publicId")
  adminUpdateCaseVariant(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLittleHouseCaseVariantSchema)) input: UpdateLittleHouseCaseVariantInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminUpdateCaseVariant(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("case-variants/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteCaseVariant(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.littleHouseService.adminDeleteCaseVariant(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("faq")
  @HttpCode(HttpStatus.CREATED)
  adminCreateFaq(
    @Body(ZodValidate(createLittleHouseFaqSchema)) input: CreateLittleHouseFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminCreateFaq(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch("faq/:publicId")
  adminUpdateFaq(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateLittleHouseFaqSchema)) input: UpdateLittleHouseFaqInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminUpdateFaq(publicId, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("faq/:publicId")
  @HttpCode(HttpStatus.OK)
  adminDeleteFaq(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.littleHouseService.adminDeleteFaq(publicId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("publish")
  @HttpCode(HttpStatus.OK)
  adminPublish(
    @Body(ZodValidate(publishLittleHouseSchema)) input: PublishLittleHouseInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.littleHouseService.adminPublish(input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
