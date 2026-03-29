import { Injectable, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import {
  SYMPTOM_SUGGESTIONS,
  type CreateActivationLogInput,
  type ActivationLogQuery,
} from "./activation.schemas.js";

@Injectable()
export class ActivationService {
  private readonly logger = new Logger(ActivationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Log triệu chứng + trả về gợi ý lane thực hành (advisory only)
  async createLog(input: CreateActivationLogInput, userId: string) {
    const suggestedActions = SYMPTOM_SUGGESTIONS[input.symptomTag] ?? [];

    const record = await this.prisma.activationLog.create({
      data: {
        publicId: nanoid(21),
        userId,
        date: new Date(input.date),
        symptomTag: input.symptomTag,
        suggestedActionsJson: suggestedActions,
        privateNote: input.privateNote ?? null,
      },
    });

    this.logger.log({
      msg: "activation_log.created",
      userId,
      publicId: record.publicId,
      symptomTag: input.symptomTag,
    });

    return this.toDto(record);
  }

  async listLogs(userId: string, query: ActivationLogQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.symptomTag) where["symptomTag"] = query.symptomTag;
    if (query.from || query.to) {
      where["date"] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.activationLog.findMany({
        where,
        orderBy: { date: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.activationLog.count({ where }),
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
    symptomTag: string;
    suggestedActionsJson: unknown;
    privateNote: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      date: record.date.toISOString().slice(0, 10),
      symptomTag: record.symptomTag,
      // Gợi ý advisory: chỉ là lane thực hành, không chẩn đoán y tế hay tâm linh
      suggestedActions: record.suggestedActionsJson as string[],
      privateNote: record.privateNote,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
