/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
/**
 * OutboxService — Transactional Event Sourcing
 *
 * Core responsibility: Append events to outbox_events table atomically within
 * caller's Prisma transaction. This ensures events are persisted iff the
 * business transaction succeeds.
 *
 * Design: Outbox Pattern for reliable event dispatch
 * Reference: design/02-platform-baseline/optional-scale/EVENT_SOURCING_ARCHITECTURE.md
 */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { OUTBOX_CONFIG, type OutboxEventType } from "./outbox.constants.js";

/**
 * Type alias for Prisma transaction client (works with both explicit and implicit transactions)
 */
type TransactionClient = Parameters<
  Parameters<typeof PrismaService.prototype.$transaction>[0]
>[0];

export interface OutboxEventPayload {
  [key: string]: any;
}

export interface OutboxEventRow {
  id: string;
  createdAt: Date;
  processedAt: Date | null;
  eventType: string;
  aggregateId: string;
  payload: OutboxEventPayload;
  error: string | null;
  retryCount: number;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append event to outbox atomically within caller's transaction.
   *
   * CRITICAL: Must be called within a Prisma transaction:
   * ```
   * const result = await prisma.$transaction(async (tx) => {
   *   // Save business data
   *   const post = await tx.post.create({...});
   *   // Append event atomically in same transaction
   *   await outbox.appendEvent('post.created', post.id, {title: post.title}, tx);
   *   return post;
   * });
   * ```
   *
   * If transaction rolls back, the event is also rolled back (atomicity guarantee).
   */
  async appendEvent(
    eventType: OutboxEventType,
    aggregateId: string,
    payload: OutboxEventPayload,
    tx: TransactionClient,
  ): Promise<OutboxEventRow> {
    const event = await (tx as any).outboxEvent.create({
      data: {
        eventType,
        aggregateId,
        payload,
        retryCount: 0,
      },
    });

    this.logger.debug({
      msg: "outbox.event_appended",
      eventType,
      aggregateId,
      eventId: event.id,
    });

    return event as OutboxEventRow;
  }

  /**
   * Find unprocessed events ordered by creation time (FIFO).
   * Excludes events that have exceeded max retries.
   *
   * Used by: OutboxProcessor polling loop
   */
  async findUnprocessed(batchSize: number): Promise<OutboxEventRow[]> {
    const events = await (this.prisma as any).outboxEvent.findMany({
      where: {
        processedAt: null,
        retryCount: {
          lt: OUTBOX_CONFIG.MAX_RETRIES,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: batchSize,
    });

    return events as OutboxEventRow[];
  }

  /**
   * Mark event as successfully processed.
   * Set processedAt timestamp.
   */
  async markProcessed(eventId: string): Promise<OutboxEventRow> {
    const event = await (this.prisma as any).outboxEvent.update({
      where: { id: eventId },
      data: {
        processedAt: new Date(),
        error: null,
      },
    });

    this.logger.debug({
      msg: "outbox.event_processed",
      eventId,
      eventType: event.eventType,
    });

    return event as OutboxEventRow;
  }

  /**
   * Mark event as failed and increment retry counter.
   * Error message is truncated to 500 chars to prevent DB bloat.
   */
  async markFailed(eventId: string, error: string): Promise<OutboxEventRow> {
    const truncatedError = error.substring(0, 500);

    const event = await (this.prisma as any).outboxEvent.update({
      where: { id: eventId },
      data: {
        retryCount: { increment: 1 },
        error: truncatedError,
      },
    });

    this.logger.warn({
      msg: "outbox.event_failed",
      eventId,
      eventType: event.eventType,
      retryCount: event.retryCount,
      error: truncatedError,
    });

    return event as OutboxEventRow;
  }

  /**
   * Hard-delete processed events older than OUTBOX_RETENTION_DAYS.
   * Runs daily at 3 AM via cron (see OutboxProcessor).
   *
   * Rationale: Processed events have no audit value. The actual audit trail
   * lives in AuditLog. Keeping them wastes storage and slows the unprocessed query.
   */
  async cleanupOld(): Promise<number> {
    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() - OUTBOX_CONFIG.RETENTION_DAYS,
    );

    const result = await (this.prisma as any).outboxEvent.deleteMany({
      where: {
        processedAt: {
          lt: retentionDate,
        },
      },
    });

    this.logger.log({
      msg: "outbox.cleanup_completed",
      deletedCount: result.count,
      beforeDate: retentionDate.toISOString(),
    });

    return result.count;
  }

  /**
   * Get stats for monitoring dashboard.
   */
  async getStats() {
    const [
      unprocessedCount,
      processingCount,
      failedCount,
      totalCount,
    ] = await Promise.all([
      (this.prisma as any).outboxEvent.count({
        where: {
          processedAt: null,
          retryCount: { lt: OUTBOX_CONFIG.MAX_RETRIES },
        },
      }),
      (this.prisma as any).outboxEvent.count({
        where: {
          processedAt: null,
          retryCount: { gte: OUTBOX_CONFIG.MAX_RETRIES },
        },
      }),
      (this.prisma as any).outboxEvent.count({
        where: {
          error: { not: null },
        },
      }),
      (this.prisma as any).outboxEvent.count(),
    ]);

    return {
      unprocessed: unprocessedCount,
      processing: processingCount,
      failed: failedCount,
      total: totalCount,
    };
  }
}
