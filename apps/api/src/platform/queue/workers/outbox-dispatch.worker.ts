/**
 * OutboxDispatchWorker — BullMQ Worker for Outbox Event Dispatch
 *
 * Receives dispatched outbox events from the outbox-dispatch queue.
 * Emits them via NestJS EventEmitter2 so domain modules can subscribe.
 *
 * Design: Event-driven architecture via @OnEvent decorators
 * Reference: design/02-platform-baseline/optional-scale/EVENT_SOURCING_ARCHITECTURE.md
 *
 * Usage (in domain modules):
 * ```
 * @OnEvent('charity.fraud_detected')
 * async handleCharityFraudDetected(payload: {userId, charityId, reason}) {
 *   // Handle event
 * }
 * ```
 */
import { Injectable, Logger } from "@nestjs/common";
import { Worker, Job } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import { QUEUES } from "../queue.constants.js";

interface OutboxDispatchJobData {
  eventId: string;
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class OutboxDispatchWorker {
  private readonly logger = new Logger(OutboxDispatchWorker.name);
  private worker: Worker | null = null;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {
    this.initWorker();
  }

  /**
   * Initialize BullMQ worker for outbox-dispatch queue.
   * Worker receives jobs and emits events via EventEmitter2.
   */
  private initWorker() {
    const valkeyUrl = this.config.get<string>("VALKEY_URL");

    // Resolve Redis connection
    let connection: ConnectionOptions = { host: "127.0.0.1", port: 6379, db: 1 };
    if (valkeyUrl) {
      const url = new URL(valkeyUrl);
      connection = {
        host: url.hostname,
        port: parseInt(url.port || "6379", 10),
        password: url.password || undefined,
        db: 1,
        tls: url.protocol === "rediss:" ? {} : undefined,
      };
    }

    // Create worker
    this.worker = new Worker(
      QUEUES.OUTBOX_DISPATCH,
      async (job: Job<OutboxDispatchJobData>) => {
        return this.processOutboxEvent(job);
      },
      {
        connection,
        concurrency: 5, // Process up to 5 events concurrently
      },
    );

    // Event handlers
    this.worker.on("completed", (job) => {
      this.logger.debug({
        msg: "outbox_dispatch.worker.job_completed",
        jobId: job.id,
        eventType: (job.data as OutboxDispatchJobData).eventType,
      });
    });

    this.worker.on("failed", (job, err) => {
      this.logger.error({
        msg: "outbox_dispatch.worker.job_failed",
        jobId: job?.id,
        error: err.message,
        stack: err.stack,
      });
    });

    this.logger.log({
      msg: "outbox_dispatch.worker_initialized",
      queue: QUEUES.OUTBOX_DISPATCH,
      concurrency: 5,
    });
  }

  /**
   * Process outbox event and emit via EventEmitter2.
   * Domain modules subscribe using @OnEvent(eventType) decorators.
   */
  private async processOutboxEvent(job: Job<OutboxDispatchJobData>) {
    const { eventId, eventType, aggregateId, payload } = job.data;

    this.logger.debug({
      msg: "outbox_dispatch.processing_event",
      jobId: job.id,
      eventId,
      eventType,
      aggregateId,
    });

    try {
      // Emit event via EventEmitter2
      // Handlers subscribed with @OnEvent(eventType) will receive this
      await this.eventEmitter.emitAsync(eventType, {
        eventId,
        eventType,
        aggregateId,
        ...payload,
      });

      this.logger.debug({
        msg: "outbox_dispatch.event_emitted",
        jobId: job.id,
        eventId,
        eventType,
      });

      return { status: "dispatched", eventId, eventType };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.error({
        msg: "outbox_dispatch.event_emission_failed",
        jobId: job.id,
        eventId,
        eventType,
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Rethrow to let BullMQ handle retry
      throw error;
    }
  }

  /**
   * Cleanup on module destroy.
   */
  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log({
        msg: "outbox_dispatch.worker_closed",
      });
    }
  }
}
