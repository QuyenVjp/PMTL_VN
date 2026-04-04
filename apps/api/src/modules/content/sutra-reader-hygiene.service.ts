// Design: design/03-domains/content/USE_CASES/ereader-hand-hygiene-gate.md
// Logic 10: E-Reader Hygiene Gate - CỔNG VỆ SINH TAY
// Owner: content module

import { Injectable, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.service';

interface SutraHygieneConfirmDto {
  sutraId: string;
  hasWashedHands: boolean;
  willNotUseSaliva: boolean;
  deviceAboveWaist: boolean;
}

@Injectable()
export class SutraReaderHygieneService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xác nhận checklist vệ sinh trước khi đọc kinh
   * POST /api/content/sutra-reader/hygiene-confirm
   */
  async confirmHygiene(userId: string, dto: SutraHygieneConfirmDto) {
    // 1. Validate TẤT CẢ 3 booleans PHẢI = true
    const failed: string[] = [];

    if (!dto.hasWashedHands) {
      failed.push('Bạn phải rửa tay sạch sẽ trước khi đọc kinh.');
    }

    if (!dto.willNotUseSaliva) {
      failed.push('Bạn phải cam kết KHÔNG dùng nước bọt dính vào tay để vuốt màn hình.');
    }

    if (!dto.deviceAboveWaist) {
      failed.push('Thiết bị phải được cầm cao hơn thắt lưng.');
    }

    if (failed.length > 0) {
      throw new UnprocessableEntityException({
        error: 'hygiene_checklist_incomplete',
        message: 'Phải xác nhận đủ 3 điều kiện vệ sinh trước khi đọc kinh.',
        violations: failed,
      });
    }

    // 2. Ghi SutraReadingSession
    const session = await this.prisma.sutraReadingSession.create({
      data: {
        userId,
        sutraId: dto.sutraId,
        hygieneConfirmedAt: new Date(),
      },
    });

    // 3. Return session token (FE dùng để authorize render)
    // TODO: Generate JWT short-lived token (4h expiry)
    const sessionToken = `session_${session.id}`;

    return {
      sessionId: session.id,
      sessionToken,
      sutraId: dto.sutraId,
      confirmed: true,
    };
  }

  /**
   * Kiểm tra xem user đã confirm hygiene cho sutra này trong session hiện tại chưa
   * GET /api/content/sutra-reader/:sutraId/hygiene-status
   */
  async getHygieneStatus(userId: string, sutraId: string) {
    // Check if có session trong vòng 4 giờ gần nhất
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const session = await this.prisma.sutraReadingSession.findFirst({
      where: {
        userId,
        sutraId,
        sessionStartedAt: { gte: fourHoursAgo },
      },
      orderBy: { sessionStartedAt: 'desc' },
    });

    return {
      confirmed: !!session,
      sessionId: session?.id,
      confirmedAt: session?.hygieneConfirmedAt,
    };
  }

  /**
   * Kết thúc session đọc kinh
   * POST /api/content/sutra-reader/:sessionId/end
   */
  async endSession(userId: string, sessionId: string) {
    const session = await this.prisma.sutraReadingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy phiên đọc kinh.',
      });
    }

    if (session.userId !== userId) {
      throw new BadRequestException({
        error: 'unauthorized',
        message: 'Bạn không có quyền kết thúc phiên đọc kinh này.',
      });
    }

    await this.prisma.sutraReadingSession.update({
      where: { id: sessionId },
      data: {
        sessionEndedAt: new Date(),
      },
    });

    return { success: true };
  }
}
