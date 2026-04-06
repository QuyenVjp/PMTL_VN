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
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { z } from "zod";
import { nanoid } from "nanoid";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { RecitationDifficulty, RecitationStatus, GuidelineImportance, Prisma } from "../../generated/prisma/client.js";

// ── Schemas ──────────────────────────────────────────────────────────────────

const listSchedulesSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
type ListSchedulesQuery = z.infer<typeof listSchedulesSchema>;

const createScheduleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  dailyMinutes: z.number().int().min(1).default(30),
  scriptureList: z.array(z.unknown()).default([]),
  minRecitations: z.number().int().min(1).default(1),
  maxRecitations: z.number().int().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

const updateScheduleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  dailyMinutes: z.number().int().min(1).optional(),
  scriptureList: z.array(z.unknown()).optional(),
  minRecitations: z.number().int().min(1).optional(),
  maxRecitations: z.number().int().min(1).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});
type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

const listGuidelinesSchema = z.object({
  scheduleId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
type ListGuidelinesQuery = z.infer<typeof listGuidelinesSchema>;

const createGuidelineSchema = z.object({
  schedulePublicId: z.string().min(1),
  topic: z.string().min(1).max(255),
  guidance: z.string().min(1),
  importance: z.enum(["CRITICAL", "IMPORTANT", "REFERENCE"]).default("IMPORTANT"),
});
type CreateGuidelineInput = z.infer<typeof createGuidelineSchema>;

const createRoutineSchema = z.object({
  schedulePublicId: z.string().min(1),
  dayNumber: z.number().int().min(1),
  scriptureSequence: z.array(z.string()).default([]),
  timing: z.string().default(""),
  notes: z.string().default(""),
});
type CreateRoutineInput = z.infer<typeof createRoutineSchema>;

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags("admin-daily-recitation")
@Controller("admin/daily-recitation")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDailyRecitationController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Overview ─────────────────────────────────────────────────────────────

  @Get("overview")
  @ApiOperation({ summary: "Tổng quan quản trị thời khóa tụng kinh" })
  async getOverview() {
    const [totalSchedules, publishedSchedules, totalGuidelines, totalRoutines] = await Promise.all([
      this.prisma.practiceSchedule.count(),
      this.prisma.practiceSchedule.count({ where: { status: "PUBLISHED" } }),
      this.prisma.recitationGuideline.count(),
      this.prisma.dailyRoutine.count(),
    ]);
    return {
      schedules: { total: totalSchedules, published: publishedSchedules },
      guidelines: { total: totalGuidelines },
      routines: { total: totalRoutines },
    };
  }

  // ── Schedules ─────────────────────────────────────────────────────────────

  @Get("schedules")
  @ApiOperation({ summary: "Danh sách thời khóa tụng kinh (admin)" })
  async listSchedules(@Query(ZodValidate(listSchedulesSchema)) query: ListSchedulesQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: {
      status?: RecitationStatus;
      difficulty?: RecitationDifficulty;
      OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { description: { contains: string; mode: "insensitive" } }>;
    } = {};
    if (query.status) where.status = query.status as RecitationStatus;
    if (query.difficulty) where.difficulty = query.difficulty as RecitationDifficulty;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.practiceSchedule.findMany({
        where,
        include: {
          _count: { select: { guidelines: true, routines: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
      this.prisma.practiceSchedule.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
    };
  }

  @Get("schedules/:publicId")
  @ApiOperation({ summary: "Chi tiết thời khóa tụng kinh (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getSchedule(@Param("publicId") publicId: string) {
    const schedule = await this.prisma.practiceSchedule.findUnique({
      where: { publicId },
      include: {
        guidelines: { orderBy: { importance: "asc" } },
        routines: { orderBy: { dayNumber: "asc" } },
      },
    });
    if (!schedule) throw new NotFoundException("Thời khóa tụng kinh không tồn tại");
    return schedule;
  }

  @Post("schedules")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo thời khóa tụng kinh" })
  async createSchedule(@Body(ZodValidate(createScheduleSchema)) input: CreateScheduleInput) {
    return this.prisma.practiceSchedule.create({
      data: {
        publicId: nanoid(12),
        name: input.name,
        description: input.description,
        difficulty: input.difficulty as RecitationDifficulty,
        dailyMinutes: input.dailyMinutes,
        scriptureList: input.scriptureList as Prisma.InputJsonValue,
        minRecitations: input.minRecitations,
        ...(input.maxRecitations !== undefined && { maxRecitations: input.maxRecitations }),
        status: input.status as RecitationStatus,
      },
    });
  }

  @Patch("schedules/:publicId")
  @ApiOperation({ summary: "Cập nhật thời khóa tụng kinh" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateSchedule(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateScheduleSchema)) input: UpdateScheduleInput,
  ) {
    const schedule = await this.prisma.practiceSchedule.findUnique({ where: { publicId } });
    if (!schedule) throw new NotFoundException("Thời khóa tụng kinh không tồn tại");

    return this.prisma.practiceSchedule.update({
      where: { publicId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.difficulty !== undefined && { difficulty: input.difficulty as RecitationDifficulty }),
        ...(input.dailyMinutes !== undefined && { dailyMinutes: input.dailyMinutes }),
        ...(input.scriptureList !== undefined && { scriptureList: input.scriptureList as Prisma.InputJsonValue }),
        ...(input.minRecitations !== undefined && { minRecitations: input.minRecitations }),
        ...(input.maxRecitations !== undefined && { maxRecitations: input.maxRecitations }),
        ...(input.status !== undefined && { status: input.status as RecitationStatus }),
      },
    });
  }

  // ── Guidelines ────────────────────────────────────────────────────────────

  @Get("guidelines")
  @ApiOperation({ summary: "Danh sách hướng dẫn tụng kinh (admin)" })
  async listGuidelines(@Query(ZodValidate(listGuidelinesSchema)) query: ListGuidelinesQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: { scheduleId?: string } = {};

    if (query.scheduleId) {
      const schedule = await this.prisma.practiceSchedule.findUnique({
        where: { publicId: query.scheduleId },
        select: { id: true },
      });
      if (schedule) where.scheduleId = schedule.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.recitationGuideline.findMany({
        where,
        include: {
          schedule: { select: { publicId: true, name: true } },
        },
        orderBy: [{ importance: "asc" }, { createdAt: "desc" }],
        skip,
        take: query.limit,
      }),
      this.prisma.recitationGuideline.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
    };
  }

  @Post("guidelines")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hướng dẫn tụng kinh" })
  async createGuideline(@Body(ZodValidate(createGuidelineSchema)) input: CreateGuidelineInput) {
    const schedule = await this.prisma.practiceSchedule.findUnique({
      where: { publicId: input.schedulePublicId },
      select: { id: true },
    });
    if (!schedule) throw new NotFoundException("Thời khóa tụng kinh không tồn tại");

    return this.prisma.recitationGuideline.create({
      data: {
        publicId: nanoid(12),
        scheduleId: schedule.id,
        topic: input.topic,
        guidance: input.guidance,
        importance: input.importance as GuidelineImportance,
      },
    });
  }

  // ── Routines ──────────────────────────────────────────────────────────────

  @Get("routines")
  @ApiOperation({ summary: "Danh sách thời khóa hằng ngày (admin)" })
  async listRoutines() {
    const data = await this.prisma.dailyRoutine.findMany({
      include: {
        schedule: { select: { publicId: true, name: true } },
      },
      orderBy: [{ scheduleId: "asc" }, { dayNumber: "asc" }],
    });
    return { data };
  }

  @Post("routines")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo thời khóa hằng ngày" })
  async createRoutine(@Body(ZodValidate(createRoutineSchema)) input: CreateRoutineInput) {
    const schedule = await this.prisma.practiceSchedule.findUnique({
      where: { publicId: input.schedulePublicId },
      select: { id: true },
    });
    if (!schedule) throw new NotFoundException("Thời khóa tụng kinh không tồn tại");

    return this.prisma.dailyRoutine.create({
      data: {
        publicId: nanoid(12),
        scheduleId: schedule.id,
        dayNumber: input.dayNumber,
        scriptureSequence: input.scriptureSequence,
        timing: input.timing,
        notes: input.notes,
      },
    });
  }
}
