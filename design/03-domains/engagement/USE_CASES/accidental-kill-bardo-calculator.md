# Tính Toán Cứu Độ Bồ Đề Khi Vô Tình Giết Vật — Accidental Kill Bardo Calculator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

When a practitioner accidentally kills an animal (mosquito, fish, shrimp, cow, etc.), the system immediately provides salvation calculation based on animal type, determining the number of recitations of "Chú Vãng Sanh" required. The system creates an urgent recitation task with the exact number of repetitions needed, guiding the practitioner toward immediate remediation.

## Owner module

`engagement` — Accidental harm mitigation, urgent recitation task creation, karmic calculation

## Actors

- **Practitioner (user):** Reports an accidental animal death
- **Engagement API:** Calculates required recitation count based on animal type
- **Task service:** Creates urgent recitation task with specific count
- **Frontend:** Displays calculator form and urgent task confirmation
- **Audit log:** Records accidental harm event and recitation obligation

## Trigger

1. Practitioner navigates to "Accidental Harm" or "Quick Rescue" section
2. User selects animal type from dropdown or search
3. System calculates required recitations (biến) of "Chú Vãng Sanh"
4. System creates urgent task: "Yêu cầu niệm [N] biến Chú Vãng Sanh ngay hôm nay"
5. Frontend displays task confirmation and countdown timer

## Business Rules

| Animal Type | Recitations Required (biến) | Task Priority | Status |
|-------------|----------------------------|---------------|--------|
| Mosquito | 1 | URGENT | ✅ |
| Ant | 1 | URGENT | ✅ |
| Shrimp | 3 | URGENT | ✅ |
| Crab | 7 | URGENT | ✅ |
| Fish | 7 | URGENT | ✅ |
| Mouse | 49 | CRITICAL | ✅ |
| Pig | 49 | CRITICAL | ✅ |
| Goat | 49 | CRITICAL | ✅ |
| Cow | 108 | CRITICAL | ✅ |
| Other (unspecified) | 7 (default) | URGENT | ⚠️ |
| Human | Not applicable (refer to elder) | ESCALATE | ⚠️ |

## Input Contract (TypeScript DTOs)

```typescript
// Frontend → API (Report Accidental Kill)
interface AccidentalKillRequest {
  practitionerId: string;
  animalType: AnimalType; // enum: MOSQUITO, ANT, SHRIMP, CRAB, FISH, MOUSE, PIG, GOAT, COW, OTHER
  description?: string; // Free-text user note about the incident
  reportedAt: ISO8601Timestamp;
}

type AnimalType =
  | 'MOSQUITO'
  | 'ANT'
  | 'SHRIMP'
  | 'CRAB'
  | 'FISH'
  | 'MOUSE'
  | 'PIG'
  | 'GOAT'
  | 'COW'
  | 'OTHER';

// Calculation Lookup
interface BardoRecitationLookup {
  [key in AnimalType]: {
    recitations: number;
    description_vi: string;
    description_en: string;
    taskPriority: 'URGENT' | 'CRITICAL';
  };
}

// API Response (Calculation Result)
interface AccidentalKillCalculationResponse {
  incidentId: string;
  animalType: AnimalType;
  recitationCount: number;
  taskId: string;
  taskDescription: string; // "Yêu cầu niệm [N] biến Chú Vãng Sanh ngay hôm nay"
  priority: 'URGENT' | 'CRITICAL';
  dueToday: boolean;
  message_vi: string; // Vietnamese guidance
  message_en: string; // English fallback
  createdAt: ISO8601Timestamp;
  dueAt: ISO8601Timestamp; // End of today
}

// Task Creation Payload (Internal)
interface UrgentBardoRecitationTask {
  practitionerId: string;
  incidentId: string;
  taskType: 'BARDO_RECITATION';
  recitationMantra: 'CHUVU_VANG_SANH'; // Enum: specific mantra ID
  recitationCount: number;
  priority: 'URGENT' | 'CRITICAL';
  dueAt: ISO8601Timestamp; // End of today
  description: string; // "Yêu cầu niệm [N] biến Chú Vãng Sanh ngay hôm nay"
  animalType: AnimalType;
}
```

## Write Path (pseudocode API)

```pseudocode
POST /engagement/accidental-harm/report-kill

1. Validate input:
   - animalType must be valid enum value
   - practitionerId must exist and be authenticated user
   - reportedAt must be recent (within last 24 hours acceptable for late reporting)

2. Look up recitation requirement:
   recitationCount = BARDO_LOOKUP[animalType].recitations
   taskPriority = BARDO_LOOKUP[animalType].taskPriority
   description_vi = BARDO_LOOKUP[animalType].description_vi

3. Create incident record:
   incident = AccidentalKillIncident.create({
     practitionerId: practitionerId,
     animalType: animalType,
     recitationRequired: recitationCount,
     userDescription: description,
     reportedAt: reportedAt,
     status: 'PENDING_RECITATION'
   })

4. Calculate task due time:
   now = getCurrentTimestamp()
   dueAt = endOfToday(now) // 23:59:59 today
   hoursRemaining = calculateHours(now, dueAt)

5. Create urgent recitation task:
   task = Task.create({
     type: 'BARDO_RECITATION',
     practitionerId: practitionerId,
     incidentId: incident.id,
     mantra: 'CHUVU_VANG_SANH',
     recitationCount: recitationCount,
     priority: taskPriority,
     description: 'Yêu cầu niệm ' + recitationCount + ' biến Chú Vãng Sanh ngay hôm nay',
     dueAt: dueAt,
     createdAt: now
   })

6. Log audit event:
   auditLog.create({
     event: 'ACCIDENTAL_KILL_REPORTED',
     practitionerId: practitionerId,
     animalType: animalType,
     incidentId: incident.id,
     taskId: task.id,
     recitationRequired: recitationCount,
     timestamp: now
   })

7. Return AccidentalKillCalculationResponse:
   return {
     incidentId: incident.id,
     animalType: animalType,
     recitationCount: recitationCount,
     taskId: task.id,
     taskDescription: task.description,
     priority: taskPriority,
     dueToday: true,
     message_vi: animalType + ': ' + recitationCount + ' biến Chú Vãng Sanh cần phải niệm ngay hôm nay!',
     message_en: 'Animal: ' + animalType + '. Recitations required: ' + recitationCount,
     createdAt: now,
     dueAt: dueAt
   }

8. (Optional) Send push notification:
   - High priority alert to practitioner
   - Include recitation count and deadline
   - Deep link to task screen
```

## FE Behavior (ASCII wireframe)

```
┌───────────────────────────────────────────────┐
│ Báo Cáo Vô Tình Giết Vật                      │
├───────────────────────────────────────────────┤
│                                               │
│ Loại vật bị giết:                             │
│ [Dropdown: Chọn loại vật]                     │
│   ○ Muỗi/Kiến (Mosquito/Ant)                 │
│   ○ Tôm (Shrimp)                             │
│   ○ Cua/Cá (Crab/Fish)                       │
│   ○ Chuột/Lợn/Dê (Mouse/Pig/Goat)            │
│   ○ Bò (Cow)                                 │
│   ○ Khác (Other)                             │
│                                               │
│ Ghi chú (tùy chọn):                          │
│ [Text area]                                   │
│                                               │
│ [Huỷ]  [Tiếp Tục]                            │
│                                               │
└───────────────────────────────────────────────┘

[After selection: FISH]

┌───────────────────────────────────────────────┐
│ ⚠️  CẦN CỨU ĐỘ NGAY                            │
├───────────────────────────────────────────────┤
│                                               │
│ Loại vật: Cá (Fish)                           │
│ Số biến niệm: 7 biến Chú Vãng Sanh            │
│                                               │
│ Yêu cầu niệm 7 biến Chú Vãng Sanh             │
│ ngay hôm nay!                                 │
│                                               │
│ ⏱️  Thời hạn: Trước 23:59:59 ngày hôm nay     │
│                                               │
│ Nhiệm vụ cấp độ: URGENT                       │
│                                               │
│ [Huỷ]  [Tạo Nhiệm Vụ]                        │
│                                               │
└───────────────────────────────────────────────┘

[After task creation]

┌───────────────────────────────────────────────┐
│ ✓ Nhiệm Vụ Cứu Độ Đã Tạo                      │
├───────────────────────────────────────────────┤
│                                               │
│ ID Nhiệm Vụ: task_8f2c6e4a1b                 │
│ Loại: Niệm Bồ Đề - Cứu Độ Vô Tình             │
│ Số biến: 7 biến                               │
│ Hạn: Hôm nay 23:59:59                        │
│                                               │
│ Yêu cầu niệm 7 biến Chú Vãng Sanh             │
│ ngay hôm nay.                                 │
│                                               │
│ [Bắt Đầu Niệm]  [Xem Danh Sách Nhiệm Vụ]     │
│                                               │
└───────────────────────────────────────────────┘
```

## Schema Notes (Prisma snippet)

```prisma
model AccidentalKillIncident {
  id                    String   @id @default(cuid())
  practitionerId        String
  practitioner          User     @relation(fields: [practitionerId], references: [id], onDelete: Cascade)

  animalType            String   @db.Enum('MOSQUITO', 'ANT', 'SHRIMP', 'CRAB', 'FISH', 'MOUSE', 'PIG', 'GOAT', 'COW', 'OTHER')
  recitationRequired    Int      // Number of biến needed
  description           String?  // User's optional note about incident

  status                String   @db.Enum('PENDING_RECITATION', 'RECITING', 'COMPLETED', 'ABANDONED')

  relatedTaskId         String?
  relatedTask           Task?    @relation(fields: [relatedTaskId], references: [id])

  reportedAt            DateTime
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([practitionerId])
  @@index([createdAt])
  @@index([status])
}

model Task {
  id                    String   @id @default(cuid())
  practitionerId        String
  practitioner          User     @relation(fields: [practitionerId], references: [id], onDelete: Cascade)

  type                  String   @db.Enum('BARDO_RECITATION', 'LITTLE_HOUSE_BURN', 'GENERAL_RECITATION')
  mantra                String?  // e.g., 'CHUVU_VANG_SANH'
  recitationCount       Int?     // Number of recitations (biến) required
  description           String   // Human-readable task description
  priority              String   @db.Enum('LOW', 'NORMAL', 'URGENT', 'CRITICAL')

  status                String   @db.Enum('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')

  dueAt                 DateTime
  completedAt           DateTime?

  incidentId            String?
  incident              AccidentalKillIncident? @relation(fields: [incidentId], references: [id])

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([practitionerId])
  @@index([dueAt])
  @@index([priority])
  @@index([status])
}

model User {
  // ... existing fields ...
  accidentalKillIncidents AccidentalKillIncident[]
  tasks                   Task[]
  // ... other relations ...
}
```

## Audit

| Event | Logged Data | Sensitivity |
|------|-------------|-------------|
| `ACCIDENTAL_KILL_REPORTED` | incidentId, animalType, practitionerId, recitationRequired, reportedAt | Internal |
| `BARDO_TASK_CREATED` | incidentId, taskId, recitationCount, priority, dueAt | Internal |
| `BARDO_RECITATION_STARTED` | taskId, incidentId, practitionerId | Internal |
| `BARDO_RECITATION_COMPLETED` | taskId, incidentId, recitationCount, completedAt | Internal |
| `BARDO_RECITATION_ABANDONED` | taskId, incidentId, practitionerId, abandonReason | Internal |

## Errors

```typescript
// 400 Bad Request
{
  code: 'INVALID_ANIMAL_TYPE',
  message: 'Animal type must be one of: MOSQUITO, ANT, SHRIMP, CRAB, FISH, MOUSE, PIG, GOAT, COW, OTHER'
}

// 400 Bad Request
{
  code: 'INVALID_REPORTED_TIME',
  message: 'Accidental kill report must be within 24 hours of incident'
}

// 404 Not Found
{
  code: 'PRACTITIONER_NOT_FOUND',
  message: 'Practitioner not found or not authenticated'
}

// 409 Conflict
{
  code: 'DUPLICATE_INCIDENT',
  message: 'An identical incident was already reported in the last 10 minutes. Please check your pending tasks.'
}

// 422 Unprocessable Entity
{
  code: 'HUMAN_DEATH_ESCALATION',
  message: 'Human death or harm requires direct guidance from a spiritual elder. Please contact support.',
  escalationRequired: true
}

// 500 Internal Server Error
{
  code: 'TASK_CREATION_FAILED',
  message: 'Unable to create recitation task at this time. Please try again.'
}
```

## Notes for AI/codegen

- **Lookup table:** Implement BARDO_LOOKUP as a static constant or database-backed config for easy updates. This avoids hardcoding in business logic.
- **Task priority mapping:** URGENT for mosquito/ant/small animals; CRITICAL for larger animals (mouse and above). Consider using CRITICAL for cow to trigger visual/audio alert.
- **Same-day deadline:** All tasks created with `dueAt = endOfToday()`. Consider offering extension/postponement to next day with elder approval (future).
- **Duplicate prevention:** Check last 10 minutes for identical (practitionerId + animalType) reports to prevent accidental double-reporting.
- **Notification urgency:** Send immediate push notification and in-app alert. Consider SMS for CRITICAL priority (future feature).
- **Recitation tracking:** Link Task to AccidentalKillIncident so completion updates incident status. Track actual recitation count if mantra-tracking module exists.
- **Escalation:** If animalType == 'HUMAN' or description contains keywords (death, kill, serious harm), escalate to elder support queue instead of auto-creating task.
- **Localization:** All Vietnamese text must use full diacritics. Error messages and task descriptions must be culturally appropriate and precise.

## Related

- `little-house-recitation-tracking.md` — General recitation task framework
- `mantra-recitation-engine.md` — Core recitation counting and validation
- `spiritual-elder-escalation.md` — Escalation path for critical incidents
- `task-management-system.md` — General task creation and lifecycle
