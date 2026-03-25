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

## Active stack

### 1. `context7`

Vai trò:
- docs MCP đa dụng cho library/framework hiện hành

Dùng cho:
- React
- Next.js
- TanStack
- React Hook Form
- Zod
- Motion
- Embla
- Docker
- cloud/client SDK docs

Ghi chú:
- dùng khi cần docs mới, setup steps, API shape, examples
- `CONTEXT7_API_KEY` là optional nhưng nên có để tăng rate limit

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

---

## Secret-gated lane chưa auto bật

Những lane này hữu ích nhưng không nên auto-enable nếu repo chưa có secret tương ứng:

- GitHub MCP
- cloud-provider MCPs
- vendor-specific observability MCPs
- Sentry/Datadog/Grafana-style hosted MCPs

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
- MCP không thay thế `design/`; nó chỉ bổ sung docs và runtime evidence.
