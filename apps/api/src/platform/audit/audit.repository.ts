import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateAuditLogInput } from "./audit.schemas.js";
import {
  AUDIT_CHAIN_LOCK_KEY,
  computeRowHash,
  type AuditRowData,
} from "./audit-integrity.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type DbClient = PrismaService | TransactionClient;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append under an advisory xact lock so concurrent writers cannot fork the chain.
   * Always opens its own transaction when no caller tx is provided.
   */
  async create(data: CreateAuditLogInput) {
    return this.prisma.$transaction(async (tx) => this.appendLocked(tx, data));
  }

  /**
   * Append inside an existing business transaction.
   * Shares the same advisory lock key so standalone appends and in-tx appends serialize.
   */
  async createInTransaction(tx: TransactionClient, data: CreateAuditLogInput) {
    return this.appendLocked(tx, data);
  }

  private async appendLocked(tx: DbClient, data: CreateAuditLogInput) {
    // Serialize chain writers for the duration of this transaction.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${AUDIT_CHAIN_LOCK_KEY}))`;

    const last = await tx.auditLog.findFirst({
      orderBy: { sequenceNumber: "desc" },
      select: { sequenceNumber: true, rowHash: true },
    });

    const sequenceNumber = last ? last.sequenceNumber + 1n : 1n;
    const previousHash = last?.rowHash ?? null;
    const publicId = nanoid(21);
    const createdAt = new Date();

    const rowData: AuditRowData = {
      actorType: data.actorType,
      actorId: data.actorId ?? null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      publicId,
      correlationId: data.correlationId ?? null,
      metadata: data.metadata ?? null,
      ipAddressHash: data.ipAddressHash ?? null,
      userAgent: data.userAgent ?? null,
    };

    const rowHash = computeRowHash(sequenceNumber, previousHash, rowData, createdAt);

    return tx.auditLog.create({
      data: {
        publicId,
        actorType: data.actorType,
        action: data.action,
        resource: data.resource,
        sequenceNumber,
        previousHash,
        rowHash,
        // hash_version 2 = recursive key-sort + redaction (audit-integrity.ts)
        hashVersion: 2,
        createdAt,
        ...(data.actorId ? { actorId: data.actorId } : {}),
        ...(data.resourceId ? { resourceId: data.resourceId } : {}),
        ...(data.metadata ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
        ...(data.ipAddressHash ? { ipAddressHash: data.ipAddressHash } : {}),
        ...(data.userAgent ? { userAgent: data.userAgent } : {}),
        ...(data.correlationId ? { correlationId: data.correlationId } : {}),
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

  async findByPublicId(publicId: string) {
    return this.prisma.auditLog.findUnique({ where: { publicId } });
  }

  async findManyForAdmin(params: {
    where: Prisma.AuditLogWhereInput;
    skip: number;
    take: number;
  }) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: params.where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
        select: {
          publicId: true,
          actorId: true,
          actorType: true,
          action: true,
          resource: true,
          resourceId: true,
          correlationId: true,
          sequenceNumber: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.count({ where: params.where }),
    ]);
    return { logs, total };
  }

  /**
   * Contiguous chain slice ordered by sequence (for integrity verification).
   */
  async findChainRange(fromSeq: bigint, toSeq?: bigint) {
    return this.prisma.auditLog.findMany({
      where: {
        sequenceNumber: {
          gte: fromSeq,
          ...(toSeq !== undefined ? { lte: toSeq } : {}),
        },
      },
      orderBy: { sequenceNumber: "asc" },
    });
  }

  /** Trusted checkpoint lookup for range verification boundary. */
  async findBySequence(sequenceNumber: bigint) {
    return this.prisma.auditLog.findUnique({
      where: { sequenceNumber },
      select: {
        sequenceNumber: true,
        previousHash: true,
        rowHash: true,
      },
    });
  }
}
