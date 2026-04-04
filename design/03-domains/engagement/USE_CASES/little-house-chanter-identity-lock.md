# Khoá Tác Quyền Người Trì Tụng — Little House Chanter Identity Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 320)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Người nhà **có thể đốt thay** tờ NNN cho người đã niệm. Tuy nhiên, cột **"Người Tặng / Offered By" (bên trái) BẮT BUỘC phải là tên của người ĐÃ NIỆM**, không phải tên người cầm bật lửa đốt. Tác quyền năng lượng kinh văn thuộc về người đã trì tụng — người đốt chỉ là trung gian vật lý, không có quyền "đứng tên".

---

## Owner module

`engagement` — LittleHouse / NNNSheet
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — chủ account đã niệm kinh
- `family_member` — người thân đốt thay (không có account)
- `system` — lock trường Offered By về tên người niệm, không cho sửa

---

## Business Rules

| Trường hợp | offeredBy Name |
|---|---|
| User tự đốt | `user.spiritualName ?? user.legalName` |
| Người nhà đốt thay (`burnedByFamilyMember = true`) | **Vẫn là** `user.spiritualName ?? user.legalName` — KHÔNG đổi |
| Admin nhập thay | `user.spiritualName ?? user.legalName` — không thể override |

**Nguyên tắc bất biến:** `offeredByName` = tên người đã ngồi niệm. Không liên quan đến ai đốt.

---

## Input Contract

```
BurnLittleHouseSheetDto {
  sheetId:              string
  burnedByFamilyMember: boolean   // true = người nhà đốt thay
  burnedByName?:        string    // IGNORED — field này bị discard hoàn toàn
                                  // system luôn dùng authenticated user's name
}
```

`burnedByName` trong DTO bị discard ngay tại service — không bao giờ được ghi vào DB.

---

## Write Path

```
POST /api/engagement/little-house-sheets/:id/burn
──────────────────────────────────────────────────
Body: { burnedByFamilyMember: boolean }

1. Resolve offeredByName:
   offeredByName = req.user.spiritualName ?? req.user.legalName
   // KHÔNG đọc burnedByName từ body — discard

2. Validate sheet thuộc về req.user.id.
3. Validate sheet.status = "COMPLETED" và completedDate != null.
4. Update LittleHouseSheet:
   {
     status:               "BURNED",
     offeredByName:        offeredByName,   // locked to chanter
     burnedByFamilyMember: burnedByFamilyMember,
     burnedAt:             now()
   }
5. Audit: little-house.sheet.burned { burnedByFamilyMember }
```

---

## FE Behavior

### Màn hình Xác nhận Đốt

```
┌──────────────────────────────────────────────────────────┐
│  🔥  Xác Nhận Đốt Ngôi Nhà Nhỏ                         │
│                                                          │
│  Người Tặng (Offered By):                              │
│  ┌──────────────────────────────┐                       │
│  │  Nguyễn Tâm An               │  🔒 (locked)         │
│  └──────────────────────────────┘                       │
│  ℹ️  Tên người đã niệm kinh. Không thể thay đổi.       │
│                                                          │
│  Ai sẽ đốt tờ này?                                    │
│  ○ Tôi tự đốt                                          │
│  ○ Người nhà đốt thay                                  │
│                                                          │
│  💡  Dù ai đốt, tác quyền năng lượng vẫn thuộc về     │
│      người đã niệm. Không ghi tên người đốt vào        │
│      cột bên trái.                                     │
│                                                          │
│  [Xác Nhận Đốt]                                        │
└──────────────────────────────────────────────────────────┘
```

### Tooltip khi user hover vào trường Offered By (locked)

```
🔒 Tác quyền năng lượng thuộc về người đã ngồi niệm.
   Dù người nhà đốt thay, tên trên cột này
   không được phép thay đổi.
```

---

## Schema Notes

Bổ sung vào `LittleHouseSheet`:

```prisma
model LittleHouseSheet {
  // ... existing fields ...
  offeredByName        String?   // locked = chanter's name at burn time
  burnedByFamilyMember Boolean   @default(false)
  burnedAt             DateTime?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.sheet.burned` | Đốt thành công (self hoặc family) |

Payload audit bao gồm `burnedByFamilyMember: boolean` để analytics.

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Sheet không thuộc về user | `forbidden` | 403 |
| Sheet chưa COMPLETED | `sheet_not_completed` | 409 |
| `completedDate` null | `date_required` | 409 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `burnedByName` trong request body phải bị discard hoàn toàn — không log, không store. Tránh confused data.
- `offeredByName` được snapshot tại thời điểm burn — dùng `spiritualName ?? legalName` tại thời điểm đó, không lookup lại sau.
- Phase 2+: nếu user đổi `spiritualName` sau khi đã burn, các sheet cũ giữ nguyên snapshot tên cũ — đúng behavior.

---

## Related

- [little-house-anti-theft-field-lock.md](./little-house-anti-theft-field-lock.md) — offeredBy phải điền TRƯỚC khi niệm
- [little-house-gregorian-date-enforcer.md](./little-house-gregorian-date-enforcer.md) — Ngày dương lịch bắt buộc
- [dual-name-spiritual-legal.md](../../identity/USE_CASES/dual-name-spiritual-legal.md) — spiritualName vs legalName
