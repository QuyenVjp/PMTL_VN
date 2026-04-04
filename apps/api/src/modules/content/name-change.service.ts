// Design: design/03-domains/content/USE_CASES/name-change-deceased-exemption.md
// Logic 2: Đơn Đổi Tên - CẤMCHO NGƯỜI QUÁ CỐ
// Owner: content module

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.service';
import { PersonLifeStatus, ApplicationStatus } from '@prisma/client';
import { addDays } from 'date-fns';

interface NameChangeApplicationDto {
  applicantName: string;
  targetPersonType: PersonLifeStatus;
  targetOldName: string;
  targetNewName: string;
  yearsUsedNewName: number;
}

@Injectable()
export class NameChangeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo Đơn Đổi Tên
   * POST /api/content/spiritual-forms/name-change
   */
  async createNameChangeApplication(userId: string, dto: NameChangeApplicationDto) {
    // 1. HARD BLOCK: Người quá cố KHÔNG ĐƯỢC làm đơn đổi tên
    if (dto.targetPersonType === PersonLifeStatus.DECEASED) {
      throw new BadRequestException({
        error: 'name_change_deceased_not_allowed',
        message: 'Người quá cố không cần làm đơn đổi tên.',
        guidance:
          'Khi viết Tiểu Phương Tử cho người đã khuất, hãy dùng tên mà họ được gọi nhiều nhất lúc còn sống.',
      });
    }

    // 2. Validate yearsUsedNewName >= 1
    if (dto.yearsUsedNewName < 1) {
      throw new BadRequestException({
        error: 'new_name_not_used_long_enough',
        message: 'Tên mới phải đã dùng ít nhất 1 năm mới được làm đơn đổi tên.',
        field: 'yearsUsedNewName',
      });
    }

    // 3. Validate không trống
    if (!dto.targetNewName || dto.targetNewName.trim() === '') {
      throw new BadRequestException({
        error: 'invalid_body',
        message: 'Tên mới không được để trống.',
        field: 'targetNewName',
      });
    }

    // 4. Create application
    const application = await this.prisma.nameChangeApplication.create({
      data: {
        userId,
        targetPersonType: dto.targetPersonType,
        targetOldName: dto.targetOldName,
        targetNewName: dto.targetNewName,
        yearsUsedNewName: dto.yearsUsedNewName,
        status: ApplicationStatus.PENDING_BURN,
      },
    });

    // TODO: Generate PDF for user to print and burn
    // await this.pdfService.generateNameChangeFormPdf(application.id);

    return {
      publicId: application.publicId,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  /**
   * Xác nhận đã đốt đơn
   * POST /api/content/spiritual-forms/name-change/:publicId/confirm-burn
   */
  async confirmBurn(userId: string, publicId: string) {
    const application = await this.prisma.nameChangeApplication.findUnique({
      where: { publicId },
    });

    if (!application) {
      throw new BadRequestException({
        error: 'not_found',
        message: 'Không tìm thấy đơn đổi tên.',
      });
    }

    if (application.userId !== userId) {
      throw new BadRequestException({
        error: 'unauthorized',
        message: 'Bạn không có quyền xác nhận đơn này.',
      });
    }

    if (application.status !== ApplicationStatus.PENDING_BURN) {
      throw new BadRequestException({
        error: 'invalid_state',
        message: 'Đơn đã được xác nhận đốt hoặc đã kích hoạt.',
      });
    }

    const now = new Date();
    const activationEndsAt = addDays(now, 100); // 100-day activation period

    const updated = await this.prisma.nameChangeApplication.update({
      where: { publicId },
      data: {
        status: ApplicationStatus.BURNED,
        burnedAt: now,
        activationEndsAt,
      },
    });

    return {
      publicId: updated.publicId,
      status: updated.status,
      burnedAt: updated.burnedAt,
      activationEndsAt: updated.activationEndsAt,
      message: 'Đơn đổi tên đã được xác nhận đốt. Tên mới sẽ kích hoạt sau 100 ngày.',
    };
  }

  /**
   * Lấy đơn đổi tên của user
   */
  async getUserApplications(userId: string) {
    return this.prisma.nameChangeApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
