# APPS_API_SCAFFOLD_ORDER (Thứ tự scaffold cho apps/api)

File này chốt `design-to-code blockers` cho riêng `apps/api`.
Mục tiêu là để lúc bắt đầu code NestJS rebuild, dev/AI biết:

- scaffold cái gì trước
- file nào phải tồn tại trước khi sang bước tiếp theo
- trap nào phải chặn ngay từ commit đầu

File này **không** nói runtime đã tồn tại. Nó chỉ chốt thứ tự dựng nền đúng theo `design/`.

> Canonical refs:
> - `baseline/repo-structure.md`
> - `baseline/platform-modules.md`
> - `baseline/nest-baseline.md`
> - `baseline/security.md`
> - `tracking/implementation-mapping.md`
> - `tracking/prisma-schema-plan.md`

---

## Scope

Chỉ áp dụng cho `apps/api`.
Không mở rộng sang `apps/web`, `apps/admin`, hay `apps/worker`, trừ khi một bước ở đây cần route contract hoặc revalidation contract để tránh scaffold sai.

---

## Non-negotiables before first scaffold

- `apps/api` là backend authority duy nhất
- auth authority = `modules/identity` + `platform/sessions`
- `Postgres` là source of truth duy nhất
- phase 1 **không** được tự ý thêm:
  - `Valkey`
  - `BullMQ`
  - `apps/worker`
  - `outbox_events`
  - `Meilisearch`
- mọi boundary runtime phải có schema rõ:
  - request/query/params
  - env
  - webhook/internal callback
  - queue payload khi phase 2+ được bật

---

## Target tree to scaffold first

```txt
apps/api/
  src/
    main.ts
    app.module.ts
    common/
      config/
      logging/
      errors/
      validation/
      guards/
      decorators/
      auth/
      http/
    platform/
      health/
      metrics/
      audit/
      feature-flags/
      rate-limit/
      storage/
      sessions/
    modules/
      identity/
      content/
  prisma/
    schema.prisma
    migrations/
```

Các domain khác có thể tạo folder sau, nhưng **không** nên scaffold controller/service hàng loạt trước khi 2 module `identity` và `content` đứng được trên baseline này.

---

## Step 0 — App shell

### Must exist

```txt
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/common/
apps/api/src/platform/
apps/api/src/modules/
apps/api/prisma/schema.prisma
```

### Minimum decisions already locked

- global prefix `/api`
- request id / correlation id path
- app bootstrap không nhét business logic
- `apps/api` giữ ownership của OpenAPI, guards, error envelope
- `app.enableShutdownHooks()` là baseline để không tự cắt ngang graceful stop path

### Do not move on until

- tree baseline khớp `baseline/repo-structure.md`
- không có `common.service.ts`, `utils/` bãi rác, hay folder mơ hồ ngoài baseline

### Common traps

- scaffold domain module trước khi có app shell
- nhét Prisma client, auth helper, và custom error lung tung vào `common/`

---

## Step 1 — Common technical baseline

### Must exist

```txt
common/config/config.module.ts
common/config/config.service.ts
common/config/config.schemas.ts

common/logging/logger.module.ts
common/logging/logger.service.ts
common/logging/logger.constants.ts

common/errors/errors.module.ts
common/errors/global-exception.filter.ts
common/errors/app-error.ts

common/validation/validation.module.ts
common/validation/zod-validation.pipe.ts
common/validation/validation-error.mapper.ts
```

Nếu route contract được chia sẻ với `apps/web` hoặc `apps/admin`, phải chốt luôn vị trí registry/schema dùng chung ở `packages/shared` trước khi scaffold controller hàng loạt.

### Why this step is first

- env phải fail fast
- logger phải có trước business flow
- error envelope phải chuẩn ngay từ route đầu tiên
- validation pipe phải có trước khi controller thật xuất hiện
- CORS + trusted proxy + client IP resolution contract phải có owner từ bootstrap này, không để đến auth/rate-limit mới vá

### Do not move on until

- env contract phase 1 map được từ `tracking/env-inventory.md`
- error envelope khớp `tracking/error-code-registry.md`
- không controller nào tồn tại mà chưa qua `ZodValidationPipe`
- `main.ts` đã có owner rõ cho CORS allowlist, trusted proxy / client IP resolution, và shutdown hooks
- validation path không vô tình leak default English message nếu API/UI đang cần Vietnamese-safe output

### Common traps

- tạo DTO/class-validator làm source of truth thứ hai
- dùng `console.*`
- để exception shape khác nhau giữa các controller

---

## Step 2 — Prisma and persistence foundation

### Must exist

```txt
prisma/schema.prisma
prisma/migrations/
common/prisma/prisma.module.ts
common/prisma/prisma.service.ts
common/prisma/extensions/
```

### First migration scope only

Tối thiểu cho wave đầu:

1. `feature_flags`
2. `audit_logs`
3. `rate_limit_records`
4. `users`
5. `sessions`
6. `media_assets`

Sau đó mới tới `posts` và content tables cần cho upload/publish path.

### Required checks before next step

- merge strategy bám `tracking/prisma-schema-plan.md`
- migration naming bám `baseline/migration-strategy.md`
- `publicId` contract thống nhất
- `users` và `sessions` không duplicate owner model từ module khác
- seed bootstrap path đã được chốt tối thiểu cho `feature_flags` và first admin/super-admin bootstrap

### Common traps

- merge toàn bộ 11 `schema.dbml` một lần rồi mới validate
- để circular FK rồi mong Prisma tự cứu
- expose `id` autoincrement ra API
- rải `queryRaw` hoặc query helper trùng lặp ở nhiều service thay vì có data-layer pattern tập trung
- để repository nào cũng tự viết lại cùng logic omit/select/result mapping thay vì gom ở Prisma extension/helper

---

## Step 3 — Platform modules that block auth and launch

### Must exist

```txt
platform/sessions/
  sessions.module.ts
  sessions.service.ts
  sessions.repository.ts
  sessions.schemas.ts

platform/storage/
  storage.module.ts
  storage.service.ts
  storage.interface.ts
  local-storage.adapter.ts
  media-assets.repository.ts
  storage.schemas.ts

platform/audit/
  audit.module.ts
  audit.service.ts
  audit.repository.ts
  audit.schemas.ts
  audit.constants.ts

platform/feature-flags/
  feature-flags.module.ts
  feature-flags.service.ts
  feature-flags.repository.ts
  feature-flags.schemas.ts

platform/rate-limit/
  rate-limit.module.ts
  rate-limit.guard.ts
  rate-limit.service.ts
  rate-limit.repository.ts
  rate-limit.schemas.ts
```

### Why before identity controllers are considered complete

- refresh rotation phụ thuộc `sessions`
- upload boundary phụ thuộc `storage`
- write-path nguy hiểm phải append audit trong transaction
- auth/search/upload/community mutation đều cần rate-limit path rõ
- feature flags phải có seed + first consumer từ sớm để không thành dead module
- `audit` phụ thuộc actor context nên phải đứng sau `sessions` ở dependency thinking, không phải module ngang hàng vô nghĩa

### Do not move on until

- `/auth/refresh` contract đã map sang `sessions + rate-limit + audit`
- `AuditService.appendInTransaction()` pattern đã được chốt trong code direction
- feature flag update path có invalidation owner rõ theo `baseline/cache-topology.md`
- storage owner không còn mơ hồ giữa `content` và `platform/storage`

### Common traps

- để `identity` tự giữ toàn bộ session persistence
- audit fire-and-forget cho write-path
- rate-limit làm “TODO” vì nghĩ phase 1 chưa cần

---

## Step 4 — Health, metrics, and startup truth

### Must exist

```txt
platform/health/
  health.module.ts
  health.controller.ts
  health.service.ts
  health.schemas.ts

platform/metrics/
  metrics.module.ts
  metrics.controller.ts
  metrics.service.ts
  metrics.constants.ts
```

### Mandatory routes

- `GET /health/live`
- `GET /health/ready`
- `GET /health/startup`
- `GET /metrics`

### Blocking invariants

- startup state bám đúng `baseline/startup-dependency-order.md`
- `/health/ready` kiểm tra được Postgres connectivity, migration status, feature flags readability, và storage readiness theo phase 1
- optional phase-2 dependencies không được chen vào baseline 11 modules

### Do not move on until

- app biết tự báo “not activated” cho optional dependencies
- health contract không còn chỗ để dev tự diễn giải khác nhau

---

## Step 5 — Identity module and first risky write-path

### Must exist

```txt
modules/identity/
  identity.module.ts
  identity.controller.ts
  identity.service.ts
  identity.schemas.ts
  identity.mapper.ts
  identity.policy.ts
```

`common/auth/` phải đủ cross-module primitives:

```txt
common/auth/
  auth.guard.ts
  roles.guard.ts
  current-user.decorator.ts
  auth-request.types.ts
```

### First routes to make real

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Blocking invariants

- refresh rotation = single canonical transaction
- replay/reuse detection có revoke path
- browser cookie transport đúng:
  - access cookie
  - refresh cookie
  - csrf cookie
- CSRF transport contract khớp `baseline/security.md`
- anti-enumeration response giữ nguyên trên login/reset/verification flows

### Do not move on until

- `manage-auth-session.md` happy paths + failure behavior map được vào code layout
- refresh rate-limit exact value đã được cắm vào implementation plan
- auth routes không bị coi là “public simple controller”

### Common traps

- đọc session ngoài transaction rồi update rời rạc
- clear cookie nhưng chưa revoke canonical session
- tách reset/revoke/audit thành nhiều path không atomic

---

## Step 6 — Storage-backed upload boundary

### First content-adjacent route allowed

- `POST /content/media/upload`
- `DELETE /content/media/:publicId`

### Blocking invariants

- MIME sniffing bằng magic bytes
- object key không dùng raw filename
- delete authorization rõ
- audit cho upload/delete
- local storage path không leak ra API contract

### Do not move on until

- upload-media-asset use-case map được vào storage + content ownership split
- asset state machine không mâu thuẫn với `baseline/storage-lifecycle.md`

---

## Step 7 — Content module: first public read + first publish path

### Must exist

```txt
modules/content/
  content.module.ts
  content.controller.ts
  content.service.ts
  content.repository.ts
  content.schemas.ts
  content.mapper.ts
  content.policy.ts
```

### First routes only

- `GET /content/posts`
- `GET /content/posts/:publicIdOrSlug`
- `POST /content/posts`
- `PATCH /content/posts/:publicId`
- `POST /content/posts/:publicId/publish`

### Blocking invariants

- publish path phải nối được:
  - content write
  - audit
  - cache/revalidation owner
  - search fallback semantics phase 1
- chưa được kéo `Meilisearch`, `outbox`, `worker` vào path này

### Phase 1 search rule at this step

- nếu cần search-related side effect:
  - SQL/index/read-model update inline hoặc fire-and-forget theo contract phase 1
  - không scaffold search-sync queue/outbox trước
  - chưa được giả định search publish side effect cần notification/search-runtime phase 2

### Do not move on until

- public published-only filtering đã khóa ở repository layer
- revalidation owner không nằm rải ở controller

---

## Step 8 — Only then consider next domain modules

Thứ tự sau `identity + content + upload boundary`:

1. `community`
2. `moderation`
3. `engagement`
4. `calendar`
5. `vows-merit`
6. `wisdom-qa`
7. `notification`
8. `search` advanced runtime

Nếu 7 bước đầu chưa đứng vững, scaffold song song phần sau chỉ làm tăng drift.

---

## Exact blockers that must be solved before broad scaffold

| Blocker | Why it blocks coding |
|---|---|
| env contract validated at boot | không có cái này thì mọi module sau đều scaffold trên cát |
| request/error/validation pipeline ổn định | route đầu tiên sẽ drift nếu chưa khóa envelope và Zod path |
| Prisma schema init cho platform + identity | auth/session/audit/rate-limit không có persistence owner |
| refresh rotation transaction policy | auth sẽ sai từ ngày đầu nếu flow này mơ hồ |
| CSRF + cookie transport contract | browser auth mutation sẽ vỡ ngầm |
| trusted proxy / client IP contract | rate-limit và audit IP sẽ sai |
| storage abstraction + upload hardening | media path là launch blocker thật |
| cache/revalidation dispatcher owner | publish path sẽ tự phát invalidation mỗi nơi một kiểu |

---

## What must NOT be scaffolded early

- `apps/worker`
- BullMQ producers/consumers
- outbox dispatcher
- Meilisearch adapter
- Valkey adapter
- PgBouncer-specific config in app layer
- pgvector anything

Nếu cần chỗ để “để dành”, chỉ được để trong `design/` hoặc `implementation-mapping.md`, không được tạo runtime artifact giả.

---

## Minimal proof before claiming apps/api scaffold is ready

- app shell + common baseline đã có file owner rõ
- Prisma đã validate với platform + identity tables trước
- auth refresh path có transaction/replay/rate-limit contract rõ
- upload boundary có storage owner rõ
- health/startup/metrics đã map đúng theo design
- content publish path chưa kéo phase 2 tech vào sớm

Nếu thiếu một trong các ý trên, trạng thái đúng là `implementation planning in progress`, chưa phải scaffold-ready.
