# NESTJS_11_ADOPTION — PMTL Scaffold Contract Before Code

File này chốt cách PMTL dùng `NestJS 11` trước khi scaffold `apps/api`.

Mục tiêu:

- không chỉ “dùng NestJS”
- mà dùng đúng `NestJS 11` theo hướng có lợi thật cho PMTL
- tránh việc AI/codegen rơi về mental model Nest cũ hoặc nhét feature mới bừa bãi

> **Framework authority**: `design/DECISIONS.md` section 14
> **App pipeline authority**: `design/baseline/nest-baseline.md`
> **Scaffold sequence authority**: `design/tracking/apps-api-scaffold-order.md`
> **Version governance authority**: `design/baseline/dependency-governance.md`

---

## 1. Exact baseline for first scaffold

### Core package set

Wave scaffold đầu tiên của `apps/api` phải pin exact line này:

| Package | Version rule | Why |
|---|---|---|
| `@nestjs/core` | `11.1.17` | canonical Nest baseline for PMTL scaffold |
| `@nestjs/common` | `11.1.17` | keep same exact line as core |
| `@nestjs/platform-express` | `11.1.17` | Phase 1 HTTP platform baseline |
| `@nestjs/config` | `11.1.17`-compatible stable | config module baseline |
| `@nestjs/swagger` | latest stable `11.x` compatible at scaffold time | OpenAPI surface |
| `nestjs-pino` | latest stable line compatible with Nest 11 | structured logging |

Rule:

- `@nestjs/core`, `@nestjs/common`, và chosen HTTP platform package phải exact-sync.
- Phase 1 chọn **Express platform** làm baseline. Không dual-support Express + Fastify ở scaffold wave đầu.

### Bootstrap shape

Scaffold mặc định vẫn là:

```ts
NestFactory.create(AppModule)
```

Không dùng standalone app bootstrap bỏ `AppModule` làm baseline PMTL.

Lý do:

- PMTL đã chốt module anatomy, platform module ordering, và app shell quanh `AppModule`
- standalone bootstrap không mang lại lợi ích cốt lõi cho current direction

---

## 2. Feature decisions — use by default

### 2.1 Express v5 route syntax discipline

Nest 11 đi với Express v5 semantics. PMTL phải chốt ngay từ đầu:

- không viết route wildcard theo mental model cũ
- không dùng optional syntax cũ kiểu `?` trong path string nếu syntax mới yêu cầu explicit pattern
- escape các ký tự route đặc biệt đúng theo Express v5 expectations

Rule:

- mọi wildcard/public catch-all route phải được review như breaking surface
- `setGlobalPrefix()` exclusions không được dựa vào `RegExp`
- nếu cần wildcard exclusion, phải dùng named wildcard pattern phù hợp với Nest 11 / Express v5

### 2.2 `app.enableShutdownHooks()` là bắt buộc

Đây đã là baseline của PMTL và phải giữ nguyên khi dùng Nest 11:

- graceful shutdown cho HTTP app
- future-safe cho Phase 2+ jobs / transport / metrics / search activation

### 2.3 `plainToInstance` thay cho API cũ

PMTL chốt:

- không dùng `plainToClass`
- mọi serializer/interceptor/helper mới phải dùng `plainToInstance`

### 2.4 Pino là logger authority, không phải ConsoleLogger

Nest 11 có cải tiến `ConsoleLogger`, nhưng PMTL vẫn chốt:

- logger authority = `Pino` qua `nestjs-pino`
- `ConsoleLogger` chỉ chấp nhận cho bootstrap fallback rất sớm nếu app chưa dựng xong logger module
- không dùng `ConsoleLogger({ json: true })` làm logging baseline

### 2.5 Vitest + SWC-friendly toolchain

PMTL chốt:

- test runner backend = `Vitest`
- không scaffold Jest làm baseline
- build/test path của `apps/api` phải ưu tiên toolchain nhanh, nhưng không được hy sinh decorator metadata hoặc OpenAPI generation

### 2.6 `IntrinsicException` policy

PMTL phải coi `IntrinsicException` là **power tool**, không phải default throw type.

Rule:

- chỉ dùng khi thật sự muốn skip auto-log behavior của framework layer
- không dùng nó để che business errors hoặc làm silent failure
- default path vẫn là error envelope chuẩn + structured log policy của PMTL

### 2.7 `HttpModule` cancellation support

Nếu `apps/api` gọi external HTTP services:

- wrapper/facade nên support request cancellation
- cancellation phải được bơm qua service boundary rõ, không để controller gọi Axios trực tiếp

### 2.8 Health path phải dùng Nest 11-compatible health API

Nếu dùng Terminus:

- ưu tiên API/shape mới phù hợp Nest 11
- không scaffold theo deprecated health indicator style cũ khi đã có replacement chính thức

---

## 3. Feature decisions — use selectively

### 3.1 `ParseDatePipe`

Được phép dùng, nhưng không phải validation baseline.

Rule:

- boundary validation chuẩn vẫn là `Zod`
- `ParseDatePipe` chỉ là helper transport-layer khi nó làm route handler rõ hơn
- không thay thế schema-level validation

### 3.2 `Reflector.getAllAndMerge()` / `getAllAndOverride()`

Được phép dùng cho authz metadata, nhưng:

- chỉ trong guard/policy layer
- phải có test cho metadata inheritance nếu dùng
- không rải logic metadata merge tùy hứng qua nhiều guard

### 3.3 `@Inject()` type narrowing

Được phép tận dụng trong infrastructure/service wiring khi làm code rõ hơn.

Không biến nó thành style bắt buộc nếu token injection thường đã rõ.

### 3.4 SSE Promise handlers

Được phép dùng nếu sau này PMTL có SSE surface thật.

Hiện tại không phải baseline phase 1.

---

## 4. Feature decisions — defer until phase trigger

### 4.1 Built-in OpenTelemetry

Nest 11 có bề mặt OTEL tốt hơn, nhưng PMTL chỉ bật khi:

- trigger trong `baseline/observability-architecture.md` đã đạt
- tracing trở thành công cụ chẩn đoán thật, không phải “cho hiện đại”

### 4.2 CacheModule → Keyv

Không dùng làm baseline Phase 1.

Lý do:

- cache runtime của PMTL còn deferred
- Phase 1 chưa bật Valkey làm cache authority

Nếu sau này activate cache:

- review lại Keyv adapter path
- không để cache module lấn át source-of-truth rules

### 4.3 Microservice transporter upgrades

Các feature như:

- `unwrap()`
- `on()`
- `status` observable
- NATS queue per-handler
- MQTT QoS per-handler
- Redis driver ID
- max packet/buffer settings

chỉ relevant khi PMTL thật sự bật transport/microservice path.

Hiện tại:

- không được kéo `@nestjs/microservices` vào Phase 1 app shell chỉ vì feature mới hay
- chỉ chốt **design readiness**: nếu sau này bật, options phải đi qua config/DI, không hardcode ở handler

### 4.4 WebSocket parser changes

Defer cho tới khi PMTL có WS surface thật.

### 4.5 MAU deploy

Không dùng.

PMTL deployment baseline vẫn là:

- Docker Compose
- Caddy
- VPS
- CI/CD theo repo docs

---

## 5. Feature decisions — explicitly not a PMTL baseline

- standalone app bootstrap bỏ `AppModule`
- `ConsoleLogger` làm logging authority
- mặc định scaffold microservices
- mặc định bật cache module vì Nest 11 hỗ trợ Keyv
- dual platform Express + Fastify từ wave đầu
- dùng Nest resource generator/CRUD generator cho auth, sessions, moderation, search sync, publish flow

---

## 6. Breaking-change guardrails for scaffold

### 6.1 Global prefix and route exclusions

Scaffold đầu tiên phải chốt:

- `global prefix = /api`
- exclusion paths không dùng `RegExp`
- wildcard path syntax tuân theo Nest 11 / Express v5

### 6.2 Query parser stance

PMTL phải chốt rõ ngay ở `main.ts`:

- nếu giữ query parser mặc định `simple`, docs/query contracts phải bám điều đó
- nếu cần nested object/array query semantics cũ, phải set explicit parser mode và document reason

Không được để behavior query parser trở thành implicit framework default mà không có owner note.

### 6.3 Middleware ordering

Vì Nest 11 làm rõ hơn global middleware ordering, PMTL phải giữ request pipeline đúng canon:

1. request-id / correlation
2. client-ip / proxy resolution
3. authn/authz/rate-limit guards
4. Zod validation
5. controller -> service
6. exception filter -> logs -> metrics

### 6.4 Lifecycle hook expectations

PMTL không được phụ thuộc vào assumption cũ về destroy order.

Rule:

- cleanup code trong sessions/storage/audit/metrics phải idempotent
- hook order không được dùng như hidden business dependency

---

## 7. Scaffold checklist additions

Trước khi coi `apps/api` scaffold-ready theo Nest 11:

- [ ] exact package set line đã được pin
- [ ] Express platform đã được chọn rõ
- [ ] route syntax policy cho Express v5 đã được note trong app shell PR
- [ ] logger policy đã chốt: Pino authority, ConsoleLogger chỉ fallback
- [ ] query parser stance đã chốt
- [ ] `plainToInstance` rule đã được ghi vào serializer/conventions
- [ ] health path dùng Nest 11-compatible approach, không scaffold từ deprecated pattern
- [ ] microservice/cache/otel features bị giữ ở `defer until triggered`, không tự active trong wave đầu

---

## 8. AI/codegen notes

Khi AI scaffold hoặc review `apps/api`:

- assume NestJS baseline = `11.1.17`
- generate Express-v5-safe route patterns
- prefer `AppModule` bootstrap
- prefer `Pino` over `ConsoleLogger`
- prefer `Zod` over decorator-validation-first DTO thinking
- do not introduce cache, microservices, CQRS, or OTEL unless the relevant PMTL trigger/doc says so
- use new NestJS capabilities when they reduce boilerplate or drift
- do not import new NestJS capabilities merely because they exist

---

## 9. Decision summary

PMTL dùng `NestJS 11` theo hướng:

- tận dụng tối đa ở `HTTP app shell`, `logger integration`, `toolchain speed`, `route correctness`, `health and shutdown discipline`
- tận dụng có chọn lọc ở `transport helpers`, `pipes`, `metadata helpers`
- cố ý chưa tận dụng ở `microservices`, `cache`, `OTEL`, `MAU deploy`, hay các path chưa có phase trigger
