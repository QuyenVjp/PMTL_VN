# OTEL_IMPLEMENTATION_CANON

File này chốt `implementation canon` cho lane OpenTelemetry của PMTL.
Mục tiêu: khi scaffold tracing, AI không được bịa bootstrap, collector pipeline, hay propagation rules theo cảm tính.

> Observability owner: `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md`
> API implementation owner: `design/04-execution-overlay/api/APPS_API_IMPLEMENTATION_CANON.md`
> BullMQ owner: `design/04-execution-overlay/repo/BULLMQ_IMPLEMENTATION_CANON.md`
> Env owner: `design/04-execution-overlay/repo/ENV_INVENTORY.md`

---

## Activation boundary

- OTEL là `dormant optional-scale lane`.
- chỉ activate khi trigger trong `OBSERVABILITY_ARCHITECTURE.md` đã đạt.
- phase 1 và `Search-first launch` không được kéo OTEL vào hot path chỉ vì “trông enterprise hơn”.

## Root shape

```txt
apps/api/
  src/platform/telemetry/
    telemetry.module.ts
    otel.bootstrap.ts
    otel.config.ts
    otel.resource.ts
    otel.instrumentation.ts
    otel.propagation.ts
    otel.sampling.ts
    otel.redaction.ts

apps/worker/
  src/platform/telemetry/
    telemetry.module.ts
    otel.bootstrap.ts
    otel.resource.ts
    otel.instrumentation.ts

infra/otel/
  otelcol.config.yaml
  dashboards/
  README.md
```

Rules:

- không trộn OTEL bootstrap vào `main.ts` thành khối dài khó kiểm soát.
- không nhét collector config vào `infra/docker/` như file rời vô chủ.
- không để mỗi app tự phát minh resource attributes riêng.

## SDK bootstrap canon

- `@opentelemetry/sdk-node` là Node SDK authority.
- `BatchSpanProcessor` là baseline processor cho app runtime.
- app bootstrap phải init telemetry trước khi app code chính bắt đầu nhận request/job.
- nếu app dùng Node ESM/import-preload lane, OTEL preload path phải có owner rõ; không để `NODE_OPTIONS` tự phát triển tùy máy dev.

Rules:

- `apps/api` và `apps/worker` có file bootstrap tách riêng.
- bootstrap helper phải no-op sạch khi `OTEL_ENABLED=false`.
- không được tạo tracer provider thứ hai trong domain modules.

## Resource canon

- `service.name` là bắt buộc và phải set rõ; không được để `unknown_service`.
- resource baseline:
  - `service.name`
  - `service.version`
  - `deployment.environment.name`
  - `service.namespace=pmtl`
- env-driven attributes đi qua `OTEL_RESOURCE_ATTRIBUTES` hoặc owner config helper; không hardcode rải rác.

Rules:

- `apps/api` service name và `apps/worker` service name phải khác nhau nhưng cùng namespace.
- resource detector mặc định bắt đầu tối thiểu; chỉ bật host/container/k8s/cloud detector khi deployment context thật sự cần.

## Propagation canon

- W3C TraceContext là default propagation format.
- cross-service boundary nội bộ:
  - web -> api: request headers
  - api -> worker: queue metadata/correlation fields phải carry `traceparent` hoặc owner-approved equivalent
  - api -> internal callbacks/webhooks: chỉ propagate khi service đó thuộc trust boundary của PMTL
- baggage không là baseline feature của PMTL.

Rules:

- không propagate baggage chứa PII, credentials, tokens, hay doctrinal/member-private notes.
- external/public-facing outbound calls có thể strip trace headers theo owner policy; không mặc định đẩy nội bộ trace context ra ngoài trust boundary.

## Instrumentation canon

- auto-instrumentation ưu tiên cho:
  - incoming HTTP server spans
  - outgoing HTTP client spans
  - Prisma/database spans
  - BullMQ producer/consumer spans khi queue lane active
- manual spans chỉ thêm ở owner boundaries:
  - audit append
  - storage upload pipeline
  - search engine fallback/sync
  - outbox dispatch/redrive

Rules:

- không span hóa mọi service method nhỏ.
- span names phải bám owner vocabulary, ví dụ:
  - `auth.login`
  - `search.query`
  - `storage.upload`
  - `outbox.dispatch`
- attribute thêm sau span creation chỉ khi thật sự chưa biết lúc tạo span.

## Sampling canon

- default activation cho PMTL là `head sampling 100%`.
- chỉ mở `TraceIdRatioBasedSampler` khi volume/chi phí buộc phải giảm dữ liệu.
- tail sampling là collector concern, không phải app concern.

Rules:

- app SDK không tự phát minh sampling logic theo route/module.
- nếu collector tail sampling bật, phải có dashboard + alert cho dropped/decision pressure.

## Logs relationship canon

- Pino structured logs vẫn là log authority.
- OTEL JS logs không là baseline của PMTL hiện tại vì lane JavaScript logs còn development-level.
- trace/log correlation phải inject `traceId` và `spanId` vào structured logs hiện có; không thay pino bằng OTEL logging pipeline.

## Collector canon

Expected pipeline shape:

```txt
otlp receiver
  -> memory_limiter
  -> batch
  -> optional filter/redaction
  -> exporter(s)
```

Rules:

- Collector là proxy nhận/process/export telemetry; không phải observability backend.
- chỉ include receivers/processors/exporters thật sự dùng.
- collector config phải dùng env expansion cho secrets/endpoints khi cần.
- collector không bind public rộng; ưu tiên localhost hoặc Docker-internal service address.
- dev-local collector trên localhost hoặc Docker-internal network được phép dùng plaintext OTLP.
- production transport phải dùng TLS/mTLS khi collector ra khỏi trusted local network.

## Sensitive-data canon

- data minimization là baseline.
- cấm đưa vào spans, attributes, baggage, resources, logs bridge:
  - password
  - refresh/access token
  - API keys
  - CSRF token
  - email raw nếu owner policy chỉ cho hash
  - doctrinal/private practice notes
  - member progress details không được public

Rules:

- scrub/filter/redaction processor là collector owner path cuối, không thay thế app-side redaction.
- app instrumentation phải tránh collect sensitive payload ngay từ đầu.

## Must-exist artifacts before activation

- `apps/api/src/platform/telemetry/*`
- `infra/otel/otelcol.config.yaml`
- env validation for OTEL vars
- log correlation path tested
- rollback path documented
- Grafana/trace UI datasource owner documented

## Must-not-do list

- dùng OTEL như lý do mở microservice split sớm
- gửi telemetry trực tiếp từ browser/member app sang collector làm baseline
- bật baggage như metadata bus chung
- coi collector là nơi sửa toàn bộ dữ liệu bẩn do app emit bừa
- mix nhiều propagation format nếu chưa có owner exception
- rải `trace.getTracer()` trực tiếp khắp codebase không qua owner helper
