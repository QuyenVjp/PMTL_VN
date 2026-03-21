# AGENTS.md

## Scope
- This file is the PMTL_VN root guide. Keep it focused on repo routing, boundaries, and standard commands.
- Put app-specific rules in:
  - `apps/web/AGENTS.override.md`
  - `apps/api/AGENTS.override.md`
  - `apps/admin/AGENTS.override.md`
  - `infra/AGENTS.override.md`
- Put repeatable workflows in `.agents/skills/*`.

## Read First
- `AUDIT_VERIFIED_2026.md` when present
- `TEAM_GUIDE.md`
- `.vscode/.instructions.md`
- `docs/architecture/skills-taxonomy.md`
- `docs/agent-cheatsheet.md` for fast human and agent routing

## Monorepo Boundaries
- Preserve package boundaries:
  - `apps/web`: Next.js frontend, feature-first
  - `apps/api`: NestJS backend authority, auth, OpenAPI, domain modules
  - `apps/admin`: custom admin frontend, no business authority
  - `packages/shared`: framework-agnostic code only
  - `packages/ui`: shared UI components
  - `infra`: Docker, Caddy, monitoring, repo scripts
  - `docs`: architecture, contracts, runbooks
- Do not move business logic into page files, collection configs, or `packages/shared`.
- `apps/api` keeps business logic in services, not controllers.
- `apps/api/src/platform/*` owns control-plane and runtime modules such as sessions, audit, feature flags, rate limit, storage, health, and metrics.

## Project Rules
- Full implementations over stubs.
- All user input must be validated with Zod.
- All error handling must log with pino and structured context.
- All Vietnamese text in UI/API messages must keep proper dấu; never output Vietnamese without marks.
- If you change project rules, skill routing, or architecture conventions, update this file, the relevant skill docs, and the affected docs in the same task.

## Skill Routing
- Workflow routing and skill selection order: `.agents/skills/pmtl-workflow-router/SKILL.md`
- Skill design, audit, and evolution of repo-local skills: `.agents/skills/pmtl-skill-governance/SKILL.md`
- Architecture and domain placement: `.agents/skills/pmtl-vn-architecture/SKILL.md`
- Production defaults, logging, validation, runtime guidance: `.agents/skills/pmtl-production-baseline/SKILL.md`
- Frontend implementation: `.agents/skills/pmtl-fe-implementation/SKILL.md`
- UI behavior and accessibility: `.agents/skills/pmtl-ui-behavior/SKILL.md`
- Visual direction and style variants: `.agents/skills/pmtl-ui-style-system/SKILL.md`
- UI review: `.agents/skills/pmtl-review-web-ui/SKILL.md`
- Verification: `.agents/skills/pmtl-verify-quality-gate/SKILL.md`, `.agents/skills/pmtl-verify-auth-flow/SKILL.md`, `.agents/skills/pmtl-verify-search-sync/SKILL.md`
- Runbooks: `.agents/skills/pmtl-runbook-docker-dev-recovery/SKILL.md`, `.agents/skills/pmtl-runbook-cms-runtime-errors/SKILL.md`

## Skill Routing Order
- Treat `.agents/skills/*` PMTL skills as the canonical routing layer for this repo.
- Use `pmtl-workflow-router` first when the task spans multiple phases such as planning, implementation, review, or verification.
- Use Superpowers as the generic workflow engine for brainstorming, plans, subagent execution, code review, debugging, and TDD.
- Use global Codex or Claude Code skills only for platform tooling or external integrations such as Playwright, Next.js helpers, shadcn, Auth.js, or browser automation.
- Prefer canonical PMTL skills over compatibility aliases and design-library entrypoints unless the user explicitly names the older skill.

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

## External Workers
- Codex may consult external CLI workers when the user explicitly asks for Claude Code, Codex CLI, Copilot, or Gemini input, or when a second opinion is materially useful.
- Wrapper entrypoint: `py infra/tools/external_agent.py --provider <claude|codex|copilot|gemini> --prompt "<prompt>"`
- Keep external-worker prompts compact and reference repo file paths instead of pasting long code blocks.
- Treat external workers as advisory reviewers, not the source of truth for repo policy.

## Verification Rule
- After meaningful changes, run the strongest relevant checks for the touched area rather than defaulting to repo-wide commands.

## Design-First Direction
- Current target architecture is `apps/web + apps/api + apps/admin` with NestJS as backend authority.
- Treat `design/` as the architecture source of truth for the rebuild direction.
- If old docs or runtime folders still reference `apps/cms` or Payload-first ownership, do not copy that direction forward without explicit confirmation.
