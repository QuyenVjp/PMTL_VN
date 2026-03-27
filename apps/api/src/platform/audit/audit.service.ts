import { Injectable } from "@nestjs/common";
import { AuditRepository } from "./audit.repository.js";
import type { AuditAction, AuditActorType, CreateAuditLogInput } from "./audit.schemas.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export interface AuditContext {
  actorId?: string;
  actorType: AuditActorType;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  async append(
    context: AuditContext,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const input: CreateAuditLogInput = {
      actorId: context.actorId,
      actorType: context.actorType,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    return this.repository.create(input);
  }

  async appendInTransaction(
    tx: TransactionClient,
    context: AuditContext,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const input: CreateAuditLogInput = {
      actorId: context.actorId,
      actorType: context.actorType,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    return this.repository.createInTransaction(tx, input);
  }

  async getActorHistory(actorId: string, limit?: number) {
    return this.repository.findByActor(actorId, limit);
  }

  async getResourceHistory(resource: string, resourceId?: string, limit?: number) {
    return this.repository.findByResource(resource, resourceId, limit);
  }
}
