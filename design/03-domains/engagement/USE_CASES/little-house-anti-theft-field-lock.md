# Khóa Trường "Người Tặng" Chống Trộm Kinh Văn — Little House Anti-Theft Field Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Cẩm nang Ngôi Nhà Nhỏ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cột **"Người Tặng" (offeredBy / Offered By)** trên Tiểu Phương Tử phải được điền **TRƯỚC** khi bắt đầu niệm kinh và trước khi chấm đỏ. Nếu niệm xong mới điền, năng lượng của bài kinh không có "chủ sở hữu" và dễ bị vong linh lang thang cướp mất.

Đây là cơ chế **"đánh dấu bản quyền năng lượng"** — tương tự như ký tên lên séc trước khi nạp tiền vào.

---

## Owner module

`engagement` — LittleHouse / NgoiNhaNho
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — điền thông tin và bắt đầu niệm
- `system` — gate nút [Bắt đầu Trì Tụng] cho đến khi `offeredBy_Name` được điền

---

## Trigger

User vào màn hình Little House tracker và cố bấm **[Bắt đầu Trì Tụng]** khi `offeredBy_Name` chưa có.

---

## Business Rule

| Điều kiện | Trạng thái nút | Hành động |
|---|---|---|
| `offeredBy_Name` empty | `[Bắt đầu Trì Tụng]` **DISABLED** | Tooltip đỏ giải thích |
| `offeredBy_Name` đã điền | `[Bắt đầu Trì Tụng]` **ENABLED** | Proceed bình thường |

**Không có exception** — kể cả admin cũng không được bypass rule này.

---

## Input Contract

```
LittleHouseStartChantingDto {
  littleHouseId:  string
  offeredBy_Name: string    // BẮT BUỘC non-empty trước khi start
}
```

---

## Write Path

```
POST /api/engagement/little-houses/:id/start-chanting
──────────────────────────────────────────────────────
1. Load LittleHouse record.
2. Validate offeredBy_Name !== null AND offeredBy_Name.trim() !== "":
   - Nếu empty → throw 409 Conflict {
       error:   "offered_by_name_required_before_chanting",
       message: "Phải điền Tên người Tặng trước khi bắt đầu niệm. Năng lượng chưa có chủ sở hữu sẽ bị vong linh cướp mất.",
       field:   "offeredBy_Name"
     }
3. Set status = CHANTING_IN_PROGRESS, chantingStartedAt = now().
4. Audit: little-house.chanting.started.
```

---

## FE Behavior

### Màn hình Little House — trước khi start

```
┌──────────────────────────────────────────────────────────┐
│  Tiểu Phương Tử #42                                     │
│                                                          │
│  Kính tặng:   Người cần kinh của Nguyễn Thị B          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Người Tặng (Offered By) *                        │   │
│  │ [                                    ]            │   │
│  │  ↑ Phải điền trước khi bắt đầu niệm             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Bắt đầu Trì Tụng]  ← DISABLED + màu xám              │
│                                                          │
│  ⚠️ Điền Tên người Tặng để kích hoạt nút               │
└──────────────────────────────────────────────────────────┘
```

### Tooltip khi hover/tap nút disabled

```
┌──────────────────────────────────────────────────────┐
│  Bạn phải điền Tên người Tặng TRƯỚC khi bắt đầu    │
│  niệm để đánh dấu bản quyền năng lượng.            │
│                                                      │
│  Nếu niệm xong mới điền, năng lượng kinh văn sẽ   │
│  không có chủ sở hữu và dễ bị vong linh lang       │
│  thang cướp mất.                                    │
└──────────────────────────────────────────────────────┘
```

### Sau khi điền tên

- Nút [Bắt đầu Trì Tụng] chuyển sang **ENABLED** ngay lập tức (real-time, không cần submit).
- `offeredBy_Name` được auto-save vào record ngay khi user blur khỏi input (không đợi submit form).

---

## Schema Notes

```prisma
model LittleHouse {
  // ... existing fields ...
  offeredBy_Name        String?
  chantingStartedAt     DateTime?
  offeredByLockedAt     DateTime?  // timestamp khi tên được confirm lock
}
```

`offeredByLockedAt` được set khi user bấm [Bắt đầu Trì Tụng] thành công — sau đó `offeredBy_Name` không thể chỉnh sửa nữa (locked for audit integrity).

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.offered-by.saved` | User nhập tên vào field |
| `little-house.offered-by.locked` | User bấm [Bắt đầu Trì Tụng] thành công |
| `little-house.chanting.blocked-no-name` | User cố bấm khi field trống |
| `little-house.chanting.started` | Chanting session bắt đầu |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `offeredBy_Name` empty khi start | `offered_by_name_required_before_chanting` | 409 |
| `littleHouseId` không tồn tại | `not_found` | 404 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `offeredBy_Name` lock sau khi chanting start là quan trọng — không được để user edit tên sau khi đã niệm xong (sẽ phá vỡ audit chain).
- FE enable/disable nút phải là **real-time** (onChange của input), không phải chỉ check khi submit.
- Backend phải kiểm tra lại dù FE đã disable — tránh bypass qua API client.
- `offeredBy_Name` khác với `offerToRecipientName` (Kính tặng) — đây là tên **người niệm/người tặng** (bên trái tờ NNN), không phải người nhận.

---

## Related

- [little-house-recipient-syntax-validator.md](./little-house-recipient-syntax-validator.md) — Validate cú pháp trường Kính tặng (bên phải)
- [little-house-burn-physical-checks.md](./little-house-burn-physical-checks.md) — Checklist vật lý khi đốt
- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — Core Little House flow
