import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { Q161_RULE_PACK } from "./q161-rule-pack.data.js";
import { parseQ161RulePackWithMini } from "./q161-rule-pack.mini-schema.js";
import type {
  AskQuestionInput,
  Q161RulePackResponse,
  SubmitAnswerInput,
  WisdomQaQuery,
  WisdomEntryQuery,
  CreateWisdomEntryInput,
  UpdateWisdomEntryInput,
} from "./wisdom-qa.schemas.js";
import { type WisdomEntryType, type ContentStatus, type Prisma } from "../../generated/prisma/client.js";

@Injectable()
export class WisdomQaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
  ) {}

  listQuestions(query: WisdomQaQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  getQuestionById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }

  askQuestion(input: AskQuestionInput, actorId: string) {
    return { id: actorId, title: input.title, message: "Chức năng đang phát triển" };
  }

  submitAnswer(input: SubmitAnswerInput, actorId: string) {
    return { id: actorId, questionId: input.questionId, message: "Chức năng đang phát triển" };
  }

  async getQ161RulePack(): Promise<Q161RulePackResponse> {
    return this.cacheService.getOrSet("wisdom:q161:rule-pack:v1", 60 * 30, async () => {
      const payload = parseQ161RulePackWithMini(Q161_RULE_PACK);
      return await Promise.resolve(payload);
    });
  }

  // ── Admin: Wisdom Entries ────────────────────────────────────────────

  async listWisdomEntries(query: WisdomEntryQuery) {
    const where: Prisma.WisdomEntryWhereInput = {};
    if (query.status) where.status = query.status as ContentStatus;
    if (query.entryType) where.entryType = query.entryType as WisdomEntryType;
    if (query.search) where.title = { contains: query.search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.wisdomEntry.findMany({
        where,
        include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.wisdomEntry.count({ where }),
    ]);

    return { data, meta: { total, limit: query.limit, offset: query.offset } };
  }

  async getWisdomEntry(publicId: string) {
    const entry = await this.prisma.wisdomEntry.findUnique({
      where: { publicId },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });
    if (!entry) throw new NotFoundException("Bài tri tuệ không tồn tại");
    return entry;
  }

  async createWisdomEntry(input: CreateWisdomEntryInput, userId: string, auditContext: AuditContext) {
    const slug = input.slug ?? `wisdom-${nanoid(8)}`;
    const existing = await this.prisma.wisdomEntry.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Slug đã được sử dụng");

    const entry = await this.prisma.wisdomEntry.create({
      data: {
        publicId: nanoid(12),
        title: input.title,
        slug,
        entryType: input.entryType as WisdomEntryType,
        sourceFamily: input.sourceFamily,
        sourceUrl: input.sourceUrl,
        sourceCode: input.sourceCode,
        originalText: input.originalText,
        translatedText: input.translatedText,
        excerpt: input.excerpt,
        tags: input.tags,
        authorId: userId,
      },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.create", "wisdom_entry", entry.publicId);
    return entry;
  }

  async updateWisdomEntry(publicId: string, input: UpdateWisdomEntryInput, auditContext: AuditContext) {
    const entry = await this.prisma.wisdomEntry.findUnique({ where: { publicId } });
    if (!entry) throw new NotFoundException("Bài tri tuệ không tồn tại");

    if (input.slug && input.slug !== entry.slug) {
      const existing = await this.prisma.wisdomEntry.findUnique({ where: { slug: input.slug } });
      if (existing) throw new ConflictException("Slug đã được sử dụng");
    }

    const updated = await this.prisma.wisdomEntry.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.entryType !== undefined && { entryType: input.entryType as WisdomEntryType }),
        ...(input.sourceFamily !== undefined && { sourceFamily: input.sourceFamily }),
        ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl }),
        ...(input.sourceCode !== undefined && { sourceCode: input.sourceCode }),
        ...(input.originalText !== undefined && { originalText: input.originalText }),
        ...(input.translatedText !== undefined && { translatedText: input.translatedText }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.tags !== undefined && { tags: input.tags }),
      },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.update", "wisdom_entry", publicId);
    return updated;
  }

  async publishWisdomEntry(publicId: string, auditContext: AuditContext) {
    const entry = await this.prisma.wisdomEntry.findUnique({ where: { publicId } });
    if (!entry) throw new NotFoundException("Bài tri tuệ không tồn tại");
    if (entry.status === "PUBLISHED") throw new ConflictException("Bài tri tuệ đã được xuất bản");

    const updated = await this.prisma.wisdomEntry.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.publish", "wisdom_entry", publicId);
    return updated;
  }

  async deleteWisdomEntry(publicId: string, auditContext: AuditContext) {
    const entry = await this.prisma.wisdomEntry.findUnique({ where: { publicId } });
    if (!entry) throw new NotFoundException("Bài tri tuệ không tồn tại");

    await this.prisma.wisdomEntry.delete({ where: { publicId } });
    await this.audit.append(auditContext, "content.delete", "wisdom_entry", publicId);
  }
}
