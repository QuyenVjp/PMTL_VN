/**
 * Webhook Module — replay protection infrastructure
 *
 * Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
 * - Launch blocker: "webhook replay protection"
 * - Required: signature verify guard + dedup persistence + replay-window policy
 *
 * Provides:
 * - WebhookService: signature verification, dedup, replay window
 * - WebhookGuard: route-level guard for webhook endpoints
 * - WebhookDeliveryRepository: dedup persistence layer
 *
 * Usage in consuming modules:
 *   imports: [WebhookModule]
 *   // Then use @UseGuards(WebhookGuard) + @SetMetadata('webhook_provider', 'stripe')
 */
import { Module } from "@nestjs/common";
import { WebhookService } from "./webhook.service.js";
import { WebhookGuard } from "./webhook.guard.js";
import { WebhookDeliveryRepository } from "./webhook.repository.js";

@Module({
  providers: [WebhookService, WebhookGuard, WebhookDeliveryRepository],
  exports: [WebhookService, WebhookGuard],
})
export class WebhookModule {}
