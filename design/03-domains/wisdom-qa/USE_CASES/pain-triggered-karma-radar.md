# Radar Phát Hiện Nghiệp Chướng Qua Cơn Đau — Pain-Triggered Karma Radar

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cơn đau/khó chịu đột ngột trong lúc tụng Lễ Phật Đại Sám Hối không phải bệnh — đó là nghiệp chướng đang bùng phát (debt entity manifesting). Hệ thống giúp user khai báo vị trí đau, tự động tính số tấm NNN cần đốt (4-7 tấm) cho vị trí đó và inject vào Daily Task khẩn cấp.

---

## Owner module

`wisdom-qa` — RecitationService / KarmaPainDetector
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang niệm Lễ Phật, phát hiện cơn đau đột ngột
- `system` — hiện body part selector, tính LH debt, inject task

---

## Trigger

Khi user nhấn nút `[Báo Cáo Cơn Đau Đột Ngột]` trong E-Reader (hiển thị khi đang niệm Lễ Phật Đại Sám Hối).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User đang niệm Lễ Phật | ✅ Hiển thị nút "Báo Cáo Cơn Đau Đột Ngột" |
| User nhấn nút | ✅ Show body part selector |
| Body part selected | ✅ Calculate LH debt (4-7 tấm) |
| Debt calculated | ✅ Auto-inject vào Daily Task khẩn cấp |
| Task injected | ✅ Send notification |

---

## Body Part — Debt Mapping

```typescript
const BODY_PART_LH_RANGE: Record<string, { min: number; max: number }> = {
  HEAD:       { min: 5, max: 7 },
  NECK:       { min: 4, max: 6 },
  SHOULDERS:  { min: 4, max: 7 },
  BACK:       { min: 4, max: 7 },
  ABDOMEN:    { min: 4, max: 6 },
  KNEES:      { min: 4, max: 5 },
  FEET:       { min: 4, max: 5 },
  OTHER:      { min: 4, max: 7 }
}
// Display to user as range: "4-7 tấm NNN"
```

---

## Input Contract

```typescript
interface KarmaPainReportDto {
  sessionId: string     // current recitation session
  sutraKey: string      // must be 'le_phat_dai_sam_hoi'
  bodyPart: string      // key in BODY_PART_LH_RANGE
  description?: string  // optional user notes
}

interface KarmaDebtInjectionResult {
  bodyPart: string
  minSheets: number
  maxSheets: number
  taskId: string
  urgencyLabel: 'URGENT_SAME_DAY'
}
```

---

## Write Path

```
POST /api/wisdom-qa/karma-pain-report
1. Validate sutraKey = 'le_phat_dai_sam_hoi' (only active during this sutra)
2. Look up BODY_PART_LH_RANGE[bodyPart]
3. Inject DailyTask:
   → sutraKey = 'nnn_burn'
   → count = range.min (suggest max in UI)
   → urgency = URGENT_SAME_DAY
   → reason = `KARMA_ACTIVATION_${bodyPart}`
4. Audit: karma.pain_reported, karma.lh_task_injected
```

---

## FE Behavior

```
Niệm Lễ Phật Đại Sám Hối Văn (67/108)

[🆘 Báo Cáo Cơn Đau Đột Ngột]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chọn vị trí đau:

○ Đầu/Não
○ Cổ
○ Vai/Bả vai
● Lưng
○ Bụng
○ Khớp gối
○ Chân/Bàn chân
○ Khác: [_______]

[Xác Nhận Vị Trí]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Phát Hiện Nghiệp Chướng!

Vị trí: Lưng
Hệ thống tính toán: 4-7 tấm NNN
cho Oan gia trái chủ tại Lưng.

✨ Chúc mừng! Nghiệp chướng đã trồi
lên trước khi thành bệnh nan y.

Daily Task (auto-added) [🚨 URGENT]:
"Đốt 4-7 tấm NNN — Vị trí: Lưng"

[Bắt Đầu Đốt NNN]  [Tiếp Tục Niệm]
```

---

## Audit

| Action | Trigger |
|---|---|
| `karma.pain_detected` | User reports discomfort |
| `karma.body_part_selected` | Location identified |
| `karma.debt_calculated` | 4-7 sheets range determined |
| `karma.lh_task_injected` | Auto-task created |
| `karma.urgency_set` | Priority marked |

---

## Notes for AI/codegen

- Nút "Báo Cáo Cơn Đau" chỉ hiển thị khi đang niệm `le_phat_dai_sam_hoi` — không visible cho sutras khác.
- Range (min-max) hiển thị trên UI nhưng task inject với `count = min` — user có thể đốt thêm.
- "Chúc mừng" tone trong UI là intentional — đây là dấu hiệu tốt rằng tu tập đang có hiệu quả.

---

## Related

- [heavy-karma-activation-nnn-commitment-gate.md](./heavy-karma-activation-nnn-commitment-gate.md) — karma balance enforcement
- [non-fungible-repentance-rule.md](./non-fungible-repentance-rule.md) — repentance rules
- [prescribe-karmic-remedy.md](./prescribe-karmic-remedy.md) — general remedy prescription
