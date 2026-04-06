# Đài Phát Thanh Hoa Ngữ Phương Đông Úc Châu — Radio Station Media Coverage Partnership
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Truyền thông Phật Pháp qua Đài Phát Thanh
> **Trạng thái:** Verified source — partnership agreement with 2OR Sydney
> **Cập nhật:** 2026-04-05

---

## Purpose

Establish broadcast partnership with Đài Phát Thanh Hoa Ngữ Phương Đông Úc Châu (2OR) — a 24-hour Mandarin-language radio station in Sydney. This partnership enables:
- Dissemination of Buddhist Dharma teachings to Mandarin-speaking audiences in Australia and internationally
- Regular broadcast of official Dharma talks, testimonials, and spiritual practice guidance
- Cross-cultural bridge building between the Dharma center and Chinese-speaking communities across Australia, China, and diaspora
- Media coverage of center activities, spiritual events, and testimonial content

---

## Owner module

`contact` — MediaPartnershipManager
[See CONTRACTS.md](../CONTRACTS.md)

---

## Thông Tin Đài Phát Thanh (Radio Station Profile)

### Basic Facts

| Field | Value |
|---|---|
| **Tên Đài** | Đài Phát Thanh Hoa Ngữ Phương Đông Úc Châu (2OR) |
| **English Name** | Chinese Language Radio Station Eastern Australia (2OR) |
| **Location** | Sydney, Australia |
| **Format** | 24-hour Mandarin-language broadcasting |
| **Founding Director** | Lư Quân Hoằng (Lu Jun Hong) — expatriate community leader |
| **Experience** | ~20 years of broadcasting/radio management |
| **Reputation** | High credibility in mainstream Australian society + Chinese diaspora; recognized by Australian PM Gillard, Chinese Consulate-General in Sydney |
| **Staff** | ~20 radio hosts, including veteran broadcasters with decades of experience in Australia |
| **Primary Language** | Mandarin (Phổ Thông) |

### Mission & Purpose

**Core Objective:** Build a platform for China-Australia cultural and economic exchange, promoting:
- Economic, commercial, and cultural cooperation
- Political and diplomatic dialogue
- Educational advancement between China and Australia
- Comprehensive bilateral relations development
- Acting as a media bridge translating timely information

**Dharma-specific Role:**
- Broadcast official Buddhist teachings and Dharma talks
- Share spiritual practice guidance and testimonial content
- Promote Buddhist culture and traditional Chinese wisdom
- Serve as trusted spiritual voice and counselor to Mandarin-speaking practitioners and seekers

---

## Actors

| Role | Responsibility |
|---|---|
| **Broadcast Partner** | Đài Phát Thanh Hoa Ngữ (2OR) — manages technical transmission, scheduling, airtime |
| **Dharma Content Owner** | Official Dharma center — provides talks, testimonials, spiritual guidance content |
| **Media Liaison** | Contact module — coordinates scheduling, content approval, broadcast calendar |
| **Audience** | Mandarin-speaking listeners in Australia, China, and global diaspora |

---

## Trigger

Partnership activation occurs when:
1. Official Dharma center decides to broadcast teachings via radio
2. Testimonial content is prepared for public broadcast
3. Scheduled events require media coverage or public awareness
4. Spiritual guidance or Q&A sessions are designated for broadcast audience
5. Seasonal or holiday Dharma events are announced to broader community

---

## Business Rules

### Rule BR1: Content Approval & Authenticity

**Statement:** All broadcast content must originate from official Dharma center authority. No unauthorized or fabricated teachings may be transmitted.

**Why:** Integrity of Buddhist Dharma teachings is paramount. Radio broadcasts reach large audiences; content must be verified as authentic spiritual guidance, not speculation or folk interpretation.

**Enforcement:**
- Before scheduling: Media liaison submits content outline to Dharma authority for approval
- Content must be labeled as "Official Dharma Center Broadcast" (chính thức Pháp Môn Tâm Linh)
- No modifications to talks or testimonials without explicit permission
- Archive: Store broadcast transcript + approval audit trail in system

**Validation Fields:**
```
contentSource: enum ['official_dharma_talk', 'approved_testimonial', 'event_coverage', 'spiritual_guidance', 'qa_session']
approvedBy: string (name of approving authority)
approvalTimestamp: DateTime
archiveTranscript: boolean (must be true for all broadcasts)
```

---

### Rule BR2: Broadcast Scheduling in Sydney Timezone

**Statement:** All broadcast times must be published and managed in **Sydney timezone (AEDT/AEST)** for coordination with 2OR operations. Conversion to listener local times is handled by the radio station and audience-side systems.

**Why:** 2OR operates from Sydney; consistent timezone reference prevents scheduling errors and enables proper secretariat routing (see `sydney-dst-radio-router.md`).

**Enforcement:**
- Broadcast schedule table lists all times in `Australia/Sydney` timezone
- Schedule must account for DST transitions (Oct-Apr: AEDT UTC+11, Apr-Oct: AEST UTC+10)
- System must use `date-fns-tz` library for timezone calculations; never hardcode offsets
- Publish schedule at least 2 weeks in advance for audience promotional visibility

**Validation Fields:**
```
broadcastTimeUtc: DateTime (ISO 8601 with Sydney TZ offset)
sydneyLocalTime: DateTime (computed for audit trail)
dstPeriod: enum ['AEDT', 'AEST']
systemCalculationMethod: 'date-fns-tz' (never hardcoded offset)
```

---

### Rule BR3: Content Type Categories

**Statement:** Broadcast content falls into 5 categories, each with distinct approval and formatting requirements.

**Categories:**

| Type | Format | Approval | Frequency | Notes |
|---|---|---|---|---|
| **Official Dharma Talk** | Recorded or live talk by authorized teacher | Dharma authority + media liaison | Varies (weekly/monthly planned) | May be extracted from recorded sessions; requires topic approval |
| **Approved Testimonial** | Personal spiritual story, practice results | Testimonial author + Dharma authority | Varies (promotional calendar) | Submit via `submit-testimonial.md` process first; radio broadcast is secondary use |
| **Event Coverage** | Live or recorded coverage of center event | Event organizer + Dharma authority | Per-event basis | May include prayers, meditation, Q&A excerpts |
| **Spiritual Guidance Q&A** | Answers to practitioner questions on Dharma | Teacher + Dharma authority | Varies (weekly/monthly planned) | Can combine multiple audience questions in single segment |
| **Practice Encouragement Broadcast** | Motivational content, practice tips, merit accumulation guidance | Dharma authority | Varies (weekly/monthly planned) | Educational rather than strictly doctrinal |

---

### Rule BR4: Audience Reach & Language Considerations

**Statement:** Broadcasts target Mandarin-speaking audiences (native speakers + learners). Content phrasing must be accessible but maintain spiritual authenticity.

**Why:** 2OR reaches listeners with varying Mandarin proficiency across Australia, China, and diaspora. Complex doctrinal content requires clear phrasing without oversimplification.

**Enforcement:**
- Content reviewers must verify Mandarin clarity and cultural appropriateness
- Terminology: Use `traditional characters (繁體字)` in broadcast subtitles/transcripts, `simplified characters (简体字)` in promotional materials targeting mainland audiences
- No colloquialisms that obscure spiritual meaning
- Provide glossary of key Buddhist terms (English ↔ Mandarin) for audience reference materials

**Validation Fields:**
```
targetAudience: enum ['mandarin_native', 'mandarin_learners', 'mixed']
languageReviewedBy: string (name of language/cultural advisor)
scriptLanguage: enum ['traditional', 'simplified', 'both']
glossaryIncluded: boolean
```

---

### Rule BR5: Broadcast Archive & Transcript Requirement

**Statement:** Every broadcast must be archived with full transcript (Mandarin + English translation). Archive is retained for 5 years minimum; transcripts are accessible to audience for personal practice reference.

**Why:** Preserves authentic record of teachings transmitted. Allows audience to review content, verify correctness, and deepen understanding through repeated study. Supports dispute resolution if content authenticity is later questioned.

**Enforcement:**
- Within 48 hours of broadcast: Submit audio file + Mandarin transcript + English summary to `contact.radio_archive` system
- Transcript must be verbatim (not paraphrased); any translation notes must be clearly marked
- Retention: Archive stored for 5 years; after expiry, transfer to long-term historical storage or destroy per data policy
- Access control: Public transcripts available to all practitioners; sensitive content flagged with audience disclosure warning

**Validation Fields:**
```
audioFileUrl: string (S3 or archive storage)
transcriptMandarin: text (verbatim)
transcriptEnglish: text (faithful translation, marked with [translator note] if needed)
createdAt: DateTime
expiresAt: DateTime (5 years from broadcast)
accessLevel: enum ['public', 'practitioners_only', 'restricted']
```

---

### Rule BR6: Cross-Module Notification & Media Liaison Workflow

**Statement:** Broadcast schedule changes, new content additions, or cancellations must trigger notification to:
1. Radio station (2OR) — 48 hours advance notice minimum
2. Dharma center secretariat — for internal coordination
3. Web platform `community` module — for public announcement of upcoming broadcasts
4. Archive system — for transcript/schedule updates

**Why:** Ensures all stakeholders (station, practitioners, public audience) have consistent information and can plan appropriately.

**Enforcement:**
- Schedule API endpoint: `POST /api/contact/radio-broadcast/schedule-change`
- Notification service must send:
  - Email to radio station liaison (2OR contact)
  - Slack notification to secretariat
  - Event record to `community` module for broadcast announcement
  - Audit log entry with change reason
- If cancellation: notify both radio station AND audience (via website alert)

**Validation Fields:**
```
changeType: enum ['new_broadcast_scheduled', 'content_changed', 'cancelled', 'rescheduled']
notificationsSent: {
  radioStation: boolean,
  secretariat: boolean,
  communityModule: boolean,
  auditLog: boolean
}
notificationTimestamp: DateTime
advanceNoticeHours: integer (minimum 48)
```

---

## Input Contract

**POST /api/contact/radio-broadcast/schedule**

Request body (BroadcastScheduleDto):

```typescript
{
  // Content metadata
  contentType: 'official_dharma_talk' | 'approved_testimonial' | 'event_coverage' | 'spiritual_guidance_qa' | 'practice_encouragement',
  contentTitle: string (max 100 chars),
  contentDescription: string (max 500 chars),
  contentSourceId?: UUID (reference to original resource: testimonial, event, talk recording),

  // Approval
  approvedBy: string (name of approving authority),
  approvalNotes?: string,
  approvalTimestamp: DateTime,

  // Scheduling
  broadcastTimeUtc: DateTime (ISO 8601 with Sydney TZ offset, e.g., "2026-04-20T17:30:00+11:00"),
  durationMinutes: integer (15, 30, 45, 60 typical),

  // Content details
  languagePrimary: 'mandarin',
  scriptLanguage: 'traditional' | 'simplified' | 'both',
  mandarin transcript: string,
  englishSummary: string,

  // Archive
  audioFile?: File (multipart upload, if available at scheduling time),
  archiveUrl?: string (if pre-recorded),

  // Cross-module
  notifyRadioStation: boolean (default true),
  notifySecretariat: boolean (default true),
  notifyCommunityModule: boolean (default true; triggers public broadcast announcement),
}
```

Response (201 Created):

```typescript
{
  scheduleId: UUID,
  contentType: string,
  contentTitle: string,
  broadcastTimeSydney: DateTime,
  sydneyLocalTimeDisplay: string (e.g., "April 20, 2026 — 5:30 PM Sydney time"),
  status: 'scheduled' | 'approved_pending_archive' | 'archived',
  approvedBy: string,
  notificationsStatus: {
    radioStation: 'sent' | 'pending',
    secretariat: 'sent' | 'pending',
    communityModule: 'sent' | 'pending'
  },
  transcriptUrl?: string (if archived),
  createdAt: DateTime,
}
```

---

## FE Behavior

### Screen: Broadcast Schedule Management (Admin)

Admin can:
1. **View upcoming broadcasts** — calendar view showing all scheduled broadcasts in Sydney time
2. **Add new broadcast** — form to submit new content for approval
3. **Edit broadcast details** — change title, description, schedule (before broadcast time)
4. **Mark as archived** — upload transcript + audio after broadcast completes
5. **Cancel broadcast** — triggers notification to station + audience (48h notice rule)

```
┌─────────────────────────────────────────────────────────┐
│ RADIO STATION BROADCAST SCHEDULE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📻 2OR (Sydney)  [Timeline View] [Calendar View]       │
│                                                         │
│ UPCOMING BROADCASTS                                     │
│ ┌────────────────────────────────────────────────────┐  │
│ │ April 20, 2026 — 17:30 Sydney (AEDT UTC+11)        │  │
│ │ "Daily Compassion Practice: The Heart Sutra"       │  │
│ │ 45 minutes | Official Dharma Talk                  │  │
│ │ Approved by: [Dharma Authority Name]               │  │
│ │                                                    │  │
│ │ [Edit] [Archive] [Cancel]                          │  │
│ │                                                    │  │
│ │ Status: ✅ Scheduled                               │  │
│ │ Notifications: 🟢 Sent (Station, Secretariat, Web) │  │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ [+ Add New Broadcast]  [Archive Broadcasts]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Screen: Broadcast Transcript & Archive (Public)

Audience can:
1. **View archived broadcasts** — searchable list of past broadcasts
2. **Read transcript** — full Mandarin transcript + English summary
3. **Listen to audio** — embedded player for audio playback
4. **Share transcript** — download or copy for personal practice

```
┌─────────────────────────────────────────────────────────┐
│ ARCHIVED BROADCASTS — 2OR DHARMA SERIES                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Search: [________________] [Filter by Content Type ▼]  │
│                                                         │
│ April 15, 2026  ─────────────────────────────────────  │
│ "Accumulating Merit Through Daily Practice"            │
│ 30 minutes | Practice Encouragement                    │
│ 🎙️ [Play Audio]  📖 [Read Transcript]  💾 [Download]   │
│                                                         │
│ Mandarin Transcript (繁體字)                            │
│ ────────────────────────────────────────────────────── │
│ 積功累德就是平常日子裡面...                             │
│ [+10 more paragraphs]                                  │
│                                                         │
│ English Summary                                        │
│ ────────────────────────────────────────────────────── │
│ In this broadcast, the teacher explains how to        │
│ accumulate merit through consistent daily practice... │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Schema Notes

### BroadcastSchedule (Prisma)

```prisma
model BroadcastSchedule {
  id                    String    @id @default(cuid())

  // Content
  contentType           String    // 'official_dharma_talk', 'approved_testimonial', etc.
  contentTitle          String    @db.VarChar(100)
  contentDescription    String    @db.Text
  contentSourceId       String?   // Reference to testimonial, event, or talk recording

  // Approval
  approvedBy            String    // Name or ID of approving authority
  approvalTimestamp     DateTime
  approvalNotes         String?   @db.Text

  // Scheduling
  broadcastTimeSydney   DateTime  // UTC-aware datetime with Sydney timezone
  durationMinutes       Int       // 15, 30, 45, 60, etc.
  sydneyDisplayTime     String    // Computed display string for UI

  // Content details
  scriptLanguage        String    // 'traditional', 'simplified', 'both'
  mandarin              String    @db.Text
  englishSummary        String    @db.Text

  // Archive
  audioUrl              String?   // S3 or archive storage URL
  transcriptUrl         String?   // Archive storage URL
  archivedAt            DateTime?

  // Status
  status                String    // 'scheduled', 'approved_pending_archive', 'archived', 'cancelled'
  cancelledAt           DateTime?
  cancelReason          String?   @db.Text

  // Cross-module
  communityPostId       String?   // Reference to public announcement post (if posted to web)

  // Audit
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([broadcastTimeSydney])
  @@index([status])
  @@index([contentType])
}

model BroadcastNotificationLog {
  id                    String    @id @default(cuid())
  scheduleId            String
  schedule              BroadcastSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  notificationType      String    // 'radio_station', 'secretariat', 'community_module'
  sentAt                DateTime
  success               Boolean
  details               String?   @db.Text (error message if failed)

  @@index([scheduleId])
}
```

---

## Audit

All broadcast scheduling events must be logged:

| Event | Trigger | Logged Fields |
|---|---|---|
| `broadcast.scheduled` | New broadcast scheduled | scheduleId, contentType, broadcastTimeSydney, approvedBy |
| `broadcast.approval_received` | Content approved by authority | scheduleId, approvalTimestamp, approverName |
| `broadcast.notification_sent` | Notification delivered to radio station/secretariat | scheduleId, notificationType, recipient |
| `broadcast.notification_failed` | Notification delivery failed | scheduleId, notificationType, errorReason |
| `broadcast.archived` | Broadcast archived with transcript + audio | scheduleId, archiveUrl, transcriptUrl |
| `broadcast.cancelled` | Broadcast cancelled | scheduleId, cancelReason, cancellationTimestamp |

**Audit Log Schema:**

```typescript
interface BroadcastAuditEntry {
  timestamp: DateTime;
  event: string;
  scheduleId: UUID;
  broadcastTimeSydney?: DateTime;
  contentType?: string;
  approvedBy?: string;
  notificationType?: string; // if notification event
  recipient?: string; // if notification event
  archiveUrl?: string; // if archived event
  cancelReason?: string; // if cancelled event
  context?: Record<string, any>;
}
```

---

## Errors

### broadcast_approval_missing (400)

**Trigger:** User attempts to schedule broadcast without approval from Dharma authority.

**Response:**
```json
{
  "statusCode": 400,
  "message": "Broadcast content must be approved by Dharma authority before scheduling",
  "error": "broadcast_approval_missing",
  "details": {
    "scheduleId": "broadcast_123",
    "contentType": "official_dharma_talk",
    "approvalStatus": "pending"
  }
}
```

**Action:** Prompt user to request approval. Return contact information for Dharma authority.

---

### schedule_conflict_with_station (400)

**Trigger:** Requested broadcast time conflicts with 2OR existing programming or technical constraints.

**Response:**
```json
{
  "statusCode": 400,
  "message": "Requested broadcast time conflicts with radio station schedule. Please choose alternate time.",
  "error": "schedule_conflict_with_station",
  "details": {
    "requestedTime": "2026-04-20T17:30:00+11:00",
    "conflictingBroadcast": "Evening News (17:15-18:00)",
    "alternateSlots": ["2026-04-20T18:30:00+11:00", "2026-04-21T17:30:00+11:00"]
  }
}
```

**Action:** Suggest alternate times; require confirmation before rescheduling.

---

### transcript_not_archived_48h (400)

**Trigger:** Broadcast completed >48 hours ago but transcript not yet submitted.

**Response:**
```json
{
  "statusCode": 400,
  "message": "Broadcast transcript must be archived within 48 hours of transmission",
  "error": "transcript_not_archived_48h",
  "details": {
    "scheduleId": "broadcast_123",
    "broadcastTime": "2026-04-15T17:30:00+11:00",
    "currentTime": "2026-04-17T10:00:00+11:00",
    "hoursOverdue": 16.5
  }
}
```

**Action:** Send reminder to content owner; escalate to Media Liaison if still pending after 72 hours.

---

### timezone_conversion_failed (500)

**Trigger:** System fails to convert Sydney time to display timezone.

**Response:**
```json
{
  "statusCode": 500,
  "message": "Timezone conversion failed",
  "error": "timezone_conversion_failed",
  "details": {
    "broadcastTimeSydney": "2026-04-20T17:30:00+11:00",
    "conversionError": "Invalid timezone identifier"
  }
}
```

**Action:** Log full error context. Alert ops. Do NOT expose error details to frontend. Display generic message: "Unable to display broadcast time. Please contact administrator."

---

## Notes for AI/Codegen

1. **Timezone Library Requirement:** Always use `date-fns-tz` for Sydney timezone calculations. Never hardcode UTC offsets. DST transitions (Oct & Apr) are handled automatically by the library.

2. **Notification Choreography:** When scheduling a new broadcast, trigger notifications in this order:
   - Radio station (via email or API call to 2OR management)
   - Dharma center secretariat (internal alert)
   - Community module (public announcement post, if flag is true)
   - Ensure all 3 are logged before marking schedule as "scheduled"

3. **Archive Requirement:** Every broadcast MUST be archived with transcript. This is non-negotiable per Rule BR5. Build archive workflow into post-broadcast process (auto-reminder at 24h, escalation at 48h).

4. **Transcript Storage:** Store transcripts in append-only format. No deletion or modification after archival. If error is discovered, create amendment record with timestamp and reason.

5. **Cross-Module Integration:**
   - Reference `community/USE_CASES/submit-testimonial.md` for testimonial broadcast pre-qualification
   - Reference `sydney-dst-radio-router.md` for timezone conversion patterns
   - Reference `digital-broadcasting-schedule.md` for broadcast window scheduling logic

6. **Testing Strategy:**
   - Unit tests: Timezone conversion (Sydney ↔ audience timezones), validation logic
   - Integration tests: End-to-end broadcast scheduling, notification delivery, archive workflow
   - E2E: Admin schedules broadcast → notifications sent → archive submitted → public transcript visible

---

## Related

- [sydney-dst-radio-router.md](./sydney-dst-radio-router.md) — Timezone conversion and call routing (technical infrastructure for broadcast system)
- [USE_CASE_DIGITAL_BROADCASTING_SCHEDULE.md](./USE_CASE_DIGITAL_BROADCASTING_SCHEDULE.md) — Broadcast schedule windows (scheduled programming times)
- [/wisdom-qa/USE_CASES/submit-testimonial.md](../../wisdom-qa/USE_CASES/submit-testimonial.md) — Testimonial submission (pre-qualification for potential radio broadcast)
- [/community/USE_CASES/submit-community-post.md](../../community/USE_CASES/submit-community-post.md) — Community post creation (cross-module notification target for broadcast announcements)
- [manage-volunteer-directory.md](./manage-volunteer-directory.md) — Secretariat staff directory (notification recipients)
