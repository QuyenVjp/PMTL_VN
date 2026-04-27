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
import { StorageService } from "../../platform/storage/storage.service.js";
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
  scriptureImageMediaPublicId: z.string().nullable().optional(),
  duration: z.number().int().min(0).default(0),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  sortOrder: z.number().int().min(0).default(0),
});
type CreateGuideInput = z.infer<typeof createGuideSchema>;

const updateGuideSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  scriptureImageMediaPublicId: z.string().nullable().optional(),
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

const updatePresetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scenarioType: z.string().min(1).max(100).optional(),
  practiceCount: z.number().int().min(0).optional(),
  guideIds: z.array(z.string()).optional(),
});
type UpdatePresetInput = z.infer<typeof updatePresetSchema>;

const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1).max(100).default("general"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});
type CreateFaqInput = z.infer<typeof createFaqSchema>;

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags("admin-daily-practice")
@Controller("admin/daily-practice")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminDailyPracticeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

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
        include: { scriptureImageMedia: { select: { publicId: true, url: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: query.limit,
      }),
      this.prisma.practiceGuide.count({ where }),
    ]);
    const mapped = await Promise.all(data.map((guide) => this.mapGuide(guide)));

    return {
      data: mapped,
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
    const guide = await this.prisma.practiceGuide.findUnique({
      where: { publicId },
      include: { scriptureImageMedia: { select: { publicId: true, url: true } } },
    });
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");
    return this.mapGuide(guide);
  }

  @Post("guides")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo hướng dẫn tu tập" })
  async createGuide(@Body(ZodValidate(createGuideSchema)) input: CreateGuideInput) {
    const publicId = nanoid(12);
    const slug = input.slug ?? this.generateSlug(input.title, publicId);
    const scriptureImageMediaId = await this.resolveMediaIdByPublicId(input.scriptureImageMediaPublicId);

    const existing = await this.prisma.practiceGuide.findUnique({ where: { slug } });
    if (existing) {
      const uniqueSlug = `${slug}-${publicId}`;
      const created = await this.prisma.practiceGuide.create({
        data: {
          publicId,
          title: input.title,
          slug: uniqueSlug,
          body: input.body,
          ...(scriptureImageMediaId !== undefined && { scriptureImageMediaId }),
          duration: input.duration,
          difficulty: input.difficulty as PracticeGuideLevel,
          sortOrder: input.sortOrder,
        },
        include: { scriptureImageMedia: { select: { publicId: true, url: true } } },
      });
      return this.mapGuide(created);
    }

    const created = await this.prisma.practiceGuide.create({
      data: {
        publicId,
        title: input.title,
        slug,
        body: input.body,
        ...(scriptureImageMediaId !== undefined && { scriptureImageMediaId }),
        duration: input.duration,
        difficulty: input.difficulty as PracticeGuideLevel,
        sortOrder: input.sortOrder,
      },
      include: { scriptureImageMedia: { select: { publicId: true, url: true } } },
    });
    return this.mapGuide(created);
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
    const scriptureImageMediaId = await this.resolveMediaIdByPublicId(input.scriptureImageMediaPublicId);

    const updated = await this.prisma.practiceGuide.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.body !== undefined && { body: input.body }),
        ...(scriptureImageMediaId !== undefined && { scriptureImageMediaId }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.difficulty !== undefined && { difficulty: input.difficulty as PracticeGuideLevel }),
        ...(input.status !== undefined && {
          status: input.status as ContentStatus,
          publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
        }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
      include: { scriptureImageMedia: { select: { publicId: true, url: true } } },
    });
    return this.mapGuide(updated);
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

  @Get("presets/:publicId")
  @ApiOperation({ summary: "Chi tiết kịch bản tu tập (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getPreset(@Param("publicId") publicId: string) {
    const preset = await this.prisma.scenarioPreset.findUnique({ where: { publicId } });
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");
    return preset;
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

  @Patch("presets/:publicId")
  @ApiOperation({ summary: "Cập nhật kịch bản tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updatePreset(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updatePresetSchema)) input: UpdatePresetInput,
  ) {
    const preset = await this.prisma.scenarioPreset.findUnique({ where: { publicId } });
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");

    return this.prisma.scenarioPreset.update({
      where: { publicId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.scenarioType !== undefined && { scenarioType: input.scenarioType }),
        ...(input.practiceCount !== undefined && { practiceCount: input.practiceCount }),
        ...(input.guideIds !== undefined && { guideIds: input.guideIds }),
      },
    });
  }

  @Delete("presets/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá kịch bản tu tập" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deletePreset(@Param("publicId") publicId: string) {
    const preset = await this.prisma.scenarioPreset.findUnique({ where: { publicId } });
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");
    await this.prisma.scenarioPreset.delete({ where: { publicId } });
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

  @Get("faq/:publicId")
  @ApiOperation({ summary: "Chi tiết câu hỏi thường gặp (admin)" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async getFaq(@Param("publicId") publicId: string) {
    const faq = await this.prisma.practiceFaq.findUnique({ where: { publicId } });
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");
    return faq;
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

  @Patch("faq/:publicId")
  @ApiOperation({ summary: "Cập nhật câu hỏi thường gặp" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async updateFaq(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateFaqSchema)) input: UpdateFaqInput,
  ) {
    const faq = await this.prisma.practiceFaq.findUnique({ where: { publicId } });
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");

    return this.prisma.practiceFaq.update({
      where: { publicId },
      data: {
        ...(input.question !== undefined && { question: input.question }),
        ...(input.answer !== undefined && { answer: input.answer }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.featured !== undefined && { featured: input.featured }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
  }

  @Delete("faq/:publicId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xoá câu hỏi thường gặp" })
  @ApiParam({ name: "publicId", description: "Public ID" })
  async deleteFaq(@Param("publicId") publicId: string) {
    const faq = await this.prisma.practiceFaq.findUnique({ where: { publicId } });
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");
    await this.prisma.practiceFaq.delete({ where: { publicId } });
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

  private async resolveMediaIdByPublicId(publicId: string | null | undefined): Promise<string | null | undefined> {
    if (publicId === undefined) return undefined;
    if (publicId === null || publicId.trim().length === 0) return null;
    const asset = await this.storage.getAsset(publicId);
    if (!asset) throw new NotFoundException("Ảnh/bản kinh đã chọn không tồn tại");
    return asset.id;
  }

  private async mapGuide(guide: {
    scriptureImageMedia?: { publicId: string; url: string } | null;
    [key: string]: unknown;
  }) {
    const media = guide.scriptureImageMedia ?? null;
    return {
      ...guide,
      scriptureImageMediaPublicId: media?.publicId ?? null,
      scriptureImageUrl: (await this.storage.resolveAssetUrl(media?.publicId)) ?? media?.url ?? null,
    };
  }
}
