/**
 * Webhook Service — signature verification + dedup + replay protection
 *
 * Constitution: design/02-platform-baseline/security-runtime/CRYPTO_POLICY.md
 * - "HMAC/signature verification for webhook/raw-body paths" (allowed pattern)
 * - "Secret comparison must be constant-time when security-critical"
 *
 * Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
 * - "signature verify guard + webhook_delivery_dedup persistence + replay-window policy"
 *
 * Security:
 * - HMAC-SHA256 signature verification with constant-time comparison
 * - Replay window enforcement (default 5 minutes)
 * - Event-ID deduplication via database
 * - Neutral error responses (never leak verification details)
 */
import { Injectable, Logger } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { WebhookDeliveryRepository } from "./webhook.repository.js";
import type { WebhookProvider, WebhookProviderConfig } from "./webhook.schemas.js";
import { REPLAY_WINDOW_SECONDS } from "./webhook.schemas.js";

export interface VerifyResult {
  valid: boolean;
  reason?: string; // Internal logging only — NEVER expose to caller
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly providerConfigs = new Map<string, WebhookProviderConfig>();

  constructor(private readonly deliveryRepo: WebhookDeliveryRepository) {}

  /**
   * Register a webhook provider configuration at bootstrap time.
   * Called from WebhookModule.forRoot() or individual module setup.
   */
  registerProvider(provider: WebhookProvider, config: WebhookProviderConfig): void {
    this.providerConfigs.set(provider, config);
    this.logger.log(`Webhook provider registered: ${provider}`);
  }

  /**
   * Verify webhook signature using HMAC.
   * Returns a neutral result — callers should return 200 OK regardless
   * to avoid leaking verification status to potential attackers.
   */
  verifySignature(
    provider: string,
    rawBody: Buffer,
    signatureHeader: string,
    timestamp?: number,
  ): VerifyResult {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      this.logger.warn(`Unknown webhook provider: ${provider}`);
      return { valid: false, reason: "unknown_provider" };
    }

    // Step 1: Replay window check (if timestamp provided)
    if (timestamp) {
      const tolerance = config.toleranceSeconds ?? REPLAY_WINDOW_SECONDS;
      const now = Math.floor(Date.now() / 1000);
      const age = Math.abs(now - timestamp);
      if (age > tolerance) {
        this.logger.warn(
          `Webhook replay detected for ${provider}: age=${age}s, tolerance=${tolerance}s`,
        );
        return { valid: false, reason: "replay_window_exceeded" };
      }
    }

    // Step 2: Compute expected HMAC signature
    const algorithm = config.algorithm === "sha512" ? "sha512" : "sha256";
    const hmac = createHmac(algorithm, config.secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    // Step 3: Constant-time comparison (prevents timing attacks)
    const sigBuffer = Buffer.from(signatureHeader, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    if (sigBuffer.length !== expectedBuffer.length) {
      this.logger.warn(`Webhook signature length mismatch for ${provider}`);
      return { valid: false, reason: "signature_mismatch" };
    }

    const isValid = timingSafeEqual(sigBuffer, expectedBuffer);
    if (!isValid) {
      this.logger.warn(`Webhook signature verification failed for ${provider}`);
      return { valid: false, reason: "signature_mismatch" };
    }

    return { valid: true };
  }

  /**
   * Check deduplication — returns true if this event was already processed.
   */
  async isDuplicate(provider: string, eventId: string): Promise<boolean> {
    return this.deliveryRepo.isDuplicate(provider, eventId);
  }

  /**
   * Record a processed webhook delivery for deduplication.
   */
  async recordDelivery(input: {
    provider: string;
    eventId: string;
    eventType: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.deliveryRepo.recordDelivery(input);
  }

  /**
   * Full verification pipeline: signature → replay window → dedup check.
   * Returns verification result with internal reason for logging.
   */
  async verifyAndDedup(params: {
    provider: string;
    rawBody: Buffer;
    signatureHeader: string;
    eventId: string;
    eventType: string;
    timestamp?: number;
  }): Promise<VerifyResult> {
    // Step 1: Signature verification
    const sigResult = this.verifySignature(
      params.provider,
      params.rawBody,
      params.signatureHeader,
      params.timestamp,
    );
    if (!sigResult.valid) {
      return sigResult;
    }

    // Step 2: Deduplication check
    const isDup = await this.isDuplicate(params.provider, params.eventId);
    if (isDup) {
      this.logger.log(
        `Duplicate webhook skipped: ${params.provider}/${params.eventId}`,
      );
      return { valid: false, reason: "duplicate" };
    }

    return { valid: true };
  }

  /**
   * Clean up expired dedup records. Call from a scheduled task.
   */
  async cleanupExpiredDeliveries(): Promise<number> {
    const count = await this.deliveryRepo.cleanupExpired();
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} expired webhook delivery records`);
    }
    return count;
  }
}
