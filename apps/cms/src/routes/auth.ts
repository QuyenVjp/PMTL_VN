import { getPayload } from "payload";

import type { AuthError } from "@pmtl/shared";

import config from "@/payload.config";
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
      message: "He thong auth gap loi khong xac dinh.",
    } satisfies AuthError,
  });
}

export async function handleAuthRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const payload = await getPayload({
    config,
  });

  try {
    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await parseBody(request);
      const session = await registerUser(payload, body as never);

      return jsonResponse(201, {
        session,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await parseBody(request);
      const session = await loginUser(payload, body as never);

      return jsonResponse(200, {
        session,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      return jsonResponse(200, {
        success: true,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/forgot-password") {
      const body = await parseBody(request);
      const result = await requestPasswordReset(payload, body as never, {
        disableEmail: process.env.PAYLOAD_AUTH_DISABLE_EMAIL === "true",
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
      const session = await resetUserPassword(payload, body as never);

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
            message: "Ban chua dang nhap.",
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
        throw new UserAuthError("AUTH_UNAUTHENTICATED", "Ban chua dang nhap.", 401);
      }

      const body = await parseBody(request);
      const user = await updateOwnProfile(payload, session.user.id, body as never);

      return jsonResponse(200, {
        user,
      });
    }
  } catch (error) {
    return mapAuthError(error);
  }

  return null;
}
