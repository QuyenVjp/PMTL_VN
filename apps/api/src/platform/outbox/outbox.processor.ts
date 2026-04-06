/**
 * OutboxProcessor — Background Event Dispatcher
 *
 * Polls unprocessed events every 5 seconds and dispatches them to BullMQ queue.
 * Includes mutex to prevent concurrent polls, retry logic, and cleanup cron.
 *
 * Design: Outbox Pattern polling processor
 * Reference: design/02-platform-baseline/optional-scale/EVENT_SOURCING_ARCHITECTURE.md
 */
import { Injectable, Logger } from "@nestjs/common";
import { Interval, Cron } from "@nestjs/schedule";
import { OutboxService } from "./outbox.service.js";
import { QueueService } from "../queue/queue.service.js";
import { OUTBOX_CONFIG } from "./outbox.constants.js";

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  /**
   * Mutex flag to prevent concurrent polls.
   * If a poll is already in progress, skip the next cycle.
   */
  private isProcessing = false;

  constructor(
    private readonly outboxService: OutboxService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Poll unprocessed events every OUTBOX_POLL_INTERVAL_MS (5 seconds).
   *
   * Flow:
   * 1. Check mutex — if already processing, skip
   * 2. Fetch unprocessed events (batch)
   * 3. For each event: enqueue to BullMQ
   * 4. On success: mark processed
   * 5. On failure: mark failed (increments retryCount)
   * 6. Reset mutex
   */
  @Interval(OUTBOX_CONFIG.POLL_INTERVAL_MS)
  async pollAndDispatch(): Promise<void> {
    // Prevent concurrent polls under load
    if (this.isProcessing) {
      this.logger.debug({
        msg: "outbox.poll_skipped_already_processing",
      });
      return;
    }

    this.isProcessing = true;

    try {
      const startMs = Date.now();

      // Fetch unprocessed events
      const events = await this.outboxService.findUnprocessed(
        OUTBOX_CONFIG.BATCH_SIZE,
      );

      if (events.length === 0) {
        this.logger.debug({
          msg: "outbox.poll_no_events",
          duration_ms: Date.now() - startMs,
        });
        return;
      }

      this.logger.debug({
        msg: "outbox.poll_fetched_events",
        count: events.length,
      });

      // Dispatch each event
      let successCount = 0;
      let failureCount = 0;

      for (const event of events) {
        try {
          // Enqueue to BullMQ outbox-dispatch queue
          await this.queueService.enqueueOutboxEvent(event);

          // Mark as processed
          await this.outboxService.markProcessed(event.id);
          successCount++;

          this.logger.debug({
            msg: "outbox.event_dispatched",
            eventId: event.id,
            eventType: event.eventType,
            aggregateId: event.aggregateId,
          });
        } catch (error) {
          failureCount++;

          // Mark as failed — increments retryCount
          const errorMsg = error instanceof Error ? error.message : String(error);
          await this.outboxService.markFailed(event.id, errorMsg);

          this.logger.error({
            msg: "outbox.dispatch_failed",
            eventId: event.id,
            eventType: event.eventType,
            error: errorMsg,
          });
        }
      }

      const duration = Date.now() - startMs;
      this.logger.log({
        msg: "outbox.poll_completed",
        totalEvents: events.length,
        successCount,
        failureCount,
        duration_ms: duration,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error({
        msg: "outbox.poll_failed",
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Daily cleanup cron: Remove processed events older than OUTBOX_RETENTION_DAYS.
   * Runs at 3 AM UTC (adjust timezone via environment if needed).
   *
   * Rationale: Processed events are transient infrastructure; the audit trail
   * lives in AuditLog. Hard-deleting old events saves storage and speeds queries.
   */
  @Cron("0 3 * * *", { name: "outbox-cleanup" })
  async cleanupOldEvents(): Promise<void> {
    try {
      const startMs = Date.now();
      const deletedCount = await this.outboxService.cleanupOld();

      this.logger.log({
        msg: "outbox.cleanup_cron_completed",
        deletedCount,
        duration_ms: Date.now() - startMs,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error({
        msg: "outbox.cleanup_cron_failed",
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  /**
   * Health check endpoint for monitoring.
   * Called by metrics/observability system.
   */
  async getHealth() {
    const stats = await this.outboxService.getStats();
    return {
      status: "healthy",
      ...stats,
    };
  }
}
