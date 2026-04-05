// Design: design/03-domains/engagement/REFERENCES/VIRTUAL-VIOLENCE-GAMING.md
// Logic 6: Nghiệp Bạo Lực Ảo - Gaming Addiction Diagnosis
// Owner: engagement module

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

interface CreateChildProfileDto {
  childName: string;
  hasGamingAddiction?: boolean;
}

interface DiagnoseGamingAddictionDto {
  childProfileId: string;
}

@Injectable()
export class GamingAddictionDiagnosisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo hồ sơ con
   * POST /api/engagement/child-profiles
   */
  async createChildProfile(userId: string, dto: CreateChildProfileDto) {
    const profile = await this.prisma.childProfile.create({
      data: {
        publicId: `child_${Date.now()}`,
        userId,
        childName: dto.childName,
        hasGamingAddiction: dto.hasGamingAddiction || false,
      },
    });

    return {
      publicId: profile.publicId,
      childName: profile.childName,
      hasGamingAddiction: profile.hasGamingAddiction,
    };
  }

  /**
   * Chẩn đoán nghiệp bạo lực ảo
   * POST /api/engagement/child-profiles/:publicId/diagnose-gaming
   */
  async diagnoseGamingAddiction(userId: string, publicId: string) {
    const profile = await this.prisma.childProfile.findFirst({
      where: { publicId, userId },
    });

    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ con.');
    }

    // Gắn cờ virtual violence karma
    const updated = await this.prisma.childProfile.update({
      where: { id: profile.id },
      data: {
        virtualViolenceKarma: true,
        hasGamingAddiction: true,
      },
    });

    // Auto-prescribe: 7 TPT + 21 Tâm Kinh
    // TODO: Tích hợp với DebtLedgerService
    // await this.debtLedgerService.addDebt(userId, {
    //   type: 'VIRTUAL_VIOLENCE_KARMA',
    //   childName: profile.childName,
    //   littleHousesRequired: 7,
    //   heartSutraDaily: 21,
    //   reason: `Game bạo lực thu hút linh tính cho ${profile.childName}`,
    // });

    return {
      publicId: updated.publicId,
      childName: updated.childName,
      virtualViolenceKarma: updated.virtualViolenceKarma,
      prescription: {
        littleHouses: 7,
        heartSutraDaily: 21,
        recipient: `Oan gia trái chủ của ${profile.childName}`,
        guidance:
          'CẢNH BÁO: Game bạo lực/chém giết trực tiếp THU HÚT các linh tính từ cõi âm đến nhập vào đứa trẻ. Tuyệt đối không được cãi vã, dùng bạo lực với trẻ vì sẽ làm trường khí tệ hơn.',
      },
    };
  }

  /**
   * Lấy tất cả hồ sơ con của user
   */
  async getUserChildProfiles(userId: string) {
    return this.prisma.childProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy chi tiết hồ sơ con
   */
  async getChildProfile(userId: string, publicId: string) {
    const profile = await this.prisma.childProfile.findFirst({
      where: { publicId, userId },
    });

    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ con.');
    }

    return {
      publicId: profile.publicId,
      childName: profile.childName,
      hasGamingAddiction: profile.hasGamingAddiction,
      virtualViolenceKarma: profile.virtualViolenceKarma,
      createdAt: profile.createdAt,
    };
  }
}
