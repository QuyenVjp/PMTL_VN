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
  - placement, ownership, design alignment, implementation planning
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

## Rule

- Agent không đứng trên `design/`.
- Nếu agent output mâu thuẫn với owner docs, owner docs thắng.
- Các file này là reusable role briefs, không phải bằng chứng rằng công cụ đang có native subagent runtime.
- Với task lớn:
  - `pmtl-architect` trước
  - implementer phù hợp sau
  - `pmtl-quality-gate` cuối
