# PMTL_VN Claude Code Guide

Use this file as the high-signal operating contract for Claude Code in this repo.

## Read Order
- `AGENTS.md`
- `TEAM_GUIDE.md`
- `.vscode/.instructions.md`
- `design/` documents relevant to the touched module or flow

## Repo Shape
- `apps/web`: Next.js frontend. Keep feature logic in feature folders, not page files.
- `apps/api`: NestJS backend authority. Keep business logic in services, not controllers.
- `apps/admin`: admin frontend only, not business authority.
- `packages/shared`: framework-agnostic code only.
- `packages/ui`: shared UI primitives and components.
- `infra`: Docker, Caddy, monitoring, repo scripts.
- `docs`: architecture, runbooks, contracts.

## Non-Negotiables
- Full implementations over stubs.
- Validate all user input with Zod.
- Log errors with structured pino context.
- Keep Vietnamese text fully marked with proper dấu.
- Do not move business logic into page files, collection configs, or `packages/shared`.
- Treat `design/` as source of truth for the rebuild direction unless the user explicitly overrides it.

## Runtime Defaults
- This repo is Docker-first. Prefer `just` wrappers and repo scripts over ad hoc shell chains.
- Windows native is the default on this machine unless a task is large enough to justify WSL.
- Node baseline is `20.18.0`.

## Preferred Commands
- Bootstrap: `just bootstrap`
- Dev core/full: `just dev-core`, `just dev-full`
- Stop/rebuild/logs: `just dev-stop`, `just dev-rebuild`, `just dev-logs`
- Web verify: `just verify-web`
- Backend verify: `just verify-cms`
- Full verify: `just verify-all`
- Smoke/monitoring/auth/search: `just smoke`, `just monitoring`, `just auth-check`, `just search-check`
- Fallback package scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

## Execution Rules
- Prefer `rg`, then `git grep -n`, then PowerShell search.
- Prefer `py infra/tools/codex_actions.py ...` over long ad hoc diagnostic commands when available.
- After meaningful changes, run the strongest relevant targeted verification instead of defaulting to repo-wide checks.
- If a change affects project rules, skills, architecture conventions, or security posture, update the relevant docs in the same task.

## Design and Domain Rules
- For frontend work, preserve the PMTL premium editorial direction and avoid generic UI.
- For backend work, preserve module boundaries and public contracts.
- Search and cache layers are projections, not the source of truth.
- Important write paths need audit coverage and recovery paths.

## Claude Code Workflow
- For medium or large tasks: explore first, then plan, then implement.
- Use subagents for parallel research, reviews, verification, and domain-specific work.
- Use worktrees for isolated large refactors or parallel branches.
- Keep context clean. If the current thread becomes noisy or drifts, reset and restate the task precisely.

## PMTL Subagents
- `pmtl-architect`: placement, contracts, domain ownership, design alignment.
- `pmtl-api-builder`: NestJS, auth, schemas, audits, runtime boundaries.
- `pmtl-web-builder`: Next.js, UI behavior, feature implementation, style fidelity.
- `pmtl-quality-gate`: verification planning, targeted checks, review findings.
- `pmtl-ops-debugger`: Docker, runtime failures, monitoring, incident-style debugging.
- `copilot-worker`: external GitHub Copilot CLI opinion for compare/validate tasks.
- `gemini-worker`: external Gemini CLI opinion for compare/validate tasks.

## External Worker Wrapper
- Use `py infra/tools/external_agent.py --provider copilot --prompt "<prompt>"` for Copilot CLI.
- Use `py infra/tools/external_agent.py --provider gemini --prompt "<prompt>" --debug` for Gemini CLI.
- Keep prompts compact; point to repo file paths instead of pasting long code blocks.

## Verification Mapping
- `apps/web`, `packages/ui`: start with `just verify-web`
- `apps/api`, auth, search, infra-backed backend changes: start with `just verify-cms`
- cross-cutting changes: use `just verify-all`
- search-specific work: include `just search-check`
- auth/session/cookie changes: include `just auth-check`

## Sensitive Areas
- Do not read or print secrets from `.env*`, `infra/docker/.env*`, key files, or secret directories unless the user explicitly asks.
- Avoid destructive git commands unless the user explicitly requests them.
- Treat production compose files and production env references as confirmation-worthy actions.
