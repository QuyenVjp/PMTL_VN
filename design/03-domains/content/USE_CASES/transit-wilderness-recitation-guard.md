# Bảo Vệ Trì Tụng Khi Di Chuyển & Hoang Vắng — Transit & Wilderness Recitation Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 295, 296, 800)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tâm Kinh và Vãng Sanh Chú TUYỆT ĐỐI KHÔNG được tụng thành tiếng khi đang di chuyển (tốc độ > 20km/h) hoặc ở nơi hoang vắng. Chỉ được niệm thầm (không phát tiếng) trong hai bối cảnh này. Hệ thống phát hiện và cảnh báo người dùng qua banner vàng, không hard block.

---

## Owner module

`content` — EReaderService / EnvironmentGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — mở E-Reader để tụng Tâm Kinh hoặc Vãng Sanh Chú
- `system` — phát hiện bối cảnh di chuyển / hoang vắng, hiển thị banner cảnh báo advisory

---

## Trigger

Khi user mở E-Reader với `sutras` chứa `HEART_SUTRA` hoặc `REBIRTH_MANTRA`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Tốc độ GPS > 20km/h | ⚠️ Advisory: kích hoạt Transit Mode, banner vàng |
| GPS ngoài khu vực đô thị (Phase 2+) | ⚠️ Advisory: kích hoạt Wilderness Mode, banner vàng |
| Phase 1 (chưa có GPS auto-detect) | ⚠️ Self-declaration checkbox — user tự khai báo bối cảnh |
| User dismiss banner | ⚠️ Banner ẨN tạm 30 phút, HIỆN LẠI sau 30 phút nếu vẫn đang di chuyển |
| Kinh khác (không phải Tâm Kinh / Vãng Sanh) | ℹ️ Không kích hoạt guard |
| Tốc độ ≤ 20km/h và trong đô thị | ✅ Không cảnh báo |

Cảnh báo KHÔNG block:
- User vẫn có thể đọc và tụng
- Hệ thống chỉ nhắc nhở niệm thầm
- Audit vẫn ghi nhận để reference

---

## Input Contract

```typescript
type SutraType =
  | 'HEART_SUTRA'       // Tâm Kinh
  | 'REBIRTH_MANTRA'    // Vãng Sanh Chú
  | 'GREAT_COMPASSION'  // Chú Đại Bi
  | 'OTHER'

type LocationContext = 'TRANSIT' | 'WILDERNESS' | 'URBAN' | 'UNKNOWN'

// Phase 1: self-declaration
interface StartRecitationSessionDto {
  sutras: SutraType[]
  locationContext?: LocationContext  // user tự khai báo
}

// Phase 2+: auto-detected
interface RecitationEnvironmentDto {
  sutras: SutraType[]
  speedKmh?: number            // từ Geolocation API
  isUrbanArea?: boolean        // từ reverse geocoding
  autoDetected: boolean        // true nếu dùng GPS, false nếu self-declare
}

interface RecitationSessionResponse {
  sessionId: string
  guardTriggered: boolean
  guardType?: 'TRANSIT' | 'WILDERNESS' | null
  warnings: string[]           // advisory messages
  autoDetected: boolean
}
```

---

## Write Path

```
POST /api/content/recitation/start-session
1. Validate sutras list
2. Determine guard trigger:
   Phase 1:
     → If locationContext ∈ ['TRANSIT', 'WILDERNESS']:
       guardTriggered = true, guardType = locationContext
   Phase 2+:
     → If speedKmh > 20: guardTriggered = true, guardType = 'TRANSIT'
     → Else if isUrbanArea = false: guardTriggered = true, guardType = 'WILDERNESS'

3. If guardTriggered AND sutras include HEART_SUTRA or REBIRTH_MANTRA:
   → warnings.push("TUYỆT ĐỐI CHỈ NIỆM THẦM, KHÔNG ĐƯỢC PHÁT RA TIẾNG")
   → Audit:
     TRANSIT   → content.recitation.transit-mode-activated
     WILDERNESS → content.recitation.wilderness-mode-activated

4. Return 200 { sessionId, guardTriggered, guardType, warnings, autoDetected }
   (KHÔNG trả về 4xx — đây là advisory)
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  E-READER — TÂM KINH / VÃNG SANH CHÚ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 1 — Khai báo bối cảnh khi mở E-Reader:]

  ┌─────────────────────────────────────┐
  │ Bạn đang ở đâu lúc này?             │
  │                                     │
  │  ○ Tại nhà / nơi yên tĩnh          │
  │  ○ Đang trên xe / di chuyển        │  ← TRANSIT
  │  ○ Nơi hoang vắng / xa thành phố   │  ← WILDERNESS
  │                                     │
  │  [Bắt đầu trì tụng]                │
  └─────────────────────────────────────┘

Nếu chọn TRANSIT hoặc WILDERNESS → banner vàng xuất hiện:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌─────────────────────────────────────┐  bg-yellow-500
  │ ⚠️  CHẾ ĐỘ DI CHUYỂN / HOANG VẮNG  │  text-black font-bold
  │                                     │
  │  TUYỆT ĐỐI CHỈ NIỆM THẦM,          │
  │  KHÔNG ĐƯỢC PHÁT RA TIẾNG           │
  │                                     │
  │  Tâm Kinh và Vãng Sanh Chú không   │
  │  được tụng thành tiếng khi:         │
  │   • Đang di chuyển (xe, tàu...)     │
  │   • Ở nơi hoang vắng vắng lặng     │
  │                                     │
  │  [Đã hiểu, tiếp tục]               │
  └─────────────────────────────────────┘

Sau khi dismiss:
- Banner ẨN khỏi màn hình
- Nhỏ lại thành strip vàng ở đầu trang:
  ┌─────────────────────────────────────┐  bg-yellow-400
  │ ⚠️ CHỈ NIỆM THẦM — đang di chuyển  │  h-8 text-sm
  └─────────────────────────────────────┘

[Phase 2+ — Auto-detect với GPS:]

Tốc độ > 20km/h → banner tự kích hoạt
GPS ngoài đô thị → banner tự kích hoạt
Không cần user khai báo thủ công

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model RecitationSession {
  id              String   @id @default(cuid())
  userId          String
  sutras          String[] // SutraType[]
  locationContext String?  // LocationContext enum value
  guardTriggered  Boolean  @default(false)
  guardType       String?  // 'TRANSIT' | 'WILDERNESS' | null
  autoDetected    Boolean  @default(false)
  speedKmh        Float?   // Phase 2+
  startedAt       DateTime @default(now())
  endedAt         DateTime?

  user User @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `content.recitation.transit-mode-activated` | Phát hiện đang di chuyển khi mở Tâm Kinh / Vãng Sanh |
| `content.recitation.wilderness-mode-activated` | Phát hiện ở nơi hoang vắng khi mở Tâm Kinh / Vãng Sanh |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| Thiếu `sutras` | `validation_error` | 400 | Bổ sung danh sách kinh |
| Chưa đăng nhập | `unauthorized` | 401 | — |

*Không có 4xx lỗi liên quan đến guard — đây là advisory-only (200 + warnings[]).*

---

## Notes for AI/codegen

- Guard này là **soft advisory** — luôn trả về 200, không bao giờ block user khỏi E-Reader.
- Phase 1 chỉ dùng self-declaration — không cần Geolocation API permission.
- Phase 2+: cần xin quyền `geolocation` với lý do rõ ràng cho user. Fallback về Phase 1 nếu user từ chối.
- Strip cảnh báo vàng phải luôn hiển thị khi `guardTriggered = true` — không để user tắt hoàn toàn.
- Guard chỉ áp dụng cho `HEART_SUTRA` và `REBIRTH_MANTRA` — không áp dụng cho `GREAT_COMPASSION` hay kinh khác.

---

## Related

- [passive-listening-active-chanting-segregation.md](./passive-listening-active-chanting-segregation.md) — phân biệt nghe vs tụng
- [yin-time-anti-spoofing-guard.md](./yin-time-anti-spoofing-guard.md) — guard thời gian âm
- [pause-mantra-seal.md](./pause-mantra-seal.md) — nghi thức dừng giữa chừng
