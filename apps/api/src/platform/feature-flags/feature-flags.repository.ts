import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateFeatureFlagInput, UpdateFeatureFlagInput } from "./feature-flags.schemas.js";
import type { Prisma } from "../../generated/prisma/client.js";

@Injectable()
export class FeatureFlagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFeatureFlagInput) {
    return this.prisma.featureFlag.create({
      data: {
        key: data.key,
        enabled: data.enabled,
        ...(data.description !== undefined && { description: data.description }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
    });
  }

  async findByKey(key: string) {
    return this.prisma.featureFlag.findUnique({
      where: { key },
    });
  }

  async findAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
  }

  async update(key: string, data: UpdateFeatureFlagInput) {
    const updateData: Record<string, unknown> = {};
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.metadata !== undefined) updateData.metadata = data.metadata as Prisma.InputJsonValue;

    return this.prisma.featureFlag.update({
      where: { key },
      data: updateData,
    });
  }

  async upsert(key: string, data: CreateFeatureFlagInput) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: {
        key: data.key,
        enabled: data.enabled,
        ...(data.description !== undefined && { description: data.description }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
      update: {
        enabled: data.enabled,
        ...(data.description !== undefined && { description: data.description }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
    });
  }
}
