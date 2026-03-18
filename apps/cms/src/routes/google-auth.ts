import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import {
  createSignedSessionForUser,
  findOrCreateGoogleUser,
  UserAuthError,
} from "@/collections/Users/service";
import { appendRouteAuditLog } from "@/services/audit.service";
import { getLogger, withError } from "@/services/logger.service";
import { getRequestMetadata } from "@/routes/request-metadata";
import { getCmsPayload, jsonResponse } from "@/routes/public";

const logger = getLogger("routes:google-auth");
const GOOGLE_OAUTH_STATE_COOKIE = "pmtl-google-oauth-state";
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

const googleCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
  error_description: z.string().min(1).optional(),
});

const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive().optional(),
  id_token: z.string().min(1).optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const googleProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean().optional().default(false),
  name: z.string().optional(),
  picture: z.url().optional(),
});

const oauthStateSchema = z.object({
  nonce: z.string().min(1),
  redirectTo: z.string().min(1),
  requestedAt: z.number().int().positive(),
});

type OAuthStatePayload = z.infer<typeof oauthStateSchema>;

function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new UserAuthError(
      "AUTH_GOOGLE_NOT_CONFIGURED",
      "Đăng nhập Google chưa được cấu hình trên CMS.",
      503,
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

function sanitizeRedirectPath(value: string | null | undefined): string {
  if (!value) {
    return "/";
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  return trimmed;
}

function getCmsPublicUrl(): string {
  return process.env.CMS_PUBLIC_URL ?? process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001";
}

function getSitePublicUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function getStateSecret(): string {
  return process.env.PAYLOAD_SECRET ?? "replace-me";
}

function getGoogleRedirectUri(): string {
  return new URL("/api/connect/google/callback", getCmsPublicUrl()).toString();
}

function signStatePayload(encodedPayload: string): string {
  return createHmac("sha256", getStateSecret()).update(encodedPayload).digest("base64url");
}

function createOAuthState(redirectTo: string) {
  const payload = oauthStateSchema.parse({
    nonce: randomBytes(24).toString("base64url"),
    redirectTo: sanitizeRedirectPath(redirectTo),
    requestedAt: Date.now(),
  });
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signStatePayload(encodedPayload);

  return {
    nonce: payload.nonce,
    state: `${encodedPayload}.${signature}`,
  };
}

function parseOAuthState(stateToken: string): OAuthStatePayload {
  const [encodedPayload, signature] = stateToken.split(".");
  if (!encodedPayload || !signature) {
    throw new UserAuthError("AUTH_GOOGLE_STATE_INVALID", "OAuth state khong hop le.", 400);
  }

  const expectedSignature = signStatePayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new UserAuthError("AUTH_GOOGLE_STATE_INVALID", "OAuth state khong hop le.", 400);
  }

  const payload = oauthStateSchema.parse(
    JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as unknown,
  );

  if (Date.now() - payload.requestedAt > GOOGLE_OAUTH_STATE_TTL_MS) {
    throw new UserAuthError("AUTH_GOOGLE_STATE_EXPIRED", "OAuth state đã hết hạn.", 400);
  }

  return {
    ...payload,
    redirectTo: sanitizeRedirectPath(payload.redirectTo),
  };
}

function buildGoogleAuthorizeUrl(state: string): string {
  const { clientId } = getGoogleClientConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  return url.toString();
}

async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret } = getGoogleClientConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    logger.warn({ status: response.status, payload }, "Google token exchange failed");
    throw new UserAuthError("AUTH_GOOGLE_EXCHANGE_FAILED", "Không đổi được token Google.", 401);
  }

  return googleTokenResponseSchema.parse(payload);
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    logger.warn({ status: response.status, payload }, "Google userinfo request failed");
    throw new UserAuthError("AUTH_GOOGLE_PROFILE_FAILED", "Không lấy được thông tin từ Google.", 401);
  }

  return googleProfileSchema.parse(payload);
}

function buildWebCallbackUrl(params: Record<string, string | null | undefined>) {
  const url = new URL("/auth/google/callback", getSitePublicUrl());

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function buildErrorRedirect(error: string, description: string, redirectTo?: string) {
  return buildWebCallbackUrl({
    error,
    error_description: description,
    redirect: sanitizeRedirectPath(redirectTo),
  });
}

export async function startGoogleAuth(request: Request): Promise<Response> {
  try {
    getGoogleClientConfig();
    const url = new URL(request.url);
    const redirectTo = sanitizeRedirectPath(url.searchParams.get("redirectTo"));
    const { nonce, state } = createOAuthState(redirectTo);
    const response = Response.redirect(buildGoogleAuthorizeUrl(state), 302);

    response.headers.append(
      "Set-Cookie",
      `${GOOGLE_OAUTH_STATE_COOKIE}=${nonce}; Max-Age=${Math.floor(GOOGLE_OAUTH_STATE_TTL_MS / 1000)}; Path=/api/connect/google; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return response;
  } catch (error) {
    logger.error(withError(undefined, error), "Failed to start Google auth");
    const authError =
      error instanceof UserAuthError
        ? error
        : new UserAuthError("AUTH_GOOGLE_NOT_CONFIGURED", "Đăng nhập Google chưa sẵn sàng.", 500);

    return jsonResponse(authError.statusCode, {
      error: {
        code: authError.code,
        message: authError.message,
      },
    });
  }
}

export async function finishGoogleAuth(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const siteFallbackRedirect = sanitizeRedirectPath(requestUrl.searchParams.get("redirectTo"));

  try {
    const query = googleCallbackQuerySchema.parse(
      Object.fromEntries(requestUrl.searchParams.entries()),
    );

    if (query.error) {
      return Response.redirect(
        buildErrorRedirect(query.error, query.error_description ?? "Đăng nhập Google thất bại.").toString(),
        302,
      );
    }

    if (!query.code || !query.state) {
      throw new UserAuthError("AUTH_GOOGLE_CALLBACK_INVALID", "Google callback bị thiếu dữ liệu.", 400);
    }

    const state = parseOAuthState(query.state);
    const cookieHeader = request.headers.get("cookie") ?? "";
    const nonceCookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${GOOGLE_OAUTH_STATE_COOKIE}=`))
      ?.split("=")[1];

    if (!nonceCookie || nonceCookie !== state.nonce) {
      throw new UserAuthError("AUTH_GOOGLE_STATE_INVALID", "OAuth state không hợp lệ.", 400);
    }

    const tokenPayload = await exchangeGoogleCode(query.code);
    const googleProfile = await fetchGoogleProfile(tokenPayload.access_token);
    const payload = await getCmsPayload();
    const user = await findOrCreateGoogleUser(payload, {
      sub: googleProfile.sub,
      email: googleProfile.email,
      emailVerified: googleProfile.email_verified,
      fullName: googleProfile.name ?? googleProfile.email,
    });
    const session = await createSignedSessionForUser(payload, user);

    await appendRouteAuditLog(payload, {
      action: "auth.google.login",
      actorType: "user",
      actorUser: Number(user.id),
      targetType: "users",
      targetPublicId: user.publicId ?? null,
      targetRef: {
        collection: "users",
        id: String(user.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        email: user.email,
        redirectTo: state.redirectTo,
      },
    });

    const redirectUrl = buildWebCallbackUrl({
      id_token: session.token,
      redirect: state.redirectTo,
    });
    const response = Response.redirect(redirectUrl.toString(), 302);

    response.headers.append(
      "Set-Cookie",
      `${GOOGLE_OAUTH_STATE_COOKIE}=; Max-Age=0; Path=/api/connect/google; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return response;
  } catch (error) {
    logger.error(withError(undefined, error), "Google auth callback failed");
    const authError =
      error instanceof UserAuthError
        ? error
        : new UserAuthError("AUTH_GOOGLE_CALLBACK_FAILED", "Đăng nhập Google thất bại.", 500);

    const response = Response.redirect(
      buildErrorRedirect(authError.code, authError.message, siteFallbackRedirect).toString(),
      302,
    );

    response.headers.append(
      "Set-Cookie",
      `${GOOGLE_OAUTH_STATE_COOKIE}=; Max-Age=0; Path=/api/connect/google; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return response;
  }
}
