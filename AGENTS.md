Use the local skill `pmtl-vn-architecture` from `.agents/skills/pmtl-vn-architecture` for all work in this repository.

Repository constraints:
- Preserve monorepo boundaries: `apps/web`, `apps/cms`, `packages/*`, `infra/*`, `docs/*`
- Keep `apps/web` feature-first
- Keep Payload collections split into `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`
- Keep `packages/shared` framework-agnostic
- Do not move business logic into collection configs, page files, or `packages/shared`
- Do not introduce Redis, workers, or queue infrastructure unless phase 2 is explicitly requested

Skill routing:
- Use `next` for `apps/web` work
- Use `auth-module-builder` for auth/session/RBAC work
- Use `docker-configuration-validator` for Docker, Compose, Caddy, and deploy changes
- Use `auth-js` only as reference unless Auth.js is explicitly requested

Implementation expectations:
- Prefer full implementations over stubs
- Keep code explicit and AI-friendly
- Update docs and env examples when contracts or runtime requirements change
- Run relevant verification after edits
