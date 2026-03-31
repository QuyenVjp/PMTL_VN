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

---

## Zero-Downtime Schema Evolution 2026

Enterprise 2026 yêu cầu không có outage khi thay đổi schema. Section này chốt kỹ thuật và quy trình.

### Nguyên tắc cốt lõi

1. **Không bao giờ lock toàn bộ table** khi production đang chạy
2. **Mọi migration phải backward-compatible** trong ít nhất 1 deploy window
3. **Index creation phải CONCURRENTLY** trên Postgres
4. **Column drop chỉ sau khi app code không còn đọc/ghi**

### Zero-downtime migration patterns

| Pattern | Khi nào dùng | Steps |
|---|---|---|
| **Add nullable column** | Thêm field mới | 1. Add nullable → 2. Deploy code xử lý cả có/không có → 3. Backfill → 4. Add NOT NULL constraint (nếu cần) |
| **Rename column** | Đổi tên field | 1. Add new column → 2. Dual-write (code ghi cả hai) → 3. Backfill old→new → 4. Switch read path → 5. Drop old (migration riêng) |
| **Change column type** | Đổi kiểu dữ liệu | 1. Add new column type mới → 2. Dual-write → 3. Backfill+convert → 4. Switch read → 5. Drop old |
| **Add index** | Tăng tốc query | 1. `CREATE INDEX CONCURRENTLY` (không lock) → 2. Verify index usage |
| **Drop column** | Xóa field | 1. Remove code dependency → 2. Deploy → 3. Drop column (migration riêng) |

### Shadow database configuration

```typescript
// prisma.config.ts — Shadow DB cho migration dev/diff workflows
import { defineConfig } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  migrate: {
    // Shadow DB dùng riêng cho diff/dev, không phải production
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
```

Env setup:
```bash
# .env.local hoặc CI secrets
SHADOW_DATABASE_URL="postgresql://user:pass@localhost:5433/pmtl_shadow"
```

Rules:
- Shadow DB không bao giờ là production DB
- Shadow DB credential không được deploy vào container
- Dùng database riêng biệt hoặc schema riêng

### Concurrent index creation

```sql
-- ❌ SAI: Lock table trong production
CREATE INDEX idx_posts_published ON posts(published_at);

-- ✅ ĐÚNG: Không lock table
CREATE INDEX CONCURRENTLY idx_posts_published ON posts(published_at);
```

Prisma migration cho concurrent index:
```sql
-- migrations/YYYYMMDD_add_index_concurrently/migration.sql
-- Prisma không tự động dùng CONCURRENTLY, phải viết raw SQL

-- disable transaction (required for CONCURRENTLY)
-- https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_posts_published" ON "posts"("published_at");
```

### Backfill script template

```typescript
// scripts/backfill-public-id.ts
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import pino from "pino";

const prisma = new PrismaClient();
const logger = pino({ name: "backfill-public-id" });

const BATCH_SIZE = 1000;
const DELAY_MS = 100; // tránh overwhelm DB

async function backfill() {
  let processed = 0;
  let hasMore = true;

  logger.info({ msg: "backfill.start", table: "posts" });

  while (hasMore) {
    const batch = await prisma.post.findMany({
      where: { publicId: null },
      take: BATCH_SIZE,
      select: { id: true },
    });

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    // Batch update
    await prisma.$transaction(
      batch.map((row) =>
        prisma.post.update({
          where: { id: row.id },
          data: { publicId: nanoid(21) },
        })
      )
    );

    processed += batch.length;
    logger.info({ msg: "backfill.progress", processed, batchSize: batch.length });

    // Rate limit để không overwhelm production
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  logger.info({ msg: "backfill.complete", totalProcessed: processed });
}

backfill()
  .catch((e) => {
    logger.error({ msg: "backfill.failed", error: e.message });
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Usage:
```bash
# Test trên staging trước
DATABASE_URL="..." npx ts-node scripts/backfill-public-id.ts

# Production với monitoring
DATABASE_URL="..." LOG_LEVEL=info npx ts-node scripts/backfill-public-id.ts 2>&1 | tee backfill.log
```

### Rollback plan template

| Phase | Action | Rollback |
|---|---|---|
| 1. Schema expand | Add nullable column | Drop column (safe nếu code chưa dùng) |
| 2. Code dual-write | Deploy code ghi cả old+new | Rollback code version |
| 3. Backfill | Script fill data | Chạy lại backfill hoặc truncate new column |
| 4. Code switch | Switch read path sang new | Rollback code version |
| 5. Schema contract | Drop old column | **KHÔNG rollback được** → Restore từ backup |

### Large table migration strategy

Với table > 1M rows:

1. **Estimate lock time**: `EXPLAIN ANALYZE` trên staging
2. **Schedule maintenance window** nếu cần (dù minimal)
3. **Use batched backfill** với progress logging
4. **Monitor connections** trong quá trình migration
5. **Have rollback script ready** trước khi bắt đầu

```sql
-- Estimate row count và size
SELECT 
  relname as table,
  reltuples as row_estimate,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
WHERE relname = 'posts';
```

### Migration checklist (Zero-Downtime)

- [ ] Migration script reviewed cho table locks
- [ ] `CREATE INDEX CONCURRENTLY` được dùng cho tất cả indexes
- [ ] Backfill script đã test trên staging với production-like data
- [ ] Rollback plan documented và tested
- [ ] App code backward-compatible với cả old và new schema
- [ ] Monitoring alerts configured cho migration duration
- [ ] Communication plan cho team nếu migration kéo dài
- [ ] Shadow DB configured (nếu dùng Prisma diff workflows)
