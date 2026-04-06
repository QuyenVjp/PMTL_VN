/**
 * Queue name constants — single source of truth.
 * Design: design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md
 * BullMQ runs on Redis DB 1 (separate from cache DB 0).
 */
export const QUEUES = {
  PDPA_RETENTION: "pdpa-retention",
  MODERATION_PIPELINE: "moderation-pipeline",
  OUTBOX_DISPATCH: "outbox-dispatch",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
