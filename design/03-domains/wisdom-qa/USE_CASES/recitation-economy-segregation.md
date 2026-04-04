# Phân Tách Kinh Bài Tập & Ngôi Nhà Nhỏ — Recitation Economy Segregation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kinh Bài Tập hàng ngày là "huệ lương" (lương thực huệ mạng), còn Ngôi Nhà Nhỏ là "tiền trả nợ" (trả nợ nghiệp). Hai nguồn này tuyệt đối **KHÔNG ĐƯỢC TRỘN LẪN**. Cộng dồn sẽ làm sai lệch cả hai luồng năng lượng, vi phạm nguyên tắc phân ly năng lượng.

---

## Owner module

`wisdom-qa` — RecitationService / SegmentationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tụng kinh, ghi nhận số lượng tụng
- `system` — ghi nhận riêng biệt, phát hiện và chặn hành vi trộn lẫn

---

## Trigger

Khi user ghi nhận số lần tụng kinh hoặc số tấm Ngôi Nhà Nhỏ trên dashboard.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User ghi nhận tụng kinh hàng ngày | ✅ Increment `DailyCounter` only |
| User điền số tấm NNN | ✅ Increment `LittleHouseCounter` only |
| Có hành vi chuyển đổi giữa 2 counter | ❌ REJECTED — 400 + hiển thị cảnh báo phân tách |
| UI drag-drop transfer bị kéo | ❌ Disable, hiển thị tooltip giải thích |
| Cả hai counter hiển thị Dashboard | ✅ Hiển thị song song, màu sắc khác nhau |

---

## Input Contract

```typescript
// Daily recitation log
interface DailyRecitationLogDto {
  sutraId: string
  count: number       // ONLY goes to DailyCounter
  counterType: 'DAILY_RECITATION' // MUST be explicit
}

// Little House log (separate endpoint)
interface LittleHouseLogDto {
  sheetId: string
  count: number       // ONLY goes to LittleHouseCounter
  counterType: 'LITTLE_HOUSE' // MUST be explicit
}
```

---

## Write Path

```
POST /api/wisdom-qa/recitation/log
1. Validate counterType ∈ ['DAILY_RECITATION', 'LITTLE_HOUSE']
2. If counterType = DAILY_RECITATION:
   → Update DailyRecitationCounter for userId + date
3. If counterType = LITTLE_HOUSE:
   → Update LittleHouseCounter for userId + sheetId
4. FORBIDDEN: Any API that reads from one and writes to the other
5. Return updated counter with type label
```

---

## FE Behavior

```
Dashboard — Phân Tách 2 Quỹ:

[Bài Tập Hàng Ngày]      [Ngôi Nhà Nhỏ]
(Màu Xanh / Blue)        (Màu Vàng / Gold)

📊 Chúng Thực Tụng:      📋 Trả Nợ:
████████░░ (800/1000)    ████░░░░░░ (125/500)

Nếu kéo thả từ ô này sang ô kia:
→ Tooltip: "Kinh bài tập là để nuôi dưỡng huệ mạng.
            NNN là để trả nợ.
            Luật PMTL cấm cộng dồn 2 quỹ này."
→ Drag disabled, không thực hiện transfer.
```

---

## Schema Notes

```prisma
model RecitationLog {
  id          String   @id @default(cuid())
  userId      String
  sutraId     String?
  count       Int
  counterType RecitationCounterType // DAILY_RECITATION | LITTLE_HOUSE
  loggedAt    DateTime @default(now())
  // ... existing fields ...
}

enum RecitationCounterType {
  DAILY_RECITATION
  LITTLE_HOUSE
}
// Migration: ALTER TABLE "RecitationLog" ADD COLUMN "counterType" TEXT NOT NULL
```

---

## Audit

| Action | Trigger |
|---|---|
| `recitation.daily_counter_incremented` | Daily recitation logged |
| `recitation.lh_counter_incremented` | Little House tấm logged |
| `recitation.transfer_attempt_blocked` | Phát hiện vi phạm phân tách |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Transfer giữa 2 loại counter | `recitation_counter_commingling_forbidden` | 400 |
| counterType không hợp lệ | `invalid_counter_type` | 422 |

---

## Notes for AI/codegen

- `DailyCounter` và `LittleHouseCounter` phải là **separate DB columns** hoặc separate records được lọc bằng `counterType`.
- Không dùng một integer field duy nhất cho cả hai — dễ bị cộng nhầm.
- Dashboard FE phải enforce hai màu sắc khác nhau rõ ràng để tránh nhầm lẫn visual.

---

## Related

- [daily-recitation-system.md](./daily-recitation-system.md) — core recitation tracking
- [manage-ngoi-nha-nho-sheet.md](../../engagement/USE_CASES/manage-ngoi-nha-nho-sheet.md) — NNN sheet management
