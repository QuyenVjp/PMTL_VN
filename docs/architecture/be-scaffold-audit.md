# Backend Scaffold Audit

Last updated: 2026-03-28

## DDD Layer Coverage per Module

| Module | Repository | Mapper | Policy | Notes |
|---|---|---|---|---|
| calendar | ✅ | ✅ | ✅ | Added 2026-03-28 |
| community | ✅ | ✅ | ✅ | Added 2026-03-28; two entities (posts + guestbook) in one repository |
| content | ✅ | ✅ | ✅ | Pre-existing |
| identity | — | ✅ | ✅ | Pre-existing; no repository (service delegates via PrismaService, acceptable for auth-heavy module) |
| moderation | — | ✅ | ✅ | Added mapper + policy 2026-03-27 |
| notification | ✅ | ✅ | — | Added repository + mapper 2026-03-27 |
| contact | — | — | — | Low complexity; Prisma calls are simple inserts, no extraction needed yet |
| engagement | — | — | — | Pending assessment |
| search | — | — | — | Projection layer, not domain authority; different pattern applies |
| vows-merit | — | — | — | Pending assessment |
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
- Next extraction candidates: `engagement`, `vows-merit` (both have inline Prisma in service, 150+ lines).
