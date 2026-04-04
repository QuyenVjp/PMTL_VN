# Tiểu Phương Tử Tồn Kho & Niệm Thay — Reserved Status & Proxy Recitation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Cẩm nang niệm Tiểu Phương Tử
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng `manage-ngoi-nha-nho-sheet.md` với 3 nghiệp vụ mới chưa được xử lý:

1. **RESERVED status:** Cho phép niệm tờ trước khi điền tên người nhận — dùng để tích trữ năng lượng.
2. **Proxy Recitation Defense:** Khi niệm giúp người bệnh nặng, phải đọc lời khấn bảo vệ chặn linh xâm nhập.
3. **Hardware Validation Checklist:** Trước khi bấm [Đã đốt xong], bắt buộc xác nhận dụng cụ đốt đúng chuẩn.

**Không trùng với:** `validate-little-house-burn-conditions.md` (time/weather gate), `manage-ngoi-nha-nho-sheet.md` (lifecycle cơ bản).

---

## Owner module

`engagement` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thực hành
- `admin` — assisted entry khi nhập giúp

---

## Part 1: RESERVED Status

### Trigger

User tạo tờ Tiểu Phương Tử với `offerTo = null` và `date = null` để tích trữ trước.

### Business Rule

`RESERVED` là trạng thái hợp lệ trong lifecycle. Sheet với `status = RESERVED` đã niệm đủ kinh nhưng chưa có người nhận.

### Lifecycle state mở rộng

```
DRAFT → SIGNED → CHANTED → [nếu offerTo null] RESERVED → [khi điền offerTo] CHANTED_WITH_RECIPIENT → BURNED
                          → [nếu offerTo filled khi chanted] CHANTED → BURNED
```

### Input contract bổ sung

```
PATCH /api/engagement/little-house/:sheetId
{
  operation: "set-reserved" | "assign-recipient"
  offerTo?:  string   // required khi operation = "assign-recipient"
  date?:     string   // ngày dự kiến đốt, optional
}
```

### Write path

1. Validate: `operation = "set-reserved"` chỉ hợp lệ khi `sheet.status = CHANTED` và `sheet.offerTo IS NULL`.
2. Cập nhật `sheet.status = "RESERVED"`.
3. Render **UI tooltip bắt buộc** (không dismissible khi lần đầu chuyển sang RESERVED):
   > *"Hãy bọc tờ Tiểu Phương Tử thật này bằng giấy đỏ hoặc vải đỏ (red paper/fabric) để cất giữ, tránh bị thất thoát năng lượng."*
4. Ghi `reservedAt = now()` vào sheet record.
5. Audit `engagement.little-house.reserved`.

Khi `operation = "assign-recipient"`:
1. Validate: `sheet.status = "RESERVED"`, `offerTo` không trống.
2. Cập nhật `sheet.offerTo`, `sheet.date`, `sheet.status = "CHANTED_WITH_RECIPIENT"`.
3. Audit `engagement.little-house.recipient-assigned`.

### Recovery

Nếu user mất tờ giấy đã bọc: mark `sheet.status = "LOST"` (void equivalent). Không hard-delete.

---

## Part 2: Proxy Recitation Defense Disclaimer

### Trigger

User chọn `[Niệm cho người khác]` hoặc `recitationType = "PROXY"` khi bắt đầu session niệm Tiểu Phương Tử.

### Business Rule

Khi niệm giúp người thân đang bệnh nặng, linh tính người đó có thể tương tác mạnh với người niệm.
Hệ thống **bắt buộc** render lời khấn phòng vệ trước khi bắt đầu niệm.

### Input contract

```
POST /api/engagement/little-house/:sheetId/start-session
{
  recitationType: "SELF" | "PROXY"
  proxyFor?: {
    recipientName: string        // tên người bệnh
    relationship:  string        // quan hệ: "mẹ", "cha", "chồng", "vợ", "con", ...
  }
}
```

### Write path

1. Validate: nếu `recitationType = "PROXY"` thì `proxyFor.recipientName` bắt buộc.
2. Tạo `RecitationSession` với `type = PROXY`.
3. **Bắt buộc render Proxy Defense Card** (không skip được):
   ```
   Title: "Lời Khấn Bảo Vệ — Trước Khi Niệm Thay"
   Body:  "Xin Quán Thế Âm Bồ Tát bảo vệ thân tâm của con [Tên người niệm].
           Oan gia trái chủ của [Tên người bệnh] xin hãy tìm [Tên người bệnh]
           để nhận phần Tiểu Phương Tử con sẽ niệm thay cho [Tên người bệnh].
           Xin Bồ Tát từ bi chứng minh."
   ```
4. User phải bấm `[Đã đọc lời khấn — Bắt đầu niệm]` để proceed.
5. Audit `engagement.little-house.proxy-session.started`.

### UX rules

- `proxyFor.recipientName` được inject vào template lời khấn tự động.
- Card **không có nút Skip hoặc Dismiss** — đây là bước bắt buộc.
- Nếu user tắt app và mở lại session, card phải hiện lại.

---

## Part 3: Hardware Validation Checklist (Trước khi đốt)

### Trigger

User bấm **[Bắt đầu nghi thức đốt]** từ sheet đã `CHANTED` hoặc `CHANTED_WITH_RECIPIENT`.

### Business Rule

Trước khi xác nhận đốt, user phải tick đủ 2 checkbox dụng cụ bắt buộc.

### Checklist items (hardcoded — không phải CMS)

```
HardwareChecklist = [
  {
    key:       "white_ceramic_plate",
    label:     "Sử dụng đĩa/bát sứ hoặc gốm màu trắng tinh để đốt",
    warning:   "TUYỆT ĐỐI CẤM dùng đồ kim loại, hợp kim, inox, nhôm, hoặc chảo.",
    required:  true
  },
  {
    key:       "placed_on_stool",
    label:     "Đĩa đốt được đặt trên tấm gỗ, ghế gỗ, hoặc kệ riêng biệt",
    warning:   "CẤM đặt trực tiếp trên Phật đài. CẤM đặt trực tiếp dưới sàn nhà.",
    required:  true
  }
]
```

### Write path

1. Render `HardwareChecklist` với cả 2 items.
2. Nút **[Xác nhận — Tiến hành đốt]** bị `disabled` cho đến khi cả 2 checkbox được tick.
3. Sau khi confirm:
   - Ghi `burnMetadata.hardwareConfirmed = true` vào sheet.
   - Chuyển sang luồng **Burn Confirmation Modal** (xem `validate-little-house-burn-conditions.md`).
4. Audit `engagement.little-house.hardware-validated`.

### Note

Đây là gate bổ sung **trước** weather/time gate. Thứ tự:
```
1. Hardware Checklist → 2. Time/Weather Gate → 3. Burn Confirmation Modal
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `set-reserved` khi `offerTo` đã có giá trị | `invalid_state` | 409 | Chỉ set RESERVED khi chưa có người nhận |
| `assign-recipient` khi sheet không ở RESERVED | `invalid_state` | 409 | — |
| Proxy session thiếu `proxyFor.recipientName` | `invalid_body` | 400 | Nhập tên người nhận |
| Hardware checklist chưa tick đủ | `precondition_not_met` | 400 | Client phải enforce trước, không reach API |
| Sheet không thuộc actor | `forbidden` | 403 | — |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `engagement.little-house.reserved` | actorUserId | Sheet chuyển sang RESERVED |
| `engagement.little-house.recipient-assigned` | actorUserId | Điền `offerTo` cho RESERVED sheet |
| `engagement.little-house.lost` | actorUserId | Sheet bị void do mất tờ giấy |
| `engagement.little-house.proxy-session.started` | actorUserId | Bắt đầu niệm thay |
| `engagement.little-house.hardware-validated` | actorUserId | Tick đủ 2 checkbox dụng cụ |

---

## Schema bổ sung cần thiết

```
// Thêm vào LittleHouseSheet model (không tạo model mới):
reservedAt              DateTime?
recitationType          String?    // "SELF" | "PROXY"
proxyForName            String?
proxyForRelationship    String?
hardwareConfirmed       Boolean    @default(false)
burnMetadata            Json?      // { hardwareConfirmed, isEmergency, weatherAdvisory }
```

---

## Notes for AI/codegen

- `RESERVED` và `CHANTED_WITH_RECIPIENT` là **2 status mới** cần thêm vào enum `LittleHouseSheetStatus`.
- Proxy Defense Card **không có button Skip** — enforce bằng cách không render nút đó trong component, không phải disable.
- `HardwareChecklist` items là **hardcoded constant trong service** — không phải CMS config. Lý do: đây là quy tắc vật lý không đổi của pháp môn.
- Warning text trong checklist ("TUYỆT ĐỐI CẤM dùng đồ kim loại") phải hiển thị bằng màu đỏ đậm ngay dưới mỗi checkbox item.
- Tooltip bọc giấy đỏ cho RESERVED chỉ hiển thị **lần đầu** khi sheet chuyển sang RESERVED — sau đó trở thành info card có thể dismiss.
