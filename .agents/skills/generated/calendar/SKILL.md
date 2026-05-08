---
name: calendar
description: "Skill for the Calendar area of PMTL_VN. 59 symbols across 6 files."
---

# Calendar

59 symbols | 6 files | Cohesion: 74%

## When to Use

- Working with code in `apps/`
- Understanding how mapEventToAdminItem, useDeleteEvent, usePublishEvent work
- Modifying calendar-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/features/calendar/index.tsx` | useCalendar, statusBadgeClass, statusLabel, eventTypeLabel, CalendarRowActions (+14) |
| `apps/api/src/modules/calendar/calendar.service.ts` | adminUpdateEvent, adminDeleteEvent, adminPublishEvent, adminCreateAgendaItem, adminReorderAgendaItems (+8) |
| `apps/api/src/modules/calendar/calendar.repository.ts` | findAdminByPublicId, updateEvent, deleteEvent, publishEvent, reorderAgendaItems (+7) |
| `apps/api/src/modules/calendar/calendar.controller.ts` | updateEvent, deleteEvent, publishEvent, createAgendaItem, reorderAgendaItems (+7) |
| `apps/admin/src/features/calendar/mutations.ts` | useDeleteEvent, usePublishEvent |
| `apps/api/src/modules/calendar/calendar.mapper.ts` | mapEventToAdminItem |

## Entry Points

Start here when exploring this area:

- **`mapEventToAdminItem`** (Function) — `apps/api/src/modules/calendar/calendar.mapper.ts:10`
- **`useDeleteEvent`** (Function) — `apps/admin/src/features/calendar/mutations.ts:57`
- **`usePublishEvent`** (Function) — `apps/admin/src/features/calendar/mutations.ts:71`
- **`adminUpdateEvent`** (Method) — `apps/api/src/modules/calendar/calendar.service.ts:107`
- **`adminDeleteEvent`** (Method) — `apps/api/src/modules/calendar/calendar.service.ts:125`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `mapEventToAdminItem` | Function | `apps/api/src/modules/calendar/calendar.mapper.ts` | 10 |
| `useDeleteEvent` | Function | `apps/admin/src/features/calendar/mutations.ts` | 57 |
| `usePublishEvent` | Function | `apps/admin/src/features/calendar/mutations.ts` | 71 |
| `adminUpdateEvent` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 107 |
| `adminDeleteEvent` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 125 |
| `adminPublishEvent` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 142 |
| `adminCreateAgendaItem` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 167 |
| `adminReorderAgendaItems` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 226 |
| `adminRescheduleEvent` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 243 |
| `adminCancelEvent` | Method | `apps/api/src/modules/calendar/calendar.service.ts` | 264 |
| `findAdminByPublicId` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 93 |
| `updateEvent` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 133 |
| `deleteEvent` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 161 |
| `publishEvent` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 165 |
| `reorderAgendaItems` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 226 |
| `cancelEvent` | Method | `apps/api/src/modules/calendar/calendar.repository.ts` | 249 |
| `updateEvent` | Method | `apps/api/src/modules/calendar/calendar.controller.ts` | 121 |
| `deleteEvent` | Method | `apps/api/src/modules/calendar/calendar.controller.ts` | 131 |
| `publishEvent` | Method | `apps/api/src/modules/calendar/calendar.controller.ts` | 140 |
| `createAgendaItem` | Method | `apps/api/src/modules/calendar/calendar.controller.ts` | 152 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `EventFormDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `UpdateEvent → BuildAuditLogInput` | cross_community | 4 |
| `CreateAgendaItem → BuildAuditLogInput` | cross_community | 4 |
| `CalendarTable → IsLoopbackHost` | cross_community | 3 |
| `UpdateEvent → ZodValidationPipe` | cross_community | 3 |
| `UpdateEvent → FindAdminByPublicId` | intra_community | 3 |
| `UpdateEvent → UpdateEvent` | intra_community | 3 |
| `CreateAgendaItem → ZodValidationPipe` | cross_community | 3 |
| `CreateAgendaItem → FindAdminByPublicId` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 9 calls |
| Wisdom-qa | 6 calls |
| Downloads | 5 calls |
| Content | 3 calls |
| Ui | 2 calls |
| Community-posts | 1 calls |
| Media | 1 calls |
| Dharma-compliance | 1 calls |

## How to Explore

1. `gitnexus_context({name: "mapEventToAdminItem"})` — see callers and callees
2. `gitnexus_query({query: "calendar"})` — find related execution flows
3. Read key files listed above for implementation details
