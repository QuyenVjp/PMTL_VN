import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateAltarLogInput, AltarLogQuery } from "./altar.schemas.js";

@Injectable()
export class AltarService {
  private readonly logger = new Logger(AltarService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(input: CreateAltarLogInput, userId: string) {
    const record = await this.prisma.altarLog.create({
      data: {
        publicId: nanoid(21),
        userId,
        date: new Date(input.date),
        actionType: input.actionType,
        checklistStateJson: input.checklistState,
        note: input.note ?? null,
      },
    });
    this.logger.log({
      msg: "altar_log.created",
      userId,
      publicId: record.publicId,
      actionType: input.actionType,
    });
    return this.toDto(record);
  }

  async listLogs(userId: string, query: AltarLogQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.actionType) where["actionType"] = query.actionType;
    if (query.from || query.to) {
      where["date"] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.altarLog.findMany({
        where,
        orderBy: { date: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.altarLog.count({ where }),
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

  async getLog(publicId: string, userId: string) {
    const record = await this.prisma.altarLog.findFirst({
      where: { publicId, userId },
    });
    if (!record) throw new NotFoundException("Nhật ký bảo dưỡng bàn thờ không tồn tại");
    return this.toDto(record);
  }

  private toDto(record: {
    publicId: string;
    date: Date;
    actionType: string;
    checklistStateJson: unknown;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      date: record.date.toISOString().slice(0, 10),
      actionType: record.actionType,
      checklistState: record.checklistStateJson as Record<string, boolean>,
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
