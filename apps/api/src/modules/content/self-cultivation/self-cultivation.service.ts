import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

import { InternalError } from "../../../common/errors/app-error.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";
import { SELF_CULTIVATION_SEED } from "./self-cultivation.seed.js";
import {
  selfCultivationOverviewSchema,
  type SelfCultivationOverviewDto,
  type SelfCultivationGuideDto,
  type SelfCultivationFaqDto,
  type CreateSelfCultivationGuideInput,
  type UpdateSelfCultivationGuideInput,
  type CreateSelfCultivationFaqInput,
  type UpdateSelfCultivationFaqInput,
  type PublishSelfCultivationInput,
  type SelfCultivationGuideGroup,
} from "./self-cultivation.schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNTIME_FILE_PATH = join(__dirname, "..", "..", "..", "..", "data", "runtime", "self-cultivation.runtime.json");

function slugConflictException() {
  return new ConflictException({
    code: "platform.conflict",
    message: "Slug này đã được dùng.",
    detail: {
      properties: { slug: { errors: ["Slug này đã được dùng."] } },
      fieldErrors: { slug: "Slug này đã được dùng." },
      fields: ["slug"],
    },
  });
}

@Injectable()
export class SelfCultivationService {
  private readonly logger = new Logger(SelfCultivationService.name);

  constructor(private readonly auditService: AuditService) {}

  private async runtimeFileExists(): Promise<boolean> {
    try {
      await access(RUNTIME_FILE_PATH, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureRuntimeFile(): Promise<void> {
    if (await this.runtimeFileExists()) return;
    await this.saveOverview(SELF_CULTIVATION_SEED);
  }

  private async loadOverview(): Promise<SelfCultivationOverviewDto> {
    await this.ensureRuntimeFile();
    try {
      const raw = await readFile(RUNTIME_FILE_PATH, "utf-8");
      return selfCultivationOverviewSchema.parse(JSON.parse(raw));
    } catch (error) {
      this.logger.error({ err: error }, "Failed to load self-cultivation runtime file");
      throw new InternalError("Không thể tải dữ liệu Kinh văn tự tu");
    }
  }

  private async saveOverview(overview: SelfCultivationOverviewDto): Promise<void> {
    try {
      await writeFile(RUNTIME_FILE_PATH, `${JSON.stringify(overview, null, 2)}\n`, "utf-8");
    } catch (error) {
      this.logger.error({ err: error }, "Failed to save self-cultivation runtime file");
      throw new InternalError("Không thể lưu dữ liệu Kinh văn tự tu");
    }
  }

  private normalizeOverview(overview: SelfCultivationOverviewDto): SelfCultivationOverviewDto {
    return {
      ...overview,
      guides: [...overview.guides].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title, "vi")),
      faq: [...overview.faq].sort((a, b) => a.displayOrder - b.displayOrder || a.question.localeCompare(b.question, "vi")),
      downloads: [...overview.downloads].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title, "vi")),
    };
  }

  async getHubPage() {
    const overview = this.normalizeOverview(await this.loadOverview());
    return {
      slug: overview.slug,
      title: overview.title,
      status: overview.status,
      routeGroups: ["bat-dau", "cach-dung", "bao-quan", "truong-hop-su-dung", "tai-xuong"],
      boundarySummary: overview.boundarySummary,
      updatedAt: overview.updatedAt,
    };
  }

  async getGuideMap() {
    const overview = this.normalizeOverview(await this.loadOverview());
    return overview.guides.map((guide) => ({
      publicId: guide.publicId,
      slug: guide.slug,
      title: guide.title,
      groupKey: guide.groupKey,
      sourceReference: guide.sourceReference,
    }));
  }

  async getGuides() {
    const overview = this.normalizeOverview(await this.loadOverview());
    return overview.guides;
  }

  async getGuideBySlug(slug: string) {
    const overview = await this.loadOverview();
    const guide = overview.guides.find((item) => item.slug === slug);
    if (!guide) throw new NotFoundException("Guide Kinh văn tự tu không tồn tại");
    return guide;
  }

  async getGuideGroup(groupKey: SelfCultivationGuideGroup) {
    const overview = this.normalizeOverview(await this.loadOverview());
    return {
      groupKey,
      items: overview.guides.filter((guide) => guide.groupKey === groupKey),
    };
  }

  async getFaq() {
    const overview = this.normalizeOverview(await this.loadOverview());
    return overview.faq;
  }

  async getDownloads() {
    const overview = this.normalizeOverview(await this.loadOverview());
    return overview.downloads;
  }

  async adminGetOverview() {
    return this.normalizeOverview(await this.loadOverview());
  }

  async adminCreateGuide(input: CreateSelfCultivationGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const slug = input.slug ?? this.slugify(input.title);
    this.assertGuideSlugAvailable(overview.guides, slug);

    const guide: SelfCultivationGuideDto = {
      publicId: nanoid(12),
      slug,
      title: input.title,
      summary: input.summary,
      groupKey: input.groupKey,
      sourceReference: input.sourceReference,
      boundaryNote: input.boundaryNote,
      warningNotes: input.warningNotes,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.guides.push(guide);
    overview.updatedAt = guide.updatedAt;
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.guide.create", "self_cultivation_guide", guide.publicId, {
      slug: guide.slug,
      groupKey: guide.groupKey,
    });

    return guide;
  }

  async adminUpdateGuide(publicId: string, input: UpdateSelfCultivationGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.guides.findIndex((guide) => guide.publicId === publicId);
    if (index === -1) throw new NotFoundException("Guide Kinh văn tự tu không tồn tại");

    const existing = overview.guides[index];
    const nextSlug = input.slug ?? existing.slug;
    if (nextSlug !== existing.slug) this.assertGuideSlugAvailable(overview.guides.filter((guide) => guide.publicId !== publicId), nextSlug);

    const updated: SelfCultivationGuideDto = {
      ...existing,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.groupKey !== undefined && { groupKey: input.groupKey }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.boundaryNote !== undefined && { boundaryNote: input.boundaryNote }),
      ...(input.warningNotes !== undefined && { warningNotes: input.warningNotes }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.guides[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.guide.update", "self_cultivation_guide", updated.publicId, {
      slug: updated.slug,
      updatedFields: Object.keys(input),
    });

    return updated;
  }

  async adminDeleteGuide(publicId: string, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.guides.findIndex((guide) => guide.publicId === publicId);
    if (index === -1) throw new NotFoundException("Guide Kinh văn tự tu không tồn tại");

    const [deleted] = overview.guides.splice(index, 1);
    overview.updatedAt = new Date().toISOString();
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.guide.delete", "self_cultivation_guide", publicId, {
      title: deleted.title,
      slug: deleted.slug,
    });
    return { publicId };
  }

  async adminCreateFaq(input: CreateSelfCultivationFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const faq: SelfCultivationFaqDto = {
      publicId: nanoid(12),
      question: input.question,
      answer: input.answer,
      sourceReference: input.sourceReference,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.faq.push(faq);
    overview.updatedAt = faq.updatedAt;
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.faq.create", "self_cultivation_faq", faq.publicId);
    return faq;
  }

  async adminUpdateFaq(publicId: string, input: UpdateSelfCultivationFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.faq.findIndex((faq) => faq.publicId === publicId);
    if (index === -1) throw new NotFoundException("FAQ Kinh văn tự tu không tồn tại");

    const updated: SelfCultivationFaqDto = {
      ...overview.faq[index],
      ...(input.question !== undefined && { question: input.question }),
      ...(input.answer !== undefined && { answer: input.answer }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.faq[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.faq.update", "self_cultivation_faq", updated.publicId, {
      updatedFields: Object.keys(input),
    });

    return updated;
  }

  async adminDeleteFaq(publicId: string, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.faq.findIndex((faq) => faq.publicId === publicId);
    if (index === -1) throw new NotFoundException("FAQ Kinh văn tự tu không tồn tại");

    const [deleted] = overview.faq.splice(index, 1);
    overview.updatedAt = new Date().toISOString();
    overview.updatedByLabel = "Biên tập Kinh Văn Tự Tu";
    await this.saveOverview(selfCultivationOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.self_cultivation.faq.delete", "self_cultivation_faq", publicId, {
      question: deleted.question,
    });
    return { publicId };
  }

  async adminPublish(input: PublishSelfCultivationInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const updated = selfCultivationOverviewSchema.parse({
      ...overview,
      status: input.status,
      updatedAt: new Date().toISOString(),
      updatedByLabel: "Biên tập Kinh Văn Tự Tu",
      versionNotes: [`${input.status === "PUBLISHED" ? "Publish" : "Unpublish"}: ${input.changeSummary}`, ...overview.versionNotes].slice(0, 10),
    });

    await this.saveOverview(updated);
    await this.auditService.append(auditContext, input.status === "PUBLISHED" ? "admin.self_cultivation.publish" : "admin.self_cultivation.unpublish", "self_cultivation_workspace", updated.publicId, {
      changeSummary: input.changeSummary,
    });

    return updated;
  }

  async checkGuideSlugAvailability(slug: string, excludeSlug?: string): Promise<{ available: boolean }> {
    const overview = this.normalizeOverview(await this.loadOverview());
    const taken = overview.guides.some(
      (guide: SelfCultivationGuideDto) => guide.slug === slug && guide.slug !== excludeSlug,
    );
    return { available: !taken };
  }

  private assertGuideSlugAvailable(guides: SelfCultivationGuideDto[], slug: string) {
    if (guides.some((guide) => guide.slug === slug)) {
      throw slugConflictException();
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }
}
