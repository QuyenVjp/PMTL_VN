import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateAuditLogInput } from "./audit.schemas.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actorType: data.actorType,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async createInTransaction(tx: TransactionClient, data: CreateAuditLogInput) {
    return tx.auditLog.create({
      data: {
        actorId: data.actorId,
        actorType: data.actorType,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findByActor(actorId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByResource(resource: string, resourceId?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        ...(resourceId && { resourceId }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByAction(action: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
