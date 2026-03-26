# AI_ENTRYPOINT

File này là cổng vào ngắn nhất cho AI khi làm việc trong `PMTL_VN`.

Mục tiêu:

- giảm friction khi đọc `design/`
- giữ AI bám canon thay vì bịa policy
- chỉ ra lane nào phải đọc file nào trước khi code

File này là `orientation only`.
Nó không override owner docs.

## 1. Core rule

Nếu cần đọc đúng `design/` cho một task, dùng thứ tự này:

1. `design/AI_ENTRYPOINT.md`
2. `design/01-repo-constitution/DECISIONS.md`
3. `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`
4. owner docs đúng lane đang sửa
5. `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` nếu task đụng readiness, scaffold order, hoặc claim implementation

Không đọc cả folder theo kiểu tuần tự.
Không lấy file overview làm authority nếu owner doc đã tồn tại.

## 2. Current direction

PMTL hiện là `design-first rebuild`.

Runtime target:

- `apps/web` = Next.js 16 public frontend
- `apps/api` = NestJS backend authority
- `apps/admin` = React admin SPA

Authority rules:

- `apps/api` là authority duy nhất cho auth, write-paths, orchestration, và privileged operations
- `Postgres` là source of truth cho business data
- search projection, cache, queue, worker chỉ là supporting lanes, không được thành authority thứ hai

## 3. PMTL coding posture

Khi AI code trong repo này, ưu tiên:

- giản dị hơn phô diễn
- module boundaries rõ hơn “fullstack magic”
- implementation thật hơn stub
- evidence hơn confidence
- content/doctrine/source provenance đúng hơn tốc độ scaffold

PMTL không xây theo kiểu:

- gamification tâm linh
- AI tự sinh giáo lý hoặc tư vấn thay nguồn chuẩn
- vendor shortcut phá `apps/api` authority
- đọc 1 overview doc rồi tự suy ra runtime đã tồn tại

## 4. Fast reading protocol

### Nếu task là repo-wide orientation

Đọc:

- `design/01-repo-constitution/DECISIONS.md`
- `design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md`
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

### Nếu task là backend hoặc API

Đọc:

- `design/01-repo-constitution/DECISIONS.md`
- `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
- `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md`
- `design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md`
- `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md`
- `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
- `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

### Nếu task là web hoặc Next.js page

Đọc:

- `design/01-repo-constitution/DECISIONS.md`
- `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
- `design/02-platform-baseline/web-runtime/REACT_RUNTIME_POLICY.md`
- `design/04-execution-overlay/web/PAGE_INVENTORY.md`
- `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`
- `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md`
- `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`

### Nếu task là admin

Đọc:

- `design/01-repo-constitution/DECISIONS.md`
- `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
- `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
- `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
- `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`

### Nếu task là domain behavior

Đọc theo domain đang chạm:

- `design/03-domains/<domain>/DECISIONS.md`
- `design/03-domains/<domain>/MODULE_MAP.md`
- `design/03-domains/<domain>/CONTRACTS.md`
- `design/03-domains/<domain>/USE_CASES/*` liên quan trực tiếp

Chỉ đọc `STATES/*` hoặc `REFERENCES/*` khi flow thật sự cần.

### Nếu task là debugging, version drift, hoặc “latest stack”

Đọc:

- `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md`
- `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md`
- `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`

## 5. Phase and scope guardrails

Phase 1 baseline phải đọc từ `DECISIONS.md`, không suy từ memory.

Current practical rule:

- `apps/web + apps/api + apps/admin` là launch direction
- `NestJS + Prisma + Postgres + Caddy` là current approved baseline
- `Meilisearch` được phép bật sớm vì PMTL đang chốt `Search-first launch`, nhưng vẫn phải có `SQL fallback`
- `Valkey`, `BullMQ`, `apps/worker`, `outbox`, `PgBouncer`, Prometheus/Grafana, tracing vẫn là deferred or dormant lanes cho tới khi trigger docs cho phép
- `pgvector` là explicit exclusion, không được “tiện tay thêm”

## 6. Implementation truth rule

`design/` không phải bằng chứng rằng runtime đã tồn tại.

Muốn claim một thứ là implemented, phải map được sang artifact thật như:

- route/controller hoặc runtime surface cụ thể
- service/module cụ thể
- schema or persistence artifact cụ thể
- verification hoặc runtime behavior kiểm chứng được

Owner file cho chuyện này là:

- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

## 7. Before you code

Trước khi scaffold hoặc sửa code, AI phải tự check:

1. task đang chạm lane nào
2. file owner nào là source of truth
3. item đó mới là `design-ready`, `implementation-ready`, hay chỉ là planned
4. route/DTO/page contract đã có row trong execution overlay chưa
5. verification mạnh nhất cho lane này là gì

Nếu chưa trả lời được 5 câu đó, tiếp tục đọc docs trước khi code.

## 8. Prompt shortcut for agents

Có thể dùng prompt mở đầu ngắn như sau:

> Read `design/AI_ENTRYPOINT.md` first. Then read `design/01-repo-constitution/DECISIONS.md`, `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`, and only the owner docs for the lane you are changing. Do not treat overview docs as authority. Do not assume design means runtime exists; check `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` before claiming implementation.

## 9. Minimal owner set to keep in mind

Nếu chỉ còn thời gian đọc vài file, ưu tiên nhớ 4 file này:

- `design/AI_ENTRYPOINT.md`
- `design/01-repo-constitution/DECISIONS.md`
- `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

Chúng không đủ để code mọi thứ, nhưng đủ để tránh đa số hallucination nguy hiểm.
