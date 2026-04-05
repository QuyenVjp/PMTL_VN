// Design: design/03-domains/vows-merit/USE_CASES/altar-profile-spatial-validation.md
// Logic 5: Xác thực không gian bàn thờ - 3 ĐIỀU KIỆN BẮT BUỘC
// Owner: vows-merit module

import { Injectable, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

interface CreateAltarProfileDto {
  name?: string;
  hasAltar?: boolean;
  spatialChecks: {
    notFacingKitchen: boolean; // Không đối diện bếp
    noMirrorsAround: boolean; // Không có gương phản chiếu
    notOnOverhangingBalcony: boolean; // Không trên ban công cơi nới
  };
}

const SPATIAL_VIOLATION_MESSAGES = {
  notFacingKitchen: 'Bàn thờ đang đối diện bếp — phải di chuyển sang hướng khác.',
  noMirrorsAround: 'Có gương phản chiếu vào bàn thờ — phải dời gương hoặc che lại.',
  notOnOverhangingBalcony: 'Bàn thờ đặt trên ban công cơi nới — phải chuyển vào trong nhà.',
};

@Injectable()
export class AltarSpatialValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo hoặc cập nhật Altar Profile
   * POST /api/vows-merit/altar-profiles
   */
  async createOrUpdateAltarProfile(userId: string, dto: CreateAltarProfileDto) {
    // 1. Kiểm tra TẤT CẢ 3 spatial checks PHẢI = true
    const failed: string[] = [];
    Object.entries(dto.spatialChecks).forEach(([key, value]) => {
      if (value !== true) {
        failed.push(SPATIAL_VIOLATION_MESSAGES[key as keyof typeof SPATIAL_VIOLATION_MESSAGES]);
      }
    });

    if (failed.length > 0) {
      throw new UnprocessableEntityException({
        error: 'spatial_hazard_not_cleared',
        violations: failed,
        message:
          'Bàn thờ chưa đáp ứng điều kiện không gian an toàn. Vui lòng kiểm tra lại vị trí.',
      });
    }

    // 2. Kiểm tra xem user đã có profile chưa
    const existing = await this.prisma.altarProfile.findUnique({
      where: { userId },
    });

    const now = new Date();

    if (existing) {
      // Update existing profile
      const updated = await this.prisma.altarProfile.update({
        where: { userId },
        data: {
          name: dto.name,
          hasAltar: dto.hasAltar ?? true,
          notFacingKitchen: dto.spatialChecks.notFacingKitchen,
          noMirrorsAround: dto.spatialChecks.noMirrorsAround,
          notOnOverhangingBalcony: dto.spatialChecks.notOnOverhangingBalcony,
          spatialConfirmedAt: now,
        },
      });

      return {
        userId: updated.userId,
        spatialConfirmedAt: updated.spatialConfirmedAt,
        message: 'Đã cập nhật hồ sơ bàn thờ với xác nhận không gian an toàn.',
      };
    }

    // Create new profile
    const profile = await this.prisma.altarProfile.create({
      data: {
        userId,
        name: dto.name,
        hasAltar: dto.hasAltar ?? true,
        notFacingKitchen: dto.spatialChecks.notFacingKitchen,
        noMirrorsAround: dto.spatialChecks.noMirrorsAround,
        notOnOverhangingBalcony: dto.spatialChecks.notOnOverhangingBalcony,
        spatialConfirmedAt: now,
      },
    });

    return {
      userId: profile.userId,
      spatialConfirmedAt: profile.spatialConfirmedAt,
      message: 'Đã tạo hồ sơ bàn thờ với xác nhận không gian an toàn.',
    };
  }

  /**
   * Lấy Altar Profile của user
   * GET /api/vows-merit/altar-profiles/me
   */
  async getUserAltarProfile(userId: string) {
    const profile = await this.prisma.altarProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      name: profile.name,
      hasAltar: profile.hasAltar,
      spatialChecks: {
        notFacingKitchen: profile.notFacingKitchen,
        noMirrorsAround: profile.noMirrorsAround,
        notOnOverhangingBalcony: profile.notOnOverhangingBalcony,
      },
      spatialConfirmedAt: profile.spatialConfirmedAt,
      isValid: profile.spatialConfirmedAt !== null,
    };
  }

  /**
   * Kiểm tra xem user có profile hợp lệ chưa
   */
  async hasValidProfile(userId: string): Promise<boolean> {
    const profile = await this.prisma.altarProfile.findUnique({
      where: { userId },
    });

    return (
      profile !== null &&
      profile.spatialConfirmedAt !== null &&
      profile.notFacingKitchen === true &&
      profile.noMirrorsAround === true &&
      profile.notOnOverhangingBalcony === true
    );
  }
}
