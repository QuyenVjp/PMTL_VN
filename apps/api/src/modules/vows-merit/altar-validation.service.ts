/**
 * AltarValidationService — Pre-ceremony condition checks + business rule guards
 *
 * Design: design/03-domains/altar-management/CONTRACTS.md
 * Design: design/03-domains/altar-management/MODULE_MAP.md
 * Design: design/03-domains/altar-management/USE_CASES/great-compassion-water-anti-boiling-guard.md
 * Design: design/03-domains/altar-management/USE_CASES/synchronized-incense-insertion.md
 * Design: design/03-domains/altar-management/USE_CASES/sacred-item-damage-protocol.md
 * Design: design/03-domains/altar-management/USE_CASES/auspicious-beast-ai-filter.md
 * Design: design/03-domains/altar-management/USE_CASES/hardware-uuid-prohibition.md
 * Design: design/03-domains/altar-management/USE_CASES/USE_CASE_ATOMIC_FRUIT_PLATE_REPLACEMENT.md
 * Design: design/03-domains/altar-management/USE_CASES/grand-incense-state-machine.md
 * Design: design/03-domains/altar-management/USE_CASES/USE_CASE_INCENSE_TIMING_QUANTITY_PROTOCOL.md
 *
 * Owner: vows-merit module (altar sub-domain)
 */

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type {
  AltarConditionCheckDto,
  AltarDamageReportDto,
  IncenseValidateDto,
  WaterValidateDto,
  FruitPlateReplaceDto,
  AltarPhotoSubmitDto,
  CreateHardwareItemDto,
  RetireHardwareItemDto,
  GrandIncenseSessionAdvanceDto,
} from "./altar-validation.schemas.js";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Giờ thắp hương buổi sáng hợp lệ */
const MORNING_INCENSE_HOURS = [6, 8, 10] as const;
/** Giờ thắp hương buổi tối hợp lệ */
const EVENING_INCENSE_HOURS = [18, 20, 22] as const;

/** Từ khóa cấm khi submit ảnh / mô tả vật phẩm bàn thờ */
const FORBIDDEN_ALTAR_KEYWORDS = [
  "rồng",
  "hổ",
  "tỳ hưu",
  "cóc thiềm thừ",
  "dragon",
  "tiger",
  "ảnh gia đình",
  "ảnh cưới",
  "ảnh người",
  "ảnh người lạ",
  "ảnh thần tài",
  "family photo",
  "wedding photo",
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AltarBlocker {
  code: string;
  message: string;
}

export interface AltarWarning {
  code: string;
  message: string;
}

export interface AltarConditionResult {
  passed: boolean;
  blockers: AltarBlocker[];
  warnings: AltarWarning[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class AltarValidationService {
  private readonly logger = new Logger(AltarValidationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Pre-ceremony condition check ─────────────────────────────────────────

  /**
   * POST /api/engagement/altar/validate (mapped via vows-merit module)
   * Kiểm tra điều kiện bàn thờ trước khi thực hiện nghi thức.
   * Design: CONTRACTS.md — AltarConditionCheckDto
   */
  async preCheckAltarCondition(
    dto: AltarConditionCheckDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<AltarConditionResult> {
    const blockers: AltarBlocker[] = [];
    const warnings: AltarWarning[] = [];

    // Rule 1: Nước Đại Bi không được sôi / nóng (CONTRACTS.md: water_temperature_forbidden)
    if (dto.waterTemperatureStatus === "BOILING" || dto.waterTemperatureStatus === "HOT") {
      blockers.push({
        code: "water_temperature_forbidden",
        message:
          "Nước Đại Bi đang sôi/nóng — tuyệt đối không được dùng. Phải chờ nguội hoàn toàn trước khi dâng lên bàn thờ.",
      });
    }
    if (dto.waterTemperatureStatus === "WARM") {
      warnings.push({
        code: "water_temperature_warm",
        message: "Nước Đại Bi vẫn còn hơi ấm — nên đợi nguội hoàn toàn để đảm bảo thanh tịnh.",
      });
    }

    // Rule 2: Vật dụng kim loại cấm cho nghi thức NNN (CONTRACTS.md: metal_container_forbidden)
    if (
      dto.ceremonyType === "BURN_NNN" &&
      dto.containerMaterial === "METAL"
    ) {
      blockers.push({
        code: "metal_container_forbidden",
        message:
          "Bình kim loại không được phép dùng khi đốt Ngôi Nhà Nhỏ (NNN). Phải dùng bình gốm hoặc sứ trắng.",
      });
    }

    // Rule 3: Hương phải sẵn sàng
    if (!dto.incenseReady) {
      warnings.push({
        code: "incense_not_ready",
        message: "Hương chưa chuẩn bị xong. Hãy chuẩn bị nhang trước khi bắt đầu nghi lễ.",
      });
    }

    const passed = blockers.length === 0;
    const eventName = passed ? "altar.condition_check_passed" : "altar.condition_check_failed";

    await this.audit.append(auditCtx, eventName as never, "altar_condition_check", userId, {
      ceremonyType: dto.ceremonyType,
      passed,
      blockerCount: blockers.length,
    });

    this.logger.log({
      msg: "altar_condition_check",
      userId,
      ceremonyType: dto.ceremonyType,
      passed,
    });

    return { passed, blockers, warnings };
  }

  // ─── Incense validation ────────────────────────────────────────────────────

  /**
   * POST /api/engagement/altar/incense/validate
   * Validate cắm hương: số lẻ, giờ hợp lệ, đồng bộ cùng lúc.
   * Design: synchronized-incense-insertion.md, USE_CASE_INCENSE_TIMING_QUANTITY_PROTOCOL.md
   */
  async validateIncenseOffering(
    dto: IncenseValidateDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ valid: boolean; requiredSticks: number; message: string }> {
    // Rule: Số nén nhang phải là số lẻ (1 hoặc 3)
    if (dto.stickCount % 2 === 0) {
      await this.audit.append(
        auditCtx,
        "altar.incense_even_count_rejected" as never,
        "altar_incense_validate",
        userId,
        { stickCount: dto.stickCount },
      );
      throw new BadRequestException({
        error: "even_incense_count_forbidden",
        message:
          "Số nén nhang dâng cúng phải là số lẻ (1 hoặc 3). Cắm số chẵn tạo mất cân bằng năng lượng.",
        provided: dto.stickCount,
      });
    }

    // Tính requiredSticks từ altar config
    const requiredSticks =
      dto.statueCount !== undefined &&
      dto.burnerCount !== undefined &&
      dto.statueCount > 1 &&
      dto.burnerCount === 1
        ? 3
        : 1;

    if (dto.stickCount !== requiredSticks) {
      throw new BadRequestException({
        error: "incense_stick_count_mismatch",
        message: `Số nén nhang bắt buộc là ${requiredSticks} nén (dựa trên cấu hình bàn thờ của bạn). Bạn đã nhập ${dto.stickCount} nén.`,
        required: requiredSticks,
        provided: dto.stickCount,
      });
    }

    // Rule: Kiểm tra giờ thắp hương hợp lệ
    if (dto.offeringHour !== undefined) {
      const validHours = [...MORNING_INCENSE_HOURS, ...EVENING_INCENSE_HOURS];
      if (!validHours.includes(dto.offeringHour as never)) {
        throw new BadRequestException({
          error: "invalid_incense_hour",
          message: `Thắp hương chỉ được vào các giờ: Sáng (6h, 8h, 10h) — Tối (18h, 20h, 22h). Giờ hiện tại không hợp lệ: ${dto.offeringHour}h.`,
          validHours,
          provided: dto.offeringHour,
        });
      }

      // Rule: Tuyệt đối cấm sau 22h
      if (dto.offeringHour >= 23 || (dto.offeringHour >= 2 && dto.offeringHour <= 5)) {
        throw new ForbiddenException({
          error: "forbidden_incense_hour",
          message:
            "Tuyệt đối cấm thắp hương sau 22h tối và trong khoảng 2h–5h sáng. Giờ này sẽ thu hút vong linh.",
        });
      }
    }

    await this.audit.append(
      auditCtx,
      "altar.incense_offering_validated" as never,
      "altar_incense_validate",
      userId,
      { stickCount: dto.stickCount, requiredSticks },
    );

    return {
      valid: true,
      requiredSticks,
      message: `Hợp lệ: ${dto.stickCount} nén nhang, cắm đồng thời cùng lúc vào lư hương.`,
    };
  }

  // ─── Water temperature validation ─────────────────────────────────────────

  /**
   * POST /api/engagement/altar/water/validate
   * Kiểm tra nước Đại Bi: cấm sôi/nóng.
   * Design: great-compassion-water-anti-boiling-guard.md, CONTRACTS.md
   */
  async validateWaterTemperature(
    dto: WaterValidateDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ allowed: boolean; message: string }> {
    await this.audit.append(
      auditCtx,
      "altar.water.great_compassion_usage_initiated" as never,
      "altar_water_validate",
      userId,
      { temperatureStatus: dto.temperatureStatus },
    );

    if (dto.temperatureStatus === "BOILING") {
      await this.audit.append(
        auditCtx,
        "altar.water.boiling_restriction_logged" as never,
        "altar_water_validate",
        userId,
        {},
      );
      throw new BadRequestException({
        error: "water_temperature_forbidden",
        message:
          "Nước Đại Bi đang sôi sùng sục — tuyệt đối không được dùng. Phải để nguội hoàn toàn trước khi dâng lên bàn thờ. Đun sôi làm mất đi năng lượng thanh tịnh của nước thiêng liêng.",
        code: "WATER_BOILING",
      });
    }

    if (dto.temperatureStatus === "HOT") {
      throw new BadRequestException({
        error: "water_temperature_forbidden",
        message:
          "Nước Đại Bi đang quá nóng — cần để nguội hoàn toàn. Chỉ dùng ở nhiệt độ bình thường để bảo vệ năng lượng tẩy rửa tâm linh.",
        code: "WATER_TOO_HOT",
      });
    }

    await this.audit.append(
      auditCtx,
      "altar.water.normal_temperature_confirmed" as never,
      "altar_water_validate",
      userId,
      { temperatureStatus: dto.temperatureStatus },
    );

    return {
      allowed: true,
      message: "Nước Đại Bi ở nhiệt độ bình thường — được phép dùng cho nghi thức.",
    };
  }

  // ─── Damage report with 7-biến task injection ─────────────────────────────

  /**
   * POST /api/engagement/altar/damage-report
   * Khai báo vỡ pháp khí → inject task 7 biến Lễ Phật bắt buộc.
   * Design: sacred-item-damage-protocol.md, CONTRACTS.md
   */
  async reportAltarDamage(
    dto: AltarDamageReportDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ urgentTaskPublicId: string; auditEventId: string; remedyInstructions: string }> {
    if (!dto.acknowledgedProtocol) {
      throw new BadRequestException({
        error: "protocol_acknowledgment_required",
        message:
          "Bạn phải xác nhận đã đọc và hiểu giao thức xử lý pháp khí hư hỏng trước khi gửi báo cáo.",
        code: "PROTOCOL_ACKNOWLEDGMENT_REQUIRED",
      });
    }

    if (!dto.itemsAffected || dto.itemsAffected.length === 0) {
      throw new UnprocessableEntityException({
        error: "damage_items_required",
        message: "Bạn phải chỉ định ít nhất một pháp khí bị hư hỏng.",
        code: "DAMAGE_ITEMS_REQUIRED",
      });
    }

    const urgentTaskPublicId = nanoid(21);

    // Inject AltarLog bắt buộc 7 biến Lễ Phật Đại Sám Hối Văn
    await this.prisma.altarLog.create({
      data: {
        publicId: urgentTaskPublicId,
        userId,
        date: new Date(),
        actionType: "DAMAGE_REPORT" as never,
        checklistStateJson: {
          itemsAffected: dto.itemsAffected,
          itemDescriptions: dto.itemDescriptions ?? null,
          requiredRecitations: 7,
          completedRecitations: 0,
          sutraKey: "le_phat_dai_sam_hoi",
          isRemovable: false,
          urgencyLabel: "MANDATORY_URGENT",
          acknowledgedProtocol: dto.acknowledgedProtocol,
        },
        note:
          `[BẮT BUỘC — KHÔNG XÓA ĐƯỢC] 7 biến Lễ Phật Đại Sám Hối Văn do vỡ pháp khí: ` +
          dto.itemsAffected.join(", "),
      },
    });

    await this.audit.append(
      auditCtx,
      "altar.damage_reported" as never,
      "altar_damage",
      urgentTaskPublicId,
      {
        userId,
        itemsAffected: dto.itemsAffected,
        taskPublicId: urgentTaskPublicId,
      },
    );

    const auditRecord = await this.audit.append(
      auditCtx,
      "altar.repentance_task_created" as never,
      "altar_damage",
      urgentTaskPublicId,
      { sutraKey: "le_phat_dai_sam_hoi", requiredCount: 7 },
    );

    this.logger.warn({
      msg: "altar_damage_reported",
      userId,
      itemsAffected: dto.itemsAffected,
      urgentTaskPublicId,
    });

    return {
      urgentTaskPublicId,
      auditEventId: (auditRecord as { id?: string })?.id ?? urgentTaskPublicId,
      remedyInstructions:
        "Bạn phải tụng 7 biến Lễ Phật Đại Sám Hối Văn cùng lời khấn: " +
        '"Xin Bồ Tát tha thứ cho con vì đã vô ý làm hỏng pháp khí. ' +
        'Con thành tâm sám hối và hứa không tái phạm." ' +
        "Nhiệm vụ này KHÔNG THỂ XÓA cho đến khi hoàn thành đủ 7 biến.",
    };
  }

  // ─── Auspicious-beast keyword filter ──────────────────────────────────────

  /**
   * POST /member/altar-management/altar-photos/submit
   * Scan từ khóa cấm trong mô tả ảnh bàn thờ.
   * Design: auspicious-beast-ai-filter.md
   */
  async submitAltarPhoto(
    dto: AltarPhotoSubmitDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ status: "PENDING_REVIEW" | "REJECTED"; rejectionReason?: string; detectedKeywords?: string[] }> {
    const detectedKeywords: string[] = [];
    const allDescriptions = dto.itemDescriptions.join(" ").toLowerCase();

    for (const keyword of FORBIDDEN_ALTAR_KEYWORDS) {
      if (allDescriptions.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
      }
    }

    if (detectedKeywords.length > 0) {
      await this.audit.append(
        auditCtx,
        "altar.forbidden_keyword_detected" as never,
        "altar_photo",
        userId,
        { detectedKeywords },
      );

      throw new BadRequestException({
        error: "forbidden_altar_item_detected",
        message:
          "Bàn thờ của bạn chứa vật phẩm cấm kỵ. Tuyệt đối không đặt hình rồng, hổ, linh thú hung dữ, " +
          "hoặc ảnh người phàm (ảnh gia đình, ảnh cưới) gần bàn thờ. " +
          "Những hình ảnh này thu hút linh tính/ngạ quỷ.",
        code: "FORBIDDEN_ALTAR_ITEM_DETECTED",
        items: detectedKeywords,
      });
    }

    await this.audit.append(
      auditCtx,
      "altar.photo_approved" as never,
      "altar_photo",
      userId,
      { photoUrl: dto.photoUrl },
    );

    return { status: "PENDING_REVIEW" };
  }

  // ─── Hardware UUID prohibition (phật cụ assignment lock) ──────────────────

  /**
   * POST /member/altar-management/hardware-items
   * Tạo phật cụ — gán vĩnh viễn cho một Bồ Tát.
   * Design: hardware-uuid-prohibition.md
   */
  async createHardwareItem(
    dto: CreateHardwareItemDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ publicId: string; name: string; assignedTo: string; status: "ACTIVE" }> {
    const item = await this.prisma.altarItem.create({
      data: {
        publicId: nanoid(21),
        userId,
        itemType: dto.itemType as never,
        name: dto.name,
        condition: "GOOD" as never,
        isActive: true,
        notes: `assignedTo:${dto.assignedTo}`,
      },
    });

    await this.audit.append(
      auditCtx,
      "altar.hardware_created_and_assigned" as never,
      "altar_hardware",
      item.publicId,
      { name: dto.name, assignedTo: dto.assignedTo, itemType: dto.itemType },
    );

    this.logger.log({
      msg: "altar_hardware_item_created",
      userId,
      publicId: item.publicId,
      assignedTo: dto.assignedTo,
    });

    return {
      publicId: item.publicId,
      name: item.name,
      assignedTo: dto.assignedTo,
      status: "ACTIVE",
    };
  }

  /**
   * POST /member/altar-management/hardware-items/:publicId/retire
   * Retire phật cụ — bắt buộc bọc vải đỏ, không dùng cá nhân.
   * Design: hardware-uuid-prohibition.md
   */
  async retireHardwareItem(
    publicId: string,
    dto: RetireHardwareItemDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ publicId: string; status: "RETIRED"; retiredAt: Date }> {
    if (!dto.wrappingCommitted) {
      throw new BadRequestException({
        error: "retirement_pledge_required",
        message:
          "Bạn phải cam kết bọc vải đỏ/giấy đỏ và cất đi pháp khí cũ. Tuyệt đối không dùng cho sinh hoạt cá nhân.",
        code: "RETIREMENT_PLEDGE_REQUIRED",
      });
    }

    if (!dto.notUsedForPersonalUse) {
      throw new BadRequestException({
        error: "retirement_pledge_required",
        message:
          "Bạn phải cam kết không dùng pháp khí cũ cho sinh hoạt cá nhân sau khi retire.",
        code: "PERSONAL_USE_PLEDGE_REQUIRED",
      });
    }

    const item = await this.prisma.altarItem.findFirst({
      where: { publicId, userId },
    });

    if (!item) {
      throw new NotFoundException("Pháp khí bàn thờ không tồn tại hoặc không thuộc về bạn.");
    }

    const retiredAt = new Date();

    await this.prisma.altarItem.update({
      where: { publicId },
      data: {
        condition: "RETIRED" as never,
        isActive: false,
        notes:
          (item.notes ?? "") +
          ` | RETIRED:${retiredAt.toISOString()} | pledge:${dto.retirementPledge ?? "cam kết bọc vải đỏ"}`,
      },
    });

    await this.audit.append(
      auditCtx,
      "altar.hardware_status_retired" as never,
      "altar_hardware",
      publicId,
      { retiredAt: retiredAt.toISOString(), pledge: dto.retirementPledge },
    );

    return { publicId, status: "RETIRED", retiredAt };
  }

  /**
   * Chặn reassignment phật cụ — assignedTo là readonly.
   * Design: hardware-uuid-prohibition.md — PATCH /altar-management/hardware-items/:id → FORBIDDEN
   */
  blockHardwareReassignment(): never {
    throw new ForbiddenException({
      error: "hardware_reassignment_forbidden",
      message:
        "Phật cụ đã được ấn định cho Bồ Tát thì VĨNH VIỄN không được đổi chủ. " +
        "Luật PMTL: Pháp khí đã tách riêng cho vị Bồ Tát nào thì không bao giờ được đổi sang vị khác. " +
        "Nếu cần thêm, hãy tạo pháp khí MỚI cho Bồ Tát mới.",
      code: "HARDWARE_REASSIGNMENT_FORBIDDEN",
    });
  }

  // ─── Fruit plate atomic replacement ───────────────────────────────────────

  /**
   * POST /member/altar-management/fruit-plate/replace
   * Thay toàn bộ đĩa trái cây (atomic replacement).
   * Design: USE_CASE_ATOMIC_FRUIT_PLATE_REPLACEMENT.md
   */
  async replaceFruitPlate(
    dto: FruitPlateReplaceDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ success: boolean; newPublicId: string; replacedAt: Date; message: string }> {
    // Tìm đĩa trái cây cũ của user (nếu có)
    const existingPlate = await this.prisma.altarItem.findFirst({
      where: { userId, itemType: "FRUIT_PLATE" as never, isActive: true },
    });

    const replacedAt = new Date();
    const newPublicId = nanoid(21);

    await this.prisma.$transaction(async (tx) => {
      // Step 1: Archive/retire đĩa cũ nếu có
      if (existingPlate) {
        await tx.altarItem.update({
          where: { id: existingPlate.id },
          data: {
            condition: "RETIRED" as never,
            isActive: false,
            notes:
              (existingPlate.notes ?? "") +
              ` | REPLACED:${replacedAt.toISOString()} | replaced_by:${newPublicId}`,
          },
        });
      }

      // Step 2: Tạo đĩa mới với snapshot trái cây
      await tx.altarItem.create({
        data: {
          publicId: newPublicId,
          userId,
          itemType: "FRUIT_PLATE" as never,
          name: "Đĩa trái cây cúng dường",
          condition: "GOOD" as never,
          isActive: true,
          notes:
            `isNewPlate:true | replacedAt:${replacedAt.toISOString()}` +
            (existingPlate ? ` | previousPlateId:${existingPlate.publicId}` : "") +
            ` | fruitTypes:${JSON.stringify(dto.newFruitComposition)}`,
        },
      });
    });

    await this.audit.append(
      auditCtx,
      "altar.fruit_plate_replaced" as never,
      "altar_fruit_plate",
      newPublicId,
      {
        userId,
        previousPlatePublicId: existingPlate?.publicId,
        newFruitComposition: dto.newFruitComposition,
        replacedAt: replacedAt.toISOString(),
      },
    );

    this.logger.log({
      msg: "altar_fruit_plate_replaced",
      userId,
      previousPlatePublicId: existingPlate?.publicId,
      newPublicId,
    });

    return {
      success: true,
      newPublicId,
      replacedAt,
      message:
        "Đã thay toàn bộ đĩa trái cây mới. Quy tắc năng lượng nguyên tử được bảo toàn — không trộn quả cũ với quả mới.",
    };
  }

  // ─── Grand incense (Đại Hương) session state machine ──────────────────────

  /**
   * POST /member/altar-management/grand-incense/start
   * Bắt đầu session đốt Đại Hương (chỉ vào mùng 1, 15 âm lịch).
   * Design: grand-incense-state-machine.md, USE_CASE_GRAND_INCENSE_STATE_MACHINE.md
   */
  async startGrandIncenseSession(
    dto: { isOilLampLit: boolean; isIncenseLit: boolean },
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ sessionPublicId: string; phase: string; message: string }> {
    if (!dto.isOilLampLit || !dto.isIncenseLit) {
      throw new BadRequestException({
        error: "grand_incense_prerequisites_not_met",
        message:
          "Trước khi đốt Đại Hương (Gỗ Đàn Hương), bắt buộc phải thắp đèn dầu VÀ nhang bình thường trước. " +
          `Trạng thái hiện tại: Đèn dầu=${dto.isOilLampLit ? "✓" : "✗"} | Nhang=${dto.isIncenseLit ? "✓" : "✗"}.`,
        code: "GRAND_INCENSE_PREREQUISITES_NOT_MET",
        required: { isOilLampLit: true, isIncenseLit: true },
        provided: dto,
      });
    }

    const sessionPublicId = nanoid(21);

    await this.prisma.altarLog.create({
      data: {
        publicId: sessionPublicId,
        userId,
        date: new Date(),
        actionType: "INCENSE" as never,
        checklistStateJson: {
          sessionType: "GRAND_INCENSE_SANDALWOOD",
          phase: "ROUND_1",
          roundCount: 0,
          totalRounds: 3,
          isOilLampLit: dto.isOilLampLit,
          isIncenseLit: dto.isIncenseLit,
          mouthBlowingDetected: false,
        },
        note: "Bắt đầu session đốt Đại Hương — 3 lần. Tuyệt đối không thổi bằng miệng.",
      },
    });

    await this.audit.append(
      auditCtx,
      "altar.grand_incense_session_started" as never,
      "altar_grand_incense",
      sessionPublicId,
      { userId, phase: "ROUND_1" },
    );

    return {
      sessionPublicId,
      phase: "ROUND_1",
      message:
        "Đã bắt đầu session đốt Đại Hương. Lần 1/3. " +
        "Dập tắt lửa bằng PHẨY TAY (tuyệt đối cấm thổi bằng miệng).",
    };
  }

  /**
   * POST /member/altar-management/grand-incense/:sessionId/advance
   * Tiến tới vòng tiếp theo trong 3-lần đốt Đại Hương.
   * Design: grand-incense-state-machine.md
   */
  async advanceGrandIncenseSession(
    sessionPublicId: string,
    dto: GrandIncenseSessionAdvanceDto,
    userId: string,
    auditCtx: AuditContext,
  ): Promise<{ phase: string; roundCount: number; completed: boolean; message: string }> {
    const session = await this.prisma.altarLog.findFirst({
      where: { publicId: sessionPublicId, userId, actionType: "INCENSE" as never },
    });

    if (!session) {
      throw new NotFoundException("Session đốt Đại Hương không tồn tại.");
    }

    const state = session.checklistStateJson as Record<string, unknown>;

    if (state["sessionType"] !== "GRAND_INCENSE_SANDALWOOD") {
      throw new BadRequestException("Session này không phải session đốt Đại Hương.");
    }

    if (dto.mouthBlowingDetected) {
      await this.audit.append(
        auditCtx,
        "altar.grand_incense_mouth_blow_detected" as never,
        "altar_grand_incense",
        sessionPublicId,
        { userId },
      );
      throw new BadRequestException({
        error: "mouth_blowing_forbidden",
        message:
          "NGỪNG! Tuyệt đối cấm thổi bằng miệng khi dập tắt gỗ Đàn Hương. " +
          "Hãy dùng tay PHẨY/QUẠT. Hơi thở làm ô uế Pháp Bảo và mất công đức.",
        code: "MOUTH_BLOWING_FORBIDDEN",
      });
    }

    const currentRound = (state["roundCount"] as number) + 1;
    const totalRounds = 3;
    const completed = currentRound >= totalRounds;
    const newPhase = completed ? "COMPLETED" : `ROUND_${currentRound + 1}`;

    await this.prisma.altarLog.update({
      where: { id: session.id },
      data: {
        checklistStateJson: {
          ...state,
          phase: newPhase,
          roundCount: currentRound,
        },
        updatedAt: new Date(),
      },
    });

    await this.audit.append(
      auditCtx,
      (completed
        ? "altar.grand_incense_session_completed"
        : "altar.grand_incense_round_advanced") as never,
      "altar_grand_incense",
      sessionPublicId,
      { userId, roundCount: currentRound, completed },
    );

    const message = completed
      ? "Hoàn thành 3 lần đốt Đại Hương! Nếu gỗ Đàn Hương chưa cháy hết, cắm dọc vào lư hương để khói tiếp tục bay lên."
      : `Lần ${currentRound} hoàn thành. Tiếp tục lần ${currentRound + 1}/3. Nhớ dập tắt bằng PHẨY TAY.`;

    return {
      phase: newPhase,
      roundCount: currentRound,
      completed,
      message,
    };
  }
}
