import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuditContext as AuditContextType } from "../../platform/audit/audit.service.js";
import type { AuthenticatedUser } from "../auth/auth-request.types.js";
import type { UserRole } from "../../generated/prisma/client.js";

const REQUEST_ID_HEADER = "x-request-id";

function resolveActorType(role: UserRole | undefined): AuditContextType["actorType"] {
  if (!role) return "anonymous";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "admin";
  return "user";
}

/**
 * Parameter decorator that builds an AuditContext from the incoming request.
 *
 * Actor identity:
 * - Prefer authenticated `user.publicId` (external identity) as actorId.
 * - actorType reflects admin / member(user) / anonymous / system contracts.
 * - Never put internal cuid into actorId from this decorator.
 *
 * Raw IP is kept only in memory for hashing at append time — never persisted.
 * Correlation ID is taken from the request-id middleware header.
 */
export const AuditContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditContextType => {
    const request = ctx.switchToHttp().getRequest<{
      ip?: string;
      headers?: Record<string, string | string[] | undefined>;
      user?: AuthenticatedUser;
    }>();

    const user = request.user;
    const ipAddress = request.ip;
    const userAgent =
      typeof request.headers?.["user-agent"] === "string"
        ? request.headers["user-agent"]
        : undefined;
    const correlationHeader = request.headers?.[REQUEST_ID_HEADER];
    const correlationId =
      typeof correlationHeader === "string" && correlationHeader.length > 0
        ? correlationHeader
        : undefined;

    const actorId = user?.publicId;
    const actorType = resolveActorType(user?.role);

    return {
      actorType,
      ...(actorId ? { actorId } : {}),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
      ...(correlationId ? { correlationId } : {}),
    };
  },
);
