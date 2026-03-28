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

export function buildAuditLogInput(
  context: AuditContext,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
): CreateAuditLogInput {
  return {
    actorType: context.actorType,
    action,
    resource,
    ...(context.actorId ? { actorId: context.actorId } : {}),
    ...(resourceId ? { resourceId } : {}),
    ...(metadata ? { metadata } : {}),
    ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
    ...(context.userAgent ? { userAgent: context.userAgent } : {}),
  };
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
    const input = buildAuditLogInput(context, action, resource, resourceId, metadata);

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
    const input = buildAuditLogInput(context, action, resource, resourceId, metadata);

    return this.repository.createInTransaction(tx, input);
  }

  async getActorHistory(actorId: string, limit?: number) {
    return this.repository.findByActor(actorId, limit);
  }

  async getResourceHistory(resource: string, resourceId?: string, limit?: number) {
    return this.repository.findByResource(resource, resourceId, limit);
  }
}
