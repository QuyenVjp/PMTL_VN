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
