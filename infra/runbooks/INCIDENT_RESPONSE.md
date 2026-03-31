# Incident Response Playbook — PMTL_VN

Owner: On-call maintainer.
Last updated: 2026-03-31.
Stack: Single VPS · Docker Compose · Postgres 17 · NestJS 11 · Next.js 16 · Caddy.

---

## Severity Levels

| Level | Definition | Response target |
|-------|-----------|----------------|
| **P0** | Platform down — no user can access | 15 phút |
| **P1** | Core feature broken — auth/practice data | 1 giờ |
| **P2** | Degraded — some pages fail | 4 giờ |
| **P3** | Minor bug, cosmetic | Next working day |

---

## Runbook 1 — P0 Platform Outage

**Trigger:** `/api/health/live` không response hoặc Uptime Kuma alert.

```bash
# 1. SSH vào VPS
ssh pmtl@<VPS_IP>
cd /opt/pmtl

# 2. Kiểm tra container status
docker compose -f infra/docker/compose.prod.yml ps

# 3. Xem logs container bị lỗi (thay "api" bằng service thật)
docker compose -f infra/docker/compose.prod.yml logs --tail=100 api
docker compose -f infra/docker/compose.prod.yml logs --tail=100 web

# 4. Restart service cụ thể (không restart toàn stack)
docker compose -f infra/docker/compose.prod.yml restart api

# 5. Nếu restart không giải quyết — pull image mới nhất
docker compose -f infra/docker/compose.prod.yml pull api
docker compose -f infra/docker/compose.prod.yml up -d --no-deps api

# 6. Verify
curl -sf http://localhost:3001/api/health/live && echo OK
```

**Rollback nếu image mới bị lỗi:**
```bash
# Xem commit SHA của image đang chạy ổn
docker ps --format "table {{.Image}}\t{{.Status}}"

# Pull image cũ bằng SHA cụ thể
export API_IMAGE=ghcr.io/<owner>/pmtl-vn-api:<GOOD_SHA>
docker compose -f infra/docker/compose.prod.yml up -d --no-deps api
```

---

## Runbook 2 — Database Corrupt / Data Loss

**Trigger:** Prisma errors như `P2002`, `P2025`, `P1001` liên tục; DB không start.

```bash
# 1. Kiểm tra Postgres
docker compose -f infra/docker/compose.prod.yml logs --tail=50 postgres
docker compose -f infra/docker/compose.prod.yml exec postgres pg_isready -U pmtl

# 2. Nếu DB không start — check disk space trước
df -h
# Nếu full → clear Docker logs/images
docker system prune -f --filter "until=24h"

# 3. Restore từ backup gần nhất
ls -lht backups/prod/postgres/ | head -10
# Chọn file mới nhất:
export DUMP_FILE=backups/prod/postgres/pmtl-YYYYMMDD-HHMMSS.dump
# Nếu file được GPG encrypt:
gpg --decrypt "$DUMP_FILE.gpg" > /tmp/restore.dump
export DUMP_FILE=/tmp/restore.dump

# 4. Stop API trước khi restore
docker compose -f infra/docker/compose.prod.yml stop api web

# 5. Restore (script tự động verify)
DUMP_FILE="$DUMP_FILE" bash infra/scripts/restore-db.sh

# 6. Restart
docker compose -f infra/docker/compose.prod.yml up -d
curl -sf http://localhost:3001/api/health/ready && echo DB_OK
```

**Target:** Restore trong vòng 15 phút kể từ khi phát hiện.

---

## Runbook 3 — DDoS / Traffic Spike

**Trigger:** VPS CPU/RAM spike, Caddy logs tràn, Uptime Kuma intermittent.

```bash
# 1. Xác nhận DDoS hay spike thật
docker compose -f infra/docker/compose.prod.yml exec caddy \
  sh -c "cat /var/log/caddy/access.log | awk '{print \$1}' | sort | uniq -c | sort -rn | head -20"

# 2. Cloudflare: bật Under Attack Mode ngay
# Dashboard → pmtl.vn → Security → Settings → Security Level → Under Attack Mode
# Hoặc dùng Cloudflare API:
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/settings/security_level" \
  -H "Authorization: Bearer <CF_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{"value":"under_attack"}'

# 3. Block IP range cụ thể nếu biết nguồn
# Cloudflare → Security → WAF → Custom Rules → Block <IP>

# 4. Sau khi attack qua — hạ lại về Medium
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/settings/security_level" \
  -H "Authorization: Bearer <CF_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{"value":"medium"}'
```

---

## Runbook 4 — Container OOM / Memory Spike

**Trigger:** Container bị kill liên tục (`docker ps` thấy Restarting).

```bash
# 1. Xem stats realtime
docker stats --no-stream

# 2. Xem lý do kill
docker inspect <container_id> | grep -A5 "OOMKilled\|ExitCode"

# 3. Tăng tạm thời mem_limit trong compose.prod.yml nếu cần
# web: 1024m → 1536m
# Sau đó: docker compose up -d --no-deps web

# 4. Tìm memory leak — xem heap
docker compose exec api node --expose-gc -e "
  global.gc();
  const used = process.memoryUsage();
  console.log(JSON.stringify(used));
"
```

---

## Runbook 5 — Secret Compromise

**Trigger:** Nghi ngờ JWT secret / DB password bị lộ (commit nhầm, log leak, etc.).

```bash
# 1. Revoke tất cả sessions ngay (force logout tất cả user)
docker compose -f infra/docker/compose.prod.yml exec postgres \
  psql -U pmtl -d pmtl -c "UPDATE sessions SET revoked_at = NOW() WHERE revoked_at IS NULL;"

# 2. Rotate secret bị lộ trong .env.prod
nano /opt/pmtl/infra/docker/.env.prod
# Đổi: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, hoặc POSTGRES_PASSWORD

# 3. Nếu POSTGRES_PASSWORD bị lộ — đổi trong Postgres
docker compose -f infra/docker/compose.prod.yml exec postgres \
  psql -U pmtl -c "ALTER USER pmtl WITH PASSWORD '<NEW_PASSWORD>';"

# 4. Restart services để load secret mới
docker compose -f infra/docker/compose.prod.yml up -d --no-deps api

# 5. Verify auth vẫn hoạt động
curl -sf http://localhost:3001/api/health/ready && echo OK

# 6. Audit: tìm access bất thường trong logs
docker compose -f infra/docker/compose.prod.yml logs api | grep -E "login|401|403" | tail -50
```

---

## Runbook 6 — Disk Full

**Trigger:** Uptime Kuma disk alert (> 80%), Docker fails to pull/write.

```bash
# 1. Xem disk usage
df -h
du -sh /var/lib/docker/*

# 2. Dọn Docker artifacts cũ (safe)
docker system prune -f --filter "until=24h"
docker volume prune -f  # CẢNH BÁO: chỉ prune unused volumes
docker image prune -a -f --filter "until=72h"

# 3. Dọn logs cũ
find /var/log -name "*.gz" -mtime +7 -delete
journalctl --vacuum-time=7d

# 4. Kiểm tra backup cũ
ls -lht /opt/pmtl/backups/prod/postgres/ | tail -20
# Xóa backup > 14 ngày thủ công nếu cần
find /opt/pmtl/backups -mtime +14 -delete
```

---

## Quick Reference

| Tình huống | Command nhanh |
|-----------|---------------|
| Xem tất cả container status | `docker compose -f infra/docker/compose.prod.yml ps` |
| Tail logs một service | `docker compose -f infra/docker/compose.prod.yml logs -f api` |
| Health check | `curl http://localhost:3001/api/health/ready` |
| Restart một service | `docker compose -f infra/docker/compose.prod.yml restart <service>` |
| Postgres connect | `docker compose -f infra/docker/compose.prod.yml exec postgres psql -U pmtl` |
| Xem slow queries | `docker compose exec postgres psql -U pmtl -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"` |

---

## Post-Incident Checklist

Sau khi resolve P0/P1:

- [ ] Timeline ghi lại: phát hiện lúc nào, root cause là gì, fix lúc nào
- [ ] `.env.prod` permissions: `chmod 600 infra/docker/.env.prod`
- [ ] Review disk space còn lại
- [ ] Verify backup cron vẫn chạy: `crontab -l | grep backup`
- [ ] Notify users nếu downtime > 15 phút (đăng thông báo trên trang)
- [ ] Update file này nếu runbook cần cải thiện
