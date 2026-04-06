import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import type { PracticeGuideLevel, ContentStatus } from "../../generated/prisma/client.js";

// ── Schemas ──────────────────────────────────────────────────────────────────

const listGuidesSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
type ListGuidesQuery = z.infer<typeof listGuidesSchema>;

const createGuideSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  body: z.string().min(1),
  duration: z.number().int().min(0).default(0),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  sortOrder: z.number().int().min(0).default(0),
});
type CreateGuideInput = z.infer<typeof createGuideSchema>;

const updateGuideSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  duration: z.number().int().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
type UpdateGuideInput = z.infer<typeof updateGuideSchema>;

const createPresetSchema = z.object({
  name: z.string().min(1).max(255),
  scenarioType: z.string().min(1).max(100),
  practiceCount: z.number().int().min(0).default(0),
  guideIds: z.array(z.string()).default([]),
});
type CreatePresetInput = z.infer<typeof createPresetSchema>;

const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1).max(100).default("general"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});
type CreateFaqInput = z.infer<typeof createFaqSchema>;

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags("admin-daily-practice")
@Controller("admin/daily-practice")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDailyPracticeController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Overview ─────────────────────────────────────────────────────────────

  @Get("overview")
  @ApiOperation({ summary: "Tổng quan quản trị tu tập hằng ngày" })
  async getOverview() {
    const [totalGuides, publishedGuides, totalPresets, totalFaqs] = await Promise.all([
      this.prisma.practiceGuide.count(),
      this.prisma.practiceGuide.count({ where: { status: "PUBLISHED" } }),
      this.prisma.scenarioPreset.count(),
      this.prisma.practiceFaq.count(),
    ]);
    return {
      guides: { total: totalGuides, published: publishedGuides },
      presets: { total: totalPresets },
      faqs: { total: totalFaqs },
    };
  }

  // ── Guides ────────────────────────────────────────────────────────────────

  @Get("guides")
  @ApiOperation({ summary: "Danh sách hướng dẫn tu tập (admin)" })
  async listGuides(@Query(ZodValidate(listGuidesSchema)) query: ListGuidesQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: {
      status?: ContentStatus;
      difficulty?: PracticeGuideLevel;
      OR?: Array<{ title: { contains: string; mode: "insensitive" } }>;
    } = {};
    if (query.status) where.status = query.status as ContentStatus;
    if (query.difficulty) where.difficulty = query.difficulty as PracticeGuideLevel;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: "insensitive" } }];
    }

    const [data, total] = await Promise.all([
      this.prisma.practiceGuide.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: query.limit,
      }),
      this.prisma.practiceGuide.count({ where }),
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

  @Get("guides/:publicId")
  @ApiOperation({ summary: "Chi tiết hướng dẫn tu tập (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getGuide(@Param("publicId") publicId: string) {
    const guide = await this.prisma.practiceGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");
    return guide;
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hướng dẫn tu tập" })
  async createGuide(@Body(ZodValidate(createGuideSchema)) input: CreateGuideInput) {
    const publicId = nanoid(12);
    const slug = input.slug ?? this.generateSlug(input.title, publicId);

    const existing = await this.prisma.practiceGuide.findUnique({ where: { slug } });
    if (existing) {
      const uniqueSlug = `${slug}-${publicId}`;
      return this.prisma.practiceGuide.create({
        data: {
          publicId,
          title: input.title,
          slug: uniqueSlug,
          body: input.body,
          duration: input.duration,
          difficulty: input.difficulty as PracticeGuideLevel,
          sortOrder: input.sortOrder,
        },
      });
    }

    return this.prisma.practiceGuide.create({
      data: {
        publicId,
        title: input.title,
        slug,
        body: input.body,
        duration: input.duration,
        difficulty: input.difficulty as PracticeGuideLevel,
        sortOrder: input.sortOrder,
      },
    });
  }

  @Patch("guides/:publicId")
  @ApiOperation({ summary: "Cập nhật hướng dẫn tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateGuide(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateGuideSchema)) input: UpdateGuideInput,
  ) {
    const guide = await this.prisma.practiceGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");

    return this.prisma.practiceGuide.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.body !== undefined && { body: input.body }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.difficulty !== undefined && { difficulty: input.difficulty as PracticeGuideLevel }),
        ...(input.status !== undefined && {
          status: input.status as ContentStatus,
          publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
        }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
  }

  @Delete("guides/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá hướng dẫn tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deleteGuide(@Param("publicId") publicId: string) {
    const guide = await this.prisma.practiceGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");
    await this.prisma.practiceGuide.delete({ where: { publicId } });
  }

  // ── Presets ───────────────────────────────────────────────────────────────

  @Get("presets")
  @ApiOperation({ summary: "Danh sách kịch bản tu tập (admin)" })
  async listPresets() {
    const data = await this.prisma.scenarioPreset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data };
  }

  @Post("presets")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo kịch bản tu tập" })
  async createPreset(@Body(ZodValidate(createPresetSchema)) input: CreatePresetInput) {
    return this.prisma.scenarioPreset.create({
      data: {
        publicId: nanoid(12),
        name: input.name,
        scenarioType: input.scenarioType,
        practiceCount: input.practiceCount,
        guideIds: input.guideIds,
      },
    });
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────

  @Get("faq")
  @ApiOperation({ summary: "Danh sách câu hỏi thường gặp (admin)" })
  async listFaq() {
    const data = await this.prisma.practiceFaq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return { data };
  }

  @Post("faq")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo câu hỏi thường gặp" })
  async createFaq(@Body(ZodValidate(createFaqSchema)) input: CreateFaqInput) {
    return this.prisma.practiceFaq.create({
      data: {
        publicId: nanoid(12),
        question: input.question,
        answer: input.answer,
        category: input.category,
        featured: input.featured,
        sortOrder: input.sortOrder,
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateSlug(title: string, publicId: string): string {
    const base = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 60);
    return `${base}-${publicId}`;
  }
}
