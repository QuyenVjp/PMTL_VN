# Quy Tắc Nước Đại Bi — Great Compassion Water Rules

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc cúng dường nước
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng `altar-offerings-guide.md` với các quy tắc cụ thể về **nước cúng dường**:
cốc chuẩn, cấm vật (chai nhựa), luồng uống nước sau khi hạ xuống, và cấm kỵ gia nhiệt/tưới cây.

**Không trùng với:** `altar-offerings-guide.md` (quy tắc vị trí + hoa quả + dầu đèn tổng quát).

---

## Owner module

`content` — ritual guidance (BeginnerGuide category `ALTAR_OFFERINGS`)
`vows-merit` / `engagement` — user action log (AltarLog) khi có tính năng log cúng dường

---

## Actors

- `member` — đọc hướng dẫn và thực hành
- `admin` — quản lý nội dung hướng dẫn qua CMS

---

## Rule 1: Cốc Cúng Chuẩn (Cup Validation)

### Quy tắc

| Thuộc tính | Bắt buộc | Giải thích |
|---|---|---|
| Màu sắc | Trắng trơn | Không có hoa văn, không có màu sắc phức tạp |
| Chất liệu | Sứ hoặc thủy tinh | Không dùng nhựa, kim loại, inox |
| In chữ | CẤM | Không được in kinh văn (Tâm Kinh, Đại Bi), không in hình Phật, không in hình động vật, không in bất kỳ chữ nào |
| Kích thước | Cốc nhỏ đến vừa | Không dùng cốc quá lớn |

### Cấm đặc biệt — Chai đóng sẵn

> **RED ALERT (critical):** Tuyệt đối cấm đặt trực tiếp **chai nước khoáng đóng chai (bottled mineral water)** lên bàn thờ thay cho cốc. Chai nhựa hoặc thủy tinh đóng sẵn không phải cúng phẩm hợp lệ — phải rót nước vào cốc sứ trắng riêng.

### Content CMS fields

```
BeginnerGuide.category = "ALTAR_OFFERINGS" với subcategory "COMPASSION_WATER_CUP"
fields:
  severity:         "MANDATORY"
  canonicalWording: [text chuẩn]
  shortReason:      "Cốc có chữ hoặc hình gây nhiễu loạn năng lượng thanh tịnh"
  sourceReference:  [link khai thị]
  redAlertItems: [
    "Cấm chai nước khoáng đóng sẵn đặt trực tiếp lên bàn thờ"
  ]
```

---

## Rule 2: Luồng Uống Nước Sau Khi Hạ (Consumption Flow)

### Trigger

User khai báo "Đã hạ nước cúng xuống" trong AltarLog flow.

### Business Rule

Nước cúng cho các vị Bồ Tát khác nhau có quy tắc uống khác nhau. Hệ thống render 2 lựa chọn:

```
Option A: "Đây là nước cúng Quán Thế Âm Bồ Tát"
  → Có thể uống trực tiếp (rót ra cốc khác, không uống từ cốc cúng)
  → Không cần đọc thêm kinh

Option B: "Đây là nước cúng vị Bồ Tát khác"
  → Bắt buộc chọn một trong hai:
    [A] Niệm 1 biến Chú Đại Bi trước khi uống → tick checkbox xác nhận
    [B] Đổ bỏ nước đi (không trộn lẫn với nước Quán Âm)
  → CẤM trộn nước của các vị Bồ Tát khác nhau vào cùng một cốc
```

### Cảnh báo gia nhiệt

Khi user muốn uống nóng (checkbox "Tôi muốn uống ấm"):
- Hiển thị **cảnh báo đỏ inline** (không dismissible):
  > *"CẤM cho vào lò vi sóng (microwave) hoặc đun sôi trực tiếp trên bếp. Chỉ được ngâm cốc vào bát nước nóng để làm ấm từ từ."*

### Cấm tưới cây

- Hiển thị note cố định trong màn hình hạ nước:
  > *"Nước cúng Phật sau khi dùng xong: CẤM dùng để tưới cây hoặc tưới vườn."*
- Gợi ý xử lý hợp lệ: đổ xuống cống hoặc ra đất tự nhiên.

---

## Rule 3: Thay Nước Hàng Ngày

### Business Rule

Nước cúng phải được thay mỗi ngày. Nếu user log AltarLog mà `lastWaterChangeDate < today - 1`:
- Hiển thị **reminder card** nhẹ: *"Hôm qua chưa thay nước cúng. Hãy thay nước trước khi thắp hương."*
- Không block — chỉ reminder.

---

## Content Structure

### Relation to existing models

Toàn bộ rules này là **Content-owned** — không cần model mới:

```
BeginnerGuide (existing):
  category: "ALTAR_OFFERINGS"
  subcategory: "COMPASSION_WATER_CUP"    ← content block mới
              "COMPASSION_WATER_CONSUME"  ← content block mới
              "COMPASSION_WATER_HEATING"  ← content block mới

AltarLog (existing, engagement):
  actionType: "WATER_CHANGE"   ← enum value mới nếu chưa có
              "WATER_CONSUMED"
```

---

## Admin CMS Flow

1. Admin tạo/sửa `BeginnerGuide` entries cho từng rule category.
2. `redAlertItems[]` là mảng string — admin có thể thêm cảnh báo mới mà không cần deploy code.
3. `severity` field: `"MANDATORY"` | `"RECOMMENDED"` | `"ADVISORY"`.

---

## Errors

| Condition | Error code | HTTP |
|---|---|---|
| AltarLog action không hợp lệ | `invalid_body` | 400 |
| Chưa đăng nhập khi log action | `unauthorized` | 401 |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `altar.water.changed` | actorUserId | Log thay nước cúng |
| `altar.water.consumed` | actorUserId | Log uống nước (với option A/B) |

---

## Notes for AI/codegen

- **Không cần model mới** — dùng `BeginnerGuide` cho content và `AltarLog.actionType` cho user action.
- `redAlertItems` trong CMS là `String[]` column — render mỗi item với background đỏ nhạt, border đỏ đậm.
- Chai nước khoáng warning phải hiển thị là **static permanent banner** trong màn hình altar setup — không phải one-time dismissible toast.
- Microwave warning: "lò vi sóng" và "microwave" phải xuất hiện cùng nhau để cả người không biết tiếng Anh lẫn người biết đều hiểu.
- Luồng consumption (Option A/B) chỉ hiện khi user log `actionType = "WATER_CONSUMED"` — không render mặc định.
