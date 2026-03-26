# VALKEY_RUNTIME_DRILL — Activation, fallback, and Redis Insight runbook

File này chốt runbook thực chiến cho `Valkey` sau khi phase trigger đã được đáp ứng.
Nó không quyết định có bật `Valkey` hay không; nó chốt `bật rồi thì phải drill thế nào`.

> **Activation baseline**: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> **Health owner**: `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md`
> **Observability owner**: `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md`
> **Queue owner**: `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md`
> **Source hints reviewed**: `docs/redis_docs.md` — `node-redis`, `error handling`, `production usage`

## Purpose

Drill này tồn tại để chứng minh 4 thứ:

1. `Valkey` boot đúng
2. app dùng đúng lane (`rate-limit`, `cache`, `BullMQ`) khi được bật
3. fallback hoạt động khi `Valkey` chết
4. operator biết soi `Redis Insight` mà không phá business state

## Preconditions

- `VALKEY_URL` đã cấu hình
- `client.on('error', ...)`, `connect()`, `isReady`, `quit()` đã đi đúng contract trong code
- `/health/ready` đã có optional Valkey check đúng owner doc
- nếu bật BullMQ thì queue DB split đã đúng: cache/rate-limit ở DB 0, queue ở DB 1

## Activation checklist

| Step | Evidence cần có |
|---|---|
| container/process lên được | `docker compose ps valkey` hoặc runtime supervisor state |
| app connect được | app logs có connect success và không có reconnect loop bất thường |
| readiness pass | `/health/ready` báo `valkey: ok` khi lane đã route qua Valkey |
| request path đúng | log hoặc metric cho thấy rate-limit/cache dùng Valkey thật |
| fallback vẫn tồn tại | stop Valkey có thể rơi về Postgres/direct DB theo đúng lane |

## Core drill sequence

### 1. Bring-up

1. Khởi động `Valkey`
2. Khởi động `apps/api`
3. Gọi `/health/ready`
4. Xem logs tìm:
   - connect success
   - `error` listener không spam
   - không có reconnect storm

### 2. Rate-limit path drill

1. Bật `RATE_LIMIT_STORE=valkey`
2. Gọi lặp route auth/search/write có limiter
3. Kiểm tra:
   - key `rl:*` xuất hiện
   - TTL tồn tại
   - rate-limit vẫn chặn đúng

### 3. Cache path drill

1. Gọi một read path đã được owner cho phép cache
2. Gọi lại cùng request shape
3. Kiểm tra:
   - lần 1 miss, lần 2 hit
   - fallback DB path vẫn tồn tại khi cache unavailable
   - key namespace đúng `cache:*`

### 4. BullMQ path drill, nếu queue active

1. Enqueue một job shortlist
2. Xác nhận queue keys ở DB 1
3. Xác nhận worker xử lý xong
4. Xác nhận dead-letter không tăng bất thường

## Redis Insight runbook

### Allowed uses

- inspect key namespaces
- check TTL
- inspect memory/top keys
- inspect queue key growth
- inspect hit/miss pressure khi có dashboard tương ứng

### Forbidden uses

- sửa tay business-state keys để “chữa cháy” mà không có incident owner
- xóa bừa queue keys production
- dùng Redis Insight làm source of truth thay cho logs/metrics/health

### What to inspect first

| Symptom | Inspect in Redis Insight |
|---|---|
| cache hit thấp | key family `cache:*`, TTL quá ngắn, key cardinality quá tản |
| limiter lỗi | `rl:*`, TTL/window behavior, key growth bất thường |
| queue backlog | DB 1 `bull:*`, wait/active/failed growth |
| memory pressure | top keys, memory usage, eviction counters |

## Failure drill

### Scenario A — Valkey down, rate-limit/cache fallback expected

1. Stop `Valkey`
2. Gọi `/health/ready`
3. Kỳ vọng:
   - readiness fail nếu lane active và owner doc yêu cầu fail
   - hoặc warn/degraded logs nếu service vẫn chạy với fallback
4. Gọi route có rate limit/cache
5. Xác nhận:
   - rate-limit dùng Postgres fallback nếu lane đó cho phép
   - cache lane rơi về DB/direct compute
   - không có silent success giả

### Scenario B — BullMQ active nhưng Valkey down

1. Stop `Valkey`
2. Thử enqueue job
3. Kỳ vọng:
   - producer trả lỗi rõ hoặc defer theo outbox contract
   - không báo enqueue thành công giả
   - operator thấy warn/error logs và queue metrics đổi trạng thái

## Rollback drill

1. Tắt routing sang `Valkey`
2. Giữ app chạy bằng Postgres/direct DB fallback
3. Nếu BullMQ đang active:
   - stop worker có kiểm soát
   - drain hoặc chấp nhận backlog theo incident note
4. Gọi lại:
   - `/health/ready`
   - representative read path
   - representative rate-limit path

## Minimum commands to record in evidence

```powershell
docker compose ps valkey
docker compose logs valkey --tail 100
docker compose logs api --tail 200
```

```text
GET /health/ready
representative rate-limit route
representative cacheable read route
representative queue-producing action (if BullMQ active)
```

## Proof of pass

Một drill chỉ được coi là pass khi có đủ:

- health evidence
- log evidence
- fallback evidence
- nếu queue active: enqueue + process evidence
- note xác nhận Redis Insight chỉ được dùng để inspect, không sửa tay state
