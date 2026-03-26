# VALKEY_ARCHITECTURE — Cache / Rate-limit / Queue Store

File này chốt thiết kế đầy đủ cho Valkey (Redis-compatible) khi được kích hoạt ở Phase 2+.
Phase 1 dùng Postgres `rate_limit_records` table — Valkey chỉ bật khi trigger được đáp ứng.

> **Phase trigger**: `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` — "Valkey: Cache miss rate > threshold HOẶC rate-limit Postgres table too slow"
> **BullMQ dependency**: `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` — Valkey là BullMQ backend
> **Env vars**: `design/04-execution-overlay/repo/ENV_INVENTORY.md` — VALKEY_* group
> **Node client baseline**: `node-redis` via npm package `redis`
> **Module opportunity overlay**: `design/04-execution-overlay/repo/VALKEY_MODULE_OPPORTUNITY_MATRIX.md`
> **Cache candidate inventory**: `design/04-execution-overlay/repo/VALKEY_CACHE_CANDIDATE_INVENTORY.md`
> **Runtime drill**: `design/02-platform-baseline/deploy-ops/VALKEY_RUNTIME_DRILL.md`

---

## Phase trigger (exact)

Bật Valkey khi **ít nhất 1** điều kiện sau:

| Trigger | Measurement |
|---|---|
| rate_limit_records Postgres table shows lock contention | `pg_locks` hoặc DB wait events cho thấy lock waits lặp lại trên `rate_limit_records`, hoặc p95 của limiter query > 100ms sustained trong 15 phút dù index/cleanup đã đúng |
| Cache miss causing > 300ms p95 on frequently-read routes | Pino logs showing repeated identical DB queries |
| BullMQ is being activated (requires Valkey as backend) | BullMQ activation trigger met |
| Shared state needed across multiple API instances (horizontal scale) | Horizontal scale decision made |

**Không coi là đủ trigger**:
- một slow query đơn lẻ
- table chưa được index/cleanup đúng mà đã vội migrate
- contention chỉ xuất hiện trong local dev noise, không lặp lại ở môi trường gần production

### Measurement discipline

- `p95 limiter query > 100ms sustained trong 15 phút` nghĩa là:
  - measurement lấy từ app timing log hoặc metric bucket cùng key `rate_limit_records`
  - ít nhất `3` sample windows liên tiếp, mỗi window `5 phút`
  - không dùng một request bất thường để kích hoạt migration
- lock contention phải được chứng minh bằng:
  - `pg_locks` / wait events lặp lại trên `rate_limit_records`
  - hoặc app log cho thấy rate-limit path là bottleneck thật, không phải DB chung đang quá tải vì lý do khác

---

## Purpose (3 responsibilities)

1. **Rate-limit coordination store** — replaces `rate_limit_records` Postgres table
2. **Server-side cache layer** — computed/aggregated data with TTL
3. **BullMQ queue backend** — job queues for async processing

Valkey does NOT:
- Store canonical business data (Postgres is source of truth)
- Replace session storage (sessions stay in Postgres)
- Cache user-specific sensitive data without TTL
- Act as PMTL canonical event bus via Redis pub/sub

---

## Node client baseline

- PMTL chốt `node-redis` là Node.js client baseline cho lane Valkey/Redis-compatible.
- Không đưa `ioredis` vào scaffold mới nếu không có owner decision riêng.
- Object-mapping layers như RedisOM không là baseline cho PMTL; key design và command usage phải explicit.

### Connection contract

- Dùng `createClient()` với `VALKEY_URL` làm connection string authority.
- Mỗi process phải:
  - đăng ký `client.on('error', ...)` trước `connect()`
  - `await client.connect()` trong startup lane
  - chỉ coi client sẵn sàng khi `client.isReady === true`
  - đóng graceful bằng `await client.quit()` khi shutdown
- `client.isOpen` chỉ là socket-state signal; readiness contract không được dựa vào nó một mình.

### URL contract

- Shape hợp lệ:
  - `redis://host:port`
  - `redis://username:password@host:port/db-number`
  - `rediss://...` chỉ khi TLS thực sự cần
- PMTL chỉ dùng `VALKEY_URL` làm env owner; không tạo thêm env duplicate chỉ để phục vụ client syntax.

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

### Split-instance trigger

Đánh giá tách thành instance riêng khi có một trong các dấu hiệu:

- combined memory usage giữ trên `80%` allocation dù TTL/eviction đã đúng
- queue keys tăng nhanh làm DB 1 cạnh tranh rõ với cache/rate-limit path
- BullMQ backlog cần `noeviction` nhưng cache path lại cần aggressive eviction
- recovery/maintenance của queue không còn muốn ảnh hưởng cache path

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
    connectTimeout: 5000,
    tls: process.env.VALKEY_TLS === 'true',
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
  maxRetriesPerRequest: parseInt(process.env.VALKEY_MAX_RETRIES ?? '3'),
}
```

### Client lifecycle notes

- Không tạo connect/disconnect theo từng request.
- `apps/api` giữ singleton client(s) cho cache/rate-limit.
- `apps/worker` giữ client(s) riêng theo worker lifecycle.
- Shutdown path ưu tiên `quit()`; chỉ force-close khi process đang fail-fast và không thể chờ graceful close.

### Error handling and reconnect rules

- Redis-compatible command errors trong PMTL chia 2 nhóm:
  - recoverable transport/runtime: `ECONNREFUSED`, `ECONNRESET`, `ETIMEDOUT`, `EAI_AGAIN`, `BUSY`, `TRYAGAIN`, `LOADING`
  - unrecoverable schema/code misuse: `WRONGTYPE` va app misuse tuong duong
- recoverable errors:
  - cho phep retry co gioi han + exponential backoff
  - hoac degrade/fallback theo owner lane
- unrecoverable errors:
  - fail fast
  - sua code/schema thay vi retry
- moi client phai co `error` listener; khong duoc de process crash vi unhandled EventEmitter error.
- reconnect tu dong duoc phep cho cache/read-heavy lanes.
- voi non-idempotent lanes co nguy co replay sai khi reconnect:
  - can can nhac `disableOfflineQueue: true`
  - hoac tach rieng connection khong queue offline

### Command timeout rule

- connect timeout baseline: `5000ms`
- command timeout cho lane nhay cam budget phai dung abort signal hoac wrapper timeout ro rang
- khong de Valkey command treo vo thoi han trong request path

### Client-side caching / pooling / smart handoff stance

- client-side caching khong la baseline PMTL cho phase 2:
  - de tang invalidation complexity
  - co nguy co drift voi server-side cache owners
- pooling khong la baseline rieng; `node-redis` multiplexing tren singleton client la du cho current architecture cho toi khi do duoc connection contention that
- `Smart client handoffs` khong la baseline vi PMTL hien khong chot Redis Software/Cloud enterprise lane
- geographic failover khong la baseline; neu can mo sau nay phai co owner doc rieng

### Pub/sub stance

- Redis/Valkey `pub/sub` khong la event backbone mac dinh cua PMTL.
- PMTL khong dung Redis pub/sub de thay cho:
  - transactional outbox
  - BullMQ durable queue
  - canonical cross-module event delivery
- Ly do:
  - pub/sub khong durable
  - subscriber offline co the mat event
  - khong phu hop cho auditability, retry, dead-letter, va replay requirements cua PMTL
- Neu can broadcast ephemeral signal noi bo trong tuong lai, pub/sub chi duoc xem xet cho:
  - cache invalidation hint
  - best-effort refresh signal
  - dev/operator convenience lane
- Ngay ca trong cac lane do:
  - khong duoc coi message la source of truth
  - consumer phai co kha nang recompute/read-lai tu canonical store

---

## Pipeline / transaction semantics

- PMTL phan biet ro:
  - pipeline = giam round-trip
  - transaction = can multi-command atomicity tu phia Redis
- command doc/ghi doc lap co the dung auto-pipelining trong cung event-loop tick, vi du `Promise.all([...])`
- khong dung pipeline nhu the no dam bao atomicity
- can semantics atomic hoac ordered commit thi phai dung:
  - `MULTI/EXEC`
  - hoac Lua script/server-side atomic primitive
- voi rate-limit/sliding-window va update canh tranh:
  - uu tien Lua script nhu owner pattern hien tai
- neu ket noi bi mat trong luc pipeline:
  - phai biet `Promise.all()` auto-pipeline va `multi().execAsPipeline()` co semantics khac nhau
  - khong chon bua mot trong hai cho lane co side effects ma chua danh gia replay/discard behavior

---

## Failure mode: Valkey down

When Valkey is down:
1. **Rate limiting**: Fall back to Postgres `rate_limit_records` table (same logic, slower)
2. **Cache**: Fall back to direct DB query (cache miss penalty, not hard failure)
3. **BullMQ**: Jobs cannot be enqueued → return error to caller, log `warn`

**Fallback budget**:
- rate-limit fallback được chấp nhận khi vẫn giữ được request latency trong budget route hiện tại
- nếu Postgres fallback làm security-sensitive path vượt budget nghiêm trọng hoặc DB đã quá tải, service phải `fail closed` thay vì giả vờ degrade an toàn
- queue path không có graceful fallback tương đương canonical; nếu BullMQ cần Valkey mà Valkey chết, async producer phải trả lỗi rõ hoặc giữ lại bằng outbox/pending artifact theo contract liên quan

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

---

## Operator tooling stance

### Redis Insight

- `Redis Insight` duoc phep dung nhu operator/debug tool cho Valkey lane.
- Vai tro dung:
  - inspect key namespace
  - xem TTL/eviction pressure
  - check queue key growth
  - inspect memory/top keys khi incident
- Khong dung Redis Insight nhu source of truth cho business state.
- Khong thao tac tay sua key production neu chua co runbook/incident note ro.

### Observability handoff

- Khi Valkey duoc activate, owner observability phai bo sung it nhat:
  - connected / disconnected state
  - command error count theo class
  - fallback activation count
  - cache hit / miss ratio
  - queue DB pressure neu BullMQ cung active
- Dashboard/metric owner van nam o `OBSERVABILITY_ARCHITECTURE.md`; file nay chi chot Valkey-specific expectations.
