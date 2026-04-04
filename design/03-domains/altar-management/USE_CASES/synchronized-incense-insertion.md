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

## Notes

Synchronized insertion maintains energetic coherence for the Triple Gem offering.
