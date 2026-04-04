// Design: design/03-domains/content/USE_CASES/convincing-family-form-incense-timer.md
// Logic 1: Đồng hồ đếm ngược Đơn Khuyến Đạo Người Nhà
// Owner: content module

import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.service';
import { addMinutes, differenceInSeconds } from 'date-fns';
import { RitualSessionStatus } from '@prisma/client';

interface ConvincingFamilyRitualStartDto {
  spiritualFormId: string;
  incenseDurationMinutes: number;
}

interface ConvincingFamilyRitualCompleteDto {
  sessionId: string;
}

@Injectable()
export class ConvincingFamilyRitualService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bắt đầu làm lễ đọc Đơn Khuyến Đạo
   * POST /api/content/spiritual-forms/:id/ritual-start
   */
  async startRitual(userId: string, dto: ConvincingFamilyRitualStartDto) {
    // 1. Validate incense duration in acceptable range
    if (dto.incenseDurationMinutes < 10 || dto.incenseDurationMinutes > 120) {
      throw new BadRequestException({
        error: 'invalid_body',
        message: 'Thời gian hương phải trong khoảng 10-120 phút.',
        field: 'incenseDurationMinutes',
      });
    }

    // 2. Check for existing active session
    const existingSession = await this.prisma.convincingFamilyRitualSession.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'ALERT_FIRED'] },
      },
    });

    if (existingSession) {
      throw new ConflictException({
        error: 'conflict',
        message: 'Bạn đang có một phiên làm lễ Đơn Khuyến Đạo chưa hoàn thành.',
      });
    }

    const now = new Date();
    const alertAt = addMinutes(now, dto.incenseDurationMinutes);

    // 3. Create ritual session
    const session = await this.prisma.convincingFamilyRitualSession.create({
      data: {
        userId,
        formId: dto.spiritualFormId,
        durationMinutes: dto.incenseDurationMinutes,
        alertAt,
        status: RitualSessionStatus.ACTIVE,
      },
    });

    // TODO: Enqueue scheduled notification job at alertAt
    // await this.notificationService.scheduleConvincingFamilyAlert(session.id, alertAt);

    return {
      sessionId: session.id,
      alertAt,
      countdownSeconds: dto.incenseDurationMinutes * 60,
    };
  }

  /**
   * Hoàn thành lễ - user xác nhận đã cất đơn
   * POST /api/content/spiritual-forms/ritual-sessions/:id/complete
   */
  async completeRitual(userId: string, dto: ConvincingFamilyRitualCompleteDto) {
    const session = await this.prisma.convincingFamilyRitualSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        error: 'not_found',
        message: 'Không tìm thấy phiên làm lễ.',
      });
    }

    if (session.userId !== userId) {
      throw new BadRequestException({
        error: 'unauthorized',
        message: 'Bạn không có quyền hoàn thành phiên làm lễ này.',
      });
    }

    if (!['ACTIVE', 'ALERT_FIRED'].includes(session.status)) {
      throw new BadRequestException({
        error: 'invalid_state',
        message: 'Phiên làm lễ đã hoàn thành hoặc bị hủy.',
      });
    }

    const updated = await this.prisma.convincingFamilyRitualSession.update({
      where: { id: dto.sessionId },
      data: {
        status: RitualSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // TODO: Cancel pending notification if not fired yet
    // await this.notificationService.cancelScheduledAlert(session.id);

    return {
      success: true,
      completedAt: updated.completedAt,
    };
  }

  /**
   * Lấy trạng thái session hiện tại
   */
  async getCurrentSession(userId: string) {
    return this.prisma.convincingFamilyRitualSession.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'ALERT_FIRED'] },
      },
    });
  }

  /**
   * Fire alert khi timer hết (được gọi bởi cron hoặc notification service)
   */
  async fireAlert(sessionId: string) {
    const session = await this.prisma.convincingFamilyRitualSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== RitualSessionStatus.ACTIVE) {
      return;
    }

    await this.prisma.convincingFamilyRitualSession.update({
      where: { id: sessionId },
      data: {
        status: RitualSessionStatus.ALERT_FIRED,
        alertFiredAt: new Date(),
      },
    });

    // TODO: Send critical push notification
    // await this.notificationService.sendConvincingFamilyCriticalAlert(session.userId);
  }
}
