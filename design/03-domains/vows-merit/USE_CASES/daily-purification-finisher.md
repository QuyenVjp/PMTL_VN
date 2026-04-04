# Thanh Lọc Cuối Ngày — Daily Purification Finisher (Thất Phật Diệt Tội Chân Ngôn)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Sau khi hoàn thành toàn bộ bài tập hàng ngày, người tu **có thể** (tùy chọn) niệm **Thất Phật Diệt Tội Chân Ngôn 3 biến** để gột rửa những nghiệp chướng nhỏ phát sinh trong ngày hôm đó.

Hai điểm đặc biệt quan trọng:
1. Đây là task **tùy chọn** (optional) — không bắt buộc như các kinh chính.
2. Task này **KHÔNG CÓ lời khấn** — không đọc nguyện vọng hay lời cầu trước khi niệm.

---

## Owner module

`vows-merit` — DailyPracticeSession / DailyRecitationLog
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hoàn thành bài tập hàng ngày, tùy chọn thêm task thanh lọc
- `system` — trigger popup sau khi detect daily tasks đã đủ, hide prayer input

---

## Trigger

Khi user **hoàn thành tất cả** kinh văn bắt buộc trong ngày (DailyPracticeSession status → `CORE_COMPLETE`).

---

## Business Rule

| Thuộc tính | Giá trị |
|---|---|
| Loại task | Optional (tùy chọn) |
| Số biến | **3 biến** cố định |
| Lời khấn | **KHÔNG CÓ** — ẩn hoàn toàn prayer/wish input |
| Thời điểm xuất hiện | Chỉ sau khi core tasks đã complete |
| Có thể bỏ qua | Có — user nhấn [Bỏ qua] |

---

## Write Path

```
// Khi DailyPracticeSession đạt CORE_COMPLETE:
POST /api/vows-merit/daily-sessions/:id/purification-finisher
──────────────────────────────────────────────────────────────
Input: { completed: boolean }  // true = đã niệm 3 biến, false = bỏ qua

1. Validate session status = CORE_COMPLETE hoặc FULLY_COMPLETE.
2. Nếu completed = true:
   a. Tạo PurificationFinisherLog:
      {
        sessionId,
        userId,
        sutra: "THAT_PHAT_DIET_TOI_CHAN_NGON",
        count: 3,
        hasPrayer: false,   // luôn false — không có lời khấn
        completedAt: now()
      }
   b. Set DailyPracticeSession.purificationFinished = true.
3. Nếu completed = false (bỏ qua):
   a. Set DailyPracticeSession.purificationSkipped = true.
4. Audit: daily-session.purification-finisher.completed hoặc .skipped.
```

---

## FE Behavior

### Popup xuất hiện sau khi core tasks xong

```
┌──────────────────────────────────────────────────────────┐
│  🌟  Bài tập hàng ngày đã hoàn thành!                   │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  [Tùy chọn] Thanh lọc nghiệp trong ngày                │
│                                                          │
│  Niệm 3 biến Thất Phật Diệt Tội Chân Ngôn              │
│  để gột rửa những nghiệp nhỏ phát sinh hôm nay.        │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │  Thất Phật Diệt Tội Chân Ngôn       │                │
│  │  "Li po li po ti..."                │                │
│  │                                     │                │
│  │  Tiến độ: [●●○]  2 / 3 biến        │                │
│  │                                     │                │
│  │           [+1 biến]                 │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ⚠️  Lưu ý: Không cần đọc lời khấn trước               │
│                                                          │
│  [Hoàn thành 3 biến]     [Bỏ qua lần này]              │
└──────────────────────────────────────────────────────────┘
```

**Quan trọng về Prayer Input:**
- **KHÔNG hiển thị** ô nhập lời khấn / nguyện vọng cho task này.
- Nếu component DailyTask mặc định có `PrayerInput`, phải truyền prop `showPrayer={false}` hoặc dùng component riêng `PurificationFinisherTask`.
- Dòng note `"⚠️ Lưu ý: Không cần đọc lời khấn trước"` phải hiển thị rõ ràng.

### Trạng thái nút

- [+1 biến]: enabled cho đến khi count = 3.
- [Hoàn thành 3 biến]: chỉ enable khi count = 3.
- [Bỏ qua lần này]: luôn enabled — không bắt buộc.

---

## Schema Notes

```prisma
model DailyPracticeSession {
  // ... existing fields ...
  purificationFinished  Boolean   @default(false)
  purificationSkipped   Boolean   @default(false)
}

model PurificationFinisherLog {
  id           String   @id @default(cuid())
  sessionId    String
  userId       String
  sutra        String   // "THAT_PHAT_DIET_TOI_CHAN_NGON"
  count        Int      // luôn = 3
  hasPrayer    Boolean  @default(false)
  completedAt  DateTime

  session      DailyPracticeSession @relation(fields: [sessionId], references: [id])
  user         User                 @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `daily-session.purification-finisher.shown` | Popup xuất hiện sau core complete |
| `daily-session.purification-finisher.completed` | User niệm đủ 3 biến |
| `daily-session.purification-finisher.skipped` | User bấm [Bỏ qua] |

---

## Notes for AI/codegen

- `hasPrayer: false` không phải field thừa — nó là bằng chứng audit rằng hệ thống đã enforce "no prayer" rule đúng cách. Audit trail sau này có thể verify.
- Popup không được tự động dismiss — user phải chủ động chọn Complete hoặc Skip.
- Trong analytics: track tỷ lệ completion vs skip để hiểu mức độ engagement với feature này.
- Task này KHÔNG tính vào daily streak hoặc vow progress — chỉ là bonus optional.

---

## Related

- [recitation-time-weather-guard.md](./recitation-time-weather-guard.md) — Time guards cho kinh chính
- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — Sutra catalog và workflow
