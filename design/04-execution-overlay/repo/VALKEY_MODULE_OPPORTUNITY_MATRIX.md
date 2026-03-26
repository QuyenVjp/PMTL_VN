# VALKEY_MODULE_OPPORTUNITY_MATRIX — Module-by-module activation guidance

File này chốt `Valkey` nên chen vào PMTL ở đâu và không nên chen vào đâu.
Nó không bật `Valkey` sớm hơn `DECISIONS.md`; nó chỉ khóa đường suy luận để AI không code kiểu `Redis ở mọi nơi`.

> **Baseline**: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> **Cache topology**: `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`
> **BullMQ**: `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md`
> **Source hints**: `docs/redis_docs.md` — `node-redis`, `error handling`, `pipelines/transactions`, `production usage`

## Reading rule

- `Postgres` vẫn là source of truth.
- `Valkey` chỉ được dùng cho coordination, derived cache, hoặc queue backend.
- Nếu một module chưa có measured pain hoặc chưa có invalidation owner rõ, default là `không dùng Valkey`.

## Opportunity matrix

| Module | Valkey use đáng tiền nhất | Phase stance | Trigger thực tế | Không được làm |
|---|---|---|---|---|
| `01-identity` | rate-limit coordination cho login/reset/search abuse; optional short-lived feature/auth read cache | activate hẹp | `rate_limit_records` contention, auth limiter p95 > threshold | không chuyển canonical session/auth truth sang Valkey; không lưu refresh/session authority làm source of truth |
| `02-content` | cache public read aggregates, guide/detail payloads, featured list snapshots | activate sớm nhất trong các domain nếu public traffic cao | public read p95 bị kéo bởi repeated identical queries | không cache write-path truth; không bypass Next.js/Cloudflare invalidation chain |
| `03-community` | cache public/community list aggregates nhẹ, counters không-critical | selective | list/read hot, DB fan-out tốn kém, stale window chấp nhận được | không cache canonical comment/post moderation truth; không dùng Redis pub/sub làm moderation bus |
| `04-engagement` | cache derived dashboard/member aggregate ngắn hạn; preference read-through cache | selective, cẩn trọng | member dashboard aggregate chậm lặp lại, query pattern ổn định | không cache progress/practice write truth theo kiểu đọc-mãi-không-refetch; không để read-your-own-write phụ thuộc Valkey |
| `05-moderation` | hầu như không phải cache-first module; có thể giữ counters/ops summary | mostly avoid | admin ops dashboard aggregate thực sự nóng | không cache report resolution truth; không dùng làm work queue thay BullMQ |
| `06-search` | cache search metadata, top queries, admin search ops snapshots; BullMQ backend cho search-sync khi mở | strong candidate | publish/reindex path chậm hoặc search status polling nóng | không coi Valkey là search index; không thay SQL/Meilisearch authority |
| `07-calendar` | cache advisory/date-window read models; queue backend cho advisory recompute khi mở worker | strong selective | advisory compute hoặc member calendar aggregate lặp lại nhiều | không cache canonical event/lunar override truth quá dài; không để stale advisory che mất canonical DB update |
| `08-notification` | BullMQ backend; ephemeral delivery-state cache nhẹ; rate coordination cho reminder fan-out | strongest BullMQ candidate | push fan-out, retry pressure, operator mệt vì retry tay | không dùng Valkey pub/sub làm delivery contract; không để subscription truth chỉ nằm trong cache |
| `09-vows-merit` | cache public/member summary aggregates, streak/progress projections ngắn hạn | selective, correctness-first | dashboard/progress aggregates chậm, read-heavy rõ ràng | không cache canonical vow/journal entries như source of truth; không hy sinh read-your-own-write |
| `10-wisdom-qa` | cache public detail/list projections, glossary/source navigation aggregates; search-sync queue | strong candidate | public content traffic cao, repeated query shape ổn định | không cache source provenance truth theo kiểu khó invalidation; không để offline metadata truth nằm trong cache |
| `11-contact` | cache singleton contact info và volunteer directory công khai | low-complexity candidate | public contact page bị đọc nhiều, data hiếm đổi | không tạo queue hay pub/sub chỉ cho singleton CRUD |
| `platform/*` | feature flags cache, rate-limit store, BullMQ backend, cache dispatcher support | canonical Valkey lane | phase-2 activation hoặc measured pain rõ ở control-plane | không để platform/cache service biến Valkey thành business authority |

## Activation priority by value

| Priority | Lane | Vì sao |
|---|---|---|
| `P1` | `platform/rate-limit` | giá trị rõ, contract hẹp, fallback về Postgres có sẵn |
| `P1` | `content` public read cache | traffic cao, invalidation event đã có shape rõ |
| `P1` | `search` + `notification` BullMQ backend | async pressure xuất hiện sớm nhất nếu mở queue |
| `P2` | `calendar` advisory cache / recompute | derived read model, có thể tách khỏi truth |
| `P2` | `wisdom-qa` public cache | read-heavy, ít write hơn |
| `P3` | `engagement` / `vows-merit` member aggregates | chỉ mở khi dashboard aggregate thật sự nóng |
| `P3` | `community` summary cache | mở hẹp, tránh che khuất moderation truth |
| `P4` | `contact` | tiện nhưng không phải lý do để bật Valkey một mình |

## Canonical anti-goals

- Không mở `Valkey` chỉ vì “stack cho đẹp”.
- Không dùng `Valkey` để đỡ thiết kế invalidation.
- Không để mỗi module tự nghĩ key namespace riêng không qua `platform/cache`.
- Không cho AI scaffold `RedisRepository` per domain như thể đó là persistence authority.
- Không dùng `pub/sub` để thay `outbox -> BullMQ -> worker`.

## Implementation consequence

Nếu một task định bật `Valkey` cho module nào đó, trước khi code phải chỉ ra đủ:

1. measured pain cụ thể
2. cache hoặc coordination target cụ thể
3. invalidation owner cụ thể
4. fallback path cụ thể
5. proof criteria trong health/metrics/runbook
