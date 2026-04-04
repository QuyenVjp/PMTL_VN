# Cảnh Báo Chế Độ Đọc Thuộc Lòng — E-Reader Memorization Mode Warning

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 307, 308, 806)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc thuộc lòng kinh văn giúp kết nối tốt hơn với năng lượng. Tuy nhiên, **tuyệt đối không được niệm sót chữ, sót câu** — dù chỉ một từ bị bỏ sót cũng làm rò rỉ năng lượng kinh văn. Khi user tắt màn hình hoặc bật "Chế độ Đọc Thuộc Lòng", hệ thống phải bắn cảnh báo để nhắc nhở rủi ro này và gợi ý niệm Bổ Khuyết Chân Ngôn cuối buổi.

---

## Owner module

`content` — E-Reader / SutraReader
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — bật chế độ tắt màn hình hoặc đọc thuộc lòng
- `system` — hiển thị flash warning một lần khi activate mode

---

## Trigger

User bấm **[Tắt màn hình / Đọc Thuộc Lòng]** hoặc **[Ẩn văn bản]** trong E-Reader khi đang đọc kinh văn (`isSacredText = true`).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User bật memorization mode trên sacred text | Flash warning → confirm → mode activate |
| User bật memorization mode trên non-sacred content | Không hiện warning |
| User đang đọc Pinyin / phiên âm | Warning vẫn áp dụng nếu ẩn văn bản |

---

## FE Behavior

### Flash Warning khi Activate Memorization Mode

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️  Chế Độ Đọc Thuộc Lòng                             │
│                                                          │
│  Đọc thuộc lòng giúp kết nối sâu hơn với năng lượng   │
│  kinh văn. Tuy nhiên hãy lưu ý:                       │
│                                                          │
│  • Nếu lỡ BỎ SÓT một từ, năng lượng kinh văn sẽ      │
│    bị rò rỉ và buổi tụng giảm hiệu quả.               │
│                                                          │
│  • Nếu chưa thuộc 100%, hãy MỞ VĂN BẢN để đọc        │
│    theo — tốt hơn là đọc thuộc nhưng bị sót chữ.     │
│                                                          │
│  • Cuối buổi, nhớ niệm Bổ Khuyết Chân Ngôn          │
│    (3–7 biến) để vá lại các lỗi có thể xảy ra.       │
│                                                          │
│  [Tôi đã thuộc — Tiếp tục]    [Mở văn bản lại]       │
└──────────────────────────────────────────────────────────┘
```

- **[Tôi đã thuộc — Tiếp tục]**: Ẩn văn bản, activate memorization mode.
- **[Mở văn bản lại]**: Dismiss modal, giữ nguyên text hiển thị.
- Modal không có nút X / dismiss bằng tap outside — user phải chọn 1 trong 2.

### Sau khi kết thúc session ở Memorization Mode

Inject reminder nhỏ vào post-session card (tích hợp với `recitation-error-buffer.md`):

```
💡  Bạn vừa đọc thuộc lòng. Nhớ niệm Bổ Khuyết
    Chân Ngôn (3–7 biến) để vá các lỗi phát âm.
```

---

## Write Path

Không cần API mới — memorization mode là **client-side state** (`sessionStorage`). Chỉ log audit khi user activate:

```
POST /api/content/sutra-reader/memorization-mode-activated
────────────────────────────────────────────────────────────
Body: { sutraId: string, warningAcknowledged: boolean }

1. Validate warningAcknowledged = true.
2. Insert MemorizationModeLog { userId, sutraId, activatedAt: now() }.
3. Audit: sutra.memorization-mode.activated
```

---

## Schema Notes

```prisma
model MemorizationModeLog {
  id                   String   @id @default(cuid())
  userId               String
  sutraId              String
  warningAcknowledged  Boolean
  activatedAt          DateTime @default(now())

  user                 User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `sutra.memorization-mode.activated` | User xác nhận và bật mode |
| `sutra.memorization-mode.cancelled` | User chọn "Mở văn bản lại" |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `warningAcknowledged` = false | `warning_not_acknowledged` | 422 |
| `sutraId` không tồn tại | `not_found` | 404 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Warning chỉ hiện **1 lần per session per sutra** — dùng `sessionStorage` key `memorization_warned_${sutraId}`.
- Không block user nếu họ chọn [Tôi đã thuộc] — chỉ warn, không gate.
- Post-session reminder tích hợp với `recitation-error-buffer.md` flow đã có.

---

## Related

- [recitation-error-buffer.md](../../vows-merit/USE_CASES/recitation-error-buffer.md) — Bổ Khuyết Chân Ngôn sau tụng
- [ereader-hand-hygiene-gate.md](./ereader-hand-hygiene-gate.md) — Pre-reading hygiene gate
- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Anti-face-down bookmark rule
