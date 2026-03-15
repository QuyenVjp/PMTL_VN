Use the local skill `pmtl-vn-architecture` from `.agents/skills/pmtl-vn-architecture` for all architecture work.
Use the local skill `pmtl-production-ready` from `.agents/skills/pmtl-production-ready` for production setup, libraries, security, and implementation guidance.
Use the local skill `pmtl-fe-craft` for professional frontend implementation.
Use the local skill `pmtl-uiux-specialist` for behavioral and interaction discipline.
Use the local skill `pmtl-creative-designer` for visual identity and premium vibe.

Repository constraints:
- Preserve monorepo boundaries: `apps/web`, `apps/cms`, `packages/*`, `infra/*`, `docs/*`
- Keep `apps/web` feature-first
- Keep Payload collections split into `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`
- Keep `packages/shared` framework-agnostic
- Do not move business logic into collection configs, page files, or `packages/shared`
- Redis-backed infrastructure is allowed when required for production reliability, multi-instance rate limiting, search sync, or worker execution

Skill routing:
- Use `pmtl-vn-architecture` for monorepo structure + domain design
- Use `pmtl-production-ready` for features, security, logging, testing, debugging
- Use `pmtl-fe-craft` for all frontend implementation and refactoring
- Use `pmtl-uiux-specialist` for interactive components, forms, and accessibility
- Use `pmtl-creative-designer` for layout rhythm, typography, and visual polish
- Use `next` for Next.js App Router patterns
- Use `auth-module-builder` for auth/session/RBAC work
- Use `docker-configuration-validator` for Docker, Compose, Caddy, and deploy changes
- Use `auth-js` only as reference unless Auth.js is explicitly requested

Implementation expectations:
- Prefer full implementations over stubs
- Keep code explicit and AI-friendly
- Update docs and env examples when contracts or runtime requirements change
- Run relevant verification after edits
- All error handling must include structured logging (use pino)
- All user input must be validated with Zod schemas
- All API responses must use TypeScript strict mode

Production readiness docs:
- Read `AI_CONFIG_SUMMARY.md` for quick overview
- Read `PROJECT_AUDIT_REPORT.md` for current state audit
- Read `QUICK_IMPLEMENTATION_GUIDE.md` for step-by-step implementation
- Read `PRODUCTION_TOOLKIT_GUIDE.md` for library recommendations
- Read `.vscode/.instructions.md` for Copilot context
- See `.agents/skills/pmtl-production-ready/SKILL.md` for patterns
