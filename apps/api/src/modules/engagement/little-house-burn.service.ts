// Design: design/03-domains/engagement/USE_CASES/little-house-burn-physical-checks.md
// Logic 3: Kiểm tra vật lý khi đốt NNN - PRE-BURN và POST-BURN CHECKLIST
// Owner: engagement module

import { Injectable, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.service';
import { BurnSessionStatus } from '@prisma/client';

interface PreBurnCheckDto {
  littleHouseId: string;
  tweezersOnBlankEdge: boolean; // Nhíp kẹp vào mép giấy trống
  burnAreaReady: boolean; // Lư đốt sẵn sàng
}

interface PostBurnCheckDto {
  littleHouseId: string;
  fullyBurntToAsh: boolean; // Cháy hết thành tro
  remediationDone?: boolean; // Nếu còn sót, đã đốt lại chưa
}

@Injectable()
export class LittleHouseBurnService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PRE-BURN CHECKLIST - Kiểm tra trước khi đốt
   * POST /api/engagement/little-houses/:id/burn/pre-check
   */
  async preBurnCheck(userId: string, dto: PreBurnCheckDto) {
    const littleHouse = await this.prisma.littleHouse.findUnique({
      where: { id: dto.littleHouseId },
    });

    if (!littleHouse || littleHouse.userId !== userId) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy Tiểu Phương Tử.',
      });
    }

    // Validate TẤT CẢ checklist items = true
    if (!dto.tweezersOnBlankEdge || !dto.burnAreaReady) {
      throw new UnprocessableEntityException({
        error: 'pre_burn_checklist_incomplete',
        message: 'Phải xác nhận đủ checklist trước khi đốt.',
      });
    }

    // Tạo burn session
    const session = await this.prisma.littleHouseBurnSession.create({
      data: {
        littleHouseId: dto.littleHouseId,
        userId,
        status: BurnSessionStatus.BURNING,
        preBurnCheckedAt: new Date(),
        burnStartedAt: new Date(),
      },
    });

    // TODO: Audit log
    // await this.auditService.log('little-house.burn.pre-check.passed', {...});

    return {
      sessionId: session.id,
      status: session.status,
      message: 'Bắt đầu đốt. Hãy đốt cháy toàn bộ tờ giấy.',
    };
  }

  /**
   * POST-BURN CHECKLIST - Kiểm tra sau khi đốt
   * POST /api/engagement/little-houses/:id/burn/post-check
   */
  async postBurnCheck(userId: string, dto: PostBurnCheckDto) {
    const session = await this.prisma.littleHouseBurnSession.findFirst({
      where: {
        littleHouseId: dto.littleHouseId,
        userId,
        status: BurnSessionStatus.BURNING,
      },
    });

    if (!session) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy phiên đốt.',
      });
    }

    const now = new Date();

    // Case 1: Cháy hết từ đầu
    if (dto.fullyBurntToAsh) {
      const updated = await this.prisma.littleHouseBurnSession.update({
        where: { id: session.id },
        data: {
          status: BurnSessionStatus.COMPLETED,
          postBurnCheckedAt: now,
          burnCompletedAt: now,
          hadScraps: false,
        },
      });

      // Update LittleHouse status
      await this.prisma.littleHouse.update({
        where: { id: dto.littleHouseId },
        data: {
          status: 'BURNED',
          burnDate: now,
        },
      });

      // TODO: Audit
      // await this.auditService.log('little-house.burn.completed-fully', {...});

      return {
        sessionId: updated.id,
        status: 'COMPLETED',
        message: 'Tiểu Phương Tử đã đốt cháy hoàn toàn.',
      };
    }

    // Case 2: Còn sót giấy
    if (!dto.fullyBurntToAsh && dto.remediationDone) {
      // User đã đốt lại phần còn sót
      const updated = await this.prisma.littleHouseBurnSession.update({
        where: { id: session.id },
        data: {
          status: BurnSessionStatus.COMPLETED,
          postBurnCheckedAt: now,
          burnCompletedAt: now,
          hadScraps: true,
        },
      });

      await this.prisma.littleHouse.update({
        where: { id: dto.littleHouseId },
        data: {
          status: 'BURNED',
          burnDate: now,
        },
      });

      // TODO: Audit
      // await this.auditService.log('little-house.burn.completed-with-remediation', {...});

      return {
        sessionId: updated.id,
        status: 'COMPLETED',
        message: 'Tiểu Phương Tử đã đốt cháy hoàn toàn sau khi đốt lại phần còn sót.',
      };
    }

    // Case 3: Còn sót giấy và CHƯA đốt lại
    if (!dto.fullyBurntToAsh && !dto.remediationDone) {
      throw new UnprocessableEntityException({
        error: 'incomplete_combustion_unresolved',
        message: 'Phải đốt cháy hết mảnh giấy còn sót trước khi hoàn thành.',
        remediation:
          'Dùng bật lửa đốt cháy nốt phần giấy còn sót ngay lập tức trước khi tro nguội.',
      });
    }

    throw new BadRequestException({
      error: 'invalid_body',
      message: 'Dữ liệu không hợp lệ.',
    });
  }

  /**
   * Lấy trạng thái burn session hiện tại
   */
  async getCurrentBurnSession(userId: string, littleHouseId: string) {
    return this.prisma.littleHouseBurnSession.findFirst({
      where: {
        userId,
        littleHouseId,
        status: { in: [BurnSessionStatus.BURNING, BurnSessionStatus.POST_CHECK_PENDING] },
      },
    });
  }
}
