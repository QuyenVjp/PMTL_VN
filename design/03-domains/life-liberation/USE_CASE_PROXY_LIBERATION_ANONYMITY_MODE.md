# Chế Độ Ẩn Danh Trong Phóng Sinh Thay Người — Proxy Liberation Anonymity Mode

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nhiều Phụng sự viên nhận lời đi phóng sinh thay cho các đồng tu khác (bệnh nặng không đi được, tuổi cao, hay hoàn cảnh khó khăn). Theo giáo lý Pháp Môn, khi dùng tiền của người khác để mua cá thả vào hồ, Phụng sự viên **tuyệt đối cấm nhắc đến tên của chính mình** hoặc nghĩ về mình tại hồ. Nếu lỡ miệng nhắc tên mình, **một phần công đức sẽ chạy ngược về phía Phụng sự viên** thay vì người nhờ thả. Hệ thống phải hỗ trợ chế độ "Proxy Mode" (Phóng sinh thay) bằng cách ẩn tên của Phụng sự viên và chỉ hiển thị tên của người nhận lợi ích, kèm theo cảnh báo lớn, rõ ràng, và nhấp nháy để nhắc nhở Phụng sự viên.

---

## Owner module

`life-liberation` — LifeLiberationProxyService / ReleaseRecitationController  
`engagement` — ProxyReleaseProtocol  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `proxy-volunteer` — Phụng sự viên thực hiện phóng sinh thay
- `beneficiary` — Người nhờ thả (tên đọc tại hồ)
- `system` — Anonymize proxy name, display warning, enforce recitation protocol
- `benefit-recipient` — Người hưởng lợi từ phóng sinh (có thể khác với nhờ thả)

---

## Trigger

- Volunteer start life-liberation session in "Proxy Mode" (không phải người nhờ thả)
- Location check: arriving at release site (geofence or manual check-in)
- Volunteer open app to view recitation script

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Volunteer = person requesting release (not proxy) | ✅ NORMAL mode — show volunteer's name for merit transfer |
| Volunteer = proxy (person doing release FOR someone) | ✅ PROXY mode — hide volunteer name, show only beneficiary |
| Volunteer in PROXY mode + at release site | ⚠️ WARNING — flashy red banner: "CHỈ ĐỌC TÊN CỦA NGƯỜI NHỜ PHÓNG SINH. TUYỆT ĐỐI CẤM ĐỌC TÊN CỦA BẠN!" |
| Volunteer attempt to edit recitation script to add own name | ❌ REJECTED — prevent edit, show warning |
| Volunteer finish release + leave site | ✅ Auto-hide warning, log completion |
| Volunteer accidentally mention own name in notes/logs | ⚠️ WARNING — suggest correction, offer to delete note |

---

## Input Contract

```
POST /api/life-liberation/start-release-session
{
  "volunteerId": "uuid",
  "releaseMode": "PERSONAL" | "PROXY",
  
  // PROXY mode fields:
  "beneficiaryName": "string (max 100, person who REQUESTS release)",
  "beneficiaryId": "uuid (optional, internal)",
  "dedicationReason": "HEALTH | FERTILITY | RECOVERY | GENERAL",
  "proxyVolunteerAcknowledgment": "boolean (I understand I must NOT mention my name)",
  
  // PERSONAL mode fields:
  "dedicationReason": "HEALTH | FERTILITY | RECOVERY | GENERAL",
  "dedicationNotes": "string (optional)"
}

POST /api/life-liberation/release-recitation
{
  "sessionId": "uuid",
  "releaseMode": "PERSONAL" | "PROXY",
  "recitationScript": "string (generated from template)",
  "locationCoordinates": "{ lat, lng }",
  "recitationAudio": "url (optional recording)"
}
```

---

## Write Path

### Path A: Start Proxy Release Session
```
1. Query volunteerId, verify role = "VOLUNTEER"
2. Validate DTO:
   - releaseMode === "PROXY"
   - beneficiaryName.trim().length > 0 → 400 if empty
   - proxyVolunteerAcknowledgment === true → 400 if false
3. If proxyVolunteerAcknowledgment === false:
   - Show modal: "⚠️ Điều Kiện Phóng Sinh Thay:
     Bạn TUYỆT ĐỐI CẤM nhắc đến tên của chính bạn tại hồ.
     Nếu nói tên bạn, một phần công đức sẽ chạy ngược về bạn thay vì [TÊN NGƯỜI NHỜ].
     Bạn có đồng ý?"
   - Require re-check before proceeding
4. Create LifeLiberationSession record:
   {
     volunteerId, beneficiaryName, beneficiaryId (if provided),
     releaseMode: "PROXY", dedicationReason,
     status: "INITIALIZED", createdAt: now(),
     proxyVolunteerName: null (ẩn đi), // for audit only
     beneficiaryVisibleName: beneficiaryName
   }
5. Generate recitation script using beneficiary name ONLY:
   - recitationScript = generateLifeLiberationScript({
       beneficiaryName, dedicationReason,
       volunteerName: null (omitted)
     })
   - Example: "Con xin phóng sinh cho [TÊN NGƯỜI NHỜ], mong rằng [người đó] sớm khỏi bệnh..."
6. Return 201 {
     sessionId, recitationScript, visibleBeneficiary: beneficiaryName,
     proxyAcknowledged: true
   }
```

### Path B: Display Recitation Script at Release Site
```
1. Query sessionId; verify status = "INITIALIZED"
2. If releaseMode === "PROXY":
   a. Generate prominent warning banner:
      - backgroundColor: red
      - textColor: white
      - blinking animation: blink every 1 second
      - text: "⚠️ CHỈ ĐƯỢC ĐỌC TÊN CỦA NGƯỜI NHỜ PHÓNG SINH.
               TUYỆT ĐỐI CẤM ĐỌC TÊN CỦA BẠN TẠI ĐÂY!"
      - fontSize: 24px (large, unmissable)
   b. Display ONLY recitation script with beneficiary name
   c. Hide volunteer's own name from display (never shown)
   d. Prevent copy/edit of recitation text (read-only)
3. If releaseMode === "PERSONAL":
   a. No warning banner
   b. Display normal recitation script with volunteer's own name
4. Enable audio recording (optional): volunteer can record recitation
5. Return 200 {
     sessionId, recitationScript, warningBanner (if PROXY),
     recordingEnabled: true
   }
```

### Path C: Complete Release Session
```
1. Query sessionId; verify status = "INITIALIZED"
2. Validate DTO:
   - recitationAudio provided (optional, but log if recording used)
   - locationCoordinates valid (lat/lng)
3. Create LifeLiberationRecord:
   {
     sessionId, releaseMode, beneficiaryName,
     locationCoordinates, recitationScript,
     recitationAudio (if provided), completedAt: now(),
     volunteerName: null (for PROXY; visible for PERSONAL)
   }
4. If recitationScript contains volunteer's own name (paranoid check):
   - Flag: possibleNameMention: true
   - Alert volunteer: "Detekterade mungkin ada tên của bạn dalam script.
     Hãy chắc chắn bạn chỉ đọc tên [BENEFICIARY_NAME]."
5. Update session status: "COMPLETED"
6. Emit audit log:
   action: "life-liberation.release.completed"
   context: {
     sessionId, releaseMode, beneficiaryName, locationCoordinates,
     volunteerName: (OMITTED for PROXY, shown for PERSONAL),
     recordingUsed: boolean
   }
7. Return 201 {
     releaseId, confirmationMessage: "Công đức phóng sinh cho [TÊN NGƯỜI NHỜ] đã được ghi nhận.
     Mong rằng [người đó] sớm nhận được phước báu."
   }
```

---

## FE Behavior

### Proxy Release Start (Modal)
```
┌──────────────────────────────────────────────┐
│  ⚠️  Phóng Sinh Thay — Điều Kiện Quan Trọng │
├──────────────────────────────────────────────┤
│                                              │
│  Bạn sắp phóng sinh THAY cho:                │
│  [____________________________]              │
│  (Nhập tên người nhờ thả)                    │
│                                              │
│  ⛔ TUYỆT ĐỐI CẤM:                           │
│  ✗ Nhắc đến tên của chính bạn tại hồ        │
│  ✗ Nghĩ về bạn khi đọc kinh                  │
│  ✗ Cho tên của bạn vào script               │
│                                              │
│  ❓ Tại sao?                                 │
│  Nếu bạn nhắc tên bạn → công đức sẽ chạy    │
│  ngược về bạn thay vì người nhờ thả.         │
│                                              │
│  ☐ Tôi hiểu và cam kết tuân thủ.            │
│                                              │
│       [Tiếp tục]  [Hủy]                     │
│                                              │
└──────────────────────────────────────────────┘
```

### At Release Site (Recitation Display)
```
┌──────────────────────────────────────────────┐
│ ⚠️⚠️⚠️ CHỈ ĐỌC TÊN CỦA NGƯỜI NHỜ!⚠️⚠️⚠️        │
│ TUYỆT ĐỐI CẤM ĐỌC TÊN CỦA BẠN!              │
├──────────────────────────────────────────────┤
│                                              │
│  📜 Script Phóng Sinh (READ-ONLY):           │
│                                              │
│  "Con xin phóng sinh cho chị Linh,          │
│   mong chị Linh sớm khỏi bệnh tim,         │
│   cơ thể khỏe mạnh, tâm trí an lạc.        │
│                                              │
│   Nam Mô A Di Đà Phật...                    │
│   Nam Mô Quán Thế Âm Bồ Tát...              │
│   ..."                                      │
│                                              │
│  ☑️ Tôi đã hiểu script, sẵn sàng đọc       │
│                                              │
│  🎙️ [Ghi âm] (tùy chọn)                    │
│  📍 Location: [Xác nhận vị trí hồ]          │
│                                              │
│         [Xác nhận Hoàn thành]               │
│                                              │
└──────────────────────────────────────────────┘

Warning banner:
- RED background, WHITE text
- Blinks every 1 second
- Font size 24px
- Top of screen, full width
- Cannot dismiss (must complete release to hide)
```

### Completion Confirmation
```
┌──────────────────────────────────────────────┐
│  ✅ Phóng Sinh Thay Hoàn Thành              │
├──────────────────────────────────────────────┤
│                                              │
│  Công đức phóng sinh cho Chị Linh            │
│  đã được Bồ Tát ghi nhận.                    │
│                                              │
│  Mong rằng Chị Linh sớm khỏi bệnh tim,      │
│  cơ thể khỏe mạnh, tâm trí an lạc.         │
│                                              │
│  Thời gian: 2026-04-04 14:30 (Sydney)      │
│  Địa điểm: Hồ [Location Name]              │
│  Số cá thả: [Số lượng] con                  │
│                                              │
│  Cảm ơn bạn vì công đức này.                │
│                                              │
│  ℹ️  Chị Linh sẽ nhận được thông báo        │
│     rằng có người thả cá cho cô ấy.        │
│                                              │
│            [Về trang chủ]                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model LifeLiberationSession {
  id                  String    @id @default(cuid())
  volunteerId         String
  volunteer           User      @relation("liberation-sessions", fields: [volunteerId], references: [id])
  
  beneficiaryName     String    // name of person requesting release (shown)
  beneficiaryId       String?   // if known, link to User
  
  releaseMode         String    // PERSONAL | PROXY
  dedicationReason    String    // HEALTH | FERTILITY | RECOVERY | GENERAL
  
  recitationScript    String    // generated script, never contains proxy volunteer name if PROXY
  
  proxyVolunteerAcknowledgment Boolean? // only for PROXY mode
  
  status              String    @default("INITIALIZED") // INITIALIZED, COMPLETED, CANCELLED
  
  createdAt           DateTime  @default(now())
  completedAt         DateTime?
  
  @@index([volunteerId])
  @@index([status])
}

model LifeLiberationRecord {
  id                  String    @id @default(cuid())
  sessionId           String
  session             LifeLiberationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  volunteerId         String
  volunteer           User      @relation("liberation-records", fields: [volunteerId], references: [id])
  
  beneficiaryName     String    // repeated for audit
  releaseMode         String    // PERSONAL | PROXY
  
  recitationScript    String
  recitationAudio     String?   // URL to recording
  
  locationCoordinates String    // JSON: { lat, lng, locationName }
  locationName        String?   // e.g., "Hồ Gươm" or "Green Lake"
  
  quantityReleased    Int?      // number of fish/creatures
  
  possibleNameMention Boolean?  // flag if volunteer's name might be in script
  
  completedAt         DateTime  @default(now())
  
  @@index([volunteerId])
  @@index([sessionId])
}

// Migration hints:
// CREATE TABLE IF NOT EXISTS "LifeLiberationSession" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "volunteerId" TEXT NOT NULL,
//   "beneficiaryName" TEXT NOT NULL,
//   "releaseMode" TEXT NOT NULL,
//   "dedicationReason" TEXT NOT NULL,
//   "recitationScript" TEXT NOT NULL,
//   "proxyVolunteerAcknowledgment" BOOLEAN,
//   "status" TEXT NOT NULL DEFAULT 'INITIALIZED',
//   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "completedAt" DATETIME,
//   FOREIGN KEY ("volunteerId") REFERENCES "User"("id")
// );
```

---

## Audit

| Action | Trigger |
|---|---|
| `life-liberation.proxy-session.started` | Volunteer start PROXY release session |
| `life-liberation.proxy-acknowledgment.confirmed` | Proxy volunteer acknowledge terms |
| `life-liberation.recitation.displayed` | Recitation script shown (warning banner active) |
| `life-liberation.release.completed` | Release session marked complete |
| `life-liberation.possible-name-mention.flagged` | System detect possible volunteer name in script |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| PROXY mode without acknowledgment | `proxy_acknowledgment_required` | 400 |
| Beneficiary name empty | `beneficiary_name_required` | 400 |
| Script edit attempt (PROXY mode) | `script_read_only_proxy_mode` | 400 |
| Volunteer name accidentally in script | `possible_volunteer_name_detected` | 400 (soft block) |

---

## Notes for AI/codegen

- **Visual warning:** Implement true CSS blink (not just opacity) or pulse animation; volunteer must see it.
- **Script immutability:** Lock recitation text in read-only mode; no copy, no edit when PROXY mode active.
- **Name detection:** Use fuzzy match on volunteer name to catch typos/variations; flag if detected in recitation script.
- **Beneficiary audit trail:** Store beneficiary name for karmic accountability; Secretariat can see who released for whom.
- **Privacy:** Volunteer name is never stored in LifeLiberationRecord when releaseMode = PROXY (only in session for audit).
- **Recording optional:** Support audio capture for transparency (volunteer can record to prove they followed protocol).
- **Geofence bonus:** Optional geofence check at release location (if enabled) can auto-enable/disable warning banner based on proximity to known release sites.
- **Repetition tracking:** If same volunteer makes 3+ PROXY releases in one week, send appreciation + reminder about merit splitting rules.

---

## Related

- [USE_CASE_RELEASED_LIVES_MORTALITY_COMPENSATION_MATH.md](./USE_CASE_RELEASED_LIVES_MORTALITY_COMPENSATION_MATH.md) — Mortality fallback when creatures die
- [USE_CASE_PHÓNG_SINH_MONEY_TRANSFER_PROTOCOL.md](./USE_CASE_PHÓNG_SINH_MONEY_TRANSFER_PROTOCOL.md) — Money dedication before proxy release
- [USE_CASE_EVENT_MERIT_TRANSFER_PROTOCOL.md](../vows-merit/USE_CASE_EVENT_MERIT_TRANSFER_PROTOCOL.md) — Merit dedication for events
