# Cứu Rỗi Tử Vong Khẩn Cấp — Casualty Recovery Override

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức Vãng Sanh cho sinh vật chết trước thời gian phóng sinh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi phóng sinh tập thể, một số sinh vật (tôm, cua, cá) có thể **chết trong quá trình vận chuyển hoặc trước khi thả**.

Hệ thống **Casualty Recovery Override** cho phép:

1. **Volunteer/Organizer báo cáo** số lượng tôm, cua, cá chết
2. **Tự động tính toán** số biến Vãng Sanh cần tụng:
   - Tôm × 3 biến (Vãng Sanh biến)
   - Cua/Cá × 7 biến (Vãng Sanh biến)
3. **Phân bổ đều** giữa tất cả participants online
4. **Hiển thị counter khẩn cấp** với trách nhiệm cụ thể cho mỗi người

---

## Owner module

`life-liberation` — CasualtyRecoveryOverride service

---

## Actors

- `volunteer` hoặc `organizer` — report casualty via POST /api/events/life-liberation/report-casualty
- `participant` — view and confirm emergency recitation quota assignment
- `system` — auto-calculate verses, distribute load, sync counters, audit

---

## Trigger

Volunteer/Organizer phát hiện creature chết và bấm **[Báo Cáo Sinh Vật Chết]** button hoặc POST `/api/events/life-liberation/report-casualty`.

---

## Preconditions

- Group liberation event currently in `EN_ROUTE` hoặc `AT_LOCATION` state
- User has organizer/volunteer role (not just participant)
- At least 1 online participant to distribute load among

---

## Input contract

```typescript
ReportCasualtyDto {
  shrimpCount:     number  // tôm chết
  crabCount:       number  // cua chết
  fishCount:       number  // cá chết
}
```

---

## Calculation Algorithm

### Step 1: Base Verse Calculation

```
totalVersesRequired = (shrimpCount × 3) + (crabCount × 7) + (fishCount × 7)
```

**Example:**
- 5 tôm chết → 5 × 3 = 15 biến
- 2 cua chết → 2 × 7 = 14 biến
- 3 cá chết → 3 × 7 = 21 biến
- **Total = 15 + 14 + 21 = 50 biến Vãng Sanh cần tụng**

### Step 2: Participant Distribution

```
onlineParticipants = count of users currently in AT_LOCATION geofence
versesPerPerson = totalVersesRequired / onlineParticipants (rounded up)
```

**Example with 5 participants:**
- `50 biến / 5 = 10 biến per person`
- Each participant receives: "Khẩn Cấp: Cần niệm 10 biến Vãng Sanh cho 5 tôm, 2 cua, 3 cá đã mất."

### Step 3: Create Casualty Report Record

```prisma
CasualtyReport {
  id:                      String @id
  eventId:                 String
  reportedBy:              String  // organizer/volunteer user ID
  shrimpCount:             Int
  crabCount:               Int
  fishCount:               Int
  totalVersesRequired:     Int     // calculated
  distributedPerPerson:    Int     // rounded up
  onlineParticipants:      Int     // count of participants in geofence
  reportedAt:              DateTime
  createdAt:               DateTime
}
```

### Step 4: Allocate per Participant

For each online participant, create `EmergencyRecitationQuota`:

```prisma
EmergencyRecitationQuota {
  id:                      String @id
  eventId:                 String
  casualtyReportId:        String
  userId:                  String

  assignedVerses:          Int     // versesPerPerson
  completedVerses:         Int     @default(0)
  completedAt:             DateTime?

  assignedAt:              DateTime
  createdAt:               DateTime
}
```

---

## Write path — Validation & Distribution

### Gate 1: Event & Participant Validation

1. **Check event state:**
   - Verify event in `EN_ROUTE` or `AT_LOCATION`
   - Error if not: `event_not_in_progress` 409

2. **Check organizer/volunteer role:**
   - Verify user is organizer or has `volunteer` flag
   - Error if not: `unauthorized` 401

3. **Check online participants:**
   - Query participants currently in `AT_LOCATION` geofence
   - Verify count >= 1
   - Error: `no_online_participants` 400

### Gate 2: Input Validation

4. **Validate casualty counts:**
   ```typescript
   z.object({
     shrimpCount: z.number().int().min(0).max(10000),
     crabCount: z.number().int().min(0).max(10000),
     fishCount: z.number().int().min(0).max(10000)
   })
   ```

5. **Check at least 1 casualty reported:**
   - Verify `(shrimpCount + crabCount + fishCount) >= 1`
   - Error: `no_casualties_reported` 400

### Gate 3: Calculate Verses

6. **Apply multipliers:**
   ```
   totalVerses = (shrimpCount × 3) + (crabCount × 7) + (fishCount × 7)
   ```

7. **Cap calculation** (safety check):
   - Max total verses per report: 10,000 (prevents abuse)
   - Error if exceeded: `verses_exceeded_limit` 400

### Gate 4: Distribute to Participants

8. **Calculate per-person quota:**
   ```
   versesPerPerson = Math.ceil(totalVerses / onlineParticipantCount)
   ```

9. **Create CasualtyReport record:**
   ```
   INSERT INTO CasualtyReport (
     eventId, reportedBy, shrimpCount, crabCount, fishCount,
     totalVersesRequired, distributedPerPerson, onlineParticipants, reportedAt
   ) VALUES (...)
   ```

10. **Create EmergencyRecitationQuota for each participant:**
    ```
    FOR EACH participant in onlineParticipants:
      INSERT INTO EmergencyRecitationQuota (
        eventId, casualtyReportId, userId, assignedVerses, assignedAt
      ) VALUES (eventId, reportId, userId, versesPerPerson, now())
    ```

### Gate 5: Broadcast Emergency Counter

11. **Send WebSocket message to all participants:**
    ```json
    {
      "type": "CASUALTY_ALERT",
      "eventId": "uuid",
      "casualtyReportId": "uuid",
      "message": "Khẩn Cấp: Có 5 tôm, 2 cua, 3 cá đã mất. Cần tụng 10 biến Vãng Sanh cho mỗi người.",
      "totalVersesRequired": 50,
      "yourQuota": 10,
      "totalParticipants": 5,
      "creatureBreakdown": {
        "shrimpCount": 5,
        "crabCount": 2,
        "fishCount": 3
      }
    }
    ```

### Gate 6: Return Success

12. **API Response:**
    ```json
    {
      "success": true,
      "data": {
        "casualtyReportId": "uuid",
        "totalCreaturesDeceased": 10,
        "totalVersesRequired": 50,
        "distributedPerPerson": 10,
        "onlineParticipants": 5,
        "breakdown": {
          "shrimpCount": 5,
          "crabCount": 2,
          "fishCount": 3
        },
        "message": "Đã ghi nhận sinh vật chết. Yêu cầu các bạn tụng 10 biến Vãng Sanh cho từng em đã mất."
      }
    }
    ```

---

## FE Behavior — Emergency Counter Display

### Trigger: Casualty Report Submitted

When backend broadcasts `CASUALTY_ALERT`, FE shows **persistent red banner**:

```
╔════════════════════════════════════════╗
║  🔴 KHẨN CẤP                           ║
║                                        ║
║  Sinh vật chết trong quá trình        ║
║  phóng sinh:                           ║
║  • 5 tôm                               ║
║  • 2 cua                               ║
║  • 3 cá                                ║
║                                        ║
║  Cần tụng: 50 biến Vãng Sanh            ║
║  Trách nhiệm của bạn: 10 biến           ║
║                                        ║
║  Đây là cơ hội cứu rỗi những              ║
║  em đã mất do hoàn cảnh bất ngờ.      ║
╚════════════════════════════════════════╝

🙏 VÃNG SANH TỤNG — Tụng Cùng Nhau

[10 biến Vãng Sanh cần tụng]

Đã tụng: 3 / 10 (30%)

👥 Tiến độ của nhóm:
   Bạn: 3 biến ✓
   Nguyễn Văn A: 2 biến ✓
   Trần Thị B: 1 biến ✓
   Phạm Văn C: 2 biến ✓
   Hoàng Văn D: 0 biến ⏳

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tôi vừa tụng X biến]
```

### Counter Behavior

- **Persistent:** Does NOT dismiss automatically
- **Updates in real-time:** Via WebSocket, every 2 seconds
- **Visual feedback:** Progress bar with percentage
- **Individual tracking:** Shows which participant has completed quota
- **Lock condition:** Cannot proceed to "mark as complete" until ALL participants reach 100% quota

---

## Counter Freeze & Completion

### When All Participants Complete Quota

```
✅ Đã hoàn tất Vãng Sanh tụng cho 10 em đã mất.

Lời cầu nguyện:
"Cảm tạ những em tôm, cua, cá.
Cho các em được nhân sinh làm người,
Được học Phật pháp, quay lại nhân thân
Trên con đường giải thoát."
```

**Auto-action:**
1. Banner changes to SUCCESS state (green)
2. Counter freezes (no further updates)
3. Unlock button: [Tiếp Tục Thả] — transitions group event to next phase if all other conditions met

### Partial Completion (>80% done)

If organizer force-completes event before ALL participants hit 100%:

```
⚠️  CẢNH BÁO:
Chưa tất cả người tham gia hoàn tất tụng Vãng Sanh.

Hoàn tất: 4/5 người (80%)
Còn lại: 1 người chưa tụng hết

[Tiếp Tục Dù Chưa Hoàn Tất]  [Chờ Thêm]
```

**If organizer confirms [Tiếp Tục Dù Chưa Hoàn Tất]:**
- Record incomplete status in audit
- Award partial merit to incomplete participant (80% of assigned)
- Log warning: `life-liberation.casualty.incomplete-recitation`

---

## Multiple Casualty Reports (Sequential)

If volunteers report multiple casualty batches during same event:

1. **First report:** 5 tôm chết → 15 biến required per person
2. **Second report (30 min later):** 2 cua chết → 7 biến additional per person
3. **UI behavior:**
   - First casualty counter appears
   - When participants complete first batch → second casualty alert appears
   - Counter updates: "Tổng cộng: 22 biến Vãng Sanh cần tụng"
   - Participant quotas stack additively

**Stacking example:**
```
Report 1: 5 tôm → 10 biến per person (5 participants)
Report 2: 2 cua → +4 biến per person
Total quota per person: 14 biến
```

---

## Errors

| Condition | Error code | HTTP | Message |
|---|---|---|---|
| Event not in progress | `event_not_in_progress` | 409 | "Sự kiện phóng sinh không trong trạng thái hoạt động. Không thể báo cáo sinh vật chết." |
| User not authorized | `unauthorized` | 401 | "Chỉ người tổ chức hoặc tình nguyện viên mới có thể báo cáo." |
| No online participants | `no_online_participants` | 400 | "Không có người tham gia nào online. Vui lòng chờ mọi người tập hợp." |
| No casualties reported | `no_casualties_reported` | 400 | "Vui lòng nhập ít nhất 1 sinh vật đã chết." |
| Verses exceed limit | `verses_exceeded_limit` | 400 | "Số biến yêu cầu vượt quá giới hạn (10,000). Vui lòng kiểm tra số lượng." |
| Invalid creature counts | `invalid_input` | 400 | "Số lượng sinh vật không hợp lệ. Vui lòng nhập số >= 0." |

---

## Audit

| Action | Trigger | Severity |
|---|---|---|
| `life-liberation.casualty.reported` | POST /api/events/life-liberation/report-casualty succeeds | WARN |
| `life-liberation.casualty.verses-calculated` | Verse calculation completed | INFO |
| `life-liberation.casualty.distributed-to-participants` | Emergency quota allocated to all participants | INFO |
| `life-liberation.casualty.participant-completed` | Single participant reaches 100% quota | INFO |
| `life-liberation.casualty.all-completed` | All participants complete assigned verses | INFO |
| `life-liberation.casualty.incomplete-recitation` | Event completed before all participants finish verses | WARN |
| `life-liberation.casualty.force-completed` | Organizer manually force-completed casualty recovery | WARN |

---

## Rate-limit requirement

- **Max 1 casualty report per 2 minutes** per event (prevents spam)
- Error: `casualty_report_cooldown` 429 if violated
- Message: "Vui lòng chờ 2 phút trước khi báo cáo sinh vật chết tiếp theo."

---

## Schema Notes for AI/codegen

```prisma
model CasualtyReport {
  id                        String   @id @default(cuid())
  eventId                   String
  event                     GroupLibeLiberationEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  reportedBy                String   // organizer or volunteer user ID
  reporter                  User     @relation(fields: [reportedBy], references: [id], onDelete: SetNull)

  // Casualty counts
  shrimpCount               Int      @default(0)
  crabCount                 Int      @default(0)
  fishCount                 Int      @default(0)

  // Calculated fields
  totalVersesRequired       Int      // (shrimpCount × 3) + (crabCount × 7) + (fishCount × 7)
  distributedPerPerson      Int      // totalVersesRequired / onlineParticipants
  onlineParticipants        Int      // snapshot count at time of report

  // Emergency quotas (one per participant)
  emergencyQuotas           EmergencyRecitationQuota[]

  // Timestamps
  reportedAt                DateTime @default(now())
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@index([eventId, reportedAt])
}

model EmergencyRecitationQuota {
  id                        String   @id @default(cuid())
  casualtyReportId          String
  casualtyReport            CasualtyReport @relation(fields: [casualtyReportId], references: [id], onDelete: Cascade)

  eventId                   String
  event                     GroupLiberationEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  userId                    String
  user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Recitation tracking
  assignedVerses            Int      // target number
  completedVerses           Int      @default(0)
  completionPercentage      Float    @default(0) // 0-100

  // Timestamps
  assignedAt                DateTime @default(now())
  completedAt               DateTime?
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@unique([casualtyReportId, userId])
  @@index([eventId, userId])
  @@index([completedAt])
}

// Optional: Casualty recovery service
service CasualtyRecoveryService {
  reportCasualty(eventId: string, dto: ReportCasualtyDto): Promise<Result<CasualtyReport>>
  calculateVerses(shrimpCount: number, crabCount: number, fishCount: number): number
  distributeQuotas(eventId: string, totalVerses: number): Promise<EmergencyRecitationQuota[]>
  broadcastCasualtyAlert(eventId: string, report: CasualtyReport): Promise<void>
  recordCompletedQuota(quotaId: string): Promise<void>
}
```

---

## Related

- [mass-life-liberation-state-machine.md](../events/USE_CASES/mass-life-liberation-state-machine.md) — Parent state machine for group events
- [Vãng Sanh Nghi Thức](../USE_CASE_PREDATORY_SPECIES_BAN.md) — Species restrictions that may affect casualty handling
- [Phóng Sinh Tiền Gửi Chuyển Động](./USE_CASE_PHONG_SINH_MONEY_TRANSFER_PROTOCOL.md) — Financial reconciliation if users donated for deceased creatures
