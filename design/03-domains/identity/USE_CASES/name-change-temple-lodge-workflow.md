# Luồng Đốt Đơn Thăng Văn Tại Chùa — Temple Lodge Workflow for Name Change Form

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 414, 866)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user không có bàn thờ Phật tại nhà và muốn làm "Đơn Thăng Văn Đổi Tên", họ bắt buộc phải ra Chùa/Miếu để đốt. Lời khấn tại Chùa **hoàn toàn khác** với lời khấn tại nhà (đề cập đến chư Phật trong miếu thay vì bàn thờ nhà). Vị trí đốt bị ràng buộc chặt: phải đốt **trong lò đốt vàng mã/nhang của Chùa** — tuyệt đối không đốt dưới đất.

---

## Owner module

`identity` — SpiritualFormSubmission / NameChangeApplication
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — không có bàn thờ tại nhà, ra Chùa đốt đơn
- `system` — detect `locationType`, render lời khấn động, cảnh báo vị trí đốt

---

## Trigger

Trong flow **Đơn Thăng Văn Đổi Tên**, user chọn:
`Nơi thực hiện:` → `○ Tại nhà (có bàn thờ)` / `● Tại Chùa/Miếu`

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `locationType = HOME_ALTAR` | Lời khấn chuẩn tại nhà, không cần temple input |
| `locationType = BUDDHIST_TEMPLE` | Inject `templeName` vào lời khấn, hiện cảnh báo vị trí đốt |
| Đốt dưới đất tại Chùa | ❌ FORBIDDEN — phải dùng lò đốt của Chùa |
| Đốt ngoài sân không có lò | ❌ FORBIDDEN |

---

## Input Contract

```typescript
interface SubmitNameChangeFormDto {
  originalNames: string[]  // Tên cũ (ít nhất 1). Có thể khai báo nhiều: tên thật, tên thường gọi, tên ngoại kiều, biệt danh...
  newName:       string
  locationType:  "HOME_ALTAR" | "BUDDHIST_TEMPLE"
  templeName?:   string    // bắt buộc nếu locationType = BUDDHIST_TEMPLE
}
// Validation: originalNames.length >= 1, mỗi phần tử non-empty string
```

---

## Write Path

```
POST /api/identity/spiritual-forms/name-change
───────────────────────────────────────────────
Body: SubmitNameChangeFormDto

1. Nếu locationType = BUDDHIST_TEMPLE:
   a. Validate templeName non-empty.
      → Nếu empty: HTTP 400 { error: "temple_name_required" }
   b. Generate temple prayer payload (xem dưới).

2. Nếu locationType = HOME_ALTAR:
   a. Generate home prayer payload (standard).

2a. Validate originalNames.length >= 1 và mọi phần tử non-empty.
    → Nếu rỗng: HTTP 400 { error: "original_names_required" }

3. Insert NameChangeFormSubmission:
   {
     userId, originalNames, newName,
     locationType, templeName,
     prayerPayload (JSON),
     submittedAt: now(),
     status: "PENDING_BURN"
   }

4. Return { formId, prayerText, burningInstructions }
```

### Dynamic Prayer Generator

```typescript
function generateNameChangePrayer(dto: SubmitNameChangeFormDto): string {
  const primaryName = dto.originalNames[0]
  const allNames = dto.originalNames.join(', ')  // "Nguyễn Văn A, A Tèo, John Nguyen"

  if (dto.locationType === "HOME_ALTAR") {
    return `Nam Mô A Di Đà Phật. Con là ${primaryName}, hôm nay thành tâm trước bàn thờ Phật tại gia, kính xin chư Phật Bồ Tát chứng giám cho con đổi tên từ ${allNames} sang ${dto.newName}. Xin cập nhật hồ sơ tâm linh tại Thiên giới và Địa phủ...`
  }

  if (dto.locationType === "BUDDHIST_TEMPLE") {
    return `Nam Mô A Di Đà Phật. Con là ${primaryName}, hôm nay đến ${dto.templeName} để thỉnh an chư Phật Bồ Tát trong miếu. Xin các chư Phật Bồ Tát trong ${dto.templeName} làm chứng cho con đổi tên từ ${allNames} sang ${dto.newName}. Xin cập nhật hồ sơ tâm linh tại Thiên giới và Địa phủ...`
  }
}
// Lý do dùng allNames: Nếu người tu có nhiều tên (tên thật + biệt danh + tên ngoại kiều),
// tất cả phải được khai báo để hồ sơ thiên giới cập nhật đầy đủ.
```

---

## FE Behavior

### Step 0 — Khai Báo Tên Cũ (Multi-Alias)

```
┌──────────────────────────────────────────────────────────┐
│  Tên cũ của bạn (tất cả tên đang dùng hoặc đã dùng):   │
│                                                          │
│  Tên 1:  [Nguyễn Văn A                               ]  │
│  Tên 2:  [A Tèo                                      ]  ← tên thường gọi
│  Tên 3:  [John Nguyen                                ]  ← tên ngoại kiều
│                                                          │
│  [+ Thêm tên cũ]                                        │
│                                                          │
│  ℹ️  Khai báo đầy đủ tất cả các tên để Bồ Tát          │
│      cập nhật hồ sơ tâm linh chính xác.                │
└──────────────────────────────────────────────────────────┘
```

**[+ Thêm tên cũ]** button: append thêm một input field mới vào danh sách. Không giới hạn số lượng. Mỗi tên có nút [x] để xóa. Tên đầu tiên là bắt buộc (primary name), các tên sau optional.

---

### Step 1 — Chọn Nơi Thực Hiện

```
Nơi thực hiện nghi lễ đốt đơn:
○ Tại nhà — tôi có bàn thờ Phật
● Tại Chùa / Miếu — tôi không có bàn thờ tại nhà
```

### Step 2 — Nhập Tên Chùa (chỉ hiện khi chọn Chùa)

```
┌──────────────────────────────────────────────────────────┐
│  Tên ngôi Chùa / Miếu bạn đang đứng:                   │
│  [Chùa Quan Âm                                         ] │
│                                                          │
│  ℹ️  Tên Chùa sẽ được đưa vào lời khấn để chư Phật    │
│      trong miếu làm chứng.                             │
└──────────────────────────────────────────────────────────┘
```

### Step 3 — Lời Khấn & Hướng Dẫn Đốt (Temple version)

```
┌──────────────────────────────────────────────────────────┐
│  📜  Lời Khấn Tại Chùa Quan Âm                         │
│                                                          │
│  "Nam Mô A Di Đà Phật. Con là [Tên cũ], hôm nay       │
│  đến Chùa Quan Âm để thỉnh an chư Phật Bồ Tát         │
│  trong miếu. Xin các chư Phật Bồ Tát trong Chùa       │
│  Quan Âm làm chứng cho con..."                         │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  🔴  HƯỚNG DẪN ĐỐT TẠI CHÙA — QUAN TRỌNG:            │
│                                                          │
│  TUYỆT ĐỐI không đốt dưới đất hoặc ngoài sân.        │
│  BẮT BUỘC bỏ đơn vào LÒ ĐỐT NHANG/ĐỐT GIẤY          │
│  của nhà Chùa.                                         │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model NameChangeFormSubmission {
  id             String   @id @default(cuid())
  userId         String
  originalNames  String[] // PostgreSQL text[] — tên cũ (1+), bao gồm biệt danh và tên ngoại kiều
  newName        String
  locationType   String   // "HOME_ALTAR" | "BUDDHIST_TEMPLE"
  templeName     String?  // null nếu HOME_ALTAR
  prayerPayload  Json     // generated prayer text
  status         String   @default("PENDING_BURN")  // → "BURNED"
  submittedAt    DateTime @default(now())
  burnedAt       DateTime?

  user           User     @relation(fields: [userId], references: [id])
}
// Migration: ALTER TABLE "NameChangeFormSubmission" ADD COLUMN "originalNames" TEXT[] NOT NULL DEFAULT '{}'
```

---

## Audit

| Action | Trigger |
|---|---|
| `name-change-form.submitted.home` | Submit tại nhà |
| `name-change-form.submitted.temple` | Submit tại Chùa |
| `name-change-form.burned` | User xác nhận đã đốt |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `originalNames` array rỗng hoặc thiếu | `original_names_required` | 400 |
| `locationType = BUDDHIST_TEMPLE` + `templeName` empty | `temple_name_required` | 400 |
| `newName` empty | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `prayerPayload` lưu JSON để FE render rich text (có thể bold tên Chùa, tên người).
- `templeName` là free-text — không validate against database vì Chùa ở khắp nơi.
- Phase 2+: có thể thêm `LocationType.OUTDOORS_SKY_FACING` nếu có khai thị về phương án thứ 3.

---

## Related

- [dual-name-spiritual-legal.md](./dual-name-spiritual-legal.md) — spiritualName vs legalName
- [NAME-CHANGE-RETROACTIVE.md](../REFERENCES/NAME-CHANGE-RETROACTIVE.md) — Điều kiện đổi tên
- [little-house-sky-facing-burn-gate.md](../../engagement/USE_CASES/little-house-sky-facing-burn-gate.md) — Sky-facing gate khi đốt NNN không bàn thờ
