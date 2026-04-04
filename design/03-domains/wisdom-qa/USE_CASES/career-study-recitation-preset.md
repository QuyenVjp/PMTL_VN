# Phác Đồ Cầu Công Danh & Học Hành — Career & Study Recitation Preset

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 270)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi cầu xin sự nghiệp thành công, phỏng vấn thuận lợi, kinh doanh tốt hoặc học hành thi cử đạt kết quả — phác đồ kinh văn được fix cứng từ giáo lý. Người mới tu hay không biết chọn kinh nào hoặc tự ý set số biến sai. Tính năng One-Click Preset tự động sinh thời khóa đúng phác đồ, có giới hạn min/max được enforce.

---

## Owner module

`wisdom-qa` — DailyRecitation / RecitationPreset
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cầu sự nghiệp / học hành, tạo thời khóa từ preset
- `system` — inject thời khóa đúng phác đồ, enforce giới hạn số biến

---

## Prescribed Formula

| Kinh / Chú | Số biến tối thiểu | Số biến tối đa | Ghi chú |
|---|---|---|---|
| Chú Đại Bi (Da Bei Zhou) | 7 | 21 | — |
| Tâm Kinh (Xin Jing) | 7 | 21 | — |
| Lễ Phật Đại Sám Hối Văn (88 Buddhas) | 3 | **3** | CỐ ĐỊNH — không được > 3 |
| Chuẩn Đề Thần Chú (Cundi Dharani) | 21 | 108 | 21 / 49 / 108 — chọn 1 |

---

## Input Contract

```
CreateCareerPresetDto {
  daBeiZhouCount:    number   // 7..21
  xinJingCount:      number   // 7..21
  cundiFaCount:      21 | 49 | 108
  // 88Buddhas ALWAYS = 3 — không expose trong DTO, system inject cứng
}
```

---

## Write Path

```
POST /api/wisdom-qa/recitation-presets/career
─────────────────────────────────────────────
Body: { daBeiZhouCount, xinJingCount, cundiFaCount }

1. Validate daBeiZhouCount ∈ [7, 21].
2. Validate xinJingCount ∈ [7, 21].
3. Validate cundiFaCount ∈ [21, 49, 108].
4. Inject buddhasCount = 3 (hardcoded — không đọc từ body).
5. Tạo DailyRecitationSchedule:
   [
     { sutra: "DA_BEI_ZHOU",    count: daBeiZhouCount },
     { sutra: "XIN_JING",       count: xinJingCount },
     { sutra: "88_BUDDHAS",     count: 3 },
     { sutra: "CUNDI_DHARANI",  count: cundiFaCount }
   ]
6. Tag schedule với purpose: "CAREER_STUDY"
7. Audit: recitation-preset.career.created
```

---

## FE Behavior

### Nút One-Click trong màn hình Tạo Thời Khóa

```
Chọn mẫu thời khóa nhanh:
─────────────────────────────────────────────
[🏆 Cầu Công Danh / Học Hành]
[💊 Cầu Sức Khỏe]
[🏠 Cầu Bình An Gia Đình]
[✏️  Tùy chỉnh]
─────────────────────────────────────────────
```

### Khi user chọn [Cầu Công Danh / Học Hành]

```
┌──────────────────────────────────────────────────────────┐
│  🏆  Phác Đồ Cầu Công Danh & Học Hành                  │
│  Nguồn: Khai thị Pháp Môn Tâm Linh                    │
│                                                          │
│  Chú Đại Bi:          [7 ▼]  biến  (7–21)             │
│  Tâm Kinh:            [7 ▼]  biến  (7–21)             │
│  Lễ Phật Đại Sám Hối: [3]    biến  🔒 Cố định         │
│  Chuẩn Đề Thần Chú:   ○ 21  ○ 49  ● 108  biến        │
│                                                          │
│  [Tạo Thời Khóa Theo Phác Đồ Này]                     │
└──────────────────────────────────────────────────────────┘
```

### Khi user cố nhập Lễ Phật > 3 (nếu có input thủ công)

```
⚠️  Khuyến nghị PMTL: Giữ Lễ Phật Đại Sám Hối ở mức
    3 biến cho mục tiêu Sự Nghiệp / Thi Cử.
    (Tăng thêm không mang lại lợi ích bổ sung cho
    mục tiêu này theo giáo lý.)
```

Hiển thị warning — không hard block (user vẫn có thể override nếu dùng màn hình tùy chỉnh, nhưng preset template lock cứng = 3).

---

## Schema Notes

```prisma
model RecitationPreset {
  id          String   @id @default(cuid())
  userId      String
  purpose     String   // "CAREER_STUDY" | "HEALTH" | "FAMILY_PEACE" | "CUSTOM"
  items       Json     // [{ sutra, count }]
  createdAt   DateTime @default(now())
  isActive    Boolean  @default(true)

  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `recitation-preset.career.created` | User tạo preset từ template |
| `recitation-preset.career.88buddhas-override-warned` | User cố nhập 88 Buddhas > 3 |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `daBeiZhouCount` ngoài [7, 21] | `invalid_count` | 400 |
| `xinJingCount` ngoài [7, 21] | `invalid_count` | 400 |
| `cundiFaCount` không phải 21/49/108 | `invalid_count` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `buddhasCount = 3` inject server-side — client không thể override qua API.
- `items` lưu dạng Json array để flexible khi thêm preset mới.
- Preset không replace custom schedule — user có thể có nhiều schedule song song.
- Phase 2+: thêm các preset template khác (Cầu Sức Khỏe, Bình An Gia Đình) theo cùng pattern.

---

## Related

- [daily-recitation-system.md](./daily-recitation-system.md) — Core daily recitation flow
- [onboarding-diet-scanner.md](./onboarding-diet-scanner.md) — Auto-prescription khi onboarding
- [HARD-CAP-88-BUDDHAS.md](../REFERENCES/HARD-CAP-88-BUDDHAS.md) — Giới hạn 88 Buddhas
