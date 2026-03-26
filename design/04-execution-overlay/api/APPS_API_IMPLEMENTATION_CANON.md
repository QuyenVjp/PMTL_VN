# APPS_API_IMPLEMENTATION_CANON

File này chốt `implementation canon` cho `apps/api`.
Mục tiêu: khi AI scaffold `NestJS`, nó biết phải đặt file vào đâu, bootstrap gì trước, và không được bịa thêm authority lane mới.

> Pipeline owner: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
> Scaffold order: `design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md`
> Route canon: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
> DTO canon: `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`
> Error canon: `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md`

---

## Root shape

```txt
apps/api/
  src/
    main.ts
    app.module.ts
    common/
    platform/
    modules/
    test/
  prisma/
    prisma.config.ts
    schema.prisma
    migrations/
    sql/
```

Rules:

- `apps/api` là backend authority duy nhất.
- không tạo `src/utils/` kiểu bãi rác làm authority phụ.
- không tạo `common/common.service.ts` hay `helpers.ts` mơ hồ rồi nhét business logic vào đó.

## Bootstrap canon

### Must exist from first scaffold

```txt
src/main.ts
src/app.module.ts
src/common/config/
src/common/logging/
src/common/errors/
src/common/validation/
src/common/guards/
src/common/decorators/
```

### `main.ts` minimum

- `NestFactory.create(AppModule, { bufferLogs: true })`
- `app.useLogger(app.get(Logger))`
- global prefix `/api`
- shutdown hooks enabled
- CORS/trusted proxy/client IP resolution owner rõ
- global validation/filter/guard wiring theo canon docs

### Forbidden in bootstrap

- business logic
- controller-local env parsing
- direct Prisma calls
- ad hoc `console.*`

## Common layer canon

### `common/config/`

Expected files:

```txt
common/config/config.module.ts
common/config/config.schemas.ts
common/config/config.namespaces.ts
common/config/config.service.ts
```

Rules:

- `@nestjs/config` là transport/config shell.
- env authority vẫn là Zod schema + repo env inventory.
- custom config factories phải tự validate/transform object của chúng.

### `common/logging/`

Expected files:

```txt
common/logging/logger.module.ts
common/logging/logger.config.ts
common/logging/logger.constants.ts
common/logging/logger.service.ts
```

Rules:

- `nestjs-pino` là logger authority.
- `genReqId`, redact list, serializer defaults phải owner ở đây.
- không tạo logger instance rời rạc ở module khác.

### `common/errors/`

Expected files:

```txt
common/errors/errors.module.ts
common/errors/global-exception.filter.ts
common/errors/app-error.ts
```

Rules:

- global exception filter là HTTP error-envelope authority cuối.
- route/controller không tự bẻ error shape.

### `common/validation/`

Expected files:

```txt
common/validation/validation.module.ts
common/validation/zod-validation.pipe.ts
common/validation/validation-error.mapper.ts
```

Rules:

- Zod là boundary validation authority.
- Parse* pipes chỉ là helper transport, không thay schema authority.

## Platform layer canon

Expected root:

```txt
platform/
  health/
  metrics/
  telemetry/      # only when OTEL lane active
  audit/
  feature-flags/
  rate-limit/
  storage/
  sessions/
  queue/          # only when BullMQ lane active
  valkey/         # only when Valkey lane active
  outbox/         # only when outbox lane active
```

Rules:

- `platform/*` giữ control-plane/runtime modules.
- domain modules không được tự giữ session store, audit append, feature-flag engine, hay queue bootstrap riêng.
- telemetry bootstrap, resource config, propagation, và span helpers nếu có phải ở `platform/telemetry/`; domain module không tự giữ tracer-provider/bootstrap riêng.

## Domain module canon

Expected shape per module:

```txt
modules/<domain>/
  <domain>.module.ts
  <domain>.controller.ts
  <domain>.service.ts
  dto/
  mappers/
  policies/
  repositories/
```

Rules:

- controller mỏng
- service giữ business orchestration
- repository/data helper không nhảy qua module owner khác một cách tùy tiện
- `dto/` là transport mapping layer, không được trở thành source-of-truth thứ hai tách khỏi Zod

## Provider and DI canon

- singleton-by-default
- request-scope không là baseline
- `APP_FILTER`, `APP_INTERCEPTOR`, `APP_PIPE`, `APP_GUARD` là global DI paths hợp lệ
- không dùng `app.useGlobalFilters(new ...)` hoặc `app.useGlobalInterceptors(new ...)` như authority chính khi cần DI

## OpenAPI canon

Expected owner path:

```txt
src/common/openapi/
```

Hoặc bootstrap owner tương đương trong `main.ts` nếu chưa cần folder riêng.

Rules:

- `documentFactory = () => SwaggerModule.createDocument(...)` là path chuẩn
- Swagger UI/raw docs phải env-gated
- OpenAPI artifact đi sau Zod + owner docs

## Upload canon

Expected owner path:

```txt
platform/storage/
modules/content/   # or domain owner route layer
```

Rules:

- upload route phải dùng Multer interceptor phù hợp
- file validation phải có mime/size/count rules
- storage writes đi qua storage owner service

## Test seam canon

Expected root:

```txt
src/test/
  test-app.factory.ts
  mocks/
  fixtures/
```

Rules:

- unit tests dùng `TestingModule` + mock providers
- không import cả `AppModule` chỉ để test một service
- integration tests mới chạm DB/runtime thật

## Naming canon

- module folder: kebab-case hoặc domain slug ổn định
- class: `PascalCase`
- file: `kebab-case`
- exception filter names phải mô tả vai trò thật
- logger action names phải bám owner vocabulary, không dùng `doThing`, `processStuff`

## Must-not-do list

- controller gọi thẳng Prisma
- middleware làm authz/business decisions
- custom decorator tự query DB
- class-validator/class DTO trở thành validation baseline
- mỗi module tự parse env/fallback riêng
- Swagger/public docs mở mặc định trên production
- upload path tin vào filename/mimetype do client gửi
