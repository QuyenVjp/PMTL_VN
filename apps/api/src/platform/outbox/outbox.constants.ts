/**
 * Outbox Pattern Constants
 * Configuration for transactional event sourcing
 */

export const OUTBOX_CONFIG = {
  // Polling interval for background processor (ms)
  POLL_INTERVAL_MS: 5000,
  // Maximum number of events to process per poll
  BATCH_SIZE: 50,
  // Maximum retry attempts per event
  MAX_RETRIES: 3,
  // Days to retain processed events before hard-delete
  RETENTION_DAYS: 30,
} as const;

/**
 * Outbox event types
 * Used for routing and domain-specific handling
 */
export const OUTBOX_EVENTS = {
  // Dharma Compliance events
  CHARITY_FRAUD_DETECTED: "charity.fraud_detected",
  CHARITY_WHITELIST_UPDATED: "charity.whitelist_updated",
  CHARITY_CONTENT_VIOLATION_DETECTED: "charity.content_violation_detected",
  CHARITY_FRAUD_ESCALATION_ALERT: "charity.fraud_escalation_alert",

  // Life Liberation events
  PREDATORY_SPECIES_DETECTED: "life_liberation.predatory_species_detected",
  LIFE_RELEASE_COMPLETED: "life_liberation.release_completed",
  LIFE_RELEASE_MORTALITY_AUDIT: "life_liberation.mortality_audit",

  // Vows & Merit events
  VOW_CREATED: "vows_merit.vow_created",
  VOW_FULFILLED: "vows_merit.vow_fulfilled",
  MERIT_RECORDED: "vows_merit.merit_recorded",

  // Content events
  CONTENT_PUBLISHED: "content.published",
  CONTENT_ARCHIVED: "content.archived",

  // Community events
  POST_CREATED: "community.post_created",
  COMMENT_FLAGGED: "community.comment_flagged",
  MODERATION_ESCALATED: "community.moderation_escalated",

  // System events
  SYSTEM_AUDIT_LOG: "system.audit_log",
} as const;

export type OutboxEventType = (typeof OUTBOX_EVENTS)[keyof typeof OUTBOX_EVENTS];
