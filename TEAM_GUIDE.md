# PMTL_VN Team Guide

This is the thin human-facing entrypoint for the repo. Keep detailed rules in
`AGENTS.md`, app constitutions, `design/`, and `.agents/skills/*`.

## Start Here

1. Read `AGENTS.md` for repo boundaries and routing rules.
2. Read `docs/codex-agent-quickstart-lite.md` for low-token agent startup.
3. Read the app constitution for the area you touch:
   - `apps/api/AGENTS.override.md`
   - `apps/admin/AGENTS.override.md`
   - `apps/web/AGENTS.override.md` when present
4. Check the matching `design/03-domains/*/CONTRACTS.md` before changing domain behavior.

## Current Architecture

- `apps/web`: public/member Next.js frontend.
- `apps/api`: NestJS backend authority for auth, domain logic, validation, audit, and persistence.
- `apps/admin`: custom admin frontend that consumes backend APIs and must not own business rules.
- `packages/shared`: framework-agnostic code only.
- `packages/ui`: shared UI primitives.
- `infra`: runtime, Docker, Caddy, monitoring, and scripts.

## Working Norms

- Prefer full implementations over stubs.
- Keep changes small enough to verify.
- Preserve Vietnamese text with full dấu.
- Use Zod for input validation and pino for structured logging.
- Never revert unrelated dirty worktree changes.
- Run the strongest targeted check for the touched area before handing work back.
