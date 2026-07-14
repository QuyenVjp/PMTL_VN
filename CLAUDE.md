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
- Official Anthropic Claude Code references are synced under `tmp/reference/anthropic` via `pnpm claude:setup`.

## Preferred Commands
- Bootstrap: `just bootstrap`
- Claude bootstrap: `pnpm claude:setup`
- Claude doctor: `pnpm claude:doctor`
- Dev core/full: `just dev-core`, `just dev-full`
- Stop/rebuild/logs: `just dev-stop`, `just dev-rebuild`, `just dev-logs`
- Web verify: `just verify-web`
- Backend verify: `just verify-cms` (legacy recipe name for current API/backend verification)
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
- Repo-local role specs also live in `.claude/agents/README.md`; even outside Claude Code they can be reused as prompt/role briefs for new sessions.
- `pmtl-architect`: placement, contracts, domain ownership, design alignment.
- `pmtl-api-builder`: NestJS, auth, schemas, audits, runtime boundaries.
- `pmtl-web-builder`: Next.js, UI behavior, feature implementation, style fidelity.
- `pmtl-admin-builder`: apps/admin internal tooling, moderation, operations screens, admin-only UX.
- `pmtl-search-builder`: Meilisearch integration, search sync, SQL fallback, search debugging.
- `pmtl-data-runtime-keeper`: Prisma, Postgres, migrations, directUrl/runtime URL boundaries, transaction-sensitive data work.
- `pmtl-canon-sync`: design-doc updates, source-of-truth locking, official-doc correction passes.
- `pmtl-release-hardener`: Docker, Compose, Caddy, Cloudflare, monitoring, release-minded runtime hardening.
- `pmtl-quality-gate`: verification planning, targeted checks, review findings.
- `pmtl-ops-debugger`: Docker, runtime failures, monitoring, incident-style debugging.
- `pmtl-doc-researcher`: official-doc fact finding, version drift checks, repo-aware gap filling.

## External Compare Workers
- These are advisory compare lanes, not PMTL-aware role specs.
- Route them through `pmtl-multi-cli-orchestrator` or call them only when a second opinion is materially useful.
- `claude-worker`: external Claude Code CLI opinion for compare/validate tasks.
- `codex-worker`: external Codex CLI opinion for compare/validate tasks.
- `copilot-worker`: external GitHub Copilot CLI opinion for compare/validate tasks.
- `gemini-worker`: external Gemini CLI opinion for compare/validate tasks.

## External Worker Wrapper
- Use `.agents/skills/pmtl-multi-cli-orchestrator/SKILL.md` first when the task is deciding which external worker should own research, review, or a narrow implementation pass.
- Use `/multi-cli-router <task>` for the fast path in new Claude Code chats.
- Preferred repo wrapper on Windows: `py infra/tools/codex_actions.py multi-cli-router --task "<task>" --speed fast [--compare]`
- Use `--speed balanced` for a less latency-biased lane and `--speed deep` when deeper review matters more than speed.
- Direct script fallback: `py infra/tools/multi_cli_router.py --task "<task>" --speed fast [--compare]`
- Use `py infra/tools/external_agent.py --provider claude --prompt "<prompt>" --debug` for Claude Code CLI.
- Use `py infra/tools/external_agent.py --provider codex --prompt "<prompt>" --debug` for Codex CLI.
- Use `py infra/tools/external_agent.py --provider copilot --prompt "<prompt>"` for Copilot CLI.
- Use `py infra/tools/external_agent.py --provider gemini --prompt "<prompt>" --debug` for Gemini CLI.
- Keep prompts compact; point to repo file paths instead of pasting long code blocks.

## Verification Mapping
- `apps/web`, `packages/ui`: start with `just verify-web`
- `apps/api`, auth, search, infra-backed backend changes: start with `just verify-cms` (legacy recipe name for current API/backend verification)
- cross-cutting changes: use `just verify-all`
- search-specific work: include `just search-check`
- auth/session/cookie changes: include `just auth-check`

## Sensitive Areas
- Do not read or print secrets from `.env*`, `infra/docker/.env*`, key files, or secret directories unless the user explicitly asks.
- Avoid destructive git commands unless the user explicitly requests them.
- Treat production compose files and production env references as confirmation-worthy actions.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **PMTL_VN** (23082 symbols, 32709 relationships, 187 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/PMTL_VN/context` | Codebase overview, check index freshness |
| `gitnexus://repo/PMTL_VN/clusters` | All functional areas |
| `gitnexus://repo/PMTL_VN/processes` | All execution flows |
| `gitnexus://repo/PMTL_VN/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

### GitNexus Knowledge Graph – PMTL_VN Edition

Graph hiện tại: 1.736 files · 17.991 symbols · 27.724 edges · 286 clusters (Leiden) + full embeddings.

GitNexus giúp tôi hiểu sâu toàn bộ monorepo Next.js 16 + NestJS, đặc biệt traceability giữa code ↔ folder `design/` (governance, architecture intent).

**Các MCP tools chính thức (dùng đúng tên có prefix gitnexus_):**

- `gitnexus_impact({target: "...", direction?: "upstream"|"downstream", minConfidence?: 0.8})`
  → Blast radius + risk level

- `gitnexus_context({name: "..."})`
  → 360° call chain, callers/callees, execution flow

- `gitnexus_query({query: "..."})`
  → Semantic + graph search (rất mạnh sau khi có embeddings)

- `gitnexus_detect_changes({scope: "staged"|"all"})`
  → Kiểm tra thay đổi trước commit

- `gitnexus_cypher({query: "..."})`
  → Query graph raw nếu cần

**Quy tắc vàng cho PMTL_VN:**
- Khi tìm code liên quan đến bất kỳ domain nào → luôn dùng `gitnexus_query` trước, sau đó đọc thẳng file trong `design/03-domains/...` để so sánh **intent (design) vs implementation (code)**.
- Trước mọi refactor lớn → bắt buộc chạy `gitnexus_impact` + `gitnexus_detect_changes`.
- Folder `design/` là source of truth → Claude phải luôn cross-check.

### TOOL POLICY - HIGHEST PRIORITY (PMTL_VN)

Chỉ được sử dụng GitNexus tools với prefix `gitnexus_`.

TUYỆT ĐỐI CẤM mọi deprecated `corn_*` tool (`corn_knowledge_search`, `corn_code_search`, `corn_code_impact`, `corn_code_context`...).

Khi cần search code, blast radius, call chain hoặc traceability design/ → bắt buộc gọi `gitnexus_query` hoặc `gitnexus_impact` trước.

### NestJS Hybrid Protocol (BẮT BUỘC - PMTL_VN)

GitNexus limitation: Không track NestJS constructor injection (@Injectable, Module providers) → thường báo ZERO upstream callers cho Services.

Quy tắc khắc phục:
1. Luôn bắt đầu bằng gitnexus_query / gitnexus_impact / gitnexus_context trước.
2. Nếu upstream callers = 0 hoặc quá thấp → tự động chạy manual grep:
   - grep -r "new .*Service" hoặc "constructor.*Service"
   - Tìm controller import module
   - Tìm @Module({ providers: [...] })
3. Luôn cross-check với folder design/ để xác nhận gap.
4. Báo cáo rõ: "GitNexus graph + manual verification (NestJS DI)".

Áp dụng cho mọi phân tích Auth, Identity, Domain Services.
