# Quy Tắc Không Thay Thế Sám Hối — Non-Fungible Repentance Rule

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

*Thất Phật Diệt Tội Chân Ngôn* xóa các ác nghiệp nhỏ hằng ngày. *Lễ Phật Đại Sám Hối Văn* xóa các ác nghiệp lớn từ kiếp trước. Hai bài kinh này KHÔNG thay thế được cho nhau. Hệ thống phát hiện khi user cố loại bỏ Lễ Phật để thay vào bằng Thất Phật và chặn cấu hình nguy hiểm này.

---

## Owner module

`wisdom-qa` — DailyRecitationService / RepentanceSubstitutionGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cấu hình Daily Task
- `system` — validate recitation plan, block substitution

---

## Trigger

Khi user lưu Daily Task config với Lễ Phật = 0 (hoặc < 1) trong khi Thất Phật > 21.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| lePhatCount ≥ 1 | ✅ ALLOWED — cấu hình hợp lệ |
| lePhatCount = 0 AND thatPhatCount ≤ 21 | ✅ ALLOWED (no substitution intent) |
| lePhatCount = 0 AND thatPhatCount > 21 | ❌ BLOCK — substitution detected |
| lePhatCount < 3 AND thatPhatCount > 21 | ⚠️ WARNING — near-substitution |
| User acknowledges warning | ✅ Allow save with warning |
| BLOCK condition: user acknowledges modal | ❌ Still blocked — must add ≥ 1 Lễ Phật |

---

## Input Contract

```typescript
interface DailyTaskConfigDto {
  lePhatCount: number      // Lễ Phật Đại Sám Hối
  thatPhatCount: number    // Thất Phật Diệt Tội
  daiBiCount: number
  // ...other sutras
}

interface SubstitutionValidationResult {
  valid: boolean
  severity: 'BLOCK' | 'WARN' | null
  message: string | null
  code: string | null
}

function validateRepentancePlan(dto: DailyTaskConfigDto): SubstitutionValidationResult {
  // FORBIDDEN: removing Lễ Phật entirely while boosting Thất Phật
  if (dto.lePhatCount === 0 && dto.thatPhatCount > 21) {
    return {
      valid: false,
      severity: 'BLOCK',
      message: 'THẤT PHẬT KHÔNG THỂ THAY THẾ LỄ PHẬT',
      code: 'repentance_substitution_forbidden'
    }
  }
  // WARNING: very low Lễ Phật with high Thất Phật
  if (dto.lePhatCount < 3 && dto.thatPhatCount > 21) {
    return {
      valid: false,
      severity: 'WARN',
      message: 'Bạn cần ít nhất 3 biến Lễ Phật để xử lý nghiệp lớn kiếp trước',
      code: 'low_le_phat_warning'
    }
  }
  return { valid: true, severity: null, message: null, code: null }
}
```

---

## Write Path

```
PATCH /api/wisdom-qa/daily-task/config
1. Run validateRepentancePlan(dto)
2. If severity = 'BLOCK':
   → return 400 { code: 'repentance_substitution_forbidden' }
3. If severity = 'WARN':
   → return 422 { code: 'low_le_phat_warning', requiresAcknowledgment: true }
   → Re-submit with { acknowledged: true } to override warning
4. If valid:
   → Save config, audit: repentance.valid_config_saved
```

---

## FE Behavior

```
❌ CẢNH BÁO: THAY THẾ KHÔNG ĐƯỢC PHÉP

THẤT PHẬT KHÔNG THỂ THAY THẾ LỄ PHẬT!

─────────────────────────────────────────

Lý do:

• Thất Phật Diệt Tội Chân Ngôn:
  → Xóa các ác nghiệp NHỎ hàng ngày
  → Phù hợp cho việc dưỡng sinh

• Lễ Phật Đại Sám Hối Văn:
  → Xóa các ác nghiệp LỚN kiếp trước
  → Bắt buộc cho việc tu hành sâu

─────────────────────────────────────────

Bạn không thể bỏ Lễ Phật để thay vào
là Thất Phật, vì kiếp trước của bạn
vẫn còn nợ nghiệp chưa được trả.

─────────────────────────────────────────

✅ GIẢI PHÁP:

Bạn bắt buộc phải có ít nhất
1 biến Lễ Phật trong thời khóa.

□ Thêm 1 biến Lễ Phật
□ Giữ 3-5 biến Lễ Phật + 21 Thất Phật

[Hủy]  [Chỉnh Sửa Cấu Hình]
(modal cannot be "confirmed" without removing the substitution)
```

---

## Audit

| Action | Trigger |
|---|---|
| `repentance.substitution_attempted` | Lễ Phật=0, Thất Phật>21 |
| `repentance.substitution_blocked` | API returns 400 |
| `repentance.low_le_phat_warned` | Lễ Phật<3, Thất Phật>21 |
| `repentance.config_corrected` | User adjusts plan |
| `repentance.valid_config_saved` | Safe plan saved |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Lễ Phật=0 AND Thất Phật>21 | `repentance_substitution_forbidden` | 400 |
| Lễ Phật<3 AND Thất Phật>21 | `low_le_phat_warning` | 422 |

---

## Notes for AI/codegen

- Validation xảy ra cả ở API level (trả về lỗi) và FE level (disable save button).
- BLOCK condition không thể bypass bằng `acknowledged: true` — khác với WARN.
- Threshold 21 cho Thất Phật là ngưỡng "high usage"; nếu user chỉ có 7-10 Thất Phật, không cần warning ngay cả khi Lễ Phật = 0.

---

## Related

- [heavy-karma-activation-nnn-commitment-gate.md](./heavy-karma-activation-nnn-commitment-gate.md) — karma cascade
- [daily-recitation-system.md](./daily-recitation-system.md) — core recitation system
