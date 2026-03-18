# Troubleshooting

## Web `typecheck` Fails After Enabling Strict Mode

Symptoms:
- `pnpm --filter @pmtl/web typecheck` fails with optional or undefined errors.

What to check:
- Do not pass `undefined` into exact optional props.
- Guard array and record indexing under `noUncheckedIndexedAccess`.
- Use type-only imports when `verbatimModuleSyntax` complains.

Verification:
```bash
pnpm --filter @pmtl/web typecheck
```

## Build Fails With `CMS request crashed` or `fetch failed`

Symptoms:
- `pnpm --filter @pmtl/web build` logs `CMS request crashed`
- pages such as `/blog`, `/gallery`, `/kinh-dien` fail to fetch data

Likely causes:
- CMS is not running
- `PAYLOAD_PUBLIC_SERVER_URL` or `CMS_PUBLIC_URL` is wrong
- Meilisearch or Postgres is unavailable, causing upstream CMS failures

Checks:
```bash
docker compose --env-file infra/docker/.env.dev -f infra/docker/compose.dev.yml ps
curl http://localhost:3001/api/health
curl http://localhost:3000/api/health
```

## `403 CORS origin not allowed`

Symptoms:
- browser requests to `/api/*` fail immediately

Fix:
- confirm the browser origin matches `NEXT_PUBLIC_SITE_URL`
- add the origin to `SECURITY_ALLOWED_ORIGINS`
- redeploy the web app after changing env

Example:
```env
SECURITY_ALLOWED_ORIGINS=https://pmtl.vn,https://www.pmtl.vn
```

## `403 CSRF validation failed`

Symptoms:
- form submit or client mutation starts failing after hardening

Checks:
- request must come from the same site
- browser should send `Origin` or `Referer`
- JS requests should include `X-CSRF-Token`
- the `pmtl-csrf` cookie must exist

Fix:
- load a normal page first so the CSRF cookie is issued
- make sure client code uses the browser security header helper
- confirm reverse proxy or CDN is not stripping `Origin` / `Referer`

## `429 Too Many Requests`

Symptoms:
- auth, upload, or API requests work briefly then fail

Fix:
- slow down retries in the client
- avoid infinite polling loops
- inspect whether one page is firing duplicate requests

Useful headers:
- `retry-after`
- `x-ratelimit-limit`
- `x-ratelimit-remaining`
- `x-ratelimit-reset`

## Vitest Fails On Windows With Native Binding Errors

Symptoms:
- missing `rolldown` native binding

Fix used in this repo:
```bash
pnpm add -Dw @rolldown/binding-win32-x64-msvc
```

Then rerun:
```bash
pnpm test
```

## CMS `typecheck` Regenerates Types And Then Fails

Symptoms:
- `pnpm --filter @pmtl/cms typecheck` fails during `generate:types` or `generate:importmap`

Checks:
- `PAYLOAD_CONFIG_PATH=src/payload.config.ts` is valid
- CMS env vars are present
- collection field config is syntactically valid

Rerun:
```bash
pnpm --filter @pmtl/cms typecheck
```

## Auth Cookie Not Persisting

Symptoms:
- login succeeds but `/profile` redirects back to `/auth`

Checks:
- production must be HTTPS for `Secure` cookies
- origin mismatch can cause browser cookie rejection
- browser devtools should show `pmtl-session` and `auth_token`

Fix:
- verify `NEXT_PUBLIC_SITE_URL`
- verify TLS termination
- verify no subdomain mismatch between web and browser URL

## Google Login Fails Or Redirect URI Mismatch

Symptoms:
- Google shows `redirect_uri_mismatch`
- login returns to the site but session is not created

Checks:
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present on CMS
- `NEXT_PUBLIC_SITE_URL` is the web domain
- `CMS_PUBLIC_URL` / `PAYLOAD_PUBLIC_SERVER_URL` is the CMS domain
- the Google OAuth client is configured with the exact origins and callback URLs below

Google Console values used by this repo:
```text
Authorized JavaScript origins
http://localhost:3000
https://phapmontamlinh-quantheambotat.vn

Authorized redirect URIs
http://localhost:3001/api/connect/google/callback
https://cms.phapmontamlinh-quantheambotat.vn/api/connect/google/callback
```

Notes:
- the callback now completes on CMS and hands a Payload JWT back to web
- `redirect_uri` must match exactly, including scheme and subdomain

## Search Reindex Appears To Do Nothing

Symptoms:
- reindex command exits but search results do not change

Checks:
- worker is running if queue-backed sync is enabled
- Meilisearch health is green
- `MEILI_MASTER_KEY` and host are correct

Useful commands:
```bash
pnpm reindex:posts
curl http://localhost:7700/health
```
