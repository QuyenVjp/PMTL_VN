/**
 * Webhook Delivery Repository — deduplication persistence
 *
 * Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
 * - "provider/event-id dedup artifact" required for launch
 *
 * Responsibilities:
 * - Record processed webhook deliveries
 * - Check if a delivery has already been processed (dedup)
 * - Clean up expired dedup records (TTL-based)
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { DEDUP_TTL_DAYS } from "./webhook.schemas.js";

@Injectable()
export class WebhookDeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if this event has already been processed.
   * Returns true if a record exists (= duplicate).
   */
  async isDuplicate(provider: string, eventId: string): Promise<boolean> {
    const existing = await this.prisma.webhookDelivery.findUnique({
      where: { provider_eventId: { provider, eventId } },
      select: { id: true },
    });
    return existing !== null;
  }

  /**
   * Record a successfully processed webhook delivery.
   * Uses upsert to handle race conditions gracefully — if two identical
   * deliveries arrive simultaneously, the second one becomes a no-op update.
   */
  async recordDelivery(input: {
    provider: string;
    eventId: string;
    eventType: string;
    metadata?: Record<string, unknown>;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEDUP_TTL_DAYS);

    return this.prisma.webhookDelivery.upsert({
      where: {
        provider_eventId: { provider: input.provider, eventId: input.eventId },
      },
      create: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
        expiresAt,
      },
      update: {}, // Already exists — no-op
    });
  }

  /**
   * Clean up expired dedup records.
   * Should be called periodically (e.g., daily cron job).
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.webhookDelivery.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
