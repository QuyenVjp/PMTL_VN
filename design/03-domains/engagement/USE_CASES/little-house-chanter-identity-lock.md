# Ràng Buộc "Tác Quyền" Chữ Ký Người Đốt — Chanter Identity Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Luật Quyền Sở Hữu Năng Lượng NNN
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Người nhà có thể cầm bật lửa ĐỐT THAY Tiểu Phương Tử (NNN) cho quý vị (người già, người bệnh, hoặc bất tiện). Tuy nhiên, cột "Người Tặng / Offered by" (bên trái NNN, thường là tên người đã niệm) **BẮT BUỘC phải là tên của người ĐÃ NIỆM**, không phải là tên của người cầm bật lửa đốt. Dù ai đốt, tác quyền năng lượng vẫn thuộc về người đã bấm nút đếm kinh (niệm). Nếu ghi nhầm, sẽ tạo nhầm năng lượng và mất công đức.

---

## Owner module

`engagement` — LittleHouseService / BurnLogService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Chủ Account (người đã niệm NNN)
- `helper` — Người nhà cầm bật lửa đốt thay
- `system` — Khóa chết trường "Người Tặng", ghi tên người niệm

---

## Trigger

User log burn session (ghi nhận việc đốt NNN). Nếu tick vào checkbox `[Người khác đốt thay]` (hoặc `[Burned by family member]`), hệ thống cần ngăn chặn user thay đổi tên người tặng.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Burn log: Người niệm = Current User | ✅ Allow edit "Người Tặng" field |
| Burn log: Người niệm = Current User + tick [Người khác đốt thay] | ❌ LOCK "Người Tặng" field |
| "Người Tặng" field locked | ✅ Display as Current User name (non-editable) |
| User cố ghi tên khác (ngoài form) | ❌ Server validation reject |
| Tooltip on locked field | ✅ Show: "Dù người nhà đốt thay, tác quyền năng lượng vẫn thuộc về bạn..." |

---

## Input Contract

```typescript
// Burn Log Request
interface BurnLogRequest {
  userId: string;              // Current user (niệm kinh)
  littleHouseId: string;
  burnDate: DateTime;
  isBurnedByProxy: boolean;    // [Người khác đốt thay?]
  proxyHelper?: string;        // Name of person who burned (for reference only)
  offeredByName?: string;      // User tries to edit "Người Tặng" (will be locked if proxy=true)
}

// FE should pre-fill "Người Tặng" with current user.name
```

---

## Write Path

```
POST /api/engagement/little-houses/{nnnId}/log-burn

1. Load NNN + current user
2. Validate payload:
   - If isBurnedByProxy === true:
       → Force offeredByName = user.name
       → Ignore any payload.offeredByName value
   - If isBurnedByProxy === false:
       → Allow offeredByName from payload
         (but still default to user.name for safety)

3. Create BurnLog:
   {
     id: uuid(),
     nnnId: nnnId,
     userId: userId,
     offeredByName: user.name,              // LOCKED if isBurnedByProxy
     burnDate: payload.burnDate,
     isBurnedByProxy: payload.isBurnedByProxy,
     proxyHelperName: payload.proxyHelper || null,  // For reference only
     createdAt: now()
   }

4. Emit audit event:
   - If isBurnedByProxy:
       "nnn.burn_logged_by_proxy"
   - Else:
       "nnn.burn_logged_directly"

5. Return success with message:
   - If isBurnedByProxy:
       "✅ Ghi nhận thành công. Dù [name] đốt thay,
           tác quyền năng lượng vẫn thuộc về bạn."
```

---

## FE Behavior

```
USER LOGS BURN (Not by proxy)

┌────────────────────────────────────────────┐
│  🔥 Ghi Nhận Việc Đốt NNN                 │
├────────────────────────────────────────────┤
│  Ngày đốt: [2026-04-03] ⬇️               │
│                                            │
│  Người Tặng (Người Niệm):                │
│  [Tôi (Nguyễn Văn A)] (editable)         │
│                                            │
│  ☐ Người khác đốt thay                   │
│    Tên người đốt: [_______]              │
│                                            │
│  [Huỷ] [Lưu]                            │
└────────────────────────────────────────────┘

⬇️ User checks [Người khác đốt thay] ⬇️

┌────────────────────────────────────────────┐
│  🔥 Ghi Nhận Việc Đốt NNN                 │
├────────────────────────────────────────────┤
│  Ngày đốt: [2026-04-03] ⬇️               │
│                                            │
│  Người Tặng (Người Niệm):                │
│  [Tôi (Nguyễn Văn A)] 🔒 (LOCKED)       │
│  ℹ️ Dù ai đốt, tác quyền vẫn thuộc về  │
│     người đã niệm.                      │
│                                            │
│  ☑ Người khác đốt thay                   │
│    Tên người đốt: [Mẹ tôi]              │
│                                            │
│  [Huỷ] [Lưu]                            │
└────────────────────────────────────────────┘

⬇️ After save ⬇️

┌────────────────────────────────────────────┐
│  ✅ Ghi Nhận Thành Công                   │
├────────────────────────────────────────────┤
│                                            │
│  Tiểu Phương Tử đã được đốt vào:         │
│  📅 2026-04-03                            │
│                                            │
│  Người Tặng: Tôi (Nguyễn Văn A)          │
│  Đốt bởi: Mẹ tôi                         │
│                                            │
│  🌟 Dù người nhà đốt thay, tác quyền    │
│     năng lượng vẫn thuộc về bạn. Công   │
│     đức sẽ mang đến cho bạn và gia      │
│     đình.                                │
│                                            │
│  [Quay lại]                              │
└────────────────────────────────────────────┘
```

---

## Server-Side Validation

```typescript
// In BurnLogService
validateBurnLogRequest(payload, currentUser) {
  if (payload.isBurnedByProxy === true) {
    // FORCE offeredByName to currentUser
    payload.offeredByName = currentUser.name;

    // Reject any attempt to override via API call
    if (payload.offeredByName !== currentUser.name) {
      throw new BadRequestException({
        code: "chanter_identity_locked",
        message: "Người tặng phải là người đã niệm. Không được ghi tên người đốt thay vào cột 'Người Tặng'."
      });
    }
  }
  return payload;
}
```

---

## Schema Notes

```prisma
model BurnLog {
  id                String @id @default(cuid())
  nnnId             String
  userId            String              // Person who chanted (owner of merit)
  offeredByName     String              // ALWAYS = user.name (locked if proxy)
  burnDate          DateTime
  isBurnedByProxy   Boolean @default(false)
  proxyHelperName   String?             // Name of person who physically burned (for reference)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  nnn               LittleHouse @relation(fields: [nnnId], references: [id], onDelete: Cascade)
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([nnnId, burnDate])
  @@index([userId, burnDate])
}

// Extend LittleHouse model
// burnLogs: BurnLog[]
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.burn_logged_directly` | User đốt trực tiếp |
| `nnn.burn_logged_by_proxy` | Người nhà đốt thay |
| `nnn.chanter_identity_locked` | Attempt to override offeredByName (server reject) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Attempt to change offered by name when proxy | chanter_identity_locked | 400 |
| NNN not found | nnn_not_found | 404 |
| Invalid burn date | invalid_burn_date | 400 |

---

## Notes for AI/codegen

- `offeredByName` là hard-locked khi `isBurnedByProxy = true` — không exception nào.
- Server-side validation phải strict: reject bất kỳ attempt nào để thay đổi via API.
- `proxyHelperName` là chỉ để reference/audit, không ảnh hưởng công đức.
- Tooltip phải clear để user hiểu tác quyền năng lượng logic.
- Tương lai: Có thể extend để track lịch sử "ai đốt" (for statistics), nhưng công đức vẫn thuộc người niệm.

---

## Related

- [little-house-no-inline-edit-correction-limit.md](./little-house-no-inline-edit-correction-limit.md) — No-edit lock for NNN corrections
