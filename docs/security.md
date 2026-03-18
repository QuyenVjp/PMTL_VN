# Security Guide

## Scope

This project protects both runtimes:
- `apps/web/src/proxy.ts`
- `apps/cms/src/proxy.ts`

Both proxies apply the baseline before requests reach route handlers or Payload internals. In this repo, `proxy.ts` is the request boundary file convention for Next.js 16.

## Current Protection Stack

### HTTP headers
- Security headers are applied at the proxy/request-boundary layer.
- Web applies them via `apps/web/src/lib/security/headers.ts`.
- CMS applies its own API headers in `apps/cms/src/proxy.ts`.
- Active headers include:
  - `Content-Security-Policy`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `X-Frame-Options: DENY` on web

### CORS
- API traffic under `/api/*` is checked against explicit allowlists.
- Allowed origins are built from:
  - `NEXT_PUBLIC_SITE_URL`
  - `PAYLOAD_PUBLIC_SERVER_URL`
  - `CMS_PUBLIC_URL`
  - `SECURITY_ALLOWED_ORIGINS`
  - `CORS_ALLOWED_ORIGINS`
- Requests outside the allowlist are rejected at the proxy layer.
- Preflight requests return only the methods and headers the app actually supports.

### CSRF
- Unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`) are blocked when the request is cross-site.
- Validation uses:
  - `Origin`
  - `Referer`
  - `Sec-Fetch-Site`
  - double-submit token checks for fetch/XHR flows
- Browser requests should send:
  - `X-CSRF-Token`
  - `X-Requested-With: fetch`
- The web CSRF cookie is reused until expiry and is issued as `SameSite=Strict`.
- Requests with no trusted `Origin`, no trusted `Referer`, and no trusted `Sec-Fetch-Site` must fail closed.

### Rate limiting
- Web and CMS use `rate-limiter-flexible`.
- Supported stores:
  - `memory` for local development or explicit single-instance mode
  - `redis` for production multi-instance deployments
- Environment contract:
  - `SECURITY_RATE_LIMIT_MAX`
  - `SECURITY_RATE_LIMIT_WINDOW_MS`
  - `SECURITY_RATE_LIMIT_AUTH_MAX`
  - `SECURITY_RATE_LIMIT_AUTH_WINDOW_MS`
  - `SECURITY_RATE_LIMIT_UPLOAD_MAX`
  - `SECURITY_RATE_LIMIT_UPLOAD_WINDOW_MS`
  - `REDIS_URL`
- Current route groups:
  - general API traffic
  - auth endpoints
  - upload endpoints
- Responses include rate-limit metadata and the active store (`memory` or `redis`).
- Production rule:
  - if Redis is expected and the limiter cannot talk to Redis, requests fail closed with `503`, not fail open.

- If the deployment runs more than one `web` or `cms` instance, `REDIS_URL` is mandatory.

### Auth cookies
- Auth cookie helpers are configured for:
  - `HttpOnly: true`
  - `SameSite: Lax`
  - `Secure: true` in production
  - `Path: /`
- This applies to the current session cookies and legacy compatibility cookies.

### XSS strategy
- Do not render raw user HTML.
- Keep UGC as plain text or trusted structured rich text.
- React escaping is the default defense for UI rendering.
- Any future `dangerouslySetInnerHTML` usage must be sanitized and reviewed explicitly.
- Search results and API responses must stay typed and mapped before hitting UI components.
- `next/image` remote allowlists must stay explicit; wildcard `http://**` or `https://**` hosts are not allowed in production config.

### Input validation
- New input contracts must be defined with Zod at the boundary.
- Parse before side effects.
- Reject invalid payloads early and log the failure with context.

### Structured logging
- Logging is standardized on `pino`.
- Every error boundary should log:
  - `message`
  - `error`
  - `timestamp`
  - request or domain context such as `path`, `userId`, `postId`, `documentId`, `requestId`
- Silent catches are not allowed.

### Secrets management
- Real secrets must not live in git.
- Required production secrets include:
  - `PAYLOAD_SECRET`
  - `PAYLOAD_API_TOKEN`
  - `REVALIDATE_SECRET`
  - `POSTGRES_PASSWORD`
  - `MEILI_MASTER_KEY`
  - `REDIS_URL`
  - `OPENAI_API_KEY`
  - `VAPID_PRIVATE_KEY`
  - SMTP credentials
- `infra/docker/.env.prod` must stay outside source control.

Hard rule:
- If a real secret file appears in git history or `git status`, rotate every secret inside it.

## Operational Checklist

Before each production deploy:
- Confirm `NEXT_PUBLIC_SITE_URL` and `SECURITY_ALLOWED_ORIGINS` match the canonical HTTPS domains.
- Confirm `REDIS_URL` is set when multiple app instances are deployed.
- Confirm `apps/web/next.config.ts` only allows explicit media origins.
- Verify login, logout, profile update, upload, and search routes with the proxy enabled.
- Watch logs for:
  - `CSRF validation failed`
  - `CORS origin not allowed`
  - `Too many requests`
  - `Rate limit service unavailable.`
  - Redis connection failures in rate-limit services

## Security Ownership Map
- Web proxy and web security helpers: `apps/web/src/lib/security/*`
- CMS proxy and CMS security helpers: `apps/cms/src/services/security-*.service.ts`
- Cookie policy: `apps/web/src/features/auth/utils/*`
- Logging: `apps/web/src/lib/logger/index.ts`, `apps/cms/src/services/logger.service.ts`
- Search indexing and semantic controls: `apps/cms/src/integrations/meilisearch/*`, `apps/cms/src/services/search.service.ts`
