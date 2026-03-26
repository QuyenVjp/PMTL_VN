# PMTL Agent Specs

Các file trong thư mục này là role-specs dùng lại được cho các phiên chat mới của PMTL_VN.
Chúng đang nằm trong `.claude/agents/` để tương thích với tooling hiện có, nhưng không bị khóa vào Claude.
Có thể dùng chúng như prompt artifacts cho Claude, Codex, Copilot, Gemini, hoặc worker khác.
Mục tiêu là:
- gọi đúng người cho đúng việc
- bám `design/` thay vì tự phát minh kiến trúc
- giảm prompt lặp lại ở các lane hay dùng

## Core PMTL agents

- `pmtl-architect`
  - placement, ownership, design alignment, planning and handoff readiness
- `pmtl-api-builder`
  - NestJS/backend implementation trong `apps/api`
- `pmtl-web-builder`
  - Next.js/frontend implementation trong `apps/web`
- `pmtl-admin-builder`
  - internal tooling và màn hình `apps/admin`
- `pmtl-search-builder`
  - Meilisearch, sync, fallback, projection behavior
- `pmtl-data-runtime-keeper`
  - Prisma, Postgres, migrations, transaction-sensitive flows
- `pmtl-canon-sync`
  - update `design/`, owner docs, canon locking, doc correction
- `pmtl-release-hardener`
  - Docker, Compose, Caddy, Cloudflare, monitoring, deploy hardening
- `pmtl-quality-gate`
  - review, targeted verification, readiness check
- `pmtl-ops-debugger`
  - runtime failures, Docker recovery, incident/debug lanes
- `pmtl-doc-researcher`
  - official-doc research, drift checks, fact correction

## External compare workers

- `claude-worker`
- `codex-worker`
- `copilot-worker`
- `gemini-worker`

Các worker này là compare lanes/advisory lanes, không phải PMTL role specs. Muốn gọi chúng đúng chỗ thì đi qua multi-cli router hoặc một PMTL role chính trước.

## How to use

- nếu tool hỗ trợ repo-local agents trực tiếp:
  - gọi đúng agent file
- nếu tool không hỗ trợ:
  - lấy file agent tương ứng làm role brief/prompt seed cho phiên mới
- nếu task lớn:
  - chọn planner trước
  - rồi implementer phù hợp
  - cuối cùng là verifier/reviewer

- planning/placement first:
  - `pmtl-architect`
- backend feature:
  - `pmtl-api-builder`
- frontend feature:
  - `pmtl-web-builder`
- admin/internal UI:
  - `pmtl-admin-builder`
- search/index/fallback:
  - `pmtl-search-builder`
- Prisma/migration/data contract:
  - `pmtl-data-runtime-keeper`
- design/doc sync:
  - `pmtl-canon-sync`
- deploy/runtime hardening:
  - `pmtl-release-hardener`
- final verification:
  - `pmtl-quality-gate`
- runtime/debug:
  - `pmtl-ops-debugger`
- official-doc fact finding:
  - `pmtl-doc-researcher`

## Ambiguous pairs

| Nếu task là... | Dùng | Không dùng nhầm |
|---|---|---|
| backend feature có DTO/service/audit/permission | `pmtl-api-builder` | `pmtl-data-runtime-keeper` nếu chưa đụng schema/migration/transaction boundary |
| Prisma schema, migration, transaction contract, directUrl/runtime URL | `pmtl-data-runtime-keeper` | `pmtl-api-builder` nếu phần khó nhất là data-runtime correctness |
| publish xong không ra search, mapping/index/sync sai | `pmtl-search-builder` | `pmtl-ops-debugger` nếu engine vẫn khỏe |
| Meilisearch container chết, fallback lặp, runtime/search lane đang cháy | `pmtl-ops-debugger` | `pmtl-search-builder` nếu đây là incident hạ tầng/runtime |
| siết Compose/Caddy/Cloudflare/monitoring trước release | `pmtl-release-hardener` | `pmtl-ops-debugger` nếu không phải live incident |
| service đang down, Docker dev stack chết, cần logs/runbook/recovery ngay | `pmtl-ops-debugger` | `pmtl-release-hardener` nếu không phải hardening task |
| cần research official docs, correction pass, fact gathering | `pmtl-doc-researcher` | `pmtl-canon-sync` nếu chưa có evidence đủ chắc |
| đã có evidence hoặc verified implementation và cần update design/ | `pmtl-canon-sync` | `pmtl-doc-researcher` nếu việc chính là sửa owner docs |
| task nhỏ với verify path đã rõ | implementer tự verify | `pmtl-quality-gate` |
| task lớn, diff rộng, hoặc verify path không rõ | `pmtl-quality-gate` | implementer closeout hời hợt |

## Naming rules

- Giữ prefix `pmtl-` cho repo-local role specs.
- Tên nên mô tả lane thật, không đặt cho oách.
- Ưu tiên pattern `pmtl-<surface>-<role>` hoặc `pmtl-<domain>-<role>`.
- Nếu role chỉ research/review/advisory, phải nói rõ trong description và phần `Do not`.

## Rule

- Agent không đứng trên `design/`.
- Nếu agent output mâu thuẫn với owner docs, owner docs thắng.
- Các file này là reusable role briefs, không phải bằng chứng rằng công cụ đang có native subagent runtime.
- Với task lớn:
  - `pmtl-architect` trước
  - implementer phù hợp sau
  - `pmtl-quality-gate` cuối
