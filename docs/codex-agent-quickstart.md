# Codex Agent Quickstart

Dùng file này khi mở một chat Codex mới và muốn gọi đúng PMTL role brief ngay từ đầu.

## Read first

1. [AGENTS.md](C:/Users/ADMIN/DEV2/PMTL_VN/AGENTS.md)
2. [README.md](C:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/README.md)
3. owner docs trong `design/` của lane đang đụng tới

## Pick the right role

| Task shape | Role brief |
|---|---|
| planning, placement, ownership | `pmtl-architect` |
| NestJS/backend feature | `pmtl-api-builder` |
| Next.js/web feature | `pmtl-web-builder` |
| admin/internal UI | `pmtl-admin-builder` |
| search sync, Meilisearch projection, fallback mapping | `pmtl-search-builder` |
| Prisma schema, migration, transaction-sensitive data work | `pmtl-data-runtime-keeper` |
| update `design/` / lock canon | `pmtl-canon-sync` |
| Docker, Compose, Caddy, Cloudflare, monitoring hardening | `pmtl-release-hardener` |
| runtime incident, logs, recovery, Docker stack failures | `pmtl-ops-debugger` |
| official-doc research and fact correction | `pmtl-doc-researcher` |
| broad review or unclear verification path | `pmtl-quality-gate` |

## Opening prompt pattern

Copy the relevant role brief into the new session, then add:

```text
Repo: C:\Users\ADMIN\DEV2\PMTL_VN
Read AGENTS.md first, then follow this role brief strictly.
Use design/ as source of truth.
If the task crosses role boundaries, say which PMTL role should own the next handoff.
```

## Good defaults

- Nếu task lớn: `pmtl-architect` -> implementer -> `pmtl-quality-gate`
- Nếu task là docs/facts: `pmtl-doc-researcher` -> `pmtl-canon-sync`
- Nếu task là live incident: `pmtl-ops-debugger` trước, không gọi `pmtl-release-hardener` quá sớm
- Nếu verify path đã rõ và task nhỏ: implementer tự chạy verify, không cần `pmtl-quality-gate`

## Skill combos for fresh Codex chats

| Surface | Primary combo | Notes |
|---|---|---|
| `apps/web` page/feature | `pmtl-fe-implementation` -> `pmtl-ui-behavior` -> `pmtl-ui-style-system` | add `pmtl-creative-designer` only when public-facing polish matters |
| `apps/admin` workspace/page | `pmtl-admin-ui` -> `pmtl-ui-behavior` -> `pmtl-ui-style-system` | keep admin clarity-first; do not let design flair override ops readability |
| public landing/hero redesign | `pmtl-fe-implementation` -> `pmtl-ui-style-system` -> `pmtl-creative-designer` | `frontend-design` is optional accent lane, not canon authority |
| admin density/usability critique | `pmtl-admin-ui` -> `ui-ux-pro-max` | use `ui-ux-pro-max` as advisory critique only |

Rules:

- `pmtl-fe-implementation` is the web implementer default, not the admin default.
- `pmtl-admin-ui` owns admin workspace structure, table/filter/bulk-action flows, and query/invalidation discipline.
- `ui-ux-pro-max` is a secondary reference lane. Do not let it override PMTL owner docs.

## Useful opening lines

```text
Use pmtl-api-builder. Fix this in apps/api only, keep Zod/service/audit boundaries intact, then run the strongest relevant targeted verification.
```

```text
Use pmtl-search-builder. Treat SQL as canonical and Meilisearch as projection only. Trace write -> sync -> query path before editing.
```

```text
Use pmtl-release-hardener. Keep Docker/Caddy/Cloudflare changes within PMTL deploy canon and end with concrete runtime verification commands.
```

```text
Use pmtl-doc-researcher. Official docs only. Return verified truths, PMTL inferences, and unresolved policy gaps separately.
```

```text
Use pmtl-admin-ui with pmtl-ui-behavior. Build this apps/admin workspace against ADMIN_MODULE_SPECS, ADMIN_PAGE_API_MAPPING, and ADMIN_FEATURE_QUERY_PLAN. Keep query keys and invalidation owner-driven, not component-invented.
```
