/**
 * AltarValidationController — endpoints defined in CONTRACTS.md
 *
 * Design: design/03-domains/altar-management/CONTRACTS.md
 *   POST /api/engagement/altar/validate          — pre-ceremony check
 *   POST /api/engagement/altar/damage-report     — vỡ pháp khí → 7 biến bắt buộc
 *   POST /api/engagement/altar/incense/validate  — validate cắm hương
 *   POST /api/engagement/altar/water/validate    — validate nước Đại Bi
 *
 * Additional endpoints from USE_CASES/:
 *   POST /member/altar-management/altar-photos/submit            — keyword filter
 *   POST /member/altar-management/hardware-items                 — phật cụ assignment
 *   POST /member/altar-management/hardware-items/:id/retire      — retire phật cụ
 *   PATCH /member/altar-management/hardware-items/:id            — FORBIDDEN (reassignment lock)
 *   POST /member/altar-management/fruit-plate/replace            — atomic replacement
 *   POST /member/altar-management/grand-incense/start            — Đại Hương session
 *   POST /member/altar-management/grand-incense/:id/advance      — advance 3-round ritual
 */

import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AuditContext } from "../../common/decorators/audit-context.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import type { AuditContext as AuditCtxType } from "../../platform/audit/audit.service.js";
import { AltarValidationService } from "./altar-validation.service.js";
import {
  altarConditionCheckSchema,
  altarDamageReportSchema,
  incenseValidateSchema,
  waterValidateSchema,
  altarPhotoSubmitSchema,
  createHardwareItemSchema,
  retireHardwareItemSchema,
  fruitPlateReplaceSchema,
  grandIncenseStartSchema,
  grandIncenseSessionAdvanceSchema,
  type AltarConditionCheckDto,
  type AltarDamageReportDto,
  type IncenseValidateDto,
  type WaterValidateDto,
  type AltarPhotoSubmitDto,
  type CreateHardwareItemDto,
  type RetireHardwareItemDto,
  type FruitPlateReplaceDto,
  type GrandIncenseStartDto,
  type GrandIncenseSessionAdvanceDto,
} from "./altar-validation.schemas.js";

// ─── Engagement/Altar — core ceremony guards (CONTRACTS.md routes) ───────────

@ApiTags("engagement-altar")
@Controller("engagement/altar")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class AltarCeremonyController {
  constructor(private readonly svc: AltarValidationService) {}

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Kiểm tra điều kiện bàn thờ trước nghi lễ",
    description:
      "Trả về blockers (chặn tiếp tục) và warnings (lưu ý). " +
      "Nước Đại Bi không được sôi; bình kim loại cấm khi đốt NNN.",
  })
  preCheckAltarCondition(
    @Body() body: AltarConditionCheckDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.preCheckAltarCondition(
      altarConditionCheckSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  @Post("damage-report")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Khai báo vỡ/hư hỏng pháp khí bàn thờ",
    description:
      "Inject nhiệm vụ bắt buộc 7 biến Lễ Phật Đại Sám Hối Văn. " +
      "Nhiệm vụ này KHÔNG THỂ XÓA cho đến khi hoàn thành đủ 7 biến.",
  })
  reportDamage(
    @Body() body: AltarDamageReportDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.reportAltarDamage(
      altarDamageReportSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  @Post("incense/validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate cắm hương (số lẻ, giờ hợp lệ, đồng bộ cùng lúc)",
    description:
      "Kiểm tra: số nén lẻ, giờ thắp hương hợp lệ (6h/8h/10h sáng; 18h/20h/22h tối), " +
      "số nén khớp cấu hình bàn thờ. Cấm thắp sau 22h và lúc 2–5h sáng.",
  })
  validateIncense(
    @Body() body: IncenseValidateDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.validateIncenseOffering(
      incenseValidateSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  @Post("water/validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate nước Đại Bi (cấm sôi/nóng)",
    description:
      "Nước Đại Bi phải ở nhiệt độ bình thường. Tuyệt đối cấm dùng khi đang sôi hoặc nóng.",
  })
  validateWater(
    @Body() body: WaterValidateDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.validateWaterTemperature(
      waterValidateSchema.parse(body),
      user.id,
      auditCtx,
    );
  }
}

// ─── Member altar-management — extended USE_CASE endpoints ───────────────────

@ApiTags("member-altar-validation")
@Controller("member/altar-management")
@Roles("MEMBER", "ADMIN", "SUPER_ADMIN")
export class MemberAltarValidationController {
  constructor(private readonly svc: AltarValidationService) {}

  // ── Auspicious-beast keyword filter ────────────────────────────────────────

  @Post("altar-photos/submit")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Submit ảnh bàn thờ (keyword filter cấm linh thú/ảnh người)",
    description:
      "Scan mô tả vật phẩm cho từ khóa cấm: rồng, hổ, tỳ hưu, ảnh gia đình, ảnh cưới, v.v. " +
      "Trả về PENDING_REVIEW nếu sạch; 400 nếu phát hiện từ khóa cấm.",
  })
  submitAltarPhoto(
    @Body() body: AltarPhotoSubmitDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.submitAltarPhoto(
      altarPhotoSubmitSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  // ── Hardware item (phật cụ) UUID assignment + retirement ──────────────────

  @Post("hardware-items")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Tạo pháp khí bàn thờ — gán vĩnh viễn cho một Bồ Tát",
    description:
      "assignedTo là trường BẤT BIẾN sau khi tạo. Không được đổi chủ. " +
      "Nếu cần đổi, phải retire phật cụ cũ và tạo phật cụ mới.",
  })
  createHardwareItem(
    @Body() body: CreateHardwareItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.createHardwareItem(
      createHardwareItemSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  @Patch("hardware-items/:publicId")
  @HttpCode(HttpStatus.FORBIDDEN)
  @ApiOperation({
    summary: "FORBIDDEN — phật cụ không được đổi chủ Bồ Tát",
    description:
      "Endpoint này LUÔN trả 403. assignedTo là readonly sau khi tạo. " +
      "Dùng /retire để retire phật cụ cũ rồi tạo mới.",
  })
  @ApiParam({ name: "publicId", description: "Public ID của pháp khí" })
  blockReassignment() {
    return this.svc.blockHardwareReassignment();
  }

  @Post("hardware-items/:publicId/retire")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Retire pháp khí bàn thờ — bắt buộc bọc vải đỏ",
    description:
      "Yêu cầu cam kết: wrappingCommitted=true và notUsedForPersonalUse=true. " +
      "Sau khi retire, pháp khí được đánh dấu RETIRED và không còn active.",
  })
  @ApiParam({ name: "publicId", description: "Public ID của pháp khí" })
  retireHardwareItem(
    @Param("publicId") publicId: string,
    @Body() body: RetireHardwareItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.retireHardwareItem(
      publicId,
      retireHardwareItemSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  // ── Fruit plate atomic replacement ─────────────────────────────────────────

  @Post("fruit-plate/replace")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Thay toàn bộ đĩa trái cây (atomic replacement — không được thay từng quả)",
    description:
      "Mỗi đĩa cúng dường là một đơn vị năng lượng nguyên tử. Khi 1 quả hỏng, " +
      "phải thay MỚI TOÀN BỘ đĩa. Thực hiện atomic transaction: archive đĩa cũ + tạo đĩa mới.",
  })
  replaceFruitPlate(
    @Body() body: FruitPlateReplaceDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.replaceFruitPlate(
      fruitPlateReplaceSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  // ── Grand incense (Đại Hương / Sandalwood) session ────────────────────────

  @Post("grand-incense/start")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Bắt đầu session đốt Đại Hương (Gỗ Đàn Hương) — 3 lần",
    description:
      "Yêu cầu: đèn dầu đã bật VÀ nhang đã thắp. " +
      "Tuyệt đối cấm thổi bằng miệng khi dập tắt lửa — phải PHẨY TAY.",
  })
  startGrandIncense(
    @Body() body: GrandIncenseStartDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.startGrandIncenseSession(
      grandIncenseStartSchema.parse(body),
      user.id,
      auditCtx,
    );
  }

  @Post("grand-incense/:sessionPublicId/advance")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Tiến tới vòng tiếp theo trong session Đại Hương (3 lần tổng)",
    description:
      "Nếu mouthBlowingDetected=true → 400 và dừng session. " +
      "Sau 3 lần thành công → phase=COMPLETED; cắm gỗ còn lại vào lư hương.",
  })
  @ApiParam({ name: "sessionPublicId", description: "Public ID của session Đại Hương" })
  advanceGrandIncense(
    @Param("sessionPublicId") sessionPublicId: string,
    @Body() body: GrandIncenseSessionAdvanceDto,
    @CurrentUser() user: AuthenticatedUser,
    @AuditContext() auditCtx: AuditCtxType,
  ) {
    return this.svc.advanceGrandIncenseSession(
      sessionPublicId,
      grandIncenseSessionAdvanceSchema.parse(body),
      user.id,
      auditCtx,
    );
  }
}
