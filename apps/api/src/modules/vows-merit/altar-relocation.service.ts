/**
 * Phase 12 Logic 6: Altar Relocation Workflow with Strict Sequencing
 * 
 * Enforces mandatory sequence when moving house:
 * 1. Wait for incense to burn out at old home
 * 2. Wrap statue in red cloth
 * 3. Install altar FIRST at new home before moving any other belongings
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";

export type RelocationStep =
  | "PREPARING"
  | "INCENSE_BURNED_OLD_HOME"
  | "WRAPPED_IN_RED_CLOTH"
  | "ALTAR_INSTALLED_NEW_HOME"
  | "COMPLETED";

export interface RelocationWorkflowState {
  currentStep: RelocationStep;
  canProceedToNextStep: boolean;
  nextStep?: RelocationStep;
  blockerMessage?: string;
  checklist: {
    incenseBurnedOldHome: boolean;
    wrappedInRedCloth: boolean;
    altarInstalledFirstNewHome: boolean;
  };
}

@Injectable()
export class AltarRelocationService {
  private readonly logger = new Logger(AltarRelocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start new altar relocation workflow
   */
  async startRelocation(userId: string): Promise<RelocationWorkflowState> {
    const publicId = nanoid(21);

    await this.prisma.altarLog.create({
      data: {
        publicId,
        userId,
        date: new Date(),
        actionType: "RELOCATION",
        relocationStep: "PREPARING",
        incenseBurnedConfirmed: false,
        redClothConfirmed: false,
        altarFirstConfirmed: false,
        checklistStateJson: {},
      },
    });

    this.logger.log({
      msg: "altar_relocation_started",
      userId,
      publicId,
    });

    return this.getWorkflowState("PREPARING", {
      incenseBurnedOldHome: false,
      wrappedInRedCloth: false,
      altarInstalledFirstNewHome: false,
    });
  }

  /**
   * Advance relocation workflow to next step
   */
  async advanceRelocationStep(
    userId: string,
    currentPublicId: string,
    nextStep: RelocationStep,
    confirmations?: {
      incenseBurnedConfirmed?: boolean;
      redClothConfirmed?: boolean;
      altarFirstConfirmed?: boolean;
    },
  ): Promise<RelocationWorkflowState> {
    // Get current altar log
    const log = await this.prisma.altarLog.findFirst({
      where: {
        publicId: currentPublicId,
        userId,
        actionType: "RELOCATION",
      },
    });

    if (!log) {
      throw new BadRequestException("Altar relocation workflow not found");
    }

    const currentStep = log.relocationStep as RelocationStep;

    // Validate sequence
    this.validateStepTransition(currentStep, nextStep);

    // Check prerequisites based on next step
    this.validatePrerequisites(nextStep, {
      incenseBurnedConfirmed: confirmations?.incenseBurnedConfirmed || log.incenseBurnedConfirmed || false,
      redClothConfirmed: confirmations?.redClothConfirmed || log.redClothConfirmed || false,
      altarFirstConfirmed: confirmations?.altarFirstConfirmed || log.altarFirstConfirmed || false,
    });

    // Update altar log
    await this.prisma.altarLog.update({
      where: { id: log.id },
      data: {
        relocationStep: nextStep,
        incenseBurnedConfirmed: confirmations?.incenseBurnedConfirmed ?? log.incenseBurnedConfirmed,
        redClothConfirmed: confirmations?.redClothConfirmed ?? log.redClothConfirmed,
        altarFirstConfirmed: confirmations?.altarFirstConfirmed ?? log.altarFirstConfirmed,
        updatedAt: new Date(),
      },
    });

    this.logger.log({
      msg: "altar_relocation_advanced",
      userId,
      publicId: currentPublicId,
      fromStep: currentStep,
      toStep: nextStep,
    });

    return this.getWorkflowState(nextStep, {
      incenseBurnedOldHome: confirmations?.incenseBurnedConfirmed ?? log.incenseBurnedConfirmed ?? false,
      wrappedInRedCloth: confirmations?.redClothConfirmed ?? log.redClothConfirmed ?? false,
      altarInstalledFirstNewHome: confirmations?.altarFirstConfirmed ?? log.altarFirstConfirmed ?? false,
    });
  }

  /**
   * Validate step transition is allowed
   */
  private validateStepTransition(current: RelocationStep, next: RelocationStep): void {
    const validTransitions: Record<RelocationStep, RelocationStep[]> = {
      PREPARING: ["INCENSE_BURNED_OLD_HOME"],
      INCENSE_BURNED_OLD_HOME: ["WRAPPED_IN_RED_CLOTH"],
      WRAPPED_IN_RED_CLOTH: ["ALTAR_INSTALLED_NEW_HOME"],
      ALTAR_INSTALLED_NEW_HOME: ["COMPLETED"],
      COMPLETED: [],
    };

    const allowed = validTransitions[current] || [];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid transition from ${current} to ${next}. Allowed: ${allowed.join(", ") || "none"}`,
      );
    }
  }

  /**
   * Validate prerequisites are met for each step
   */
  private validatePrerequisites(
    step: RelocationStep,
    confirmations: {
      incenseBurnedConfirmed: boolean;
      redClothConfirmed: boolean;
      altarFirstConfirmed: boolean;
    },
  ): void {
    switch (step) {
      case "INCENSE_BURNED_OLD_HOME":
        if (!confirmations.incenseBurnedConfirmed) {
          throw new BadRequestException("Bạn phải xác nhận hương ở nhà cũ đã cháy hết hoàn toàn");
        }
        break;

      case "WRAPPED_IN_RED_CLOTH":
        if (!confirmations.redClothConfirmed) {
          throw new BadRequestException("Bạn phải xác nhận đã bọc tượng bằng vải đỏ");
        }
        break;

      case "ALTAR_INSTALLED_NEW_HOME":
        if (!confirmations.altarFirstConfirmed) {
          throw new BadRequestException(
            "⛔ DỪNG LẠI! Đồ đạc gia đình đã mang vào nhà chưa? " +
              "Luật quy định BẮT BUỘC phải an vị Bàn Thờ và thắp hương đầu tiên, " +
              "sau đó mới được phép dọn đồ đạc khác vào nhà!",
          );
        }
        break;
    }
  }

  /**
   * Get workflow state for display
   */
  private getWorkflowState(
    currentStep: RelocationStep,
    checklist: {
      incenseBurnedOldHome: boolean;
      wrappedInRedCloth: boolean;
      altarInstalledFirstNewHome: boolean;
    },
  ): RelocationWorkflowState {
    const stepOrder: RelocationStep[] = [
      "PREPARING",
      "INCENSE_BURNED_OLD_HOME",
      "WRAPPED_IN_RED_CLOTH",
      "ALTAR_INSTALLED_NEW_HOME",
      "COMPLETED",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const nextStep = currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : undefined;

    let blockerMessage: string | undefined;

    if (currentStep === "PREPARING" && !checklist.incenseBurnedOldHome) {
      blockerMessage = "Hãy đợi hương ở nhà cũ cháy hết hoàn toàn trước khi tiếp tục.";
    } else if (currentStep === "INCENSE_BURNED_OLD_HOME" && !checklist.wrappedInRedCloth) {
      blockerMessage = "Hãy bọc tượng Bồ Tát bằng vải đỏ.";
    } else if (currentStep === "WRAPPED_IN_RED_CLOTH" && !checklist.altarInstalledFirstNewHome) {
      blockerMessage =
        "⚠️ QUAN TRỌNG: Khi đến nhà mới, BẮT BUỘC phải an vị bàn thờ Bồ Tát ĐẦU TIÊN, " +
        "rồi mới được khiêng các đồ đạc khác của gia đình vào nhà.";
    }

    return {
      currentStep,
      canProceedToNextStep: !blockerMessage,
      nextStep,
      blockerMessage,
      checklist,
    };
  }
}
