# MIGRATION_STRATEGY (Chiến lược migration)

File này chốt schema evolution strategy cho NestJS + Prisma.

> **Migration order**: [CODING_READINESS.md](../../04-execution-overlay/repo/CODING_READINESS.md) Phần 6
> **Prisma schema plan**: `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md`

---

## Core rules

- Schema migration và data migration phải phân biệt rõ
- Migration phải idempotent ở mức vận hành hợp lý
- Destructive migration cần plan rollback hoặc restore path
- **Backup DB TRƯỚC mọi production migration**
- Prisma 7 CLI config authority nằm ở `prisma.config.ts`, không ở các flag ad hoc cũ

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

Prisma 7 note:

- `prisma.config.ts` phải chỉ rõ:
  - `schema`
  - `migrations.path`
  - `datasource.url`
- nếu runtime URL đi qua pooler/connection proxy còn migrate cần direct connection, separation đó phải được khai báo bằng `directUrl` trong `prisma.config.ts`
- không coi `--schema`, `--url`, `--shadow-database-url` kiểu cũ là baseline workflow contract nữa

### Production

```bash
# Apply pending migrations (không tạo mới)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Diff: so sánh schema vs DB hiện tại
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-config-datasource \
  --exit-code
```

Nếu cần so sánh config-backed datasource hai phía, ưu tiên các mode dựa trên `prisma.config.ts`; không khóa repo vào mental model flag cũ khi v7 đã đổi.

Rules:

- không reuse pooled runtime URL cho migrate/deploy/introspection chỉ vì tiện copy env.
- CI/deploy migration lane phải có owner rõ cho direct connection secret nếu direct path được dùng.

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

## Shadow database stance

- Prisma Migrate dựa vào shadow database cho một số workflow diff/migrate dev.
- Shadow DB là tooling concern, không phải application datasource.
- Khi local/dev/staging gặp lỗi shadow database:
  - kiểm tra `prisma.config.ts`
  - kiểm tra quyền tạo/drop schema hoặc database
  - không vá bằng cách đổi thẳng application datasource cho qua lỗi

## Baselining existing database stance

- Nếu về sau PMTL import một database có sẵn:
  - phải baseline rõ migration history
  - không được vừa introspect vừa coi schema hiện hữu là migration history hoàn chỉnh
- Baselining là operation có owner; không làm như bước phụ trong feature PR thường.

---

## Rollback rules

| Situation | Action |
|---|---|
| Migration fail trước commit | Fix migration, rerun |
| Code incompatible với new schema | Rollback code first |
| Migration destructive đã applied | Restore từ backup (không `down` migration) |
| Data migration sai | Chạy corrective migration hoặc restore |

**Rule**: `prisma migrate` không có native "down" migration. Destructive = backup/restore.

## Expand-and-contract stance

- PMTL mặc định dùng expand-and-contract cho thay đổi schema có compatibility risk:
  1. add shape mới tương thích
  2. deploy app đọc được cả hai shape
  3. backfill
  4. switch write path
  5. drop shape cũ ở migration riêng
- rename/drop không được gộp vào một bước “đổi xong là xóa ngay” nếu route/service vẫn còn chance đọc shape cũ trong deploy window

## Down migration / patching stance

- `down migration` chỉ là recovery aid hẹp; không được tạo cảm giác rằng production rollback có thể phụ thuộc hoàn toàn vào down script
- hotfix / patching migration phải:
  - ghi rõ lý do
  - chỉ scope vào drift cần sửa
  - không tranh thủ nhét thêm schema cleanup ngoài incident scope

---

## Seed strategy

### Production seed (bootstrap)

```bash
# Chạy 1 lần khi init DB production
npx prisma db seed
```

Seed production phải tạo:
- Super-admin user (email từ env var, password từ env var)
- 8 feature flags từ [CODING_READINESS.md](../../04-execution-overlay/repo/CODING_READINESS.md) Phần 4
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
