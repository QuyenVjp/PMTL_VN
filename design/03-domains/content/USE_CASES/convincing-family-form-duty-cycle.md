# Chu kỳ An toàn của "Thăng Văn Khuyến Đạo" — Convincing Family Form Duty Cycle

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Thăng Văn Khuyên Đạo là đơn xin Bồ Tát mở trí tuệ cho người nhà. Nếu xin liên tục không ngừng, công đức sẽ chuyển hết cho người nhà, dẫn đến kiệt quệ năng lượng.

---

## Owner module

`content` — SacredFormsService / DutyCycleGatekeeper

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Log Thăng Văn ≤ 30 ngày liên tục | ✅ ALLOWED |
| Log Thăng Văn = 30 ngày | ⚠️ Trigger auto-cooldown |
| Hệ thống khóa chức năng (7 ngày Cooldown) | ❌ DISABLED |
| Sau 7 ngày Cooldown kết thúc | ✅ Re-enable |

---

## Audit

| Action | Trigger |
|---|---|
| `form.thang_van.cycle_start` | Người dùng log Thăng Văn lần đầu |
| `form.thang_van.day_30_reached` | Đạt 30 ngày liên tục |
| `form.thang_van.cooldown_activated` | Khóa 7 ngày |
| `form.thang_van.cooldown_ended` | Mở khóa trở lại |

---

## Notes

System enforces mandatory 7-day rest period after 30-day continuous cycle to prevent user energy depletion.