# MCP_STACK

File này chốt MCP stack thực dụng cho PMTL_VN: cái nào bật ngay, cái nào để dành khi có secret, và dùng cái nào cho từng loại việc.

---

## Mục tiêu

Tận dụng MCP để agent:

- đọc docs mới hơn model memory
- thấy runtime/app state thật
- debug browser thật
- quan sát hạ tầng/data thay vì đoán

Không biến `.mcp.json` thành bãi rác với hàng chục server chồng chéo.

---

## Repo stack map

PMTL hiện không phải chỉ có Next.js. Các lane chính là:

- web: Next.js App Router, React, Tailwind, shadcn/ui, Radix, TanStack Query, RHF, Zod, Motion, Sonner, Lucide
- api: NestJS backend authority, OpenAPI-oriented contracts, validation, services
- admin/shared: React/Vite-oriented package lane, shared UI/config packages
- data/search: Postgres, Redis, Meilisearch
- infra: Docker Compose, Caddy, monitoring stack
- observability/testing: Playwright, Vitest, Prometheus, Grafana, alerting

Vì vậy MCP strategy phải chia 2 loại:

1. docs umbrella MCP
2. runtime/internals MCP

---

## Active stack

### 1. `context7`

Vai trò:
- docs MCP đa dụng cho library/framework hiện hành

Dùng cho:
- React
- Next.js
- NestJS
- TanStack
- React Hook Form
- Zod
- Motion
- Embla
- Meilisearch
- Redis client/server docs
- Caddy docs
- PostgreSQL docs
- Docker
- cloud/client SDK docs

Ghi chú:
- dùng khi cần docs mới, setup steps, API shape, examples
- `CONTEXT7_API_KEY` là optional nhưng nên có để tăng rate limit
- với phần lớn library/framework, `context7` có giá trị hơn việc cắm 1 MCP riêng cho từng package

### 2. `next-devtools`

Vai trò:
- lane Next.js runtime + official-doc-aware tools

Dùng cho:
- app router
- routes/layout tree
- server logs
- runtime diagnostics
- migration/upgrade questions

Ghi chú:
- mạnh nhất khi `apps/web` đang chạy dev server
- với Next.js 16+, server có thể connect vào lane MCP runtime của app

### 3. `shadcn`

Vai trò:
- shadcn component discovery/install/composition

Dùng cho:
- add component
- inspect registry-backed examples
- map primitive vs app composition

Ghi chú:
- phụ thuộc `apps/web` path tồn tại
- rất hợp cho scaffold phase

### 4. `playwright`

Vai trò:
- browser evidence

Dùng cho:
- reproduce UI issues
- screenshots
- accessibility/interaction checks
- confirm rendered behavior

### 5. `postgres-pmtl`

Vai trò:
- inspect data/runtime DB state

Dùng cho:
- query data
- verify migrations or runtime content state
- debug search/indexing related DB assumptions

### 6. `docker-mcp`

Vai trò:
- infra/container lane

Dùng cho:
- Docker Desktop / Compose / runtime tooling
- container-centric infra inspection
- MCP-managed infra tasks qua Docker gateway

Ghi chú:
- repo này đã có `docker mcp` CLI trên máy

### 7. `stitch`

Vai trò:
- design generation / wireframe exploration

Dùng cho:
- design ideation
- screen generation
- Stitch-based UI exploration

### 8. `github`

Vai trò:
- GitHub repo/issue/PR/actions lane

Dùng cho:
- PR review context
- issues
- Actions/workflow metadata
- repo-level collaboration state

Ghi chú:
- cần `GITHUB_PERSONAL_ACCESS_TOKEN`
- config hiện để `--read-only` theo mặc định an toàn

### 9. `meilisearch-admin`

Vai trò:
- Meilisearch health/tasks/index settings lane

Dùng cho:
- kiểm tra health
- task queue
- index settings
- search runtime assumptions

### 10. `redis-admin`

Vai trò:
- Redis runtime/keyspace lane

Dùng cho:
- inspect cache state
- debug Redis connection assumptions
- runtime key/value inspection

### 11. `sentry-mcp`

Vai trò:
- hosted error triage lane

Dùng cho:
- inspect issues
- triage
- docs/search trong Sentry context

Ghi chú:
- cần `SENTRY_ACCESS_TOKEN`

### 12. `grafana`

Vai trò:
- hosted observability lane

Dùng cho:
- dashboards
- alerts
- datasource-driven investigation

Ghi chú:
- thường cần `GRAFANA_URL` + `GRAFANA_SERVICE_ACCOUNT_TOKEN`

### 13. `smartbear`

Vai trò:
- SwaggerHub / API Hub / contract-testing lane

Dùng cho:
- Swagger docs/API Hub
- contract testing via PactFlow/Pact Broker
- BugSnag/Reflect/QMetry/Zephyr nếu repo thật sự dùng

Ghi chú:
- với PMTL, lane này chủ yếu đáng dùng cho Swagger/OpenAPI hub khi có SmartBear credentials
- `apiKey` trong OpenAPI spec của một backend API không đồng nghĩa với SmartBear platform API key
- nếu repo chỉ cần agent hiểu OpenAPI/Swagger schema, examples, auth schemes, responses, thì `context7` + local spec files thường đã đủ

---

## Why not one MCP per library?

Với các stack như:
- NestJS
- Zod
- RHF
- TanStack Query
- Motion
- Tailwind
- Meilisearch client libs

thì docs umbrella MCP như `context7` thường là lựa chọn tốt hơn:
- ít config hơn
- ít secret hơn
- không cần giữ 10-20 server nhỏ chồng chéo
- vẫn lấy được docs mới

Dedicated MCP chỉ đáng bật khi nó cho thêm một trong các leverage sau:
- runtime internals
- live app state
- browser evidence
- infra/container state
- database state

---

## Suggested routing

| Task shape | MCP nên dùng trước |
|---|---|
| hỏi docs thư viện mới nhất | `context7` |
| hỏi hành vi Next.js runtime/app router | `next-devtools` |
| hỏi shadcn component/block | `shadcn` |
| debug UI trong browser | `playwright` |
| kiểm tra data/postgres | `postgres-pmtl` |
| kiểm tra Docker/infra/container | `docker-mcp` |
| wireframe/design generation | `stitch` |
| GitHub repo / PR / Actions | `github` |
| Meilisearch index / tasks / settings | `meilisearch-admin` |
| Redis runtime / keyspace | `redis-admin` |
| hosted errors | `sentry-mcp` |
| Grafana / alerts / dashboards | `grafana` |
| SwaggerHub / API hub / contract testing | `smartbear` |

---

## Secret-gated lane chưa auto bật

Những lane này hữu ích nhưng không nên auto-enable nếu repo chưa có secret tương ứng:

- GitHub MCP
- cloud-provider MCPs
- vendor-specific observability MCPs
- Sentry/Datadog/Grafana-style hosted MCPs
- SmartBear / SwaggerHub style hosted MCPs

Lý do:
- thiếu token thì MCP đỏ ngay từ lúc khởi động
- gây nhiễu thay vì tạo leverage

Khi thật sự cần, thêm theo nguyên tắc:
- có use case rõ
- có token/env rõ
- có owner docs/routing rule rõ

---

## Current caveats

- `apps/web` hiện chưa được scaffold lại, nên một số lane như `shadcn` và `next-devtools` sẽ hữu ích hơn sau khi web app tồn tại.
- Local bundled Next.js docs chỉ có sau khi `apps/web` cài `next`.
- `meilisearch-admin` và `redis-admin` chỉ thật sự usable khi local service đang chạy.
- MCP không thay thế `design/`; nó chỉ bổ sung docs và runtime evidence.
