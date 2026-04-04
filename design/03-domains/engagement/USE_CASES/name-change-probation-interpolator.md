# Nội Suy Thời Gian Sát Hạn Đổi Tên 100 Ngày — Name Change Probation Interpolator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức Thăng Văn Đổi Tên & Ngôi Nhà Nhỏ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Sau khi Thăng Văn Đổi Tên được đốt (form status = BURNED), hệ thống tự động khởi động **100-day probation period**
và inject tên cũ vào tất cả Ngôi Nhà Nhỏ (Little House) được tạo trong thời kỳ này.

Phạm vi:
1. **Rule A (Timer Creation):** Khi `NameChangeForm.status → BURNED`, tạo record `NameChangeProbationPeriod` với hạn 100 ngày.
2. **Rule B (PDF Injection):** Khi user generate PDF cho Ngôi Nhà Nhỏ (Little House) trong probation window, hệ thống tự động inject tên cũ vào field "Kính Tặng" theo định dạng: `Người cần kinh của [Tên Mới] ([Tên Cũ])`.
3. **Rule C (Expiry Cleanup):** Cronjob hàng ngày kiểm tra hạn probation, loại bỏ tên cũ từ PDF sau 100 ngày.

---

## Owner module

`engagement` — NameChangeProbationInterpolator service, LittleHousePdfGenerator integration.

---

## Actors

- `member` — đốt Thăng Văn Đổi Tên, tạo Ngôi Nhà Nhỏ trong probation
- `system` — tạo timer, inject tên, cleanup cron

---

## Trigger

### Rule A: Timer Creation
**Trigger:** `POST /api/engagement/sacred-forms/mark-burned`

User marks Thăng Văn Đổi Tên form as `BURNED`.

### Rule B: PDF Injection
**Trigger:** `POST /api/engagement/little-house/generate-pdf`

User generates Little House PDF during 100-day probation window.

### Rule C: Expiry Cleanup
**Trigger:** Daily cronjob at 00:00 UTC

System checks for expired probation periods and cleans up old names.

---

## Preconditions

### Rule A
- `NameChangeForm` exists with `newName`, `oldName` (currentName at burn time), `userId`.
- Form status transitions from `PENDING_BURN` → `BURNED`.
- `burnedAt` timestamp is set.

### Rule B
- `NameChangeProbationPeriod` exists and `isActive = true`.
- `probationEndDate > TODAY`.
- Little House record belongs to same user who burned the form.

### Rule C
- One or more `NameChangeProbationPeriod` records with `probationEndDate <= TODAY` and `isActive = true`.

---

## Read set

### Rule A
- `NameChangeForm` (newName, oldName, burnedAt)
- Session + actor identity

### Rule B
- `NameChangeProbationPeriod` (probationEndDate, isActive)
- `LittleHouse` record (beneficiaryNameForDisplay)
- User identity (to confirm ownership)

### Rule C
- All `NameChangeProbationPeriod` records where `probationEndDate <= TODAY` and `isActive = true`
- Associated `LittleHouse` records for cleanup

---

## Write path

### Rule A: Create Probation Period (POST /api/engagement/sacred-forms/mark-burned)

**Input DTO:**
```typescript
interface MarkNameChangeFormBurnedDto {
  formId: string          // publicId of NameChangeForm
  burnedAt: DateTime      // ISO 8601, typically now()
}
```

**Steps:**

1. Load `NameChangeForm` by `formId`.
2. Verify `form.userId = actorUserId` (or admin).
3. Verify current `form.status ∈ ["PENDING_BURN"]` or allow transition from `READY_TO_BURN`.
4. Extract:
   - `newName` from `form.newName`
   - `oldName` from `form.currentName` (user's current name at burn time)
   - `startDate = burnedAt`
   - `probationEndDate = burnedAt + 100 days`
5. Create `NameChangeProbationPeriod` record:
   ```typescript
   {
     id: cuid(),
     userId,
     newName,
     oldName,
     startDate,
     probationEndDate,
     isActive: true,
     createdAt: now()
   }
   ```
6. Update `NameChangeForm.status = "BURNED"`.
7. Emit event: `engagement.name-change.burned-and-probation-started`.
8. Audit: `engagement.name-change.burned-and-probation-started`.
9. Return success response with probation end date.

**Error handling:**
- Form not found → `404 not_found`
- Form already burned → `400 name_change_already_burned`
- Unauthorized → `403 forbidden`

---

### Rule B: Auto-Inject Old Name in PDF (POST /api/engagement/little-house/generate-pdf)

**Input DTO:**
```typescript
interface GenerateLittleHousePdfDto {
  littleHouseId: string   // publicId of LittleHouse
}
```

**Steps:**

1. Load `LittleHouse` record by `littleHouseId`.
2. Verify `littleHouse.userId = actorUserId` (or admin).
3. Query `NameChangeProbationPeriod` where:
   ```
   userId = littleHouse.userId
   AND isActive = true
   AND probationEndDate > TODAY
   ```
4. If probation period found:
   - Extract `newName` and `oldName`.
   - Build beneficiary display text:
     ```
     Người cần kinh của [newName] ([oldName])
     ```
   - Set `littleHouse.beneficiaryNameForDisplay` to this value.
   - Mark in metadata: `{ probationPeriodId, probationActive: true, injectedAt: now() }`.
   - Audit: `engagement.little-house.probation-period-injection-active`.
5. If no active probation period:
   - Use default: `littleHouse.beneficiaryNameForDisplay = littleHouse.beneficiaryName` (new name only).
6. Generate PDF with the determined `beneficiaryNameForDisplay`.
7. Return PDF to user.

**Constraints during probation:**
- User cannot manually edit or remove `([oldName])` suffix in the UI during 100-day period.
- If user attempts to change beneficiary name → system shows warning:
  *"Bạn đang trong 100 ngày thì sát hạn đổi tên. Hệ thống sẽ tự động hiển thị cả tên cũ và tên mới trong Ngôi Nhà Nhỏ."*

**Error handling:**
- Little House not found → `404 not_found`
- User unauthorized → `403 forbidden`
- PDF generation failure → `500 internal_server_error`

---

### Rule C: Daily Cleanup Cronjob (00:00 UTC)

**Frequency:** Daily at 00:00 UTC

**Steps:**

1. Query all `NameChangeProbationPeriod` records where:
   ```
   isActive = true
   AND probationEndDate <= TODAY
   ```
2. For each expired probation period:
   a. Get associated `userId`.
   b. Query all `LittleHouse` records where:
      - `userId` matches probation.userId
      - `beneficiaryNameForDisplay` contains `([oldName])` suffix
      - `createdAt >= probationStartDate` (created during probation)
   c. For each Little House record:
      - Extract `newName` from `beneficiaryNameForDisplay` (before `(`)
      - Update `beneficiaryNameForDisplay = newName` (remove `([oldName])` suffix)
      - Clear probation metadata: `{ probationPeriodId: null, probationActive: false }`
      - Audit: `engagement.little-house.probation-period-cleanup-applied`
   d. Update `NameChangeProbationPeriod.isActive = false`.
   e. Audit: `engagement.name-change-probation.expired-and-cleaned`.
3. Log summary: total records cleaned, errors encountered.

**Error handling:**
- Database query failure → log error, continue to next batch.
- Partial cleanup → log warnings, mark probation as inactive anyway (to prevent retry loop).
- No records to clean → skip silently.

---

## DTO Contracts

### MarkNameChangeFormBurnedDto
```typescript
interface MarkNameChangeFormBurnedDto {
  formId: string          // publicId of NameChangeForm
  burnedAt: DateTime      // ISO 8601
}
```

### GenerateLittleHousePdfDto
```typescript
interface GenerateLittleHousePdfDto {
  littleHouseId: string   // publicId of LittleHouse
}
```

---

## Schema Updates

### Add NameChangeProbationPeriod Table
```prisma
model NameChangeProbationPeriod {
  id                String      @id @default(cuid())
  userId            String
  newName           String      // name after change
  oldName           String      // name before change
  startDate         DateTime    // burnedAt timestamp
  probationEndDate  DateTime    // startDate + 100 days
  isActive          Boolean     @default(true)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  user              User        @relation(fields: [userId], references: [id])
  littleHouses      LittleHouse[]

  @@index([userId, isActive])
  @@index([probationEndDate, isActive])
}
```

### Update LittleHouse Table
```prisma
model LittleHouse {
  // ... existing fields ...

  beneficiaryName             String              // user-provided new name
  beneficiaryNameForDisplay   String              // final display (with old name during probation)
  probationPeriodId           String?             // reference to NameChangeProbationPeriod if active
  probationActive             Boolean             @default(false)
  probationInjectedAt         DateTime?           // when probation suffix was injected

  probationPeriod             NameChangeProbationPeriod? @relation(fields: [probationPeriodId], references: [id])

  @@index([probationPeriodId])
  @@index([userId, probationActive])
}
```

---

## Audit Log Entries

| Action | Trigger | Actor | Details |
|---|---|---|---|
| `engagement.name-change.burned-and-probation-started` | Rule A: Form marked BURNED | actorUserId | formId, newName, oldName, probationEndDate |
| `engagement.little-house.probation-period-injection-active` | Rule B: PDF generated during probation | actorUserId | littleHouseId, probationPeriodId, displayName |
| `engagement.little-house.probation-period-cleanup-applied` | Rule C: Cronjob cleanup | system | littleHouseId, removedSuffix |
| `engagement.name-change-probation.expired-and-cleaned` | Rule C: Probation period expired | system | probationPeriodId, totalLittleHousesUpdated |

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| NameChangeForm not found | `not_found` | 404 | — |
| NameChangeForm already burned | `name_change_already_burned` | 400 | User must create new form |
| Unauthorized (form not owned by actor) | `forbidden` | 403 | — |
| LittleHouse not found | `not_found` | 404 | — |
| PDF generation failure | `internal_server_error` | 500 | Retry |
| Cronjob database error | — | — | Log error, skip record, continue |
| Invalid burnedAt timestamp | `invalid_input` | 400 | Provide valid ISO 8601 |
| User not authenticated | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- **100 days calculation:** Use `startDate + 100 days` (86,400,000 ms × 100). Account for leap seconds if using date libraries (dayjs, date-fns).
- **Beneficiary name format during probation:** Always render as `Người cần kinh của [newName] ([oldName])` in PDF. This is read-only for user during probation.
- **Cronjob safety:** Use `isActive` flag to prevent re-processing expired periods. Run idempotent cleanup (safe to run multiple times).
- **Timezone:** All date comparisons use UTC. User's local timezone is ignored for probation calculation.
- **No user errors for Rule B:** If probation is active, injection happens silently without user action. No modal or confirmation needed.
- **No user errors for Rule C:** Cronjob runs silently. All errors logged but don't block other system operations.
- **Edge case:** If user burns multiple name-change forms within 100 days → only latest active probation period applies. Query `WHERE isActive = true` returns single record per user.
- **PDF immutability during probation:** User cannot edit beneficiary name once PDF is generated during probation. If they try to change name → show advisory message, don't block.
- **Recovery:** If probation cleanup fails midway, next day's cron will retry remaining records. Use idempotent update pattern.
- **Audit trail:** Every name change and probation lifecycle event must be audited for compliance and dispute resolution.

---

## Integration Points

### Dependency: Calendar Domain
- Not needed for this logic (unlike name-change-burning-time-gater).

### Dependency: Identity Domain
- Receives event `engagement.name-change.burned-and-probation-started` to update user profile.
- Updates `User.displayName` to `newName` after probation cleanup.

### Dependency: PDF Generation Service
- Integrates with `LittleHousePdfGenerator` to inject `beneficiaryNameForDisplay` into "Kính Tặng" field.
- Must support dynamic text injection without user edit capability during probation.

---

## Outbox Event

- **Event type:** `engagement.name-change.burned-and-probation-started`
- **Subscriber:** `identity` (optional, for profile update notification)
- **Mode:** sync-inline (Phase 1), outbox-required (Phase 2+)
- **Payload:**
  ```json
  {
    "probationPeriodId": "...",
    "userId": "...",
    "newName": "...",
    "oldName": "...",
    "startDate": "2026-04-04T12:00:00Z",
    "probationEndDate": "2026-07-03T12:00:00Z"
  }
  ```

---

## Testing Strategy

### Unit Tests
- **Rule A:** Verify probation period created with correct 100-day calculation.
- **Rule A:** Verify probation period not created if form already burned.
- **Rule B:** Verify beneficiary name format when probation active.
- **Rule B:** Verify beneficiary name format when probation inactive.
- **Rule C:** Verify old names cleaned after probation expires.

### Integration Tests
- **Rule A → Rule B:** Burn form, generate PDF, verify old name in PDF.
- **Rule B → Rule C:** Generate PDF during probation, wait until expiry, verify cleanup.

### E2E Tests
- Full flow: Create name-change form → burn → generate Little House → PDF shows old+new name → wait 100 days → PDF shows new name only.

