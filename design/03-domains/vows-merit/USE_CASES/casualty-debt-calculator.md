# Máy Tính Nợ Sát Sinh — Casualty Debt Calculator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Sinh vật chết trong quá trình phóng sinh tạo ra nghiệp nợ tỷ lệ thuận với loài vật. Hệ thống tự động tính số biến *Chú Vãng Sanh* cần niệm dựa trên số lượng và loài sinh vật tử vong, inject vào Daily Task với độ ưu tiên KHẨN CẤP và deadline trước 12h đêm.

---

## Owner module

`vows-merit` — LifeLiberationService / CasualtyDebtEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khai báo sinh vật tử vong sau phóng sinh
- `system` — tính nợ, inject task khẩn cấp

---

## Trigger

Khi user hoàn thành sự kiện phóng sinh và được hỏi về khai báo tử vong (casualty declaration form).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Release event completed | ✅ Show casualty declaration form |
| User nhập số tử vong | ✅ Tính toán theo multiplier |
| deathCount > 0 | ✅ Auto-inject Chú Vãng Sanh vào Daily Task |
| Task injected | 🚨 Mark URGENT với deadline midnight |
| deathCount = 0 | ✅ No debt, skip injection |

---

## Casualty Calculation Matrix

```typescript
const SPECIES_DEBT_MULTIPLIER: Record<string, number> = {
  FISH:         7,
  SHRIMP:       3,
  CRAB:         5,
  CRAYFISH:     3,
  OTHER_AQUATIC: 7
}

function calculateCasualtyDebt(species: string, deathCount: number): number {
  const multiplier = SPECIES_DEBT_MULTIPLIER[species] ?? 7
  return multiplier * deathCount
}

// Example:
// 5 cá chết → 5 × 7 = 35 Chú Vãng Sanh
// 2 cua chết → 2 × 5 = 10 Chú Vãng Sanh
// Total: 45 biến required
```

---

## Input Contract

```typescript
interface CasualtyDeclarationDto {
  releaseEventId: string
  casualties: {
    species: string   // key in SPECIES_DEBT_MULTIPLIER
    deathCount: number
  }[]
}

interface CasualtyDebtResult {
  totalDebt: number
  breakdown: { species: string; deathCount: number; debt: number }[]
  injectedTaskId: string | null
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/:id/casualties
1. Parse casualties array
2. Per species: calculateCasualtyDebt(species, deathCount)
3. Sum total debt
4. If totalDebt > 0:
   → Inject DailyTask: { sutraKey: 'chu_vang_sanh', count: totalDebt, urgent: true, deadlineToday: midnight }
   → Audit: release.casualty_debt_injected
5. Return CasualtyDebtResult
```

---

## FE Behavior

```
Khai Báo Sinh Vật Tử Vong:

Trong quá trình phóng sinh, tôi phát hiện:

[ ] Cá chết:   [5] con  → 5 × 7 = 35 Chú Vãng Sanh
[ ] Tôm chết:  [2] con  → 2 × 3 =  6 Chú Vãng Sanh
[ ] Cua chết:  [0] con  → 0 × 5 =  0 Chú Vãng Sanh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tổng Nợ Khẩn Cấp: 41 Chú Vãng Sanh

🚨 [Nợ Bắt Buộc - Phải Hoàn Trước 12h Đêm]
   đã được thêm vào Daily Task hôm nay.

[Xác Nhận & Bắt Đầu Niệm]
```

---

## Schema Notes

```prisma
model CasualtyDebtRecord {
  id             String   @id @default(cuid())
  userId         String
  releaseEventId String
  totalDebt      Int
  breakdown      Json     // array of {species, deathCount, debt}
  dailyTaskId    String?
  createdAt      DateTime @default(now())
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `release.casualty_form_shown` | Release completed |
| `release.casualty_declared` | User inputs deaths |
| `release.casualty_debt_calculated` | Multiplier applied |
| `release.casualty_debt_injected` | Task created |
| `release.urgent_priority_set` | Red label, midnight deadline |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Unknown species key | `unknown_species_type` | 422 |
| deathCount < 0 | `invalid_casualty_count` | 400 |

---

## Related

- [log-life-release.md](./log-life-release.md) — base logging flow
- [pregnant-creature-merit-multiplier.md](./pregnant-creature-merit-multiplier.md) — merit for pregnant creatures
- [ecological-liability-exemption-prayer.md](./ecological-liability-exemption-prayer.md) — pre-release prayer
