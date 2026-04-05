import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuditContext as AuditContextType } from "../../platform/audit/audit.service.js";

/**
 * Parameter decorator that builds an AuditContext from the incoming request.
 * Extracts IP address and user-agent so audit logs have full traceability.
 */
export const AuditContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditContextType => {
    const request = ctx.switchToHttp().getRequest<{
      ip?: string;
      headers?: Record<string, string | string[] | undefined>;
    }>();

    const ipAddress = request.ip;
    const userAgent = typeof request.headers?.["user-agent"] === "string"
      ? request.headers["user-agent"]
      : undefined;

    return { actorType: "user", ipAddress, userAgent };
  },
);
