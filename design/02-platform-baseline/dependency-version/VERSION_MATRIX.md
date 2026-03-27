# Version Matrix

File này chốt `version/runtime policy entrypoint` cho PMTL.

Nó phải trả lời rõ 3 câu:

1. repo hiện đang cài gì thật (`installed truth`)
2. app chưa scaffold thì design pin là gì (`design pin`)
3. đọc official docs nào cho đúng version

Authority chi tiết vẫn thuộc:

- [DEPENDENCY_GOVERNANCE.md](../../02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md)
- [NEST_FEATURE_ADOPTION_MATRIX.md](../../02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md)
- [NESTJS_11_ADOPTION.md](../../02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md)
- [DECISIONS.md](../../01-repo-constitution/DECISIONS.md)

## Truth labels

- `installed truth` = version có mặt trong repo manifest hiện tại
- `design pin` = version line đã khóa cho app/runtime chưa scaffold hoặc chưa có manifest
- `activation-time pin` = chỉ khóa line khi feature optional-scale được bật thật

Không được đọc `design pin` như thể package đã được cài trong repo hiện tại.

## Workspace reality at audit time

Audit tại thời điểm này:

- repo root có `package.json`
- chưa có `apps/web/package.json`
- chưa có `apps/admin/package.json`
- chưa có `apps/api/package.json`

Vì vậy:

- Node/pnpm/root dev tooling có `installed truth`
- web/admin/api framework versions hiện là `design pin`, chưa phải installed runtime truth

## Audit timestamp

- queried on `2026-03-25` via npm registry metadata and official upstream release channels
- intent của pass này là khóa `exact current stable pins` cho scaffold/design, không giả vờ repo đã cài các package đó

## Runtime baseline

| Concern | Status | Baseline | Source |
|---|---|---|---|
| Node.js | installed truth | `>=20.18.0` | [package.json](../../../package.json) |
| pnpm | installed truth | `10.30.3` | [package.json](../../../package.json) |
| TypeScript | installed truth | `5.9.2` root toolchain | [package.json](../../../package.json) |
| Node.js recommended scaffold pin | design pin | `24.14.1` LTS line | [nodejs.org/download/releases](https://nodejs.org/en/download/releases/) |
| pnpm recommended scaffold pin | design pin | `10.33.0` | [pnpm.io/installation](https://pnpm.io/installation) |

## Web baseline

| Concern | Status | Baseline | Official docs |
|---|---|---|---|
| Next.js | design pin | `16.2.1` | [nextjs.org/docs](https://nextjs.org/docs) |
| React | design pin | `19.2.4` | [react.dev](https://react.dev/) |
| React DOM | design pin | `19.2.4` | [react.dev](https://react.dev/) |
| Zod | design pin | `4.3.6` | [zod.dev](https://zod.dev/) |
| TanStack Query | design pin | `5.95.2` | [tanstack.com/query/latest](https://tanstack.com/query/latest) |
| React Hook Form | design pin | `7.72.0` | [react-hook-form.com/docs](https://react-hook-form.com/docs) |
| Tailwind CSS | design pin | `4.2.2` | [tailwindcss.com/docs](https://tailwindcss.com/docs) |

React official paths to prefer for behavior questions:
- compiler + adoption: [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler)
- purity: [react.dev/learn/keeping-components-pure](https://react.dev/learn/keeping-components-pure)
- effects discipline: [react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)
- effect dependency semantics: [react.dev/learn/removing-effect-dependencies](https://react.dev/learn/removing-effect-dependencies)
- custom hooks: [react.dev/learn/reusing-logic-with-custom-hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- browser restore + bfcache behavior: [web.dev/back-forward-cache](https://web.dev/back-forward-cache/)
- document speculation rules: [developer.mozilla.org/docs/Web/API/Speculation_Rules_API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)

Zod official paths to prefer for behavior questions:
- intro + basic usage: [zod.dev](https://zod.dev/)
- release notes: [zod.dev/v4?id=release-notes](https://zod.dev/v4?id=release-notes)
- migration guide: [zod.dev/v4/changelog](https://zod.dev/v4/changelog)
- formatting errors: [zod.dev/error-formatting](https://zod.dev/error-formatting)
- metadata and registries: [zod.dev/metadata](https://zod.dev/metadata)
- JSON Schema: [zod.dev/json-schema](https://zod.dev/json-schema)
- codecs: [zod.dev/codecs](https://zod.dev/codecs)

## Admin baseline

| Concern | Status | Baseline | Official docs |
|---|---|---|---|
| Vite | design pin | `8.0.2` | [vite.dev/guide](https://vite.dev/guide/) |
| React | design pin | `19.2.4` | [react.dev](https://react.dev/) |
| TanStack React Router | design pin | `1.168.3` | [tanstack.com/router/latest](https://tanstack.com/router/latest) |
| TanStack React Table | design pin | `8.21.3` | [tanstack.com/table/latest](https://tanstack.com/table/latest) |

## API baseline

| Concern | Status | Baseline | Official docs |
|---|---|---|---|
| NestJS core/common/platform-express | design pin | `11.1.17` | [docs.nestjs.com](https://docs.nestjs.com/) |
| `@nestjs/config` | design pin | `4.0.3` | [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration) |
| `@nestjs/swagger` | design pin | `11.2.6` | [docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction) |
| `@nestjs/throttler` | design pin | `6.5.0` | [docs.nestjs.com/security/rate-limiting](https://docs.nestjs.com/security/rate-limiting) |
| `@nestjs/terminus` | design pin | `11.1.1` | [docs.nestjs.com/recipes/terminus](https://docs.nestjs.com/recipes/terminus) |
| Prisma CLI | design pin | `7.5.0` | [prisma.io/docs](https://www.prisma.io/docs) |
| `@prisma/client` | design pin | `7.5.0` | [prisma.io/docs](https://www.prisma.io/docs) |
| Zod | design pin | `4.3.6` | [zod.dev](https://zod.dev/) |
| Pino | design pin | `10.3.1` | [getpino.io](https://getpino.io/) |
| `nestjs-pino` | design pin | `4.6.1` | [github.com/iamolegga/nestjs-pino](https://github.com/iamolegga/nestjs-pino) |
| `@scalar/nestjs-api-reference` | design pin | `1.1.4` | [guides.scalar.com/scalar/scalar-api-references/integrations/nestjs](https://guides.scalar.com/scalar/scalar-api-references/integrations/nestjs) |

## Optional scale baseline

| Component | Status | Baseline | Official docs |
|---|---|---|---|
| Valkey | activation-time pin | `9.0.3` | [valkey.io](https://valkey.io/) |
| BullMQ | activation-time pin | `5.71.1` | [docs.bullmq.io](https://docs.bullmq.io/) |
| Meilisearch | activation-time pin | `1.40.0` | [meilisearch.com/docs](https://www.meilisearch.com/docs) |
| PgBouncer | activation-time pin | `1.25.1` | [pgbouncer.github.io](https://www.pgbouncer.org/) |
| Prometheus | activation-time pin | `3.10.0` | [prometheus.io/docs](https://prometheus.io/docs/) |
| Grafana | activation-time pin | `12.4.1` | [grafana.com/docs](https://grafana.com/docs/) |
| Alertmanager | activation-time pin | `0.31.1` | [prometheus.io/docs/alerting/latest/alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) |
| OpenTelemetry Collector | activation-time pin | `0.148.0` | [opentelemetry.io/docs](https://opentelemetry.io/docs/) |
| `@opentelemetry/api` | activation-time pin | `1.9.0` | [opentelemetry.io/docs/languages/js](https://opentelemetry.io/docs/languages/js/) |
| `@opentelemetry/sdk-node` | activation-time pin | `0.213.0` | [opentelemetry.io/docs/languages/js](https://opentelemetry.io/docs/languages/js/) |
| `redis` (`node-redis`) | activation-time pin | follow activation-time latest stable when Valkey lane opens | [redis.io/docs/latest/develop/clients/nodejs](https://redis.io/docs/latest/develop/clients/nodejs/) |
| pgvector | excluded | excluded until reconsideration trigger | [pgvector.org](https://pgvector.org/) |

## Version-specific behavior locks

- NestJS:
  - current design pin bám `11.1.17`
  - route semantics bám Express v5 behavior qua [NESTJS_11_ADOPTION.md](../../02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md)
- Next.js:
  - app-router, cache, metadata, and route behavior phải đọc version-matched docs trước khi scaffold
- Prisma:
  - design pin là `7.5.0`, nhưng chưa có installed manifest trong `apps/api`; không được giả định generator/runtime setup đã tồn tại
  - official paths nên ưu tiên:
    - PostgreSQL quickstart / add to existing project
    - Upgrade to v7
    - Prisma schema overview
    - Prisma Client setup + database connections
    - Migrate
    - query optimization / performance
- OpenTelemetry:
  - OTEL dùng docs official paths sau làm baseline khi lane được activate:
    - What is OpenTelemetry / Observability primer
    - Context propagation
    - Traces / Metrics / Logs
    - Resources
    - Sampling
    - JavaScript -> Node.js / Instrumentation
    - Collector -> Quick start / Configuration / Receivers / Processors / Exporters
    - Handling sensitive data / Collector configuration / Collector hosting
  - JavaScript logs lane hiện chưa là PMTL baseline authority; pino structured logs vẫn thắng
- Node / TypeScript:
  - repo root hiện vẫn giữ installed truth cũ hơn recommended scaffold pins
  - nếu muốn nâng root toolchain, phải đi qua dependency-governance pass riêng; không tự nâng lẫn vào feature scaffold

## Rules

- Không dùng `latest` như một lý do đủ để nâng version.
- Không dùng prerelease trên production runtime path nếu không có doc ngoại lệ rõ.
- Boundary-critical packages phải giữ sync theo [DEPENDENCY_GOVERNANCE.md](../../02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md).
- Nếu docs/framework thay đổi behavior quan trọng, cập nhật owner docs trước rồi mới scaffold/code.
- Khi repo chưa có package manifest cho một app:
  - dùng `design pin` để thiết kế/scaffold
  - không claim runtime installed truth cho app đó
