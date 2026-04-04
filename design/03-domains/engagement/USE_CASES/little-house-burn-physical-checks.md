# Kiểm Tra Vật Lý Khi Đốt Tiểu Phương Tử — Burn Physical Safety Checklist

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Cẩm nang Ngôi Nhà Nhỏ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hai quy tắc vật lý cứng khi đốt Tiểu Phương Tử (NNN):

1. **Tweezer Placement (Logic 2)** — Kẹp nhíp vào **mép giấy trống**, tuyệt đối không kẹp đè lên vòng tròn chấm đỏ. Kẹp đè sẽ làm hỏng năng lượng kinh văn tại vòng tròn đó.
2. **Complete Combustion (Logic 3)** — Phải đốt cháy **triệt để toàn bộ tờ giấy**. Còn sót mảnh vụn chưa cháy = séc cõi âm bị rách, vong linh không nhận được.

Cả hai được enforce qua **checklist bắt buộc** tại hai thời điểm khác nhau trong burn flow.

---

## Owner module

`engagement` — LittleHouse burn flow
[xem CONTRACTS.md](../CONTRACTS.md)

Phối hợp: `vows-merit` (burn session tracking)

---

## Actors

- `member` — thực hiện đốt NNN
- `system` — enforce pre-burn và post-burn checklist, block submit nếu chưa đủ

---

## Burn Flow Integration

```
[Bắt đầu Đốt]
      │
      ▼
PRE-BURN CHECKLIST (Logic 2 — Tweezer Placement)
      │ (tất cả checked)
      ▼
[User đốt tờ NNN]
      │
      ▼
POST-BURN CHECKLIST (Logic 3 — Complete Combustion)
      │ (tất cả checked hoặc remediation done)
      ▼
BURN COMPLETED ✓
```

---

## Part A — Pre-Burn Checklist (Logic 2: Tweezer Placement)

### Business Rule

Nhíp gắp NNN phải kẹp vào **mép giấy trống** — phần giấy không có vòng tròn chấm đỏ. Kẹp đè lên vòng tròn đỏ làm hỏng năng lượng tại điểm đó, dẫn đến tờ NNN bị lỗi một phần.

### Pre-Burn Checklist Items

```
Trước khi bắt đầu đốt:

[_] Tôi đã kiểm tra và đặt nhíp kẹp vào mép giấy trống,
    KHÔNG kẹp đè lên bất kỳ vòng tròn chấm đỏ nào.

[_] Tôi đã chuẩn bị nơi đốt an toàn (bát/lư đốt phù hợp).
```

### FE Behavior

```
┌──────────────────────────────────────────────────────────┐
│  Chuẩn Bị Đốt — Kiểm Tra Trước Khi Đốt                 │
│                                                          │
│  [_] Tôi kẹp nhíp vào PHẦN GIẤY TRỐNG,                 │
│      KHÔNG kẹp đè lên vòng tròn chấm đỏ nào.           │
│      💡 Kẹp đè lên chấm đỏ sẽ làm hỏng năng lượng      │
│         kinh văn tại vòng đó.                           │
│                                                          │
│  [_] Tôi đã chuẩn bị lư/bát đốt an toàn.              │
│                                                          │
│  [Bắt đầu đốt →]   ← disabled cho đến khi tích đủ      │
└──────────────────────────────────────────────────────────┘
```

---

## Part B — Post-Burn Checklist (Logic 3: Complete Combustion)

### Business Rule

Tờ NNN phải cháy hết **100%** thành tro đen. Bất kỳ mảnh vụn giấy nào còn sót = tờ séc cõi âm bị rách = vong linh không nhận được năng lượng. Nếu còn sót giấy, phải **đốt ngay lập tức** mảnh còn sót đó.

### Post-Burn Checklist Items

```
Sau khi đốt xong:

[_] Tôi xác nhận toàn bộ tờ giấy đã hóa thành tro đen,
    KHÔNG còn sót lại bất kỳ mảnh vụn chưa cháy nào.
```

### Branching Logic

```
if (allBurntConfirmed === true):
  → Set LittleHouseBurnSession.status = COMPLETED
  → Audit: little-house.burn.completed-fully

if (allBurntConfirmed === false):
  → Show Remediation Modal (xem bên dưới)
  → Block completion until remediation confirmed
```

### Remediation Modal (khi còn sót giấy)

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️  Còn Mảnh Giấy Chưa Cháy Hết                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Tờ séc cõi âm bị rách sẽ khiến vong linh không        │
│  nhận được năng lượng.                                  │
│                                                          │
│  Hãy dùng bật lửa đốt cháy nốt phần giấy còn sót      │
│  ngay lập tức trước khi tro nguội.                      │
│                                                          │
│  [_] Tôi đã đốt cháy hết mảnh giấy còn sót.           │
│                                                          │
│  [Xác nhận đã đốt hết]  ← disabled cho đến khi tích    │
└──────────────────────────────────────────────────────────┘
```

---

## Write Path

### Pre-Burn Confirm

```
POST /api/engagement/little-houses/:id/burn/pre-check
──────────────────────────────────────────────────────
Body: {
  tweezersOnBlankEdge:   boolean   // Logic 2
  burnAreaReady:         boolean
}

1. Validate tất cả = true.
2. Set LittleHouseBurnSession.preBurnCheckedAt = now().
3. Set status = BURNING.
4. Audit: little-house.burn.pre-check.passed.
```

### Post-Burn Confirm

```
POST /api/engagement/little-houses/:id/burn/post-check
───────────────────────────────────────────────────────
Body: {
  fullyBurntToAsh:       boolean   // Logic 3
  remediationDone?:      boolean   // nếu fullyBurntToAsh = false ban đầu
}

1. Nếu fullyBurntToAsh = true:
   → Set status = COMPLETED, burnCompletedAt = now().
   → Audit: little-house.burn.completed-fully.

2. Nếu fullyBurntToAsh = false AND remediationDone = true:
   → Set status = COMPLETED, burnCompletedAt = now().
   → Set hadScraps = true (analytics flag).
   → Audit: little-house.burn.completed-with-remediation.

3. Nếu fullyBurntToAsh = false AND remediationDone = false/missing:
   → throw 422 {
       error:   "incomplete_combustion_unresolved",
       message: "Phải đốt cháy hết mảnh giấy còn sót trước khi hoàn thành."
     }
```

---

## Schema Notes

```prisma
model LittleHouseBurnSession {
  id                    String    @id @default(cuid())
  littleHouseId         String
  userId                String
  status                BurnSessionStatus
  preBurnCheckedAt      DateTime?
  burnStartedAt         DateTime?
  postBurnCheckedAt     DateTime?
  burnCompletedAt       DateTime?
  hadScraps             Boolean   @default(false)  // analytics: có sót giấy không?

  littleHouse           LittleHouse @relation(fields: [littleHouseId], references: [id])
  user                  User        @relation(fields: [userId], references: [id])
}

enum BurnSessionStatus {
  PENDING
  PRE_CHECKED
  BURNING
  POST_CHECK_PENDING
  COMPLETED
  ABANDONED
}
```

`hadScraps` là analytics field — admin có thể xem có bao nhiêu % user gặp vấn đề đốt chưa hết.

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.burn.pre-check.passed` | Pre-burn checklist đủ |
| `little-house.burn.post-check.scraps-found` | User tick "còn sót giấy" |
| `little-house.burn.completed-fully` | Cháy hết từ đầu |
| `little-house.burn.completed-with-remediation` | Đốt thêm mảnh còn sót |

---

## Related

- [little-house-anti-theft-field-lock.md](./little-house-anti-theft-field-lock.md) — offeredBy lock trước khi niệm
- [little-house-recipient-syntax-validator.md](./little-house-recipient-syntax-validator.md) — Cú pháp Kính tặng
- [self-cultivation-sutras-burn-flow.md](../../engagement/USE_CASES/self-cultivation-sutras-burn-flow.md) — Burn flow cho Kinh Văn Tự Tu (tương tự pattern)
