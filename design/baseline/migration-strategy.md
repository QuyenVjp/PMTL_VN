# MIGRATION_STRATEGY (Chiến lược migration)

File này chốt `schema evolution strategy (chiến lược tiến hóa lược đồ)` cho hướng `NestJS + Prisma`.

## Core rules

- schema migration và data migration phải được phân biệt rõ
- migration phải idempotent ở mức vận hành hợp lý
- destructive migration cần plan rollback hoặc restore path rõ

## Naming convention

Prisma migration folder nên phản ánh:

- timestamp
- action
- domain

Ví dụ:

- `20260320_init_identity_platform`
- `20260322_add_content_publish_fields`
- `20260324_add_moderation_summary_indexes`

## Categories

### Schema migration

- add table
- add column
- add index
- add constraint
- rename field/table với compatibility plan

### Data migration

- backfill `publicId`
- normalize role values
- derive summary/search fields
- repair orphan media metadata

## Rollout strategy

1. add new nullable field or compatible structure
2. deploy app that can read both old/new shape if needed
3. run backfill safely
4. switch write path fully
5. remove old field only when verified

## Rollback rule

- rollback code first when possible
- rollback DB schema chỉ khi đã hiểu dependency impact
- nếu migration destructive đã applied, restore path có thể phải dùng backup thay vì “down migration”

## Seed strategy

- seed demo data tách khỏi production baseline
- seed admin/super-admin bootstrap phải có policy riêng
- seed file/media refs không được giả vờ binary đã tồn tại nếu storage chưa có

## Required checks before applying production migration

- backup database exists
- restore path documented
- migration reviewed for locks/large rewrites
- app compatibility with new schema confirmed
- post-migration smoke checklist ready
