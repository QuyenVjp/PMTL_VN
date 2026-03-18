# High-End Frontend Enforcement (Taste Skill + Output Skill)
- **Primary:** Mặc định frontend/UI luôn ưu tiên [taste-skill](file:///.agents/skills/taste-skill/SKILL.md).
- **Quality Gate:** Luôn sử dụng [output-skill](file:///.agents/skills/output-skill/SKILL.md) để ép output đầy đủ, không để lại placeholder.
- **On-Demand:** Chỉ dùng [redesign-skill](file:///.agents/skills/redesign-skill/SKILL.md), [soft-skill](file:///.agents/skills/soft-skill/SKILL.md), hoặc [minimalist-skill](file:///.agents/skills/minimalist-skill/SKILL.md) khi tôi yêu cầu rõ ràng.

# PMTL Project Skills
Use the local skill `pmtl-vn-architecture` from `.agents/skills/pmtl-vn-architecture` for all architecture work.
Use the local skill `pmtl-production-ready` from `.agents/skills/pmtl-production-ready` for production setup, libraries, security, and implementation guidance.
Use the local skill `pmtl-fe-craft` for professional frontend implementation (Senior logic).
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

Implementation expectations:
- Prefer full implementations over stubs
- Keep code explicit and AI-friendly
- Update docs and env examples when contracts or runtime requirements change
- If you change project rules, security baselines, architecture conventions, or AI coding constraints, update `AGENTS.md`, the relevant `.agents/skills/*/SKILL.md`, and the affected docs in the same task
- Run relevant verification after edits
- All error handling must include structured logging (use pino)
- All user input must be validated with Zod schemas
- All API responses must use TypeScript strict mode
- **Vietnamese Language Standard:** NEVER generate or use Vietnamese without marks (tiếng Việt không dấu) in UI, API messages, or data. All Vietnamese text must include proper marks/accents.

Production readiness docs:
- Read `AUDIT_VERIFIED_2026.md` first for the verified production-readiness baseline and corrected findings
- Treat any older audit notes still visible in git history or local notes as historical context, not as the final source of truth
- Read `.vscode/.instructions.md` for Copilot context
- See `.agents/skills/pmtl-production-ready/SKILL.md` for patterns
