# TEAM_GUIDE.md

## Project Mode
- Runtime model: mixed, with Docker-first development and verification.
- Standard path: Docker Compose via `pnpm dev*`, `run-dev.bat`, or `just`.
- Host-only exceptions: quick file edits, repo search, Telegram test, monitoring drills, and rare `pnpm dev:host:*` debugging.

## Operating System Routing
- Windows native: preferred for normal PMTL work on this machine, especially `.bat` wrappers, Docker Desktop, and PowerShell-native tasks.
- WSL: preferred only for large refactors, heavy file traversal, or when Windows path/command limits become the bottleneck.
- Do not assume host Node is the source of truth; Docker is the repo baseline for app runtime.

## Worktree Bootstrap
- `just bootstrap`
- If `infra/docker/.env.dev` is missing, bootstrap creates it from `infra/docker/.env.dev.example`.
- Node baseline is `20.18.0`; use `.node-version` when switching host runtimes.

## Deterministic Entry Points
- Core/full dev stack: `just dev-core`, `just dev-full`
- Logs/stop/rebuild: `just dev-logs`, `just dev-stop`, `just dev-rebuild`
- Quality gates: `just verify-web`, `just verify-cms`, `just verify-all`
- Smoke/monitoring/telegram: `just smoke`, `just monitoring`, `just telegram`
- Auth/search verification: `just auth-check`, `just search-check`

## Codex Notes
- Prefer `py infra/tools/codex_actions.py ...` over long ad hoc shell commands.
- Prefer repo wrappers over direct `docker compose exec ...` unless the task needs a one-off diagnostic.
- For verification, `codex_actions.py` auto-selects Docker when the check depends on the repo runtime more than the host shell.
- Database inspection for PMTL: prefer the `postgres-pmtl` MCP server when the Docker dev stack is up. It targets `127.0.0.1:55432`, which maps to the dev Postgres container on this repo.
- Treat `postgres-pmtl` as a local-dev database tool only. Do not point it at production or long-lived shared environments.
