import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { ForbiddenError } from "../../common/errors/app-error.js";
import { FeatureFlagsService } from "../../platform/feature-flags/feature-flags.service.js";
import { Q161_RULE_PACK } from "./q161-rule-pack.data.js";
import { parseQ161RulePackWithMini } from "./q161-rule-pack.mini-schema.js";
import { WisdomGeminiService } from "./wisdom-gemini.service.js";
import type {
  AskQuestionInput,
  Q161RulePackResponse,
  SubmitAnswerInput,
  WisdomQaQuery,
  WisdomEntryQuery,
  CreateWisdomEntryInput,
  UpdateWisdomEntryInput,
  CreateAuthorityProfileInput,
  UpdateAuthorityProfileInput,
  AuthorityProfileQuery,
  WisdomEntryPublicQuery,
  DuplicateCheckInput,
  SuggestSlugInput,
  SlugPreviewInput,
  TranslationDraftInput,
  OfflineBundleListQuery,
  OfflineBundleStatusQuery,
  OfflineBundleDeltaQuery,
  RebuildOfflineBundlesInput,
} from "./wisdom-qa.schemas.js";
import { type WisdomEntryType, type ContentStatus, type Prisma, WisdomQuestionStatus } from "../../generated/prisma/client.js";

type OfflineBundleFamily = "baihua" | "wisdom" | "practices";

type OfflineBundleManifestItem = {
  publicId: string;
  slug: string;
  title: string;
  entryType: WisdomEntryType;
  sourceFamily: string | null;
  updatedAt: string;
};

type OfflineBundleManifest = {
  publicId: string;
  bundleFamily: OfflineBundleFamily;
  bundleType: "BACH_THOAI" | "WISDOM" | "PRACTICE_SUPPORT";
  version: string;
  itemCount: number;
  lastSyncedAt: string | null;
  freshnessStatus: "empty" | "healthy";
  truncated: boolean;
  manifestItems: OfflineBundleManifestItem[];
};

@Injectable()
export class WisdomQaService {
  private static readonly OFFLINE_FAMILIES: OfflineBundleFamily[] = ["baihua", "wisdom", "practices"];

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
    private readonly featureFlags: FeatureFlagsService,
    private readonly wisdomGemini: WisdomGeminiService,
  ) {}

  async listQuestions(query: WisdomQaQuery) {
    const statusMap: Record<string, WisdomQuestionStatus> = {
      open: WisdomQuestionStatus.OPEN,
      answered: WisdomQuestionStatus.ANSWERED,
      closed: WisdomQuestionStatus.CLOSED,
    };

    const where: Prisma.WisdomQuestionWhereInput = {};
    if (query.status) where.status = statusMap[query.status];
    if (query.categoryId) where.categoryId = query.categoryId;

    const skip = (query.page - 1) * query.pageSize;

    const [rawData, total] = await Promise.all([
      this.prisma.wisdomQuestion.findMany({
        where,
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
      }),
      this.prisma.wisdomQuestion.count({ where }),
    ]);

    const data = rawData.map((q) => ({
      ...q,
      author: q.isAnonymous ? null : q.author,
    }));

    return { data, meta: { total, page: query.page, pageSize: query.pageSize } };
  }

  async getQuestionById(publicId: string) {
    const question = await this.prisma.wisdomQuestion.findUnique({
      where: { publicId },
      include: {
        author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        answers: {
          include: {
            author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!question) throw new NotFoundException("Câu hỏi không tồn tại");

    return {
      ...question,
      author: question.isAnonymous ? null : question.author,
    };
  }

  async askQuestion(input: AskQuestionInput, actorId: string) {
    const enabled = await this.featureFlags.isEnabled("wisdom_qa.enabled");
    if (!enabled) throw new ForbiddenError("Tính năng Q&A đang tắt bởi feature flag");

    const publicId = nanoid(12);

    const question = await this.prisma.wisdomQuestion.create({
      data: {
        publicId,
        authorId: actorId,
        title: input.title,
        body: input.body,
        categoryId: input.categoryId,
        tags: input.tags ?? [],
        isAnonymous: input.isAnonymous,
        status: WisdomQuestionStatus.OPEN,
      },
      include: {
        author: { select: { publicId: true, displayName: true, avatarUrl: true } },
      },
    });

    return {
      ...question,
      author: question.isAnonymous ? null : question.author,
    };
  }

  async submitAnswer(input: SubmitAnswerInput, actorId: string) {
    const question = await this.prisma.wisdomQuestion.findUnique({
      where: { publicId: input.questionId },
    });

    if (!question) throw new NotFoundException("Câu hỏi không tồn tại");

    const publicId = nanoid(12);

    const [answer] = await this.prisma.$transaction([
      this.prisma.wisdomAnswer.create({
        data: {
          publicId,
          questionId: question.id,
          authorId: actorId,
          body: input.body,
        },
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.wisdomQuestion.update({
        where: { id: question.id },
        data: {
          answerCount: { increment: 1 },
          ...(question.status === WisdomQuestionStatus.OPEN && {
            status: WisdomQuestionStatus.ANSWERED,
          }),
        },
      }),
    ]);

    return answer;
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
        ...(input.sourceFamily !== undefined && { sourceFamily: input.sourceFamily }),
        ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl }),
        ...(input.sourceCode !== undefined && { sourceCode: input.sourceCode }),
        ...(input.originalText !== undefined && { originalText: input.originalText }),
        ...(input.translatedText !== undefined && { translatedText: input.translatedText }),
        ...(input.tags !== undefined && { tags: input.tags }),
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

  // ── Admin: Authority Profiles ───────────────────────────────────────

  async listAuthorityProfiles(query: AuthorityProfileQuery) {
    const where: Prisma.WisdomAuthorityProfileWhereInput = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.wisdomAuthorityProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.wisdomAuthorityProfile.count({ where }),
    ]);

    return { data, meta: { total, limit: query.limit, offset: query.offset } };
  }

  async createAuthorityProfile(input: CreateAuthorityProfileInput, auditContext: AuditContext) {
    const profile = await this.prisma.wisdomAuthorityProfile.create({
      data: {
        publicId: nanoid(12),
        name: input.name,
        title: input.title,
        description: input.description,
        sourceFamily: input.sourceFamily,
      },
    });

    await this.audit.append(auditContext, "content.create", "wisdom_authority_profile", profile.publicId);
    return profile;
  }

  async updateAuthorityProfile(publicId: string, input: UpdateAuthorityProfileInput, auditContext: AuditContext) {
    const profile = await this.prisma.wisdomAuthorityProfile.findUnique({ where: { publicId } });
    if (!profile) throw new NotFoundException("Hồ sơ authority không tồn tại");

    const updated = await this.prisma.wisdomAuthorityProfile.update({
      where: { publicId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.sourceFamily !== undefined && { sourceFamily: input.sourceFamily }),
      },
    });

    await this.audit.append(auditContext, "content.update", "wisdom_authority_profile", publicId);
    return updated;
  }

  async deleteAuthorityProfile(publicId: string, auditContext: AuditContext) {
    const profile = await this.prisma.wisdomAuthorityProfile.findUnique({ where: { publicId } });
    if (!profile) throw new NotFoundException("Hồ sơ authority không tồn tại");

    const updated = await this.prisma.wisdomAuthorityProfile.update({
      where: { publicId },
      data: { isActive: false },
    });

    await this.audit.append(auditContext, "content.delete", "wisdom_authority_profile", publicId);
    return updated;
  }

  // ── Public: Wisdom Entries Hub ──────────────────────────────────────

  async listPublicWisdomEntries(query: WisdomEntryPublicQuery) {
    const where: Prisma.WisdomEntryWhereInput = {
      status: "PUBLISHED",
    };
    if (query.type) where.entryType = query.type as WisdomEntryType;
    if (query.sourceFamily) where.sourceFamily = query.sourceFamily;

    const [data, total] = await Promise.all([
      this.prisma.wisdomEntry.findMany({
        where,
        select: {
          publicId: true,
          title: true,
          slug: true,
          entryType: true,
          sourceFamily: true,
          tags: true,
          publishedAt: true,
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.wisdomEntry.count({ where }),
    ]);

    return { data, meta: { total, limit: query.limit, offset: query.offset } };
  }

  async getPublicWisdomEntry(slugOrPublicId: string) {
    const entry = await this.prisma.wisdomEntry.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug: slugOrPublicId }, { publicId: slugOrPublicId }],
      },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });
    if (!entry) throw new NotFoundException("Bài tri tuệ không tồn tại hoặc chưa xuất bản");
    return entry;
  }

  // ── Admin: Duplicate Check ──────────────────────────────────────────

  async checkDuplicateEntry(input: DuplicateCheckInput, auditContext?: AuditContext) {
    if (!input.sourceCode && !input.sourceUrl && !input.title) {
      throw new BadRequestException(
        "Yêu cầu ít nhất một trường để so khớp: sourceCode, sourceUrl hoặc title.",
      );
    }

    const where: Prisma.WisdomEntryWhereInput = {
      OR: [
        ...(input.sourceCode ? [{ sourceCode: { equals: input.sourceCode, mode: "insensitive" as const } }] : []),
        ...(input.sourceUrl ? [{ sourceUrl: { equals: input.sourceUrl, mode: "insensitive" as const } }] : []),
        ...(input.title ? [{ title: { contains: input.title, mode: "insensitive" as const } }] : []),
      ],
      ...(input.entryType ? { entryType: input.entryType as WisdomEntryType } : {}),
      ...(input.sourceFamily ? { sourceFamily: { equals: input.sourceFamily, mode: "insensitive" as const } } : {}),
    };

    const matches = await this.prisma.wisdomEntry.findMany({
      where,
      select: {
        publicId: true,
        title: true,
        slug: true,
        entryType: true,
        status: true,
        sourceFamily: true,
        sourceCode: true,
        sourceUrl: true,
      },
      take: 10,
    });

    const bestMatch = matches[0] ?? null;

    const response = {
      duplicateFound: matches.length > 0,
      matchCount: matches.length,
      matches,
      matchedPublicId: bestMatch?.publicId ?? null,
      matchedReason: this.buildDuplicateMatchedReason(input, bestMatch),
    };

    if (auditContext) {
      await this.audit.append(auditContext, "admin.wisdom.duplicate_check", "wisdom_entry", undefined, {
        entryType: input.entryType ?? null,
        sourceFamily: input.sourceFamily ?? null,
        sourceCode: input.sourceCode ?? null,
        sourceUrl: input.sourceUrl ?? null,
        title: input.title ?? null,
        duplicateFound: response.duplicateFound,
        matchedPublicId: response.matchedPublicId,
      });
    }

    return response;
  }

  async previewSlug(input: SlugPreviewInput, auditContext: AuditContext) {
    const title = input.titleVietnamese ?? input.titleOriginal;
    if (!title) {
      throw new BadRequestException("Cần nhập titleVietnamese hoặc titleOriginal để gợi ý slug.");
    }

    const suggested = await this.suggestSlug({ title, sourceCode: input.sourceCode }, auditContext);
    const existing = await this.prisma.wisdomEntry.findUnique({
      where: { slug: suggested.slug },
      select: { publicId: true },
    });

    return {
      slug: suggested.slug,
      exists: Boolean(existing),
      conflictWithPublicId: existing?.publicId ?? null,
      dedupeStatus: existing ? "CONFLICT" : "AVAILABLE",
      model: suggested.model,
    };
  }

  async suggestSlug(input: SuggestSlugInput, auditContext: AuditContext) {
    await this.ensureFeatureEnabled("wisdom.ai.slug_suggest.enabled");
    const result = await this.wisdomGemini.suggestSlug(input);
    await this.audit.append(
      auditContext,
      "admin.wisdom.ai.slug_suggest",
      "wisdom_entry",
      undefined,
      {
        title: input.title,
        sourceCode: input.sourceCode ?? null,
        suggestedSlug: result.slug,
        model: result.model,
      },
    );
    return result;
  }

  async checkSlugAvailability(slug: string, excludePublicId?: string): Promise<{ available: boolean }> {
    const existing = await this.prisma.wisdomEntry.findFirst({
      where: { slug, ...(excludePublicId && { publicId: { not: excludePublicId } }) },
    });
    return { available: !existing };
  }

  async listOfflineBundles(query: OfflineBundleListQuery) {
    const manifests = await this.resolveOfflineManifests(query.bundleFamily);
    const startIndex = query.cursor ? Number.parseInt(query.cursor, 10) || 0 : query.offset;
    const items = manifests.slice(startIndex, startIndex + query.limit);
    const nextIndex = startIndex + query.limit;
    const hasMore = nextIndex < manifests.length;

    return {
      items: items.map((manifest) => ({
        publicId: manifest.publicId,
        bundleFamily: manifest.bundleFamily,
        bundleType: manifest.bundleType,
        version: manifest.version,
        lastSyncedAt: manifest.lastSyncedAt,
        freshnessStatus: manifest.freshnessStatus,
        itemCount: manifest.itemCount,
      })),
      meta: {
        pagination: {
          limit: query.limit,
          nextCursor: hasMore ? String(nextIndex) : null,
          hasMore,
        },
      },
    };
  }

  async getOfflineBundleStatus(publicId: string, query: OfflineBundleStatusQuery, userId: string) {
    const manifest = await this.getOfflineManifestByPublicId(publicId);
    if (!manifest) {
      throw new NotFoundException({
        code: "wisdom.offline.bundle_not_found",
        message: "Không tìm thấy offline bundle tương ứng",
      });
    }

    const deviceState = query.deviceFingerprint
      ? await this.cacheService.getJson<{ lastSyncedVersion: string | null }>(
          this.buildBundleDeviceStateKey(userId, publicId, query.deviceFingerprint),
        )
      : null;

    const lastSyncedVersion = query.lastSyncedVersion ?? deviceState?.lastSyncedVersion ?? null;
    const pendingUpdateCount = !lastSyncedVersion
      ? manifest.itemCount
      : lastSyncedVersion === manifest.version
        ? 0
        : manifest.itemCount;

    return {
      publicId: manifest.publicId,
      bundleType: manifest.bundleType,
      version: manifest.version,
      syncStatus: pendingUpdateCount === 0 ? "up_to_date" : lastSyncedVersion ? "outdated" : "not_synced",
      lastSyncedVersion,
      pendingUpdateCount,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async getOfflineBundleDelta(publicId: string, query: OfflineBundleDeltaQuery, userId: string) {
    if (!query.deviceFingerprint) {
      throw new BadRequestException({
        code: "wisdom.offline.device_fingerprint_required",
        message: "Thiếu deviceFingerprint để kiểm tra chênh lệch bundle.",
      });
    }

    const manifest = await this.getOfflineManifestByPublicId(publicId);
    if (!manifest) {
      throw new NotFoundException({
        code: "wisdom.offline.bundle_not_found",
        message: "Không tìm thấy offline bundle tương ứng",
      });
    }

    let isFullSync = true;
    let deltaReason: string | null = null;
    let changes = manifest.manifestItems;

    if (query.fromVersion === manifest.version) {
      isFullSync = false;
      changes = [];
    } else if (query.fromVersion) {
      const fromTimestamp = this.parseVersionTimestamp(query.fromVersion);
      const currentTimestamp = this.parseVersionTimestamp(manifest.version);
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

      if (fromTimestamp === null || currentTimestamp === null || currentTimestamp - fromTimestamp > THIRTY_DAYS_MS) {
        isFullSync = true;
        deltaReason = "wisdom.offline.version_stale";
      } else {
        isFullSync = false;
        changes = await this.listUpdatedOfflineItemsSince(manifest.bundleFamily, new Date(fromTimestamp));
      }
    }

    const deviceStateKey = this.buildBundleDeviceStateKey(userId, publicId, query.deviceFingerprint);
    await this.cacheService.setJson(
      deviceStateKey,
      {
        lastSyncedVersion: query.fromVersion ?? null,
        lastCheckedAt: new Date().toISOString(),
        currentVersion: manifest.version,
      },
      60 * 60 * 24 * 30,
    );

    return {
      publicId: manifest.publicId,
      bundleType: manifest.bundleType,
      bundleFamily: manifest.bundleFamily,
      version: manifest.version,
      isFullSync,
      pendingCount: changes.length,
      deltaReason,
      manifest: {
        itemCount: manifest.itemCount,
        lastSyncedAt: manifest.lastSyncedAt,
        freshnessStatus: manifest.freshnessStatus,
      },
      changes,
    };
  }

  async rebuildOfflineBundles(input: RebuildOfflineBundlesInput, auditContext: AuditContext) {
    if (input.scope === "family" && !input.bundleFamily) {
      throw new BadRequestException("Scope=family yêu cầu truyền bundleFamily.");
    }
    if (input.scope === "entry" && (!input.entryPublicIds || input.entryPublicIds.length === 0)) {
      throw new BadRequestException("Scope=entry yêu cầu danh sách entryPublicIds.");
    }

    const targetFamilies = await this.resolveRebuildFamilies(input);

    for (const family of targetFamilies) {
      await this.cacheService.del(this.buildManifestCacheKey(family));
    }
    await this.cacheService.delByPrefix("wisdom:offline-bundle:device:");

    const recoveryStartedAt = new Date();
    const estimatedCompletionTime = new Date(recoveryStartedAt.getTime() + 2 * 60 * 1000);
    const affectedBundles = targetFamilies.map((family) => `offline-${family}`);

    await this.audit.append(
      auditContext,
      "admin.wisdom.offline_bundle.rebuild",
      "offline_bundle",
      undefined,
      {
        scope: input.scope,
        bundleFamily: input.bundleFamily ?? null,
        affectedBundles,
        reason: input.reason ?? null,
      },
    );

    return {
      recoveryStartedAt: recoveryStartedAt.toISOString(),
      estimatedCompletionTime: estimatedCompletionTime.toISOString(),
      affectedBundles,
    };
  }

  async createTranslationDraft(input: TranslationDraftInput, auditContext: AuditContext) {
    await this.ensureFeatureEnabled("wisdom.ai.translation_draft.enabled");
    const result = await this.wisdomGemini.draftTranslation(input);
    await this.audit.append(
      auditContext,
      "admin.wisdom.ai.translation_draft",
      "wisdom_entry",
      undefined,
      {
        title: input.title ?? null,
        sourceCode: input.sourceCode ?? null,
        originalLength: input.originalText.length,
        translatedLength: result.translatedText.length,
        model: result.model,
      },
    );
    return result;
  }

  private async ensureFeatureEnabled(flag: "wisdom.ai.slug_suggest.enabled" | "wisdom.ai.translation_draft.enabled") {
    const enabled = await this.featureFlags.isEnabled(flag);
    if (!enabled) {
      throw new ForbiddenError("Tính năng AI đang tắt bởi feature flag");
    }
  }

  private buildDuplicateMatchedReason(input: DuplicateCheckInput, match: { sourceCode: string | null; sourceUrl: string | null } | null): string {
    if (!match) return "NO_MATCH";
    if (input.sourceCode && match.sourceCode && input.sourceCode.toLowerCase() === match.sourceCode.toLowerCase()) {
      return "SOURCE_CODE_MATCH";
    }
    if (input.sourceUrl && match.sourceUrl && input.sourceUrl.toLowerCase() === match.sourceUrl.toLowerCase()) {
      return "SOURCE_URL_MATCH";
    }
    return "TITLE_SIMILARITY_MATCH";
  }

  private async resolveOfflineManifests(bundleFamily?: OfflineBundleFamily) {
    const families = bundleFamily ? [bundleFamily] : WisdomQaService.OFFLINE_FAMILIES;
    return Promise.all(families.map((family) => this.buildOfflineManifest(family)));
  }

  private async getOfflineManifestByPublicId(publicId: string): Promise<OfflineBundleManifest | null> {
    const family = WisdomQaService.OFFLINE_FAMILIES.find((item) => `offline-${item}` === publicId);
    if (!family) return null;
    return this.buildOfflineManifest(family);
  }

  private async buildOfflineManifest(family: OfflineBundleFamily): Promise<OfflineBundleManifest> {
    const cacheKey = this.buildManifestCacheKey(family);
    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const where = this.buildOfflineBundleWhere(family);

      const [latest, total, entries] = await Promise.all([
        this.prisma.wisdomEntry.findFirst({
          where,
          select: { updatedAt: true },
          orderBy: { updatedAt: "desc" },
        }),
        this.prisma.wisdomEntry.count({ where }),
        this.prisma.wisdomEntry.findMany({
          where,
          select: {
            publicId: true,
            slug: true,
            title: true,
            entryType: true,
            sourceFamily: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 1000,
        }),
      ]);

      const version = `${latest?.updatedAt.getTime() ?? 0}-${total}`;
      const bundleType: OfflineBundleManifest["bundleType"] =
        family === "baihua" ? "BACH_THOAI" : family === "practices" ? "PRACTICE_SUPPORT" : "WISDOM";

      return {
        publicId: `offline-${family}`,
        bundleFamily: family,
        bundleType,
        version,
        itemCount: total,
        lastSyncedAt: latest?.updatedAt.toISOString() ?? null,
        freshnessStatus: total === 0 ? "empty" : "healthy",
        truncated: total > entries.length,
        manifestItems: entries.map((entry) => ({
          publicId: entry.publicId,
          slug: entry.slug,
          title: entry.title,
          entryType: entry.entryType,
          sourceFamily: entry.sourceFamily,
          updatedAt: entry.updatedAt.toISOString(),
        })),
      };
    });
  }

  private buildOfflineBundleWhere(family: OfflineBundleFamily): Prisma.WisdomEntryWhereInput {
    if (family === "baihua") {
      return { status: "PUBLISHED", entryType: "BACH_THOAI" };
    }
    if (family === "wisdom") {
      return {
        status: "PUBLISHED",
        entryType: { in: ["KHAI_THI", "PHAT_NGON", "PHAP_HOI"] },
      };
    }
    return {
      status: "PUBLISHED",
      OR: [
        { sourceFamily: { contains: "practice", mode: "insensitive" } },
        { tags: { has: "practice" } },
      ],
    };
  }

  private async listUpdatedOfflineItemsSince(family: OfflineBundleFamily, fromDate: Date): Promise<OfflineBundleManifestItem[]> {
    const where: Prisma.WisdomEntryWhereInput = {
      ...this.buildOfflineBundleWhere(family),
      updatedAt: { gt: fromDate },
    };

    const entries = await this.prisma.wisdomEntry.findMany({
      where,
      select: {
        publicId: true,
        slug: true,
        title: true,
        entryType: true,
        sourceFamily: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "asc" },
      take: 1000,
    });

    return entries.map((entry) => ({
      publicId: entry.publicId,
      slug: entry.slug,
      title: entry.title,
      entryType: entry.entryType,
      sourceFamily: entry.sourceFamily,
      updatedAt: entry.updatedAt.toISOString(),
    }));
  }

  private async resolveRebuildFamilies(input: RebuildOfflineBundlesInput): Promise<OfflineBundleFamily[]> {
    if (input.scope === "all") {
      return [...WisdomQaService.OFFLINE_FAMILIES];
    }

    if (input.scope === "family") {
      return [input.bundleFamily as OfflineBundleFamily];
    }

    const entries = await this.prisma.wisdomEntry.findMany({
      where: { publicId: { in: input.entryPublicIds ?? [] } },
      select: { entryType: true, sourceFamily: true, tags: true },
    });

    const families = new Set<OfflineBundleFamily>();
    for (const entry of entries) {
      if (entry.entryType === "BACH_THOAI") {
        families.add("baihua");
      } else {
        families.add("wisdom");
      }
      if (entry.sourceFamily?.toLowerCase().includes("practice") || entry.tags.includes("practice")) {
        families.add("practices");
      }
    }

    return families.size > 0 ? [...families] : [...WisdomQaService.OFFLINE_FAMILIES];
  }

  private parseVersionTimestamp(version: string): number | null {
    const [timestampRaw] = version.split("-", 1);
    const parsed = Number.parseInt(timestampRaw ?? "", 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private buildManifestCacheKey(family: OfflineBundleFamily): string {
    return `wisdom:offline-bundle:manifest:${family}`;
  }

  private buildBundleDeviceStateKey(userId: string, publicId: string, deviceFingerprint: string): string {
    return `wisdom:offline-bundle:device:${userId}:${publicId}:${deviceFingerprint}`;
  }
}
