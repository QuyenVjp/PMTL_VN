# SECRET_MANAGEMENT — Secret Handling & Rotation Runbook

File này chốt chính sách quản lý secret và quy trình xoay vòng (rotation) cho mọi loại secret trong PMTL_VN.
Secret management không phải "best practice" — là security requirement.

> **Security baseline**: `baseline/security.md` — section "Secret handling"
> **Env inventory**: `tracking/env-inventory.md`
> **Deploy**: `ops/deploy-runbook.md`

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
| Meilisearch master key | `MEILI_MASTER_KEY` | VPS env_file |
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
