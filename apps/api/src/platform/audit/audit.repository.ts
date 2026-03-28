import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateAuditLogInput } from "./audit.schemas.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toCreateData(data: CreateAuditLogInput): Prisma.AuditLogCreateInput {
    return {
      actorType: data.actorType,
      action: data.action,
      resource: data.resource,
      ...(data.actorId ? { actorId: data.actorId } : {}),
      ...(data.resourceId ? { resourceId: data.resourceId } : {}),
      ...(data.metadata ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
      ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
    };
  }

  async create(data: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: this.toCreateData(data),
    });
  }

  async createInTransaction(tx: TransactionClient, data: CreateAuditLogInput) {
    return tx.auditLog.create({
      data: this.toCreateData(data),
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
