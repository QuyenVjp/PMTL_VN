/**
 * CharityFirewall Interceptor — Global content scanning
 *
 * Intercepts POST/PUT/PATCH requests to scan for bank account patterns.
 * Skips routes decorated with @SkipCharityFirewall().
 *
 * Constitution: design/03-domains/dharma-compliance/DOMAIN_SPEC.md
 * "Bank Account Detection and Firewall" — content validation gate
 *
 * Position: Runs AFTER AuthGuard/RolesGuard (has userId from JWT)
 * Before: Controller business logic
 *
 * Registered via APP_INTERCEPTOR provider in app.module.ts
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import type { Request } from "express";
import { Logger } from "nestjs-pino";
import { CharityFirewallService } from "../services/charity-firewall.service.js";
import { SKIP_CHARITY_FIREWALL } from "../decorators/skip-charity-firewall.decorator.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const USER_GENERATED_CONTENT_ROUTES: Array<{
  methods: string[];
  pattern: RegExp;
  contentType: string;
}> = [
  { methods: ["POST", "PATCH"], pattern: /^\/(?:api\/)?community\/posts(?:\/[^/]+)?$/, contentType: "post" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?community\/posts\/[^/]+\/comments$/, contentType: "comment" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?community\/testimonials$/, contentType: "testimonial" },
  { methods: ["POST", "PATCH"], pattern: /^\/(?:api\/)?community\/guestbook(?:\/[^/]+)?$/, contentType: "guestbook" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?guestbook$/, contentType: "guestbook" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?wisdom-qa\/questions$/, contentType: "wisdom_question" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?wisdom-qa\/answers$/, contentType: "wisdom_answer" },
  { methods: ["POST"], pattern: /^\/(?:api\/)?contact$/, contentType: "contact_message" },
];

/**
 * Recursively extract all string values from an object
 */
function extractTextFieldsFromObject(obj: unknown, depth = 0): string[] {
  if (depth > 10) return []; // Prevent infinite recursion
  if (typeof obj === "string") return [obj];
  if (obj === null || obj === undefined) return [];

  const texts: string[] = [];

  if (Array.isArray(obj)) {
    for (const item of obj) {
      texts.push(...extractTextFieldsFromObject(item, depth + 1));
    }
  } else if (typeof obj === "object") {
    for (const [, value] of Object.entries(obj)) {
      texts.push(...extractTextFieldsFromObject(value, depth + 1));
    }
  }

  return texts;
}

@Injectable()
export class CharityFirewallInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly charityFirewall: CharityFirewallService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method.toUpperCase();

    // Only scan POST/PUT/PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(method)) {
      return next.handle();
    }

    // Check if route is marked to skip firewall
    const skipFirewall = this.reflector.getAllAndOverride<boolean>(SKIP_CHARITY_FIREWALL, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipFirewall) {
      return next.handle();
    }

    const path = request.path.toLowerCase();
    const route = USER_GENERATED_CONTENT_ROUTES.find(
      (candidate) => candidate.methods.includes(method) && candidate.pattern.test(path),
    );
    if (!route) {
      return next.handle();
    }

    // Extract text fields from request body
    const textFields = extractTextFieldsFromObject(request.body);

    // If no text content, allow through
    if (textFields.length === 0) {
      return next.handle();
    }

    // Combine all text fields for scanning
    const combinedText = textFields.join(" ");

    // Get userId from JWT (AuthGuard populates this)
    const userId = request.user?.id || "anonymous";

    const contentType = route.contentType;

    // Generate content ID from path (use path as unique identifier for this request)
    const contentId = `${method}:${request.path}`;

    // Build audit context from request
    const auditCtx: AuditContext = {
      actorId: userId,
      actorType: userId === "anonymous" ? "anonymous" : "user",
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    };

    // Perform firewall scan
    try {
      const scanResult = await this.charityFirewall.scanContent(
        userId,
        contentType,
        contentId,
        combinedText,
        auditCtx,
      );

      // If violation detected, reject request
      if (scanResult.hasViolation) {
        this.logger.warn(
          {
            msg: "charity_firewall.violation",
            userId,
            contentType,
            method,
            path: request.path,
            patternTypes: scanResult.detectedPatterns.map((p) => p.type),
            violationCount: scanResult.userViolationCount,
          },
          "Charity firewall violation detected",
        );

        // Fetch allowed accounts for the error response per AC3
        const whitelisted = await this.charityFirewall.getWhitelistedAccounts();
        const allowedAccounts = whitelisted.map((w) => ({
          charityName: w.charityName,
          bankAccount: w.bankAccount,
        }));

        throw new ForbiddenException({
          message:
            "Hành vi kêu gọi tịnh tài vào tài khoản cá nhân bị nghiêm cấm. " +
            "Trợ ấn Kinh sách chỉ được thực hiện qua tài khoản từ thiện chính thức " +
            "của đài Đông Phương (BSB 112 879 - Account 432 033 033 hoặc 432 919 934).",
          code: "charity.firewall.blocked",
          allowedAccounts,
        });
      }
    } catch (error) {
      // If error is ForbiddenException from firewall, re-throw
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Log unexpected errors but don't block requests
      this.logger.error(
        {
          msg: "charity_firewall.scan_error",
          userId,
          error: error instanceof Error ? error.message : String(error),
        },
        "Charity firewall scan error",
      );
      // Continue to next handler if scan fails
    }

    return next.handle();
  }
}
