import { getPayload } from "payload";

import type { AuthError } from "@pmtl/shared";

import config from "@/payload.config";
import { appendRouteAuditLog } from "@/services/audit.service";
import {
  UserAuthError,
  buildResetPasswordURL,
  getCurrentSession,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
  updateOwnProfile,
} from "@/collections/Users/service";
import { consumeGuard } from "@/services/request-guard.service";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
  });
}

async function parseBody(request: Request): Promise<unknown> {
  if (request.method === "GET") {
    return null;
  }

  return request.json();
}

function mapAuthError(error: unknown): Response {
  if (error instanceof UserAuthError) {
    const authError: AuthError = {
      code: error.code as AuthError["code"],
      message: error.message,
    };

    return jsonResponse(error.statusCode, {
      error: authError,
    });
  }

  return jsonResponse(500, {
    error: {
      code: "AUTH_UNKNOWN",
      message: "Hệ thống auth gặp lỗi không xác định.",
    } satisfies AuthError,
  });
}

export async function handleAuthRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const payload = await getPayload({
    config,
  });
  const requestMetadata = getRequestMetadata(request.headers);
  const requestIpHash = getRequestIpHash(request.headers) || "anonymous";

  try {
    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await parseBody(request);
      const registerEmail =
        body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string"
          ? (body as { email: string }).email.toLowerCase()
          : requestIpHash;

      const registerGuard = await consumeGuard({
        payload,
        guardKey: `auth:register:${registerEmail}`,
        scope: "auth",
        ttlSeconds: 60 * 10,
        maxHits: 5,
        notes: "auth-register",
      });

      if (!registerGuard.allowed) {
        throw new UserAuthError("AUTH_RATE_LIMITED", "Ban thao tac qua nhanh. Vui long thu lai sau.", 429);
      }

      const session = await registerUser(payload, body as never);

      await appendRouteAuditLog(payload, {
        action: "auth.register",
        actorType: "anonymous",
        actorUser: Number(session.user.id),
        targetType: "users",
        ...requestMetadata,
        metadata: {
          email: session.user.email,
          role: session.user.role,
        },
      });

      return jsonResponse(201, {
        session,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await parseBody(request);
      const loginEmail =
        body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string"
          ? (body as { email: string }).email.toLowerCase()
          : requestIpHash;

      const loginGuard = await consumeGuard({
        payload,
        guardKey: `auth:login:${loginEmail}`,
        scope: "auth",
        ttlSeconds: 60 * 10,
        maxHits: 10,
        notes: "auth-login",
      });

      if (!loginGuard.allowed) {
        throw new UserAuthError("AUTH_RATE_LIMITED", "Ban dang dang nhap qua nhanh. Vui long doi it phut.", 429);
      }

      const session = await loginUser(payload, body as never);

      await appendRouteAuditLog(payload, {
        action: "auth.login",
        actorType: "user",
        actorUser: Number(session.user.id),
        targetType: "users",
        ...requestMetadata,
        metadata: {
          email: session.user.email,
        },
      });

      return jsonResponse(200, {
        session,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const session = await getCurrentSession(payload, request.headers);

      if (session) {
        await appendRouteAuditLog(payload, {
          action: "auth.logout",
          actorType: "user",
          actorUser: Number(session.user.id),
          targetType: "users",
          ...requestMetadata,
          metadata: {
            email: session.user.email,
          },
        });
      }

      return jsonResponse(200, {
        success: true,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/forgot-password") {
      const body = await parseBody(request);
      const forgotEmail =
        body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string"
          ? (body as { email: string }).email.toLowerCase()
          : requestIpHash;

      const forgotGuard = await consumeGuard({
        payload,
        guardKey: `auth:forgot-password:${forgotEmail}`,
        scope: "auth",
        ttlSeconds: 60 * 15,
        maxHits: 5,
        notes: "auth-forgot-password",
      });

      if (!forgotGuard.allowed) {
        throw new UserAuthError("AUTH_RATE_LIMITED", "Ban yeu cau qua nhieu lan dat lai mat khau. Vui long thu lai sau.", 429);
      }

      const result = await requestPasswordReset(payload, body as never, {
        disableEmail: process.env.PAYLOAD_AUTH_DISABLE_EMAIL === "true",
      });

      await appendRouteAuditLog(payload, {
        action: "auth.forgot-password",
        actorType: "anonymous",
        targetType: "users",
        ...requestMetadata,
        metadata: {
          email: forgotEmail,
          hasResetToken: Boolean(result.resetToken),
        },
      });

      return jsonResponse(200, {
        ...result,
        ...(result.resetToken
          ? {
              resetUrl: buildResetPasswordURL(result.resetToken),
            }
          : {}),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/reset-password") {
      const body = await parseBody(request);
      const resetGuard = await consumeGuard({
        payload,
        guardKey: `auth:reset-password:${requestIpHash}`,
        scope: "auth",
        ttlSeconds: 60 * 10,
        maxHits: 5,
        notes: "auth-reset-password",
      });

      if (!resetGuard.allowed) {
        throw new UserAuthError("AUTH_RATE_LIMITED", "Ban dat lai mat khau qua nhanh. Vui long thu lai sau.", 429);
      }

      const session = await resetUserPassword(payload, body as never);

      await appendRouteAuditLog(payload, {
        action: "auth.reset-password",
        actorType: "user",
        actorUser: Number(session.user.id),
        targetType: "users",
        ...requestMetadata,
        metadata: {
          email: session.user.email,
        },
      });

      return jsonResponse(200, {
        session,
      });
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      const session = await getCurrentSession(payload, request.headers);

      if (!session) {
        return jsonResponse(401, {
          error: {
            code: "AUTH_UNAUTHENTICATED",
            message: "Bạn chưa đăng nhập.",
          } satisfies AuthError,
        });
      }

      return jsonResponse(200, {
        session,
      });
    }

    if (request.method === "PATCH" && url.pathname === "/api/auth/profile") {
      const session = await getCurrentSession(payload, request.headers);

      if (!session) {
        throw new UserAuthError("AUTH_UNAUTHENTICATED", "Bạn chưa đăng nhập.", 401);
      }

      const body = await parseBody(request);
      const user = await updateOwnProfile(payload, session.user.id, body as never);

      await appendRouteAuditLog(payload, {
        action: "auth.profile.update",
        actorType: "user",
        actorUser: Number(session.user.id),
        targetType: "users",
        ...requestMetadata,
        metadata: {
          email: session.user.email,
        },
      });

      return jsonResponse(200, {
        user,
      });
    }
  } catch (error) {
    return mapAuthError(error);
  }

  return null;
}
