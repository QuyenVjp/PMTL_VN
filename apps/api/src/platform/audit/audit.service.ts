import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../common/config/config.service.js";
import { AuditRepository } from "./audit.repository.js";
import {
  hashIpAddress,
  redactMetadataForPersistence,
  verifyChain,
  type ChainRow,
  type VerifyChainOptions,
} from "./audit-integrity.js";
import type { AuditAction, AuditActorType, CreateAuditLogInput } from "./audit.schemas.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface AuditContext {
  /**
   * Canonical actor identity for persistence.
   * Prefer publicId (external) over internal cuid. Controllers should pass
   * `user.publicId` via the AuditContext decorator.
   */
  actorId?: string;
  actorType: AuditActorType;
  /** Raw IP from the request — hashed before persistence, never stored. */
  ipAddress?: string;
  userAgent?: string;
  /** Request/job correlation (typically x-request-id). */
  correlationId?: string;
}

/**
 * Build the persistence input from request context.
 * - Hashes IP with the configured salt; never copies raw IP into the create payload.
 * - Recursively redacts sensitive metadata keys before persistence/hashing.
 */
export function buildAuditLogInput(
  context: AuditContext,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  ipSalt?: string,
): CreateAuditLogInput {
  const ipAddressHash =
    context.ipAddress && ipSalt ? hashIpAddress(context.ipAddress, ipSalt) : undefined;

  const redacted = metadata ? redactMetadataForPersistence(metadata) : null;

  return {
    actorType: context.actorType,
    action,
    resource,
    ...(context.actorId ? { actorId: context.actorId } : {}),
    ...(resourceId ? { resourceId } : {}),
    ...(redacted ? { metadata: redacted } : {}),
    ...(ipAddressHash ? { ipAddressHash } : {}),
    ...(context.userAgent ? { userAgent: context.userAgent } : {}),
    ...(context.correlationId ? { correlationId: context.correlationId } : {}),
  };
}

@Injectable()
export class AuditService {
  constructor(
    private readonly repository: AuditRepository,
    private readonly config: ConfigService,
  ) {}

  private get ipSalt(): string {
    return this.config.auditIpSalt;
  }

  async append(
    context: AuditContext,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const input = buildAuditLogInput(context, action, resource, resourceId, metadata, this.ipSalt);
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
    const input = buildAuditLogInput(context, action, resource, resourceId, metadata, this.ipSalt);
    return this.repository.createInTransaction(tx, input);
  }

  async getActorHistory(actorId: string, limit?: number) {
    return this.repository.findByActor(actorId, limit);
  }

  async getResourceHistory(resource: string, resourceId?: string, limit?: number) {
    return this.repository.findByResource(resource, resourceId, limit);
  }

  /**
   * Verify hash-chain integrity over a sequence range (inclusive).
   *
   * Full-chain (fromSeq=1, default): require genesis (seq 1, previousHash null).
   * Range (fromSeq>1): loads trusted previous row (fromSeq-1) for boundary check.
   */
  async verifyIntegrity(fromSeq = 1n, toSeq?: bigint) {
    const requireGenesis = fromSeq === 1n;
    let trustedPreviousHash: string | null | undefined;

    if (!requireGenesis) {
      const boundary = await this.repository.findBySequence(fromSeq - 1n);
      if (!boundary) {
        return {
          valid: false as const,
          reason: "missing_trusted_checkpoint",
          brokenAt: fromSeq,
          checked: 0,
        };
      }
      trustedPreviousHash = boundary.rowHash;
    }

    const rows = await this.repository.findChainRange(fromSeq, toSeq);
    const chain: ChainRow[] = rows.map((r) => ({
      sequenceNumber: r.sequenceNumber,
      previousHash: r.previousHash,
      rowHash: r.rowHash,
      recompute: {
        data: {
          actorType: r.actorType,
          actorId: r.actorId,
          action: r.action,
          resource: r.resource,
          resourceId: r.resourceId,
          publicId: r.publicId,
          correlationId: r.correlationId,
          metadata: (r.metadata as Record<string, unknown> | null) ?? null,
          ipAddressHash: r.ipAddressHash,
          userAgent: r.userAgent,
        },
        createdAt: r.createdAt,
      },
    }));

    const options: VerifyChainOptions = requireGenesis
      ? { requireGenesis: true }
      : { requireGenesis: false, trustedPreviousHash: trustedPreviousHash ?? null };

    return verifyChain(chain, options);
  }
}
