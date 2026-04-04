# Chống Giả Mạo Giờ Âm Khi Offline — Yin-Time Anti-Spoofing Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ghi nhận offline tạo rủi ro giả mạo timestamp: user có thể chỉnh đồng hồ thiết bị để bypass deadzone 2–5 AM. Hệ thống validate toàn bộ sự kiện offline khi sync bằng server clock và phân tích delta-time.

---

## Owner module

`content` — SyncService / OfflineTrustEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — ghi nhận offline, sync khi có mạng
- `system` — server-side validate toàn bộ batch, từ chối vi phạm

---

## Trigger

Khi app online sau khoảng offline và gửi sync batch lên server.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| App offline | ✅ Log tụng niệm vào IndexedDB với client timestamp |
| App online lại | ✅ POST `/api/engagement/sync` với full batch |
| Backend validate timestamps | ✅ So sánh với server time |
| Timestamps phát hiện trong 02:00–05:00 | ❌ Reject toàn bộ batch |
| Delta time > 4 giờ | ⚠️ Flag suspicious, yêu cầu user xác nhận |
| Batch clean | ✅ Accept + persist |

---

## Input Contract

```typescript
interface SyncBatch {
  userId: string
  events: OfflineRecitationEvent[]
  lastSyncAt: Date
  clientTimeRange: { earliest: Date; latest: Date }
  estimatedTimeDrift: number  // milliseconds
}

interface OfflineRecitationEvent {
  id: string
  sutraId: string
  localTimestamp: Date
  count: number
  clientVersion: string
}
```

---

## Write Path

```
POST /api/engagement/sync
1. Parse batch.events
2. Yin-time check:
   events.filter(e => getLocalHour(e.localTimestamp, user.timezone) in [2..4])
   → If violations.length > 0: reject ENTIRE batch, return 403

3. Time drift check:
   drift = |serverNow - batch.clientTimeRange.latest|
   → If drift > 4h: flag batch, return 200 + { status: 'FLAGGED', requiresConfirmation: true }

4. If clean: persist all events, return 200 { accepted: n }
```

---

## FE Behavior

```
🚫 SYNC THẤT BẠI: YIN-TIME VIOLATION

Phát hiện tụng niệm trong giờ cấm 2–5 AM:

Bài: Đại Bi Chú (7 biến)
Giờ: 02:47 AM  ← forbidden

Toàn bộ batch bị từ chối để bảo vệ trường khí.

─────────────────────────────────────
✅ Giải pháp:
Tụng lại vào giờ đúng, sau đó sync lại.

[Tụng Lại]   [Bỏ Qua Vi Phạm Này]
```

---

## Schema Notes

```prisma
model SyncBatchAudit {
  id              String   @id @default(cuid())
  userId          String
  status          String   // ACCEPTED | REJECTED_YIN | FLAGGED_DRIFT
  eventCount      Int
  rejectedCount   Int      @default(0)
  timeDriftHours  Float?
  syncedAt        DateTime @default(now())
  // Migration: CREATE TABLE "SyncBatchAudit" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `sync.offline_batch_received` | User comes online |
| `sync.yin_time_violation_detected` | Timestamps in 2–5 AM |
| `sync.batch_rejected` | Violation confirmed |
| `sync.time_drift_flagged` | Delta > 4h |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Timestamps trong 2–5 AM | `yin_time_violation_in_offline_sync` | 403 |
| Time drift quá lớn | `suspicious_time_drift_detected` | 200 (flagged) |

---

## Related

- [yin-time-deadzone-2-5am.md](../../calendar/USE_CASES/yin-time-deadzone-2-5am.md) — online deadzone guard
