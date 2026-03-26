# BULLMQ_ACTIVATION_SHORTLIST — First async workloads to promote

File này chốt `workload nào được phép lên BullMQ trước`, `workload nào chưa`, và `trigger nào đủ mạnh`.
Nó tồn tại để chặn AI scaffold queue tràn lan.

> **Queue contract owner**: `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md`
> **Valkey prerequisite**: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> **Outbox discipline**: `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md`

## Promotion rule

- Một side effect chỉ được promote lên BullMQ khi inline sync path đã rõ, failure cost đã đo được, và idempotency owner đã chỉ mặt.
- Nếu công việc vẫn rẻ, ít retry, ít fan-out, hoặc chưa có operator pain thật, default là `để sync`.

## Shortlist

| Priority | Workload | Queue | Vì sao đáng lên đầu | Trigger đủ mạnh | Không bật nếu |
|---|---|---|---|---|---|
| `P1` | search sync sau publish/unpublish | `pmtl:search-sync` | publish path dễ bị kéo dài; retry tay khó chịu; idempotency theo event rõ | publish API > 2s do reindex, timeout lặp lại, manual reindex nhiều | search lane còn nhỏ, SQL fallback đủ nhanh, publish chưa đau |
| `P1` | push notification delivery | `pmtl:notification-push` | fan-out, retry, provider lỗi tạm thời rất hợp queue | > 50 recipients, provider retry thường xuyên, request bị block | app chưa bật push hoặc volume quá thấp |
| `P1` | outbox dispatch | `pmtl:outbox-dispatch` | giúp side effects quan trọng durable và redrivable | side effect failure cost > complexity cost, cần audit/replay | event taxonomy chưa chốt hoặc producer chưa transactional |
| `P2` | calendar advisory recompute | `pmtl:calendar-advisory` | derived read model, có thể tách khỏi request path | advisory recompute nặng hoặc fan-out theo user/date | advisory vẫn tính nhanh inline được |
| `P3` | media scan / async post-upload checks | `pmtl:media-scan` | có thể tách hậu kiểm file khỏi request upload | upload hậu kiểm bắt đầu nặng hoặc security tooling yêu cầu | phase hiện tại chưa mở media-scan lane |

## Explicitly not first-wave queue candidates

| Workload | Vì sao chưa nên lên queue |
|---|---|
| auth login / refresh / revoke | correctness + latency budget + security, không được async hóa |
| canonical content publish write | publish truth phải commit đồng bộ; chỉ side effects đi queue |
| moderation resolve / hide canonical write | moderator cần kết quả authoritative ngay |
| contact singleton CRUD | quá nhẹ, queue chỉ thêm ceremony |
| member progress/vow canonical write | read-your-own-write quan trọng hơn async elegance |
| feature flag update | public gating cần consistency tức thì, không qua queue chậm |

## Readiness checklist before queue activation

Mỗi workload trong shortlist chỉ được bật khi đủ:

1. job schema trong `packages/shared`
2. idempotency key / duplicate-skip rule
3. retry classification
4. dead-letter owner
5. operator redrive path
6. health + metrics evidence

## Decision matrix

| Symptom | Keep sync | Move to BullMQ |
|---|---|---|
| request vẫn < `2s`, retry tay hiếm | yes | no |
| downstream flaky nhưng user-facing write không cần chờ | no | yes |
| failure cần replay / dead-letter / audit | no | yes |
| business result phải hiện ngay cho caller | yes | no |
| side effect fan-out / batch / provider API chậm | no | yes |

## Non-goals

- Không dùng BullMQ chỉ vì “kiến trúc enterprise”.
- Không queue hóa canonical writes.
- Không mở queue trước khi `Valkey` health, split DB, và observability path sẵn sàng.
- Không để mỗi module tự tạo queue name ngoài shortlist nếu chưa cập nhật file này và `BULLMQ_WORKER_ARCHITECTURE.md`.
