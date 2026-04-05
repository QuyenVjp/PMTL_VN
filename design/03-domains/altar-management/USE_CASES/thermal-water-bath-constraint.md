# Giao Thức Hâm Nóng "Cách Thủy" — Thermal Water-Bath Constraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 909, 910)
> **Trạng thái:** Verified source — hard block enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu thời tiết quá lạnh, muốn uống Nước Đại Bi ấm, tuyệt đối cấm đun trực tiếp trên bếp lửa hoặc cho vào lò vi sóng (microwave). Cách duy nhất được cho phép là "Đun cách thủy" - tức là đặt ly Nước Đại Bi ngâm vào một bát nước nóng để truyền nhiệt từ từ. Nước chỉ được làm ấm lên, không được đun sôi sùng sục.

---

## Owner module

`altar-management` — AltarService / ThermalGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người muốn làm ấm nước
- `system` — thermal control validator

---

## Trigger

Khi user click option `[Làm ấm nước / Warm up]` trong flow uống nước

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn water bath method | ✅ ALLOWED |
| User tries direct heat (microwave, stove) | ❌ HARD BLOCK 400 |
| Water temperature ≤ 45°C | ✅ Safe (advisory) |
| Water temperature > 65°C | ⚠️ Warning: may damage essence |

---

## Input Contract

```typescript
interface WarmWaterMethodDto {
  heatingMethod: 'WATER_BATH' | 'MICROWAVE' | 'DIRECT_HEAT' | 'NONE'
  targetTemperature?: number  // Celsius
}

interface ThermalValidationResult {
  allowed: boolean
  error?: string
}
```

---

## Write Path

```
POST /api/altar-management/water/warm-up

1. Check heatingMethod:
   - If 'WATER_BATH' → ALLOWED, proceed to temp guidance
   - If 'MICROWAVE' or 'DIRECT_HEAT' → HARD BLOCK 400

2. If blocked:
   throw 400 {
     error: 'thermal_violation',
     message: 'CẤM KỴ VẬT LÝ: Tuyệt đối không dùng lò vi sóng hoặc đun trực tiếp. Chỉ được phép đặt ly nước vào bát nước nóng để ngâm ấm (Đun cách thủy) và không được để nước sôi!'
   }

3. If water_bath:
   a. Guidance: "Đặt ly Nước Đại Bi ngâm vào bát nước nóng (khoảng 45-60°C)"
   b. If User reports temp > 65°C:
      → Warning: "Nước quá nóng (>65°C) có thể làm mất tinh chất. Để nước nguội một chút."
   c. Audit: altar.water.thermal_guard_passed

```

---

## FE Behavior

### Warming Method Selection

```
┌────────────────────────────────────────────────────────┐
│ 🌡️  Làm Ấm Nước Đại Bi                                │
│────────────────────────────────────────────────────────│
│ Làm ấm Nước Đại Bi bằng cách nào?                      │
│                                                        │
│ ⭕ Đun cách thủy (ngâm ly vào bát nước nóng)          │
│ ❌ Lò vi sóng (CẤIM KỴ)                               │
│ ❌ Đun trực tiếp trên bếp (CẤM KỴ)                    │
│                                                        │
│ Lý do: Đun trực tiếp hoặc lò vi sóng sẽ làm mất       │
│ tinh chất gia trì của Nước Đại Bi.                    │
│                                                        │
│            [Tiếp Tục]                                 │
└────────────────────────────────────────────────────────┘
```

### Water Bath Guidance

```
┌────────────────────────────────────────────────────────┐
│ 🛁 Đun Cách Thủy — Water Bath Method                   │
│────────────────────────────────────────────────────────│
│ Hướng dẫn:                                             │
│                                                        │
│ 1. Chuẩn bị một bát nước nóng (45–60°C)               │
│ 2. Đặt ly Nước Đại Bi vào bát nước nóng               │
│ 3. Chờ từ từ để nước hấp thụ nhiệt (2–3 phút)         │
│ 4. Kiểm tra nhiệt độ trước khi uống                   │
│                                                        │
│ ⚠️ CẢNH BÁO: Không để nước sôi, chỉ làm ấm!          │
│                                                        │
│            [Hoàn Tất]                                 │
└────────────────────────────────────────────────────────┘
```

### High Temperature Warning

```
┌────────────────────────────────────────────────────────┐
│ ⚠️  Nhiệt Độ Quá Cao                                   │
│────────────────────────────────────────────────────────│
│ Nước bạn dùng có nhiệt độ > 65°C.                      │
│                                                        │
│ Nhiệt quá cao sẽ làm mất tinh chất gia trì của        │
│ Nước Đại Bi. Vui lòng để nước nguội thêm một chút.    │
│                                                        │
│            [Để Nguội]                                 │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model WaterWarmingSession {
  id              String   @id @default(cuid())
  userId          String
  waterId         String
  heatingMethod   String   // WATER_BATH | BLOCKED
  targetTemp      Int?     // Celsius
  recordedTemp    Int?
  warmedAt        DateTime?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.thermal_guard_passed` | Water bath method selected |
| `altar.water.thermal_violation_blocked` | Microwave/direct heat attempt |
| `altar.water.high_temp_warning` | Temp > 65°C |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Microwave selected | `thermal_violation` | 400 |
| Direct heat selected | `thermal_violation` | 400 |

---

## Notes for AI/codegen

- Microwave và Direct Heat là HARD BLOCK
- Water bath là duy nhất cho phép
- Temp guidance: 45–60°C tối ưu, > 65°C trigger warning
- Lý do giải thích trên UI rõ ràng

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [buddha-water-segregation-law.md](./buddha-water-segregation-law.md) — Phân tách nước các Bồ Tát
