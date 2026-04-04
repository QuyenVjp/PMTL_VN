# Rào Chắn Tuổi & Bệnh Lý Cho Thần Chú Trường Thọ — Lifespan Mantra Age Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 264, 265, 274)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Bài chú *Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni* được chỉ định đặc biệt cho người cao tuổi (60-70+), người mắc bệnh nan y, hoặc người có đại kiếp nạn định sẵn theo năm. Người trẻ khỏe mạnh tự ý thêm vào thời khóa với số lượng lớn sẽ phân tán tâm lực vào mục tiêu không phù hợp, thay vì tập trung vào Chú Đại Bi và Tâm Kinh.

---

## Owner module

`vows-merit` — DailyRecitationSetupService / MantaAgeGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người cấu hình thời khóa tụng niệm
- `system` — kiểm tra độ tuổi và trạng thái sức khỏe, hiển thị soft-block alert

---

## Trigger

Khi user thêm bài chú `LIFESPAN_MANTRA` (Thánh Vô Lượng Thọ...) vào thời khóa hàng ngày với `dailyCount >= 49`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `profile.age >= 60` | ✅ ALLOWED — không cần cảnh báo |
| `healthStatus = SEVERE_ILLNESS` | ✅ ALLOWED — người bệnh nan y |
| `calendarFlags.calamityYear369 = true` | ✅ ALLOWED — đại kiếp nạn định sẵn |
| `profile.age < 60` VÀ không có flag trên | ⚠️ SOFT WARNING — hiện alert, không chặn |
| User dismiss alert | ✅ ALLOWED — quyết định cuối thuộc user |

---

## Input Contract

```typescript
interface AddMantaToScheduleDto {
  mantaType: 'LIFESPAN_MANTRA' | string
  dailyCount: number
  userId: string
}

interface MemberHealthContext {
  age: number
  healthStatus: 'NORMAL' | 'SEVERE_ILLNESS' | 'CHRONIC_ILLNESS'
  calamityYear369: boolean  // flag từ CalendarService
}
```

---

## Write Path

```
POST /api/vows-merit/recitation-schedule/add-mantra

1. Load MemberHealthContext (age, healthStatus, calamityYear369)
2. If dto.mantaType == 'LIFESPAN_MANTRA' AND dto.dailyCount >= 49:
   a. Check: age >= 60 OR healthStatus in [SEVERE_ILLNESS] OR calamityYear369 == true
   b. If NONE of the above → return 200 with warnings: [{ code: 'lifespan_mantra_age_advisory', severity: 'WARNING' }]
   c. If conditions met → return 200 without warning
3. Insert RecitationScheduleItem
```

---

## FE Behavior

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Lưu Ý Trước Khi Bắt Đầu                             │
│─────────────────────────────────────────────────────────│
│ Kinh chú Thánh Vô Lượng Thọ chủ yếu dành cho:          │
│  • Người cao tuổi (60 tuổi trở lên)                     │
│  • Người đang đối mặt với bệnh hiểm nghèo               │
│  • Người đang trong đại kiếp nạn/368                    │
│                                                         │
│ Nếu bạn đang khỏe mạnh và tuổi còn trẻ, hãy cân nhắc  │
│ tập trung vào Chú Đại Bi và Tâm Kinh — hiệu quả        │
│ hơn rất nhiều cho giai đoạn tu tập hiện tại của bạn.   │
│                                                         │
│         [Tôi Hiểu, Vẫn Muốn Thêm]   [Đổi Sang Đại Bi] │
└─────────────────────────────────────────────────────────┘
```

- Nút `[Tôi Hiểu, Vẫn Muốn Thêm]` → cho phép tiếp tục, log `mantra.age_advisory_dismissed`
- Nút `[Đổi Sang Đại Bi]` → redirect sang chọn `GREAT_COMPASSION_MANTRA`
- Alert KHÔNG chặn (soft-block), không trả về 4xx

---

## Schema Notes

```prisma
model RecitationScheduleItem {
  // ... existing fields ...
  mantaType       String
  dailyCount      Int
  ageAdvisoryAck  Boolean  @default(false)
  // Migration: ALTER TABLE "RecitationScheduleItem" ADD COLUMN "ageAdvisoryAck" BOOLEAN DEFAULT FALSE
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `mantra.lifespan.age_advisory_shown` | Người dùng < 60 tuổi thêm chú với số lượng lớn |
| `mantra.lifespan.age_advisory_dismissed` | User bấm "Vẫn Muốn Thêm" |
| `mantra.lifespan.redirected_to_great_compassion` | User bấm "Đổi Sang Đại Bi" |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Không có lỗi — chỉ warning | `lifespan_mantra_age_advisory` | 200 + warnings[] |

---

## Notes for AI/codegen

- Rule này là SOFT WARNING — không bao giờ trả về 4xx hay block cứng
- `calamityYear369` được tính bởi `CalendarService.detectCalamityYear369(userId)` — đã documented tại `detect-369-calamity-year.md`
- Phase 2+: Nếu có HealthRecord từ module `wisdom-qa`, có thể cross-check với `SEVERE_ILLNESS` flag
- Số `49` là ngưỡng "số lượng lớn" — có thể config thành `LIFESPAN_MANTRA_HIGH_VOLUME_THRESHOLD`

---

## Related

- [detect-369-calamity-year.md](../../calendar/USE_CASES/detect-369-calamity-year.md) — calamityYear369 flag source
- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — hệ thống thời khóa tổng
