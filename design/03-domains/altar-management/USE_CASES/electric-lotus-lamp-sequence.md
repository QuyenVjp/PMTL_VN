# Máy Trạng Thái Của Đèn Hoa Sen Điện — Electric Lotus Lamp Sequence

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức thắp đèn điện hoa sen
> **Trạng thái:** Verified source — energy field safety
> **Cập nhật:** 2026-04-04

---

## Purpose

Đèn hoa sen điện mang lại sự trang nghiêm nhưng có tính rủi ro về từ trường nếu dùng sai. Bắt buộc phải bật đèn hoa sen điện lên **trước** khi thắp đèn dầu thật. Trước khi nhang cháy hết, phải tắt đèn dầu trước, sau đó mới được tắt đèn hoa sen điện. Cấm việc để đèn hoa sen điện sáng liên tục 24/24 mà không có nhang đang cháy — dễ thu hút vong linh.

---

## Owner module

`altar-management` — AltarService / ElectricLampStateManager
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thắp/tắt đèn điện
- `system` — enforce state machine, track timing

---

## Trigger

User mở tủ thờ hoặc click button [Thắp Nhang]

---

## Business Rules

### Part A: Startup Sequence

| Điều kiện | Hành động |
|---|---|
| User chọn [Thắp Nhang] | ⚠️ Check if electric lamp is ON |
| Electric lamp OFF | ❌ Require turn ON first |
| Electric lamp ON | ✅ Allow proceed to oil lamp |
| User attempts oil lamp without electric lamp | ❌ BLOCK 400 |

### Part B: Shutdown Sequence

| Điều kiện | Hành động |
|---|---|
| Nhang đang cháy | ✅ Đèn dầu ON, Đèn điện ON |
| Nhang cháy xong | ⚠️ Turn OFF oil lamp FIRST |
| Oil lamp OFF | ✅ Then allowed to turn OFF electric lamp |
| User turns OFF electric lamp first | ⚠️ Warning alert |

### Part C: Continuous Illumination Prohibition

| Điều kiện | Hành động |
|---|---|
| Electric lamp ON > 8 hours | ⚠️ Alert: "Tuyệt đối cấm để đèn hoa sen điện sáng mà không có nhang đang cháy" |
| Electric lamp ON, nhang NOT burning | ❌ Suggest turn OFF or light incense |

---

## Input Contract

```typescript
interface ElectricLampStateDto {
  lampId: string
  state: 'ON' | 'OFF'
  timeOfDay: string
  incenseIsActive: boolean
}

interface LampStateTransitionDto {
  fromState: 'OFF' | 'ON'
  toState: 'OFF' | 'ON'
  reason: 'START_SESSION' | 'END_SESSION' | 'MANUAL'
  incenseActive?: boolean
}
```

---

## Write Path

```
POST /api/altar-management/electric-lamp/toggle

1. Load current lamp state
2. Determine intended action (ON → OFF, or OFF → ON)

--- Turning ON ---
1. If target state = ON:
   → Set state = ON
   → Log lamp_turned_on
   → FE shows: "Đèn hoa sen điện đã bật. Bây giờ bạn có thể thắp đèn dầu."
   → Audit: altar.electric-lamp.activated

--- Turning OFF ---
1. If target state = OFF:
2. Check if oil lamp (đèn dầu) is still ON:
   a. If oil lamp ON:
      → Return 400 {
          error: 'oil_lamp_still_on',
          message: 'Tắt đèn dầu trước, sau đó mới được tắt đèn hoa sen điện'
        }
   b. If oil lamp OFF:
      → Set electric lamp = OFF
      → Audit: altar.electric-lamp.deactivated

--- 8-Hour Continuous Monitor (Background) ---
1. Track lamp_on_duration
2. If duration > 8 hours AND incense NOT active:
   → Send alert: "Tuyệt đối cấm để đèn hoa sen điện sáng mà không có nhang"
   → Suggest: Turn OFF or light incense

```

---

## FE Behavior

### Lamp State Indicator (Altar Dashboard)

```
┌────────────────────────────────────────────────────────┐
│ 🪷 Trạng Thái Bàn Thờ                                 │
│────────────────────────────────────────────────────────│
│                                                        │
│ Đèn Hoa Sen Điện: 🟢 ON (3 giờ 24 phút)             │
│ Đèn Dầu:          🔴 OFF                              │
│ Nhang:            🔴 OFF                              │
│                                                        │
│ [Thắp Đèn Dầu]  [Tắt Đèn Điện]                       │
│  (enabled)       (disabled — cần tắt đèn dầu trước)   │
└────────────────────────────────────────────────────────┘
```

### Startup: Electric Lamp First

```
┌────────────────────────────────────────────────────────┐
│ ⚠️  Thứ Tự Thắp Sáng                                  │
│────────────────────────────────────────────────────────│
│ Để thắp nhang, trước tiên phải bật đèn hoa sen điện. │
│                                                        │
│        [Bật Đèn Hoa Sen Điện]                         │
└────────────────────────────────────────────────────────┘
```

### Shutdown Warning

```
🟡 [CẢNH BÁO — Tắt Đèn]
Tắt đèn dầu trước, sau đó mới được tắt đèn hoa sen điện.

Nếu tắt đèn điện trước sẽ làm mất trật tự từ trường.
```

---

## Schema Notes

```prisma
model ElectricLampSession {
  id              String   @id @default(cuid())
  userId          String
  altarId         String
  turnedOnAt      DateTime
  turnedOffAt     DateTime?
  durationSeconds Int?
  incenseActive   Boolean  @default(false)
  createdAt       DateTime @default(now())

  @@index([userId, altarId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.electric-lamp.activated` | Đèn điện bật |
| `altar.electric-lamp.deactivated` | Đèn điện tắt |
| `altar.electric-lamp.continuous-alert` | > 8h sáng không có nhang |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Oil lamp still on | `oil_lamp_still_on` | 400 |
| Continuous 8h without incense | `continuous_illumination_risk` | 400 (advisory) |

---

## Notes for AI/codegen

- State machine là strict: ON → oil lamp → OFF (oil first)
- 8-hour threshold là advisory, not blocking
- Background monitor checks every 5 minutes
- Duration tracking helps with lamp maintenance schedule

---

## Related

- [multi-deity-oil-lamp-allocation.md](./multi-deity-oil-lamp-allocation.md) — Oil lamp rules
- [statue-hygiene-mantra-protocol.md](./statue-hygiene-mantra-protocol.md) — Statue care
