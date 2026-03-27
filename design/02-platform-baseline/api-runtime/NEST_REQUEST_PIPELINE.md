# NEST_APPLICATION_BASELINE

File này chốt `application architecture` của `apps/api` trước khi viết code.
Nếu chưa thống nhất các điểm ở đây, không nên bắt đầu scaffold hàng loạt.

## Stack decision

- framework: `NestJS`
- ORM: `Prisma`
- runtime validation: `Zod`
- logger: `Pino` qua `nestjs-pino`
- API contract surface: `Swagger / OpenAPI`
> **Zod 4 runtime owner**: `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md`
> **Error envelope owner**: `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md`

### NestJS 11 scaffold stance

- baseline scaffold line: `NestJS 11.1.17`
- HTTP platform baseline: `platform-express`
- bootstrap baseline: `NestFactory.create(AppModule)`
- route syntax phải bám Nest 11 + Express v5 semantics
- `ConsoleLogger` không phải logging authority; chỉ chấp nhận bootstrap fallback rất sớm nếu logger module chưa dựng xong
- `NestFactory.create(AppModule, { bufferLogs: true })` + `app.useLogger(app.get(Logger))` là bootstrap canon cho logger authority
- exact version pin owner: [VERSION_MATRIX.md](../../02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- feature-status owner: [NEST_FEATURE_ADOPTION_MATRIX.md](../../02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md)
- Nest 11 nuance owner: `design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md`

## Không dùng làm mặc định

- `class-validator` + class DTO decorators làm validation baseline
- exception shape tùy hứng theo từng controller
- logger rời rạc bằng `console.*`
- tạo `PinoLogger`/`pino()` instance rời rạc ngoài DI như một authority thứ hai
- business logic trong controller

## Request pipeline mặc định

1. request-id / correlation middleware
2. proxy / client-ip resolution middleware
3. `pino-http` request context binding / auto request log
4. auth guard nếu route cần auth
5. role/permission guard nếu route cần authz
6. rate-limit guard nếu route thuộc protected surface
7. `ZodValidationPipe` cho params/query/body
8. controller mỏng gọi service
9. service xử lý business logic + persistence
10. global exception filter chuẩn hóa error envelope
11. response logging / metrics capture

## Middleware discipline

- middleware chỉ dùng cho pre-routing / transport concern, ví dụ:
  - request-id / correlation id
  - trusted proxy / client IP resolution
  - raw request/body handling khi thật sự cần
  - cookie/session precondition ở mức transport
  - lightweight request logging bootstrap path
- middleware không được giữ:
  - authz decision theo route metadata
  - business validation
  - business policy
  - cross-module lookup
  - canonical error-envelope mapping
- middleware không biết route metadata như guard/interceptor, nên mọi rule phụ thuộc handler context phải nằm ở guard/pipe/interceptor/service thay vì middleware
- functional middleware hợp lệ cho lane không cần DI
- middleware cần DI hoặc route scoping rõ phải đi qua `NestModule.configure()` + `MiddlewareConsumer`
- global `app.use()` chỉ dùng cho functional middleware thật sự đơn giản; không lấy nó làm baseline cho lane cần DI

### Middleware anti-patterns

- middleware tự làm role/permission check
- middleware tự verify business permission theo route
- middleware tự query database để attach domain entity như default pattern
- middleware tùy tiện overwrite response/error shape
- middleware chặn request nhưng không trả response và cũng không `next()`

## Validation decision

- boundary validation mặc định dùng `Zod`
- mọi request DTO, query, params, env contract, webhook payload đều phải có schema `Zod`
- schema nghiệp vụ nên đăng ký tập trung qua Zod registry/metadata để giảm việc viết lại cùng contract cho validation, docs, và internal tooling
- nếu cần sinh JSON Schema/OpenAPI, ưu tiên derive từ registry/schema chuẩn thay vì viết source of truth thứ hai
- formatting/normalization của validation error phải bám helper top-level của Zod 4; không lấy deprecated instance helpers làm baseline mới
- nếu cần OpenAPI sync:
  - route contract phải được map rõ từ schema sang docs
  - không dùng decorator DTO riêng chỉ để tạo ra source of truth thứ hai
- nếu OpenAPI surface lớn, Nest Swagger CLI plugin chỉ được dùng để giảm decorator boilerplate ở transport/documentation layer; business schema vẫn phải bám Zod contract

### Contract generation discipline

- chuẩn tối thiểu cho mỗi use-case write/public route:
  - `request schema`
  - `response schema`
  - `error code mapping`
  - `OpenAPI operation id`
- không copy cùng field list vào 3 nơi khác nhau chỉ để phục vụ:
  - runtime validation
  - Swagger/OpenAPI
  - admin/client form rendering
- nếu một surface chỉ là admin/reference-data CRUD, có thể generate transport/form layer từ contract registry
- auth, sessions, moderation decisions, outbox, search sync, và canonical publish flows không được dựa vào generated CRUD để thay business policy

### Contract reuse rule

- ưu tiên một chuỗi contract duy nhất: `Prisma model / domain shape -> Zod schema -> Nest route contract -> OpenAPI surface`
- không được để `apps/api`, `apps/web`, và `apps/admin` mỗi nơi tự viết lại cùng một request/response schema bằng tay nếu có thể chia sẻ ở `packages/shared`
- các schema chia sẻ phải đại diện cho boundary contract; không được export thẳng Prisma persistence model ra public clients
- nếu route cần cả runtime validation lẫn docs, ưu tiên helper/pattern chung để map từ Zod sang Nest/OpenAPI thay vì lặp decorator thủ công ở từng controller
- registry/schema dùng chung nên sống ở `packages/shared` hoặc workspace boundary tương đương; controller/service không tự giữ bộ field list riêng nếu web/admin cũng dùng lại schema đó

## Configuration discipline

- config authority của `apps/api` là `@nestjs/config` + repo env contract, không phải `process.env` đọc rải rác
- root app shell phải có một `ConfigModule.forRoot(...)` owner rõ cho:
  - env file strategy
  - validation strategy
  - namespaced config loading
  - cache/lookup behavior
- env contract chuẩn của PMTL vẫn do `design/04-execution-overlay/repo/ENV_INVENTORY.md` + `common/config/config.schemas.ts` owner, không do Nest docs sample tự quyết
- validate env bằng `Zod` tại bootstrap là baseline của PMTL; không đổi sang Joi/class-validator-first chỉ vì Nest docs có ví dụ
- runtime env phải override `.env` file nếu cùng key; đây là behavior mặc định cần được coi là canonical
- `validationSchema` hoặc sample validator của `ConfigModule.forRoot(...)` không được hiểu sai là đã validate mọi custom/namespaced config object; custom config factory vẫn phải tự validate/transform object nó trả ra.
- feature/module-specific config được phép dùng namespaced config hoặc `forFeature()`, nhưng:
  - key namespace phải rõ owner
  - không đọc chéo config module khác theo kiểu ngẫu hứng
  - nếu có dependency init order, phải dùng `onModuleInit()` hoặc startup ordering doc thay vì constructor assumption
- `ConfigService` injection là hợp lệ, nhưng không được biến mỗi service thành nơi tự parse/cast/fallback env theo ý riêng
- config getter/facade chuyên biệt là hợp lệ nếu nó giảm lặp và giữ typed access rõ
- `cache: true` của ConfigModule là optimization hợp lệ khi dùng `process.env` lookup nhiều, nhưng không thay đổi source-of-truth rules
- `skipProcessEnv` chỉ dùng khi owner doc thật sự muốn ép đọc từ config object đã load; không bật bừa
- YAML/custom file config chỉ hợp lệ khi thật sự cần grouping/readability hơn `.env`, và phải có asset-copy rule rõ trong build path

### Configuration anti-patterns

- đọc `process.env` trực tiếp trong controller/service khắp codebase
- mỗi module tự parse số/boolean/url theo cách riêng
- đổi sang Joi validation vì docs có sẵn ví dụ, làm lệch baseline Zod của repo
- dùng `isGlobal: true` cho ConfigModule rồi bỏ luôn owner doc về namespace/loading rules
- dựa vào constructor timing của `forFeature()` config thay vì lifecycle-safe path khi module init order còn bất định

## Pipe discipline

- pipe có 2 việc hợp lệ trong PMTL:
  - transform transport input đơn giản
  - validate boundary input trước khi controller chạy
- boundary validation authority vẫn là `ZodValidationPipe`
- built-in Parse* pipes được phép dùng chọn lọc cho primitive/simple transport cases:
  - `ParseIntPipe`
  - `ParseBoolPipe`
  - `ParseUUIDPipe`
  - `ParseEnumPipe`
  - `DefaultValuePipe`
  - `ParseDatePipe` khi semantics ngày giờ đã rõ ở owner doc
- global pipe nếu cần DI phải đi qua provider registration (`APP_PIPE`), không dựng ngoài module context rồi kỳ vọng inject sạch
- method/param-scoped pipe được ưu tiên khi route có transform đặc thù mà không đáng nâng thành global rule
- custom pipe được phép nếu nó vẫn là transport-layer primitive rõ ràng

### Pipe anti-patterns

- dùng `class-validator` / decorator DTO làm validation baseline thay cho Zod contract
- viết entity-loading pipe kiểu `UserByIdPipe` query DB rồi nhét business lookup vào transport layer như default pattern
- để pipe tự quyết business defaults mà owner contract chưa chốt
- biến pipe thành nơi normalize payload phức tạp, map DTO, hay gọi cross-module services
- global pipe tự đổi error shape khác global exception filter
- pipe parse thành công nhưng route contract/documentation không phản ánh transformed type

## Guard decision

- authn:
  - JWT access token + refresh rotation
  - browser flow ưu tiên cookie transport an toàn
- authz:
  - role guard sau auth guard
  - policy-level check chi tiết nằm trong service hoặc policy helper, không nhét hết vào controller
- rate limit:
  - guard riêng cho auth/search/write/upload surfaces

## Authorization discipline

- authorization của PMTL đi theo guard + policy helper + owner matrix, không theo middleware guesswork
- `PERMISSION_MATRIX.md` là owner canon cho role scope; Nest guard chỉ là execution mechanism
- metadata-driven guard (`@Roles`, `@RequirePermissions`, `Reflector`) là hợp lệ nếu nó bám permission canon của repo
- CASL hoặc claims-based pattern chỉ là optional implementation technique; không phải baseline phase 1 mặc định
- guard có thể đọc metadata route/class, nhưng business ownership check chi tiết vẫn có thể cần service/policy helper ở dưới

### Authorization anti-patterns

- hardcode role string rải rác trong controller/service mà không bám permission matrix
- coi CASL là mandatory baseline chỉ vì docs có ví dụ
- để guard tự query chéo nhiều module cho business decision phức tạp
- lẫn authn và authz thành một guard mơ hồ không có owner boundary rõ

## Controller discipline

- controller chỉ làm 4 việc:
  - map route
  - lấy input qua decorator transport (`@Param`, `@Query`, `@Body`, `@Headers` khi thật sự cần)
  - gọi service/provider owner
  - trả response contract đã chuẩn hóa
- controller không được giữ business policy, transaction orchestration, hoặc cross-module composition mù
- response mode mặc định là standard Nest response handling:
  - return object/array/primitive
  - để Nest serialize + cho interceptor/filter hoạt động đầy đủ
- `@Res()` không phải baseline
  - chỉ cho phép `@Res({ passthrough: true })` nếu route cần set cookie/header mà vẫn giữ standard response flow
  - không dùng `@Res()` full-control chỉ để code giống Express cũ
- `@Req()` chỉ dùng khi thật sự cần request-level detail như raw request metadata; không lạm dụng nếu đã có decorator hẹp hơn
- DTO transport không được trở thành source of truth thứ hai tách khỏi Zod contract
- không dùng host/subdomain routing ở controller làm baseline phase 1; host split đi qua Caddy/proxy layer, Nest giữ path ownership rõ

## Custom decorator discipline

- custom param decorator được phép dùng để làm route handler gọn và rõ hơn, ví dụ:
  - `@CurrentUser()`
  - `@CurrentUser('userId')`
  - `@Public()`
  - `@RequireRole(...)` hoặc auth composition decorator tương đương nếu project thật sự cần
- custom decorator chỉ nên:
  - đọc request context đã được guard/middleware attach sẵn
  - expose metadata/transport concern rõ ràng
  - compose nhiều decorator hay dùng cùng nhau
- custom decorator không được:
  - tự verify JWT
  - tự query database
  - tự làm authz decision phức tạp
  - tự sanitize/validate business payload thay cho Zod pipe
  - giấu side effects hoặc cross-module call
- `createParamDecorator` hợp lệ cho route ergonomics, nhưng returned data phải bám canonical request context shape
- nếu custom decorator cần pipe, đó vẫn là transport-layer concern; source of truth cho contract vẫn là Zod schema và owner doc
- `applyDecorators()` được phép cho composition như auth policy/readability helper, nhưng:
  - không gom quá nhiều behavior mơ hồ thành “magic decorator”
  - không che mất route security contract đang thực sự áp dụng
  - không dùng composition để tạo source of truth thứ hai cho OpenAPI/security policy

### Custom decorator anti-patterns

- `@User()` decorator tự parse token rồi attach user
- decorator đọc thẳng Prisma/repository
- decorator tên mơ hồ như `@AuthContext()` nhưng trả shape không ổn định giữa route này và route khác
- decorator composition nhồi cả guard + policy + docs + side effect mà không có owner contract rõ

### Controller anti-patterns

- fat controller tự validate `if/else`
- controller tự viết transaction
- controller gọi thẳng Prisma hoặc repository của module khác
- controller tự map exception shape riêng
- controller tự derive field list/pagination/filter semantics trái owner doc

## Error contract

### Error envelope mặc định

```json
{
  "error": {
    "code": "auth.invalid_credentials",
    "message": "Thông điệp an toàn cho client",
    "status": 401,
    "requestId": "req_123",
    "details": {}
  }
}
```

### Rules

- mọi error response phải có:
  - `code`
  - `message`
  - `status`
  - `requestId`
- không lộ stack trace cho client production
- validation errors phải trả field-level details an toàn
- auth errors phải tránh enumeration

## Exception filter discipline

- global exception filter là authority cuối cho HTTP error envelope của PMTL
- filter phải chuẩn hóa response về envelope canon thay vì để mỗi route/guard/pipe tự trả shape khác nhau
- route/service nên ưu tiên throw built-in HTTP exception hoặc app error chuẩn; filter chịu trách nhiệm map về response envelope + log context khi cần
- nếu cần DI trong global filter, đăng ký qua `APP_FILTER`, không dùng `app.useGlobalFilters(new ...)` như baseline chính
- filter có thể dùng `HttpAdapterHost` để giảm phụ thuộc platform-specific object khi hợp lý
- `BaseExceptionFilter` được phép extend nếu mục tiêu là giữ hành vi mặc định của Nest rồi chỉ thêm PMTL-specific logging/mapping
- built-in `HttpException` hoặc custom exception kế thừa từ nó vẫn phải quy về `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md` nếu route đã có owner code
- `cause`/inner error dùng cho log/diagnostics, không được lộ nguyên ra client

### Exception filter anti-patterns

- method-scoped/controller-scoped filter tự bẻ error envelope riêng cho một route family mà không có owner doc
- filter trả raw stack / raw driver error / raw Prisma error ra client
- bắt mọi exception rồi đổi hết thành `500` hoặc một message generic làm mất canonical error code
- dùng filter để che business policy đáng lẽ phải ném đúng exception từ service/guard/pipe
- platform-specific filter code bị copy-paste khắp module thay vì có global owner path rõ

## Interceptor discipline

- interceptor chỉ dùng cho cross-cutting concern có chủ đích, ví dụ:
  - response mapping/serialization nhẹ
  - request timing / metrics hook
  - timeout boundary
  - idempotency helper hoặc logging helper mức transport
- interceptor không phải nơi giữ:
  - authn/authz policy
  - business validation
  - canonical error envelope authority
  - transaction orchestration
  - cross-module business composition
- global interceptor nếu cần DI phải đăng ký qua provider (`APP_INTERCEPTOR`), không dựng bằng `app.useGlobalInterceptors(new ...)` rồi mong inject dependency hoạt động sạch
- response mapping trong interceptor chỉ hợp lệ khi route vẫn đi theo standard Nest response handling; không dùng `@Res()`-mode cho cùng lane
- exception mapping bằng interceptor chỉ dùng cho transport/runtime adaptation có chủ đích; không được overwrite business error code một cách mù
- stream overriding/caching bằng interceptor không phải baseline phase 1; chỉ dùng khi owner doc đã khóa cache semantics và invalidation contract

### Interceptor anti-patterns

- global transform interceptor tự quấn mọi response vào shape mới khi error/data contract đã được owner doc chốt nơi khác
- timeout interceptor apply bừa lên mọi route dù route có streaming/upload semantics riêng
- catchError interceptor nuốt business exception rồi đổi hết thành `BadGateway`
- cache interceptor chặn handler mà không có owner invalidation policy
- nhét audit/business side effect vào interceptor để “đỡ sửa service”

## Logging decision

- dùng `Pino` cho toàn bộ app
- mọi log phải có structured context tối thiểu:
  - `requestId`
  - `route`
  - `actorUserId` nếu có
  - `module`
  - `action`
- không log password, raw token, secret, raw refresh token
- không coi `ConsoleLogger({ json: true })` là thay thế cho `nestjs-pino`

## Logging discipline

- Nest system logging và app logging phải hội tụ về cùng structured logger path
- bootstrap có thể dùng buffer/fallback ngắn, nhưng steady-state authority vẫn là provider logger của app
- custom logger qua `LoggerService` là hợp lệ khi cần hook Nest system logs vào cùng structured pipeline
- `app.useLogger(...)` chỉ được dùng sau khi logger provider singleton đã sẵn sàng; không tạo logger instance rời rạc thứ hai
- log level/filtering phải đi qua config owner, không hardcode ở từng module
- nếu một thư viện như Terminus cần logger riêng, logger đó vẫn phải phục vụ chung structured logging policy của repo

### Logging anti-patterns

- để Nest system logs và app logs chạy hai format/context khác nhau
- tạo custom logger nhưng không đi qua DI/config owner
- dùng `console` hoặc raw `Logger` lẫn lộn với `nestjs-pino` như hai authority ngang hàng
- log request body/headers nhạy cảm vì “dev tiện debug”

## OpenAPI discipline

- OpenAPI artifact authority của `apps/api` là `@nestjs/swagger`, nhưng contract authority vẫn là Zod + owner docs
- Swagger decorators là transport/documentation layer, không được trở thành source-of-truth thứ hai
- `SwaggerModule.createDocument()` và `SwaggerModule.setup()` là runtime delivery mechanism hợp lệ cho dev/staging docs
- `documentFactory = () => SwaggerModule.createDocument(...)` là bootstrap path hợp lệ để trì hoãn document generation; không cần eager-create document nặng ở startup nếu chưa cần serve docs ngay.
- OpenAPI security scheme phải bám auth transport thật của PMTL, không copy bearer-only sample nếu browser flow đang là cookie-first
- `Mapped Types` chỉ dùng khi chúng không làm mờ owner DTO/schema semantics
- CLI plugin / decorator helpers chỉ là boilerplate reduction tool, không thay owner contract review
- availability của Swagger UI/raw docs phải đi qua env/security decision rõ:
  - dev/staging có thể bật UI
  - production có thể chỉ để raw JSON/YAML hoặc tắt hoàn toàn
  - không assume `/api` docs UI luôn được public chỉ vì sample docs mặc định làm vậy

### OpenAPI anti-patterns

- generated Swagger nhìn đẹp nhưng route/error schema drift khỏi owner doc
- bearer auth annotate toàn app dù browser flow thực tế là cookie + CSRF
- expose `/api/docs` ở production mà không có owner security decision rõ
- dùng mapped types để suy ra DTO business semantics mà không có owner row trong tracking docs

## File upload discipline

- file upload baseline của PMTL bám `@nestjs/platform-express` + Multer vì phase 1 đã chốt Express platform.
- Multer chỉ xử lý `multipart/form-data`; không coi nó là generic body parser cho mọi upload edge.
- upload route phải đi qua:
  - interceptor phù hợp (`FileInterceptor`, `FilesInterceptor`, `FileFieldsInterceptor`)
  - file validation pipe/validator rõ ràng
  - storage owner service/module ở dưới
- upload validation tối thiểu phải kiểm:
  - mime/type allowlist
  - size limit
  - required/optional semantics
  - count limit nếu multi-file
- Multer defaults nên owner ở platform/storage bootstrap qua module config; route-level override chỉ dùng khi use-case thật sự khác.
- phase 1 không dual-support Fastify upload semantics; docs/sample Fastify lane không phải baseline PMTL.

### File upload anti-patterns

- controller tự parse multipart payload bằng tay
- coi filename/originalname từ client là trusted
- dùng `AnyFilesInterceptor` như default shortcut cho mọi upload route
- mở upload route mà không có size/type/count guard rõ
- để controller ghi thẳng disk/storage path logic thay vì đi qua storage owner

## Testing seam discipline

- unit tests của `apps/api` phải ưu tiên `TestingModule` + mock provider seam; không mở DB connection thật nếu test không cần integration depth đó.
- repository/model/provider phụ thuộc external runtime phải được mock qua custom provider token thay vì kéo cả module graph mù.
- controller tests chỉ xác nhận:
  - route wiring
  - validation/guard/filter integration ở mức cần thiết
  - response shape hẹp
- service tests là nơi xác nhận business orchestration và dependency interactions.
- integration tests mới được chạm DB/runtime thật, và phải có fixture/bootstrap owner rõ.

### Testing anti-patterns

- unit test import cả `AppModule` chỉ để test một service
- test service nhưng vẫn kéo Prisma/DB/network thật vì chưa có provider seam
- đợi tới e2e mới phát hiện validation/error-envelope drift

## NestJS 11 transport and framework notes

- `plainToClass` không được dùng trong code mới; dùng `plainToInstance`
- `setGlobalPrefix()` exclusions không dùng `RegExp` làm baseline
- query parser stance phải được chốt rõ ở bootstrap; không để implicit framework default quyết định contract query của PMTL
- `IntrinsicException` chỉ dùng khi thật sự cần skip framework auto-log cho infra-level path; không dùng để làm silent business error
- `ParseDatePipe` được phép dùng như transport helper, nhưng không thay boundary validation bằng `Zod`
- built-in cache / microservices / OTEL surfaces của Nest 11 chỉ được activate khi phase trigger tương ứng của PMTL đã đạt

## Prisma safety defaults

- Prisma client nên bật **global `omit`** cho các field nhạy cảm như `passwordHash`, `refreshTokenHash`, `resetTokenHash` nếu model có các field này
- Query local có thể dùng `omit` thay vì `select` khi mục tiêu là loại một vài field nhạy cảm khỏi payload
- Bật `strictUndefinedChecks` để chặn query nguy hiểm với `undefined`
- TypeScript config phải bật `exactOptionalPropertyTypes` để hỗ trợ rule trên ở compile time
- Khi `strictUndefinedChecks` bật, code phải dùng `Prisma.skip` thay vì truyền `undefined` vào query data/where object
- Không để mapper/controller tự tin rằng field nhạy cảm đã bị loại nếu Prisma query chưa `omit` hoặc `select` rõ

## Prisma integration discipline

- Prisma là persistence baseline duy nhất của phase 1
- `PrismaService extends PrismaClient` là integration pattern hợp lệ, nhưng Prisma access phải đi qua owner data layer/provider thay vì rải thẳng khắp controllers
- Prisma bootstrap/lifecycle phải tôn trọng startup order, shutdown hooks, và health readiness
- không import ORM recipes khác chỉ vì docs/docs.md liệt kê chúng
- Prisma config phải bám config owner; connection string/limits không được hardcode trong module
- repository/service layer được quyền bọc Prisma để giữ domain boundary, transaction helper, omit/select policy, và typed query reuse

### Prisma anti-patterns

- controller inject PrismaService trực tiếp như default path
- mỗi module tự tạo PrismaClient riêng
- dùng Prisma recipe sample như architecture authority thay owner docs của repo
- để migration/DDL assumptions lẫn vào runtime service code

## Prisma concurrency / transaction policy

- read-modify-write flows như refresh rotation, reset-password revoke-all, assisted-entry dedupe, và moderation decision có side effects phải dùng transaction pattern rõ
- nếu flow cần custom logic giữa các query, ưu tiên interactive transaction
- với transaction có khả năng conflict cao:
  - cân nhắc `Serializable`
  - retry hữu hạn khi Prisma trả conflict/deadlock tương đương `P2034`
- các aggregate dễ race nên có version/timestamp guard rõ để hỗ trợ optimistic concurrency control thay vì overwrite mù
- retry logic không copy-paste theo từng service; nên có helper chuẩn kiểu `runTransactionalWithRetry()` nhận:
  - isolation level
  - retry budget
  - retryable Prisma codes
  - structured log context
- không được viết logic auth/session theo kiểu read ngoài transaction rồi update rời rạc nếu invariants có thể bị race

### Prisma extension rule

- technical repetition trong data layer nên ưu tiên gom bằng Prisma Client `$extends` thay vì copy-paste helper ở mọi repository/service
- extension hợp lệ cho PMTL_VN:
  - common `omit/select` policy cho field nhạy cảm
  - result mapper nhẹ cho canonical DTO nội bộ
  - query/client helper thuần kỹ thuật như actor scoping hoặc audit metadata attach
- không nhét business policy vào Prisma extension; moderation decision, auth authority, publish policy vẫn phải nằm ở module service
- nếu một extension ảnh hưởng nhiều module, nó phải có tên rõ và sống tập trung ở `common/prisma/extensions/`

### Typed SQL rule

- với query SQL-first nhưng khó diễn đạt sạch bằng Prisma query builder, ưu tiên một lớp SQL typed tập trung thay vì rải `queryRaw` string khắp service
- use case điển hình:
  - search fallback query phức tạp
  - reporting/admin aggregation
  - migration-time verification query
- nếu dùng Prisma TypedSQL, chỉ cho phép đặt query ở thư mục tập trung như `apps/api/prisma/sql/` và import qua wrapper rõ ràng
- không dùng raw SQL string inline ở controller/service nếu query còn được tái dùng hoặc cần test lại nhiều lần
- TypedSQL chỉ nên bật khi Prisma version thực tế trong repo support nó; nếu chưa bật được thì vẫn phải giữ nguyên tắc tập trung raw SQL thay vì copy-paste

### Generated resource boundary

- chỉ dùng Nest resource/CRUD scaffolding cho:
  - reference data nội bộ
  - admin CRUD không có workflow phức tạp
  - lookup/read-only catalogs
- cấm dùng generated CRUD làm baseline cho:
  - auth/session
  - moderation decisions
  - storage lifecycle
  - outbox/admin redrive
  - search reindex/sync
  - publish/unpublish flows

### Transaction helper rule

- các flow có mẫu `load -> validate -> write -> audit -> optional downstream handoff` nên đi qua helper chung hoặc service utility, không copy-paste retry loop ở từng module
- helper transaction chỉ được che giấu phần kỹ thuật lặp lại:
  - retry budget
  - backoff
  - audit append in-transaction
  - mapping error code chuẩn
- helper transaction không được nuốt business decision; validation/policy vẫn thuộc module service

## Idempotency boundary rule

- mọi write route có nguy cơ double-submit hoặc network retry phải khai báo rõ có dùng:
  - natural key dedupe
  - `sourceRef`
  - hoặc `Idempotency-Key` / `idempotencyKey`
- nên có interceptor/service chung cho idempotency records thay vì mỗi module tự phát minh cách lưu riêng
- phase 1 có thể lưu idempotency record ở Postgres; phase 2+ mới cân nhắc chuyển sang Valkey khi contention đủ lớn
- không dùng idempotency như cách che giấu bug write-path; nó chỉ bảo vệ retry/double-submit, không thay thế transaction correctness

## Module anatomy

Mỗi module backend tối thiểu nên có:

- `controller`
- `service`
- `schemas` hoặc `dto` theo hướng Zod contract
- `policy/guard helper` nếu module có authz phức tạp
- `repository` hoặc Prisma-facing data layer khi query đủ lớn để tách

## Provider discipline

- provider mặc định là singleton; không bật request scope nếu chưa có lý do rõ như per-request cache hay tenant context đặc thù
- service là business authority của module; repository/provider kỹ thuật không được cướp business policy
- cross-module read phải đi qua exported query provider rõ ràng, không inject thẳng repository nội bộ của module khác
- provider async chỉ dùng cho config/bootstrap/infrastructure wiring thật sự cần await
- không tạo `CommonService`, `BaseService`, hoặc util provider mơ hồ không có owner module
- policy helper, mapper, query facade, transaction helper đều là provider hợp lệ nếu boundary của chúng rõ và testable
- constructor injection là mặc định; property-based injection chỉ là ngoại lệ khi inheritance/framework constraint làm constructor path thật sự khó đọc
- custom provider token (`useClass`, `useValue`, `useFactory`, `useExisting`) là hợp lệ cho infra/config integration, nhưng token phải có tên rõ và owner rõ
- `@Optional()` chỉ dùng khi dependency thật sự optional theo contract; không dùng để che wiring bug
- manual instantiation / `ModuleRef` lookup chỉ dùng cho bootstrap/dynamic runtime case thật sự cần; không lấy làm default application pattern
- provider state nội bộ nếu có phải được cân nhắc kỹ vì singleton là mặc định; không được vô thức giữ mutable state làm source of truth tạm thời

### Provider anti-patterns

- service vừa là controller surrogate vừa là repository surrogate
- inject chéo 2 service của 2 module rồi dùng `forwardRef()` như mặc định
- nhét side effects ngoài transaction vào helper provider rồi coi như đã an toàn
- shared provider import ngược từ `apps/*` vào `packages/shared`
- property injection dùng đại trà dù constructor injection rõ hơn
- `@Optional()` trên dependency bắt buộc chỉ để app boot qua
- `ModuleRef.get()` / manual lookup bị dùng như service locator cho business flow

## Module discipline

- `AppModule` là root composition shell của phase 1; không dùng standalone bootstrap thay cho root module
- mỗi domain module phải có owner boundary rõ:
  - controller chỉ expose HTTP surface của module đó
  - service giữ business rules của module đó
  - repository/data layer chỉ chạm persistence owner hoặc exported query path hợp lệ
- platform modules (`sessions`, `audit`, `feature-flags`, `rate-limit`, `storage`, `health`, `metrics`) là runtime authority dùng chung; domain module không được copy lại capability của chúng
- module chỉ export những provider được phép dùng từ ngoài; controller không export
- module imports phải tối thiểu và có chủ đích; import một module chỉ để lấy một helper nhỏ là mùi kiến trúc
- nếu 2 module cần giao tiếp 2 chiều:
  - ưu tiên event/outbox
  - hoặc tách contract/token rõ
  - không coi `forwardRef()` là baseline solution
- module re-export chỉ dùng khi nó thật sự làm rõ public interface của layer/platform bundle; không dùng để tạo “mega core module” che mất dependency graph
- `@Global()` không phải baseline; chỉ chấp nhận cho infra/config-style module có ubiquity thật và owner rationale rõ
- dynamic module (`forRoot`, `forRootAsync`, tương đương) chỉ nên dùng cho infrastructure/configurable integration:
  - config
  - logger
  - database/connection style modules
  - external client integration có options rõ
- dynamic module không phải cách mặc định để lách owner boundary của domain module
- module class có thể inject provider cho config/setup hẹp, nhưng module class không phải business service và không được dùng như injection surface chung

### Module anti-patterns

- module theo folder/UI surface thay vì owner boundary
- import cả module khác chỉ để đọc một bảng
- tạo “shared module” phình to thành nơi nhét mọi thứ không biết đặt đâu
- để auth/session nằm nửa ở `identity`, nửa ở module khác mà không có platform owner rõ
- lạm dụng `@Global()` để khỏi phải import/export cho tử tế
- dùng dynamic module cho domain feature chỉ để nhìn “enterprise” hơn

## Cross-module communication (Bug 1 fix: chống circular dependency)

### Nguyên tắc bất biến

- **Không import toàn bộ module khác** để dùng 1 service.
- Module A cần data từ Module B → B phải **export rõ ràng** 1 query service interface, A inject qua DI.
- **Không có module nào import lẫn nhau** (circular). Nếu 2 modules cần nhau → tách shared interface ra `packages/shared` hoặc dùng event.

### Pattern cho phép

```
✅ Calendar inject WisdomQueryService (Wisdom-QA export)
✅ Moderation inject ContentQueryService (Content export)
✅ Search nhận SearchDocumentDto từ source module qua direct call
✅ Notification inject từ bất kỳ module nào qua exported interface
```

### Pattern CẤM

```
❌ Calendar import WisdomQaModule vào imports[] → circular risk
❌ Module A gọi Module B qua internal repository (bypass service layer)
❌ Module tự query DB table thuộc module khác
❌ Shared package import từ apps/* (ngược chiều)
```

### Khi cần bidirectional communication

- Dùng **event pattern** (phase 1: inline sync, phase 2+: outbox)
- Hoặc tách interface vào `packages/shared/src/contracts/`
- Ref: `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` cho event nào đi outbox

---

## Audit transaction enforcement (Bug 2 fix: audit phải block write-path)

### Nguyên tắc bất biến

- **Audit PHẢI nằm trong cùng database transaction** với canonical write.
- Nếu audit fail → toàn bộ transaction rollback → write không xảy ra.
- Không có trường hợp nào write thành công mà audit bị mất.

### Pattern bắt buộc

```typescript
// ĐÚG — audit trong cùng transaction
await prisma.$transaction(async (tx) => {
  const entity = await tx.post.create({ data: payload });
  await tx.auditLog.create({
    data: {
      eventType: 'content.post.created',
      actorUserId,
      targetId: entity.id,
      // ...
    },
  });
  return entity;
});
```

### Pattern CẤM

```typescript
// SAI — audit ngoài transaction, có thể fail mà write vẫn xảy ra
const entity = await prisma.post.create({ data: payload });
await auditService.append({ ... }); // ← fire-and-forget, swallowed exception
```

### Khi nào được fire-and-forget audit

- **Không bao giờ** cho write-path (create, update, delete, role change, auth event).
- Chỉ được fire-and-forget cho **read-heavy analytics** không ảnh hưởng tới business integrity (ví dụ: view count).

### AuditService contract

```typescript
interface AuditService {
  // Dùng trong transaction — nhận Prisma transaction client
  appendInTransaction(tx: PrismaTransactionClient, event: AuditEvent): Promise<void>;

  // Dùng ngoài transaction — chỉ cho read analytics
  appendAsync(event: AuditEvent): void; // fire-and-forget, có structured log
}
```

- Mọi use-case có ghi `audit event` trong danh sách mandatory events (`design/04-execution-overlay/api/AUDIT_POLICY.md`) PHẢI dùng `appendInTransaction`.
- Ref: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` phần "Audit events bắt buộc"

---

## Non-negotiables

- controller mỏng
- standard Nest response handling là mặc định; `@Res()` chỉ là ngoại lệ có chủ đích
- service giữ business logic
- provider singleton-by-default; request-scope chỉ theo exception đã ghi rõ
- persistence không leak thẳng ra public DTO
- không tạo source of truth thứ hai giữa Zod schema và DTO decorator model
- module imports/exports phải thể hiện owner boundary rõ, không circular theo thói quen
- mọi launch-blocker flow phải map vào [implementation-mapping.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)
- cross-module communication phải qua exported service interface, không import toàn bộ module
- audit mandatory events phải trong cùng DB transaction với write
