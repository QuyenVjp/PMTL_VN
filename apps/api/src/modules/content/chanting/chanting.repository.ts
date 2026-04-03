import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class ChantingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllGroups() {
    return this.prisma.chantEnvironmentRuleGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        rules: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async findGroupByKey(groupKey: string) {
    return this.prisma.chantEnvironmentRuleGroup.findUnique({
      where: { groupKey },
      include: {
        rules: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async countRulesByGroup() {
    const groups = await this.prisma.chantEnvironmentRuleGroup.findMany({
      select: {
        groupKey: true,
        _count: {
          select: { rules: true },
        },
      },
    });

    return groups.reduce(
      (acc, g) => {
        acc[g.groupKey] = g._count.rules;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async findRuleByKey(ruleKey: string) {
    return this.prisma.chantEnvironmentRule.findUnique({
      where: { ruleKey },
      include: { group: true },
    });
  }

  async updateRuleByKey(ruleKey: string, data: Prisma.ChantEnvironmentRuleUpdateInput) {
    return this.prisma.chantEnvironmentRule.update({
      where: { ruleKey },
      data,
      include: { group: true },
    });
  }

  // ============================================================================
  // Chanting Sessions
  // ============================================================================

  async findChantingSessions(args: Prisma.ChantingSessionFindManyArgs) {
    return this.prisma.chantingSession.findMany(args);
  }

  async countChantingSessions(args: Prisma.ChantingSessionCountArgs) {
    return this.prisma.chantingSession.count(args);
  }

  async findChantingSessionById(sessionId: string) {
    return this.prisma.chantingSession.findUnique({
      where: { id: sessionId },
    });
  }

  // ── Admin typed variants — include encoded statically so Prisma infers payload ──

  async findChantingSessionsAdminList(args: {
    where?: Prisma.ChantingSessionWhereInput;
    orderBy?: Prisma.ChantingSessionOrderByWithRelationInput | Prisma.ChantingSessionOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }) {
    return this.prisma.chantingSession.findMany({
      ...args,
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
      },
    });
  }

  async findChantingSessionByIdAdmin(sessionId: string) {
    return this.prisma.chantingSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, role: true },
        },
      },
    });
  }

  async createChantingSession(data: Prisma.ChantingSessionUncheckedCreateInput) {
    return this.prisma.chantingSession.create({
      data,
    });
  }

  async updateChantingSession(sessionId: string, data: Prisma.ChantingSessionUncheckedUpdateInput) {
    return this.prisma.chantingSession.update({
      where: { id: sessionId },
      data,
    });
  }

  async deleteChantingSession(sessionId: string) {
    return this.prisma.chantingSession.delete({
      where: { id: sessionId },
    });
  }
}
