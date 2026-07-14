import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { StorageService } from "../../../platform/storage/storage.service.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";
import type { ContentStatus, PracticeGuideLevel } from "../../../generated/prisma/client.js";
import { DailyPracticeRepository } from "./daily-practice.repository.js";
import { mapGuideToResponse, mapPresetToResponse, mapFaqToResponse } from "./daily-practice.mapper.js";
import type {
  ListGuidesQuery,
  CreateGuideInput,
  UpdateGuideInput,
  CreatePresetInput,
  UpdatePresetInput,
  CreateFaqInput,
  UpdateFaqInput,
  GuideResponse,
  PresetResponse,
  FaqResponse,
  OverviewResponse,
} from "./daily-practice.schemas.js";

@Injectable()
export class DailyPracticeService {
  constructor(
    private readonly repository: DailyPracticeRepository,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  // ── Overview ──────────────────────────────────────────────────────────────

  async getOverview(): Promise<OverviewResponse> {
    const { totalGuides, publishedGuides, totalPresets, totalFaqs } =
      await this.repository.countOverview();
    return {
      guides: { total: totalGuides, published: publishedGuides },
      presets: { total: totalPresets },
      faqs: { total: totalFaqs },
    };
  }

  // ── Guides ────────────────────────────────────────────────────────────────

  async listGuides(query: ListGuidesQuery) {
    const { guides, total } = await this.repository.findGuides({
      status: query.status as ContentStatus | undefined,
      difficulty: query.difficulty as PracticeGuideLevel | undefined,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    const data = await Promise.all(guides.map((g) => this.toGuideResponse(g)));

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

  async getGuide(publicId: string): Promise<GuideResponse> {
    const guide = await this.repository.findGuideByPublicId(publicId);
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");
    return this.toGuideResponse(guide);
  }

  async createGuide(input: CreateGuideInput, auditContext: AuditContext): Promise<GuideResponse> {
    const publicId = nanoid(21);
    let slug = input.slug ?? this.generateSlug(input.title, publicId);
    const scriptureImageMediaId = await this.resolveMediaIdByPublicId(
      input.scriptureImageMediaPublicId,
    );

    const existing = await this.repository.findGuideBySlug(slug);
    if (existing) {
      slug = `${slug}-${publicId}`;
    }

    // Write + audit in one transaction: if the audit chain append fails, the
    // guide insert rolls back so we never persist an unaudited write.
    const created = await this.repository.runInTransaction(async (tx) => {
      const guide = await this.repository.createGuide(
        {
          publicId,
          title: input.title,
          slug,
          body: input.body,
          ...(scriptureImageMediaId !== undefined && { scriptureImageMediaId }),
          duration: input.duration,
          difficulty: input.difficulty as PracticeGuideLevel,
          sortOrder: input.sortOrder,
        },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.guide.create",
        "practice_guide",
        publicId,
      );
      return guide;
    });

    return this.toGuideResponse(created);
  }

  async updateGuide(
    publicId: string,
    input: UpdateGuideInput,
    auditContext: AuditContext,
  ): Promise<GuideResponse> {
    const guide = await this.repository.findGuideByPublicId(publicId);
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");

    const scriptureImageMediaId = await this.resolveMediaIdByPublicId(
      input.scriptureImageMediaPublicId,
    );

    // A DRAFT→PUBLISHED transition is a distinct, higher-signal audit event.
    const isPublishing = input.status === "PUBLISHED" && guide.status !== "PUBLISHED";

    const updated = await this.repository.runInTransaction(async (tx) => {
      const result = await this.repository.updateGuide(
        publicId,
        {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.body !== undefined && { body: input.body }),
          ...(scriptureImageMediaId !== undefined && { scriptureImageMediaId }),
          ...(input.duration !== undefined && { duration: input.duration }),
          ...(input.difficulty !== undefined && {
            difficulty: input.difficulty as PracticeGuideLevel,
          }),
          ...(input.status !== undefined && {
            status: input.status as ContentStatus,
            publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
          }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        },
        tx,
      );
      if (isPublishing) {
        await this.audit.appendInTransaction(
          tx,
          auditContext,
          "admin.daily_practice.guide.publish",
          "practice_guide",
          publicId,
          { before: { status: guide.status }, after: { status: "PUBLISHED" } },
        );
      } else {
        await this.audit.appendInTransaction(
          tx,
          auditContext,
          "admin.daily_practice.guide.update",
          "practice_guide",
          publicId,
        );
      }
      return result;
    });

    return this.toGuideResponse(updated);
  }

  async deleteGuide(publicId: string, auditContext: AuditContext): Promise<void> {
    const guide = await this.repository.findGuideByPublicId(publicId);
    if (!guide) throw new NotFoundException("Hướng dẫn tu tập không tồn tại");
    await this.repository.runInTransaction(async (tx) => {
      await this.repository.deleteGuide(publicId, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.guide.delete",
        "practice_guide",
        publicId,
        { title: guide.title, slug: guide.slug, status: guide.status },
      );
    });
  }

  // ── Presets ───────────────────────────────────────────────────────────────

  async listPresets() {
    const presets = await this.repository.findPresets();
    return { data: presets.map(mapPresetToResponse) };
  }

  async getPreset(publicId: string): Promise<PresetResponse> {
    const preset = await this.repository.findPresetByPublicId(publicId);
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");
    return mapPresetToResponse(preset);
  }

  async createPreset(input: CreatePresetInput, auditContext: AuditContext): Promise<PresetResponse> {
    const publicId = nanoid(21);
    const created = await this.repository.runInTransaction(async (tx) => {
      const preset = await this.repository.createPreset(
        {
          publicId,
          name: input.name,
          scenarioType: input.scenarioType,
          practiceCount: input.practiceCount,
          guideIds: input.guideIds,
        },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.preset.create",
        "scenario_preset",
        publicId,
      );
      return preset;
    });
    return mapPresetToResponse(created);
  }

  async updatePreset(
    publicId: string,
    input: UpdatePresetInput,
    auditContext: AuditContext,
  ): Promise<PresetResponse> {
    const preset = await this.repository.findPresetByPublicId(publicId);
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");

    const updated = await this.repository.runInTransaction(async (tx) => {
      const result = await this.repository.updatePreset(
        publicId,
        {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.scenarioType !== undefined && { scenarioType: input.scenarioType }),
          ...(input.practiceCount !== undefined && { practiceCount: input.practiceCount }),
          ...(input.guideIds !== undefined && { guideIds: input.guideIds }),
        },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.preset.update",
        "scenario_preset",
        publicId,
      );
      return result;
    });
    return mapPresetToResponse(updated);
  }

  async deletePreset(publicId: string, auditContext: AuditContext): Promise<void> {
    const preset = await this.repository.findPresetByPublicId(publicId);
    if (!preset) throw new NotFoundException("Kịch bản tu tập không tồn tại");
    await this.repository.runInTransaction(async (tx) => {
      await this.repository.deletePreset(publicId, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.preset.delete",
        "scenario_preset",
        publicId,
        { name: preset.name },
      );
    });
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────

  async listFaq() {
    const faqs = await this.repository.findFaqs();
    return { data: faqs.map(mapFaqToResponse) };
  }

  async getFaq(publicId: string): Promise<FaqResponse> {
    const faq = await this.repository.findFaqByPublicId(publicId);
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");
    return mapFaqToResponse(faq);
  }

  async createFaq(input: CreateFaqInput, auditContext: AuditContext): Promise<FaqResponse> {
    const publicId = nanoid(21);
    const created = await this.repository.runInTransaction(async (tx) => {
      const row = await this.repository.createFaq(
        {
          publicId,
          question: input.question,
          answer: input.answer,
          category: input.category,
          featured: input.featured,
          sortOrder: input.sortOrder,
        },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.faq.create",
        "practice_faq",
        publicId,
      );
      return row;
    });
    return mapFaqToResponse(created);
  }

  async updateFaq(
    publicId: string,
    input: UpdateFaqInput,
    auditContext: AuditContext,
  ): Promise<FaqResponse> {
    const faq = await this.repository.findFaqByPublicId(publicId);
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");

    const updated = await this.repository.runInTransaction(async (tx) => {
      const row = await this.repository.updateFaq(
        publicId,
        {
          ...(input.question !== undefined && { question: input.question }),
          ...(input.answer !== undefined && { answer: input.answer }),
          ...(input.category !== undefined && { category: input.category }),
          ...(input.featured !== undefined && { featured: input.featured }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.faq.update",
        "practice_faq",
        publicId,
      );
      return row;
    });
    return mapFaqToResponse(updated);
  }

  async deleteFaq(publicId: string, auditContext: AuditContext): Promise<void> {
    const faq = await this.repository.findFaqByPublicId(publicId);
    if (!faq) throw new NotFoundException("Mục hỏi đáp không tồn tại");
    await this.repository.runInTransaction(async (tx) => {
      await this.repository.deleteFaq(publicId, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "admin.daily_practice.faq.delete",
        "practice_faq",
        publicId,
        { question: faq.question },
      );
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  generateSlug(title: string, publicId: string): string {
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

  private async resolveMediaIdByPublicId(
    publicId: string | null | undefined,
  ): Promise<string | null | undefined> {
    if (publicId === undefined) return undefined;
    if (publicId === null || publicId.trim().length === 0) return null;
    const asset = await this.storage.getAsset(publicId);
    if (!asset) throw new NotFoundException("Ảnh/bản kinh đã chọn không tồn tại");
    return asset.id;
  }

  private async toGuideResponse(
    guide: Parameters<typeof mapGuideToResponse>[0],
  ): Promise<GuideResponse> {
    const media = guide.scriptureImageMedia ?? null;
    const scriptureImageUrl =
      (await this.storage.resolveAssetUrl(media?.publicId)) ?? media?.url ?? null;
    return mapGuideToResponse(guide, scriptureImageUrl);
  }
}
