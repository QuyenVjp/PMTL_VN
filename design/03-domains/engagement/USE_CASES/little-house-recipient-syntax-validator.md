# Xác Thực Cú Pháp Trường "Kính Tặng" Tiểu Phương Tử — Little House Recipient Syntax Validator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hướng dẫn viết Tiểu Phương Tử (Nguồn 6)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trường **Kính Tặng** (offerTo) trên Tiểu Phương Tử không phải là free-text tự do. Nó có **5 khuôn mẫu cố định** (canonical templates). Viết sai khuôn mẫu sẽ khiến năng lượng đi sai đích — toàn bộ công sức niệm kinh bị vô hiệu hóa.

API và FE phải **reject free-text** và chỉ chấp nhận 5 mẫu đã được chuẩn hóa.

---

## Owner module

`engagement` — LittleHouse / NgoiNhaNho
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — điền thông tin Tiểu Phương Tử
- `system` — validate offerTo syntax, reject free-text

---

## Trigger

Bất kỳ `POST` hoặc `PUT` nào tới `LittleHouse` record có trường `offerTo`.

---

## 5 Khuôn Mẫu Hợp Lệ (Canonical Templates)

| # | Template ID | Tiếng Việt | Khi dùng |
|---|---|---|---|
| 1 | `KARMIC_CREDITOR_SELF` | `Người cần kinh của [Tên]` | Oan gia trái chủ của bản thân |
| 2 | `UNBORN_CHILD` | `Thai nhi của [Tên mẹ]` | Con chưa sinh / thai nhi bị mất |
| 3 | `DECEASED_PERSON` | `[Tên người quá cố]` | Người đã khuất (tên đầy đủ) |
| 4 | `KARMIC_CREDITOR_HOUSE` | `Người cần kinh trong ngôi nhà của [Tên]` | Oan gia trái chủ tại nhà |
| 5 | `KARMIC_RESOLUTION` | `Hóa giải oán kết của [Tên]` | Hóa giải nghiệp oán |

`[Tên]` và `[Tên mẹ]` là placeholder — được điền bằng `recipientName` từ form.

---

## Input Contract

```
LittleHouseOfferToDto {
  templateId:    OfferToTemplate   // enum — bắt buộc chọn từ 5 loại
  recipientName: string            // Tên điền vào placeholder
}

enum OfferToTemplate {
  KARMIC_CREDITOR_SELF
  UNBORN_CHILD
  DECEASED_PERSON
  KARMIC_CREDITOR_HOUSE
  KARMIC_RESOLUTION
}
```

**Không nhận `offerTo` dạng raw string.** API chỉ nhận `{ templateId, recipientName }` và tự compose thành string canonical.

---

## Composition Logic

```typescript
function composeOfferTo(templateId: OfferToTemplate, recipientName: string): string {
  const templates: Record<OfferToTemplate, (name: string) => string> = {
    KARMIC_CREDITOR_SELF:    (n) => `Người cần kinh của ${n}`,
    UNBORN_CHILD:            (n) => `Thai nhi của ${n}`,
    DECEASED_PERSON:         (n) => n,  // chỉ tên, không prefix
    KARMIC_CREDITOR_HOUSE:   (n) => `Người cần kinh trong ngôi nhà của ${n}`,
    KARMIC_RESOLUTION:       (n) => `Hóa giải oán kết của ${n}`,
  }
  return templates[templateId](recipientName.trim())
}
```

`offerToFormatted` (string cuối cùng) được lưu vào DB bên cạnh `templateId` và `recipientName` để:
- Hiển thị đúng trên PDF in ra.
- Còn có thể query/filter theo `templateId` sau này.

---

## Write Path

```
POST /api/engagement/little-houses
────────────────────────────────────
1. Parse Zod: validate templateId ∈ OfferToTemplate enum.
   - Nếu raw string được truyền thay vì enum → throw 400 { error: "free_text_offer_to_forbidden" }.
2. Validate recipientName: non-empty, max 100 chars, trimmed.
3. Compose offerToFormatted = composeOfferTo(templateId, recipientName).
4. Lưu LittleHouse:
   {
     offerToTemplateId: templateId,
     offerToRecipientName: recipientName,
     offerToFormatted: offerToFormatted,
     ...
   }
5. Audit: little-house.offer-to.validated.
```

---

## FE Behavior

### Template Selector UI

```
┌──────────────────────────────────────────────────────────┐
│  Kính tặng (Offer To)                                   │
│                                                          │
│  Chọn loại người nhận:                                  │
│                                                          │
│  ○ Người cần kinh của [Tên]                             │
│      → Oan gia trái chủ của bản thân / người thân       │
│                                                          │
│  ○ Thai nhi của [Tên mẹ]                                │
│      → Con chưa sinh hoặc thai nhi bị mất               │
│                                                          │
│  ○ [Tên người quá cố]                                   │
│      → Người đã khuất (nhập tên đầy đủ)                │
│                                                          │
│  ○ Người cần kinh trong ngôi nhà của [Tên]             │
│      → Oan gia trái chủ tại nhà                         │
│                                                          │
│  ○ Hóa giải oán kết của [Tên]                          │
│      → Hóa giải nghiệp oán tích lũy                    │
│                                                          │
│  Tên: [________________________]                        │
│                                                          │
│  Preview: "Người cần kinh của Nguyễn Thị B"            │
└──────────────────────────────────────────────────────────┘
```

- **Radio buttons** — không có text input tự do cho template.
- Khi chọn template + nhập tên → **real-time preview** hiển thị kết quả cuối cùng.
- Nút [Lưu] disabled nếu chưa chọn template hoặc `recipientName` empty.
- Không có option "Khác" hay "Tự nhập".

### Rejection Cases với Tooltip

Các trường hợp user hay nhập sai bị reject tại FE trước khi gửi API:

| Input sai | Thay bằng |
|---|---|
| "Kính tặng ông bà" | → Chọn template `DECEASED_PERSON`, nhập tên ông/bà |
| "Kính tặng gia tiên" | → Chọn template `DECEASED_PERSON`, nhập từng người |
| "Kính tặng vong linh" | → Chọn template tương ứng với loại vong linh |
| "Tặng cho Phật" | → Sai hoàn toàn — Tiểu Phương Tử không tặng cho Phật |

---

## Schema Notes

```prisma
model LittleHouse {
  // ... existing fields ...
  offerToTemplateId       OfferToTemplate
  offerToRecipientName    String
  offerToFormatted        String    // composed string — dùng để in
}

enum OfferToTemplate {
  KARMIC_CREDITOR_SELF
  UNBORN_CHILD
  DECEASED_PERSON
  KARMIC_CREDITOR_HOUSE
  KARMIC_RESOLUTION
}
```

Lưu cả 3 fields để:
- `offerToTemplateId` → filter/analytics.
- `offerToRecipientName` → có thể recompose nếu wording thay đổi.
- `offerToFormatted` → dùng trực tiếp khi render PDF mà không cần recompute.

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.offer-to.validated` | Template + name hợp lệ |
| `little-house.offer-to.free-text-rejected` | Cố gửi raw string (nếu bypass FE) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `templateId` không trong enum | `free_text_offer_to_forbidden` | 400 |
| `recipientName` empty | `recipient_name_required` | 400 |
| `recipientName` > 100 chars | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — Core Little House flow
- [proxy-recitation-spirit-defense.md](../../vows-merit/USE_CASES/proxy-recitation-spirit-defense.md) — Proxy defense khi isProxy=true
- [joss-paper-clash-warning.md](../../wisdom-qa/USE_CASES/joss-paper-clash-warning.md) — Người quá cố & vàng mã
