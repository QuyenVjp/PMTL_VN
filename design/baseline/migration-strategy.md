# MIGRATION_STRATEGY (Chiến lược migration)

File này chốt schema evolution strategy cho NestJS + Prisma.

> **Migration order**: `tracking/coding-readiness.md` Phần 6
> **Prisma schema plan**: `tracking/prisma-schema-plan.md`

---

## Core rules

- Schema migration và data migration phải phân biệt rõ
- Migration phải idempotent ở mức vận hành hợp lý
- Destructive migration cần plan rollback hoặc restore path
- **Backup DB TRƯỚC mọi production migration**

---

## Naming convention

```
<timestamp>_<action>_<domain>

Ví dụ:
  20260320_init_platform_tables
  20260320_init_identity_users_sessions
  20260321_add_content_posts_media
  20260322_add_community_comments_guestbook
  20260323_add_engagement_practice_logs
  20260324_add_moderation_reports
  20260325_add_calendar_events_lunar
  20260326_add_notification_push
  20260327_add_vows_merit_journal
  20260328_add_wisdom_qa_offline
```

---

## Prisma commands (chốt)

### Development

```bash
# Tạo migration mới sau khi sửa schema.prisma
npx prisma migrate dev --name <migration_name>

# Reset toàn bộ DB (dev only!)
npx prisma migrate reset

# Generate Prisma Client sau khi thay đổi schema
npx prisma generate

# Mở Prisma Studio (visual DB browser)
npx prisma studio

# Validate schema syntax
npx prisma validate

# Format schema file
npx prisma format
```

### Production

```bash
# Apply pending migrations (không tạo mới)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Diff: so sánh schema vs DB hiện tại
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --exit-code
```

---

## Migration categories

### Schema migration (DDL)

| Action | Risk | Rollback |
|---|---|---|
| Add table | Low | Drop table |
| Add nullable column | Low | Drop column |
| Add index | Low–Med | Drop index (có thể lock table lớn) |
| Add constraint | Med | Drop constraint |
| Rename field/table | Med–High | Cần compatibility plan |
| Drop column/table | **High** | Restore only |

### Data migration (DML)

| Action | Ví dụ | Strategy |
|---|---|---|
| Backfill field | Thêm `publicId` cho rows cũ | Script chạy sau schema migration |
| Normalize values | Chuẩn hóa role values | Batch update với WHERE clause |
| Derive computed fields | Build search text, summary | Batch job, có thể chạy lại |
| Repair orphans | Fix media metadata mồ côi | Script + audit log |

---

## Multi-step migration example

**Scenario**: Thêm `publicId` column vào `posts` table.

```
Step 1 — Schema migration:
  ALTER TABLE posts ADD COLUMN public_id TEXT;
  → Nullable trước, không NOT NULL ngay

Step 2 — Data migration (backfill):
  UPDATE posts SET public_id = gen_random_uuid()::text
  WHERE public_id IS NULL;

Step 3 — Schema migration (enforce):
  ALTER TABLE posts ALTER COLUMN public_id SET NOT NULL;
  ALTER TABLE posts ADD CONSTRAINT posts_public_id_unique UNIQUE (public_id);

Step 4 — Deploy app code sử dụng publicId

Step 5 — Verify: SELECT COUNT(*) FROM posts WHERE public_id IS NULL; → 0
```

---

## Rollout strategy

1. Add new nullable field hoặc compatible structure
2. Deploy app that can read both old/new shape
3. Run backfill safely (batch, có progress log)
4. Switch write path fully
5. Remove old field only when verified (separate migration)

**Rule**: Không drop column trong cùng deploy với add column. Tối thiểu 1 deploy cycle giữa add → drop.

---

## Rollback rules

| Situation | Action |
|---|---|
| Migration fail trước commit | Fix migration, rerun |
| Code incompatible với new schema | Rollback code first |
| Migration destructive đã applied | Restore từ backup (không `down` migration) |
| Data migration sai | Chạy corrective migration hoặc restore |

**Rule**: `prisma migrate` không có native "down" migration. Destructive = backup/restore.

---

## Seed strategy

### Production seed (bootstrap)

```bash
# Chạy 1 lần khi init DB production
npx prisma db seed
```

Seed production phải tạo:
- Super-admin user (email từ env var, password từ env var)
- 8 feature flags từ `coding-readiness.md` Phần 4
- Lookup data: categories, lunar events

### Development seed

- Dùng Faker.js cho realistic demo data
- Tách riêng khỏi production seed
- Không giả vờ binary file đã tồn tại nếu storage chưa có

---

## Required checks before production migration

- [ ] Backup database exists (verified)
- [ ] Restore path documented
- [ ] Migration reviewed for table locks / large rewrites
- [ ] App compatibility confirmed (can run with new schema)
- [ ] Post-migration smoke checklist ready
- [ ] `prisma migrate status` shows expected state
- [ ] Data migration script tested on staging/copy first
