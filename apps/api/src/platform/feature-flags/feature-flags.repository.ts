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
        description: data.description,
        metadata: data.metadata as Prisma.InputJsonValue,
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
    return this.prisma.featureFlag.update({
      where: { key },
      data: {
        enabled: data.enabled,
        description: data.description,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async upsert(key: string, data: CreateFeatureFlagInput) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: {
        key: data.key,
        enabled: data.enabled,
        description: data.description,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      update: {
        enabled: data.enabled,
        description: data.description,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
