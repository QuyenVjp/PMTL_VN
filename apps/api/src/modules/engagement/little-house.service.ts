import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateLittleHouseInput, AdvanceLittleHouseInput, LittleHouseQuery } from "./little-house.schemas.js";

// Lifecycle order: DRAFT -> SIGNED -> CHANTED -> BURNED
const LIFECYCLE_ORDER = ["DRAFT", "SIGNED", "CHANTED", "BURNED"] as const;
type LittleHouseStatus = (typeof LIFECYCLE_ORDER)[number];

function nextAllowed(current: LittleHouseStatus): LittleHouseStatus[] {
  const idx = LIFECYCLE_ORDER.indexOf(current);
  if (idx < 0 || idx === LIFECYCLE_ORDER.length - 1) return [];
  return [LIFECYCLE_ORDER[idx + 1]];
}

@Injectable()
export class LittleHouseService {
  private readonly logger = new Logger(LittleHouseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateLittleHouseInput, userId: string) {
    // Phase 12 Logic 2: Auto-format offerTo for RESOLVE_CONFLICT
    let offerTo = input.recipient;
    if (input.purpose === "RESOLVE_CONFLICT") {
      // Get user's display name
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true },
      });
      offerTo = `${user?.displayName || "Người dùng"} hóa giải oán kết`;
    }

    const record = await this.prisma.littleHouse.create({
      data: {
        publicId: nanoid(21),
        userId,
        recipient: input.recipient,
        recipientName: input.recipientName,
        offerTo,
        purpose: input.purpose,
        sheetsCount: input.sheetsCount,
        specialCase: input.specialCase,
        status: "DRAFT",
        startedAt: new Date(), // Phase 12 Logic 1: Track start time for 7-day warning
      },
    });
    this.logger.log({ msg: "little_house.created", userId, publicId: record.publicId, purpose: input.purpose });
    return this.toDto(record);
  }

  async advance(input: AdvanceLittleHouseInput, userId: string) {
    const record = await this.prisma.littleHouse.findFirst({
      where: { publicId: input.publicId, userId },
    });
    if (!record) throw new NotFoundException("Ngôi nhà nhỏ không tồn tại");

    const currentStatus = record.status as LittleHouseStatus;
    const allowed = nextAllowed(currentStatus);

    if (!allowed.includes(input.nextStatus as LittleHouseStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${currentStatus} sang ${input.nextStatus}. Trạng thái hợp lệ tiếp theo: ${allowed.join(", ") || "không có"}`,
      );
    }

    // Special case: phải confirm trước khi chuyển trạng thái
    if (record.specialCase && input.specialCaseConfirmed !== true) {
      throw new BadRequestException(
        "Trường hợp đặc biệt: cần xác nhận (specialCaseConfirmed = true) trước khi tiếp tục",
      );
    }

    const updated = await this.prisma.littleHouse.update({
      where: { id: record.id },
      data: {
        status: input.nextStatus,
        burnDate: input.burnDate ? new Date(input.burnDate) : undefined,
        postBurnNote: input.postBurnNote ?? undefined,
        confirmedAt: record.specialCase ? new Date() : undefined,
      },
    });

    this.logger.log({
      msg: "little_house.advanced",
      userId,
      publicId: input.publicId,
      from: currentStatus,
      to: input.nextStatus,
    });
    return this.toDto(updated);
  }

  async list(userId: string, query: LittleHouseQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.status) where["status"] = query.status;

    const [data, total] = await Promise.all([
      this.prisma.littleHouse.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.littleHouse.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toDto(r)),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async getOne(publicId: string, userId: string) {
    const record = await this.prisma.littleHouse.findFirst({
      where: { publicId, userId },
    });
    if (!record) throw new NotFoundException("Ngôi nhà nhỏ không tồn tại");
    return this.toDto(record);
  }

  private toDto(record: {
    publicId: string;
    recipient: string;
    sheetsCount: number;
    status: string;
    specialCase: boolean;
    burnDate: Date | null;
    postBurnNote: string | null;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      recipient: record.recipient,
      sheetsCount: record.sheetsCount,
      status: record.status as LittleHouseStatus,
      specialCase: record.specialCase,
      allowedNextStatuses: nextAllowed(record.status as LittleHouseStatus),
      burnDate: record.burnDate?.toISOString() ?? null,
      postBurnNote: record.postBurnNote,
      confirmedAt: record.confirmedAt?.toISOString() ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
