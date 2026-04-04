// Design: design/03-domains/calendar/REFERENCES/BARDO-49-DAY-TRACKER.md
// Logic 8: Chiến dịch Siêu độ 49 Ngày
// Owner: calendar module

import { Injectable, BadRequestException } from '@nestjs/client';
import { PrismaService } from '../../platform/prisma.service';
import { addDays, differenceInDays } from 'date-fns';

interface CreateDeceasedDto {
  name: string;
  relationship: string;
  dateOfDeath: string; // ISO date
}

interface UpdateBardoProgressDto {
  deceasedPublicId: string;
}

@Injectable()
export class Bardo49DayService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo hồ sơ người quá cố và bắt đầu chiến dịch 49 ngày
   * POST /api/calendar/deceased-relatives
   */
  async createDeceasedProfile(userId: string, dto: CreateDeceasedDto) {
    const dateOfDeath = new Date(dto.dateOfDeath);
    const bardoEndDate = addDays(dateOfDeath, 49);

    const deceased = await this.prisma.deceasedRelative.create({
      data: {
        publicId: `deceased_${Date.now()}`,
        userId,
        name: dto.name,
        relationship: dto.relationship,
        dateOfDeath,
        bardoEndDate,
        targetLH: 49,
        completedLH: 0,
        bardoCompleted: false,
      },
    });

    // TODO: Create cronjob for daily reminders
    // await this.schedulerService.createBardoReminder(deceased.id, {
    //   startDate: dateOfDeath,
    //   endDate: bardoEndDate,
    //   frequency: 'DAILY',
    // });

    return {
      publicId: deceased.publicId,
      name: deceased.name,
      dateOfDeath: deceased.dateOfDeath,
      bardoEndDate: deceased.bardoEndDate,
      targetLH: deceased.targetLH,
      completedLH: deceased.completedLH,
      daysRemaining: differenceInDays(bardoEndDate, new Date()),
      message:
        'Chiến dịch siêu độ 49 ngày đã được tạo. Hãy niệm 49 Tiểu Phương Tử trong vòng 49 ngày.',
    };
  }

  /**
   * Cập nhật tiến độ (tự động gọi khi user đốt TPT)
   * POST /api/calendar/deceased-relatives/:publicId/update-progress
   */
  async updateProgress(userId: string, publicId: string) {
    const deceased = await this.prisma.deceasedRelative.findFirst({
      where: { publicId, userId },
      include: {
        littleHouses: {
          where: { status: 'BURNED' },
        },
      },
    });

    if (!deceased) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy hồ sơ người quá cố.',
      });
    }

    const completedLH = deceased.littleHouses.length;
    const bardoCompleted = completedLH >= deceased.targetLH;

    const updated = await this.prisma.deceasedRelative.update({
      where: { id: deceased.id },
      data: {
        completedLH,
        bardoCompleted,
      },
    });

    const daysRemaining = differenceInDays(deceased.bardoEndDate, new Date());
    const lhRemaining = deceased.targetLH - completedLH;

    return {
      publicId: updated.publicId,
      name: updated.name,
      completedLH,
      targetLH: updated.targetLH,
      bardoCompleted,
      daysRemaining: Math.max(0, daysRemaining),
      lhRemaining: Math.max(0, lhRemaining),
      progress: Math.floor((completedLH / updated.targetLH) * 100),
    };
  }

  /**
   * Gửi nhắc nhở hàng ngày (được gọi bởi cron job)
   */
  async sendDailyReminder(deceasedId: string) {
    const deceased = await this.prisma.deceasedRelative.findUnique({
      where: { id: deceasedId },
    });

    if (!deceased) return;

    const daysRemaining = differenceInDays(deceased.bardoEndDate, new Date());
    const lhRemaining = deceased.targetLH - deceased.completedLH;

    if (daysRemaining > 0 && lhRemaining > 0) {
      // TODO: Send notification
      // await this.notificationService.send(deceased.userId, {
      //   title: `Chiến dịch Siêu độ ${deceased.name}`,
      //   body: `Còn ${daysRemaining} ngày, cần đốt thêm ${lhRemaining} TPT`,
      //   priority: 'HIGH',
      // });

      return {
        sent: true,
        daysRemaining,
        lhRemaining,
      };
    }

    return { sent: false, reason: 'Chiến dịch đã hoàn thành hoặc hết hạn.' };
  }

  /**
   * Lấy tất cả chiến dịch đang active
   */
  async getActiveDeceasedProfiles(userId: string) {
    const now = new Date();

    return this.prisma.deceasedRelative.findMany({
      where: {
        userId,
        bardoEndDate: { gte: now },
        bardoCompleted: false,
      },
      orderBy: { bardoEndDate: 'asc' },
      include: {
        littleHouses: {
          where: { status: 'BURNED' },
          select: { publicId: true, burnDate: true },
        },
      },
    });
  }

  /**
   * Lấy chi tiết chiến dịch
   */
  async getDeceasedProfile(userId: string, publicId: string) {
    const deceased = await this.prisma.deceasedRelative.findFirst({
      where: { publicId, userId },
      include: {
        littleHouses: {
          where: { status: 'BURNED' },
          select: { publicId: true, burnDate: true, sheetsCount: true },
          orderBy: { burnDate: 'desc' },
        },
      },
    });

    if (!deceased) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy hồ sơ người quá cố.',
      });
    }

    const daysRemaining = differenceInDays(deceased.bardoEndDate, new Date());
    const lhRemaining = deceased.targetLH - deceased.completedLH;
    const daysElapsed = differenceInDays(new Date(), deceased.dateOfDeath);
    const averagePerDay = daysElapsed > 0 ? deceased.completedLH / daysElapsed : 0;

    return {
      publicId: deceased.publicId,
      name: deceased.name,
      relationship: deceased.relationship,
      dateOfDeath: deceased.dateOfDeath,
      bardoEndDate: deceased.bardoEndDate,
      targetLH: deceased.targetLH,
      completedLH: deceased.completedLH,
      bardoCompleted: deceased.bardoCompleted,
      daysRemaining: Math.max(0, daysRemaining),
      lhRemaining: Math.max(0, lhRemaining),
      progress: Math.floor((deceased.completedLH / deceased.targetLH) * 100),
      averagePerDay: Math.round(averagePerDay * 10) / 10,
      littleHouses: deceased.littleHouses,
    };
  }
}
