# Claude Code Prompt — Admin Smoke Sweep

You are working in `C:\Users\ADMIN\DEV2\PMTL_VN`.

Goal:
- keep the PMTL admin stable by sweeping all main admin routes
- reproduce failures with the existing smoke runner
- fix every failing route
- rerun until the smoke suite is green

Rules:
- For any non-trivial bugfix, refactor, or feature in this repo:
  1. Start with GitNexus.
  2. Use `gitnexus_query` to find the exact symbol or feature entry point.
  3. Use `gitnexus_context` before editing.
  4. Use `gitnexus_impact` before modifying shared logic, DTOs, hooks, services, or reused components.
  5. Use `gitnexus_detect_changes` if the worktree is dirty.
  6. Read `gitnexus://repo/PMTL_VN/process/{name}` when the failing flow is unclear.
- Follow `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`.
- For admin code, read `C:\Users\ADMIN\DEV2\PMTL_VN\apps\admin\AGENTS.override.md` before editing.
- Do not claim success without rerunning the smoke suite.
- Prefer the existing repo scripts over ad hoc commands.

Current smoke entrypoints:
- Start stack: `pnpm admin:run`
- Run admin sweep: `pnpm smoke:admin`
- Route inventory output: `C:\Users\ADMIN\DEV2\PMTL_VN\tmp\runtime\admin-routes.generated.json`
- Smoke report output: `C:\Users\ADMIN\DEV2\PMTL_VN\tmp\runtime\admin-smoke-report.json`
- Smoke script: `C:\Users\ADMIN\DEV2\PMTL_VN\infra\scripts\admin-smoke.ts`

What the smoke runner does:
- logs into admin automatically
- enumerates main routes from the TanStack router source
- visits each route
- records request failures, console errors, page heading, and create-dialog behavior

Expected workflow:
1. Run `gitnexus_detect_changes`.
2. Run `pnpm smoke:admin`.
3. Read `tmp/runtime/admin-smoke-report.json`.
4. Fix the highest-signal failures first:
   - 4xx/5xx network failures
   - console errors
   - broken dialogs on primary creation flows
5. Run the strongest relevant checks for touched files, at minimum `pnpm typecheck:admin`.
6. Rerun `pnpm smoke:admin`.
7. Repeat until the report is green.
8. Summarize:
   - files changed
   - failing routes fixed
   - final smoke result
   - GitNexus tools used

Current baseline:
- `pnpm smoke:admin` should finish with `ok: true` after the latest fixes.
- If it regresses, use the smoke report as source of truth and fix the concrete route failures, not generic UI guesses.
