# Implementation Lane

Use this lane when adding or refactoring code that may affect production behavior.

## Workflow

1. Read `AGENTS.md` and `docs/architecture/conventions.md`.
2. Identify the correct layer and nearby pattern before editing.
3. Apply the smallest high-confidence change.
4. Route follow-up verification:
   - generic quality: `pmtl-verify-quality-gate`
   - auth/session: `pmtl-verify-auth-flow`
   - search/indexing: `pmtl-verify-search-sync`
5. Update docs and env examples if the runtime contract changed.

## Things to protect

- request boundaries in `apps/web/src/proxy.ts`
- shared-schema purity in `packages/shared`
- Payload collection split: `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`
- Vietnamese text quality in UI and API messages

## Escalation triggers

- new env vars
- cache behavior changes
- auth/session flow changes
- worker or monitoring changes
- search indexing behavior changes
