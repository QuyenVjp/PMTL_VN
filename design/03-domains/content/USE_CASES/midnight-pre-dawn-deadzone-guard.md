# Khóa Tụng Kinh Giữa Đêm & Trước Bình Minh — Midnight & Pre-Dawn Deadzone Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 40, Logic 7)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tâm Kinh và Vãng Sanh Chú là những bài kinh thiêng liêng cần điều kiện đặc biệt. Hệ thống thực thi hai phòng ngừa:

1. **Sau 22:00 (10 PM):** Khóa cứng Tâm Kinh & Vãng Sanh Chú — chỉ mở khóa nếu user có **named little house** (trường `OfferTo` được điền). Cho phép kéo dài đến 00:00 (nửa đêm).

2. **02:00–05:00 (2 AM–5 AM):** Vùng chết tuyệt đối — ứng dụng chuyển sang read-only, tất cả counter và session sutra bị khóa, hiển thị banner cảnh báo đỏ.

---

## Owner module

`content` — MidnightDeadzoneNightGuard / SutraSessionGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — user cố ghi nhận tụng niệm sau 22:00 hoặc trong 02:00–05:00
- `system` — enforce time-based gates, validate named little house, block hoặc unlock tuỳ điều kiện

---

## Trigger

POST `/api/content/sutras/start-session` — user ghi nhận bắt đầu phiên tụng niệm Tâm Kinh hoặc Vãng Sanh Chú.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| **22:00–00:00 (10 PM–Midnight)** | |
| Sutra = `HEART_SUTRA` hoặc `REBIRTH_MANTRA` | ❌ Khóa — 400 `nighttime_sutra_lock` |
| User có `namedLittleHouseId` (OfferTo filled) | ✅ Override: mở khóa, allow tụng đến 00:00 |
| User KHÔNG có named LH | ❌ Block + error `named_lh_override_required` |
| | |
| **00:00–02:00 (Midnight–2 AM)** | |
| Sutra = `HEART_SUTRA` hoặc `REBIRTH_MANTRA` | ✅ Khóa tự động mở, allow bình thường |
| Sutra khác (GREAT_COMPASSION, etc.) | ✅ No restriction |
| | |
| **02:00–05:00 (Total Deadzone)** | |
| ANY sutra, ANY session | ❌ BLOCK — app = read-only |
| All counters frozen | 🔇 Disabled UI, frozen state |
| NEW session attempt | ❌ 400 `deadzone_total_lockdown_active` |
| Red system banner | 🚨 "Thời khắc Âm khí trùng lai. Tạm ngưng mọi hoạt động tụng niệm để tránh thu hút linh giới!" |
| | |
| **05:00+ onwards** | |
| All restrictions lifted | ✅ Resume normal |

---

## Input Contract

```typescript
interface StartSutraSessionDto {
  sutraType: 'HEART_SUTRA' | 'REBIRTH_MANTRA' | 'GREAT_COMPASSION' | 'OTHER'
  namedLittleHouseId?: string  // optional override for 22:00–00:00 gate
}

interface StartSutraSessionResponse {
  sessionId: string
  sutraType: string
  startedAt: ISO8601String
  allowedUntil?: ISO8601String  // if override used, show cutoff
  deadzoneActive?: boolean      // if 02:00–05:00, true
  warnings?: string[]
}
```

---

## Write Path

```
POST /api/content/sutras/start-session
1. Parse request:
   sutraType, namedLittleHouseId

2. Determine local hour:
   localHour = getLocalHour(user.timezone, now())

3. **Phase 1: 22:00–00:00 Nighttime Lock**
   if sutraType in [HEART_SUTRA, REBIRTH_MANTRA]:
     if localHour in [22..23]:
       if !namedLittleHouseId:
         → return 400 { code: 'named_lh_override_required' }
       else:
         → validate namedLittleHouseId exists AND OfferTo is filled
         → if validation fails: return 400 { code: 'invalid_little_house_offering' }
         → if valid: ALLOW, set allowedUntil = nextMidnight (00:00 local)
         → Audit: content.midnight-deadzone.override-used

4. **Phase 2: 02:00–05:00 Total Deadzone**
   if localHour in [2..4]:
     → return 400 { code: 'deadzone_total_lockdown_active', blockUntil: next5AM(user.timezone) }
     → Audit: content.deadzone.total-lockdown-activated

5. **Phase 3: 00:00–02:00 & 05:00+ Open**
   if (localHour in [0..1]) or (localHour >= 5):
     → ALLOW, no restrictions
     → if override was active: Audit: content.midnight-deadzone.nighttime-lock-released

6. Return 201 {
     sessionId,
     sutraType,
     startedAt: now(),
     allowedUntil: (if override) nextMidnight,
     deadzoneActive: (if 2–5am) true
   }
```

---

## FE Behavior

### Scenario A: 22:00–00:00 Nighttime Lock (No Named LH)

```
┌─────────────────────────────────────────┐
│ ❌ KHÓA TỤNG KINH GIỮA ĐÊM              │
├─────────────────────────────────────────┤
│                                         │
│ Tâm Kinh và Vãng Sanh Chú được khóa    │
│ từ 10 PM đến nửa đêm (00:00)            │
│                                         │
│ Để mở khóa, bạn cần:                   │
│ • Có một Nhà Nhỏ được đặt tên          │
│   (điền vào trường Dâng Tặng cho)       │
│                                         │
│ 🏠 Quản lý Nhà Nhỏ                      │
│ 📝 Xem hướng dẫn                        │
│                                         │
└─────────────────────────────────────────┘
```

### Scenario B: 22:00–00:00 with Named LH (Override Success)

```
┌─────────────────────────────────────────┐
│ ✅ MỞ KHÓA TỤNG KINH                    │
├─────────────────────────────────────────┤
│                                         │
│ Tâm Kinh được mở khóa nhờ:             │
│ Nhà Nhỏ: "Dâng cho Ngoại Tổ Mẹ"        │
│                                         │
│ ⏰ Có thể tụng đến 00:00 (nửa đêm)      │
│    Sau đó sẽ tự động khóa               │
│                                         │
│ [Bắt Đầu Tụng]                         │
│                                         │
└─────────────────────────────────────────┘
```

### Scenario C: 02:00–05:00 Total Deadzone

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 CẢNH BÁO KHẨN CẤP 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thời khắc Âm khí trùng lai.
Tạm ngưng mọi hoạt động tụng niệm để tránh
thu hút linh giới!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ Tất cả bộ đếm bị khóa
✗ Không thể ghi nhận tụng niệm
✗ Không thể bắt đầu phiên mới
✗ Không thể nạp E-Reader

📅 Có thể tiếp tục từ: 05:00 AM

[Đã hiểu]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### FE State During Deadzone (02:00–05:00)

```
Header Banner (red, sticky):
┌─────────────────────────────────────────┐
│ 🚨 Thời khắc Âm khí. Ứng dụng ở chế độ  │
│    chỉ đọc. Tất cả hoạt động khóa.    │
└─────────────────────────────────────────┘

Content Area:
• All counter UI elements: opacity-50, pointer-events-none
• Submit buttons: disabled, grayed out
• Navigation to session start: blocked/hidden
• E-Reader: overlay with "read-only mode" message
• Sidebar metrics: frozen at last known values
```

---

## DTO & API Response

```typescript
// Request
interface StartSutraSessionDto {
  sutraType: 'HEART_SUTRA' | 'REBIRTH_MANTRA' | 'GREAT_COMPASSION' | 'OTHER'
  namedLittleHouseId?: string
}

// Success (201)
interface StartSutraSessionResponse {
  sessionId: string
  sutraType: string
  startedAt: ISO8601String
  allowedUntil?: ISO8601String  // if override active
  deadzoneActive: boolean        // if 02–5am
  warnings: string[]
}

// Error 400
interface DeadzoneErrorResponse {
  code: 'nighttime_sutra_lock' | 'named_lh_override_required' |
        'invalid_little_house_offering' | 'deadzone_total_lockdown_active'
  message: string
  blockUntil?: ISO8601String
  requiredAction?: string  // e.g., "Create or name a little house"
}
```

---

## Schema Notes

**No schema changes required.** This is a runtime, time-based gate:

- Check local time in middleware/service
- Validate `namedLittleHouseId` against existing `LittleHouse` model if provided
- All enforcement is stateless & computed on-the-fly

Optional: audit table for tracking guard activations

```prisma
model MidnightDeadzoneEvent {
  id                  String    @id @default(cuid())
  userId              String
  sutraType           String    // HEART_SUTRA, REBIRTH_MANTRA, etc.
  trigger             String    // 'NIGHTTIME_LOCK' | 'TOTAL_DEADZONE'
  overrideUsed        Boolean   @default(false)
  namedLittleHouseId  String?
  userTimezone        String
  localHourAtTrigger  Int       // 0–23
  triggeredAt         DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `content.midnight-deadzone.nighttime-lock-applied` | User attempts HEART_SUTRA or REBIRTH_MANTRA at 22:00–24:00 without override |
| `content.midnight-deadzone.override-used` | Named LH override successfully applied (22:00–24:00) |
| `content.midnight-deadzone.invalid-override-attempt` | User provides invalid or non-existent `namedLittleHouseId` |
| `content.midnight-deadzone.nighttime-lock-released` | 00:00 reached, override expired, lock auto-released |
| `content.deadzone.total-lockdown-activated` | 02:00 local time reached, all sutra functions disabled |
| `content.deadzone.total-lockdown-deactivated` | 05:00 local time reached, deadzone lifted |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| HEART_SUTRA/REBIRTH_MANTRA at 22:00–24:00, no override | `nighttime_sutra_lock` | 400 | "Tâm Kinh không thể tụng sau 10 PM. Cần có Nhà Nhỏ được đặt tên." |
| Override requested but `namedLittleHouseId` not provided | `named_lh_override_required` | 400 | "Vui lòng chọn Nhà Nhỏ dâng tặng để mở khóa." |
| Override `namedLittleHouseId` invalid/doesn't exist | `invalid_little_house_offering` | 400 | "Nhà Nhỏ không hợp lệ hoặc chưa được đặt tên." |
| Any sutra during 02:00–05:00 deadzone | `deadzone_total_lockdown_active` | 400 | "Thời khắc Âm khí. Tạm ngưng mọi hoạt động tụng niệm." |

---

## Related

- [yin-time-deadzone-2-5am.md](../../calendar/USE_CASES/yin-time-deadzone-2-5am.md) — comprehensive deadzone 02:00–05:00 (applies to all counters)
- [transit-wilderness-recitation-guard.md](./transit-wilderness-recitation-guard.md) — soft advisory for transit/wilderness
- [yin-time-anti-spoofing-guard.md](./yin-time-anti-spoofing-guard.md) — offline timestamp validation
- [pause-mantra-seal.md](./pause-mantra-seal.md) — session pause/resume handling

---

## Notes for AI/codegen

- **Timezone handling:** Use `dayjs.tz(user.timezone)` or `date-fns-tz` — never hardcode offsets.
- **Override validation:** When `namedLittleHouseId` provided, check:
  - LittleHouse exists
  - Belongs to user
  - `OfferTo` field is non-null (name filled in)
  - Return 400 if any check fails
- **Deadzone banner (02:00–05:00):** Sticky red header, always visible. Do NOT dismiss-able.
- **Cutoff at 00:00:** Even if override is active and user is mid-session at 23:55, session MUST end at 00:00 local time. Audit as `override-expired`.
- **Read-only mode during 02:00–05:00:** Disable all POST/PUT endpoints for recitation. Block E-Reader page load entirely (redirect to home with banner).

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-04 | Logic 7 — Phase 40 implementation document created |
