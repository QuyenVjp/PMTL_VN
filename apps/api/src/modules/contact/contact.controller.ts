import { Controller, Get, Post, Body, Param, Query, UsePipes, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { ContactService } from "./contact.service.js";
import {
  submitContactSchema,
  contactQuerySchema,
  type SubmitContactInput,
  type ContactQuery,
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
  @UsePipes(ZodValidate(contactQuerySchema))
  @ApiOperation({ summary: "Danh sách liên hệ (admin)" })
  @ApiResponse({ status: 200, description: "Danh sách liên hệ" })
  list(@Query() query: ContactQuery) {
    return this.contactService.listContacts(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết liên hệ (admin)" })
  @ApiResponse({ status: 200, description: "Chi tiết liên hệ" })
  getById(@Param("id") id: string) {
    return this.contactService.getContactById(id);
  }
}
