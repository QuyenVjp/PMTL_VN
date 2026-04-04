# Cổng Giờ Đổi Tên — Name Change Time-Gater

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Phase 39 Logic 1 — Calendar authority gate
> **Cập nhật:** 2026-04-04

---

## Purpose

Đổi tên là quyết định linh động đòi hỏi thời khắc auspicious (lành lẽ). Hệ thống chỉ cho phép đổi tên vào **06:00 hoặc 08:00 sáng**, ưu tiên lịch âm nếu có lunar date, fallback sang lịch dương. Hard block 400 error nếu user cố gắng thay đổi ngoài khung giờ này.

---

## Owner module

`calendar` — NameChangeScheduleGate / CalendarAuthority
[xem DOMAIN_MAP.md](../../01-repo-constitution/DOMAIN_MAP.md)

---

## Actors

- `member` — request name change via POST /api/identity/name-change
- `system` — validate request against allowed hours (06:00 or 08:00)
- `calendar` — resolve lunar/gregorian time, provide next available window

---

## Trigger

Khi user gửi POST /api/identity/name-change với ChangeRequestDto (chứa targetTime preference: LUNAR_PREFERRED | GREGORIAN_FALLBACK)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Request name change | ✅ Validate current time against allowed hours |
| Current hour = 06 hoặc 08 | ✅ Allow change, proceed to name-change-temple-lodge-workflow |
| Current hour ≠ 06, 08 | ❌ Block with 400 + show next available window |
| User has LUNAR_PREFERRED | ✅ Use lunar date if available, fallback to gregorian |
| User has GREGORIAN_FALLBACK | ✅ Use gregorian date directly |
| Schedule change for future window | ✅ Store changeScheduledAt, queue for execution at gate time |

---

## Input Contract

```typescript
interface ChangeRequestDto {
  targetName: string                          // New name with diacritics
  targetTimePreference: 'LUNAR_PREFERRED' | 'GREGORIAN_FALLBACK'
  reason?: string                             // Optional context
}

// Response on success (current time is 06:00 or 08:00)
interface NameChangeAllowedResponse {
  status: 'allowed'
  executedAt: DateTime
  message: string                             // "Đổi tên thành công lúc 06:00"
}

// Response on block
interface NameChangeBlockedResponse {
  status: 'blocked'
  code: 'name_change_only_allowed_at_specific_times'
  nextAllowedWindow: {
    date: string                              // "2026-04-05"
    times: string[]                           // ["06:00", "08:00"]
    lunar?: {
      date: string                            // "Mùng 8 tháng 3"
      description: string
    }
  }
  message: string                             // "Kỳ tiếp theo có thể đổi tên: 2026-04-05 06:00"
}
```

---

## Write Path

```
POST /api/identity/name-change
1. Parse ChangeRequestDto
2. Resolve current time (now())
3. Check if current hour is 06 or 08
4. If yes:
   → Proceed to NameChangeExecutor (name-change-temple-lodge-workflow)
   → Log audit: calendar.name-change.executed-at-correct-time
   → Return NameChangeAllowedResponse with executedAt timestamp
5. If no:
   → Calculate next allowed window (06:00 or 08:00 tomorrow/day after)
   → Resolve lunar date if LUNAR_PREFERRED
   → Return 400 NameChangeBlockedResponse
   → Log audit: calendar.name-change.scheduled (with next window)
6. Optional future: Store changeScheduledAt in NameChangeRequest for async execution
```

---

## FE Behavior

```
✅ CỔNG GIỜ ĐỔI TÊN MỞ

Bạn đã gửi yêu cầu đổi tên vào lúc 06:00.
Thời khắc này là lành lẽ.

TIẾN TRÌNH:
────────────────────────────────────
Hệ thống đang xử lý đổi tên...
Đổi tên thành công: 2026-04-04 06:00 ✓

════════════════════════════════════
[Xem Chi Tiết] [Quay Lại]


❌ CỔNG GIỜ ĐỔI TÊN ĐÓNG

Bạn chỉ có thể đổi tên vào 06:00 hoặc 08:00 sáng.

KHUNG GIỜ CHO PHÉP:
────────────────────────────────────
Kỳ tiếp theo có thể đổi tên:
📅 2026-04-05 (Thứ Bảy)
🕐 06:00 hoặc 08:00

Lunar date: Mùng 8 tháng 3 Âm lịch
════════════════════════════════════

[Quay Lại] [Cập Nhật Lịch]
```

---

## Schema Notes

```prisma
model NameChangeRequest {
  id                String   @id @default(cuid())
  userId            String
  targetName        String   // New name with full diacritics (Vietnamese)
  targetTimePreference String // "LUNAR_PREFERRED" | "GREGORIAN_FALLBACK"

  // Gate enforcement
  changeScheduledAt DateTime?                // When user scheduled it (nullable if executed immediately)
  executedAt        DateTime?                // When change was actually executed (only if allowed at gate time)

  status            String   @default("PENDING")
  // PENDING | BLOCKED_TIME_GATE | SCHEDULED_FOR_LATER | EXECUTED | REJECTED

  blockReason       String?                  // "name_change_only_allowed_at_specific_times"
  nextAllowedAt     DateTime?                // Calculated next 06:00 or 08:00

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([executedAt])
}

// Migration note:
// CREATE TABLE "NameChangeRequest" (
//   id TEXT PRIMARY KEY,
//   userId TEXT NOT NULL,
//   targetName TEXT NOT NULL,
//   targetTimePreference TEXT NOT NULL,
//   changeScheduledAt TIMESTAMP,
//   executedAt TIMESTAMP,
//   status TEXT NOT NULL DEFAULT 'PENDING',
//   blockReason TEXT,
//   nextAllowedAt TIMESTAMP,
//   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
// );
// CREATE INDEX "NameChangeRequest_userId_idx" ON "NameChangeRequest"(userId);
// CREATE INDEX "NameChangeRequest_status_idx" ON "NameChangeRequest"(status);
// CREATE INDEX "NameChangeRequest_executedAt_idx" ON "NameChangeRequest"(executedAt);
```

---

## Audit

| Action | Trigger | Context |
|---|---|---|
| `calendar.name-change.scheduled` | User sends request outside 06:00/08:00 | nextAllowedAt, status = SCHEDULED_FOR_LATER |
| `calendar.name-change.executed-at-correct-time` | Request processed during 06:00 or 08:00 | executedAt, status = EXECUTED |
| `calendar.name-change.blocked` | Request made but time gate prevents execution | blockReason, nextAllowedAt |
| `calendar.name-change.lunar-resolved` | Lunar date preference fulfilled | targetTimePreference, lunar date string |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| Request outside 06:00/08:00 | `name_change_only_allowed_at_specific_times` | 400 | Kỳ tiếp theo có thể đổi tên: {nextWindow} |
| Invalid targetName (no diacritics or empty) | `invalid_target_name` | 400 | Tên mới phải hợp lệ và có dấu |
| Duplicate name (already exists) | `name_already_in_use` | 409 | Tên này đã được sử dụng |
| Missing timePreference enum | `invalid_time_preference` | 400 | targetTimePreference phải là LUNAR_PREFERRED hoặc GREGORIAN_FALLBACK |

---

## Notes for AI/codegen

- **Time gate is hard-enforced:** No exceptions, no override flags. If current hour != 06 and != 08, block immediately.
- **Lunar resolution:** Call CalendarService.resolveLunarDate(today, preferenceEnum) to get lunar date if available.
- **Next window calculation:** If blocked at 15:30, next window is tomorrow 06:00. If blocked at 07:00, next window is same day 08:00.
- **Audit granularity:** Log userId, targetName (redacted for PII), executedAt or scheduledAt, and preference enum.
- **Future async execution:** Phase 2 can implement background job (Agenda/BullMQ) to auto-execute scheduled changes at gate time. For Phase 39, UI handles re-submission at allowed window.
- **Vietnamese diacritics:** Validate that targetName contains proper Vietnamese diacritics (ă, â, ê, ô, ơ, ư, đ + tone marks). Reject pure ASCII names.
- **Related flow:** After gate passes, continue to name-change-temple-lodge-workflow.md for temple contact + merit assignment.

---

## Related

- [name-change-temple-lodge-workflow.md](./name-change-temple-lodge-workflow.md) — downstream temple lodge notification + merit tracking
- [detect-369-calamity-year.md](./detect-369-calamity-year.md) — lunar calendar helper utilities
- [DOMAIN_MAP.md](../../01-repo-constitution/DOMAIN_MAP.md) — calendar ownership boundaries
