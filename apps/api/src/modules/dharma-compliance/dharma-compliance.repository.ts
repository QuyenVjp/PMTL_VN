import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  CharityQuery,
  CreateCharityInput,
  FraudAlertQuery,
  VowQuery,
  LogThoughtInput,
  GuidanceRequestInput,
  ThoughtLogQuery,
  GuidanceQueueQuery,
} from "./dharma-compliance.schemas.js";

@Injectable()
export class DharmaComplianceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Charity ─────────────────────────────────────────────────────────────

  async findManyCharities(query: CharityQuery) {
    const where = {
      ...(query.status && { status: query.status as never }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { registrationNumber: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.charityWhitelist.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.charityWhitelist.count({ where }),
    ]);
    return { data, total };
  }

  async findCharityByPublicId(publicId: string) {
    return this.prisma.charityWhitelist.findUnique({ where: { publicId } });
  }

  async createCharity(input: CreateCharityInput, publicId: string) {
    return this.prisma.charityWhitelist.create({
      data: {
        publicId,
        name: input.name,
        website: input.websiteUrl,
        registrationNumber: input.registrationNumber,
        charityType: input.charityType as never,
        contactEmail: input.contactEmail,
        status: "PENDING_VERIFICATION",
      },
    });
  }

  async updateCharityStatus(id: string, status: string) {
    return this.prisma.charityWhitelist.update({
      where: { id },
      data: { status: status as never },
    });
  }

  // ─── Fraud Alerts ─────────────────────────────────────────────────────────

  async findManyFraudAlerts(query: FraudAlertQuery) {
    const where = {
      ...(query.severity && { severity: query.severity as never }),
      ...(query.resolved !== undefined && {
        resolvedAt: query.resolved ? { not: null } : null,
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.fraudDetectionAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: { charity: { select: { publicId: true, name: true } } },
      }),
      this.prisma.fraudDetectionAlert.count({ where }),
    ]);
    return { data, total };
  }

  async findFraudAlertByPublicId(publicId: string) {
    return this.prisma.fraudDetectionAlert.findUnique({
      where: { publicId },
      include: { charity: { select: { publicId: true, name: true } } },
    });
  }

  async resolveFraudAlert(id: string, resolution: string, resolvedById: string) {
    return this.prisma.fraudDetectionAlert.update({
      where: { id },
      data: { resolvedAt: new Date(), resolutionNote: resolution, resolvedById },
    });
  }

  // ─── Marital Purity Vow ───────────────────────────────────────────────────

  async findManyVows(query: VowQuery) {
    const where = {
      ...(query.status && { status: query.status }),
      ...(query.purityLevel && { purityLevel: query.purityLevel as never }),
    };
    const [data, total] = await Promise.all([
      this.prisma.maritalPurityVow.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: {
          practitioner: { select: { publicId: true, displayName: true, email: true } },
        },
      }),
      this.prisma.maritalPurityVow.count({ where }),
    ]);
    return { data, total };
  }

  async findVowByPublicId(publicId: string) {
    return this.prisma.maritalPurityVow.findUnique({
      where: { publicId },
      include: {
        practitioner: { select: { publicId: true, displayName: true } },
        thoughtLogs: { orderBy: { timestamp: "desc" }, take: 10 },
        guidanceReqs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  }

  async findVowByUserId(userId: string) {
    return this.prisma.maritalPurityVow.findFirst({
      where: { practitionerId: userId, status: "ACTIVE" },
    });
  }

  async createVow(
    input: { vowDate: Date; purityLevel: string; kissAllowed: boolean; hugAllowed: boolean; sleepArrangement: string; dailyRecitations: string[]; notes?: string },
    practitionerId: string,
    spouseId: string | undefined,
    publicId: string,
  ) {
    return this.prisma.maritalPurityVow.create({
      data: {
        publicId,
        practitionerId,
        spouseId,
        vowDate: input.vowDate,
        purityLevel: input.purityLevel as never,
        kissAllowed: input.kissAllowed,
        hugAllowed: input.hugAllowed,
        sleepArrangement: input.sleepArrangement,
        dailyRecitations: input.dailyRecitations,
        notes: input.notes,
        status: "ACTIVE",
      },
    });
  }

  async updateVowStatus(id: string, status: string) {
    return this.prisma.maritalPurityVow.update({ where: { id }, data: { status } });
  }

  async createThoughtLog(input: LogThoughtInput, vowId: string) {
    return this.prisma.thoughtStateLog.create({
      data: {
        vowId,
        thoughtType: input.thoughtType as never,
        intensity: input.intensity,
        durationMinutes: input.durationMinutes,
        trigger: input.trigger,
        responseAction: input.responseAction,
        recitationsUsed: input.recitationsUsed,
        resolved: input.resolved,
        reflection: input.reflection,
      },
    });
  }

  async findThoughtLogs(vowId: string, query: ThoughtLogQuery) {
    const since = new Date();
    since.setDate(since.getDate() - query.days);
    const [data, total] = await Promise.all([
      this.prisma.thoughtStateLog.findMany({
        where: { vowId, timestamp: { gte: since } },
        orderBy: { timestamp: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.thoughtStateLog.count({ where: { vowId, timestamp: { gte: since } } }),
    ]);
    return { data, total };
  }

  async createGuidanceRequest(input: GuidanceRequestInput, vowId: string, _publicId: string) {
    return this.prisma.maritalGuidanceRequest.create({
      data: {
        vowId,
        category: input.category,
        question: input.question,
        context: input.context,
        urgency: input.urgency,
        status: "PENDING",
      },
    });
  }

  async countRecentVowAuditEvents(vowId: string, eventType: string, since: Date) {
    return this.prisma.vowAuditEvent.count({
      where: {
        vowId,
        eventType,
        createdAt: { gte: since },
      },
    });
  }

  async findOpenGuidanceRequest(vowId: string, category: string) {
    return this.prisma.maritalGuidanceRequest.findFirst({
      where: {
        vowId,
        category,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findGuidanceQueue(query: GuidanceQueueQuery) {
    const where = {
      ...(query.urgency && { urgency: query.urgency }),
      ...(query.status && { status: query.status }),
    };
    const [data, total] = await Promise.all([
      this.prisma.maritalGuidanceRequest.findMany({
        where,
        orderBy: [{ urgency: "desc" }, { createdAt: "asc" }],
        take: query.limit,
        skip: query.offset,
        include: { vow: { select: { publicId: true, practitioner: { select: { displayName: true } } } } },
      }),
      this.prisma.maritalGuidanceRequest.count({ where }),
    ]);
    return { data, total };
  }

  async respondToGuidance(id: string, response: string) {
    return this.prisma.maritalGuidanceRequest.update({
      where: { id },
      data: { response, status: "ANSWERED", updatedAt: new Date() },
    });
  }

  async appendVowAudit(vowId: string, eventType: string, actor: string, details: string, prev?: object, next?: object) {
    return this.prisma.vowAuditEvent.create({
      data: {
        vowId,
        eventType,
        actor,
        details,
        previousState: prev as never,
        newState: next as never,
      },
    });
  }
}
