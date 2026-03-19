# AGENTS.override.md

## Scope
- Applies inside `apps/cms`.
- Follow the root `AGENTS.md` first, then this file.

## Collection Discipline
- Keep Payload collections split into:
  - `index.ts`: declaration only
  - `fields.ts`: field definitions
  - `access.ts`: access control
  - `hooks.ts`: hook wiring and orchestration
  - `service.ts`: business logic, validation, sync, mappers
- Do not move business logic into collection configs or hooks when it belongs in `service.ts`.

## Runtime Rules
- Validate external and user inputs with Zod.
- All failures must log structured context with pino.
- Keep auth, search sync, worker, and API-side changes explicit and reviewable.
- Use Redis-backed coordination when production behavior requires cross-instance consistency.

## Verification
- Prefer targeted commands:
  - `pnpm --filter @pmtl/cms test`
  - `pnpm --filter @pmtl/cms typecheck`
  - `pnpm --filter @pmtl/cms lint`
- If touching auth/session/cookies, run the auth verification skill.
- If touching search sync or Meilisearch integration, run the search verification skill.
