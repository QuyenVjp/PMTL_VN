# AGENTS.md

## Scope
- This file is the PMTL_VN root guide. Keep it focused on repo routing, boundaries, and standard commands.
- Put app-specific rules in:
  - `apps/web/AGENTS.override.md`
  - `apps/cms/AGENTS.override.md`
  - `infra/AGENTS.override.md`
- Put repeatable workflows in `.agents/skills/*`.

## Read First
- `AUDIT_VERIFIED_2026.md` when present
- `TEAM_GUIDE.md`
- `.vscode/.instructions.md`
- `docs/architecture/skills-taxonomy.md`

## Monorepo Boundaries
- Preserve package boundaries:
  - `apps/web`: Next.js frontend, feature-first
  - `apps/cms`: Payload CMS and worker runtime
  - `packages/shared`: framework-agnostic code only
  - `packages/ui`: shared UI components
  - `infra`: Docker, Caddy, monitoring, repo scripts
  - `docs`: architecture, contracts, runbooks
- Do not move business logic into page files, collection configs, or `packages/shared`.
- Payload collections stay split into `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`.

## Project Rules
- Full implementations over stubs.
- All user input must be validated with Zod.
- All error handling must log with pino and structured context.
- All Vietnamese text in UI/API messages must keep proper dấu; never output Vietnamese without marks.
- If you change project rules, skill routing, or architecture conventions, update this file, the relevant skill docs, and the affected docs in the same task.

## Skill Routing
- Skill design, audit, and evolution of repo-local skills: `.agents/skills/pmtl-skill-governance/SKILL.md`
- Architecture and domain placement: `.agents/skills/pmtl-vn-architecture/SKILL.md`
- Production defaults, logging, validation, runtime guidance: `.agents/skills/pmtl-production-baseline/SKILL.md`
- Frontend implementation: `.agents/skills/pmtl-fe-implementation/SKILL.md`
- UI behavior and accessibility: `.agents/skills/pmtl-ui-behavior/SKILL.md`
- Visual direction and style variants: `.agents/skills/pmtl-ui-style-system/SKILL.md`
- UI review: `.agents/skills/pmtl-review-web-ui/SKILL.md`
- Verification: `.agents/skills/pmtl-verify-quality-gate/SKILL.md`, `.agents/skills/pmtl-verify-auth-flow/SKILL.md`, `.agents/skills/pmtl-verify-search-sync/SKILL.md`
- Runbooks: `.agents/skills/pmtl-runbook-docker-dev-recovery/SKILL.md`, `.agents/skills/pmtl-runbook-cms-runtime-errors/SKILL.md`

## Windows-Safe Execution
- Prefer `rg`, then `git grep -n`, then PowerShell search.
- Use `mgrep` for conceptual search.
- Keep edits file-local and split large patches to avoid Windows path/command limits.
- Avoid broad recursive commands that walk `.next`, `node_modules`, or generated output unless that is the target.

## Standard Commands
- Install deps: `pnpm install`
- Deterministic local actions: `just <recipe>`
- Start core/full dev stack: `pnpm dev`, `pnpm dev:core`, `pnpm dev:full`
- Run smoke flow: `pnpm smoke:test`
- Quality gates: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`
- Monitoring drills: `pnpm monitoring:test`, `pnpm telegram:test`

## Verification Rule
- After meaningful changes, run the strongest relevant checks for the touched area rather than defaulting to repo-wide commands.
