# Bộ Máy Thăng Cấp Lời Nguyện — Vow Escalation Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hoàn thành lời nguyện tạo ra đỉnh năng lượng. Hệ thống gợi ý thăng cấp tự nhiên (ăn chay 1 năm → trọn đời) phù hợp với đà tu tập của user, khuyến khích tiến xa hơn.

---

## Owner module

`vows-merit` — VowService / EscalationPrompt
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — vừa hoàn thành lời nguyện, xem xét thăng cấp
- `system` — detect completion, generate escalation suggestions

---

## Trigger

Khi vow đạt `progress = 100%` và status chuyển sang `FULFILLED`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Vow progress = 100% | ✅ Trigger escalation engine |
| Status = FULFILLED | ✅ Hiển thị escalation modal |
| User xem gợi ý | ⏳ Hiển thị 2–3 lựa chọn thăng cấp |
| User chọn thăng cấp | ✅ Tạo vow mới ở cấp cao hơn |
| User từ chối | ✅ Log choice, về normal mode |

---

## Input Contract

```typescript
interface AcceptEscalationDto {
  originalVowId: string
  selectedEscalation: string  // Tên lời nguyện mới
  targetDate?: Date
}
```

---

## Write Path

```
GET /api/vows-merit/vows/:vowId/escalation-suggestions
1. Load vow by vowId (must be FULFILLED)
2. Match vowType against ESCALATION_MAP
3. Return: { suggestions: VowEscalationSuggestion[] }

POST /api/vows-merit/vows/escalation/accept
1. Validate originalVowId = FULFILLED
2. Create new Vow based on selectedEscalation
3. Audit: vow.escalation_accepted
```

---

## Escalation Map

```typescript
const ESCALATION_MAP: Record<string, EscalationOption[]> = {
  'VEGETARIAN_1_YEAR': [
    { name: 'VEGETARIAN_3_NENG', description: 'Mỗi tháng 15 ngày chay' },
    { name: 'VEGETARIAN_LIFETIME', description: 'Cam kết suốt đời' }
  ],
  'RECITE_100K_GIAI_KET': [
    { name: 'RECITE_1M_GIAI_KET', description: 'Công đức lớn lao' },
    { name: 'RECITE_100K_DAI_BI', description: 'Chuyển sang tâm linh sâu hơn' }
  ],
  'LIFE_RELEASE_12_TIMES': [
    { name: 'LIFE_RELEASE_MONTHLY', description: 'Phóng sinh hàng tháng' },
    { name: 'LIFE_RELEASE_WEEKLY', description: 'Phóng sinh hàng tuần' }
  ]
}
```

---

## FE Behavior

```
🎉 CHÚC MỪNG!

Bạn đã hoàn thành đại nguyện:
[Ăn Chay 1 Năm] ✅

Trường khí của bạn đang rất thanh tịnh.
Đây là lúc Bồ Tát mong muốn bạn
nâng cao cấp độ tu tập.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 GỢI Ý THĂNG CẤP:

○ Ăn chay 3 năng (15 ngày/tháng)
  Hoàn thành trước: 2027-04-04

○ Ăn chay trọn đời
  Cam kết vĩnh viễn

[Chưa, Tạm Dừng]    [Chọn Thăng Cấp]
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.completion_detected` | Progress = 100% |
| `vow.escalation_modal_shown` | Suggestions displayed |
| `vow.escalation_accepted` | Vow mới tạo |
| `vow.escalation_declined` | User pass |

---

## Related

- [create-vow.md](./create-vow.md) — tạo lời nguyện cơ bản
- [broken-vow-penalty-engine.md](./broken-vow-penalty-engine.md) — penalty khi thất nguyện
