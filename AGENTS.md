# PMTL Skill Taxonomy

## Governance skills
- **Output Gate:** Luôn sử dụng [output-skill](file:///.agents/skills/output-skill/SKILL.md) khi user yêu cầu full output, full file, hoặc nhiều deliverable không được cắt bớt.
- **Default UI Style:** Mặc định frontend/UI luôn ưu tiên [pmtl-ui-style-system](file:///.agents/skills/pmtl-ui-style-system/SKILL.md).
- **On-demand UI variants:** Chỉ dùng variant `soft`, `minimalist`, hoặc `redesign` trong `pmtl-ui-style-system` khi tôi yêu cầu rõ ràng.
- **Design library preservation:** Các local skill [taste-skill](file:///.agents/skills/taste-skill/SKILL.md), [soft-skill](file:///.agents/skills/soft-skill/SKILL.md), [minimalist-skill](file:///.agents/skills/minimalist-skill/SKILL.md), và [redesign-skill](file:///.agents/skills/redesign-skill/SKILL.md) là thư viện thiết kế quý, phải giữ nguyên và chỉ orchestration chứ không thay thế bằng bản rút gọn.

## Knowledge
- Use the local skill `pmtl-vn-architecture` from `.agents/skills/pmtl-vn-architecture` for architecture, boundaries, auth authority, and domain placement.
- Use the local skill `pmtl-production-baseline` from `.agents/skills/pmtl-production-baseline` for production-grade defaults, security posture, logging, validation, and runtime decisions.
- Use the local skill `pmtl-fe-implementation` for frontend implementation and refactoring quality.
- Use the local skill `pmtl-ui-behavior` for interaction discipline, accessibility, form behavior, and UI state handling.
- Use the local skill `pmtl-ui-style-system` for visual direction, typography, layout rhythm, and premium UI variants.
- Use the local skill `vercel-react-best-practices` for React/Next.js performance rules.

## Review
- Use the local skill `pmtl-review-web-ui` for UI/UX review, accessibility review, redesign audit, and PMTL-specific frontend critique.
- Use the global skill `security-best-practices` only when the user explicitly requests a security review or secure-by-default guidance.

## Verification
- Use the local skill `pmtl-verify-quality-gate` after meaningful code changes.
- Use the local skill `pmtl-verify-auth-flow` when touching auth, session, cookies, proxy, profile, or OAuth flows.
- Use the local skill `pmtl-verify-search-sync` when touching search schema, indexing, Meilisearch sync, or search UX fallbacks.

## Automation
- Use the local skill `pmtl-automation-smoke-suite` for repeatable smoke, monitoring, and alert-drill execution.
- Use the global skill `agent-browser` or installed `playwright` when browser automation or browser-based verification is the right tool.
- Use the installed `sentry` skill when the task is primarily about Sentry monitoring or incident verification.

## Scaffolding
- Use the local skill `pmtl-scaffold-payload-collection` when creating a new Payload collection.
- Use the local skill `shadcn` when adding or composing shadcn surfaces.

## Runbook
- Use the local skill `pmtl-runbook-docker-dev-recovery` when local Docker or compose-backed dev services are unhealthy.
- Use the local skill `pmtl-runbook-cms-runtime-errors` when debugging recurring CMS runtime, auth, search, or monitoring failures.


Repository constraints:
- Preserve monorepo boundaries: `apps/web`, `apps/cms`, `packages/*`, `infra/*`, `docs/*`
- Keep `apps/web` feature-first
- Keep Payload collections split into `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`
- Keep `packages/shared` framework-agnostic
- Do not move business logic into collection configs, page files, or `packages/shared`
- Redis-backed infrastructure is allowed when required for production reliability, multi-instance rate limiting, search sync, or worker execution

Skill routing:
- Use `pmtl-vn-architecture` for monorepo structure + domain design
- Use `pmtl-production-baseline` for production defaults, security, logging, validation, and runtime guidance
- Use `pmtl-fe-implementation` for frontend implementation and refactoring
- Use `pmtl-ui-behavior` for interactive components, forms, and accessibility
- Use `pmtl-ui-style-system` for layout rhythm, typography, visual polish, and explicit style variants
- Use `pmtl-review-web-ui` for frontend review and design critique
- Use `pmtl-verify-quality-gate`, `pmtl-verify-auth-flow`, and `pmtl-verify-search-sync` for verification instead of mixing verification into implementation skills
- Use `pmtl-automation-smoke-suite` for repeatable smoke and monitoring drills
- Use `pmtl-runbook-docker-dev-recovery` and `pmtl-runbook-cms-runtime-errors` for operational debugging paths

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

Windows reliability defaults:
- On Windows, prefer git grep -n for exact text search when bundled rg.exe is unavailable or access-denied.
- Use PowerShell Get-ChildItem + Select-String as the next fallback for file discovery and content search.
- Use mgrep for semantic or conceptual local search when exact text search is not enough.
- Prefer repo or skill wrapper scripts for repeated workflows instead of building long one-off shell commands.
- Split large edits into small file-local patches; avoid monolithic multi-file patches that can hit Windows command/path limits in tool wrappers.
- When a Python helper only needs frontmatter or simple text parsing, prefer a stdlib implementation over adding a third-party dependency.

Production readiness docs:
- Read `AUDIT_VERIFIED_2026.md` first for the verified production-readiness baseline and corrected findings when the file exists in the current checkout
- Treat any older audit notes still visible in git history or local notes as historical context, not as the final source of truth
- Read `.vscode/.instructions.md` for Copilot context
- Read `docs/architecture/skills-taxonomy.md` before changing skill routing or AI-coding conventions
