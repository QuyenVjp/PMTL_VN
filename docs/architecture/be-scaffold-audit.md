# Backend Scaffold Audit

Last updated: 2026-03-28

## DDD Layer Coverage per Module

| Module | Repository | Mapper | Policy | Notes |
|---|---|---|---|---|
| calendar | ✅ | ✅ | ✅ | Added 2026-03-28 |
| community | ✅ | ✅ | ✅ | Added 2026-03-28; two entities (posts + guestbook) in one repository |
| content | ✅ | ✅ | ✅ | Pre-existing |
| identity | — | ✅ | ✅ | Pre-existing; no repository (auth-heavy, PrismaService acceptable) |
| moderation | — | ✅ | ✅ | Added mapper + policy 2026-03-27 |
| notification | ✅ | ✅ | — | Added repository + mapper 2026-03-27 |
| vows-merit | ✅ | ✅ | ✅ | Added 2026-03-28; covers Vow + LifeReleaseJournal aggregates |
| contact | — | — | — | Low complexity; simple inserts only, extraction not warranted |
| engagement | — | — | — | Stub service (no real Prisma queries yet); nothing to extract |
| search | — | — | — | Projection/fan-out layer, not domain authority; different pattern |
| wisdom-qa | — | — | — | Static data module (q161 rule pack); no Prisma queries |

## packages/api-client

- **Status**: Live as of 2026-03-27
- **Location**: `packages/api-client/src/`
- **Pattern**: `createAdminClient(baseUrl)` factory, TanStack Query `queryOptions()` factories
- **Admin modules covered**: notifications, sessions, moderation-reports
- **Shims in apps/admin**: `lib/api/admin-client.ts`, `lib/api/envelopes.ts`, `lib/api/http-error.ts` all re-export from `@pmtl/api-client`
- **HttpError identity**: Single class via package — `instanceof` checks work correctly

## Governance Notes

- Modules with only 1-3 trivial Prisma calls (contact, wisdom-qa) do not need a repository; extraction adds noise without benefit.
- `search` module is a projection/fan-out layer, not a domain repository. Different architectural pattern applies.
- No remaining extraction candidates. All modules with real Prisma queries now have repositories.
