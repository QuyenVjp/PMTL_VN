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

## Reusable thinking prompts

Nếu chưa biết nên đốt session vào lane nào, bắt đầu từ đây thay vì cố nhớ tên skill.

### Project critique / reality-check

```text
Repo: C:\Users\ADMIN\DEV2\PMTL_VN
Read AGENTS.md first, then use design/ and owner docs as source of truth.
Do not give generic praise.

Now tell me what you actually THINK of the project:
- is it even a good idea?
- is it useful?
- is it well designed and architected?
- is it pragmatic?
- what could we do to make it more useful, compelling, intuitive, and user-friendly to both humans and AI coding agents?

Return:
1. strengths worth preserving
2. weak points or self-deception
3. biggest architectural or product risks
4. concrete improvements with highest leverage
5. which PMTL role should own each next step
```

### Skill-routing fallback

```text
Repo: C:\Users\ADMIN\DEV2\PMTL_VN
Read AGENTS.md first.
Use pmtl-workflow-router behavior even if I did not name the skill explicitly.
Route this task to the smallest correct PMTL lane, explain the chosen role briefly, then continue.
```

## Good defaults

- Nếu task lớn: `pmtl-architect` -> implementer -> `pmtl-quality-gate`
- Nếu task là docs/facts: `pmtl-doc-researcher` -> `pmtl-canon-sync`
- Nếu task là live incident: `pmtl-ops-debugger` trước, không gọi `pmtl-release-hardener` quá sớm
- Nếu verify path đã rõ và task nhỏ: implementer tự chạy verify, không cần `pmtl-quality-gate`

## Autoresearch Fast Path

Dùng lane này khi task là tối ưu metric định lượng (score, latency, accuracy, profit metric) bằng keep/revert loop:

1. Đọc `docs/autoresearch.md`
2. Đọc `infra/tools/autoresearch/program.md`
3. Chạy `just autoresearch`

Quy tắc bắt buộc:

- chỉ sửa `infra/tools/autoresearch/train.py` trong vòng lặp
- không sửa `infra/tools/autoresearch/prepare.py` khi đang tối ưu
- score tăng mới giữ, còn lại revert

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
