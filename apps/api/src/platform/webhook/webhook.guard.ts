/**
 * Webhook Signature Guard — route-level protection for webhook endpoints
 *
 * Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
 * - "signature verify guard" required for launch
 *
 * Constitution: design/02-platform-baseline/security-runtime/CRYPTO_POLICY.md
 * - "Signed webhook/token verification must go through canonical verification flow"
 *
 * Usage:
 *   @UseGuards(WebhookGuard)
 *   @SetMetadata('webhook_provider', 'stripe')
 *   @Post('webhook/stripe')
 *   async handleStripeWebhook(@Req() req: RawBodyRequest) { ... }
 *
 * Security:
 * - Always returns 200 OK regardless of verification outcome (neutral response)
 * - Logs verification failures for monitoring
 * - Rejects invalid/duplicate/replayed webhooks silently
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { WebhookService } from "./webhook.service.js";

/** Metadata key for setting the provider on a controller method */
export const WEBHOOK_PROVIDER_KEY = "webhook_provider";

@Injectable()
export class WebhookGuard implements CanActivate {
  private readonly logger = new Logger(WebhookGuard.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get provider from route metadata
    const provider = this.reflector.get<string>(
      WEBHOOK_PROVIDER_KEY,
      context.getHandler(),
    );

    if (!provider) {
      this.logger.error("WebhookGuard used without @SetMetadata('webhook_provider', ...)");
      return false;
    }

    // Extract raw body — requires raw body middleware on the route
    const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      this.logger.warn(`No raw body available for webhook ${provider}`);
      return false;
    }

    // Extract signature from provider-configured header
    // The service knows which header to check per provider
    const signatureHeader = this.extractSignature(request, provider);
    if (!signatureHeader) {
      this.logger.warn(`Missing signature header for webhook ${provider}`);
      return false;
    }

    // Extract event ID and type from body
    const body = request.body as Record<string, unknown> | undefined;
    const eventId = this.extractEventId(body);
    const eventType = this.extractEventType(body);
    const timestamp = this.extractTimestamp(request, body);

    if (!eventId) {
      this.logger.warn(`Missing event ID for webhook ${provider}`);
      return false;
    }

    // Full verification pipeline
    const result = await this.webhookService.verifyAndDedup({
      provider,
      rawBody,
      signatureHeader,
      eventId,
      eventType: eventType ?? "unknown",
      timestamp,
    });

    if (!result.valid) {
      this.logger.warn(
        `Webhook rejected: provider=${provider}, eventId=${eventId}, reason=${result.reason}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Extract signature value from request headers.
   * Different providers use different header names.
   */
  private extractSignature(request: Request, provider: string): string | undefined {
    // Common provider signature headers
    const headerMap: Record<string, string> = {
      stripe: "stripe-signature",
      payos: "x-payos-signature",
      cloudflare: "cf-webhook-auth",
      generic: "x-webhook-signature",
    };

    const headerName = headerMap[provider] ?? "x-webhook-signature";
    const value = request.headers[headerName];
    return typeof value === "string" ? value : undefined;
  }

  /** Extract provider-specific event ID from webhook body */
  private extractEventId(
    body: Record<string, unknown> | undefined,
  ): string | undefined {
    if (!body) return undefined;
    // Most providers use "id" or "event_id"
    const id = body.id ?? body.event_id ?? body.eventId;
    return typeof id === "string" ? id : undefined;
  }

  /** Extract provider-specific event type from webhook body */
  private extractEventType(
    body: Record<string, unknown> | undefined,
  ): string | undefined {
    if (!body) return undefined;
    const type = body.type ?? body.event_type ?? body.eventType;
    return typeof type === "string" ? type : undefined;
  }

  /** Extract timestamp from headers or body for replay window check */
  private extractTimestamp(
    request: Request,
    body: Record<string, unknown> | undefined,
  ): number | undefined {
    // Check header first (Stripe uses this pattern in stripe-signature)
    const tsHeader = request.headers["x-webhook-timestamp"];
    if (typeof tsHeader === "string") {
      const ts = parseInt(tsHeader, 10);
      if (!isNaN(ts)) return ts;
    }

    // Check body
    if (body) {
      const ts = body.timestamp ?? body.created;
      if (typeof ts === "number") return ts;
    }

    return undefined;
  }
}
