# Quy Tắc Cắm Nhang Đồng Bộ — Synchronized Incense Insertion

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi dâng 3 nén nhang cho Phật, người tu **BẮT BUỘC PHẢI cắm cả 3 nén nhang CÙNG MỘT LÚC** vào lư hương. Tuyệt đối không được tách chúng ra hay cắm từng nên một. Nếu cắm riêng lẻ, năng lượng sẽ mất cân bằng.

---

## Owner module

`altar-management` — IncenseService / SynchronizationValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User initiates incense offering | ✅ Load incense insertion UI |
| User inserts 1st incense stick | ⏸️ Block until all 3 ready |
| User inserts 2nd incense stick | ⏸️ Still blocked, waiting for 3rd |
| User inserts all 3 together | ✅ Accept synchronized insertion |
| Insertion is staggered/sequential | ❌ Reject, show correction message |
| All 3 in holder | ✅ Complete offering, log audit |

---

## FE Behavior

```
Incense Offering Ritual:

[3 incense stick slots]

Instructions:
Hãy cắm cả 3 nên nhang CÙNG MỘT LÚC
để duy trì năng lượng cân bằng.

Tuyệt đối KHÔNG được tách riêng
hoặc cắm từng cây một.

[Xác nhận - Cắm 3 nên nhang cùng lúc]
(disabled until all 3 in hand)

VALID:   [🕯️][🕯️][🕯️] ✅
INVALID: [🕯️][  ][  ] ❌
```

---

## Audit

| Action | Trigger |
|---|---|
| `incense.offering_initiated` | User starts incense ritual |
| `incense.synchronized_insertion_detected` | All 3 sticks inserted together |
| `incense.staggered_insertion_rejected` | Sequential insertion blocked |
| `incense.offering_completed` | Synchronized insertion confirmed |

---

## Part B: Quy Tắc Số Nén Nhang Theo Cấu Hình Bàn Thờ

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 377, 378, 827, 828)

Số nén nhang bắt buộc phụ thuộc vào cấu hình bàn thờ (số tượng × số lư hương):

| Cấu hình bàn thờ | Số nén nhang bắt buộc |
|---|---|
| `statueCount = 1`, `burnerCount = 1` | `requiredSticks = 1` nén |
| `statueCount > 1`, `burnerCount = statueCount` (mỗi vị 1 lư) | `requiredSticks = 1` nén/lư hương |
| `statueCount > 1`, `burnerCount = 1` (dùng chung 1 lư) | `requiredSticks = 3` nén — bắt buộc |

**Khi dùng 1 lư hương chung cho nhiều Bồ Tát**, bắt buộc dâng đúng 3 nén mỗi buổi và **cắm đồng thời cùng lúc** (theo Part A ở trên).

### Input Contract bổ sung

```typescript
interface AltarProfile {
  statueCount: number
  burnerCount: number
}

interface LogIncenseSessionDto {
  altarProfileId: string
  stickCount:     number   // số nén user cắm
}
```

### Write Path bổ sung

```
POST /api/altar-management/incense/log-session

1. Load AltarProfile (statueCount, burnerCount)
2. Compute requiredSticks:
   if statueCount > 1 AND burnerCount == 1:
     requiredSticks = 3
   else:
     requiredSticks = 1  // per burner
3. Validate dto.stickCount == requiredSticks:
   → If dto.stickCount != requiredSticks:
     throw 400 { error: 'incense_stick_count_mismatch',
                 required: requiredSticks,
                 provided: dto.stickCount }
4. Proceed with synchronized insertion validation (Part A)
```

### FE Behavior bổ sung

Khi `statueCount > 1 AND burnerCount == 1`, UI tự động hiển thị label nhắc nhở:

```
┌───────────────────────────────────────────────────────┐
│ 🏛️  Bàn thờ: 3 Bồ Tát — 1 Lư hương chung             │
│───────────────────────────────────────────────────────│
│ Luật PMTL: Dùng 1 lư hương chung bắt buộc dâng        │
│ đúng 3 nén nhang mỗi buổi, cắm cùng lúc.              │
│                                                        │
│ Số nén nhang: [3] (cố định — không thể thay đổi)      │
│                                                        │
│ Tuyệt đối không cắm 1 hoặc 2 nén khi dùng lư chung.  │
└───────────────────────────────────────────────────────┘
```

### Errors bổ sung

| Condition | Code | HTTP |
|---|---|---|
| Nhập số nén khác `requiredSticks` | `incense_stick_count_mismatch` | 400 |

---

## Notes

Synchronized insertion maintains energetic coherence for the Triple Gem offering. Số nén nhang (`requiredSticks`) được tính động dựa trên `AltarProfile` — không hard-code trong UI.
