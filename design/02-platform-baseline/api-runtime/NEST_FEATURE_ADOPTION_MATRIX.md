# NEST_FEATURE_ADOPTION_MATRIX

## Purpose

File này chốt `adoption status` cho các surface NestJS xuất hiện trong [docs.md](../../../docs/docs.md).

Mục tiêu:

- AI không phải tự suy từ trí nhớ xem feature nào của Nest nên dùng
- feature nào của Nest đã có owner doc thì đọc đúng owner
- feature nào chưa phải baseline thì bị chặn sớm, không được scaffold bừa

## Scope

- `apps/api`
- NestJS HTTP baseline của PMTL
- phase `phase_1` làm chuẩn; phase sau chỉ mở khi có trigger rõ

## Authority

- `required`

## Phase

- `all`

## Version basis

- NestJS baseline: `11.1.17`
- exact version pins: [VERSION_MATRIX.md](../../02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- source checklist: [docs.md](../../../docs/docs.md)

## Status vocabulary

- `adopted`: dùng như baseline PMTL
- `restricted`: dùng được nhưng theo rule hẹp, không được freestyle
- `deferred`: chưa phải phase_1 baseline; chỉ mở khi owner docs cho phép
- `excluded`: không phải direction hiện tại của PMTL
- `reference-only`: được đọc để hiểu framework, nhưng không phải policy owner hay scaffold target

## Fundamentals

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| Controllers | `adopted` | controller mỏng, không giữ business authority | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Providers | `adopted` | constructor injection mặc định; tránh service locator | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Modules | `adopted` | boundary theo domain/platform; không shared/global bừa | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Middleware | `restricted` | chỉ pre-routing / transport concern | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Exception filters | `adopted` | global error envelope authority ở filter layer | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Pipes | `adopted` | boundary validation + simple transport transform only | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Guards | `adopted` | auth/authz owner ở guard layer | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Interceptors | `restricted` | chỉ cross-cutting transport concerns | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Custom decorators | `restricted` | chỉ dùng khi tăng clarity như `@Public()` / role metadata / request helpers | [CANONICAL_DECORATORS.md](../../02-platform-baseline/api-runtime/CANONICAL_DECORATORS.md) |

## Dependency / runtime internals

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| Custom providers | `adopted` | token/factory/value providers hợp lệ nếu owner rõ | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Asynchronous providers | `restricted` | dùng cho config/client bootstrap; không làm business indirection | [NEST_INTERNALS_POLICY.md](../../02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md) |
| Dynamic modules | `restricted` | chỉ cho infra/configurable integration, không cho domain sugar | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Injection scopes | `restricted` | singleton mặc định; request scope chỉ cho case thật sự cần | [NEST_INTERNALS_POLICY.md](../../02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md) |
| Circular dependency | `restricted` | tránh bằng boundary/export/event pattern; không normalize `forwardRef()` bừa | [NEST_INTERNALS_POLICY.md](../../02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md) |
| Module reference | `restricted` | chỉ cho bootstrap/dynamic lookup thật sự cần | [NEST_INTERNALS_POLICY.md](../../02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md) |
| Lazy-loading modules | `deferred` | chưa có lợi ích rõ cho phase_1 HTTP baseline | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |
| Execution context | `adopted` | dùng cho generic guards/filters/interceptors, nhưng không lạm dụng | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Lifecycle events | `restricted` | chấp nhận cho bootstrap/shutdown hooks; side effect nghiệp vụ vẫn đi service/job rõ ràng | [NEST_INTERNALS_POLICY.md](../../02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md) |
| Discovery service | `deferred` | chưa cần cho phase_1; dễ kéo sang meta-magic | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |
| Platform agnosticism | `reference-only` | PMTL phase_1 pin Express; không cố giữ abstraction giả | [NESTJS_11_ADOPTION.md](../../02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md) |

## Techniques

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| Configuration | `adopted` | `@nestjs/config` + Zod env validation authority | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Database | `reference-only` | Nest generic DB chapter không phải owner; PMTL pin Prisma | [VERSION_MATRIX.md](../../02-platform-baseline/dependency-version/VERSION_MATRIX.md) |
| Mongo | `excluded` | không phải baseline hiện tại | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| Validation | `adopted` | Zod-first boundary validation; không lấy class-validator làm canon | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Caching | `deferred` | chưa phải phase_1 baseline ngoài cache topology policy | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |
| Serialization | `deferred` | explicit mapper/projection policy thắng serializer magic | [SERIALIZATION_POLICY.md](../../02-platform-baseline/api-runtime/SERIALIZATION_POLICY.md) |
| Versioning | `deferred` | phase_1 chưa cần API versioning layer | [API_VERSIONING_POLICY.md](../../02-platform-baseline/api-runtime/API_VERSIONING_POLICY.md) |
| Task scheduling | `deferred` | chỉ mở khi background jobs được activate | [TASK_SCHEDULING_POLICY.md](../../02-platform-baseline/api-runtime/TASK_SCHEDULING_POLICY.md) |
| Queues | `deferred` | BullMQ là optional-scale, không phải phase_1 mặc định | [OBSERVABILITY_ARCHITECTURE.md](../../02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md) |
| Logging | `adopted` | `nestjs-pino` là logger authority | [OBSERVABILITY_ARCHITECTURE.md](../../02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md) |
| Cookies | `restricted` | cookie-first browser auth contract, không biến thành auth authority độc lập | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Events | `deferred` | có taxonomy/outbox policy nhưng chưa bật event-driven runtime rộng | [EVENT_MODEL_POLICY.md](../../04-execution-overlay/cross-module/EVENT_MODEL_POLICY.md) |
| Compression | `deferred` | chưa phải baseline phase_1 | [TRANSPORT_RUNTIME_POLICY.md](../../02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md) |
| File upload | `adopted` | upload boundary phải đi qua security hardening + storage contract | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Streaming files | `restricted` | dùng khi response contract cần; không bypass security headers/cache rules | [API_ROUTE_INVENTORY.md](../../04-execution-overlay/api/API_ROUTE_INVENTORY.md) |
| HTTP module | `restricted` | dùng qua facade/service wrapper, support cancellation | [TRANSPORT_RUNTIME_POLICY.md](../../02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md) |
| Session | `adopted` | cookie/session transport support, nhưng auth authority vẫn ở domain/session contract | [manage-auth-session.md](../../03-domains/identity/USE_CASES/manage-auth-session.md) |
| Model-View-Controller | `excluded` | PMTL không dùng Nest MVC/templating làm baseline | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| Performance (Fastify) | `excluded` | phase_1 pin Express | [NESTJS_11_ADOPTION.md](../../02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md) |
| Server-Sent Events | `deferred` | chưa có owner use case phase_1 | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |

## Security

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| Authentication | `adopted` | session-cookie baseline, refresh rotation, audit/rate-limit | [manage-auth-session.md](../../03-domains/identity/USE_CASES/manage-auth-session.md) |
| Authorization | `adopted` | metadata-driven guards hợp lệ, policy authority vẫn ở permission matrix | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Encryption and Hashing | `restricted` | dùng cho auth/secrets paths có owner; không biến thành utility zoo | [CRYPTO_POLICY.md](../../02-platform-baseline/security-runtime/CRYPTO_POLICY.md) |
| Helmet | `adopted` | security headers là baseline edge/runtime policy | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| CORS | `adopted` | explicit allowlist, không default-open | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| CSRF Protection | `adopted` | cookie-first browser flow phải có CSRF contract | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Rate limiting | `adopted` | Nest throttler baseline; exact limits owner ở readiness/security docs | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |

## Excluded architecture lanes

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| GraphQL | `excluded` | không phải current repo direction | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| WebSockets | `excluded` | chưa có owner use case; không scaffold sẵn | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| Microservices | `excluded` | phase_1 không tách transport/microservice topology | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| Standalone apps | `excluded` | `AppModule` shell vẫn là baseline | [NESTJS_11_ADOPTION.md](../../02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md) |
| Serverless | `excluded` | không phải deploy baseline hiện tại | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |

## Tooling / recipes / operational docs

| Nest surface | PMTL status | PMTL stance | Owner doc |
|---|---|---|---|
| CLI / Workspaces / Libraries / Scripts | `reference-only` | monorepo owner là repo structure + package manager docs, không phải Nest CLI canon | [REPO_STRUCTURE.md](../../01-repo-constitution/REPO_STRUCTURE.md) |
| SWC (fast compiler) | `deferred` | chỉ mở khi build pain thật sự xuất hiện | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |
| Passport (auth) | `excluded` | current auth baseline không dùng Passport-first mental model | [manage-auth-session.md](../../03-domains/identity/USE_CASES/manage-auth-session.md) |
| Router module | `reference-only` | route canon owner là overlay inventory, không phải Nest router trick | [API_ROUTE_INVENTORY.md](../../04-execution-overlay/api/API_ROUTE_INVENTORY.md) |
| Swagger / OpenAPI | `adopted` | runtime artifact from Nest decorators, but owner contract stays in docs + Zod | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Health checks | `adopted` | exact endpoint contract already locked | [HEALTH_CONTRACT.md](../../02-platform-baseline/api-runtime/HEALTH_CONTRACT.md) |
| Prisma recipe | `adopted` | Prisma là DB baseline của PMTL | [PRISMA_SCHEMA_PLAN.md](../../04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md) |
| Sentry | `deferred` | không phải baseline hiện tại | [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) |
| Async local storage | `deferred` | chỉ mở khi request-context demands rõ hơn logger context hiện tại | [ASYNC_LOCAL_STORAGE_POLICY.md](../../02-platform-baseline/deploy-ops/ASYNC_LOCAL_STORAGE_POLICY.md) |
| HTTP adapter | `restricted` | trust proxy / adapter detail chỉ dùng khi infra/security cần | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Keep-Alive connections | `deferred` | chưa là blocker phase_1 | [TRANSPORT_RUNTIME_POLICY.md](../../02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md) |
| Global path prefix | `restricted` | hợp lệ nhưng phải khớp docs/OpenAPI/route canon | [API_ROUTE_INVENTORY.md](../../04-execution-overlay/api/API_ROUTE_INVENTORY.md) |
| Raw body | `restricted` | chỉ bật cho webhook/signature paths thật sự cần | [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md) |
| Hybrid application | `excluded` | không phải direction hiện tại | [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) |
| HTTPS & multiple servers | `reference-only` | HTTPS owner ở edge delivery; không dùng Nest multi-server as baseline | [TRANSPORT_RUNTIME_POLICY.md](../../02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md) |
| Request lifecycle | `reference-only` | đọc để hiểu order, nhưng policy thật nằm ở pipeline docs | [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md) |
| Common errors / Migration guide / Devtools / API reference | `reference-only` | useful for verification and upgrade work, not policy owner | [COMMON_ERRORS_RUNBOOK.md](../../02-platform-baseline/api-runtime/COMMON_ERRORS_RUNBOOK.md) |

## Must

- khi một feature Nest được dùng trong code, nó phải map được sang row ở file này
- nếu row là `restricted`, code/scaffold phải bám owner doc tương ứng
- nếu row là `deferred` hoặc `excluded`, không được tự scaffold chỉ vì docs Nest có ví dụ

## Must not

- không dùng `docs/docs.md` như policy owner trực tiếp
- không kéo feature từ `reference-only` thành baseline mà không cập nhật matrix này
- không đánh đồng “Nest có feature” với “PMTL cho dùng feature đó”

## Review trigger

Update file này khi có một trong các việc sau:

- nâng major/minor Nest baseline
- mở thêm transport/runtime lane như GraphQL, WebSockets, queue worker, SSE
- đổi auth/session model
- đổi DB/runtime baseline
