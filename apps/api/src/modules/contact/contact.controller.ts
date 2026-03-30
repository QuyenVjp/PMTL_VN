import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { ContactService } from "./contact.service.js";
import {
  submitContactSchema,
  contactQuerySchema,
  volunteerQuerySchema,
  createVolunteerSchema,
  updateVolunteerSchema,
  updateContactInfoSchema,
  type SubmitContactInput,
  type ContactQuery,
  type VolunteerQuery,
  type CreateVolunteerInput,
  type UpdateVolunteerInput,
  type UpdateContactInfoInput,
} from "./contact.schemas.js";

@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidate(submitContactSchema))
  @ApiOperation({ summary: "Gửi liên hệ / phản hồi" })
  @ApiResponse({ status: 201, description: "Đã gửi thành công" })
  submit(@Body() input: SubmitContactInput) {
    return this.contactService.submit(input);
  }

  @Get()
  @Roles("ADMIN", "SUPER_ADMIN")
  @UsePipes(ZodValidate(contactQuerySchema))
  @ApiOperation({ summary: "Danh sách liên hệ (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách liên hệ" })
  list(@Query() query: ContactQuery) {
    return this.contactService.listContacts(query);
  }

  @Get(":publicId")
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Chi tiết liên hệ (admin)" })
  @ApiResponse({ status: 200, description: "Chi tiết liên hệ" })
  getById(@Param("publicId") publicId: string) {
    return this.contactService.getContactById(publicId);
  }
}

@ApiTags("admin-volunteers")
@Controller("admin/volunteers")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminVolunteerController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @UsePipes(ZodValidate(volunteerQuerySchema))
  @ApiOperation({ summary: "Danh sách tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Danh sách tình nguyện viên" })
  list(@Query() query: VolunteerQuery) {
    return this.contactService.adminListVolunteers(query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Chi tiết tình nguyện viên" })
  getByPublicId(@Param("publicId") publicId: string) {
    return this.contactService.adminGetVolunteer(publicId);
  }

  @Post()
  @ApiOperation({ summary: "Tạo tình nguyện viên" })
  @ApiResponse({ status: 201, description: "Đã tạo tình nguyện viên" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(createVolunteerSchema)) input: CreateVolunteerInput,
  ) {
    return this.contactService.adminCreateVolunteer(input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Patch(":publicId")
  @ApiOperation({ summary: "Cập nhật tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Đã cập nhật tình nguyện viên" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateVolunteerSchema)) input: UpdateVolunteerInput,
  ) {
    return this.contactService.adminUpdateVolunteer(publicId, input, {
      actorId: user.id,
      actorType: "user",
    });
  }

  @Delete(":publicId")
  @ApiOperation({ summary: "Xoá tình nguyện viên" })
  @ApiResponse({ status: 200, description: "Đã xoá tình nguyện viên" })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("publicId") publicId: string,
  ) {
    return this.contactService.adminDeleteVolunteer(publicId, {
      actorId: user.id,
      actorType: "user",
    });
  }
}

@ApiTags("admin-contact-info")
@Controller("admin/contact-info")
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminContactInfoController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: "Thông tin liên hệ" })
  @ApiResponse({ status: 200, description: "Thông tin liên hệ" })
  get() {
    return this.contactService.adminGetContactInfo();
  }

  @Patch()
  @ApiOperation({ summary: "Cập nhật thông tin liên hệ" })
  @ApiResponse({ status: 200, description: "Đã cập nhật thông tin liên hệ" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(updateContactInfoSchema)) input: UpdateContactInfoInput,
  ) {
    return this.contactService.adminUpdateContactInfo(input, {
      actorId: user.id,
      actorType: "user",
    });
  }
}
