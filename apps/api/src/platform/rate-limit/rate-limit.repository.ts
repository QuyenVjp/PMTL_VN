import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

@Injectable()
export class RateLimitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateRecord(key: string, endpoint: string, windowStart: Date, expiresAt: Date) {
    return this.prisma.rateLimitRecord.upsert({
      where: {
        key_endpoint_windowStart: {
          key,
          endpoint,
          windowStart,
        },
      },
      create: {
        key,
        endpoint,
        windowStart,
        expiresAt,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });
  }

  async getRecord(key: string, endpoint: string, windowStart: Date) {
    return this.prisma.rateLimitRecord.findUnique({
      where: {
        key_endpoint_windowStart: {
          key,
          endpoint,
          windowStart,
        },
      },
    });
  }

  async deleteExpired() {
    return this.prisma.rateLimitRecord.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
