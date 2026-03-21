# VALKEY_ARCHITECTURE — Cache / Rate-limit / Queue Store

File này chốt thiết kế đầy đủ cho Valkey (Redis-compatible) khi được kích hoạt ở Phase 2+.
Phase 1 dùng Postgres `rate_limit_records` table — Valkey chỉ bật khi trigger được đáp ứng.

> **Phase trigger**: `baseline/infra.md` — "Valkey: Cache miss rate > threshold HOẶC rate-limit Postgres table too slow"
> **BullMQ dependency**: `baseline/bullmq-worker-architecture.md` — Valkey là BullMQ backend
> **Env vars**: `tracking/env-inventory.md` — VALKEY_* group

---

## Phase trigger (exact)

Bật Valkey khi **ít nhất 1** điều kiện sau:

| Trigger | Measurement |
|---|---|
| rate_limit_records Postgres table shows lock contention | `pg_locks` + slow query log showing rate-limit table locks |
| Cache miss causing > 300ms p95 on frequently-read routes | Pino logs showing repeated identical DB queries |
| BullMQ is being activated (requires Valkey as backend) | BullMQ activation trigger met |
| Shared state needed across multiple API instances (horizontal scale) | Horizontal scale decision made |

---

## Purpose (3 responsibilities)

1. **Rate-limit coordination store** — replaces `rate_limit_records` Postgres table
2. **Server-side cache layer** — computed/aggregated data with TTL
3. **BullMQ queue backend** — job queues for async processing

Valkey does NOT:
- Store canonical business data (Postgres is source of truth)
- Replace session storage (sessions stay in Postgres)
- Cache user-specific sensitive data without TTL

---

## Key namespace design

```
# Rate limiting
rl:{endpoint_hash}:{ip_hash}:{window_start}   → sliding window counter (INCR + EXPIRE)
  Example: rl:auth.login:ip_sha256:1711015200  → integer count

# Session cache (optional — mirror of DB session)
session:{sessionId}   → JSON serialized session, TTL = remaining refresh token TTL
  Example: session:sess_abc123  → { userId, role, expiresAt }

# Feature flags cache
ff:{flagKey}   → "true" | "false", TTL = 300s
  Example: ff:search.meilisearch.enabled  → "false"

# Computed cache
cache:{namespace}:{key}   → JSON payload, TTL per policy (see cache-topology.md)
  Example: cache:content:post:abc123   → { title, body, ... }

# BullMQ (managed by BullMQ library — do not write manually)
bull:{prefix}:{queueName}:*   → BullMQ internal keys
  Example: bull:pmtl:search-sync:*
```

---

## Eviction policy

| Use | Policy | Reason |
|---|---|---|
| Cache keys (`cache:*`, `ff:*`, `session:*`) | `allkeys-lru` | Can be rebuilt from DB on eviction |
| Rate-limit keys (`rl:*`) | `volatile-lru` (keys have EXPIRE set) | Must have TTL — window-based |
| Queue keys (`bull:*`) | `noeviction` | Jobs must not be lost to eviction |

**Resolution**: Single Valkey instance cannot support both `allkeys-lru` and `noeviction`.
**Solution**: Separate databases (`SELECT` index) OR separate Valkey instances if queues grow large.
- Phase 2 default: DB 0 = cache + rate-limit, DB 1 = BullMQ queues
- Phase 3: Separate Valkey instances if needed

```typescript
// ValkeyService — separate clients per purpose
const cacheClient = createClient({ url: VALKEY_URL, database: 0 });
const queueClient = createClient({ url: VALKEY_URL, database: 1 }); // BullMQ uses this
```

---

## Rate-limit implementation (sliding window)

Replacing `rate_limit_records` Postgres table:

```typescript
// Lua script for atomic sliding window (runs server-side on Valkey)
const SLIDING_WINDOW_SCRIPT = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])   -- window in seconds
  local limit = tonumber(ARGV[2])    -- max requests
  local now = tonumber(ARGV[3])      -- current timestamp (ms)
  local window_start = now - (window * 1000)

  redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
  local count = redis.call('ZCARD', key)

  if count < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, window)
    return 0  -- allowed
  else
    return 1  -- rejected
  end
`;
```

---

## Connection configuration

```typescript
// apps/api/src/platform/valkey/valkey.config.ts
{
  url: process.env.VALKEY_URL,          // redis://valkey:6379
  socket: {
    tls: process.env.VALKEY_TLS === 'true',
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
  maxRetriesPerRequest: parseInt(process.env.VALKEY_MAX_RETRIES ?? '3'),
}
```

---

## Failure mode: Valkey down

When Valkey is down:
1. **Rate limiting**: Fall back to Postgres `rate_limit_records` table (same logic, slower)
2. **Cache**: Fall back to direct DB query (cache miss penalty, not hard failure)
3. **BullMQ**: Jobs cannot be enqueued → return error to caller, log `warn`

```typescript
// Graceful degradation pattern
async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  try {
    return await this.valkeyRateLimit(key, limit, window);
  } catch (err) {
    this.logger.warn({ action: 'rate-limit.valkey.fallback', key });
    return await this.postgresRateLimit(key, limit, window); // fallback
  }
}
```

Health check: `/health/ready` — when `VALKEY_URL` set, adds Valkey PING check.

---

## Migration path (enabling Valkey)

```
Step 1 — Deploy Valkey container (docker-compose.valkey.yml override)
Step 2 — Set VALKEY_URL in env, keep Postgres table as fallback
Step 3 — ValkeyService initializes at startup — /health/ready verifies connection
Step 4 — Enable rate-limit routing to Valkey via env flag RATE_LIMIT_STORE=valkey
Step 5 — Monitor for 7 days: compare rate-limit behavior, check error logs
Step 6 — If stable: remove Postgres fallback code path (keep table for history)
```

---

## Rollback

```bash
# Remove VALKEY_URL from env → ValkeyService disables itself
# Rate-limit falls back to Postgres automatically
# BullMQ jobs: drain queues before rollback or accept job loss
# Cache: no data loss (all derived from DB)
```

---

## Env vars

| Env | Required when | Default | Purpose |
|---|---|---|---|
| `VALKEY_URL` | yes | — | Connection string (`redis://valkey:6379`) |
| `VALKEY_TLS` | no | `false` | Enable TLS for Valkey connection |
| `VALKEY_MAX_RETRIES` | no | `3` | Max connection retry attempts |
| `RATE_LIMIT_STORE` | no | `postgres` | `postgres` or `valkey` |

---

## Code locations

| Artifact | Location |
|---|---|
| Valkey module | `apps/api/src/platform/valkey/valkey.module.ts` |
| Valkey service | `apps/api/src/platform/valkey/valkey.service.ts` |
| Rate-limit guard | `apps/api/src/platform/rate-limit/rate-limit.guard.ts` |
| Cache service | `apps/api/src/platform/valkey/cache.service.ts` |
| Docker Compose | `infra/docker/docker-compose.valkey.yml` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Valkey connected | `/health/ready` shows `valkey: { status: ok }` |
| Rate-limit via Valkey | `rl:*` keys visible in Valkey `KEYS rl:*` after auth requests |
| Fallback works | Stop Valkey → rate-limit still works (Postgres fallback) + warn in logs |
| BullMQ routing | Jobs appear in Valkey DB 1 after enqueue |
| Cache hit | Repeated identical request → Pino log shows cache hit, no DB query |
