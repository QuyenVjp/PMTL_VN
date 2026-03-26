# PRISMA_7_POLICY

File này chốt adoption stance cho `Prisma 7`.
Nó bổ sung cho schema plan và migration strategy để AI scaffold không dừng ở mức "Prisma là ORM".

Authority chain:

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)
- [VERSION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- [MIGRATION_STRATEGY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md)
- [PRISMA_QUERY_PATTERN_RULES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/PRISMA_QUERY_PATTERN_RULES.md)
- [PRISMA_SCHEMA_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md)
- [NEST_REQUEST_PIPELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)

## Baseline

- exact design pin: `7.5.0`
- Prisma là ORM baseline duy nhất cho `apps/api`
- canonical runtime location là `apps/api/prisma/schema.prisma`
- canonical config location là `apps/api/prisma.config.ts`
- controller không gọi Prisma trực tiếp; service/module layer mới được chạm data access

## Generator and client stance

- `prisma generate` là build/runtime prerequisite của `apps/api`
- Prisma 7 scaffold mặc định phải bám generator `prisma-client`, không scaffold mới bằng mental model `prisma-client-js`
- generated client ownership nằm ở `apps/api`; `packages/shared` chỉ dùng DTO/contracts, không import Prisma models
- `prisma.config.ts` là CLI/config authority cho:
  - schema path
  - migrations path
  - datasource url
- không dựa vào `--schema`, `--url`, hoặc ad hoc CLI flags cũ làm baseline config contract
- không dùng `db push` làm baseline cho shared/dev/prod workflow
- schema merge authority đi qua `PRISMA_SCHEMA_PLAN.md`, không sửa DBML/domain plan và runtime schema mỗi nơi một kiểu
- Postgres runtime scaffold line hiện bám `@prisma/adapter-pg` + `pg`; không scaffold theo Prisma Postgres managed-product assumptions

## Schema / relation stance

- schema location phải được giải quyết qua `prisma.config.ts`, không đoán theo cwd
- `schema.prisma` và `migrations/` phải ở cùng level dưới `apps/api/prisma/`
- relations, referential actions, database mapping, và indexes là design-first concerns:
  - owner trước ở `PRISMA_SCHEMA_PLAN.md`
  - runtime merge sau ở `schema.prisma`
- implicit relation shortcuts không được override domain design đã chốt nếu domain cần join model explicit

## Query and transaction rules

- mặc định ưu tiên ORM query rõ nghĩa trước khi mở raw SQL
- raw SQL / TypedSQL chỉ dùng tập trung ở chỗ owner rõ và có lý do đo được
- read-modify-write nhạy cảm phải có transaction policy rõ
- dùng `omit`, `strictUndefinedChecks`, và `Prisma.skip` theo canon hiện có

## Migration discipline

- local/dev: `prisma migrate dev`
- deploy/runtime: `prisma migrate deploy`
- `prisma.config.ts` là nơi authority cho connection config dùng bởi Prisma CLI ở v7
- migration naming, rollback expectation, seed posture đọc ở `MIGRATION_STRATEGY.md`
- không trộn migration/schema changes vào feature PR nếu chưa có ownership chain rõ

## Runtime/bootstrap implications

- NestJS bootstrap không được tự tạo `new PrismaClient()` rải rác; `common/prisma/prisma.service.ts` mới là owner
- nếu dùng ESM-first scaffold line theo official docs, repo vẫn phải giữ import path và build settings thống nhất với Nest runtime decisions; không vừa theo docs mẫu, vừa tạo second pattern trong app
- connection-pool / adapter defaults thay đổi theo v7 phải được review trong same task nếu có timeout/regression evidence; không copy-paste tuning từ v6 by habit
- error formatting, logging, và tracing của Prisma phải đi vào repo logging/observability pipeline; không coi mặc định console formatter của docs là owner behavior

## Forbidden drift

- dùng Prisma như query helper rải khắp controller
- lấy generated Prisma model làm public DTO
- bỏ qua transaction ở flows như refresh rotation, reset revoke-all, dedupe/conflict-sensitive writes
- xem Prisma schema như source-of-truth độc lập với domain schema plan
- scaffold `schema.prisma` mà không có `prisma.config.ts`
- tiếp tục dùng `prisma-client-js` hoặc docs/command patterns cũ như thể v7 chưa đổi
