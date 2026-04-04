# Khóa Lời Khấn Hủy Tờ NNN — Invalidation Prayer Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tấm Ngôi Nhà Nhỏ đã viết có năng lượng liên kết với Bồ Tát. Trước khi hủy bỏ tờ viết sai, **PHẢI khấn báo cáo Bồ Tát** để xin phép hủy. Tự ý vứt bỏ mà không khấn là vi phạm nghiêm trọng.

---

## Owner module

`engagement` — LittleHouseService / InvalidationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người muốn hủy tờ NNN viết sai
- `system` — chặn hành động hủy cho đến khi hoàn thành lời khấn

---

## Trigger

Khi user click `[Hủy Tờ Này]` trên một tấm Ngôi Nhà Nhỏ.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User click `[Hủy Tờ Này]` | ✅ Hiển thị modal lời khấn bắt buộc |
| Modal lời khấn hiển thị | ⏳ Block mọi nút hành động |
| User chưa check checkbox "Đã đọc" | ❌ Nút `[Đã Khấn Xong]` disabled |
| User check checkbox | ✅ Enable nút `[Đã Khấn Xong]` |
| User click `[Đã Khấn Xong]` | ✅ Update DB: `status = INVALIDATED` |
| Thoát modal mà không hoàn thành | ❌ Record giữ nguyên trạng thái cũ |

---

## Input Contract

```typescript
interface InvalidateLittleHouseDto {
  sheetId: string
  prayerRecited: boolean  // Phải = true (server-side validated)
}
```

---

## Write Path

```
POST /api/engagement/little-house/sheets/:sheetId/invalidate
1. Validate sheetId tồn tại + thuộc về userId
2. Validate prayerRecited = true (server-side)
3. Update LittleHouseSheet: status = INVALIDATED, invalidatedAt = now()
4. Create AuditEvent: lh.status_invalidated
5. Return: { sheetId, status: 'INVALIDATED' }
```

---

## FE Behavior

```
Modal: Hủy Bỏ Tờ NNN Sai

❌ BẠN KHÔNG ĐƯỢC TỰ Ý BỎ SÁCH QUA!

Trước khi vứt bỏ, bạn PHẢI khấn báo cáo Bồ Tát:

┌─────────────────────────────────────────────┐
│ "Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,   │
│ Con là [Tên], đã viết sai trên tấm          │
│ Ngôi Nhà Nhỏ này.                           │
│ Con xin phép hủy bỏ nó.                     │
│ Xin Bồ Tát từ bi tha thứ cho con."          │
└─────────────────────────────────────────────┘

[ ] Tôi đã đọc lời khấn này   ← checkbox bắt buộc

[Hủy]          [Đã Khấn Xong]  ← disabled until checkbox
```

### Bước 2: Hướng Dẫn Tiêu Hủy Vật Lý (hiển thị ngay sau khi user nhấn [Đã Khấn Xong])

```
┌──────────────────────────────────────────────────────────┐
│ 📋  Hướng Dẫn Tiêu Hủy Tờ NNN Sai — Đúng Quy Cách      │
│──────────────────────────────────────────────────────────│
│                                                          │
│ TUYỆT ĐỐI KHÔNG xé nát hoặc đốt tờ NNN đã hủy.        │
│                                                          │
│ Thực hiện đúng trình tự sau:                            │
│                                                          │
│  1️⃣  Dùng bút gạch chéo (✕) lên tên người thụ hưởng   │
│  2️⃣  Gấp nhỏ tờ giấy lại (nhiều lần)                  │
│  3️⃣  Bọc tờ giấy trong một tờ giấy rác khác            │
│  4️⃣  Bỏ vào thùng rác thông thường                     │
│                                                          │
│ ⚠️  Lý do: Tờ NNN mang năng lượng đã kết nối.          │
│  Xé hoặc đốt sẽ gây xáo trộn và tổn hại năng lượng.   │
│                                                          │
│              [Đã Hiểu — Đóng]                           │
└──────────────────────────────────────────────────────────┘
```

**Lưu ý FE:** Modal tiêu hủy vật lý xuất hiện **sau khi** API trả về `status: INVALIDATED` thành công — không block API call.

---

## Schema Notes

```prisma
model LittleHouseSheet {
  // ... existing fields ...
  status        LittleHouseStatus @default(ACTIVE)
  invalidatedAt DateTime?
  // Migration: ALTER TABLE "LittleHouseSheet" ADD COLUMN "invalidatedAt" TIMESTAMP
}

enum LittleHouseStatus {
  ACTIVE
  BURNED
  INVALIDATED
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `lh.invalidation_requested` | User click nút hủy |
| `lh.prayer_modal_shown` | Modal hiển thị |
| `lh.prayer_recitation_confirmed` | User check checkbox + confirm |
| `lh.status_invalidated` | DB record cập nhật INVALIDATED |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| prayerRecited = false | `prayer_recitation_required` | 400 |
| Sheet không thuộc userId | `sheet_not_found` | 404 |
| Sheet đã BURNED/INVALIDATED | `sheet_already_finalized` | 409 |

---

## Related

- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — NNN sheet lifecycle
- [little-house-no-inline-edit-correction-limit.md](./little-house-no-inline-edit-correction-limit.md) — sửa lỗi trong tờ NNN
