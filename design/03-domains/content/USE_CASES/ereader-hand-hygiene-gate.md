# Cổng Vệ Sinh Tay Trước Khi Đọc Kinh — E-Reader Hand Hygiene Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc ứng xử với Kinh sách (勿以口水沾指翻经页)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kinh Phật là Pháp bảo — ứng xử với kinh trên thiết bị điện tử phải nghiêm túc như sách giấy. Ba quy tắc vệ sinh bắt buộc trước khi đọc:

1. **Rửa tay sạch** trước khi chạm vào kinh.
2. **Tuyệt đối không dùng nước bọt** dính vào ngón tay để vuốt màn hình chuyển trang (勿以口水沾指翻经页).
3. **Không để thiết bị thấp hơn thắt lưng** khi đang đọc kinh — tương đương không kẹp sách dưới nách hay để dưới đất.

Hệ thống block nội dung kinh văn cho đến khi user xác nhận đủ 3 điều kiện.

---

## Owner module

`content` — E-Reader / SutraReader
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — mở E-Reader để đọc kinh
- `system` — hiển thị pre-reading modal, block content cho đến khi xác nhận

---

## Trigger

User mở bất kỳ **Kinh văn / Sutra PDF** trong E-Reader. Không áp dụng cho: hướng dẫn thông thường, bài viết blog, FAQ.

---

## Business Rule

| Điều kiện | Content hiển thị |
|---|---|
| Chưa xác nhận 3 checkbox | **Ẩn hoàn toàn** nội dung kinh — chỉ hiện modal |
| Đã xác nhận đủ | Hiển thị nội dung kinh bình thường |

**Session-scoped:** Modal chỉ hiện **1 lần mỗi app session** cho mỗi sutra. Nếu user đọc cùng kinh trong cùng session, không hiện lại. Nếu đóng app hoàn toàn và mở lại → hiện lại.

---

## Pre-Reading Modal

```
┌──────────────────────────────────────────────────────────┐
│  📿  Trước Khi Đọc Kinh — Xác Nhận                     │
│                                                          │
│  Kinh Phật là Pháp bảo. Hãy xác nhận trước khi đọc:   │
│                                                          │
│  [_] Tôi đã rửa tay sạch sẽ.                          │
│                                                          │
│  [_] Tôi KHÔNG dùng nước bọt dính vào tay             │
│      để vuốt màn hình chuyển trang kinh.               │
│      💡 (勿以口水沾指翻经页)                            │
│                                                          │
│  [_] Thiết bị đang được cầm cao hơn thắt lưng.        │
│      💡 Không để kinh thấp hơn thắt lưng, dưới        │
│         đất hoặc kẹp dưới nách.                        │
│                                                          │
│  [Đã xác nhận — Đọc kinh]  ← disabled cho đến khi     │
│                                tích đủ 3 ô             │
└──────────────────────────────────────────────────────────┘
```

- Modal không thể dismiss bằng tap outside hoặc back button.
- Nút [Đã xác nhận — Đọc kinh] chỉ enable khi cả 3 checkbox tích.
- Không có nút "Bỏ qua" hay "Nhắc sau".

---

## Write Path

```
POST /api/content/sutra-reader/hygiene-confirm
───────────────────────────────────────────────
Body: {
  sutraId:              string
  hasWashedHands:       boolean
  willNotUseSaliva:     boolean
  deviceAboveWaist:     boolean
}

1. Validate tất cả 3 booleans = true.
   - Nếu bất kỳ false → throw 422 {
       error: "hygiene_checklist_incomplete",
       message: "Phải xác nhận đủ 3 điều kiện vệ sinh trước khi đọc kinh."
     }
2. Ghi SutraReadingSession:
   {
     userId, sutraId,
     hygieneConfirmedAt: now(),
     sessionId: uuid()   // dùng để track session scope
   }
3. Return { sessionToken: jwt_short_lived(sutraId, userId, exp: +4h) }
   FE dùng token này để authorize render nội dung.
```

### FE Session Caching

```typescript
// sessionStorage (cleared on tab close)
const HYGIENE_KEY = `hygiene_confirmed_${sutraId}`
sessionStorage.setItem(HYGIENE_KEY, "true")

// Khi mở E-Reader:
if (sessionStorage.getItem(HYGIENE_KEY)) {
  // Skip modal, render trực tiếp
} else {
  // Hiện modal
}
```

Không dùng `localStorage` — phải reset mỗi session mới.

---

## Scope — Các Loại Nội Dung Áp Dụng

| Loại nội dung | Cần hygiene gate? |
|---|---|
| Kinh văn (Sutras, Chú) | ✅ YES |
| Tiểu Phương Tử template | ✅ YES |
| Kinh Văn Tự Tu PDF | ✅ YES |
| Hướng dẫn thông thường | ❌ NO |
| Bài viết / Blog / FAQ | ❌ NO |
| Đơn từ tâm linh (PDF) | ✅ YES |

Phân biệt qua `contentType` flag trên `MediaAsset` hoặc `BeginnerGuide.isSacredText: boolean`.

---

## Schema Notes

```prisma
model SutraReadingSession {
  id                    String    @id @default(cuid())
  userId                String
  sutraId               String
  hygieneConfirmedAt    DateTime
  sessionStartedAt      DateTime  @default(now())
  sessionEndedAt        DateTime?

  user                  User      @relation(fields: [userId], references: [id])

  @@index([userId, sutraId])
}

// Thêm vào MediaAsset hoặc BeginnerGuide:
model BeginnerGuide {
  // ... existing ...
  isSacredText          Boolean   @default(false)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `sutra.hygiene-gate.shown` | Modal xuất hiện |
| `sutra.hygiene-gate.confirmed` | User xác nhận đủ 3 ô |
| `sutra.hygiene-gate.skipped-cached` | Session cache hit, modal skip |
| `sutra.reading.started` | Nội dung được render |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Bất kỳ checkbox nào = false | `hygiene_checklist_incomplete` | 422 |
| `sutraId` không tồn tại | `not_found` | 404 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Session token JWT short-lived (4h) để authorize render — tránh user bypass bằng cách gọi API content trực tiếp.
- `sessionStorage` là đủ cho Phase 1 — không cần lưu DB per-page-view. `SutraReadingSession` chỉ lưu lần đầu mỗi sutra per session để analytics.
- Phase 2+: Nếu app có biometric lock, hygiene confirmation có thể combine với biometric để tăng solemnity.
- Component `SutraReader` nhận prop `requiresHygieneGate: boolean` — true với sacred text, false với guides.

---

## Related

- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Digital bookmark + print guide anti-face-down rule
- [spiritual-applications.md](./spiritual-applications.md) — PDF đơn từ (cũng là sacred content)
