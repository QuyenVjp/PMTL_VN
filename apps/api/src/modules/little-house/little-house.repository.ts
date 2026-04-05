import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  LhQuery,
  CreateLhRecordInput,
  LogRecitationInput,
  DottingSessionInput,
  CombustionLogInput,
  FlagFraudInput,
  FraudQuery,
} from "./little-house.schemas.js";

@Injectable()
export class LittleHouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: LhQuery) {
    const where = {
      ...(query.status && { status: query.status as never }),
      ...(query.userId && { userId: query.userId }),
      ...(query.search && {
        beneficiaryName: { contains: query.search, mode: "insensitive" as const },
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.lhRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: { user: { select: { publicId: true, displayName: true } } },
      }),
      this.prisma.lhRecord.count({ where }),
    ]);
    return { data, total };
  }

  async findByPublicId(publicId: string) {
    return this.prisma.lhRecord.findUnique({
      where: { publicId },
      include: {
        user: { select: { publicId: true, displayName: true, email: true } },
        recitations: { orderBy: { sessionDate: "desc" }, take: 20 },
        completions: true,
        dottingSessions: { orderBy: { createdAt: "desc" } },
        combustionLogs: { orderBy: { burnedAt: "desc" } },
        fraudLogs: { orderBy: { flaggedAt: "desc" } },
      },
    });
  }

  async create(input: CreateLhRecordInput, userId: string, publicId: string) {
    return this.prisma.lhRecord.create({
      data: {
        publicId,
        userId,
        beneficiaryName: input.beneficiaryName,
        vowText: input.vowText,
        status: "DRAFT",
        draftedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string, timestamps: Partial<Record<string, Date>>) {
    return this.prisma.lhRecord.update({
      where: { id },
      data: { status: status as never, ...timestamps },
    });
  }

  async logRecitation(input: LogRecitationInput, lhRecordId: string) {
    return this.prisma.lhRecitation.create({
      data: {
        lhRecordId,
        recitationType: input.recitationType as never,
        count: input.count,
        sessionDate: new Date(input.sessionDate),
        chanterName: input.chanterName,
      },
    });
  }

  async createDottingSession(input: DottingSessionInput, lhRecordId: string) {
    return this.prisma.lhDottingSession.create({
      data: {
        lhRecordId,
        status: "IN_PROGRESS",
        dottedAt: new Date(),
        operatorName: input.operatorName,
        notes: input.notes,
      },
    });
  }

  async completeDottingSession(id: string) {
    return this.prisma.lhDottingSession.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
  }

  async createCombustionLog(input: CombustionLogInput, lhRecordId: string) {
    return this.prisma.lhCombustionLog.create({
      data: {
        lhRecordId,
        burnedAt: new Date(input.burnedAt),
        altitude: input.altitude,
        containerType: input.containerType,
        operatorName: input.operatorName,
        notes: input.notes,
      },
    });
  }

  async createCompletion(lhRecordId: string, witness?: string) {
    return this.prisma.lhCompletionRecord.create({
      data: { lhRecordId, completedAt: new Date(), witness },
    });
  }

  async flagFraud(input: FlagFraudInput, lhRecordId: string) {
    return this.prisma.lhFraud.create({
      data: {
        lhRecordId,
        reason: input.reason,
        severity: input.severity,
      },
    });
  }

  async findManyFraud(query: FraudQuery) {
    const where = {
      ...(query.severity && { severity: query.severity }),
      ...(query.resolved !== undefined && {
        resolvedAt: query.resolved ? { not: null } : null,
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.lhFraud.findMany({
        where,
        orderBy: { flaggedAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: { lhRecord: { select: { publicId: true, beneficiaryName: true } } },
      }),
      this.prisma.lhFraud.count({ where }),
    ]);
    return { data, total };
  }

  async resolveFraud(id: string, resolution: string) {
    return this.prisma.lhFraud.update({
      where: { id },
      data: { resolvedAt: new Date(), resolution },
    });
  }
}
