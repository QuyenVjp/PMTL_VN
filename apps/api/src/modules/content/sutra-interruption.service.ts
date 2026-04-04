/**
 * Phase 12 Logic 3: E-Reader Sutra Pause/Interrupt Algorithm
 * 
 * Handles interruption logic:
 * - LONG sutras (Da Bei Zhou, Tam Kinh): Can pause with "Ong Lai Mu Suo He"
 * - SHORT mantras (Wang Sheng, Giai Ket, That Phat): Must restart from beginning
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

export type SutraTypeEnum = "LONG" | "SHORT";

export interface PauseResponse {
  canPause: boolean;
  sutraType: SutraTypeEnum;
  pauseInstruction?: string;
  restartWarning?: string;
  shouldResetCounter: boolean;
}

@Injectable()
export class SutraInterruptionService {
  private readonly logger = new Logger(SutraInterruptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get pause/interrupt guidance for a sutra by its key
   */
  async getPauseGuidance(sutraKey: string): Promise<PauseResponse> {
    // Query sutra metadata
    const sutra = await this.prisma.$queryRaw<
      Array<{
        sutra_type: string;
        pause_mantra: string | null;
        pause_instruction: string | null;
        restart_warning: string | null;
      }>
    >`
      SELECT sutra_type, pause_mantra, pause_instruction, restart_warning
      FROM sutra_metadata
      WHERE sutra_key = ${sutraKey}
      LIMIT 1
    `;

    if (!sutra || sutra.length === 0) {
      throw new BadRequestException(`Sutra key "${sutraKey}" not found in metadata`);
    }

    const metadata = sutra[0];
    const sutraType = metadata.sutra_type as SutraTypeEnum;

    if (sutraType === "LONG") {
      return {
        canPause: true,
        sutraType: "LONG",
        pauseInstruction:
          metadata.pause_instruction ||
          `Hãy niệm 1 biến "${metadata.pause_mantra || "Ông Lai Mu Suo He"}" để lưu lại.`,
        shouldResetCounter: false,
      };
    } else {
      return {
        canPause: false,
        sutraType: "SHORT",
        restartWarning:
          metadata.restart_warning ||
          "Vì đây là Thần chú ngắn, luật quy định khi bị ngắt quãng bạn bắt buộc phải niệm lại từ đầu biến này.",
        shouldResetCounter: true,
      };
    }
  }

  /**
   * Seed initial sutra metadata
   * Should be called during app bootstrap or migration
   */
  async seedSutraMetadata() {
    const sutras = [
      // LONG types
      {
        sutraKey: "da_bei_zhou",
        titleVi: "Chú Đại Bi",
        titleEn: "Great Compassion Mantra",
        sutraType: "LONG",
        pauseMantra: "Ông Lai Mu Suo He",
        pauseInstruction: "Hãy niệm 1 biến 'Ông Lai Mu Suo He' để tạm dừng.",
        restartWarning: null,
      },
      {
        sutraKey: "tam_kinh",
        titleVi: "Bát Nhã Tâm Kinh",
        titleEn: "Heart Sutra",
        sutraType: "LONG",
        pauseMantra: "Ông Lai Mu Suo He",
        pauseInstruction: "Hãy niệm 1 biến 'Ông Lai Mu Suo He' để tạm dừng.",
        restartWarning: null,
      },
      {
        sutraKey: "le_phat",
        titleVi: "Lễ Phật",
        titleEn: "Prostration to Buddha",
        sutraType: "LONG",
        pauseMantra: "Ông Lai Mu Suo He",
        pauseInstruction: "Hãy niệm 1 biến 'Ông Lai Mu Suo He' để tạm dừng.",
        restartWarning: null,
      },
      // SHORT types
      {
        sutraKey: "wang_sheng_zhou",
        titleVi: "Chú Vãng Sanh",
        titleEn: "Rebirth Mantra",
        sutraType: "SHORT",
        pauseMantra: null,
        pauseInstruction: null,
        restartWarning:
          "Vì đây là Thần chú ngắn, luật quy định khi bị ngắt quãng bạn bắt buộc phải niệm lại từ đầu.",
      },
      {
        sutraKey: "giai_ket_zhou",
        titleVi: "Chú Giải Kết",
        titleEn: "Untying Mantra",
        sutraType: "SHORT",
        pauseMantra: null,
        pauseInstruction: null,
        restartWarning:
          "Vì đây là Thần chú ngắn, luật quy định khi bị ngắt quãng bạn bắt buộc phải niệm lại từ đầu.",
      },
      {
        sutraKey: "that_phat_diet_toi",
        titleVi: "Chú Thất Phật Diệt Tội",
        titleEn: "Seven Buddhas Mantra",
        sutraType: "SHORT",
        pauseMantra: null,
        pauseInstruction: null,
        restartWarning:
          "Vì đây là Thần chú ngắn, luật quy định khi bị ngắt quãng bạn bắt buộc phải niệm lại từ đầu.",
      },
    ];

    for (const sutra of sutras) {
      try {
        await this.prisma.$executeRaw`
          INSERT INTO sutra_metadata (
            id, public_id, sutra_key, title_vi, title_en, sutra_type,
            pause_mantra, pause_instruction, restart_warning, created_at, updated_at
          ) VALUES (
            ${this.generateId()}, ${this.generatePublicId()}, ${sutra.sutraKey},
            ${sutra.titleVi}, ${sutra.titleEn}, ${sutra.sutraType},
            ${sutra.pauseMantra}, ${sutra.pauseInstruction}, ${sutra.restartWarning},
            NOW(), NOW()
          )
          ON CONFLICT (sutra_key) DO NOTHING
        `;
        this.logger.log(`Seeded sutra metadata: ${sutra.sutraKey}`);
      } catch (error) {
        this.logger.error(`Failed to seed ${sutra.sutraKey}:`, error);
      }
    }
  }

  private generateId(): string {
    return `sutra_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generatePublicId(): string {
    return nanoid(21);
  }
}

// Helper to avoid import issues
function nanoid(length: number): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
