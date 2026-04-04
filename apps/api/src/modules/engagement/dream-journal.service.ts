/**
 * Phase 12 Logic 5: Dream Journal - Abortion Spirit Ascension Tracker
 * 
 * Tracks dreams related to aborted/miscarried children and auto-triggers
 * Little House requirements based on dream state.
 */

import { Injectable, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";

export interface DreamJournalInput {
  userId: string;
  dreamDate: Date;
  abortionChildRelated: boolean;
  childState?: "WELL_DRESSED_HAPPY" | "LEAVING_PEACEFULLY" | "CRYING_DISTRESSED" | "POORLY_DRESSED" | "UNKNOWN";
  description?: string;
}

export interface DreamAnalysisResult {
  status: "RESOLVED" | "UNRESOLVED" | "NEEDS_ACTION";
  message: string;
  requiredLittleHouses?: number;
  autoActionTriggered: boolean;
}

@Injectable()
export class DreamJournalService {
  private readonly logger = new Logger(DreamJournalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create dream journal entry and analyze abortion child state
   */
  async createDreamEntry(input: DreamJournalInput): Promise<DreamAnalysisResult> {
    // If not abortion-related, just save
    if (!input.abortionChildRelated) {
      await this.prisma.$executeRaw`
        INSERT INTO dream_journals (
          id, public_id, user_id, dream_date, abortion_child_related,
          child_state, description, resolution_status, created_at, updated_at
        ) VALUES (
          ${nanoid()}, ${nanoid(21)}, ${input.userId}, ${input.dreamDate},
          false, NULL, ${input.description || null}, 'UNRESOLVED', NOW(), NOW()
        )
      `;

      return {
        status: "UNRESOLVED",
        message: "Giấc mơ đã được lưu lại.",
        autoActionTriggered: false,
      };
    }

    // Analyze child state
    const analysis = this.analyzeChildState(input.childState);

    // Create dream entry
    await this.prisma.$executeRaw`
      INSERT INTO dream_journals (
        id, public_id, user_id, dream_date, abortion_child_related,
        child_state, description, resolution_status, auto_action_triggered,
        auto_action_note, created_at, updated_at
      ) VALUES (
        ${nanoid()}, ${nanoid(21)}, ${input.userId}, ${input.dreamDate},
        true, ${input.childState || "UNKNOWN"}, ${input.description || null},
        ${analysis.status === "RESOLVED" ? "RESOLVED" : "UNRESOLVED"},
        ${analysis.autoActionTriggered}, ${analysis.autoActionNote || null},
        NOW(), NOW()
      )
    `;

    // If needs action, auto-create Little House requirement
    if (analysis.autoActionTriggered && analysis.requiredLittleHouses) {
      await this.createAutoLittleHouseRequirement(
        input.userId,
        analysis.requiredLittleHouses,
        `Tự động tạo từ giấc mơ ngày ${input.dreamDate.toISOString().split("T")[0]}`,
      );
    }

    this.logger.log({
      msg: "dream_journal_created",
      userId: input.userId,
      abortionChildRelated: true,
      childState: input.childState,
      status: analysis.status,
      autoActionTriggered: analysis.autoActionTriggered,
    });

    return analysis;
  }

  /**
   * Analyze child state in dream
   */
  private analyzeChildState(childState?: string): DreamAnalysisResult {
    switch (childState) {
      case "WELL_DRESSED_HAPPY":
      case "LEAVING_PEACEFULLY":
        return {
          status: "RESOLVED",
          message: "🎉 Chúc mừng, thai nhi đã được siêu độ thành công!",
          autoActionTriggered: false,
        };

      case "CRYING_DISTRESSED":
      case "POORLY_DRESSED":
        return {
          status: "NEEDS_ACTION",
          message:
            "⚠️ CẢNH BÁO: Thai nhi vẫn chưa siêu thoát và đang oán hận. Bạn bắt buộc phải niệm thêm Ngôi Nhà Nhỏ!",
          requiredLittleHouses: 21, // Auto-create 21 LH batch
          autoActionTriggered: true,
        };

      case "UNKNOWN":
      default:
        return {
          status: "UNRESOLVED",
          message: "Giấc mơ đã được ghi nhận. Hãy tiếp tục theo dõi.",
          autoActionTriggered: false,
        };
    }
  }

  /**
   * Auto-create Little House requirement in debt ledger
   */
  private async createAutoLittleHouseRequirement(
    userId: string,
    count: number,
    note: string,
  ): Promise<void> {
    // TODO: Integrate with actual debt ledger system
    // For now, just log
    this.logger.warn({
      msg: "auto_little_house_requirement_created",
      userId,
      requiredCount: count,
      note,
      action: "MANUAL_FOLLOW_UP_NEEDED",
    });

    // Could also create a draft LittleHouse batch here
    // await this.prisma.littleHouse.create({ ... });
  }

  /**
   * Get user's dream journal with abortion child tracking
   */
  async getUserDreamJournal(
    userId: string,
    filters?: {
      abortionChildOnly?: boolean;
      resolutionStatus?: string;
    },
  ) {
    const whereConditions: string[] = [`user_id = '${userId}'`];

    if (filters?.abortionChildOnly) {
      whereConditions.push("abortion_child_related = true");
    }

    if (filters?.resolutionStatus) {
      whereConditions.push(`resolution_status = '${filters.resolutionStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const entries = await this.prisma.$queryRaw<
      Array<{
        public_id: string;
        dream_date: Date;
        abortion_child_related: boolean;
        child_state: string | null;
        description: string | null;
        resolution_status: string;
        auto_action_triggered: boolean;
        created_at: Date;
      }>
    >`
      SELECT public_id, dream_date, abortion_child_related, child_state,
             description, resolution_status, auto_action_triggered, created_at
      FROM dream_journals
      WHERE ${whereClause}
      ORDER BY dream_date DESC
      LIMIT 50
    `;

    return entries;
  }
}
