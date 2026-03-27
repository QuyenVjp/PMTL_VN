import { Controller, Get, Post, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { CalendarService } from "./calendar.service.js";
import {
  createEventSchema,
  eventQuerySchema,
  type CreateEventInput,
  type EventQuery,
} from "./calendar.schemas.js";

@ApiTags("calendar")
@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("events")
  @Public()
  @UsePipes(ZodValidate(eventQuerySchema))
  @ApiOperation({ summary: "Danh sách sự kiện" })
  @ApiResponse({ status: 200, description: "Lấy danh sách sự kiện" })
  listEvents(@Query() query: EventQuery) {
    return this.calendarService.listEvents(query);
  }

  @Get("events/:id")
  @Public()
  @ApiOperation({ summary: "Chi tiết sự kiện" })
  @ApiResponse({ status: 200, description: "Chi tiết sự kiện" })
  getEvent(@Param("id") id: string) {
    return this.calendarService.getEventById(id);
  }

  @Post("events")
  @UsePipes(ZodValidate(createEventSchema))
  @ApiOperation({ summary: "Tạo sự kiện mới" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  createEvent(
    @Body() input: CreateEventInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.calendarService.createEvent(input, user.id);
  }

  @Get("advisory/rule-packs/q161")
  @Public()
  @ApiOperation({ summary: "Lấy advisory rule-pack Q161 cho calendar compose layer" })
  @ApiResponse({ status: 200, description: "Q161 advisory rule-pack" })
  getQ161RulePack() {
    return this.calendarService.getQ161RulePack();
  }

  @Get("advisory/runtime-status")
  @Public()
  @ApiOperation({ summary: "Trạng thái runtime advisory (uncached lane)" })
  @ApiResponse({ status: 200, description: "Runtime advisory status" })
  getAdvisoryRuntimeStatus() {
    return this.calendarService.getAdvisoryRuntimeStatus();
  }
}
