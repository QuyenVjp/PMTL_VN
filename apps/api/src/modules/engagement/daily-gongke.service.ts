import { Injectable, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { UpsertDailyGongkeInput, DailyGongkeQuery } from "./daily-gongke.schemas.js";

@Injectable()
export class DailyGongkeService {
  private readonly logger = new Logger(DailyGongkeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Upsert: nếu đã có log ngày đó thì update, nếu chưa thì tạo mới
  async upsertLog(input: UpsertDailyGongkeInput, userId: string) {
    const date = new Date(input.date);

    const existing = await this.prisma.dailyGongkeLog.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (existing) {
      const updated = await this.prisma.dailyGongkeLog.update({
        where: { id: existing.id },
        data: {
          coreCountsJson: input.coreCounts,
          busyMode: input.busyMode,
          heartIncense: input.heartIncense,
          note: input.note ?? null,
        },
      });
      this.logger.log({
        msg: "daily_gongke.updated",
        userId,
        date: input.date,
        busyMode: input.busyMode,
      });
      return this.toDto(updated);
    }

    const created = await this.prisma.dailyGongkeLog.create({
      data: {
        publicId: nanoid(21),
        userId,
        date,
        coreCountsJson: input.coreCounts,
        busyMode: input.busyMode,
        heartIncense: input.heartIncense,
        note: input.note ?? null,
      },
    });
    this.logger.log({
      msg: "daily_gongke.created",
      userId,
      date: input.date,
      busyMode: input.busyMode,
    });
    return this.toDto(created);
  }

  async getLog(userId: string, date: string) {
    const record = await this.prisma.dailyGongkeLog.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
    return record ? this.toDto(record) : null;
  }

  async listLogs(userId: string, query: DailyGongkeQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.from || query.to) {
      where["date"] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyGongkeLog.findMany({
        where,
        orderBy: { date: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.dailyGongkeLog.count({ where }),
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

  private toDto(record: {
    publicId: string;
    date: Date;
    coreCountsJson: unknown;
    busyMode: boolean;
    heartIncense: boolean;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      date: record.date.toISOString().slice(0, 10),
      coreCounts: record.coreCountsJson as Record<string, number>,
      busyMode: record.busyMode,
      heartIncense: record.heartIncense,
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
