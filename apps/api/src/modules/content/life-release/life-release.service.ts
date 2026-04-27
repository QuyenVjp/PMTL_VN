import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

import { InternalError } from "../../../common/errors/app-error.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";
import { LIFE_RELEASE_SEED } from "./life-release.seed.js";
import {
  lifeReleaseOverviewSchema,
  type LifeReleaseOverviewDto,
  type LifeReleaseGuideDto,
  type LifeReleaseVariantDto,
  type LifeReleaseFaqDto,
  type CreateLifeReleaseGuideInput,
  type UpdateLifeReleaseGuideInput,
  type CreateLifeReleaseVariantInput,
  type UpdateLifeReleaseVariantInput,
  type CreateLifeReleaseFaqInput,
  type UpdateLifeReleaseFaqInput,
  type PublishLifeReleaseInput,
  type LifeReleaseGuideGroup,
} from "./life-release.schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNTIME_FILE_PATH = join(__dirname, "..", "..", "..", "..", "data", "runtime", "life-release.runtime.json");

@Injectable()
export class LifeReleaseContentService {
  private readonly logger = new Logger(LifeReleaseContentService.name);

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
    await this.saveOverview(LIFE_RELEASE_SEED);
  }

  private async loadOverview(): Promise<LifeReleaseOverviewDto> {
    await this.ensureRuntimeFile();
    try {
      const raw = await readFile(RUNTIME_FILE_PATH, "utf-8");
      return lifeReleaseOverviewSchema.parse(JSON.parse(raw));
    } catch (error) {
      this.logger.error({ err: error }, "Failed to load life-release runtime file");
      throw new InternalError("Không thể tải dữ liệu Phóng sanh");
    }
  }

  private async saveOverview(overview: LifeReleaseOverviewDto): Promise<void> {
    try {
      await writeFile(RUNTIME_FILE_PATH, `${JSON.stringify(overview, null, 2)}\n`, "utf-8");
    } catch (error) {
      this.logger.error({ err: error }, "Failed to save life-release runtime file");
      throw new InternalError("Không thể lưu dữ liệu Phóng sanh");
    }
  }

  private normalizeOverview(overview: LifeReleaseOverviewDto): LifeReleaseOverviewDto {
    return {
      ...overview,
      guides: [...overview.guides].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title, "vi")),
      ritualVariants: [...overview.ritualVariants].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, "vi")),
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
      routeGroups: ["nghi-thuc-co-ban", "cho-ban-than", "cho-nguoi-khac", "luu-y-va-chuan-bi", "xu-ly-khi-co-loai-vat-tu-vong", "hoi-dap"],
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
    return this.normalizeOverview(await this.loadOverview()).guides;
  }

  async getGuideBySlug(slug: string) {
    const overview = await this.loadOverview();
    const guide = overview.guides.find((item) => item.slug === slug);
    if (!guide) throw new NotFoundException("Guide Phóng sanh không tồn tại");
    return guide;
  }

  async getGuideGroup(groupKey: LifeReleaseGuideGroup) {
    const overview = this.normalizeOverview(await this.loadOverview());
    return { groupKey, items: overview.guides.filter((guide) => guide.groupKey === groupKey) };
  }

  async getRitualVariants() {
    return this.normalizeOverview(await this.loadOverview()).ritualVariants;
  }

  async getFaq() {
    return this.normalizeOverview(await this.loadOverview()).faq;
  }

  async getDownloads() {
    return this.normalizeOverview(await this.loadOverview()).downloads;
  }

  async adminGetOverview() {
    return this.normalizeOverview(await this.loadOverview());
  }

  async adminCreateGuide(input: CreateLifeReleaseGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const guide: LifeReleaseGuideDto = {
      publicId: nanoid(12),
      slug: input.slug ?? this.slugify(input.title),
      title: input.title,
      summary: input.summary,
      groupKey: input.groupKey,
      sourceReference: input.sourceReference,
      reviewNote: input.reviewNote,
      warningNotes: input.warningNotes,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.guides.push(guide);
    overview.updatedAt = guide.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.guide.create", "life_release_guide", guide.publicId);
    return guide;
  }

  async adminUpdateGuide(publicId: string, input: UpdateLifeReleaseGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.guides.findIndex((guide) => guide.publicId === publicId);
    if (index === -1) throw new NotFoundException("Guide Phóng sanh không tồn tại");

    const updated: LifeReleaseGuideDto = {
      ...overview.guides[index],
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.groupKey !== undefined && { groupKey: input.groupKey }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.reviewNote !== undefined && { reviewNote: input.reviewNote }),
      ...(input.warningNotes !== undefined && { warningNotes: input.warningNotes }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.guides[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.guide.update", "life_release_guide", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminCreateVariant(input: CreateLifeReleaseVariantInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const variant: LifeReleaseVariantDto = {
      publicId: nanoid(12),
      name: input.name,
      summary: input.summary,
      routeSlug: input.routeSlug,
      sourceReference: input.sourceReference,
      reviewNote: input.reviewNote,
      warningNotes: input.warningNotes,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.ritualVariants.push(variant);
    overview.updatedAt = variant.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.variant.create", "life_release_variant", variant.publicId);
    return variant;
  }

  async adminUpdateVariant(publicId: string, input: UpdateLifeReleaseVariantInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.ritualVariants.findIndex((variant) => variant.publicId === publicId);
    if (index === -1) throw new NotFoundException("Variant Phóng sanh không tồn tại");

    const updated: LifeReleaseVariantDto = {
      ...overview.ritualVariants[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.routeSlug !== undefined && { routeSlug: input.routeSlug }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.reviewNote !== undefined && { reviewNote: input.reviewNote }),
      ...(input.warningNotes !== undefined && { warningNotes: input.warningNotes }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.ritualVariants[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.variant.update", "life_release_variant", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminCreateFaq(input: CreateLifeReleaseFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const faq: LifeReleaseFaqDto = {
      publicId: nanoid(12),
      question: input.question,
      answer: input.answer,
      sourceReference: input.sourceReference,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.faq.push(faq);
    overview.updatedAt = faq.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.faq.create", "life_release_faq", faq.publicId);
    return faq;
  }

  async adminUpdateFaq(publicId: string, input: UpdateLifeReleaseFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.faq.findIndex((faq) => faq.publicId === publicId);
    if (index === -1) throw new NotFoundException("FAQ Phóng sanh không tồn tại");

    const updated: LifeReleaseFaqDto = {
      ...overview.faq[index],
      ...(input.question !== undefined && { question: input.question }),
      ...(input.answer !== undefined && { answer: input.answer }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.faq[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Phóng sanh";
    await this.saveOverview(lifeReleaseOverviewSchema.parse(overview));
    await this.auditService.append(auditContext, "admin.life_release.faq.update", "life_release_faq", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminPublish(input: PublishLifeReleaseInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const updated = lifeReleaseOverviewSchema.parse({
      ...overview,
      status: input.status,
      updatedAt: new Date().toISOString(),
      updatedByLabel: "Biên tập Phóng sanh",
      versionNotes: [`${input.status === "PUBLISHED" ? "Publish" : "Unpublish"}: ${input.changeSummary}`, ...overview.versionNotes].slice(0, 10),
    });

    await this.saveOverview(updated);
    await this.auditService.append(
      auditContext,
      input.status === "PUBLISHED" ? "admin.life_release.publish" : "admin.life_release.unpublish",
      "life_release_workspace",
      updated.publicId,
      { changeSummary: input.changeSummary },
    );
    return updated;
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
