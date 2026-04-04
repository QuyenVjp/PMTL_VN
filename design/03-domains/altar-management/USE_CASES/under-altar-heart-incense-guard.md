# Bảo Vệ Tượng Bồ Tát & Chế Độ Tâm Hương — Under-Altar & Heart Incense Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hai quy tắc phải được bảo vệ riêng biệt:

1. **Tượng Bồ Tát không được cất dưới gầm bàn thờ** — Đây là hành động bất kính nghiêm trọng. Tượng phải luôn ở `TOP_ZONE` (trên mặt bàn hoặc kệ cao). `BOTTOM_ZONE` (dưới gầm bàn) bị cấm hoàn toàn đối với tượng.

2. **Chế độ Tâm Hương (Heart Incense Mode)** — Khi user kích hoạt tâm quán, camera phải bị tắt (thiết bị không được ghi hình). UI chuyển sang chế độ đỏ (red overlay) với chỉ dẫn `TUYỆT ĐỐI CẤM quỳ lạy vật lý hoặc lạy vào màn hình điện thoại`. Toàn bộ tính năng screenshot bị vô hiệu hóa.

---

## Owner module

`altar-management` — AltarInventoryService / AltarZoneValidator
`content` — HeartIncenseService / CameraDisabler
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thêm vật phẩm vào gầm bàn thờ, kích hoạt chế độ tâm quán
- `system` — chặn tượng ở `BOTTOM_ZONE`, tắt camera + hiển thị red mode

---

## Trigger

**Trigger A (Under-Altar Zone):**
Khi user gọi `POST /api/altar-management/inventory/add-to-zone`

**Trigger B (Heart Incense Mode):**
Khi user gọi `POST /api/content/heart-incense/start-session` với `sessionType: 'HEART_INCENSE'`

---

## Business Rules

### Rule A: Under-Altar Zone Protection

| Điều kiện | Hành động |
|---|---|
| User add item, zone = `TOP_ZONE` | ✅ Cho phép tất cả itemType |
| User add item, zone = `BOTTOM_ZONE`, itemType ≠ STATUE | ✅ Cho phép (nón cơm, giấy, v.v.) |
| User add item, zone = `BOTTOM_ZONE`, itemType = STATUE | ❌ Block 400 `statue_cannot_be_stored_under_altar` |
| Error message hiển thị | ✅ "Tội bất kính: Không được cất giấu tượng Bồ Tát dưới gầm bàn thờ!" |

### Rule B: Heart Incense Mode

| Điều kiện | Hành động |
|---|---|
| User gọi start-session với `sessionType: 'HEART_INCENSE'` | ✅ Check camera permission |
| `disableCameraConfirmed: false` | ❌ Block 403 `heart_incense_camera_required` |
| `disableCameraConfirmed: true`, camera status = enabled | ✅ Tắt camera device |
| Camera tắt thành công | ✅ Screen fill red overlay + white text |
| Red mode text hiển thị | ✅ Tất cả UI elements ẩn (trừ timer/counter) |
| Session active | ❌ Screenshot capability bị vô hiệu hóa |
| User exit session | ✅ Camera có thể bật lại (ngoài session) |

---

## Input Contract

```typescript
// Rule A: Add to Altar Zone
interface AddToAltarZoneDto {
  itemId: string              // Unique item identifier
  zone: 'TOP_ZONE' | 'BOTTOM_ZONE'
  itemType: ItemTypeEnum      // STATUE | INCENSE_STICK | RICE | FRUIT | PAPER | etc.
}

enum ItemTypeEnum {
  STATUE           = 'STATUE',           // Tượng Phật / Bồ Tát
  INCENSE_STICK    = 'INCENSE_STICK',    // Nhang
  RICE             = 'RICE',             // Gạo
  FRUIT            = 'FRUIT',            // Trái cây
  PAPER            = 'PAPER',            // Giấy lễ
  WATER_CUP        = 'WATER_CUP',        // Chén nước
  CANDLE           = 'CANDLE',           // Nến
  OTHER            = 'OTHER'             // Khác
}

// Rule B: Start Heart Incense Session
interface StartHeartIncenseDto {
  sessionType: 'HEART_INCENSE'
  disableCameraConfirmed: boolean  // Must be true to proceed
}

interface HeartIncenseSession {
  id: string
  userId: string
  sessionType: 'HEART_INCENSE'
  cameraDisabled: boolean
  screenRedModeActive: boolean
  startedAt: DateTime
  endedAt?: DateTime
  durationSeconds?: number
}

interface AltarInventoryItem {
  id: string
  altarId: string
  itemId: string
  zone: 'TOP_ZONE' | 'BOTTOM_ZONE'
  itemType: ItemTypeEnum
  addedAt: DateTime
}
```

---

## Write Path

### Path A: Add to Under-Altar Zone

```
POST /api/altar-management/inventory/add-to-zone
{
  "itemId": "item-uuid-123",
  "zone": "BOTTOM_ZONE",
  "itemType": "STATUE"
}

1. Validate itemId exists
2. Validate zone ∈ ['TOP_ZONE', 'BOTTOM_ZONE']
3. Validate itemType ∈ ItemTypeEnum
4. Business rule check:
   if (zone === 'BOTTOM_ZONE' && itemType === 'STATUE') {
     → Return 400 {
         "code": "statue_cannot_be_stored_under_altar",
         "message": "Tội bất kính: Không được cất giấu tượng Bồ Tát dưới gầm bàn thờ!"
       }
     → Audit: altar.under-altar.statue-block-attempted
   }
5. Zone validation passed:
   → Create AltarInventoryItem { itemId, zone, itemType, addedAt: now() }
   → Return 201 { item }
   → Audit: altar.under-altar.zone-validated
```

### Path B: Start Heart Incense Session

```
POST /api/content/heart-incense/start-session
{
  "sessionType": "HEART_INCENSE",
  "disableCameraConfirmed": true
}

1. Check user device camera permission
2. Validate disableCameraConfirmed === true
   if (disableCameraConfirmed === false) {
     → Return 403 {
         "code": "heart_incense_camera_required",
         "message": "Bạn phải xác nhận tắt camera để bắt đầu chế độ tâm quán."
       }
     → Audit: content.heart-incense.camera-required-error
   }
3. Attempt to disable device camera (native API call)
   if (camera_disable_failed) {
     → Return 403 { code: "heart_incense_camera_required" }
   }
4. Camera disabled successfully:
   → Create HeartIncenseSession {
       sessionType: 'HEART_INCENSE',
       cameraDisabled: true,
       screenRedModeActive: true,
       startedAt: now()
     }
   → Return 201 { session }
   → Audit: content.heart-incense.camera-disabled
   → Audit: content.heart-incense.red-mode-activated
5. FE receives session, activates red overlay immediately
```

---

## FE Behavior

### Rule A: Under-Altar Zone Block

```
When itemType === 'STATUE' && zone === 'BOTTOM_ZONE':

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ❌ HÀNH ĐỘNG BẤT KÍNH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tội bất kính: Không được cất giấu tượng
Bồ Tát dưới gầm bàn thờ!

LÝ DO:
────────────────────────────────────────
Tượng Phật / Bồ Tát phải luôn ở vị trí
cao sang trọng trên bàn thờ hoặc kệ.
Cất dưới gầm bàn là hành động x冒 phạm
trực tiếp, gây mất tôn kính.

────────────────────────────────────────

✅ Đặt tượng trên TOP_ZONE (mặt bàn/kệ)
❌ Không được dưới gầm (BOTTOM_ZONE)

[Quay Lại]
```

### Rule B: Heart Incense Red Mode

```
When session activated with cameraDisabled: true:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    🔴 CHẾ ĐỘ TÂM HƯƠNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Screen fills entire viewport with RED background (#DC143C or similar)

White text centered:

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║             HÃY NHẮM MẮT LẠI.                        ║
║                                                       ║
║     Tự quán tưởng trong đầu.                        ║
║                                                       ║
║     TUYỆT ĐỐI CẤM quỳ lạy vật lý                   ║
║     hoặc lạy vào màn hình điện thoại                ║
║     này để tránh rước vong linh ngoại lai!          ║
║                                                       ║
║     [Timer/Counter: 00:00]  (only visible UI)       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

Behavior:
- All UI elements hidden EXCEPT timer
- Red overlay is full-screen and immersive
- Camera is confirmed OFF (status icon shows: 🔴 Camera OFF)
- Screenshot button disabled / greyed out
- User cannot interact with other UI elements
- User taps [Exit] to end session → normal UI resumes

Accessibility:
- Text is white on bright red for contrast
- Font size is large (readable while eyes supposedly closed)
- Timer is positioned so user can open eyes briefly to check time
```

---

## Schema Notes

```prisma
// Thêm vào AltarInventory table
model AltarInventoryItem {
  id        String   @id @default(cuid())
  altarId   String
  itemId    String
  zone      String   // 'TOP_ZONE' | 'BOTTOM_ZONE'
  itemType  String   // STATUE | INCENSE_STICK | RICE | FRUIT | PAPER | WATER_CUP | CANDLE | OTHER
  addedAt   DateTime @default(now())

  @@unique([altarId, itemId, zone])
  @@index([altarId, zone])
}

// Thêm vào HeartIncenseSession table (new)
model HeartIncenseSession {
  id                    String   @id @default(cuid())
  userId                String
  sessionType           String   @default("HEART_INCENSE")
  cameraDisabled        Boolean  @default(false)
  screenRedModeActive   Boolean  @default(false)
  startedAt             DateTime @default(now())
  endedAt               DateTime?
  durationSeconds       Int?

  @@index([userId, startedAt])
}
```

---

## Audit

| Action | Trigger | Details |
|---|---|---|
| `altar.under-altar.statue-block-attempted` | User tries to add STATUE to BOTTOM_ZONE | itemId, altarId, zone |
| `altar.under-altar.zone-validated` | Item successfully added to zone | itemId, zone, itemType |
| `content.heart-incense.camera-required-error` | User skips camera confirmation | userId, sessionType |
| `content.heart-incense.camera-disabled` | Camera successfully disabled | userId, sessionType, timestamp |
| `content.heart-incense.red-mode-activated` | Red overlay shown | userId, sessionType, startedAt |
| `content.heart-incense.session-ended` | User exits heart incense mode | userId, durationSeconds |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| STATUE + BOTTOM_ZONE | `statue_cannot_be_stored_under_altar` | 400 | Tội bất kính: Không được cất giấu tượng Bồ Tát dưới gầm bàn thờ! |
| disableCameraConfirmed false | `heart_incense_camera_required` | 403 | Bạn phải xác nhận tắt camera để bắt đầu chế độ tâm quán. |
| Camera disable failed | `heart_incense_camera_required` | 403 | Không thể tắt camera. Vui lòng kiểm tra quyền thiết bị. |

---

## Notes for AI/codegen

- **Zone validation** là lightweight business rule — chỉ check `itemType === 'STATUE' && zone === 'BOTTOM_ZONE'`.
- **Camera disabling** cần native integration (React Native, Cordova, Capacitor tùy frontend framework).
- **Red mode overlay** phải là full-screen immersive, không cho phép tap-outside or escape.
- **Screenshot prevention** phải block platform-level screenshot (Android: FLAG_SECURE, iOS: preventScreenCapture).
- **Timer visibility** là exception duy nhất để user có thể kiểm tra thời gian tâm quán.
- Phase 1: Basic zone validation + red overlay.
- Phase 2+: Integrate device camera API, motion sensors để detect nếu user thực sự quỳ lạy (advanced biometric guard).

---

## Related

- [auspicious-beast-ai-filter.md](./auspicious-beast-ai-filter.md) — altar item restrictions
- [hardware-uuid-prohibition.md](./hardware-uuid-prohibition.md) — device binding rules
- [sacred-item-damage-protocol.md](./sacred-item-damage-protocol.md) — item handling safety
- [prayer-request-specificity-anti-greed-validator.md](../../vows-merit/USE_CASES/prayer-request-specificity-anti-greed-validator.md) — prayer intention clarity
