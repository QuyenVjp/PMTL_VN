# WAF_ANTIBOT_STRATEGY — Web Application Firewall & Anti-Bot Controls

File này chốt chiến lược WAF, anti-bot, và abuse controls cho PMTL_VN.
Cloudflare là WAF layer chính — không cần self-host WAF ở Phase 1.

> **Rate limiting (app-layer)**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` — rate-limit section
> **Auth hardening**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
> **Infra**: `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`

---

## Defense layers

```
Internet
  → Cloudflare (WAF + DDoS + Bot Management + Rate Limiting)
  → Caddy (TLS termination + reverse proxy)
  → apps/api (app-layer rate limit + auth + CSRF)
```

### Edge trust-chain rule

- Cloudflare proxying là baseline cho public hostnames của PMTL.
- Turnstile token luôn phải được verify server-side; client widget một mình không đủ.
- Turnstile site key là public-safe; Turnstile secret key là server-only credential.

### Caddy forwarding rule

- `reverse_proxy` path của Caddy phải coi `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host` như forwarded chain do proxy tạo/quản lý.
- incoming forwarded headers từ untrusted hop không được tự động tin.
- `trusted_proxies` phải được cấu hình theo private ranges và edge providers có owner rõ trước khi PMTL dùng forwarded client IP cho auth/rate-limit/audit.
- khi PMTL đứng sau Cloudflare, ưu tiên `trusted_proxies_strict` để parse forwarded chain theo hướng giảm left-most spoofing risk.

Rule:

- không trust `X-Forwarded-*` chỉ vì header đó có tồn tại.
- app-layer IP resolution phải bám chain `Cloudflare -> Caddy -> apps/api`, không tự parse raw header theo cảm tính.
- access logging của Caddy nếu bật file output phải giữ rotation policy owner-reviewed; header nhạy cảm không được re-enable log thô chỉ để debug nhanh.

### Edge cache / purge rule

- Cloudflare cache purge là server/ops lane; không phát lệnh purge từ browser/client code.
- purge trigger phải bám owner event có chủ đích như publish/unpublish/index refresh, không purge-all theo thói quen sau mọi write nhỏ.

Rule:

- authenticated/dynamic API paths không được coi là cacheable chỉ vì edge có cache rules.
- purge ownership mặc định nằm ở `apps/api` hoặc ops lane có credential scoped rõ.

---

## Layer 1: Cloudflare (Phase 1)

### Free tier capabilities (available now)

| Feature | Config | Status |
|---|---|---|
| DDoS protection | Always-on (free) | ✅ Phase 1 |
| Bot Fight Mode | Enable in Security settings | ✅ Phase 1 |
| Managed WAF ruleset | OWASP Core ruleset | ✅ Phase 1 |
| Rate limiting (basic) | Custom rules, free tier limited | ✅ Phase 1 |
| IP blocking | Security → Tools → IP Access Rules | ✅ Phase 1 |
| Country blocking | Not needed (VN-only, but don't block non-VN) | ❌ Not applied |

### Cloudflare WAF rules (Phase 1 — exact policy)

Canonical IaC/doc plan: `infra/cloudflare/waf-rules.md`

**Rule 1: Block known bad bots**
```
Action: Block
Condition: cf.client.bot AND NOT cf.verified_bot_category in {"search_engine_crawler"}
```

**Rule 2: Protect admin from non-VN IPs (optional)**
```
Action: Challenge (CAPTCHA)
Condition: (http.host eq "admin.pmtl.vn") AND (ip.geoip.country ne "VN")
```

**Rule 3: Rate-limit auth endpoints at edge**
```
Action: Rate limit → Block for 60s
Threshold: 20 requests per minute
Condition: http.request.uri.path in {"/api/auth/login" "/api/auth/register" "/api/auth/forgot-password"}
```

**Rule 4: Block suspicious query patterns (SQLi/XSS)**
```
Action: Block
Condition: cf.waf.score lt 30  (OWASP score)
```

**Rule 5: Challenge high-volume scraping**
```
Action: Managed Challenge
Condition: http.request.uri.path matches "^/api/search" AND rate > 60/min from single IP
```

### Exact edge matrix

| Rule family | Path/surface | Action | Threshold | Window |
|---|---|---|---|---|
| verified crawler read budget | public content read | allow, then managed challenge if exceeded | `240` req | `1 phút` |
| verified crawler search budget | `/api/search` | managed challenge | `120` req | `1 phút` |
| anonymous public read budget | public content read | managed challenge | `180` req | `1 phút` |
| anonymous search budget | `/api/search` | managed challenge | `60` req | `1 phút` |
| unknown bot search budget | `/api/search` | block after challenge repeat | `30` req | `1 phút` |
| auth mutation budget | `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` | challenge / temporary block | `20` req | `1 phút` |
| oversized request guard | all non-upload API routes | block | `> 256 KB` body | immediate |

**Why body guard differs from upload**:
- WAF/body rule chỉ áp dụng cho non-upload API surfaces
- upload/media routes phải đi qua allowlist riêng, không dùng chung edge body block

### Firewall type / edge fingerprint note

- external scanners thường gắn nhãn `Cloudflare`, `reverse proxy`, hoặc `WAF` dựa trên:
  - `CF-Ray`
  - challenge/captcha behavior
  - response pattern khi rate-limit/challenge
- PMTL không cố “ẩn firewall type” như một security goal riêng; mục tiêu là edge protection đúng policy
- live proof đúng cho `Firewall Types` là:
  - response có `CF-Ray`
  - challenge behavior khớp rule
  - zone đang proxy đúng host public
- `Server` header hay heuristic vendor label từ tool ngoài không phải canonical source of truth; owner docs của PMTL vẫn là file này + `infra/cloudflare/waf-rules.md`

### Bot Management (Cloudflare Pro+)
- Phase 2+: Upgrade to Pro if bot traffic measurably impacts DB
- Feature: Cloudflare Bot Management scores every request 1–99
- Threshold: Score < 30 → Block; 30–60 → Challenge; > 60 → Allow

---

## Layer 2: Turnstile (anti-bot for forms — Phase 2)

**What it is**: Cloudflare Turnstile — invisible CAPTCHA alternative
**When to add**: If registration/guestbook spam becomes measurable problem

**Target forms**:
1. `/dang-ky` (registration) — guestbook spam source
2. `/cong-dong/so-luu-niem` (guestbook) — high public exposure, no auth required
3. `/auth/forgot-password` — enumeration attempt surface

**Implementation**:
```typescript
// Front-end: Load Turnstile widget
// <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
// Backend: Verify token
// POST https://challenges.cloudflare.com/turnstile/v0/siteverify
//   { secret: TURNSTILE_SECRET_KEY, response: token }
```

**Env vars (Phase 2)**:
| Env | Owner | Purpose |
|---|---|---|
| `TURNSTILE_SITE_KEY` | web | Public key for widget |
| `TURNSTILE_SECRET_KEY` | api | Server-side verification |

Rules:

- widget render success không được coi là verification pass.
- verification authority nằm ở `apps/api`.

---

## Layer 3: App-layer abuse controls (Phase 1 — in apps/api)

### Rate limiting (already designed)
See `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` + `design/04-execution-overlay/repo/CODING_READINESS.md` Phần 5 for exact limits.
Phase 1: Postgres `rate_limit_records` table.
Phase 2+: Valkey sliding window.

### IP-based blocking (manual process Phase 1)

```bash
# Block abusive IP at Cloudflare
# Dashboard: Security → Tools → IP Access Rules
# Action: Block
# IP: <abusive_ip>
# Zone: pmtl.vn

# Or via Cloudflare API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/access_rules/rules" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -d '{"mode":"block","configuration":{"target":"ip","value":"<ip>"},"notes":"Abuse"}'
```

### Account-level abuse signals

Track in `abuse_signals` table (Phase 2+) or log-based detection (Phase 1):

| Signal | Threshold | Action |
|---|---|---|
| Login failures | 10 in 15 min from same IP | Auto-block IP (rate-limit) |
| Register attempts | 5 in 1 hour from same IP | Auto-block IP |
| Upload MIME rejections | 3 in 1 hour from same account | Flag account, notify admin |
| Report submissions | 10 in 1 hour from same account | Throttle |

### Guestbook anti-spam (Phase 1)

No auth required for guestbook → highest abuse surface.
Defenses (in order of implementation cost):
1. **Rate limit**: 5 per IP per hour (already in coding-readiness.md)
2. **Content length limit**: min 10 chars, max 1000 chars
3. **Honeypot field**: Hidden HTML field — bots fill it, humans don't
4. **Turnstile** (Phase 2): When spam rate measurably increases

Honeypot implementation:
```html
<!-- In guestbook form — visually hidden via CSS, not display:none -->
<input type="text" name="website" tabindex="-1" autocomplete="off"
  style="position:absolute;left:-9999px" aria-hidden="true">
```
```typescript
// API: reject if honeypot field is filled
if (body.website) {
  // Log as spam attempt (not error), return 200 to not reveal detection
  logger.warn({ action: 'guestbook.honeypot.triggered', ip });
  return { success: true }; // Fake success
}
```

---

## Security headers (Caddy config)

All responses must include these headers. Set in `Caddyfile`:

```caddyfile
(security_headers) {
  header {
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    X-XSS-Protection "0"  # Deprecated, but some old browsers
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    # CSP set per-app (Next.js / API have different needs)
  }
}
```

**CSP for apps/web** (Next.js — set via `next.config.ts` headers):
```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'nonce-{NONCE}' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",  // Tailwind inline styles
    "img-src 'self' https: data:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.pmtl.vn",
    "frame-src 'self' https://challenges.cloudflare.com",  // Phase 2 only when Turnstile is enabled
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')
}
```

Rule:
- nếu Turnstile chưa bật, `frame-src https://challenges.cloudflare.com` không phải Phase 1 baseline bắt buộc
- khi Turnstile bật ở Phase 2+, CSP phải được nới đúng scope này và không nới rộng hơn

**CSP nonce strategy for Next.js**:
- Generate nonce per request in `middleware.ts`
- Pass via `headers()` to layout
- Apply to inline scripts via `nonce` attribute
- See: Next.js docs on CSP with nonces

---

## Monitoring abuse signals

| Metric | Alert |
|---|---|
| `pmtl_rate_limit_hits_total{endpoint="auth.login"}` > 100/min | Brute force alert |
| `pmtl_upload_rejected_total` > 20 in 10 min | Malicious upload attempt |
| `pmtl_honeypot_triggered_total` > 50/hour | Bot spam wave |
| Cloudflare → 5xx spike | Edge alert (Cloudflare Notifications) |

---

## Incident response for abuse

| Scenario | First action | Escalation |
|---|---|---|
| Credential stuffing | Block IP at Cloudflare + check auth logs | Reset affected accounts if success seen |
| Guestbook spam wave | Enable Turnstile (Phase 2) | Temporarily disable guestbook via feature flag |
| Upload abuse | Suspend account via admin | Check if storage quota exceeded |
| DDoS | Cloudflare auto-mitigates | Enable "Under Attack" mode in CF if needed |
| SQLi/XSS attempt | Cloudflare WAF blocks | Review if any payload got through + patch |

## Drift control

- mọi thay đổi edge rule phải được phản ánh ở:
  - file này
  - `infra/cloudflare/waf-rules.md`
  - `infra/cloudflare/change-runbook.md` nếu đổi procedure/rollout stance
  - nếu app fallback cũng đổi, cập nhật thêm `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- không chấp nhận dashboard-only drift không có doc/IaC plan kèm theo

---

## Code locations

| Artifact | Location |
|---|---|
| Rate limit guard | `apps/api/src/platform/rate-limit/rate-limit.guard.ts` |
| Honeypot middleware | `apps/api/src/platform/security/honeypot.middleware.ts` |
| CSP middleware/config | `apps/web/src/middleware.ts` (nonce generation) |
| Security headers config | `infra/caddy/Caddyfile` |
| Cloudflare WAF rules | `infra/cloudflare/waf-rules.md` (documentation of CF rules) |
| Turnstile service | `apps/api/src/platform/security/turnstile.service.ts` (Phase 2) |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Cloudflare proxying | Response has `CF-Ray` header |
| Bot Fight Mode active | Cloudflare dashboard shows Bot Fight Mode enabled |
| OWASP WAF active | Cloudflare dashboard shows Managed ruleset active |
| Security headers present | `curl -I https://pmtl.vn` shows X-Content-Type-Options, Referrer-Policy, etc. |
| Honeypot working | Submit guestbook with honeypot field → fake 200, audit log entry |
| Rate limit fires | 6th guestbook in 1 hour → 429 |
| CSP valid | Mozilla Observatory score ≥ B+ |
