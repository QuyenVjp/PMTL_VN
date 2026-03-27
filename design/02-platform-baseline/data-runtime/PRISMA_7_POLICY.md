# PRISMA_7_POLICY

File này chốt adoption stance cho `Prisma 7`.
Nó bổ sung cho schema plan và migration strategy để AI scaffold không dừng ở mức "Prisma là ORM".

Authority chain:

- [DECISIONS.md](../../01-repo-constitution/DECISIONS.md)
- [VERSION_MATRIX.md](../../02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- [MIGRATION_STRATEGY.md](../../02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md)
- [PRISMA_QUERY_PATTERN_RULES.md](../../02-platform-baseline/data-runtime/PRISMA_QUERY_PATTERN_RULES.md)
- [PRISMA_SCHEMA_PLAN.md](../../04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md)
- [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)

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
- nếu deployment/runtime dùng pooled connection string còn Prisma CLI cần direct connection riêng, separation đó phải đi qua `prisma.config.ts`; không để migrate/introspection và app runtime dùng chung một URL theo thói quen.
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
- khi có pooled runtime URL, Prisma migrate/introspection phải đi qua `directUrl` tách riêng thay vì tái dùng pooled app URL.
- migration naming, rollback expectation, seed posture đọc ở `MIGRATION_STRATEGY.md`
- không trộn migration/schema changes vào feature PR nếu chưa có ownership chain rõ

## Runtime/bootstrap implications

- NestJS bootstrap không được tự tạo `new PrismaClient()` rải rác; `common/prisma/prisma.service.ts` mới là owner
- nếu dùng ESM-first scaffold line theo official docs, repo vẫn phải giữ import path và build settings thống nhất với Nest runtime decisions; không vừa theo docs mẫu, vừa tạo second pattern trong app
- connection-pool / adapter defaults thay đổi theo v7 phải được review trong same task nếu có timeout/regression evidence; không copy-paste tuning từ v6 by habit
- error formatting, logging, và tracing của Prisma phải đi vào repo logging/observability pipeline; không coi mặc định console formatter của docs là owner behavior

## Canonical pattern examples

### 1. prisma.config.ts — CLI và runtime URL authority

```typescript
// apps/api/prisma.config.ts
import { defineConfig } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrate: {
    // CLI migrate/introspection phải dùng direct URL, không dùng pooled URL
    url: process.env.DIRECT_DATABASE_URL!,
  },
});
```

### 2. schema.prisma — generator đúng cho Prisma 7

```prisma
// apps/api/prisma/schema.prisma
generator client {
  // Prisma 7: generator là "prisma-client", KHÔNG phải "prisma-client-js"
  provider = "prisma-client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooled URL cho app runtime
  directUrl = env("DIRECT_DATABASE_URL") // direct URL cho migrate/introspect
}

// Example: platform table (không phải domain business table)
model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  action     String
  targetType String
  targetId   String?
  meta       Json?
  createdAt  DateTime @default(now())

  @@map("audit_logs")
  @@index([actorId])
  @@index([targetType, targetId])
  @@index([createdAt])
}
```

### 3. PrismaService — singleton owner trong NestJS

```typescript
// apps/api/src/common/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// Rule: mọi module cần Prisma đều inject PrismaService — không new PrismaClient() rải rác
```

### 4. Transaction pattern cho risky write-paths

```typescript
// Correct: transaction bao toàn bộ write-path nhạy cảm
async refreshTokens(oldToken: string, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    // revoke old token
    await tx.session.update({
      where: { token: oldToken },
      data: { revokedAt: new Date() },
    });
    // create new session
    const session = await tx.session.create({
      data: { userId, token: generateToken(), expiresAt: nextExpiry() },
    });
    return session;
  });
}

// Wrong: separate queries without transaction — race condition risk
// await this.prisma.session.update(...);   // ← NO
// await this.prisma.session.create(...);   // ← NO
```

## Forbidden drift

- dùng Prisma như query helper rải khắp controller
- lấy generated Prisma model làm public DTO
- bỏ qua transaction ở flows như refresh rotation, reset revoke-all, dedupe/conflict-sensitive writes
- xem Prisma schema như source-of-truth độc lập với domain schema plan
- scaffold `schema.prisma` mà không có `prisma.config.ts`
- tiếp tục dùng `prisma-client-js` hoặc docs/command patterns cũ như thể v7 chưa đổi
