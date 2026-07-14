import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type {
  ContentStatus,
  PracticeGuideLevel,
  Prisma,
  PrismaClient,
} from "../../../generated/prisma/client.js";

/**
 * Prisma interactive-transaction client. Excludes lifecycle/extension methods
 * that are not available on the scoped `tx` handed to a `$transaction` callback.
 */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// ── Create / Update data interfaces ───────────────────────────────────────────

export interface CreateGuideData {
  publicId: string;
  title: string;
  slug: string;
  body: string;
  scriptureImageMediaId?: string | null;
  duration: number;
  difficulty: PracticeGuideLevel;
  sortOrder: number;
}

export interface UpdateGuideData {
  title?: string;
  slug?: string;
  body?: string;
  scriptureImageMediaId?: string | null;
  duration?: number;
  difficulty?: PracticeGuideLevel;
  status?: ContentStatus;
  publishedAt?: Date | null;
  sortOrder?: number;
}

export interface CreatePresetData {
  publicId: string;
  name: string;
  scenarioType: string;
  practiceCount: number;
  guideIds: string[];
}

export interface UpdatePresetData {
  name?: string;
  scenarioType?: string;
  practiceCount?: number;
  guideIds?: string[];
}

export interface CreateFaqData {
  publicId: string;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  sortOrder: number;
}

export interface UpdateFaqData {
  question?: string;
  answer?: string;
  category?: string;
  featured?: boolean;
  sortOrder?: number;
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class DailyPracticeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly guideInclude = {
    scriptureImageMedia: { select: { publicId: true, url: true } },
  } satisfies Prisma.PracticeGuideInclude;

  /**
   * Opens an interactive transaction owned by the repository so the service can
   * atomically wrap a write + its audit append without importing Prisma itself.
   * If the callback throws (e.g. the audit chain write fails), Prisma rolls the
   * whole transaction back — the domain write is never committed.
   */
  runInTransaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }

  /** Resolve the active client: the scoped tx when inside a transaction, else the base client. */
  private db(tx?: TransactionClient): TransactionClient {
    return tx ?? this.prisma;
  }

  // ── Overview ──────────────────────────────────────────────────────────────

  async countOverview() {
    const [totalGuides, publishedGuides, totalPresets, totalFaqs] = await Promise.all([
      this.prisma.practiceGuide.count(),
      this.prisma.practiceGuide.count({ where: { status: "PUBLISHED" } }),
      this.prisma.scenarioPreset.count(),
      this.prisma.practiceFaq.count(),
    ]);
    return { totalGuides, publishedGuides, totalPresets, totalFaqs };
  }

  // ── Guides ────────────────────────────────────────────────────────────────

  async findGuides(options: {
    status?: ContentStatus;
    difficulty?: PracticeGuideLevel;
    search?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.PracticeGuideWhereInput = {};
    if (options.status) where.status = options.status;
    if (options.difficulty) where.difficulty = options.difficulty;
    if (options.search) {
      where.OR = [{ title: { contains: options.search, mode: "insensitive" } }];
    }

    const [guides, total] = await Promise.all([
      this.prisma.practiceGuide.findMany({
        where,
        include: this.guideInclude,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.practiceGuide.count({ where }),
    ]);

    return { guides, total };
  }

  async findGuideByPublicId(publicId: string) {
    return this.prisma.practiceGuide.findUnique({
      where: { publicId },
      include: this.guideInclude,
    });
  }

  async findGuideBySlug(slug: string) {
    return this.prisma.practiceGuide.findUnique({ where: { slug } });
  }

  async createGuide(data: CreateGuideData, tx?: TransactionClient) {
    return this.db(tx).practiceGuide.create({
      data: {
        publicId: data.publicId,
        title: data.title,
        slug: data.slug,
        body: data.body,
        ...(data.scriptureImageMediaId !== undefined && {
          scriptureImageMediaId: data.scriptureImageMediaId,
        }),
        duration: data.duration,
        difficulty: data.difficulty,
        sortOrder: data.sortOrder,
      },
      include: this.guideInclude,
    });
  }

  async updateGuide(publicId: string, data: UpdateGuideData, tx?: TransactionClient) {
    const updateData: Prisma.PracticeGuideUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.scriptureImageMediaId !== undefined) {
      updateData.scriptureImageMedia = data.scriptureImageMediaId
        ? { connect: { id: data.scriptureImageMediaId } }
        : { disconnect: true };
    }
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.db(tx).practiceGuide.update({
      where: { publicId },
      data: updateData,
      include: this.guideInclude,
    });
  }

  async deleteGuide(publicId: string, tx?: TransactionClient) {
    return this.db(tx).practiceGuide.delete({ where: { publicId } });
  }

  // ── Presets ───────────────────────────────────────────────────────────────

  async findPresets() {
    return this.prisma.scenarioPreset.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findPresetByPublicId(publicId: string) {
    return this.prisma.scenarioPreset.findUnique({ where: { publicId } });
  }

  async createPreset(data: CreatePresetData, tx?: TransactionClient) {
    return this.db(tx).scenarioPreset.create({
      data: {
        publicId: data.publicId,
        name: data.name,
        scenarioType: data.scenarioType,
        practiceCount: data.practiceCount,
        guideIds: data.guideIds,
      },
    });
  }

  async updatePreset(publicId: string, data: UpdatePresetData, tx?: TransactionClient) {
    return this.db(tx).scenarioPreset.update({
      where: { publicId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.scenarioType !== undefined && { scenarioType: data.scenarioType }),
        ...(data.practiceCount !== undefined && { practiceCount: data.practiceCount }),
        ...(data.guideIds !== undefined && { guideIds: data.guideIds }),
      },
    });
  }

  async deletePreset(publicId: string, tx?: TransactionClient) {
    return this.db(tx).scenarioPreset.delete({ where: { publicId } });
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────

  async findFaqs() {
    return this.prisma.practiceFaq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async findFaqByPublicId(publicId: string) {
    return this.prisma.practiceFaq.findUnique({ where: { publicId } });
  }

  async createFaq(data: CreateFaqData, tx?: TransactionClient) {
    return this.db(tx).practiceFaq.create({
      data: {
        publicId: data.publicId,
        question: data.question,
        answer: data.answer,
        category: data.category,
        featured: data.featured,
        sortOrder: data.sortOrder,
      },
    });
  }

  async updateFaq(publicId: string, data: UpdateFaqData, tx?: TransactionClient) {
    return this.db(tx).practiceFaq.update({
      where: { publicId },
      data: {
        ...(data.question !== undefined && { question: data.question }),
        ...(data.answer !== undefined && { answer: data.answer }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
  }

  async deleteFaq(publicId: string, tx?: TransactionClient) {
    return this.db(tx).practiceFaq.delete({ where: { publicId } });
  }
}
