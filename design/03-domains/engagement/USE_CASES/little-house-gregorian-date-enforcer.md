# Bộ Kiểm Tra Lịch Dương Độc Quyền — Little House Gregorian Date Enforcer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 309)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngày tháng hoàn thành trên Ngôi Nhà Nhỏ (NNN) **BẮT BUỘC phải viết theo Lịch Dương (Gregorian calendar)**. Cấm ghi theo Lịch Âm. Người dùng có thể điền ngày niệm xong hoặc ngày đốt — cả hai đều hợp lệ, miễn là dùng Lịch Dương.

Người mới tu hay bị nhầm vì thói quen dùng Lịch Âm trong sinh hoạt hàng ngày.

---

## Owner module

`engagement` — LittleHouse / NNNSheet
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — điền ngày hoàn thành lên tờ NNN
- `system` — validate ngày dương lịch, block ngày âm lịch, hiển thị cảnh báo

---

## Business Rules

| Loại ngày | Quy tắc |
|---|---|
| Lịch Dương (dd/MM/yyyy hoặc yyyy-MM-dd) | ✅ ALLOWED |
| Lịch Âm (ngày, tháng âm) | ❌ REJECTED — hướng dẫn chuyển đổi |
| Ngày trong tương lai (> today) | ❌ REJECTED — chỉ điền sau khi đã niệm xong |
| Ngày trống (completedDate null) | ❌ REJECTED — bắt buộc điền trước khi in/đốt |

---

## Input Contract

```
SetLittleHouseCompletedDateDto {
  sheetId:        string
  completedDate:  string    // ISO 8601: "2026-04-04" — BẮT BUỘC Gregorian
  dateType:       "COMPLETED" | "BURNED"   // ngày niệm xong hay ngày đốt
}
```

---

## Write Path

```
PATCH /api/engagement/little-house-sheets/:id/completed-date
──────────────────────────────────────────────────────────────
Body: { completedDate: string, dateType: "COMPLETED" | "BURNED" }

1. Parse completedDate as ISO 8601.
   - Nếu parse fail → HTTP 400: { error: "invalid_date_format", message: "Ngày phải theo định dạng Lịch Dương (DD/MM/YYYY). Lịch Âm không được chấp nhận." }
2. Validate completedDate <= today (UTC+7).
   - Nếu tương lai → HTTP 400: { error: "future_date_forbidden", message: "Chỉ điền ngày sau khi đã niệm xong." }
3. Validate sheet.status = "COMPLETED" (đủ số biến).
   - Nếu chưa đủ → HTTP 409: { error: "sheet_not_completed", message: "Tờ NNN chưa đủ số biến. Hoàn thành trì tụng trước." }
4. Update LittleHouseSheet.completedDate, LittleHouseSheet.dateType.
5. Audit: little-house.completed-date.set
```

---

## FE Behavior

### Input field trên màn hình in NNN

```
Ngày hoàn thành:
[  DD / MM / YYYY  ]  ← Date picker, Gregorian only

⚠️  Luật PMTL: Ngày tháng trên Ngôi Nhà Nhỏ bắt buộc
    dùng LỊCH DƯƠNG (Lịch Tây). Không dùng Lịch Âm.

○ Ngày niệm xong   ○ Ngày đốt   ← user chọn 1
```

### Date picker config

```typescript
// Không cho phép chọn ngày trong tương lai
<DatePicker
  maxDate={new Date()}
  locale="vi"
  format="dd/MM/yyyy"
  placeholder="DD/MM/YYYY — Lịch Dương"
  helperText="Bắt buộc dùng Lịch Dương (Lịch Tây). Cấm dùng Lịch Âm."
/>
```

### Warning banner trên màn hình in PDF

```
┌──────────────────────────────────────────────────────────┐
│  📋  Lưu ý khi in Ngôi Nhà Nhỏ                         │
│                                                          │
│  NGÀY THÁNG: Bắt buộc dùng LỊCH DƯƠNG (Lịch Tây).    │
│  Cấm ghi theo Lịch Âm.                                │
│                                                          │
│  Có thể ghi ngày niệm xong HOẶC ngày đốt —            │
│  cả hai đều được, miễn là Lịch Dương.                 │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

Bổ sung vào `LittleHouseSheet` (model hiện có):

```prisma
model LittleHouseSheet {
  // ... existing fields ...
  completedDate  DateTime?  // Gregorian — ngày niệm xong hoặc ngày đốt
  dateType       String?    // "COMPLETED" | "BURNED"
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.completed-date.set` | User set ngày thành công |
| `little-house.completed-date.lunar-rejected` | Parse fail (nghi Lịch Âm) |
| `little-house.completed-date.future-rejected` | Ngày tương lai bị reject |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Parse date fail | `invalid_date_format` | 400 |
| Ngày trong tương lai | `future_date_forbidden` | 400 |
| Sheet chưa đủ số biến | `sheet_not_completed` | 409 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Date picker nên default về `today` không phải empty — giảm friction cho người mới.
- Không cần phát hiện thông minh "đây có phải Lịch Âm không" — chỉ validate ISO 8601 parse. Nếu user nhập đúng ISO thì luôn là Lịch Dương.
- Warning banner trên màn hình in là UX pattern tốt — đọc trước khi nhấn nút in.

---

## Part B: Định Dạng Ngày Trên PDF NNN — Date Format Engine

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 31 Logic 9)

Khi in PDF Ngôi Nhà Nhỏ, ngày tháng có thể hiển thị theo 2 định dạng:

| Format | Hiển thị | Hướng | Ví dụ |
|---|---|---|---|
| `ARABIC_HORIZONTAL` | Số Ả Rập, nằm ngang | ← mặc định | `04/04/2026` |
| `CHINESE_VERTICAL` | Chữ số Hán, dọc từ trên xuống | Cho in truyền thống | `二零二六年四月四日` (dọc) |

### Input Contract bổ sung

```typescript
interface GenerateLittleHousePdfDto {
  sheetId:     string
  dateFormat?: 'ARABIC_HORIZONTAL' | 'CHINESE_VERTICAL'  // default: ARABIC_HORIZONTAL
}
```

### Write Path bổ sung

```
POST /api/engagement/little-house-sheets/:id/generate-pdf
Body: { dateFormat?: 'ARABIC_HORIZONTAL' | 'CHINESE_VERTICAL' }

1. Load sheet.completedDate (phải đã set, xem Part A)
2. Format date theo dateFormat:
   - ARABIC_HORIZONTAL: format("dd/MM/yyyy")
   - CHINESE_VERTICAL:  convertToChineseNumerals(date) → rendered vertical in PDF template
3. Inject date string vào PDF template tại vị trí [DATE_PLACEHOLDER]
4. Return PDF buffer
```

### Chinese Numeral Converter (Phase 2+)

```typescript
const CHINESE_DIGITS = ['零','一','二','三','四','五','六','七','八','九','十']

function convertToChineseDate(date: Date): string {
  const year = date.getFullYear().toString()
    .split('').map(d => CHINESE_DIGITS[parseInt(d)]).join('')
  const month = CHINESE_DIGITS[date.getMonth() + 1]
  const day = CHINESE_DIGITS[date.getDate()] ?? `${CHINESE_DIGITS[Math.floor(date.getDate()/10)]}十${CHINESE_DIGITS[date.getDate()%10]}`
  return `${year}年${month}月${day}日`
}
// Ví dụ: 2026-04-04 → 二零二六年四月四日
```

### FE Behavior bổ sung

Trên màn hình in PDF, thêm radio selector:

```
Định dạng ngày trên tờ NNN:
○ Số Ả Rập nằm ngang: 04/04/2026       ← mặc định
○ Chữ Hán dọc:        二零二六年四月四日 (truyền thống)
```

### Audit bổ sung

| Action | Trigger |
|---|---|
| `little-house.pdf.generated-arabic` | PDF với định dạng ARABIC_HORIZONTAL |
| `little-house.pdf.generated-chinese` | PDF với định dạng CHINESE_VERTICAL |

---

## Related

- [little-house-anti-theft-field-lock.md](./little-house-anti-theft-field-lock.md) — offeredBy lock trước khi tụng
- [little-house-chanter-identity-lock.md](./little-house-chanter-identity-lock.md) — Tác quyền người trì tụng
- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — Core NNN flow
