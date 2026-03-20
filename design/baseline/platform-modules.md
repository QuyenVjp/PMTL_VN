# PLATFORM_MODULES_BASELINE (Nền tảng mô-đun hệ thống cốt lõi)

File này chốt các `platform modules (mô-đun nền tảng)` và `control-plane modules (mô-đun điều phối)` còn thiếu nếu chỉ nhìn domain modules `00-09`.

Đây là lớp rất dễ bị bỏ quên khi thiết kế theo business domain, nhưng lại là lớp quyết định:

- hệ có dễ debug không
- auth/session có đúng chuẩn không
- upload có an toàn không
- Codex có biết đặt code vào đâu không

## Platform modules không phải domain modules

Chúng không sở hữu business domain như `content` hay `community`, nhưng vẫn là owner rõ ràng của các năng lực cắt ngang.

Các module này nên nằm ở:

```txt
apps/api/src/platform/
```

## Danh sách baseline phase 1

### 1. `config`

**Owns**

- env contract
- startup validation
- runtime config mapping

**Files nên có**

```txt
config.module.ts
config.service.ts
config.schemas.ts
```

**Thiếu module này thì hỏng gì**

- app boot bằng env sai mà không fail fast
- web/admin/api lệch origin, secret, cookie policy

### 2. `logging`

**Owns**

- Pino bootstrap
- request context binding
- correlation/request id propagation

**Files nên có**

```txt
logger.module.ts
logger.service.ts
logger.constants.ts
```

### 3. `errors`

**Owns**

- global exception filter
- error envelope chuẩn
- domain error mapping

**Files nên có**

```txt
errors.module.ts
global-exception.filter.ts
error-codes.ts
app-error.ts
```

### 4. `validation`

**Owns**

- Zod validation pipe
- request/query/params/body parsing helpers
- shared schema response formatting

**Files nên có**

```txt
validation.module.ts
zod-validation.pipe.ts
validation-error.mapper.ts
```

### 5. `sessions`

**Owns**

- refresh token persistence
- revoke current session
- revoke all sessions
- admin idle timeout policy support

**Files nên có**

```txt
sessions.module.ts
sessions.service.ts
sessions.repository.ts
sessions.schemas.ts
```

**Why this is separate**

- auth flow cần `identity`
- nhưng session lifecycle là cross-cutting control-plane đủ lớn để có owner riêng

### 6. `audit`

**Owns**

- `audit_logs`
- append-only audit write helper
- audited action taxonomy

**Files nên có**

```txt
audit.module.ts
audit.service.ts
audit.repository.ts
audit.schemas.ts
audit.constants.ts
```

### 7. `feature-flags`

**Owns**

- `feature_flags`
- `isFeatureEnabled(key)`
- targeting cực tối thiểu theo phase 1 nếu cần

**Files nên có**

```txt
feature-flags.module.ts
feature-flags.service.ts
feature-flags.repository.ts
feature-flags.schemas.ts
```

### 8. `rate-limit`

**Owns**

- app-layer rate limit policy
- IP/account scoped guard
- `rate_limit_records` hoặc adapter interface tương đương

**Files nên có**

```txt
rate-limit.module.ts
rate-limit.guard.ts
rate-limit.service.ts
rate-limit.repository.ts
rate-limit.schemas.ts
```

### 9. `storage`

**Owns**

- storage abstraction
- local disk adapter phase 1
- future S3-compatible adapter contract
- `media_assets` canonical metadata orchestration

**Files nên có**

```txt
storage.module.ts
storage.service.ts
storage.interface.ts
local-storage.adapter.ts
media-assets.repository.ts
storage.schemas.ts
```

### 10. `health`

**Owns**

- `/health/live`
- `/health/ready`
- `/health/startup`

**Files nên có**

```txt
health.module.ts
health.controller.ts
health.service.ts
health.schemas.ts
```

### 11. `metrics`

**Owns**

- `/metrics`
- request counters
- latency histogram
- error/upload/rate-limit metrics

**Files nên có**

```txt
metrics.module.ts
metrics.controller.ts
metrics.service.ts
metrics.constants.ts
```

## Optional phase 2 modules

### `outbox`

- `outbox_events`
- transactional handoff
- replay/redrive/reconciliation

### `queue`

- BullMQ bootstrap
- producer abstraction
- consumer registration

### `worker-runtime`

- worker boot
- health/status for worker
- heartbeat/reporting

### `search-runtime`

- Meilisearch adapter
- reindex orchestration
- index status reporting

## Quan hệ giữa platform và domain

### Platform gọi domain khi

- cần support write-path của owner module
- ví dụ audit append sau action của `identity` hoặc `content`

### Domain gọi platform khi

- cần runtime capability cắt ngang
- ví dụ `content` gọi `storage`
- `identity` gọi `sessions`
- `community` gọi `audit`

### Không được làm

- platform cướp business ownership của domain
- domain tự clone lại logic platform vì “làm nhanh hơn”

## Suggested ownership map

| Module | Owns | Không sở hữu |
|---|---|---|
| `config` | env contract, startup config | auth policy, business rule |
| `sessions` | session records, revoke semantics | register/login business flow |
| `audit` | audit log persistence | domain state transition |
| `feature-flags` | feature switch state | rollout policy của từng domain |
| `rate-limit` | limiter storage và guard logic | auth decision, moderation decision |
| `storage` | file object contract và metadata orchestration | editorial content canonical data |
| `health` | health endpoints | business diagnostics chi tiết |
| `metrics` | app metrics contract | domain reporting UI |

## First launch blockers tied to these modules

Theo [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md), các phần dưới đây là blocker thật:

- `sessions`
- `audit`
- `feature-flags`
- `rate-limit`
- `storage`
- `health`
- `metrics`
- `config`

Nếu các module này chưa có folder owner rõ ràng, trạng thái đúng phải là:

- `planned` hoặc `required before launch`

không được tự nhận là `implemented`.

## Student note (Ghi chú cho sinh viên)

Khi mới làm dự án lớn, người mới thường chỉ nghĩ tới:

- auth
- post
- comment
- search

Nhưng hệ thống vận hành được lại phụ thuộc rất mạnh vào:

- session revoke
- audit
- feature flag
- upload/storage
- rate limit
- health/metrics

Nói thẳng:

- domain modules làm ra tính năng
- platform modules giữ cho tính năng không sập và không loạn
