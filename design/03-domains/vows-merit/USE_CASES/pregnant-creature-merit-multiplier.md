# Nhân Bội Công Đức Sinh Vật Mang Thai — Pregnant Creature Merit Multiplier

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cứu sinh vật mang thai đồng nghĩa với việc cứu vô số sinh mạng đang chứa trong bụng/trứng. Hệ thống phát hiện khi user khai báo sinh vật mang thai trong sự kiện phóng sinh, gắn nhãn "Vô Lượng Công Đức" và gợi ý trì tụng thêm *Công Đức Bảo Sơn Thần Chú* để chuyển hóa lượng công đức khổng lồ này.

---

## Owner module

`vows-merit` — LifeLiberationService / PregnancyMeritDetector
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khai báo sinh vật mang thai khi ghi nhật ký phóng sinh
- `system` — gắn badge "Vô Lượng Công Đức", gợi ý thần chú, tính toán multiplier

---

## Trigger

Khi user tạo/cập nhật sự kiện phóng sinh và check ô "Có mang thai/trứng".

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User tạo sự kiện phóng sinh | ✅ Hiển thị checkbox "Có mang thai?" |
| User check "Có" | ✅ Mark as high-merit, hiện input số lượng mang thai |
| pregnancyCount > 0 | 🌟 Gắn badge "Vô Lượng Công Đức" |
| Badge attached | ✅ Gợi ý niệm *Công Đức Bảo Sơn Thần Chú* |
| User không khai báo mang thai | ✅ Sự kiện bình thường, không badge |

---

## Input Contract

```typescript
interface LifeReleaseEventDto {
  creatureType: string
  quantity: number
  locationName: string
  notes?: string

  // Pregnancy fields
  includesPregnantCreatures: boolean
  pregnancyCount?: number           // Số con mang thai/ôm trứng
}

interface PregnancyMeritResult {
  hasBoundlessMeritBadge: boolean
  suggestedMantra: string | null    // 'cong_duc_bao_son_than_chu' | null
  badgeLabel: string | null
}
```

---

## Write Path

```
POST /api/vows-merit/life-release
1. Parse dto.includesPregnantCreatures
2. If true AND dto.pregnancyCount > 0:
   → Set meritsLabel = 'BOUNDLESS_MERIT'
   → Set suggestedMantraKey = 'cong_duc_bao_son_than_chu'
   → Persist LifeReleaseEvent with pregnantFlag = true
3. If false:
   → Persist LifeReleaseEvent normally
4. Audit: release.pregnant_creatures_detected (if applicable)
```

---

## FE Behavior

```
Phóng Sinh Chi Tiết:

Loài vật: [Cá chép]
Số lượng: [100] con

☑️ Có mang thai (cá ôm trứng)
   Số con: [42]

─────────────────────────────────────

🌟 VÔ LƯỢNG CÔNG ĐỨC 🌟

Bạn vừa cứu không chỉ 100 con cá
mà còn hàng ngàn sinh mạng đang
ở trong trứng!

Công đức này lớn gấp vô số lần.

─────────────────────────────────────

💡 GỢI Ý:

Hãy niệm thêm bài
"Công Đức Bảo Sơn Thần Chú"
để chuyển hóa lượng việc thiện
khổng lồ này thành công đức
bảo vệ bản thân.

[Bắt Đầu Niệm]  [Bỏ Qua]
```

---

## Schema Notes

```prisma
// Thêm vào LifeReleaseEvent
model LifeReleaseEvent {
  // ... existing fields ...
  includesPregnantCreatures Boolean @default(false)
  pregnancyCount            Int?
  meritsLabel               String? // 'BOUNDLESS_MERIT' | null
  suggestedMantraKey        String?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `release.pregnant_creatures_declared` | User checks "Có mang thai" |
| `release.boundless_merit_badge_attached` | pregnancyCount > 0 |
| `release.mantra_suggested` | Công Đức Bảo Sơn recommendation displayed |
| `release.mantra_started` | User clicks "Bắt Đầu Niệm" |

---

## Related

- [log-life-release.md](./log-life-release.md) — base logging flow
- [anti-financial-attachment-regex.md](./anti-financial-attachment-regex.md) — notes field filter
- [ecological-speech-to-text-guard.md](./ecological-speech-to-text-guard.md) — ecological pledge
