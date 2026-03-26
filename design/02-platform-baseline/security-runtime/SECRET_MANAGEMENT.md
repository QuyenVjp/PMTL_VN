# SECRET_MANAGEMENT — Secret Handling & Rotation Runbook

File này chốt chính sách quản lý secret và quy trình xoay vòng (rotation) cho mọi loại secret trong PMTL_VN.
Secret management không phải "best practice" — là security requirement.

> **Security baseline**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` — section "Secret handling"
> **Env inventory**: `design/04-execution-overlay/repo/ENV_INVENTORY.md`
> **Deploy**: `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md`

---

## Nguyên tắc bất biến

1. Không commit bất kỳ secret nào vào repo (kể cả `.env.example` với giá trị thật)
2. Production secrets chỉ được inject qua Docker env_file hoặc secret management tool — không hardcode
3. Mọi secret phải có rotation procedure rõ trong file này
4. Khi nghi ngờ secret bị lộ → rotate ngay, không chờ điều tra xong
5. Dev/staging dùng secret riêng, không reuse production secret

---

## Secret inventory

### Tier 1 — Critical (rotation required immediately if compromised)

| Secret | Env var | Where stored | TTL/Rotation |
|---|---|---|---|
| JWT access signing key | `JWT_ACCESS_SECRET` | VPS env_file | Rotate quarterly or on compromise |
| JWT refresh signing key | `JWT_REFRESH_SECRET` | VPS env_file | Rotate quarterly or on compromise |
| CSRF signing key | `CSRF_SECRET` | VPS env_file | Rotate quarterly or on compromise |
| DB password | `DATABASE_URL` (password part) | VPS env_file | Rotate on personnel change |
| SMTP credentials | `SMTP_PASS` | VPS env_file | Rotate on provider change or compromise |
| R2 access key | `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` | VPS env_file | Rotate annually or on compromise |
| Cloudflare API token | `CLOUDFLARE_API_TOKEN` | VPS env_file | Rotate on personnel change |
| Email hash salt | `EMAIL_HASH_SALT` | VPS env_file | **Never rotate** (breaks audit log lookups) |

### Tier 2 — Important (rotate on personnel change)

| Secret | Env var | Where stored |
|---|---|---|
| VAPID private key | `VAPID_PRIVATE_KEY` | VPS env_file |
| Revalidate webhook secret | `REVALIDATE_SECRET` | VPS env_file (api + web) |
| Meilisearch master key | `MEILISEARCH_MASTER_KEY` | VPS env_file |
| Valkey auth password | `VALKEY_URL` (password part) | VPS env_file |

### Tier 3 — Low sensitivity (rotate annually)

| Secret | Env var |
|---|---|
| `BULLMQ_PREFIX` | Not a secret per se, but namespace isolation |

---

## Secret storage — Production

**Phase 1: VPS env_file**

```bash
# Location on VPS (not in git repo)
/etc/pmtl/secrets/.env.production

# Permissions: owner-readable only
chmod 600 /etc/pmtl/secrets/.env.production
chown deploy_user:deploy_user /etc/pmtl/secrets/.env.production
```

Docker Compose references:
```yaml
services:
  api:
    env_file: /etc/pmtl/secrets/.env.production
```

**Phase 2+: Consider HashiCorp Vault or Infisical**
- Trigger: team size > 3 people, or audit requirement for secret access logs
- Code change needed: replace env_file with Vault agent sidecar or Infisical SDK

## Supabase-style secret partitioning, PMTL-safe

Bài học nên lấy từ Supabase là `phân lớp credential`, không phải đẩy authority ra khỏi `apps/api`.

Rules:

- không collapse `public credential`, `member/session transport`, `internal shared-secret`, và `admin/service credential` thành cùng một lớp secret
- `apps/web` chỉ được biết public-safe config hoặc signed artifact ngắn hạn; không được giữ bất kỳ privileged key nào
- `apps/api` là authority duy nhất để dùng admin/service credential, tạo signed upload URL, ký callback, hoặc gọi privileged provider operation
- `packages/shared` không được chứa bất kỳ secret, privileged key, hoặc env accessor nào
- nếu sau này dùng thêm managed service như Supabase cho một phần hạ tầng, vẫn phải đi qua PMTL contract của `apps/api`, không cho client dùng privileged key trực tiếp

### Credential classes

| Class | Examples | Allowed location | Never allowed |
|---|---|---|---|
| public-safe | public base URL, public feature flags | `apps/web`, public env, docs | signing key, admin key, DB password |
| browser/session transport | session cookie, CSRF token | browser + `apps/api` transport boundary | logs, agent prompts, public env |
| internal shared-secret | webhook shared secret, revalidate secret | `apps/api`, `apps/web` server env, internal callbacks | client bundle, design examples with live values |
| admin/service credential | DB password, SMTP credential, R2 key, Cloudflare token | `apps/api`, infra secret store, ops-only paths | `apps/web`, `packages/shared`, public docs |

### Rotation posture by class

- public-safe config: đổi được không impact auth boundary, nhưng vẫn phải qua deploy pipeline
- browser/session transport secret: rotate có thể làm invalid active session/token; phải có user-impact note
- internal shared-secret: rotate với overlap window ngắn nếu callback hai đầu cần đổi đồng thời
- admin/service credential: phải có `generate -> stage test -> cutover -> revoke old` rõ ràng

### Agent workflow rule

- agent prompt không được chứa live secret, raw token, private key, hoặc `.env` thật
- nếu task chạm vào secret doc hoặc env inventory, output mặc định là placeholder + path + procedure, không phải value
- MCP/tool access với môi trường thật phải mặc định `dev/test`, `read-only` nếu có thể; không nối production bằng shortcut

---

## Rotation procedures

### Rotate JWT secrets (ACCESS + REFRESH)

⚠️ **Impact**: All existing sessions are invalidated when JWT secrets rotate.
Plan for a maintenance window or implement grace period (old key still valid for 15 min).

```bash
# Step 1 — Generate new secrets
NEW_ACCESS=$(openssl rand -base64 64)
NEW_REFRESH=$(openssl rand -base64 64)

# Step 2 — Update env file on VPS
sudo nano /etc/pmtl/secrets/.env.production
# Update JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

# Step 3 — Restart API service
docker compose -f docker-compose.prod.yml restart api

# Step 4 — Verify
curl -f https://api.pmtl.vn/health/ready
# Expected: sessions table still intact, tokens with old secret now rejected

# Step 5 — Notify users (if needed)
# Users will be logged out — add banner if user-facing impact is significant

# Step 6 — Update documentation
# Note rotation date in this file (see Rotation log below)
```

### Rotate refresh secret only

**Phase 1 baseline**:
- refresh secret rotation là `invalidate-all-sessions event`, không dùng dual-key grace phức tạp làm baseline
- nếu rotate riêng `JWT_REFRESH_SECRET`, mọi refresh token hiện tại phải bị coi là invalid sau deploy mới
- access token đang sống có thể hết hạn tự nhiên theo TTL `15 phút`, nhưng flow refresh bằng secret cũ không được chấp nhận nữa

```bash
# Step 1 — Generate new refresh secret
NEW_REFRESH=$(openssl rand -base64 64)

# Step 2 — Update JWT_REFRESH_SECRET in env file
sudo nano /etc/pmtl/secrets/.env.production

# Step 3 — Restart API
docker compose -f docker-compose.prod.yml restart api

# Step 4 — Revoke server-side session/refresh records if schema stores them separately
# Expected: existing browser sessions are forced to login again when access token expires

# Step 5 — Verify
curl -f https://api.pmtl.vn/health/ready
```

### Rotate DB password

```bash
# Step 1 — Generate new password
NEW_DB_PASS=$(openssl rand -base64 32)

# Step 2 — Update Postgres
docker compose exec db psql -U postgres -c \
  "ALTER USER pmtl PASSWORD '${NEW_DB_PASS}';"

# Step 3 — Update env file
sudo nano /etc/pmtl/secrets/.env.production
# Update DATABASE_URL with new password

# Step 4 — Restart API
docker compose -f docker-compose.prod.yml restart api

# Step 5 — Verify health
curl -f https://api.pmtl.vn/health/ready
```

### Rotate CSRF secret

```bash
NEW_CSRF=$(openssl rand -base64 64)
# Update CSRF_SECRET in env file
# Restart API
# Impact: Active browser sessions get new CSRF token on next request (transparent to users)
```

### Rotate SMTP credentials

```bash
# Step 1 — Generate new SMTP key in Brevo dashboard
# Step 2 — Update SMTP_PASS in env file
# Step 3 — Restart API
# Step 4 — Test: trigger a password reset email
```

### Rotate webhook / revalidate secrets

**Applies to**: `REVALIDATE_SECRET`, webhook shared secrets tương đương

```bash
# Step 1 — Generate new secret
NEW_WEBHOOK=$(openssl rand -hex 32)

# Step 2 — Update secret in all participating services
sudo nano /etc/pmtl/secrets/.env.production

# Step 3 — Restart services receiving or emitting webhook callbacks
docker compose -f docker-compose.prod.yml restart api web

# Step 4 — Verify one signed callback against staging or safe internal route
# Expected: old secret rejected, new secret accepted
```

### Rotate VAPID keys (Web Push)

⚠️ **Impact**: All existing push subscriptions are invalidated. Users must re-subscribe.

```bash
# Step 1 — Generate new VAPID keys
npx web-push generate-vapid-keys

# Step 2 — Update VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in env file
# Also update NEXT_PUBLIC_VAPID_PUBLIC_KEY in web env

# Step 3 — Restart API + web

# Step 4 — Notify users: push notifications require re-subscription
# Feature flag: temporarily disable push while rotating

# Step 5 — Clear push_subscriptions table
# (all subscriptions are now invalid with old VAPID key)
docker compose exec db psql -U pmtl -c "TRUNCATE push_subscriptions;"
```

### Rotate R2 API credentials

```bash
# Step 1 — Create new R2 API token in Cloudflare dashboard
# Step 2 — Test new token manually:
aws s3 ls s3://pmtl-media \
  --endpoint-url https://<accountid>.r2.cloudflarestorage.com \
  --access-key <NEW_KEY_ID> \
  --secret-key <NEW_SECRET>

# Step 3 — Update S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY in env file
# Step 4 — Restart API
# Step 5 — Revoke old token in Cloudflare dashboard
```

---

## Compromise response procedure

When a secret is confirmed or suspected compromised:

```
1. Rotate the secret immediately (procedures above)
2. Invalidate all sessions if JWT secret was involved
3. Append audit log: actor=system, action=security.secret.rotated, metadata={secret_type, reason}
4. Review access logs for unauthorized use in the past 24h
5. If data was accessed: follow incident runbook
6. Document in rotation log below
```

---

## Secret generation standards

| Type | Command | Min entropy |
|---|---|---|
| JWT secrets | `openssl rand -base64 64` | 512 bits |
| CSRF secret | `openssl rand -base64 64` | 512 bits |
| DB password | `openssl rand -base64 32` | 256 bits |
| Webhook secrets | `openssl rand -hex 32` | 256 bits |
| Email hash salt | `openssl rand -base64 32` | 256 bits (set once, never rotate) |

---

## .gitignore enforcement

Add to repo `.gitignore` and enforce via pre-commit hook:
```gitignore
.env
.env.*
!.env.example
*.pem
*.key
secrets/
/infra/secrets/
```

**Pre-commit check** (`.husky/pre-commit`):
```bash
# Fail if any .env file with values is staged
git diff --cached --name-only | grep -E '\.env(\.|$)' | while read f; do
  if grep -qE '^[A-Z_]+=.+' "$f"; then
    echo "ERROR: Possible secret in $f — check before committing"
    exit 1
  fi
done
```

## Pre-launch secret scan

Trước production launch đầu tiên hoặc trước khi mở repo cho cộng tác ngoài team:

```bash
git log --all --full-history -p | grep -E \
  'JWT_|SMTP_PASS|SECRET|PASSWORD|API_TOKEN|PRIVATE_KEY|HASH_SALT' \
  | grep -v '.env.example'
```

Expected:

- không có real secret value trong history
- chỉ thấy placeholder hoặc doc text an toàn

Nếu có hit đáng ngờ:

1. rotate secret liên quan ngay
2. purge history trước khi tiếp tục chia sẻ repo
3. append audit note / rotation log
4. không coi pre-commit hook hiện tại là đủ để miễn historical scan

---

## Rotation log

Track rotations here. Add row after each rotation:

| Date | Secret type | Reason | Rotated by |
|---|---|---|---|
| (first rotation) | All initial secrets | Initial setup | ops |

---

## Code locations

| Artifact | Location |
|---|---|
| Config validation schema | `apps/api/src/platform/config/config.schema.ts` |
| Secret env validation | Zod schema in config module — validates at boot |
| Pre-commit hook | `.husky/pre-commit` |
| Env example | `apps/api/.env.example` (no real values) |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| No secrets in git history | `git log -p | grep -E 'JWT_|SMTP_PASS|SECRET'` returns nothing sensitive |
| Env validation at boot | Wrong/missing secret → app refuses to start with clear error |
| JWT rotation tested | Rotate secret → all sessions invalidated → users re-login |
| SMTP rotation tested | New key → password reset email received |
| Pre-commit hook blocks | Stage `.env` with values → commit fails |
