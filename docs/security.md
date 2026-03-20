# Security Guide

## Scope

This repo now treats `apps/api` as the `security authority (quyền lực bảo mật)`.

Request boundaries:

- `apps/web/src/proxy.ts`
- `apps/api` global HTTP pipeline
- `apps/admin` route/auth guards when admin UI exists

Canonical policy source:

- [design/SECURITY_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SECURITY_BASELINE.md)

## Security baseline

### Auth model

- Browser flows use secure `HttpOnly` cookies.
- Access token is short-lived.
- Refresh token rotation is mandatory.
- `logout` revokes current session.
- `logout-all` revokes all sessions.

### Validation

- Runtime validation uses `Zod`.
- Validation filters bad input, but does not replace:
  - authn/authz
  - CSRF protection
  - replay protection
  - upload hardening
  - query cost control

### Rate limiting

- App-layer rate limiting is mandatory for:
  - login
  - register
  - forgot password
  - upload
  - create post/comment
  - search
- Single-instance development may use in-memory counters.
- Shared counter storage such as `Valkey` is for multi-instance or stricter production coordination.

### Upload security

- File type allowlist is mandatory.
- Size limit is mandatory.
- Server-side MIME sniffing is mandatory.
- Delete authorization is mandatory.
- Public asset serving and private asset serving must be separated by policy.

### Headers and browser policy

- CSP must be explicit.
- `X-Content-Type-Options: nosniff` is required.
- `Referrer-Policy: strict-origin-when-cross-origin` is required.
- `Permissions-Policy` should default deny for unused capabilities.
- CORS must use explicit allowlists, not `*` for authenticated routes.

## Security ownership map

- Web boundary helpers: `apps/web/src/proxy.ts`, `apps/web/src/lib/*`
- API auth/session policy: `apps/api/src/modules/identity/*`, `apps/api/src/platform/sessions/*`
- API rate limit: `apps/api/src/platform/rate-limit/*`
- API audit: `apps/api/src/platform/audit/*`
- API storage/upload policy: `apps/api/src/platform/storage/*`
- API logging/error/validation baseline: `apps/api/src/common/*`

## Operational checklist

Before production deploy:

- confirm allowed origins match canonical HTTPS domains
- verify login/logout/profile/upload/search flows
- verify health endpoints and logs are readable
- verify audit events exist for auth and upload flows
- verify restore drill evidence is current

## Secrets management

- real secrets must not live in git
- production secret injection path must be documented
- rotate secrets if exposure is suspected
