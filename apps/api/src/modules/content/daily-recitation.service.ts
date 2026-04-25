import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { RecitationDifficulty, RecitationStatus, GuidelineImportance, Prisma } from "../../generated/prisma/client.js";
import type {
  CreateGuidelineInput,
  CreateRoutineInput,
  CreateScheduleInput,
  ListGuidelinesQuery,
  ListSchedulesQuery,
  UpdateScheduleInput,
} from "./daily-recitation.schemas.js";

@Injectable()
export class DailyRecitationService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listSchedules(query: ListSchedulesQuery) {
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

  async getSchedule(publicId: string) {
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

  async createSchedule(input: CreateScheduleInput) {
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

  async updateSchedule(publicId: string, input: UpdateScheduleInput) {
    await this.getSchedule(publicId);

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

  async listGuidelines(query: ListGuidelinesQuery) {
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

  async createGuideline(input: CreateGuidelineInput) {
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

  async listRoutines() {
    const data = await this.prisma.dailyRoutine.findMany({
      include: {
        schedule: { select: { publicId: true, name: true } },
      },
      orderBy: [{ scheduleId: "asc" }, { dayNumber: "asc" }],
    });
    return { data };
  }

  async createRoutine(input: CreateRoutineInput) {
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
