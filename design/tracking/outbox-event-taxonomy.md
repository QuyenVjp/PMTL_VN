# Outbox Event Taxonomy (Phân loại sự kiện Outbox)

File này trả lời: **event nào đủ quan trọng để đi qua `outbox_events`**, và event nào có thể sync/fire-and-forget.

Không có doc này, developer không biết khi nào cần outbox và khi nào không — dẫn đến:
- dùng outbox thừa (over-engineering phase 1)
- hoặc bỏ outbox cho event quan trọng (mất reliability)

> **Nhắc lại từ DECISIONS.md**: `outbox_events` là deferred, chỉ bật khi side effect đủ chậm hoặc failure cost đủ cao.
> File này chuẩn bị taxonomy để khi bật, không phải đoán lại.
> Cột `Mode` bên dưới phải được hiểu là **target mode của phase 2+**. Khi outbox chưa bật, bắt buộc áp dụng `Phase 1 fallback behavior` ở cuối file thay vì tự hiểu `"outbox required"` là phải build outbox ngay.

---

## Tiêu chí chọn outbox (Selection criteria)

Một event **cần outbox** khi đáp ứng ít nhất 1 trong các điều kiện sau:

| Tiêu chí | Ví dụ |
|---|---|
| Side effect chậm (>200ms) và không nên block request | Reindex Meilisearch sau publish |
| Failure của side effect gây ra state drift nghiêm trọng | Session revoke khi user bị block |
| Fan-out tới nhiều subscribers | Notification gửi nhiều người dùng |
| Cần delivery guarantee (at-least-once) | Moderation alert tới admin |
| Side effect xảy ra ở module khác và không được couple chặt | Community submit → Moderation intake |

Event **KHÔNG cần outbox** khi:
- đây là read operation
- side effect là logging / metrics (fire-and-forget acceptable)
- side effect xảy ra trong cùng transaction của canonical write
- phase 1 và side effect còn sync được dễ dàng

---

## Canonical outbox events (Sự kiện outbox chuẩn)

### Identity module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `identity.user.blocked` | Admin block account | Sessions → revoke all sessions | **outbox required** |
| `identity.user.unblocked` | Admin unblock | (log only) | sync acceptable |
| `identity.role.changed` | Role promotion/demotion | Audit log | sync acceptable |

---

### Content module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `content.post.published` | Admin publish post | Search → reindex | **outbox required** (phase 2+ Meilisearch) |
| `content.post.unpublished` | Admin unpublish | Search → deindex; Calendar → invalidate advisory cache | **outbox required** |
| `content.post.deleted` | Soft delete | Search → deindex | **outbox required** |
| `content.chant_item.published` | Publish chant item | Search → reindex | **outbox required** (phase 2+) |
| `content.media.uploaded` | Upload complete | Storage → scan (phase 2+) | planned |

---

### Community module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `community.post.submitted` | Member submit post | Moderation → intake alert | **outbox required** |
| `community.comment.submitted` | Member submit comment | Moderation → intake alert (if flagged) | **outbox required** if flagged |
| `community.guestbook.submitted` | Guest submit guestbook | Moderation → approval queue | **outbox required** |

---

### Moderation module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `moderation.report.resolved` | Admin resolve | Community → summary sync; Notification → alert author/reporter | **outbox required** |
| `moderation.content.hidden` | Admin hide content | Community → isHidden sync | **outbox required** |
| `moderation.guestbook.approved` | Admin approve guestbook | Community → publish | **outbox required** |

---

### Calendar module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `calendar.event.published` | Admin publish event | Notification → schedule reminder candidates | **outbox required** |
| `calendar.event.updated` | Admin update event | personalPracticeCalendarReadModel → rebuild for affected users | **outbox required** |
| `calendar.advisory.refreshed` | Daily cron or manual | (downstream consumers read on-demand) | sync acceptable |

---

### Notification module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `notification.push_job.dispatched` | Calendar/Vow trigger | Worker → delivery | **outbox required** (when worker enabled) |

---

### Vows & Merit module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `vow.created` | Member create vow | Calendar → reminder schedule candidate | **outbox required** |
| `vow.milestone.fulfilled` | Member log milestone | Notification → acknowledgement (optional) | **outbox required** |
| `vow.completed` | All milestones done | Audit; Notification → optional completion alert | **outbox required** |
| `vow.life_release.created` | Member/admin log life release | (self-contained, no fan-out) | sync acceptable |

---

### Wisdom-QA module

| Event type | Trigger | Downstream subscriber | Mode (Phase 2+ target) |
|---|---|---|---|
| `wisdom.entry.published` | Admin publish entry | Search → reindex (phase 2+) | **outbox required** (phase 2+) |
| `wisdom.bundle.rebuilt` | Delta rebuild complete | (notify affected offline clients) | planned |

---

## Event schema (Lược đồ sự kiện)

Tất cả outbox events phải tuân theo schema sau — đây là runtime contract, phải có Zod schema:

```typescript
// packages/shared/src/outbox-event.schema.ts
const OutboxEventSchema = z.object({
  eventId:       z.string().uuid(),          // unique per event instance
  schemaVersion: z.literal(1).default(1),    // version of the envelope contract
  eventType:     z.string(),                  // e.g. 'content.post.published'
  aggregateId:   z.string(),                  // publicId của entity nguồn
  aggregateType: z.string(),                  // e.g. 'post', 'vow', 'user'
  occurredAt:    z.string().datetime(),       // ISO8601, thời điểm event xảy ra
  actorUserId:   z.string().uuid().optional(), // ai trigger (null nếu là system)
  correlationId: z.string().uuid().optional(), // request correlation ID
  payload:       z.record(z.unknown()),       // module-specific data
});
```

**Rules:**
- `eventId` phải unique — dùng để idempotency check khi replay
- `aggregateId` phải là `publicId` (không dùng DB internal id)
- `payload` phải có Zod schema riêng per `eventType` — envelope này chỉ là khung chung, validation thật của payload phải resolve theo `eventType`
- `occurredAt` là thời điểm business event xảy ra, không phải thời điểm write vào outbox table
- ordering/replay order lấy từ outbox table insertion order + dispatcher policy, không encode bằng field phụ trong envelope nếu chưa có use case thật

---

## Phase 1 fallback behavior (Hành vi dự phòng giai đoạn 1)

Khi outbox chưa bật (phase 1), các event "outbox required" phải xử lý theo 1 trong 2 cách:

| Cách | Mô tả | Phù hợp khi |
|---|---|---|
| **Inline sync** | Gọi subscriber service trực tiếp trong cùng request | Side effect nhanh và ít fan-out |
| **Fire-and-forget với log + failure visibility** | Gọi async không await nhưng phải log intent, log outcome, và có retry/alert/manual-recovery path rõ | Side effect không block UX và failure acceptable tạm thời |

Không được **im lặng bỏ qua** side effect mà không log.
Không được **làm giả** outbox (tạo outbox table rỗng chỉ để "có") — deferred nghĩa là chưa bật.

### Recovery path tối thiểu cho Phase 1 fallback

Nếu chọn fire-and-forget ở phase 1, implementation tối thiểu phải có:

- log intent tại request path với `eventType`, target, correlation id
- log outcome thành công/thất bại của side effect thật
- retry nội bộ hữu hạn **hoặc** alert/manual-runbook rõ nếu retry không phù hợp
- nếu side effect thất bại vĩnh viễn, phải có nơi để operator nhìn thấy và re-run thủ công; log intent không được coi là delivery proof

Owner cho semantics này là file hiện tại; module-specific contract chỉ được siết thêm, không được nới lỏng.

---

## Idempotency requirement (Yêu cầu idempotency)

Mọi subscriber xử lý outbox event **phải** implement idempotency:
- kiểm tra `eventId` đã xử lý chưa trước khi apply
- nếu đã xử lý → return success, không apply lại
- lưu `processedEventIds` hoặc dùng `ON CONFLICT DO NOTHING` khi insert result

---

## Notes for AI/codegen

- không tự ý thêm event vào outbox nếu không có trong taxonomy này
- không bỏ qua outbox cho các event được đánh dấu "outbox required"
- payload schema phải có file Zod riêng, không inline vào service
- subscriber phải implement idempotency — không assume "chỉ gọi 1 lần"
- khi thêm event mới, phải update file này và `tracking/module-interactions.md`
