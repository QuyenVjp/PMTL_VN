import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { DailyRecitationService } from "./daily-recitation.service.js";
import {
  createGuidelineSchema,
  createRoutineSchema,
  createScheduleSchema,
  listGuidelinesSchema,
  listSchedulesSchema,
  updateScheduleSchema,
  type CreateGuidelineInput,
  type CreateRoutineInput,
  type CreateScheduleInput,
  type ListGuidelinesQuery,
  type ListSchedulesQuery,
  type UpdateScheduleInput,
} from "./daily-recitation.schemas.js";

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags("admin-daily-recitation")
@Controller("admin/daily-recitation")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDailyRecitationController {
  constructor(private readonly service: DailyRecitationService) {}

  // ── Overview ─────────────────────────────────────────────────────────────

  @Get("overview")
  @ApiOperation({ summary: "Tổng quan quản trị thời khóa tụng kinh" })
  async getOverview() {
    return this.service.getOverview();
  }

  // ── Schedules ─────────────────────────────────────────────────────────────

  @Get("schedules")
  @ApiOperation({ summary: "Danh sách thời khóa tụng kinh (admin)" })
  async listSchedules(@Query(ZodValidate(listSchedulesSchema)) query: ListSchedulesQuery) {
    return this.service.listSchedules(query);
  }

  @Get("schedules/:publicId")
  @ApiOperation({ summary: "Chi tiết thời khóa tụng kinh (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getSchedule(@Param("publicId") publicId: string) {
    return this.service.getSchedule(publicId);
  }

  @Post("schedules")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo thời khóa tụng kinh" })
  async createSchedule(@Body(ZodValidate(createScheduleSchema)) input: CreateScheduleInput) {
    return this.service.createSchedule(input);
  }

  @Patch("schedules/:publicId")
  @ApiOperation({ summary: "Cập nhật thời khóa tụng kinh" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateSchedule(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateScheduleSchema)) input: UpdateScheduleInput,
  ) {
    return this.service.updateSchedule(publicId, input);
  }

  // ── Guidelines ────────────────────────────────────────────────────────────

  @Get("guidelines")
  @ApiOperation({ summary: "Danh sách hướng dẫn tụng kinh (admin)" })
  async listGuidelines(@Query(ZodValidate(listGuidelinesSchema)) query: ListGuidelinesQuery) {
    return this.service.listGuidelines(query);
  }

  @Post("guidelines")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hướng dẫn tụng kinh" })
  async createGuideline(@Body(ZodValidate(createGuidelineSchema)) input: CreateGuidelineInput) {
    return this.service.createGuideline(input);
  }

  // ── Routines ──────────────────────────────────────────────────────────────

  @Get("routines")
  @ApiOperation({ summary: "Danh sách thời khóa hằng ngày (admin)" })
  async listRoutines() {
    return this.service.listRoutines();
  }

  @Post("routines")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo thời khóa hằng ngày" })
  async createRoutine(@Body(ZodValidate(createRoutineSchema)) input: CreateRoutineInput) {
    return this.service.createRoutine(input);
  }
}
