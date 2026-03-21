# REPO_STRUCTURE_BASELINE (Nền tảng cấu trúc repo)

File này chốt `folder structure baseline (cấu trúc thư mục nền tảng)` cho hướng `design-first rebuild` của PMTL_VN.
Mục tiêu là để:

- `design/` không chỉ nói domain mà còn nói rõ `code nên sống ở đâu`
- solo dev và AI agent không tự đẻ thêm folder ngẫu hứng
- `apps/web + apps/api + apps/admin` có ranh giới rõ trước khi scaffold hàng loạt

Nếu file này và một file docs cũ mâu thuẫn nhau, ưu tiên file này cùng:

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md)
- [nest-baseline.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/nest-baseline.md)
- [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)

## Monorepo baseline (Nền tảng monorepo)

```txt
apps/
  web/
  api/
  admin/
  worker/           # optional phase 2+

packages/
  shared/
  ui/
  api-client/
  config/

infra/
docs/
design/
```

## Ownership by top-level folder (Quyền sở hữu theo thư mục cấp cao)

- `apps/web`
  - public frontend
  - đọc API contract từ `apps/api`
  - không giữ business authority
- `apps/api`
  - NestJS backend authority
  - auth, domain modules, platform modules, OpenAPI
  - canonical write-path và policy enforcement
- `apps/admin`
  - management UI riêng
  - chỉ gọi API, không giữ business logic
- `apps/worker`
  - optional
  - chỉ bật khi async workload đủ đáng tách khỏi request path
- `packages/shared`
  - code framework-agnostic
  - contract, schema, type, mapper thuần
- `packages/ui`
  - primitive UI dùng lại giữa web/admin nếu thật sự có lợi
- `packages/api-client`
  - generated hoặc hand-curated client từ OpenAPI/contracts
- `packages/config`
  - shared eslint/typescript/prettier/tooling config
- `infra`
  - Docker, Caddy, deploy, backup, scripts vận hành
- `docs`
  - docs triển khai, conventions, deployment, contracts, learning
- `design`
  - target architecture, baseline rules, module contracts, phase gates

## apps/web baseline

```txt
apps/web/
  src/
    app/
    features/
      auth/
      content/
      community/
      engagement/
      moderation/
      search/
      calendar/
      notification/
      vows-merit/
      wisdom-qa/
    components/
      ui/
      common/
    lib/
    proxy.ts
```

### Rules

- `src/app` chỉ giữ route, layout, metadata, page composition.
- `src/features/<domain>` là nơi chứa UI domain, API adapter, hook, mapper, local state.
- `src/lib` chỉ dành cho web cross-feature concerns:
  - env parsing
  - logger
  - fetch wrapper
  - API client bootstrap
- Không nhét business rule chuẩn gốc vào page file.
- Không để web gọi thẳng DB, search engine, hay storage backend.

## apps/api baseline

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
      community/
      engagement/
      moderation/
      search/
      calendar/
      notification/
      vows-merit/
      wisdom-qa/
  prisma/
    schema.prisma
    migrations/
```

### Rules

- `common/` giữ nền tảng kỹ thuật dùng bởi nhiều module.
- `common/auth/` chỉ giữ cross-module auth primitives: guards, decorators, strategy, request-user extraction.
- `platform/` giữ control-plane và runtime modules cắt ngang.
- `modules/` giữ domain modules theo owner đã chốt trong `design/overview/architecture-principles.md`.
- `modules/identity/` giữ auth business logic: register, login, refresh, logout, session management, password reset.
- Không tạo `shared business service` mơ hồ ở `common/`.
- Không đẩy domain logic từ `modules/*` xuống `platform/*`.

## apps/admin baseline

```txt
apps/admin/
  src/
    app/
    features/
      auth/
      dashboard/
      content/
      community/
      moderation/
      calendar/
      notification/
      vows-merit/
      wisdom-qa/
    components/
      ui/
      common/
    lib/
```

### Rules

- Admin là `custom admin UI`, không phải generated admin panel.
- Dashboard, moderation queue, editorial actions, audit views đều phải gọi `apps/api`.
- Không để admin tự giữ secret business rule hoặc bypass API contract.

## apps/worker baseline

- Không phải baseline phase 1.
- Khi bật, chỉ nên giữ:
  - worker bootstrap
  - queue consumer
  - outbox dispatcher hoặc async processors
- Không nhân bản business authority sang worker.

## packages baseline

### `packages/shared`

Chỉ cho phép:

- `contracts`
- `schemas`
- `types`
- `enums`
- `constants`
- `mappers`
- `validators`
- pure `utils`

Không cho phép:

- NestJS imports
- Next.js imports
- Prisma client trực tiếp
- browser-only APIs

### `packages/api-client`

- ưu tiên sinh từ OpenAPI hoặc contract generator
- dùng cho `apps/web` và `apps/admin`
- không chứa business policy

### `packages/ui`

- chỉ chứa reusable primitives hoặc controlled design system pieces
- tránh kéo domain component vào package này quá sớm

## API module anatomy

Mỗi module trong `apps/api/src/modules/<domain>` tối thiểu nên có:

```txt
<domain>.module.ts
<domain>.controller.ts
<domain>.service.ts
<domain>.repository.ts      # khi query đủ lớn để tách
<domain>.schemas.ts
<domain>.mapper.ts
<domain>.policy.ts          # khi authz/business policy đủ phức tạp
```

### Rules

- controller mỏng
- service giữ business logic
- repository chỉ là data access, không giữ policy
- mapper tách persistence shape khỏi API contract
- schema là runtime boundary source of truth

## Folder anti-patterns (Những cấu trúc không nên có)

- `apps/api/src/utils` làm bãi chứa chung cho mọi thứ
- `apps/api/src/services` gom toàn bộ domain vào một chỗ mơ hồ
- `apps/web/src/hooks` cho hook của mọi feature không theo domain
- `packages/shared` chứa framework runtime glue
- `apps/admin` gọi trực tiếp DB/search/storage
- `apps/worker` tự sửa canonical data mà bỏ qua owner service

## First implementation order (Thứ tự thi công đầu tiên)

1. `apps/api` baseline
2. `apps/api/src/platform/*`
3. `apps/api/src/modules/identity`
4. `apps/api/src/modules/content`
5. upload/media boundary
6. `apps/web` auth + public read surfaces
7. `apps/admin` auth + editorial dashboard
8. `community`
9. các module phase sau

## Why this matters for AI (Vì sao cái này quan trọng với AI)

- AI code tốt hơn khi `folder contract` rõ.
- Nếu không chốt cây thư mục trước, AI sẽ dễ:
  - nhét business logic vào controller
  - tạo `common.service.ts` vô định
  - lặp contract giữa web/admin/api
  - kéo code framework-specific vào `packages/shared`

Tóm lại:

- `design/` chốt domain
- file này chốt nơi code phải sống
- hai thứ phải đi cùng nhau mới tránh drift
