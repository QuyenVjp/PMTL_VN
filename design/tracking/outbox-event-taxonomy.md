# Outbox Event Taxonomy (Phân loại sự kiện Outbox)

File này trả lời: **event nào đủ quan trọng để đi qua `outbox_events`**, và event nào có thể sync/fire-and-forget.

Không có doc này, developer không biết khi nào cần outbox và khi nào không — dẫn đến:
- dùng outbox thừa (over-engineering phase 1)
- hoặc bỏ outbox cho event quan trọng (mất reliability)

> **Nhắc lại từ DECISIONS.md**: `outbox_events` là deferred, chỉ bật khi side effect đủ chậm hoặc failure cost đủ cao.
> File này chuẩn bị taxonomy để khi bật, không phải đoán lại.

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

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `identity.user.blocked` | Admin block account | Sessions → revoke all sessions | **outbox required** |
| `identity.user.unblocked` | Admin unblock | (log only) | sync acceptable |
| `identity.role.changed` | Role promotion/demotion | Audit log | sync acceptable |

---

### Content module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `content.post.published` | Admin publish post | Search → reindex | **outbox required** (phase 2+ Meilisearch) |
| `content.post.unpublished` | Admin unpublish | Search → deindex; Calendar → invalidate advisory cache | **outbox required** |
| `content.post.deleted` | Soft delete | Search → deindex | **outbox required** |
| `content.chant_item.published` | Publish chant item | Search → reindex | **outbox required** (phase 2+) |
| `content.media.uploaded` | Upload complete | Storage → scan (phase 2+) | planned |

---

### Community module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `community.post.submitted` | Member submit post | Moderation → intake alert | **outbox required** |
| `community.comment.submitted` | Member submit comment | Moderation → intake alert (if flagged) | **outbox required** if flagged |
| `community.guestbook.submitted` | Guest submit guestbook | Moderation → approval queue | **outbox required** |

---

### Moderation module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `moderation.report.resolved` | Admin resolve | Community → summary sync; Notification → alert author/reporter | **outbox required** |
| `moderation.content.hidden` | Admin hide content | Community → isHidden sync | **outbox required** |
| `moderation.guestbook.approved` | Admin approve guestbook | Community → publish | **outbox required** |

---

### Calendar module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `calendar.event.published` | Admin publish event | Notification → schedule reminder candidates | **outbox required** |
| `calendar.event.updated` | Admin update event | personalPracticeCalendarReadModel → rebuild for affected users | **outbox required** |
| `calendar.advisory.refreshed` | Daily cron or manual | (downstream consumers read on-demand) | sync acceptable |

---

### Notification module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `notification.push_job.dispatched` | Calendar/Vow trigger | Worker → delivery | **outbox required** (when worker enabled) |

---

### Vows & Merit module

| Event type | Trigger | Downstream subscriber | Mode |
|---|---|---|---|
| `vow.created` | Member create vow | Calendar → reminder schedule candidate | **outbox required** |
| `vow.milestone.fulfilled` | Member log milestone | Notification → acknowledgement (optional) | **outbox required** |
| `vow.completed` | All milestones done | Audit; Notification → optional completion alert | **outbox required** |
| `vow.life_release.created` | Member/admin log life release | (self-contained, no fan-out) | sync acceptable |

---

### Wisdom-QA module

| Event type | Trigger | Downstream subscriber | Mode |
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
- `payload` phải có Zod schema riêng per `eventType` — không để untyped
- `occurredAt` là thời điểm business event xảy ra, không phải thời điểm write vào outbox table

---

## Phase 1 fallback behavior (Hành vi dự phòng giai đoạn 1)

Khi outbox chưa bật (phase 1), các event "outbox required" phải xử lý theo 1 trong 2 cách:

| Cách | Mô tả | Phù hợp khi |
|---|---|---|
| **Inline sync** | Gọi subscriber service trực tiếp trong cùng request | Side effect nhanh và ít fan-out |
| **Fire-and-forget với log** | Gọi async không await nhưng log đầy đủ | Side effect không block UX và failure acceptable tạm thời |

Không được **im lặng bỏ qua** side effect mà không log.
Không được **làm giả** outbox (tạo outbox table rỗng chỉ để "có") — deferred nghĩa là chưa bật.

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
