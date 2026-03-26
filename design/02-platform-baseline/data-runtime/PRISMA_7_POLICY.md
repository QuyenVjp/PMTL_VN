# PRISMA_7_POLICY

File này chốt adoption stance cho `Prisma 7`.
Nó bổ sung cho schema plan và migration strategy để AI scaffold không dừng ở mức "Prisma là ORM".

Authority chain:

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)
- [VERSION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- [MIGRATION_STRATEGY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md)
- [PRISMA_SCHEMA_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md)
- [NEST_REQUEST_PIPELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)

## Baseline

- exact design pin: `7.5.0`
- Prisma là ORM baseline duy nhất cho `apps/api`
- canonical runtime location là `apps/api/prisma/schema.prisma`
- controller không gọi Prisma trực tiếp; service/module layer mới được chạm data access

## Generator and client stance

- `prisma generate` là build/runtime prerequisite của `apps/api`
- generated `@prisma/client` ownership nằm ở `apps/api`; `packages/shared` chỉ dùng DTO/contracts, không import Prisma models
- không dùng `db push` làm baseline cho shared/dev/prod workflow
- schema merge authority đi qua `PRISMA_SCHEMA_PLAN.md`, không sửa DBML/domain plan và runtime schema mỗi nơi một kiểu

## Query and transaction rules

- mặc định ưu tiên ORM query rõ nghĩa trước khi mở raw SQL
- raw SQL / TypedSQL chỉ dùng tập trung ở chỗ owner rõ và có lý do đo được
- read-modify-write nhạy cảm phải có transaction policy rõ
- dùng `omit`, `strictUndefinedChecks`, và `Prisma.skip` theo canon hiện có

## Migration discipline

- local/dev: `prisma migrate dev`
- deploy/runtime: `prisma migrate deploy`
- migration naming, rollback expectation, seed posture đọc ở `MIGRATION_STRATEGY.md`
- không trộn migration/schema changes vào feature PR nếu chưa có ownership chain rõ

## Forbidden drift

- dùng Prisma như query helper rải khắp controller
- lấy generated Prisma model làm public DTO
- bỏ qua transaction ở flows như refresh rotation, reset revoke-all, dedupe/conflict-sensitive writes
- xem Prisma schema như source-of-truth độc lập với domain schema plan
