---
name: migration-check
description: Audit a Prisma migration before applying it. Checks for data loss risk, missing indexes, unsafe column changes, and alignment with PMTL_VN data-runtime-keeper rules. Use before running any prisma migrate deploy.
argument-hint: [migration-name or path]
---

# Migration Safety Check

Review the migration: **$ARGUMENTS**

If no argument provided, find and check the latest migration in `prisma/migrations/`.

## Bước 1: Locate the migration

```bash
ls prisma/migrations/ | sort | tail -5
```

Read the `migration.sql` file for the target migration.

## Checklist

### 1. Data loss risk
- Does the migration `DROP COLUMN` on a column that still has data or is referenced by app code?
- Does it `ALTER COLUMN` in a way that truncates data (e.g. varchar(255) → varchar(50))?
- Does it rename a table without a safe copy step?
- Does it `DROP TABLE` — confirm it is truly unused?

### 2. Index coverage
- Are new foreign key columns indexed? (`CREATE INDEX ON table(fk_column)`)
- Are columns used in frequent filter/sort queries indexed?
- Are `publicId` columns indexed? (required in PMTL_VN)
- Are unique constraints scoped correctly (not too broad, not too narrow)?

### 3. Unsafe column changes
- `NOT NULL` additions to existing table without a `DEFAULT` for existing rows?
- Type cast changes (`varchar → int`, `text → uuid`) that can fail at runtime?
- `UNIQUE` constraint additions on columns that may already have duplicates in prod?

### 4. Rollback safety
- Can this migration be rolled back without data loss?
- If not: is there a backup plan documented before deploy?
- Is there a corresponding `down` migration or manual rollback script?

### 5. PMTL_VN schema rules (from design contracts)
- Does the new/changed table match `design/<module>/schema.dbml`?
- Are `publicId` fields present for all user-facing entities? (`@default(cuid())`)
- Are `createdAt` / `updatedAt` timestamps present on every entity table?
- Are soft-delete patterns (`deletedAt DateTime?`) consistent with existing modules?
- Are audit-related tables (`audit_logs`) never modified destructively?
- Are permission/role tables only changed via super-admin controlled flows?

### 6. Migration ordering
- Does this migration depend on another that hasn't been applied yet?
- Are there circular dependencies between migrations?

## Output format

For each issue found:

```
[RISK] Issue type
Migration: <migration-name>
Table/Column: <affected target>
Problem: specific description
Fix: recommended action
Ref: design/<module>/schema.dbml or data-runtime-keeper rules
```

RISK: `BLOCKING` (do not deploy) | `HIGH` (fix before deploy) | `MEDIUM` (address soon) | `LOW` (note for cleanup)

End with:
- Count of issues by risk level
- Either: "✓ Safe to apply" (no BLOCKING or HIGH issues)
- Or: list of items that must be resolved before `prisma migrate deploy`
