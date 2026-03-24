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
- `docs/agent-operating-model.md` for Codex role, subagent routing, and worker governance
- `design/baseline/dependency-governance.md` when the task touches dependency upgrades, version drift, security advisories, migration policy, or “latest stack” decisions
- `docs/stitch-mcp.md` when the task involves wireframes, design generation, Stitch, or UI exploration through MCP

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
- External AI CLI routing and worker selection: `.agents/skills/pmtl-multi-cli-orchestrator/SKILL.md`
- Architecture and domain placement: `.agents/skills/pmtl-vn-architecture/SKILL.md`
- Production defaults, logging, validation, runtime guidance: `.agents/skills/pmtl-production-baseline/SKILL.md`
- Frontend implementation: `.agents/skills/pmtl-fe-implementation/SKILL.md`
- UI behavior and accessibility: `.agents/skills/pmtl-ui-behavior/SKILL.md`
- Visual direction and style variants: `.agents/skills/pmtl-ui-style-system/SKILL.md`
- UI review: `.agents/skills/pmtl-review-web-ui/SKILL.md`
- Verification: `.agents/skills/pmtl-verify-quality-gate/SKILL.md`, `.agents/skills/pmtl-verify-auth-flow/SKILL.md`, `.agents/skills/pmtl-verify-search-sync/SKILL.md`
- Runbooks: `.agents/skills/pmtl-runbook-docker-dev-recovery/SKILL.md`
- Stitch/global design helpers when the task explicitly targets Stitch MCP or Stitch wireframing: `C:\Users\ADMIN\.agents\skills\stitch-design\SKILL.md`, `C:\Users\ADMIN\.agents\skills\stitch-wireframe-generator\SKILL.md`, `C:\Users\ADMIN\.agents\skills\design-md\SKILL.md`, `C:\Users\ADMIN\.agents\skills\stitch-loop\SKILL.md`

Interim fallback rule until PMTL-native backend/runtime/security skills are created:
- backend/API/data work anchors on `pmtl-vn-architecture` + `pmtl-production-baseline`, then may borrow generic NestJS/API/DB/transaction auditors as fallback
- runtime/scaling/observability work anchors on PMTL baseline/runbook docs, then may borrow observability/infra/Docker production skills as fallback
- security/hardening outside auth/search anchors on PMTL security docs + production baseline, then may borrow generic security skills or Trail of Bits packs as fallback
- deprecated legacy CMS-era skills are not canonical routing targets even if still installed for compatibility

## Skill Routing Order
- Treat `.agents/skills/*` PMTL skills as the canonical routing layer for this repo.
- Use `pmtl-workflow-router` first when the task spans multiple phases such as planning, implementation, review, or verification.
- Use Superpowers as the generic workflow engine for brainstorming, plans, subagent execution, code review, debugging, and TDD.
- Use global Codex or Claude Code skills only for platform tooling or external integrations such as Playwright, Next.js helpers, shadcn, Auth.js, or browser automation.
- Prefer canonical PMTL skills over compatibility aliases and design-library entrypoints unless the user explicitly names the older skill.

## Agent Operating Model
- In this repo, Codex acts as the primary senior delivery engineer: design-first, full-stack, and responsible for turning `design/` into repo-aligned implementation or repo-aligned docs.
- Codex owns final synthesis, final patch direction, and final verification. Subagents and external workers provide bounded analysis or second opinions only.
- Route work in this order: repo-local PMTL skills -> local subagents -> external workers when they add clear leverage.
- Use local subagents first for repo exploration, drift detection, parallel reading, and option generation. Do not escalate externally just to answer "what does this repo say?"
- Prefer file-path-based prompts and narrow task slices when dispatching workers. Broad prompts that outsource judgment are a routing failure.
- If outputs disagree, prefer `design/`, `AGENTS.md`, and canonical PMTL skills over model confidence. Update repo docs first if external product drift proves the repo is stale.
- Read `docs/agent-operating-model.md` before changing worker governance, subagent roles, or escalation defaults.

## Windows-Safe Execution
- Prefer `rg`, then `git grep -n`, then PowerShell search.
- Use `mgrep` for conceptual search.
- Keep edits file-local and split large patches to avoid Windows path/command limits.
- Avoid broad recursive commands that walk `.next`, `node_modules`, or generated output unless that is the target.

## Stitch MCP
- Workspace MCP config includes a `stitch` server in `.mcp.json`; prefer it for design generation and wireframe exploration when the session exposes Stitch tools.
- Required local environment: `STITCH_MCP_API_KEY` must be set before starting the agent session; do not hardcode the key into repo files.
- Preferred Stitch project for PMTL design work: `PMTL_VN_DEV` with project id `8141337621129516599`.
- There is an older duplicate project named `PMTL_VN_DEV` with id `4954059763928985932`; use it only if the newer project is unavailable.
- If the current session does not expose Stitch tools after restart, consult `docs/stitch-mcp.md` and verify connectivity before assuming Stitch is unavailable.

## Standard Commands
- Install deps: `pnpm install`
- Deterministic local actions: `just <recipe>`
- Start core/full dev stack: `pnpm dev`, `pnpm dev:core`, `pnpm dev:full`
- Run smoke flow: `pnpm smoke:test`
- Quality gates: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`
- Monitoring drills: `pnpm monitoring:test`, `pnpm telegram:test`

## External Workers
- Codex may consult external CLI workers when the user explicitly asks for Claude Code, Codex CLI, Copilot, Gemini, or Aider input, or when a second opinion is materially useful.
- Use `.agents/skills/pmtl-multi-cli-orchestrator/SKILL.md` when deciding which worker should search, review, or implement a narrow subtask.
- Phrases such as `use multi-cli router` or `dung multi-cli router` mean: apply `pmtl-multi-cli-orchestrator` and dispatch the smallest correct worker set without asking the user to pick a provider.
- Preferred repo wrapper: `py infra/tools/codex_actions.py multi-cli-router --task "<task>" --speed fast [--compare]`
- Use `--speed balanced` when you specifically want Codex/Gemini to stay more competitive.
- Direct script fallback: `py infra/tools/multi_cli_router.py --task "<task>" --speed fast [--compare]`
- Wrapper entrypoint: `py infra/tools/external_agent.py --provider <claude|codex|copilot|gemini|aider> --prompt "<prompt>"`
- External worker wrapper now keeps sticky per-workspace sessions under `~/.codex/subagent-runtime/<provider>/<workspace-key>/session.json` for Claude, Copilot, and Gemini.
- Wrapper auto-recovers from stale Claude/Copilot resume tokens by dropping the bad saved session and rerunning fresh once.
- Wrapper also keeps a lightweight local conversation memory at `~/.codex/subagent-runtime/<provider>/<workspace-key>/conversation.jsonl` so chat context survives even when provider resume quality is uneven.
- Default wrapper behavior is `--interaction-mode auto`: chat-style prompts run in a clean runtime dir so repo MCP/skills are not loaded unnecessarily; repo-aware prompts keep workspace context.
- Use `--interaction-mode repo` when the worker must read repo context, or `--interaction-mode chat` when you want a lightweight answer lane.
- In `repo` mode, prompts should name the files/paths to inspect; the wrapper now nudges workers to stay file-scoped instead of scanning unrelated repo context.
- Use `--session-mode fresh` to force a clean run or `--session-mode resume-latest` to attach to the provider's latest project session when supported.
- `aider` is an opt-in git-aware patch lane. Keep it advisory dry-run by default, with no auto-commits, and do not make it the primary auto-route unless the task explicitly asks for Aider or that exact workflow.
- Keep external-worker prompts compact and reference repo file paths instead of pasting long code blocks.
- Treat external workers as advisory reviewers, not the source of truth for repo policy.

## Verification Rule
- After meaningful changes, run the strongest relevant checks for the touched area rather than defaulting to repo-wide commands.

## Design-First Direction
- Current target architecture is `apps/web + apps/api + apps/admin` with NestJS as backend authority.
- Treat `design/` as the architecture source of truth for the rebuild direction.
- If old docs or runtime folders still reference legacy CMS-first ownership, do not copy that direction forward without explicit confirmation.
