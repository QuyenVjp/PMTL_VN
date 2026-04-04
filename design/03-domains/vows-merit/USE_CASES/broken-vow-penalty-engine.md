# Bộ Máy Phạt Thất Nguyện — Broken Vow Penalty Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Thất nguyện gây ra nợ nghiệp nhân lên nhiều lần. Hệ thống tự động phát hiện lời nguyện hết hạn chưa hoàn thành, đánh dấu "Thất Nguyện", khóa tạo nguyện mới, và bắt buộc chu kỳ sám hối 49 lần trước khi được tạo nguyện tiếp.

---

## Owner module

`vows-merit` — VowService / PenaltyEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thất nguyện, phải hoàn thành sám hối
- `system` — cron phát hiện, khóa vow-making, inject task sám hối

---

## Trigger

Cron `0 0 * * *` (00:01 AM) — scan tất cả vow có deadline = hôm qua với progress < 100%.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Vow deadline = hôm qua + progress < 100% | ❌ Mark status = BROKEN_VOW |
| Vow đánh dấu BROKEN_VOW | ✅ Disable `[Phát Nguyện Mới]` button |
| Broken vow flagged | ✅ Auto-create repentance task: Lễ Phật 49x |
| Repentance task active | ⏳ Lock vow-making cho đến khi hoàn thành |
| User hoàn thành 49 biến + pledge | ✅ Mark repentance DONE |
| Repentance DONE | ✅ Re-enable vow-making |

---

## Input Contract

```typescript
// Repentance completion API:
interface VowRepentanceCompleteDto {
  brokenVowId: string
  repentanceSessionId: string
  completedCount: number    // Phải = 49
  pledgeRecited: boolean    // Phải = true
}
```

---

## Write Path

```
CRON: 00:01 daily
1. SELECT vows WHERE deadline < today AND progress < 1.0 AND status = ACTIVE
2. For each vow:
   → UPDATE status = BROKEN_VOW, brokenAt = now()
   → Disable [Phát Nguyện Mới] for userId (flag on profile)
   → Create RepentanceTask: sutraId = LE_PHAT_DAI_SAM_HOI, targetCount = 49

POST /api/vows-merit/vows/repentance/complete
1. Validate completedCount = 49
2. Validate pledgeRecited = true
3. UPDATE RepentanceTask: status = COMPLETED
4. UPDATE UserProfile: vowMakingLocked = false
5. Audit: vow.repentance_completed
```

---

## FE Behavior

```
Trạng thái Lời Nguyện:

🔴 THẤT NGUYỆN
─────────────────────────────────
Tên nguyện: Ăn chay 30 ngày
Hạn hoàn thành: 31/03/2026
Tiến độ: 18/30 ngày ❌

─────────────────────────────────
⚠️ Bạn cần hoàn thành sám hối trước
   khi được phát nguyện mới:

Nhiệm vụ bắt buộc:
🔒 Lễ Phật Đại Sám Hối Văn × 49 lần
   [Tiến độ: 23/49]

[Bắt Đầu Sám Hối]

─────────────────────────────────
[Phát Nguyện Mới]  ← LOCKED 🔒
"Hoàn thành sám hối trước"
```

---

## Schema Notes

```prisma
model Vow {
  // ... existing fields ...
  status      VowStatus @default(ACTIVE)
  brokenAt    DateTime?
  // Migration: ALTER TABLE "Vow" ADD COLUMN "brokenAt" TIMESTAMP
}

enum VowStatus {
  ACTIVE
  FULFILLED
  BROKEN_VOW
  RESOLVED
}

model RepentanceTask {
  id              String   @id @default(cuid())
  userId          String
  brokenVowId     String
  sutraId         String   // LE_PHAT_DAI_SAM_HOI
  targetCount     Int      @default(49)
  completedCount  Int      @default(0)
  pledgeRecited   Boolean  @default(false)
  status          String   @default("PENDING") // PENDING | COMPLETED
  createdAt       DateTime @default(now())
  completedAt     DateTime?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.deadline_reached` | Date check 00:01 |
| `vow.broken_vow_flagged` | Status = BROKEN_VOW |
| `vow.new_vow_making_locked` | Button disabled |
| `vow.repentance_task_created` | 49x cycle inject |
| `vow.repentance_completed` | 49 + pledge done |
| `vow.status_resolved` | Lock removed |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Tạo nguyện mới khi có BROKEN_VOW | `vow_making_locked_broken_vow` | 403 |
| completedCount ≠ 49 | `repentance_count_insufficient` | 400 |
| pledgeRecited = false | `repentance_pledge_required` | 400 |

---

## Related

- [create-vow.md](./create-vow.md) — tạo lời nguyện mới
- [sacred-object-damage-protocol.md](../../wisdom-qa/USE_CASES/sacred-object-damage-protocol.md) — protocol khác cũng inject Lễ Phật Đại Sám Hối
