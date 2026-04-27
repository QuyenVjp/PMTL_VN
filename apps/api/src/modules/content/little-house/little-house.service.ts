import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

import { InternalError } from "../../../common/errors/app-error.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";
import { LITTLE_HOUSE_SEED } from "./little-house.seed.js";
import {
  littleHouseOverviewSchema,
  type LittleHouseOverviewDto,
  type LittleHouseGuideDto,
  type LittleHouseCaseVariantDto,
  type LittleHouseFaqDto,
  type CreateLittleHouseGuideInput,
  type UpdateLittleHouseGuideInput,
  type CreateLittleHouseCaseVariantInput,
  type UpdateLittleHouseCaseVariantInput,
  type CreateLittleHouseFaqInput,
  type UpdateLittleHouseFaqInput,
  type PublishLittleHouseInput,
  type LittleHouseGuideGroup,
} from "./little-house.schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUNTIME_FILE_PATH = join(__dirname, "..", "..", "..", "..", "data", "runtime", "little-house.runtime.json");

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
export class LittleHouseService {
  private readonly logger = new Logger(LittleHouseService.name);

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
    await this.saveOverview(LITTLE_HOUSE_SEED);
  }

  private async loadOverview(): Promise<LittleHouseOverviewDto> {
    await this.ensureRuntimeFile();
    try {
      const raw = await readFile(RUNTIME_FILE_PATH, "utf-8");
      return littleHouseOverviewSchema.parse(JSON.parse(raw));
    } catch (error) {
      this.logger.error({ err: error }, "Failed to load little-house runtime file");
      throw new InternalError("Không thể tải dữ liệu Ngôi Nhà Nhỏ");
    }
  }

  private async saveOverview(overview: LittleHouseOverviewDto): Promise<void> {
    try {
      await writeFile(RUNTIME_FILE_PATH, `${JSON.stringify(overview, null, 2)}\n`, "utf-8");
    } catch (error) {
      this.logger.error({ err: error }, "Failed to save little-house runtime file");
      throw new InternalError("Không thể lưu dữ liệu Ngôi Nhà Nhỏ");
    }
  }

  private normalizeOverview(overview: LittleHouseOverviewDto): LittleHouseOverviewDto {
    return {
      ...overview,
      guides: [...overview.guides].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title, "vi")),
      caseVariants: [...overview.caseVariants].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, "vi")),
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
      routeGroups: ["bat-dau", "tri-tung", "dot-va-hau-xu-ly", "tra-cuu", "thuc-hanh"],
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
    if (!guide) throw new NotFoundException("Guide Ngôi Nhà Nhỏ không tồn tại");
    return guide;
  }

  async getGuideGroup(groupKey: LittleHouseGuideGroup) {
    const overview = this.normalizeOverview(await this.loadOverview());
    return { groupKey, items: overview.guides.filter((guide) => guide.groupKey === groupKey) };
  }

  async getCaseVariants() {
    return this.normalizeOverview(await this.loadOverview()).caseVariants;
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

  async adminCreateGuide(input: CreateLittleHouseGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const slug = input.slug ?? this.slugify(input.title);
    this.assertGuideSlugAvailable(overview.guides, slug);

    const guide: LittleHouseGuideDto = {
      publicId: nanoid(12),
      slug,
      title: input.title,
      summary: input.summary,
      groupKey: input.groupKey,
      sourceReference: input.sourceReference,
      versionNote: input.versionNote,
      warningNotes: input.warningNotes,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.guides.push(guide);
    overview.updatedAt = guide.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.guide.create", "little_house_guide", guide.publicId, {
      slug: guide.slug,
      groupKey: guide.groupKey,
    });
    return guide;
  }

  async adminUpdateGuide(publicId: string, input: UpdateLittleHouseGuideInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.guides.findIndex((guide) => guide.publicId === publicId);
    if (index === -1) throw new NotFoundException("Guide Ngôi Nhà Nhỏ không tồn tại");

    const existing = overview.guides[index];
    const nextSlug = input.slug ?? existing.slug;
    if (nextSlug !== existing.slug) this.assertGuideSlugAvailable(overview.guides.filter((guide) => guide.publicId !== publicId), nextSlug);

    const updated: LittleHouseGuideDto = {
      ...existing,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.groupKey !== undefined && { groupKey: input.groupKey }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.versionNote !== undefined && { versionNote: input.versionNote }),
      ...(input.warningNotes !== undefined && { warningNotes: input.warningNotes }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.guides[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.guide.update", "little_house_guide", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminCreateCaseVariant(input: CreateLittleHouseCaseVariantInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const variant: LittleHouseCaseVariantDto = {
      publicId: nanoid(12),
      name: input.name,
      summary: input.summary,
      relatedGroup: input.relatedGroup,
      sourceReference: input.sourceReference,
      reviewNote: input.reviewNote,
      warningNotes: input.warningNotes,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.caseVariants.push(variant);
    overview.updatedAt = variant.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.variant.create", "little_house_variant", variant.publicId);
    return variant;
  }

  async adminUpdateCaseVariant(publicId: string, input: UpdateLittleHouseCaseVariantInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.caseVariants.findIndex((variant) => variant.publicId === publicId);
    if (index === -1) throw new NotFoundException("Case variant Ngôi Nhà Nhỏ không tồn tại");

    const updated: LittleHouseCaseVariantDto = {
      ...overview.caseVariants[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.relatedGroup !== undefined && { relatedGroup: input.relatedGroup }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.reviewNote !== undefined && { reviewNote: input.reviewNote }),
      ...(input.warningNotes !== undefined && { warningNotes: input.warningNotes }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.caseVariants[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.variant.update", "little_house_variant", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminCreateFaq(input: CreateLittleHouseFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const faq: LittleHouseFaqDto = {
      publicId: nanoid(12),
      question: input.question,
      answer: input.answer,
      sourceReference: input.sourceReference,
      displayOrder: input.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    overview.faq.push(faq);
    overview.updatedAt = faq.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.faq.create", "little_house_faq", faq.publicId);
    return faq;
  }

  async adminUpdateFaq(publicId: string, input: UpdateLittleHouseFaqInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const index = overview.faq.findIndex((faq) => faq.publicId === publicId);
    if (index === -1) throw new NotFoundException("FAQ Ngôi Nhà Nhỏ không tồn tại");

    const updated: LittleHouseFaqDto = {
      ...overview.faq[index],
      ...(input.question !== undefined && { question: input.question }),
      ...(input.answer !== undefined && { answer: input.answer }),
      ...(input.sourceReference !== undefined && { sourceReference: input.sourceReference }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      updatedAt: new Date().toISOString(),
    };

    overview.faq[index] = updated;
    overview.updatedAt = updated.updatedAt;
    overview.updatedByLabel = "Biên tập Ngôi Nhà Nhỏ";
    await this.saveOverview(littleHouseOverviewSchema.parse(overview));

    await this.auditService.append(auditContext, "admin.little_house.faq.update", "little_house_faq", updated.publicId, {
      updatedFields: Object.keys(input),
    });
    return updated;
  }

  async adminPublish(input: PublishLittleHouseInput, auditContext: AuditContext) {
    const overview = await this.loadOverview();
    const updated = littleHouseOverviewSchema.parse({
      ...overview,
      status: input.status,
      updatedAt: new Date().toISOString(),
      updatedByLabel: "Biên tập Ngôi Nhà Nhỏ",
      versionNotes: [`${input.status === "PUBLISHED" ? "Publish" : "Unpublish"}: ${input.changeSummary}`, ...overview.versionNotes].slice(0, 10),
    });

    await this.saveOverview(updated);
    await this.auditService.append(
      auditContext,
      input.status === "PUBLISHED" ? "admin.little_house.publish" : "admin.little_house.unpublish",
      "little_house_workspace",
      updated.publicId,
      { changeSummary: input.changeSummary },
    );
    return updated;
  }

  private assertGuideSlugAvailable(guides: LittleHouseGuideDto[], slug: string) {
    if (guides.some((guide) => guide.slug === slug)) throw slugConflictException();
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
