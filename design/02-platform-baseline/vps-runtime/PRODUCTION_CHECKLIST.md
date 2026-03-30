# Production Checklist — VPS Self-Host

Checklist này bắt buộc hoàn thành trước khi go-live. Chia thành 6 nhóm.
Owner: `design/02-platform-baseline/vps-runtime/`

---

## 1. Infrastructure & OS

- [ ] VPS đã chọn provider (BizFly Cloud / Vultr SG / Hetzner)
- [ ] Ubuntu 22.04 LTS installed, fully updated (`apt upgrade -y`)
- [ ] Non-root user `pmtl` với sudo, SSH key only (password auth disabled)
- [ ] UFW enabled: chỉ mở port 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Fail2ban installed & configured (maxretry=5, bantime=1h)
- [ ] `unattended-upgrades` enabled cho security patches
- [ ] Hostname set: `pmtl-vps`
- [ ] Timezone set: `Asia/Ho_Chi_Minh`

## 2. Docker & Compose

- [ ] Docker CE installed (không dùng snap package)
- [ ] Docker Compose v2 (plugin, không standalone)
- [ ] User `pmtl` added to `docker` group
- [ ] `compose.prod.yml` reviewed: image tags không là `latest`
- [ ] Tất cả services có `restart: unless-stopped`
- [ ] Tất cả services có `healthcheck` configured
- [ ] Runtime images dùng multi-stage + non-root (web/api/admin)
- [ ] Runtime image tối ưu production (`distroless` hoặc tương đương) cho web/api
- [ ] Memory limits set (web: 1024m, postgres: 512m, meilisearch: 512m)
- [ ] Named volumes defined (không bind-mount data vào code dir)
- [ ] `.env.prod` file present, không commit vào git
- [ ] `.env.prod` permissions: `chmod 600`

## 3. Networking & SSL

- [ ] Domain A records trỏ đến VPS IP
- [ ] Cloudflare proxy ON (CDN + DDoS protection)
- [ ] Cloudflare SSL mode: **Full (strict)** — không dùng Flexible
- [ ] Caddy running và auto-TLS hoạt động (kiểm tra `/health/live`)
  - *Note: nếu chưa config Caddy, dùng Nginx tạm — xem `CADDY_PROD_CONFIG.md`*
- [ ] `pmtl.vn` → `web:3000` routing OK
- [ ] `api.pmtl.vn` → `api:3001` routing OK
- [ ] `admin.pmtl.vn` → `admin:3002` routing OK
- [ ] CORS origins trong `.env.prod` khớp với domains thực
- [ ] HTTP/3 hoạt động (Caddy default)

## 4. Application

- [ ] `GET /api/health/live` → `{ status: "ok" }`
- [ ] `GET /api/health/ready` → `{ status: "ok", checks: { postgres: "ok", ... } }`
- [ ] Next.js `cacheComponents=true` và cache strategy rõ (`use cache`, `cacheLife`, `cacheTag`)
- [ ] Route đọc nặng đã gắn explicit cache profile (không implicit fetch cache)
- [ ] Prisma migrations applied: `prisma migrate deploy`
- [ ] Seed data loaded nếu cần (chanting env rules, etc.)
- [ ] Auth flow test: login → access token → refresh token
- [ ] Rate limit test: >5 requests/15min → 429 response
- [ ] Error envelope format verify: `{ success: false, code, message, requestId, timestamp }`
- [ ] JWT secrets trong `.env.prod` là random 64+ char (không dùng dev defaults)
- [ ] `COOKIE_SECURE=true` trong production env
- [ ] `COOKIE_DOMAIN` set đúng (`.pmtl.vn`)
- [ ] Meilisearch API key set và không là default empty
- [ ] Search index seeded (chạy reindex script)

## 5. Monitoring & Backup

- [ ] Uptime Kuma deployed và ping `/api/health/live` mỗi 5 phút
- [ ] Netdata profile chạy ổn (`/api/v1/info` trả về healthy)
- [ ] Prometheus scrape Netdata target thành công
- [ ] Telegram bot token + chat ID configured cho alerts
- [ ] Test alert: `just telegram` hoặc send test message manually
- [ ] pg_dump cron configured: `0 2 * * *` → `/opt/pmtl/scripts/backup-db.sh`
- [ ] Remote backup configured (Vietnix Object Storage / MinIO / Viettel Cloud S3)
  - Xem `BACKUP_RECOVERY_VPS.md` — section "Remote sync"
- [ ] Restore drill completed (mandatory): restore vào staging, verify `/health/ready`
- [ ] Disk space alert cron configured (alert khi > 80%)
- [ ] Log rotation configured (`/etc/logrotate.d/pmtl`)

## 6. Security Final Check

- [ ] `docker inspect` các containers: không có sensitive env vars bị log
- [ ] Helmet headers present: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- [ ] `Content-Security-Policy` header set (xem `SECURITY_VPS_CANON.md`)
- [ ] No `.env` files trong Docker image layers (`docker history` check)
- [ ] Postgres không expose port ra ngoài VPS (chỉ internal Docker network)
- [ ] Meilisearch không expose port ra ngoài (chỉ internal)
- [ ] `no-new-privileges: true` trong compose cho api/web/admin
- [ ] Distroless runtime không chứa shell/package manager ở prod image (web/api)
- [ ] Admin panel không accessible từ public internet nếu chưa cần (optional: IP whitelist)
- [ ] Brevo SMTP credentials rotated từ dev sang production account
- [ ] Git repo không có secrets: `git log --all --oneline | head -20` + secret scan

---

## Launch Gate Summary

| Gate | Blocker? | Status |
|------|----------|--------|
| `/api/health/ready` passes | [OK] BLOCKER | [ ] |
| SSL cert valid | [OK] BLOCKER | [ ] |
| Auth flow working | [OK] BLOCKER | [ ] |
| pg_dump cron active | [OK] BLOCKER | [ ] |
| Restore drill done | [OK] BLOCKER | [ ] |
| Uptime Kuma alert | [OK] BLOCKER | [ ] |
| Netdata health + local-only exposure | [OK] BLOCKER | [ ] |
| Rate limit working | [OK] BLOCKER | [ ] |
| Prometheus/Grafana | ⏳ Phase 2 | — |
| Woodpecker CI live | ⏳ Phase 2 | — |

---

*Owner: `design/02-platform-baseline/vps-runtime/` · Last updated: 2026-03-27*

