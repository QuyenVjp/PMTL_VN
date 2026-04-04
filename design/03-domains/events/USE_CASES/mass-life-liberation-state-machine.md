# Phóng Sinh Tập Thể Theo Trạng Thái — Mass Life Liberation State Machine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phóng sinh tập thể với Đại Bi tụng đồng bộ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hệ thống phóng sinh tập thể quản lý **sinh sự tập thể** (group life liberation events) với các pha hành động được đồng bộ hóa:

1. **PLANNING** → **EN_ROUTE** → **AT_LOCATION** → **RELEASING** → **COMPLETE**

Mỗi pha có:
- **Yêu cầu hành động khác nhau** (tụng Đại Bi, dừng lại tại vị trí, thả cá nhẹ nhàng)
- **Bộ đếm tập thể** (shared counter cho tất cả người tham gia)
- **Định vị địa lý** (geofence detection để trigger pha tiếp theo)
- **Hiệp thương nhắc nhở** (red banner alert với quy tắc cứng)

---

## Owner module

`events` (primary) with `life-liberation` integration — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `organizer` — tạo sự kiện POST /api/events/life-liberation/create
- `participant` — tham gia group event, follow state machine transitions
- `system` — manage state, validate geofence, sync counters, enforce ritual rules, audit

---

## Trigger

Organizer bấm **[Tạo Phóng Sinh Tập Thể]** button hoặc POST `/api/events/life-liberation/create`.

---

## Preconditions

- Organizer đã đăng nhập và có `memberProfile` hợp lệ.
- Có địa điểm phóng sinh được chọn (với tọa độ GPS).
- Có ít nhất 1 participant khác confirm tham gia.
- Tất cả participants có app installed với location permission granted.

---

## Input contract

```typescript
CreateGroupLifeLiberationDto {
  eventId:                string
  locationCoordinates: {
    lat:                number  // GPS latitude
    lng:                number  // GPS longitude
  }
  participantCount:       number
}
```

---

## State Machine — Transitions & Actions

### State 1: PLANNING

**Duration:** From event creation until organizer clicks "Bắt Đầu Hành Trình"

**UI Behavior:**
- Event appears in FE with status `PLANNING`
- Button: [Bắt Đầu Hành Trình] visible for organizer only
- Participants see read-only view with event details + meeting point on map
- No counters shown yet

**Validation Gate:**
- Verify `participantCount >= 1`
- Verify all participants accepted invitation
- Verify location coordinates are valid (within Vietnam territory)

**Transition trigger:** Organizer clicks [Bắt Đầu Hành Trình]

---

### State 2: EN_ROUTE

**Duration:** From when organizer starts journey until arrival at location

**Backend State Update:**
```
state = "EN_ROUTE"
startedAt = now()
```

**UI Behavior — All Participants:**
- **Large screen banner:** Countdown timer showing Đại Bi tụng recitation
- **Shared counter:** "Đại Bi Tụng — [X biến] được tụng cùng nhau"
- **Mandatory display:** Cannot dismiss, appears fullscreen

**Counter Logic:**
- Tính toán tổng số biến Đại Bi: `baseVerse = participantCount × 108` (each participant recites 108 verses standard)
- Display: "[108] biến Đại Bi cần tụng"
- As participants recite → counter increments in real-time (via WebSocket)
- **Lock:** Cannot advance to AT_LOCATION until counter reaches ≥80% of target

**Geofence Trigger:**
- System polls participant GPS every 30 seconds
- When ANY participant enters 100m radius of `locationCoordinates` → auto-transition to AT_LOCATION

**Audit:**
- `life-liberation.group.dai-bi-recitation-started`

---

### State 3: AT_LOCATION

**Duration:** From first participant arrival until organizer confirms "Thả"

**Backend State Update:**
```
state = "AT_LOCATION"
arrivedAt = now()
```

**UI Behavior — Critical Red Banner:**

```
🔴 YÊU CẦU: Thả cá nhẹ nhàng, không ném mạnh!
   Nếu phóng sinh thay người khác, CHỈ ĐƯỢC ĐỌC TÊN CỦA HỌ, CẤM NHẮC TÊN MÌNH!
```

**Banner properties:**
- **Background:** Bright red (#FF0000 or alert red)
- **Text:** Bold, large, white on red
- **Position:** Top of screen, always visible, non-dismissible
- **Duration:** Entire AT_LOCATION phase (until RELEASING)

**Counter continues:**
- Shared counter still visible below banner
- Participants continue reciting in group
- Counter updates in real-time

**Location Verification:**
- System confirms all participants within geofence
- If any participant leaves geofence → red warning: "Một người tham gia đã rời khỏi vị trí. Vui lòng quay lại."
- Organizer can manually force transition to RELEASING if all participants ready

**Transition trigger:** Organizer clicks [Bắt Đầu Thả] button (or auto-trigger if all participants confirm readiness)

**Audit:**
- `life-liberation.group.arrived-at-location`

---

### State 4: RELEASING

**Duration:** During actual release of creatures

**Backend State Update:**
```
state = "RELEASING"
releasingAt = now()
```

**UI Behavior:**
- Red banner still visible with release instructions
- Counter pauses (no new recitation updates required)
- Organizer can mark individual releases: [Đã Thả X] (updates participant-specific audit)
- Participants see live feed of who has released

**Manual Override:**
- Organizer can manually trigger transition to COMPLETE (in case release takes longer than expected)

**Transition trigger:** System auto-transitions to COMPLETE after 15 minutes, OR organizer manually confirms all released

**Audit:**
- Individual release confirmations per participant

---

### State 5: COMPLETE

**Duration:** Final state

**Backend State Update:**
```
state = "COMPLETE"
completedAt = now()
```

**UI Behavior:**
- Event marked complete
- Summary screen shows:
  - Total participants: N
  - Total creatures released: X
  - Total Đại Bi verses recited: Y
  - Duration: HH:MM
- Button: [Xem Lại Chi Tiết] → shows full audit trail

**Audit:**
- `life-liberation.group.completed`

---

## Write path — Validation & State Enforcement

### Gate 1: Event Creation Validation

1. **Check organizer authorization:**
   - Verify user has `memberProfile` with min merit level 50

2. **Check location validity:**
   - Verify coordinates are within Vietnam
   - Verify location is not in prohibited zone (e.g., inside city, polluted water)
   - Error if invalid: `location_invalid` 400

3. **Check participant list:**
   - Verify `participantCount >= 1`
   - Verify all participants accepted invitation
   - Error: `insufficient_participants` 400

4. **Create GroupLifeLiberationEvent record:**
   ```prisma
   GroupLifeLiberationEvent {
     id:                      String @id
     organizerId:             String
     state:                   String  // "PLANNING" | "EN_ROUTE" | "AT_LOCATION" | "RELEASING" | "COMPLETE"
     locationCoordinates:     Json    // { lat: number, lng: number }
     totalParticipants:       Int
     startedAt:               DateTime?
     arrivedAt:               DateTime?
     completedAt:             DateTime?
     createdAt:               DateTime
     updatedAt:               DateTime
   }
   ```

5. **Return success:**
   ```json
   {
     "success": true,
     "data": {
       "eventId": "uuid",
       "state": "PLANNING",
       "totalParticipants": 5,
       "locationCoordinates": { "lat": 10.7769, "lng": 106.6966 },
       "message": "Sự kiện phóng sinh tập thể đã được tạo. Chờ tất cả thành viên xác nhận."
     }
   }
   ```

### Gate 2: EN_ROUTE Transition Validation

1. **Check organizer permission:** Only organizer can start journey
2. **Check participant readiness:** All participants must have location enabled
3. **Update state:** `state = "EN_ROUTE"`, `startedAt = now()`
4. **Initialize counter:**
   - Calculate `baseVerse = participantCount × 108`
   - Create GroupLiberation Counter record
   - Broadcast to all participants via WebSocket

### Gate 3: AT_LOCATION Transition Validation

1. **Validate geofence:** Check if any participant within 100m
2. **If valid:** Update `state = "AT_LOCATION"`, `arrivedAt = now()`
3. **Display red banner:** Send mobile push notification with banner content
4. **Lock EN_ROUTE:** Prevent reverting to EN_ROUTE

### Gate 4: RELEASING Transition Validation

1. **Verify location lock:** All participants still within geofence
2. **Check counter progress:** If <80% verses recited, warn organizer but allow override
3. **Update state:** `state = "RELEASING"`
4. **Pause counter:** No new updates required

### Gate 5: COMPLETE Transition Validation

1. **Verify RELEASING duration:** Auto-complete after 15 minutes
2. **Allow manual override:** Organizer can force completion
3. **Update state:** `state = "COMPLETE"`, `completedAt = now()`
4. **Calculate summary:**
   - Total participants: N
   - Total verses: Y
   - Award merit to all participants: `merit += (Y / participantCount)` per person

---

## Shared Counter Synchronization

### Real-time Updates via WebSocket

```typescript
// Every 5 seconds during EN_ROUTE & AT_LOCATION phases:
BroadcastCounterUpdate {
  eventId:              string
  currentVersesRecited: number
  targetVerses:         number
  percentComplete:      number  // 0-100
  updatedAt:            DateTime
}
```

### Counter Increment Rules

- Each participant can report verses recited via mobile UI
- Verses only increment when participant confirms "Tôi vừa tụng X biến"
- System de-duplicates (no double-counting)
- Counter freezes at RELEASING state

---

## FE Behavior — State-Specific Screens

### Screen 1: PLANNING (Before Start)

```
╔════════════════════════════════════════╗
║  Phóng Sinh Tập Thể                    ║
║  Trạng thái: Chuẩn Bị                  ║
╚════════════════════════════════════════╝

📍 Vị trí thả: Sông Đồng Nai, Cây Cầu Xanh
🎯 Tọa độ: 10.7769°N, 106.6966°E

👥 Số người tham gia: 5
   ✓ Bạn (Organizer)
   ✓ Nguyễn Văn A
   ✓ Trần Thị B
   ⏳ Phạm Văn C (Chờ xác nhận)
   ? Hoàng Văn D (Chưa trả lời)

📅 Thời gian: Hôm nay, 9:00 sáng
💬 Ghi chú: Phóng sinh cá chép để cầu nguyện cho vợ tôi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Huỷ Sự Kiện]  [Bắt Đầu Hành Trình]
```

### Screen 2: EN_ROUTE (Journey)

```
╔════════════════════════════════════════╗
║  🔴 ĐANG HÀNH TRÌNH                    ║
╚════════════════════════════════════════╝

📍 Đích đến: Cây Cầu Xanh (2.3 km)
⏱️  Thời gian dự kiến: 18 phút

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🙏 ĐẠI BI TỤNG — Tụng Cùng Nhau

[108 biến Đại Bi cần tụng]

Đã tụng: 87 / 108 (81%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 Những người cùng tụng:
   Bạn: 22 biến ✓
   Nguyễn Văn A: 20 biến ✓
   Trần Thị B: 18 biến ✓
   Phạm Văn C: 15 biến ✓
   Hoàng Văn D: 12 biến ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tôi vừa tụng X biến]  [Tạm Dừng]
```

### Screen 3: AT_LOCATION (Arrived)

```
╔════════════════════════════════════════╗
║  🔴 YÊU CẦU: Thả cá nhẹ nhàng,          ║
║  không ném mạnh! Nếu phóng sinh        ║
║  thay người khác, CHỈ ĐƯỢC ĐỌC         ║
║  TÊN CỦA HỌ, CẤM NHẮC TÊN MÌNH!        ║
╚════════════════════════════════════════╝

📍 Vị trí hiện tại: Đã tới (100m)

🙏 ĐẠI BI TỤNG — Tụng Cùng Nhau

[108 biến Đại Bi cần tụng]

Đã tụng: 102 / 108 (94%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tôi đã sẵn sàng thả]  [Tôi vừa tụng X biến]
```

### Screen 4: RELEASING (Release Happening)

```
╔════════════════════════════════════════╗
║  🔴 ĐANG THẢ SINH VẬT                  ║
╚════════════════════════════════════════╝

📍 Vị trí thả: Cây Cầu Xanh ✓

✅ Đã thả: 3 người
⏳ Chờ thả: 2 người

Bạn: [Đã Thả] ✓
Nguyễn Văn A: [Đã Thả] ✓
Trần Thị B: [Đã Thả] ✓
Phạm Văn C: [Chưa Thả] ⏳
Hoàng Văn D: [Chưa Thả] ⏳

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chúc mừng! Các em tôm cá đã được giải thoát.
Phước đức quay lại các bạn.

[Hoàn Tất Phóng Sinh]
```

### Screen 5: COMPLETE (Summary)

```
╔════════════════════════════════════════╗
║  ✅ PHÓNG SINH HOÀN TẤT                ║
╚════════════════════════════════════════╝

👥 Tổng số người: 5
🐟 Tổng sinh vật thả: 150 con
🙏 Tổng Đại Bi biến: 540 biến
⏱️  Thời gian: 1 giờ 23 phút

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 Phước Lợi Tích Tụ:
   Bạn: +108 phước (54 biến / người)
   Nguyễn Văn A: +108 phước
   Trần Thị B: +108 phước
   Phạm Văn C: +108 phước
   Hoàng Văn D: +108 phước

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Lời cảm tạ:
   "Cảm tạ các em đã cùng vâng niệm.
    Cho các em được nhân sinh làm người,
    Cho ba mẹ được trường thọ an lạc."

[Xem Lại Chi Tiết]  [Chia Sẻ]
```

---

## Errors

| Condition | Error code | HTTP | Message |
|---|---|---|---|
| Not ready to start (participants missing) | `event_not_ready` | 400 | "Chưa đủ thành viên xác nhận. Vui lòng chờ tất cả trả lời." |
| Location mismatch (geofence check failed) | `location_mismatch` | 403 | "Một số người chưa tới vị trí. Vui lòng đợi tất cả tập hợp." |
| Invalid location coordinates | `location_invalid` | 400 | "Tọa độ không hợp lệ. Vui lòng chọn vị trí khác." |
| Insufficient participants | `insufficient_participants` | 400 | "Cần ít nhất 2 người để tạo sự kiện phóng sinh tập thể." |
| State transition not allowed | `invalid_state_transition` | 409 | "Trạng thái hiện tại không cho phép thao tác này." |
| Organizer not authorized | `unauthorized` | 401 | "Chỉ người tổ chức mới có thể bắt đầu sự kiện." |

---

## Audit

| Action | Trigger | Severity |
|---|---|---|
| `life-liberation.group.created` | POST /api/events/life-liberation/create succeeds | INFO |
| `life-liberation.group.dai-bi-recitation-started` | State transitions from PLANNING → EN_ROUTE | INFO |
| `life-liberation.group.arrived-at-location` | State transitions from EN_ROUTE → AT_LOCATION | INFO |
| `life-liberation.group.releasing-started` | State transitions to RELEASING | INFO |
| `life-liberation.group.completed` | State transitions to COMPLETE | INFO |
| `life-liberation.group.location-violation` | Participant leaves geofence during AT_LOCATION | WARN |
| `life-liberation.group.counter-low` | Counter <80% when transitioning to RELEASING | WARN |

---

## Rate-limit requirement

- No rate limit on event creation
- Geofence checks: max 1 per 30 seconds per event
- Counter updates: max 1 per 5 seconds per participant

---

## Schema Notes for AI/codegen

```prisma
model GroupLifeLiberationEvent {
  id                        String   @id @default(cuid())
  organizerId               String
  organizer                 User     @relation(fields: [organizerId], references: [id], onDelete: Cascade)

  state                     String   // "PLANNING" | "EN_ROUTE" | "AT_LOCATION" | "RELEASING" | "COMPLETE"
  locationCoordinates       Json     // { lat: number, lng: number }
  totalParticipants         Int

  // State timestamps
  startedAt                 DateTime?
  arrivedAt                 DateTime?
  releasingAt               DateTime?
  completedAt               DateTime?

  // Metadata
  participantIds            String[] // array of participant user IDs
  totalVersesRecited        Int?     // final count
  totalCreaturesReleased    Int?

  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@index([organizerId, state])
  @@index([createdAt])
}

model GroupLiberationCounter {
  id                        String   @id @default(cuid())
  eventId                   String
  event                     GroupLifeLiberationEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  currentVersesRecited      Int      @default(0)
  targetVerses              Int      // participantCount × 108
  updatedAt                 DateTime @updatedAt

  @@unique([eventId])
}

model GroupLiberationParticipant {
  id                        String   @id @default(cuid())
  eventId                   String
  event                     GroupLifeLiberationEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  userId                    String
  user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  versesRecited             Int      @default(0)
  releasedAt                DateTime?
  joinedAt                  DateTime @default(now())

  @@unique([eventId, userId])
}

// Optional: Real-time synchronization service
service GroupLiberationStateManager {
  transitionState(eventId: string, newState: string): Promise<Result<void>>
  updateCounter(eventId: string, versesToAdd: number): Promise<void>
  checkGeofence(eventId: string): Promise<boolean>
  broadcastCounterUpdate(eventId: string): Promise<void>
}
```

---

## Related

- [casualty-recovery-override.md](../../life-liberation/USE_CASES/casualty-recovery-override.md) — Emergency response when creatures die during release
- [Phóng Sinh Tiền Gửi Chuyển Động](../../life-liberation/USE_CASE_PHONG_SINH_MONEY_TRANSFER_PROTOCOL.md) — Financial tracking for group liberations
- [Predatory Species Ban](../../life-liberation/USE_CASE_PREDATORY_SPECIES_BAN.md) — Species restrictions during group events
