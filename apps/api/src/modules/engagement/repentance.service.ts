import { Injectable, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { UpsertRepentanceInput, RepentanceQuery } from "./repentance.schemas.js";

@Injectable()
export class RepentanceService {
  private readonly logger = new Logger(RepentanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Nhật ký sám hối: upsert theo ngày, hoàn toàn private
  async upsertLog(input: UpsertRepentanceInput, userId: string) {
    const date = new Date(input.date);

    const existing = await this.prisma.repentanceLog.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (existing) {
      const updated = await this.prisma.repentanceLog.update({
        where: { id: existing.id },
        data: {
          count: input.count,
          privateNote: input.privateNote ?? null,
        },
      });
      this.logger.log({ msg: "repentance.updated", userId, date: input.date });
      return this.toDto(updated);
    }

    const created = await this.prisma.repentanceLog.create({
      data: {
        publicId: nanoid(21),
        userId,
        date,
        count: input.count,
        privateNote: input.privateNote ?? null,
      },
    });
    this.logger.log({ msg: "repentance.created", userId, date: input.date });
    return this.toDto(created);
  }

  async getLog(userId: string, date: string) {
    const record = await this.prisma.repentanceLog.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
    return record ? this.toDto(record) : null;
  }

  async listLogs(userId: string, query: RepentanceQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.from || query.to) {
      where["date"] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.repentanceLog.findMany({
        where,
        orderBy: { date: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.repentanceLog.count({ where }),
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
    count: number;
    privateNote: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      date: record.date.toISOString().slice(0, 10),
      count: record.count,
      // privateNote chỉ trả về cho chính user — không expose qua admin read model
      privateNote: record.privateNote,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
