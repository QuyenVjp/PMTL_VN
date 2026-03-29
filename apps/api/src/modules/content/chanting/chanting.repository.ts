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
}
