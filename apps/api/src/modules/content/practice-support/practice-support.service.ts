import { Injectable, Logger } from "@nestjs/common";
import { readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { constants } from "node:fs";
import { InternalError } from "../../../common/errors/app-error.js";
import { AuditService } from "../../../platform/audit/audit.service.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";
import {
  vietnamHomePracticeGuideSchema,
  type VietnamHomePracticeGuideDto,
  type UpdateVietnamHomePracticeGuideInput,
} from "./practice-support.schemas.js";

// Convert import.meta.url to file path (Windows-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bootstrap seed file (read-only canon in design/)
// From practice-support.service.ts -> repo root is 6 levels up
const SEED_FILE_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "..",
  "design",
  "04-execution-overlay",
  "api",
  "schemas",
  "practice-support.seed.vi.json",
);

// Runtime storage file (API-owned, mutable in apps/api/data/runtime/)
// From practice-support.service.ts -> apps/api is 4 levels up
const RUNTIME_FILE_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "data",
  "runtime",
  "practice-support-playbook.runtime.json",
);

interface PracticeSupportPlaybook {
  vietnamHomePracticeGuide: VietnamHomePracticeGuideDto;
  // Other playbook items exist but are out of scope for this task
  [key: string]: unknown;
}

@Injectable()
export class PracticeSupportService {
  private readonly logger = new Logger(PracticeSupportService.name);

  constructor(private readonly auditService: AuditService) {}

  /**
   * Check if runtime file exists.
   */
  private async runtimeFileExists(): Promise<boolean> {
    try {
      await access(RUNTIME_FILE_PATH, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Bootstrap runtime file from seed if it doesn't exist.
   */
  private async ensureRuntimeFile(): Promise<void> {
    if (await this.runtimeFileExists()) {
      return;
    }

    this.logger.log("Runtime file not found, bootstrapping from seed...");

    try {
      // Read seed file
      const seedContent = await readFile(SEED_FILE_PATH, "utf-8");
      const seedData: unknown = JSON.parse(seedContent) as unknown;

      // Write to runtime location
      const content = JSON.stringify(seedData, null, 2);
      await writeFile(RUNTIME_FILE_PATH, content, "utf-8");

      this.logger.log("Successfully bootstrapped runtime file from seed");
    } catch (err) {
      this.logger.error("Failed to bootstrap runtime file from seed", err);
      throw new InternalError("Không thể khởi tạo dữ liệu hướng dẫn tu tập");
    }
  }

  /**
   * Load the entire practice support playbook from runtime file.
   */
  private async loadPlaybook(): Promise<PracticeSupportPlaybook> {
    await this.ensureRuntimeFile();

    try {
      const content = await readFile(RUNTIME_FILE_PATH, "utf-8");
      return JSON.parse(content) as PracticeSupportPlaybook;
    } catch (err) {
      this.logger.error("Failed to load practice-support runtime file", err);
      throw new InternalError("Không thể tải dữ liệu hướng dẫn tu tập");
    }
  }

  /**
   * Save the updated playbook back to runtime file.
   */
  private async savePlaybook(playbook: PracticeSupportPlaybook): Promise<void> {
    try {
      const content = JSON.stringify(playbook, null, 2);
      await writeFile(RUNTIME_FILE_PATH, content, "utf-8");
    } catch (err) {
      this.logger.error("Failed to save practice-support runtime file", err);
      throw new InternalError("Không thể lưu dữ liệu hướng dẫn tu tập");
    }
  }

  /**
   * Get vietnam-home-practice-guide for public consumption.
   */
  async getVietnamHomePracticeGuide(): Promise<{ data: VietnamHomePracticeGuideDto }> {
    const playbook = await this.loadPlaybook();
    const guide = playbook.vietnamHomePracticeGuide;

    // Validate shape matches canon
    const validated = vietnamHomePracticeGuideSchema.parse(guide);

    return { data: validated };
  }

  /**
   * Get vietnam-home-practice-guide for admin (same data, may include review metadata in future).
   */
  async adminGetVietnamHomePracticeGuide(): Promise<{ data: VietnamHomePracticeGuideDto }> {
    return this.getVietnamHomePracticeGuide();
  }

  /**
   * Update vietnam-home-practice-guide (admin only).
   * Validates input, merges ONLY the 3 approved editable fields, saves, and logs audit.
   */
  async adminUpdateVietnamHomePracticeGuide(
    input: UpdateVietnamHomePracticeGuideInput,
    auditContext: AuditContext,
  ): Promise<{ data: VietnamHomePracticeGuideDto }> {
    const playbook = await this.loadPlaybook();
    const existing = playbook.vietnamHomePracticeGuide;

    // Merge ONLY the 3 approved editable fields
    const updated: VietnamHomePracticeGuideDto = {
      ...existing,
      ...(input.vegetarianDisciplineRules !== undefined && { vegetarianDisciplineRules: input.vegetarianDisciplineRules }),
      ...(input.officeNutritionNotes !== undefined && { officeNutritionNotes: input.officeNutritionNotes }),
      ...(input.supplementalDietNotes !== undefined && { supplementalDietNotes: input.supplementalDietNotes }),
      updatedAt: new Date().toISOString(),
    };

    // Validate the merged result
    const validated = vietnamHomePracticeGuideSchema.parse(updated);

    // Save back to runtime file
    playbook.vietnamHomePracticeGuide = validated;
    await this.savePlaybook(playbook);

    // Audit log
    await this.auditService.append(
      auditContext,
      "admin.practice_support.update",
      "practice-support",
      validated.publicId,
      {
        slug: validated.slug,
        updatedFields: Object.keys(input),
      },
    );

    this.logger.log(`Updated vietnam-home-practice-guide by actor ${auditContext.actorId}`);

    return { data: validated };
  }
}
