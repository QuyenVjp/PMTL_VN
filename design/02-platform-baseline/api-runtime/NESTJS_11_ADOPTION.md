# NESTJS_11_ADOPTION — PMTL Scaffold Contract Before Code

File này chốt cách PMTL dùng `NestJS 11` trước khi scaffold `apps/api`.

Mục tiêu:

- không chỉ “dùng NestJS”
- mà dùng đúng `NestJS 11` theo hướng có lợi thật cho PMTL
- tránh việc AI/codegen rơi về mental model Nest cũ hoặc nhét feature mới bừa bãi

> **Framework authority**: `design/01-repo-constitution/DECISIONS.md` section 14
> **App pipeline authority**: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
> **Feature adoption authority**: [NEST_FEATURE_ADOPTION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md)
> **Scaffold sequence authority**: `design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md`
> **Version governance authority**: `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md`

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

- trigger trong `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` đã đạt
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

### 4.6 Hot Reload / webpack HMR

Không dùng làm baseline phase 1.

Lý do:

- đây là dev-loop optimization, không phải production capability
- HMR của Nest docs dựa vào `webpack` path và thêm complexity vào bootstrap/watch pipeline
- docs cũng đã cảnh báo asset copy và một số static/glob patterns không tự tương thích sạch
- với PMTL hiện tại, ưu tiên watch pipeline đơn giản, ổn định, ít drift hơn trước khi tối ưu boot time

Chỉ cân nhắc bật khi:

- `apps/api` đã tồn tại thật
- boot time dev trở thành pain point rõ ràng
- đã xác nhận HMR path không phá:
  - asset handling cần thiết
  - OpenAPI generation/dev docs
  - Prisma workflow
  - logger/bootstrap behavior

Nếu sau này bật:

- xem nó như dev-only lane
- không để webpack HMR trở thành assumption của production build/deploy
- phải có owner note rõ cho `start:dev` script và watch behavior

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

---

## 7. Nest docs phase map for PMTL

Phần này khóa cách PMTL đọc catalog Nest docs thành **phase implementation policy**, không phải danh sách “đọc cho biết”.

### Phase A — Immediate scaffold baseline

Những lane này được coi là **bắt buộc** trước khi `apps/api` được scaffold nghiêm túc:

| Doc lane | PMTL stance |
|---|---|
| `Overview` | chỉ để giữ đúng mental model Nest app shell + DI; không tự bịa framework pattern riêng |
| `Controllers` | controller mỏng, standard response handling là mặc định, không `@Res()`-first |
| `Providers` | service/provider là DI building block; singleton-by-default; không request-scope bừa bãi |
| `Modules` | module là owner boundary; import/export tối thiểu; không circular-by-habit |
| `Middleware` | chỉ cho request-id, proxy/trusted-ip resolution, cookie/session preconditions và transport concerns; không nhét business logic |
| `Exception filters` | global exception filter là error-envelope authority |
| `Pipes` | `ZodValidationPipe` là boundary validation authority cho params/query/body |
| `Guards` | authn/authz/rate-limit đi qua guard layer, không nhét vào controller |
| `Configuration` | env contract phải validated at boot; fail-fast |
| `Validation` | Nest transport validation chỉ là shell; source of truth vẫn là Zod contract |
| `Logging` | logger authority là `nestjs-pino`, không phải `ConsoleLogger` |
| `Authentication` | auth flow là launch-critical; phải chốt từ scaffold wave đầu |
| `Authorization` | role/policy split phải có từ đầu vì admin/member surfaces đã design-locked |
| `OpenAPI introduction` | `apps/api` giữ OpenAPI ownership; không để docs drift sau scaffold |
| `Prisma recipe` | persistence baseline chỉ dùng Prisma, không mở ORM lane thứ hai |
| `Health checks` | `/health/live`, `/health/ready`, `/health/startup` là baseline launch truth |

Auth-specific interpretation:

- lấy từ official docs:
  - `AuthModule` / guard split
  - protected-by-default mental model
  - `APP_GUARD` + `@Public()` là option hợp lệ
- không lấy nguyên sample:
  - username/password + bearer JWT header như browser baseline
  - in-memory users service
  - hardcoded JWT secret

### Phase B — Early selective, bật khi route/platform lane chạm tới

Các lane dưới đây **không phải optional mơ hồ**. Chúng được bật sớm khi module liên quan xuất hiện, nhưng không block `main.ts + AppModule + common shell`:

| Doc lane | PMTL stance |
|---|---|
| `Interceptors` | dùng cho response/logging/cross-cutting concerns có chủ đích; không thay filter/guard/policy |
| `File upload` | bật cùng `platform/storage` và upload hardening path |
| `Cookies` | dùng cho browser auth transport; không tự biến cookie thành auth authority riêng |
| `Session` | map vào `platform/sessions`; không dùng Nest session middleware như app-state owner mơ hồ |
| `Encryption and hashing` | bật cùng auth/password/reset-token flows |
| `Helmet` | bật ở bootstrap security baseline |
| `CORS` | allowlist/trusted origin phải chốt từ bootstrap |
| `CSRF Protection` | áp dụng theo browser session/cookie flow của PMTL |
| `Rate limiting` | bật cùng `platform/rate-limit` và các protected surfaces |
| `OpenAPI security` | thêm khi auth scheme và protected routes đã đứng |
| `Async local storage` | chỉ bật khi request context propagation thực sự cần hơn request-id middleware |
| `Versioning` | chưa là baseline phase 1, nhưng là ứng viên sớm nếu public API tách consumer rõ |
| `Compression` | selective infra/perf concern; không block app shell |
| `Streaming files` | chỉ bật cho media/file delivery routes thật |
| `Task scheduling` | phase 1 chỉ dùng nếu có cron nội bộ launch-critical; không bật chỉ vì Nest có hỗ trợ |
| `Caching` | không phải phase 1 baseline; chỉ bật khi PMTL cache topology trigger đã đạt |
| `Hot Reload` | dev-only optimization; chỉ bật nếu bootstrapping/watch loop thực sự chậm và owner note đã khóa webpack/HMR tradeoff |

Session/security-specific interpretation:

- `express-session` hoặc `@fastify/secure-session` docs chỉ là framework transport reference:
  - không thay `platform/sessions` làm session authority
  - không thay refresh rotation, revoke semantics, hay audit ownership đã chốt
  - không biến in-memory/session-secret sample thành production baseline
- `CORS`, `CSRF Protection`, `Helmet`, và `Rate limiting` là framework hooks hữu ích, nhưng policy authority vẫn nằm ở:
  - `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
  - `design/04-execution-overlay/repo/CODING_READINESS.md`
  - owner modules trong `platform/*`
- `OpenAPI security` chỉ được khóa sau khi auth transport thật đã rõ:
  - browser/web-admin = cookie-first
  - automation/internal = selective bearer
  - không annotate bearer-only cho toàn app nếu runtime contract không như vậy

### Phase C — Explicitly deferred out of PMTL phase 1

Những lane này **không được chen vào scaffold đầu**:

| Doc lane | PMTL stance |
|---|---|
| `GraphQL` | không dùng |
| `WebSockets / Gateways` | deferred tới khi có realtime surface thật |
| `Microservices` (`Redis`, `MQTT`, `NATS`, `RabbitMQ`, `Kafka`, `gRPC`) | không phải phase 1 baseline |
| `CQRS` | không dùng làm default architecture |
| `Performance (Fastify)` | phase 1 dùng Express; không dual-platform |
| `Serverless` | không dùng |
| `Model-View-Controller` | không relevant cho target stack |
| `Mongoose` / `TypeORM` / `Sequelize` / `MikroORM` | không mở ORM/document DB lane thứ hai |

### PMTL interpretation rules

- docs Nest được đọc như **capability source**, nhưng project policy vẫn do `design/` chốt
- một feature có trong docs **không** tự động trở thành PMTL baseline
- nếu một lane chưa nằm trong Phase A hoặc Phase B, dev/AI phải xem nó là deferred cho tới khi owner doc kích hoạt
- nếu route/module nào muốn dùng feature Phase B hoặc C sớm hơn, phải cập nhật owner doc tương ứng trong `design/` trước
- riêng `Interceptors`:
  - không dùng làm error-envelope authority
  - không dùng để che business policy đáng lẽ nằm ở service/guard/filter
  - global response-wrap/cache/timeout chỉ hợp lệ khi route family owner đã chốt semantics tương ứng
- riêng `Pipes`:
  - parse/default pipes là transport helper tốt
  - nhưng PMTL không dùng class-validator-first flow làm baseline
  - và không khuyến khích entity-loading pipe như default Nest style vì dễ kéo DB/business lookup vào transport layer
- riêng `Exception filters`:
  - global filter là error-envelope authority
  - có thể tận dụng `HttpAdapterHost` hoặc `BaseExceptionFilter` khi cần platform-agnostic path hay partial inheritance
  - nhưng không cho phép mỗi module tự tạo JSON error schema riêng

---

## 8. Worker-assisted doc reading rule

Khi cần current-doc sanity check:

- ưu tiên official Nest docs trước
- có thể dùng external worker advisory lane:
  - `Gemini` cho latest-doc synthesis
  - `Copilot` cho mainstream implementation sanity
- external workers chỉ là advisory
- repo canon chỉ được đổi khi:
  - official Nest docs support điều đó
  - và `design/` đã được cập nhật cùng task

## 9. Lifecycle hook expectations

PMTL không được phụ thuộc vào assumption cũ về destroy order.

Rule:

- cleanup code trong sessions/storage/audit/metrics phải idempotent
- hook order không được dùng như hidden business dependency

---

## 10. Scaffold checklist additions

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

## 11. AI/codegen notes

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

## 12. Decision summary

PMTL dùng `NestJS 11` theo hướng:

- tận dụng tối đa ở `HTTP app shell`, `logger integration`, `toolchain speed`, `route correctness`, `health and shutdown discipline`
- tận dụng có chọn lọc ở `transport helpers`, `pipes`, `metadata helpers`
- cố ý chưa tận dụng ở `microservices`, `cache`, `OTEL`, `MAU deploy`, hay các path chưa có phase trigger
