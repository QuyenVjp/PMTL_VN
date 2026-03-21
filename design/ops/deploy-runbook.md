# DEPLOY_RUNBOOK (Quy trình triển khai)

File này chốt deploy procedure cho PMTL_VN trên single VPS.
Deploy runbook không thay backup/restore runbook — đọc cả hai.

> **Restore**: `ops/backup-restore.md`
> **Migration**: `baseline/migration-strategy.md`
> **Infra**: `baseline/infra.md`

---

## Baseline target

- Single VPS (Contabo/Hetzner)
- Docker Compose orchestration
- `apps/web`, `apps/api`, `apps/admin`, Postgres, Caddy
- Cloudflare trước Caddy (DNS + CDN + edge SSL)

---

## Docker Compose structure

```yaml
# docker-compose.prod.yml
services:
  api:
    build: ./apps/api
    env_file: .env.production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3

  web:
    build: ./apps/web
    env_file: .env.production
    depends_on:
      - api

  admin:
    build: ./apps/admin
    # Static SPA — served by Caddy directly or own nginx

  db:
    image: postgres:18
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pmtl"]
      interval: 10s
      timeout: 5s
      retries: 5

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

volumes:
  pgdata:
  caddy_data:
```

---

## Standard deploy flow

### Pre-deploy checks

```bash
# 1. Verify backup exists
./scripts/backup-db.sh
./scripts/verify-backup.sh
ls -la /backups/latest/

# 2. Review migration plan
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
  --to-migrations prisma/migrations --exit-code

# 3. Pull latest code
git pull origin main
git log --oneline -5  # verify commits
```

### Deploy steps

```bash
# 4. Build images
docker compose -f docker-compose.prod.yml build

# 5. Run DB migration (before switching traffic)
docker compose -f docker-compose.prod.yml run --rm api \
  npx prisma migrate deploy

# 6. Start API first, verify health
docker compose -f docker-compose.prod.yml up -d api
sleep 5
curl -f http://localhost:3001/health/live    || exit 1
curl -f http://localhost:3001/health/ready   || exit 1
curl -f http://localhost:3001/health/startup || exit 1

# 7. Start web and admin
docker compose -f docker-compose.prod.yml up -d web admin caddy

# 8. Run smoke checks
curl -f https://pmtl.vn/                     || echo "WARN: web down"
curl -f https://api.pmtl.vn/health/live      || echo "WARN: api down"
curl -f https://admin.pmtl.vn/               || echo "WARN: admin down"

# 9. Monitor logs (keep watching for 5 minutes)
docker compose -f docker-compose.prod.yml logs -f --tail 50
```

---

## Rollback flow

### App rollback (schema compatible)

```bash
# 1. Stop damage
docker compose -f docker-compose.prod.yml stop web admin

# 2. Roll back to previous image
git checkout <previous_commit>
docker compose -f docker-compose.prod.yml build api web admin
docker compose -f docker-compose.prod.yml up -d

# 3. Verify
curl -f https://api.pmtl.vn/health/live
```

### Full rollback (schema incompatible)

```bash
# 1. Stop all app services
docker compose -f docker-compose.prod.yml stop api web admin

# 2. Restore DB from backup
./scripts/restore-db.sh /backups/latest/pmtl_backup.sql.gz

# 3. Deploy previous version
git checkout <previous_commit>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 4. Verify
./scripts/smoke-test.sh
```

---

## Migration failure handling

| Scenario | Action |
|---|---|
| Migration fail trước commit | Giữ app cũ, fix migration, rerun |
| Migration đã đổi schema một phần | Đánh giá impact → rollback hoặc restore |
| Migration success nhưng app crash | Check compatibility → rollback app hoặc fix code |

**KHÔNG BAO GIỜ**: Sửa DB live thủ công mà không ghi log/runbook note.

---

## SSL / Caddy verification

```bash
# Verify Caddy config
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile

# Verify SSL certificate
curl -vI https://pmtl.vn 2>&1 | grep "SSL certificate"
openssl s_client -connect pmtl.vn:443 -servername pmtl.vn < /dev/null 2>/dev/null | openssl x509 -dates

# Verify Cloudflare → Caddy chain
curl -I https://pmtl.vn | grep -i "cf-ray"  # Cloudflare header present
```

---

## Post-deploy checklist

- [ ] `/health/live` returns 200
- [ ] `/health/ready` returns 200
- [ ] `/health/startup` returns 200
- [ ] Auth flow works (login → access → refresh → logout)
- [ ] Content read works (public post page loads)
- [ ] Upload works (test image upload → retrieve)
- [ ] Admin UI loads and auth works
- [ ] Logs readable by requestId (`docker compose logs | grep <requestId>`)
- [ ] No spike in 5xx (check Pino logs)
- [ ] SSL valid (Caddy + Cloudflare)
- [ ] Database migration status matches expected (`prisma migrate status`)

---

## Scheduled maintenance commands

```bash
# DB vacuum (weekly cron recommended)
docker compose exec db vacuumdb --analyze --verbose pmtl

# Check disk usage
df -h /var/lib/docker/volumes/
docker system df

# Prune old images
docker image prune -f --filter "until=168h"

# Check backup age
ls -lt /backups/ | head -5
```

---

## Rule

- Deploy success chỉ được gọi là thật khi smoke path đã pass
- Deploy runbook không thay backup/restore runbook
- Mọi deploy phải có backup trước
- Zero-downtime deploy không bắt buộc phase 1 — acceptable downtime < 5 phút
