# Chống Úp Ngược Kinh Sách — E-Reader Anti-Face-Down & Bookmark Rule

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Theo PMTL, sách kinh vật lý có những giới luật:
- **Cấm úp ngược mặt sách xuống bàn** (hình chữ Nhân — 人) — được coi là bất kính với Phật, Bồ Tát.
- **Cấm gấp mép trang** — làm tổn hại đến năng lượng của kinh văn.

Ứng dụng e-reader phải chiếu lệ tương đương:
- Bắt buộc có **Digital Bookmark** để user không cần "gấp mép".
- Khi user thoát app hoặc minimize khi đang mở kinh, bắn **Toast/Reminder** nhắc dùng bookmark.

---

## Owner module

`content` — e-reader và kinh văn catalog
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang đọc kinh trên ứng dụng
- `system` — detect exit intent, bắn toast, ghi bookmark state

---

## Triggers

1. User **vuốt ra / minimize** app khi đang có ChantingText/SutraReader mở.
2. User **navigate away** khỏi trang đọc kinh (back button, tab switch).
3. User bấm **[Thoát đọc kinh]** (explicit exit).

---

## Business Rules

| Rule | Mô tả | Severity |
|---|---|---|
| Bookmark required on exit | Khi thoát mà chưa bookmark → toast cảnh báo | WARN |
| No face-down equivalent | App không được tự động minimize kinh text mà không xác nhận | INFO |
| Bookmark persisted | Bookmark phải được lưu server-side, không chỉ localStorage | REQUIRED |
| Re-open restores position | Khi mở lại phải tự động mở đúng trang đã bookmark | REQUIRED |

---

## Feature: Digital Bookmark

### Bookmark Actions

```
POST /api/content/sutra-bookmarks
{
  sutraId:    string   // ID của kinh văn
  pageIndex:  number   // trang hoặc đoạn đang đọc
  lineIndex?: number   // dòng cụ thể (nếu app hỗ trợ)
  note?:      string   // ghi chú tùy chọn, max 200 chars
}

GET /api/content/sutra-bookmarks/:sutraId
→ trả về bookmark hiện tại của user cho sutra đó

DELETE /api/content/sutra-bookmarks/:sutraId
→ xóa bookmark (khi user hoàn thành toàn bộ kinh)
```

### Bookmark Data Model

```prisma
model SutraBookmark {
  id          String   @id @default(cuid())
  userId      String
  sutraId     String
  pageIndex   Int
  lineIndex   Int?
  note        String?
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, sutraId])
}
```

---

## Feature: Exit Intent Toast

### Khi user cố thoát mà chưa bookmark:

```
Toast message (bottom sheet, không tự tắt):
┌────────────────────────────────────────────────┐
│  📖  Hãy dùng Bookmark trước khi thoát        │
│                                                │
│  Luật PMTL: cấm úp ngược sách hoặc gấp mép   │
│  trang kinh. Bookmark = đánh dấu trang đúng   │
│  cách trong pháp môn kỹ thuật số.             │
│                                                │
│  [Đánh dấu trang]     [Thoát không lưu]        │
└────────────────────────────────────────────────┘
```

- **[Đánh dấu trang]**: gọi `POST /api/content/sutra-bookmarks` với position hiện tại rồi exit.
- **[Thoát không lưu]**: cho phép thoát nhưng ghi audit `sutra.exit-without-bookmark`.
- Toast không tự tắt — user phải chọn một trong hai.

### Trigger logic (FE)

```
// Khi detect exit intent:
if (currentPage.isSutraReader && !hasBookmarkedCurrentSutra) {
  showExitIntentBottomSheet()
  event.preventDefault()  // chặn navigation
}
```

### Khi mở lại kinh đã có bookmark:

- Tự động scroll/navigate đến `pageIndex` đã lưu.
- Hiện toast nhỏ: `"Tiếp tục từ trang [X] — đã lưu lần trước."`

---

## API Endpoints Summary

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/content/sutra-bookmarks` | Tạo hoặc cập nhật bookmark |
| `GET` | `/api/content/sutra-bookmarks/:sutraId` | Lấy bookmark hiện tại |
| `DELETE` | `/api/content/sutra-bookmarks/:sutraId` | Xóa bookmark (hoàn thành) |
| `GET` | `/api/content/sutra-bookmarks` | Tất cả bookmark của user |

---

## Audit

| Action | Trigger |
|---|---|
| `sutra.bookmark.saved` | User lưu bookmark |
| `sutra.bookmark.restored` | App tự động navigate về bookmark khi mở lại |
| `sutra.exit-without-bookmark` | User chọn [Thoát không lưu] |
| `sutra.exit-with-bookmark` | User chọn [Đánh dấu trang] rồi thoát |

---

## Notes for AI/codegen

- `SutraBookmark` dùng `@@unique([userId, sutraId])` — mỗi user chỉ có 1 bookmark active per sutra (upsert pattern).
- Exit intent detection trên mobile cần dùng `visibilitychange` event + `pagehide` event, không chỉ `beforeunload`.
- Bookmark KHÔNG được lưu chỉ trong `localStorage` — phải sync lên server để khôi phục khi đổi thiết bị.
- Toast component phải có `z-index` cao nhất, không bị che bởi navigation bar.
- Phase 2+: nếu user thoát mà không bookmark 3 lần liên tiếp → hiện in-app reminder nhẹ nhàng hơn (không chặn mạnh, tránh annoy user).

---

## Related

- [spiritual-applications.md](./spiritual-applications.md) — Đơn từ tâm linh (cũng có quy tắc không đốt/không hủy)
- [publish-beginner-guide.md](./publish-beginner-guide.md) — Canonical guide content management
