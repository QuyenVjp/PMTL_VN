# Member Object Authorization Inventory

Ngày: 2026-07-13  
Scope: mọi route member/me object-id (`:publicId` / `:sessionPublicId` / `:id`)  
Nguồn: source controllers + service ownership predicates sau Phase 1 IDOR fix + review reopen.

## Quy ước disposition

| Code | Ý nghĩa |
|---|---|
| `OWNED` | Lookup scoped `publicId + userId`; cross-user → 404 |
| `PUBLIC` | Resource công khai; ownership không áp dụng |
| `HARD_DENY` | Endpoint luôn 403 / không resolve object |
| `ADMIN_ONLY` | Không phải member lane |

## Explicit member/admin record APIs

Optional `ownerUserId?` is a sharp edge — member callers can forget it.

| Module | Member API | Admin API |
|---|---|---|
| Little House (sớ) | `getMemberRecord(publicId, userId)` / `findMemberByPublicId` | `getAdminRecord` / `findAdminByPublicId` |
| Life Liberation | `getMemberRecord(publicId, userId)` / `findMemberByPublicId` | `getAdminRecord` / `findAdminByPublicId` |
| Sacred Forms | `getMyApplicant(publicId, userId)` (already explicit) | `getApplicant(publicId)` |
| Engagement me/little-house | `getOne(publicId, userId)` (service requires userId) | n/a (member-only) |
| me/altar | `getLog(publicId, userId)` (findFirst publicId+userId) | n/a |

Deprecated optional-owner helpers remain as thin dispatchers only.

## Inventory

| Route | Controller | Ownership predicate | Disposition | Regression test |
|---|---|---|---|---|
| `GET member/little-house/:publicId` | `MemberLittleHouseController` | `getMemberRecord(publicId, user.id)` | **OWNED** | `little-house-authz.spec.ts` + controller regression |
| `POST member/little-house/:publicId/recitations` | `MemberLittleHouseController` | `findByPublicId(publicId, userId)` trước write | **OWNED** | `little-house-authz.spec.ts` |
| `GET me/little-house/:publicId` | `LittleHouseController` (engagement) | `littleHouseService.getOne(publicId, user.id)` | **OWNED** | source-verified; controller passes user.id |
| `GET member/sacred-forms/my-applications/:publicId` | `MemberSacredFormsController` | `getMyApplicant(publicId, user.id)` | **OWNED** | `sacred-forms-authz.spec.ts` |
| `GET member/life-liberation/:publicId` | `MemberLifeLiberationController` | `getMemberRecord(publicId, user.id)` | **OWNED** | `life-liberation-authz.spec.ts` + controller regression |
| `POST member/life-liberation/:publicId/proxy` | `MemberLifeLiberationController` | `findMemberByPublicId(publicId, sponsorId)` trước write | **OWNED** | `life-liberation-authz.spec.ts` |
| `GET me/vows/:publicId` | `MemberVowsController` | `getVow(publicId, user.id)` | **OWNED** | existing vow-member suite (userId scoped) |
| `POST me/vows/:publicId/milestones` | `MemberVowsController` | `recordMilestone(publicId, input, user.id)` | **OWNED** | existing vow-member suite |
| `GET me/life-release-journal/:publicId` | `MemberLifeReleaseController` | `getDetail(publicId, user.id)` | **OWNED** | service takes userId |
| `PATCH me/life-release-journal/:publicId` | `MemberLifeReleaseController` | `update(publicId, input, user.id)` | **OWNED** | service takes userId |
| `GET me/altar/:publicId` | `AltarController` | `getLog(publicId, user.id)` → `findFirst({ publicId, userId })` | **OWNED** | source-verified 2026-07-13 |
| `POST member/altar-management/hardware-items/:publicId/retire` | `MemberAltarValidationController` | `findFirst({ publicId, userId })` | **OWNED** | source-verified 2026-07-13 |
| `POST member/altar-management/grand-incense/:sessionPublicId/advance` | `MemberAltarValidationController` | `findFirst({ publicId, userId, actionType })` | **OWNED** | source-verified 2026-07-13 |
| `PATCH member/altar-management/hardware-items/:publicId` | `MemberAltarValidationController` | always 403 via `blockHardwareReassignment` | **HARD_DENY** | intentional forbid |
| `GET member/events/:publicId` | `MemberEventsController` | public event detail | **PUBLIC** | n/a |
| `POST member/events/:publicId/register` | `MemberEventsController` | registers *current* user into public event | **PUBLIC** (self-write) | n/a |
| `PATCH member/events/:publicId/cancel` | `MemberEventsController` | cancels *current* user's registration | **OWNED** (registration row) | service uses user.id |

## List routes (no object id, but owner-scoped)

| Route | Scope mechanism |
|---|---|
| `GET member/little-house` | `userId: user.id` forced last in parse |
| `GET me/little-house` | `list(user.id, query)` |
| `GET member/life-liberation` | `userId: user.id` forced last in parse |
| `GET member/sacred-forms/my-applications` | `userId: user.id` forced last in parse (+ schema accepts userId) |
| `GET me/vows` | service `listVows(user.id, query)` |
| `GET me/life-release-journal` | service `list(user.id, query)` |
| `GET me/altar` | `listLogs(user.id, query)` |
| `GET member/altar-management/items` | service scopes by user |

## Closed P0 holes (this pass)

1. Little House member detail + recitation — previously unscoped.
2. Sacred Forms my-application detail — previously unscoped; list also dropped `userId` via Zod (fixed).
3. Life Liberation member detail + proxy — previously unscoped.
4. Inventory gaps filled: `GET me/little-house/:publicId`, `GET me/altar/:publicId`.
5. Explicit `getMemberRecord` / `getAdminRecord` split for Little House + Life Liberation.

## Residual notes

- Vows / life-release-journal / altar retire+advance: ownership predicate verified in source; dedicated cross-user authz tests recommended as follow-up (not P0 open holes).
- Client cannot override list `userId` because controller spreads `user.id` last.
- Admin routes intentionally unscoped via `getAdminRecord`.
- Engagement `me/little-house` is a separate domain (ngôi nhà nhỏ practice) from `member/little-house` (sớ) — both owned.

## Gate

Không còn member object route trong inventory mà thiếu disposition.
Controller member paths call explicit member APIs (no optional owner arg).
