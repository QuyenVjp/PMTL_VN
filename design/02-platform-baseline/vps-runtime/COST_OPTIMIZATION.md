# COST_OPTIMIZATION — Resource Quotas & Budget Alerts

File này chốt cách PMTL_VN kiểm soát chi phí VPS và tài nguyên.

> **Related**: `design/02-platform-baseline/vps-runtime/`, `PRODUCTION_CHECKLIST.md`

---

## 1. Target Budget

| Môi trường | Target | Max acceptable |
|------------|--------|----------------|
| Development (local) | $0 | $0 |
| Staging (single VPS) | $10-20/mo | $30/mo |
| Production (MVP) | $50-100/mo | $150/mo |
| Production (scaled) | $100-200/mo | $300/mo |

---

## 2. VPS Sizing Guidelines

### MVP (Contabo VPS)
| Component | RAM | CPU | Storage | Cost |
|-----------|-----|-----|---------|------|
| Web/API/DB combined | 8 GB | 4 vCPU | 200 GB NVMe | ~$15/mo |

### Scaled (khi cần)
| Component | RAM | CPU | Storage | Cost |
|-----------|-----|-----|---------|------|
| Web (Next.js) | 2 GB | 2 vCPU | 50 GB | ~$5/mo |
| API (NestJS) | 4 GB | 2 vCPU | 50 GB | ~$10/mo |
| Database (Postgres) | 4 GB | 2 vCPU | 100 GB | ~$10/mo |
| Search (Meilisearch) | 2 GB | 2 vCPU | 50 GB | ~$5/mo |
| Cache (Valkey) | 1 GB | 1 vCPU | 20 GB | ~$3/mo |

---

## 3. Docker Resource Limits

### compose.prod.yml

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  api:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
        reservations:
          memory: 1G
          cpus: '1.0'

  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
        reservations:
          memory: 1G
          cpus: '1.0'
    # Postgres-specific tuning
    environment:
      - POSTGRES_SHARED_BUFFERS=512MB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=1536MB
      - POSTGRES_WORK_MEM=4MB
      - POSTGRES_MAX_CONNECTIONS=100

  meilisearch:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
    environment:
      - MEILI_MAX_INDEXING_MEMORY=500mb
      - MEILI_MAX_INDEXING_THREADS=2

  valkey:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    command: ["valkey-server", "--maxmemory", "400mb", "--maxmemory-policy", "allkeys-lru"]
```

---

## 4. Application-Level Quotas

### Storage per user

```typescript
// apps/api/src/platform/storage/quota.service.ts
export const STORAGE_QUOTAS = {
  default: 100 * 1024 * 1024,  // 100 MB
  premium: 500 * 1024 * 1024,  // 500 MB
  admin: 2 * 1024 * 1024 * 1024, // 2 GB
};
```

### Request quotas

```typescript
// Rate limits per tier
export const RATE_LIMITS = {
  anonymous: { requests: 60, window: 60 },     // 1/sec
  authenticated: { requests: 300, window: 60 }, // 5/sec
  admin: { requests: 1000, window: 60 },        // 16/sec
};
```

### Database quotas

```sql
-- Connection pool limits
-- PgBouncer config
max_client_conn = 200
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
```

---

## 5. Monitoring Dashboard (Netdata)

### Key metrics to watch

```yaml
# /etc/netdata/health.d/pmtl-cost.conf

# CPU sustained high
alarm: cpu_high_sustained
on: system.cpu
lookup: average -5m unaligned of user,system,nice
units: %
every: 1m
warn: $this > 80
crit: $this > 95
info: CPU usage sustained high - consider scaling

# Memory pressure
alarm: memory_pressure
on: system.ram
lookup: average -5m of used
calc: $this * 100 / ($this + available)
units: %
warn: $this > 85
crit: $this > 95
info: Memory pressure - may need more RAM

# Disk filling
alarm: disk_space_web
on: disk.space
lookup: average -1h of used
calc: $this * 100 / ($this + avail)
units: %
warn: $this > 80
crit: $this > 90
info: Disk space running low

# Database connections
alarm: postgres_connections
on: postgres.connections
lookup: average -5m of active
warn: $this > 80
crit: $this > 95
info: Too many database connections
```

---

## 6. Cost Alerts

### Telegram notification

```bash
#!/bin/bash
# infra/scripts/cost-alert.sh

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID}"

send_alert() {
  local message="$1"
  curl -s -X POST \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=${message}" \
    -d "parse_mode=Markdown"
}

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 80 ]; then
  send_alert "⚠️ *PMTL Alert*: Disk usage at ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USAGE" -gt 85 ]; then
  send_alert "⚠️ *PMTL Alert*: Memory usage at ${MEM_USAGE}%"
fi

# Check container health
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
if [ -n "$UNHEALTHY" ]; then
  send_alert "🔴 *PMTL Alert*: Unhealthy containers: ${UNHEALTHY}"
fi
```

Cron:
```bash
# /etc/cron.d/pmtl-cost
*/15 * * * * root /opt/pmtl/infra/scripts/cost-alert.sh
```

---

## 7. Scaling Decision Tree

```
Traffic/Load increasing?
        │
        ▼
Is it sustained (>24h)?
        │
   No ──┼── Yes
   │    │
   │    ▼
   │  Is it a specific component?
   │         │
   │    Yes ──┼── No
   │    │     │
   │    │     ▼
   │    │   Scale VPS vertically first
   │    │   (more RAM/CPU)
   │    │
   │    ▼
   │  Which component?
   │    │
   │    ├── Database → Add read replicas
   │    ├── Search → Increase Meilisearch RAM
   │    ├── API → Add API container replicas
   │    └── Web → CDN caching first, then replicas
   │
   ▼
Wait and monitor
```

---

## 8. Optimization Checklist

### Before scaling (làm đầu tiên)

- [ ] Enable gzip/brotli compression
- [ ] Configure CDN caching (Cloudflare)
- [ ] Optimize images (WebP, lazy load)
- [ ] Database query optimization (EXPLAIN ANALYZE)
- [ ] Connection pooling (PgBouncer)
- [ ] Redis/Valkey caching for hot data
- [ ] Static asset caching (1 year)

### Application optimizations

- [ ] Bundle size < 200KB gzipped
- [ ] Code splitting per route
- [ ] Database indexes for common queries
- [ ] Pagination default 20, max 100
- [ ] Background jobs for heavy operations

### Infrastructure optimizations

- [ ] Docker multi-stage builds (smaller images)
- [ ] Log rotation configured
- [ ] Unused Docker images cleaned weekly
- [ ] Database vacuum/analyze scheduled

---

## 9. Spot Instance Consideration (Phase 2+)

Khi scale lên nhiều servers:

| Component | Spot OK? | Notes |
|-----------|----------|-------|
| Web servers | ✅ Yes | Stateless, can restart |
| API servers | ⚠️ Careful | Drain connections first |
| Database | ❌ No | Data integrity critical |
| Cache | ✅ Yes | Can rebuild from DB |
| Search | ⚠️ Careful | Reindex takes time |

---

## 10. Monthly Review Checklist

- [ ] Review Contabo/VPS billing
- [ ] Check Cloudflare usage
- [ ] Review database storage growth
- [ ] Check media storage growth
- [ ] Review log storage
- [ ] Clean up unused resources
- [ ] Document any scaling decisions

---

*Owner: `infra/` · Last updated: 2026-03-31*
