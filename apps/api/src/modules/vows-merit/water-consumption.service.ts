// Design: design/03-domains/vows-merit/REFERENCES/WATER-CONSUMPTION-MUDRA.md  
// Design: design/03-domains/vows-merit/USE_CASES/validate-altar-oil-and-water.md
// Logic 4: Giao thức Tiêu thụ Nước Cúng
// Owner: vows-merit module

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { BodhisattvaType, WaterConsumptionMethod } from '../../generated/prisma/enums.js';

interface WaterOfferingDto {
  bodhisattvaType: BodhisattvaType;
  consumptionMethod: WaterConsumptionMethod;
  daBeiZhouRecited?: boolean;
  date: string; // ISO date
  note?: string;
}

@Injectable()
export class WaterConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo log uống nước cúng
   * POST /api/vows-merit/water-offering
   */
  async logWaterConsumption(userId: string, dto: WaterOfferingDto) {
    // Business Rule từ design doc:
    // - Thích Ca Mâu Ni / Quán Thế Âm: DRINK_DIRECTLY
    // - Nam Kinh / Thái Tuế / Quan Đế / Châu Xương / Quan Bình: MUST_RECITE_ONE_DBZ hoặc MUST_DISCARD

    const isMainBodhisattva =
      dto.bodhisattvaType === BodhisattvaType.THICH_CA_MAU_NI ||
      dto.bodhisattvaType === BodhisattvaType.QUAN_THE_AM;

    // Validate consumption method dựa trên loại Bồ Tát
    if (isMainBodhisattva) {
      // Chỉ cho phép DRINK_DIRECTLY
      if (dto.consumptionMethod !== WaterConsumptionMethod.DRINK_DIRECTLY) {
        throw new BadRequestException({
          error: 'invalid_consumption_method',
          message:
            'Nước cúng của Thích Ca Mâu Ni Phật và Quán Thế Âm Bồ Tát có thể rót ra ly khác uống trực tiếp.',
          allowedMethods: [WaterConsumptionMethod.DRINK_DIRECTLY],
        });
      }
    } else {
      // Bồ Tát khác: MUST_RECITE_ONE_DBZ hoặc MUST_DISCARD
      if (dto.consumptionMethod === WaterConsumptionMethod.DRINK_DIRECTLY) {
        throw new BadRequestException({
          error: 'invalid_consumption_method',
          message:
            'Nước cúng của các Bồ Tát khác CẤM uống trực tiếp. Phải niệm 1 biến Chú Đại Bi trước khi uống hoặc đổ bỏ.',
          allowedMethods: [
            WaterConsumptionMethod.MUST_RECITE_ONE_DBZ,
            WaterConsumptionMethod.MUST_DISCARD,
          ],
        });
      }

      // Nếu chọn MUST_RECITE_ONE_DBZ, phải xác nhận đã niệm
      if (
        dto.consumptionMethod === WaterConsumptionMethod.MUST_RECITE_ONE_DBZ &&
        !dto.daBeiZhouRecited
      ) {
        throw new BadRequestException({
          error: 'da_bei_zhou_not_recited',
          message: 'Bạn phải niệm 1 biến Chú Đại Bi trước khi uống nước cúng của Bồ Tát này.',
          field: 'daBeiZhouRecited',
        });
      }
    }

    // Tạo log
    const log = await this.prisma.waterOfferingLog.create({
      data: {
        publicId: `water_${Date.now()}`,
        userId,
        bodhisattvaType: dto.bodhisattvaType,
        consumptionMethod: dto.consumptionMethod,
        daBeiZhouRecited: dto.daBeiZhouRecited || false,
        date: new Date(dto.date),
        note: dto.note,
      },
    });

    return {
      publicId: log.publicId,
      bodhisattvaType: log.bodhisattvaType,
      consumptionMethod: log.consumptionMethod,
      createdAt: log.createdAt,
    };
  }

  /**
   * Lấy lịch sử uống nước cúng
   */
  async getUserWaterLogs(userId: string, limit = 30) {
    return this.prisma.waterOfferingLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  /**
   * Lấy hướng dẫn cho loại Bồ Tát
   */
  getConsumptionGuidance(bodhisattvaType: BodhisattvaType) {
    const isMainBodhisattva =
      bodhisattvaType === BodhisattvaType.THICH_CA_MAU_NI ||
      bodhisattvaType === BodhisattvaType.QUAN_THE_AM;

    if (isMainBodhisattva) {
      return {
        bodhisattvaType,
        allowedMethods: [WaterConsumptionMethod.DRINK_DIRECTLY],
        instructions:
          'Rót ra cốc khác để uống, úp lòng bàn tay xuống miệng cốc quán tưởng.',
        restrictions: [
          'Cấm hâm bằng lò vi sóng',
          'Cấm dùng nước này để tưới cây',
          'Cấm trộn lẫn các ly nước vào nhau',
        ],
      };
    }

    return {
      bodhisattvaType,
      allowedMethods: [
        WaterConsumptionMethod.MUST_RECITE_ONE_DBZ,
        WaterConsumptionMethod.MUST_DISCARD,
      ],
      instructions:
        'CẢNH BÁO: CẤM uống trực tiếp. Phải niệm 1 biến Chú Đại Bi trước khi uống, hoặc đổ bỏ.',
      restrictions: [
        'Cấm hâm bằng lò vi sóng',
        'Cấm dùng nước này để tưới cây',
        'Cấm trộn lẫn các ly nước vào nhau',
        'Cấm uống trực tiếp nếu không niệm Chú Đại Bi',
      ],
    };
  }
}
