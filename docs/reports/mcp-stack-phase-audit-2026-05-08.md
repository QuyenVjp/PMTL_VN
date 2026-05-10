# PMTL MCP Stack Phase Audit - 2026-05-08

## Evidence Checked

Local:
- `C:\Users\ADMIN\DEV2\PMTL_VN\.mcp.json`
- `C:\Users\ADMIN\.codex\config.toml`
- `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\docs\reference\mcp-stack.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\infra\tools\codex_actions.py`
- `C:\Users\ADMIN\DEV2\PMTL_VN\infra\tools\start_mcp_server.ps1`

External official/project sources:
- Docker MCP Gateway: https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
- Docker MCP CLI: https://docs.docker.com/ai/mcp-catalog-and-toolkit/cli/
- Context Mode: https://mcpapp-store.com/apps/context-mode
- CocoIndex Code: https://github.com/cocoindex-io/cocoindex-code
- GitNexus: https://gitnexus.homes/
- Context7: https://github.com/upstash/context7
- OpenAI Docs MCP: https://developers.openai.com/learn/docs-mcp
- Playwright MCP: https://playwright.dev/docs/getting-started-mcp
- Prisma MCP: https://docs.prisma.io/docs/cli/mcp
- shadcn MCP: https://ui.shadcn.com/docs/mcp
- Supermemory MCP: https://supermemory.ai/docs/supermemory-mcp/introduction

## Executive Summary

MCP không thiếu. Gap chính là exposure, auth, runtime readiness, và routing discipline.

- Workspace `.mcp.json` đã có repo-oriented MCP tốt: `gitnexus`, `cocoindex_code`, `context7`, `openaiDeveloperDocs`, `shadcn`, `prisma-local`, `postgres-pmtl`, `neural-memory`, và vài runtime/admin lanes.
- Global Codex config có thêm các server anh nêu nhưng workspace chưa mirror: `MCP_DOCKER`, `context-mode`, `omniroute`, `playwright`, `supermemory`.
- Trong chat hiện tại đọc được resource từ `gitnexus` và `neural-memory`; `supermemory` mount thấy nhưng auth fail.
- Docker MCP CLI có, nhưng Docker Desktop chưa chạy nên `docker mcp server list` và `docker mcp tools list` fail.
- `cocoindex_code` đã index tốt: 23,530 chunks, 961 files.
- `gitnexus` đã index tốt: 1,821 files, 22,930 symbols, 190 processes.

Verdict: chưa tận dụng hết. Không nên thêm MCP mới trước khi chuẩn hóa phase routing và smoke/auth checks.

## Phase 0 - Inventory And Mount Health

Findings:
- `py infra/tools/codex_actions.py mcp-smoke` thấy workspace MCP config và các path chính tồn tại.
- `openaiDeveloperDocs` bị smoke báo false vì là HTTP MCP, script hiện chỉ validate command-based MCP. Đây là limitation của smoke script.
- `stitch` thiếu `STITCH_MCP_API_KEY`, ngoài scope danh sách này.
- Codex app-server status thấy đủ server global, nhưng nhiều status là `unsupported`; không coi đó là proof tool usable.

Action:
- Sửa `mcp-smoke` để hiểu HTTP MCP.
- Mirror `context-mode` và `playwright` vào `.mcp.json` nếu muốn fresh PMTL chat nào cũng có.

## Phase 1 - Context, Docs, Memory

| MCP | Chức năng | Tình trạng | Tối ưu cho Codex | Đã tận dụng hết? |
|---|---|---|---|---|
| `context-mode` | Large-output command/search layer: batch execute, indexed search, fetch/index, processing | Global only; command starts v1.0.104; tool không expose trong chat | Dùng cho audit lớn, logs, `rg`, tránh flood context | No |
| `context7` | Docs MCP cho library/framework hiện hành | Workspace + global; command ok; tool exposure chưa verify | First stop cho React/Next/TanStack/Zod/Prisma/Docker docs | Partial |
| `openaiDeveloperDocs` | OpenAI official docs MCP | Workspace + global; HTTP config; smoke false do script | First stop cho OpenAI/Codex/API/tool docs | Partial |
| `neural-memory` | PMTL durable memory: recap/remember/recall/health/train | Workspace + global; resource read works | Cross-session PMTL decisions, không thay repo docs | Partial |
| `supermemory` | Cross-client personal memory | Global only; resource auth failed | Có ích cho personal memory nếu re-auth | No |

Phase 1 action:
- Add `context-mode` to workspace MCP and verify one real `ctx_batch_execute` call.
- Keep `context7` + `openaiDeveloperDocs` as official-doc lanes.
- Re-auth or disable `supermemory`; hiện đang tạo noise.

## Phase 2 - Code Intelligence

| MCP | Chức năng | Tình trạng | Tối ưu cho Codex | Đã tận dụng hết? |
|---|---|---|---|---|
| `gitnexus` | Code graph: query/context/impact/detect_changes/rename/cypher | Workspace + global; resource works; 22,930 symbols | Mandatory for non-trivial feature/bug/refactor | Mostly |
| `cocoindex_code` | Semantic code search/index | Workspace + global; 23,530 chunks indexed | Conceptual search before broad grep; pair with GitNexus | Partial |

Phase 2 action:
- Keep rule: code task -> `gitnexus_query -> context -> impact -> detect_changes`.
- Add routing note: conceptual/fuzzy search -> `cocoindex_code`; symbol blast radius -> `gitnexus`.
- Re-index GitNexus/CocoIndex after large domain work.

## Phase 3 - Runtime, Browser, Database, Infra

| MCP | Chức năng | Tình trạng | Tối ưu cho Codex | Đã tận dụng hết? |
|---|---|---|---|---|
| `playwright` | Browser automation, snapshots, screenshots, interactions | Global only; not exposed here | UI/admin/web proof after changes | Partial |
| `postgres-pmtl` | Local Postgres read/runtime inspection wrapper | Workspace; command ok; depends DB running | Data truth, migration/runtime checks | Partial |
| `prisma-local` | Prisma MCP for schema/model/context | Workspace + global; command ok | Prisma schema/migration reasoning | Partial |
| `MCP_DOCKER` | Docker MCP Gateway and MCP server lifecycle | Global only; Docker Desktop off | Container/infra state and MCP isolation | No |

Phase 3 action:
- Mirror `playwright` into workspace MCP.
- For DB tasks: `postgres-pmtl` for runtime truth, `prisma-local` for schema/model reasoning.
- Start Docker Desktop only when needed, then run `docker mcp server list` and `docker mcp tools list`.

## Phase 4 - UI Component And Model Routing

| MCP | Chức năng | Tình trạng | Tối ưu cho Codex | Đã tận dụng hết? |
|---|---|---|---|---|
| `shadcn` | Component registry/search/install/composition | Workspace; points to `apps/web`; smoke ok | Add components and registry-backed examples | Partial |
| `omniroute` | Model gateway/router; MCP control plane | Global only; active model provider | Provider routing/fallback/observability, host-level | Partial |

Phase 4 action:
- Keep `shadcn` web target. Add `shadcn-admin` only if admin registry work is frequent.
- Keep `omniroute` global. Do not copy provider secrets or host routing into repo.

## Aggregate Utilization Matrix

| MCP | Config scope | Current usability | Gap |
|---|---|---|---|
| `MCP_DOCKER` | Global only | Blocked, Docker Desktop off | Runtime inactive, no verified profile/tools |
| `cocoindex_code` | Workspace + global | Usable | Needs PMTL routing rule |
| `context-mode` | Global only | Server starts, tools not exposed | Mirror/refresh MCP exposure |
| `context7` | Workspace + global | Configured | Need real tool-call verification |
| `gitnexus` | Workspace + global | Usable | Enforce on every non-trivial code task |
| `neural-memory` | Workspace + global | Resource readable | Tool-call exposure unclear |
| `omniroute` | Global only | Active as provider | MCP control not verified |
| `openaiDeveloperDocs` | Workspace + global | Config valid | Smoke script HTTP limitation |
| `playwright` | Global only | Not exposed here | Mirror into workspace |
| `postgres-pmtl` | Workspace | Command ok | Needs DB readiness before use |
| `prisma-local` | Workspace + global | Command ok | Needs migration/schema routing rule |
| `shadcn` | Workspace | Web target ok | Admin target optional |
| `supermemory` | Global only | Auth failed | Re-auth or disable |

## Recommended Roadmap

1. Phase A - Exposure: add workspace entries for `context-mode` and `playwright`; decide whether Docker MCP stays global.
2. Phase B - Smoke: fix HTTP MCP validation for `openaiDeveloperDocs`; add runtime checks for Docker/Postgres.
3. Phase C - Routing: document exact use order: docs -> Context7/OpenAI docs; large audit -> Context Mode; conceptual code -> CocoIndex; impact -> GitNexus; UI -> Playwright; DB -> Postgres/Prisma.
4. Phase D - Hygiene: re-auth or remove `supermemory`; avoid adding one MCP per library.

## Final Recommendation

Keep the current MCP stack. Do not add more yet.

Highest value fixes:
- workspace mirror: `context-mode`, `playwright`
- smoke patch: HTTP MCP support for `openaiDeveloperDocs`
- routing patch: `cocoindex_code` vs `gitnexus`
- auth cleanup: `supermemory`
- runtime readiness: Docker Desktop and DB checks before claiming those MCP lanes usable
## Fix Pass - 2026-05-08

Completed after owner request `trừ docker ra`:

- Added workspace MCP entries for `context-mode` and `playwright`.
- Updated `mcp-smoke` so HTTP MCP entries like `openaiDeveloperDocs` validate by URL instead of failing for missing `command`.
- Updated `mcp-smoke` so secret-gated `stitch` is skipped in base local smoke when `STITCH_MCP_API_KEY` is missing, while still reporting the missing env.
- Added routing guidance for `context-mode`, `gitnexus`, `cocoindex_code`, and `prisma-local` in `docs/reference/mcp-stack.md`.
- Refreshed CocoIndex: 23,543 chunks, 962 files, 0 indexing errors.
- Verified GitNexus status: up-to-date on commit `3c95dd7`.
- Verified Prisma schema: valid.
- Verified Playwright MCP and Context Mode commands start/help successfully.
- Verified `py infra/tools/codex_actions.py mcp-smoke` returns `ok: true` for the local base stack.

Still not fixed:

- Docker-related lanes intentionally skipped.
- `supermemory` still needs OAuth re-auth outside repo files.
- Existing current Codex chat may not gain newly added MCP tools until reload/new workspace-root chat, even though config smoke passes.
