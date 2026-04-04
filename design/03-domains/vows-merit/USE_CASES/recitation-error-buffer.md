# Bổ Khuyết Chân Ngôn Cuối Buổi — Recitation Error Buffer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi niệm kinh, người tu có thể lỡ phát âm sai hoặc bỏ sót chữ. Ở cuối mỗi buổi thực hành — bao gồm cả sau khi niệm NNN — nên niệm **Bổ Khuyết Chân Ngôn** (Bu Que Zhen Yan / Mantra for Rectifying Errors) từ **3 đến 7 biến** để vá lại các lỗi sai trong quá trình đọc.

Đây là task **tùy chọn** (optional) — không bắt buộc như Thất Phật Diệt Tội ở Phase 8, nhưng xuất hiện ở **2 context** khác nhau: sau Daily Practice và sau mỗi NNN session.

---

## Owner module

`vows-merit` — DailyPracticeSession + LittleHouse chanting session
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hoàn thành buổi niệm kinh hoặc NNN session
- `system` — inject optional task card, không block completion

---

## Trigger Points

| Context | Trigger | Hiển thị khi nào |
|---|---|---|
| Daily Practice | User bấm [Hoàn thành tất cả thời khóa] | Sau core tasks complete |
| NNN Session | User hoàn thành đủ số biến NNN của 1 tấm | Sau khi count đạt target |

---

## Business Rules

| Thuộc tính | Giá trị |
|---|---|
| Loại task | **Optional** — không ảnh hưởng completion status |
| Số biến | **3 đến 7** — user tự chọn trong range |
| Lời khấn | **Có thể có** — khác với Thất Phật Diệt Tội (không có lời khấn) |
| Bỏ qua | Được — không penalty |
| Xuất hiện ở NNN | Sau mỗi tấm hoàn thành |

---

## Write Path

```
POST /api/vows-merit/practice-sessions/:id/error-buffer-log
────────────────────────────────────────────────────────────
Body: {
  context:  "DAILY_PRACTICE" | "LITTLE_HOUSE"
  count:    number   // 3..7
  skipped:  boolean
}

1. Validate count ∈ [3, 7] nếu skipped = false.
2. Tạo RecitationErrorBufferLog:
   {
     userId, sessionId, context,
     count: skipped ? 0 : count,
     skipped,
     loggedAt: now()
   }
3. Return { acknowledged: true }.
```

---

## FE Behavior

### Context A — Sau Daily Practice

Card xuất hiện sau khi core tasks complete (tương tự Thất Phật ở `daily-purification-finisher.md`, nhưng card riêng biệt):

```
┌──────────────────────────────────────────────────────────┐
│  [Tùy chọn] Bổ Khuyết Chân Ngôn                        │
│                                                          │
│  Niệm 3–7 biến để vá lại các lỗi phát âm              │
│  sai sót trong quá trình đọc kinh hôm nay.             │
│                                                          │
│  Số biến: [3] [4] [5] [6] [7]  ← toggle buttons        │
│           (mặc định: 3)                                 │
│                                                          │
│  [Đã niệm]          [Bỏ qua lần này]                   │
└──────────────────────────────────────────────────────────┘
```

### Context B — Sau mỗi tấm NNN

Card nhỏ hơn, inline dưới confirmation:

```
┌──────────────────────────────────────────────────────────┐
│  ✅ Đã hoàn thành tấm NNN #3                           │
│                                                          │
│  [Tùy chọn] Niệm 3–7 biến Bổ Khuyết Chân Ngôn?        │
│                                                          │
│  [Có, 3 biến]  [Có, 7 biến]  [Bỏ qua]                 │
└──────────────────────────────────────────────────────────┘
```

### Thứ tự card cuối buổi (Daily Practice)

Nếu cả Thất Phật Diệt Tội và Bổ Khuyết Chân Ngôn đều xuất hiện, thứ tự:
1. **Bổ Khuyết Chân Ngôn** (vá lỗi trước)
2. **Thất Phật Diệt Tội** (thanh lọc nghiệp tổng quát sau)

---

## Schema Notes

```prisma
model RecitationErrorBufferLog {
  id         String   @id @default(cuid())
  userId     String
  sessionId  String   // FK to DailyPracticeSession hoặc LittleHouseBurnSession
  context    String   // "DAILY_PRACTICE" | "LITTLE_HOUSE"
  count      Int      @default(0)
  skipped    Boolean  @default(false)
  loggedAt   DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `recitation.error-buffer.completed` | User niệm và log count |
| `recitation.error-buffer.skipped` | User bấm [Bỏ qua] |

---

## Phân Biệt Với Thất Phật Diệt Tội

| | Bổ Khuyết Chân Ngôn | Thất Phật Diệt Tội |
|---|---|---|
| Mục đích | Vá lỗi phát âm sai | Thanh lọc nghiệp trong ngày |
| Số biến | 3–7 (range) | 3 (cố định) |
| Lời khấn | Được phép | **Không có** |
| Context | Daily + sau mỗi NNN | Daily only |
| Thứ tự | Trước | Sau |

---

## Related

- [daily-purification-finisher.md](./daily-purification-finisher.md) — Thất Phật Diệt Tội (khác biệt quan trọng)
- [recitation-time-weather-guard.md](./recitation-time-weather-guard.md) — Guards cho buổi niệm chính
- [little-house-burn-physical-checks.md](../../engagement/USE_CASES/little-house-burn-physical-checks.md) — NNN session flow
