# Cảnh Báo Tiền Âm Phủ Trái Ngu — Spirit Money Collision Alert

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Tiền âm phủ (Vàng mã) được thiết kế để thực hiện lòng tham của người sống. Nếu đốt tiền âm phủ cho người đã vãng sanh hoặc đang sống ở cõi Trời, Á Tú La, v.v., tiền sẽ kéo vong linh từ cõi sáng xuống Địa ngục do lòng tham. **BẮT BUỘC chỉ dùng Ngôi Nhà Nhỏ (NNN) cho người quá cố.**

---

## Owner module

`engagement` — SpiritMoneyCollisionGuard

---

## Actors

- `member` — thực hiện buổi đốt NNN cho người quá cố
- `system` — enforce spirit money prohibition for heavenly realms, block dangerous combinations

---

## Trigger

Khi user POST `/api/engagement/little-house/burn-session` để khởi động buổi đốt NNN.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Beneficiary status = DECEASED hoặc HEAVENLY_REALM | ✅ Show mandatory checkbox |
| Checkbox: "Bạn có dự định đốt Vàng mã / Tiền âm phủ trong cùng buổi lễ này không?" | ✅ Present question |
| User answers YES to spirit money | ❌ 400 spirit_money_conflicts_heavenly_nnn |
| User answers NO or no selection | ✅ Allow burn session to proceed |
| Beneficiary status = ACTIVE (living) | ➜ Skip spirit money question (different rules apply) |

---

## Input Contract

```typescript
interface InitiateBurnSessionDto {
  littleHouseId: string
  willBurnSpiritMoney: boolean    // optional, only asked for deceased
}

interface BurnSession {
  id: string
  littleHouseId: string
  beneficiaryStatus: 'ACTIVE' | 'DECEASED' | 'HEAVENLY_REALM' | 'ASURA_REALM'
  willBurnSpiritMoney: boolean
  conflictWarningAcknowledged: boolean?
  createdAt: DateTime
  updatedAt: DateTime
}

interface LittleHouse {
  // ... existing fields
  beneficiaryStatus: 'ACTIVE' | 'DECEASED' | 'HEAVENLY_REALM' | 'ASURA_REALM'
}
```

---

## Write Path

### Initiate Burn Session

```
POST /api/engagement/little-house/burn-session
Body: {
  littleHouseId: "lh_xyz",
  willBurnSpiritMoney?: true/false
}

1. Fetch LittleHouse by littleHouseId
2. Check beneficiaryStatus:

   a) If DECEASED or HEAVENLY_REALM:
      → Check willBurnSpiritMoney presence
      → If missing: return 400 missing_spirit_money_declaration
      → If willBurnSpiritMoney = true:
         • Audit: lh.burn.spirit-money-collision-detected
         • return 400 spirit_money_conflicts_heavenly_nnn
         • Message: "CỰC KỲ NGUY HIỂM: Đốt tiền âm phủ sẽ kéo vong linh người thân từ cõi Trời/A Tu La đọa ngược xuống Địa ngục do lòng tham. BẮT BUỘC chỉ dùng Ngôi Nhà Nhỏ!"
      → If willBurnSpiritMoney = false:
         • Audit: lh.burn.heavenly-beneficiary-confirmed
         • Create BurnSession with status = INITIATED
         • Allow proceed

   b) If ACTIVE or other status:
      → Create BurnSession (spirit money question not required)
      → Allow proceed

3. Return BurnSession object with status
```

---

## FE Behavior

### For Deceased or Heavenly Beneficiary

```
Buổi đốt NNN - [Người Thụ Hưởng: Nguyễn Văn A — Quá Cố]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CẢNH BÁO QUAN TRỌNG:

Bạn có dự định đốt Vàng mã / Tiền âm phủ
trong cùng buổi lễ này không?

☐ CÓ - Tôi muốn đốt tiền âm phủ
☐ KHÔNG - Tôi chỉ đốt Ngôi Nhà Nhỏ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Quay lại]  [Tiếp Tục] (disabled)

---

If user selects "CÓ":

❌ CỰC KỲ NGUY HIỂM:

Đốt tiền âm phủ sẽ kéo vong linh người thân
từ cõi Trời/A Tu La đọa ngược xuống Địa ngục
do lòng tham.

BẮT BUỘC chỉ dùng Ngôi Nhà Nhỏ!

[← Quay lại và thay đổi]

---

If user selects "KHÔNG":

✅ Xác nhận đúng

Chỉ sử dụng Ngôi Nhà Nhỏ cho buổi đốt này.

[Tiếp Tục Buổi Đốt]
```

### For Living Beneficiary

```
(No spirit money question shown)

Buổi đốt NNN - [Người Thụ Hưởng: Nguyễn Thị B — Sống]

[Tiếp Tục Buổi Đốt]
```

---

## Schema Notes

```prisma
model BurnSession {
  id                              String    @id @default(cuid())
  littleHouseId                   String    @unique
  littleHouse                     LittleHouse @relation(fields: [littleHouseId], references: [id], onDelete: Cascade)
  willBurnSpiritMoney             Boolean   @default(false)
  conflictWarningAcknowledged     Boolean?  @default(false)
  status                          String    @default("INITIATED")  // INITIATED, IN_PROGRESS, COMPLETED
  createdAt                       DateTime  @default(now())
  updatedAt                       DateTime  @updatedAt

  @@index([littleHouseId])
  @@index([status])
}

model LittleHouse {
  // ... existing fields
  beneficiaryStatus    String  @default("ACTIVE")  // ACTIVE | DECEASED | HEAVENLY_REALM | ASURA_REALM
}
```

---

## Audit

| Action | Trigger | Context |
|---|---|---|
| `lh.burn.spirit-money-collision-detected` | User selects YES to spirit money for deceased | Block initiated |
| `lh.burn.heavenly-beneficiary-confirmed` | User confirms NO spirit money for deceased | Proceed allowed |

---

## Error Handling

| Code | Status | Message | Recovery |
|---|---|---|---|
| `spirit_money_conflicts_heavenly_nnn` | 400 | CỰC KỲ NGUY HIỂM: Đốt tiền âm phủ sẽ kéo vong linh người thân từ cõi Trời/A Tu La đọa ngược xuống Địa ngục do lòng tham. BẮT BUỘC chỉ dùng Ngôi Nhà Nhỏ! | Select NO to spirit money question |
| `missing_spirit_money_declaration` | 400 | Vui lòng trả lời câu hỏi về tiền âm phủ | Complete checkbox before proceeding |
| `beneficiary_status_unknown` | 400 | Không thể xác định trạng thái người thụ hưởng | Update beneficiary record first |

---

## Notes for AI/codegen

- **Hard block:** If willBurnSpiritMoney = true for DECEASED or HEAVENLY_REALM, return 400 immediately.
- **Mandatory checkbox:** For deceased/heavenly beneficiaries, the spirit money question MUST be answered before proceeding.
- **Living beneficiaries:** If status = ACTIVE, skip the spirit money question entirely (different rules apply).
- **Audit both paths:** Log both collision detection and confirmation for monitoring.
- The error message is culturally specific and must NOT be modified — it reflects official Dharma teaching.

---

## Related

- [no-altar-prerequisite-enforcer.md](./no-altar-prerequisite-enforcer.md) — altar availability check
- [burn-container-altitude-constraint.md](./burn-container-altitude-constraint.md) — physical positioning requirement
- [deathbed-lockdown-protocol.md](./deathbed-lockdown-protocol.md) — end-of-life safety rules
