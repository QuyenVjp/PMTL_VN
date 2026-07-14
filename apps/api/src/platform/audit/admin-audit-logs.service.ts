import { Injectable } from "@nestjs/common";
import { NotFoundError } from "../../common/errors/app-error.js";
import { AuditRepository } from "./audit.repository.js";
import { redactAndSort } from "./audit-integrity.js";
import type { Prisma } from "../../generated/prisma/client.js";

/**
 * Filters accepted by the admin audit-log list. Owned here so the controller
 * only validates the raw query (Zod) and delegates — no Prisma type or
 * where-construction lives in the controller (Plans 4.6).
 */
export interface AuditLogListFilters {
  action?: string;
  actorId?: string;
  resource?: string;
  resourceId?: string;
  correlationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit: number;
  offset: number;
}

/**
 * Admin audit projection rules (review reopen 2026-07-13):
 * - Never return internal-only field names as if they were public IDs.
 * - `resourceId` is the stored resource key (may be publicId or legacy internal).
 * - Metadata is recursively redacted via the same owner as the writer.
 * - Never return raw IP or ip hash value.
 */
@Injectable()
export class AdminAuditLogsService {
  constructor(private readonly repo: AuditRepository) {}

  async list(filters: AuditLogListFilters) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.action) where.action = filters.action;
    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.correlationId) where.correlationId = filters.correlationId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    const { logs, total } = await this.repo.findManyForAdmin({
      where,
      skip: filters.offset,
      take: filters.limit,
    });

    // Phase 4.2 batch 3a: canary list shape — rides inside transport `data`.
    // Do NOT return legacy ListEnvelope { data, meta.pagination } (double-wraps on wire).
    return {
      items: logs.map((log) => ({
        publicId: log.publicId,
        // actorId is expected to be external publicId for new rows (decorator owner).
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        resourceType: log.resource,
        // Honest name: stored resource key, not guaranteed public identity.
        resourceId: log.resourceId,
        correlationId: log.correlationId,
        sequenceNumber: log.sequenceNumber.toString(),
        occurredAt: log.createdAt,
      })),
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      },
    };
  }

  async detail(publicId: string) {
    const log = await this.repo.findByPublicId(publicId);

    if (!log) {
      throw new NotFoundError("Audit log", publicId);
    }

    const safeMetadata = redactAndSort(
      (log.metadata as Record<string, unknown> | null) ?? null,
    );

    return {
      data: {
        publicId: log.publicId,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        resourceType: log.resource,
        resourceId: log.resourceId,
        correlationId: log.correlationId,
        sequenceNumber: log.sequenceNumber.toString(),
        metadata: safeMetadata,
        hasIpHash: Boolean(log.ipAddressHash),
        userAgent: log.userAgent,
        occurredAt: log.createdAt,
      },
    };
  }
}
