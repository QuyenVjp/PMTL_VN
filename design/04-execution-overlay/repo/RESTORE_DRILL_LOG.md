# RESTORE_DRILL_LOG

File này dùng để ghi evidence cho restore drill thật.
Không được ghi "pass" nếu chưa chạy thật.

## Current status

- Có 1 drill record `pass` (dev environment, 2026-03-27).
- Production drill chưa chạy — cần chạy trên staging/prod trước khi gọi là `production-safe`.

## Drill Records

### Drill #1 — Dev Environment

- Date: 2026-03-27
- Operator: Claude Code (Principal Software Architect)
- Environment: dev (Docker compose.dev.yml)
- Backup source: docker-postgres-1 (pmtl database)
- Backup timestamp: 2026-03-27 (session time)
- Backup artifact id / filename: `backups/dev/postgres/drill-20260327.dump`
- Backup file size: 32K
- Release artifact expected before restore: commit af015be7+ (Phase 3 session)
- Corresponding deploy record: dev-local
- Restore start: 2026-03-27 session
- Restore end: 2026-03-27 session
- Duration: < 5 seconds
- Scope:
  - DB: `pass`
  - media: N/A (no media assets in dev DB)
  - app boot: N/A (restore-only drill, not full boot)
- Result: `pass`

#### Verification

- Backup integrity (pg_restore --list): `pass`
- Restore (pg_restore --clean --if-exists): `pass`
- Table count after restore: 9 tables in public schema
- Row spot-check:
  - users: 0 rows (empty dev DB)
  - sessions: 0 rows
  - audit_logs: 0 rows
  - posts: 0 rows
  - media_assets: 0 rows
  - webhook_deliveries: N/A (Prisma migration not yet applied for new model)

#### Issues found

- issue 1: `webhook_deliveries` table not yet created — Prisma schema added but migration not applied. Expected for schema-only additions.

#### Follow-up items

- item 1: Run `prisma migrate dev` to create webhook_deliveries table, then re-verify.
- item 2: Run production drill on staging/prod environment before first public launch.

---

## Template

### Drill record

- Date:
- Operator:
- Environment:
- Backup source:
- Backup timestamp:
- Backup artifact id / filename:
- Release artifact expected before restore:
- Release artifact expected after rollback check:
- Corresponding deploy record:
- Restore start:
- Restore end:
- Duration:
- Scope:
  - DB
  - media
  - app boot
- Result:
  - `pass`
  - `fail`

### Verification

- `/health/live`:
- `/health/ready`:
- `/health/startup`:
- deployed commit SHA verified:
- migration revision verified:
- sample canonical read:
- auth smoke check:
- media sample check:
- migration state check:
- wisdom sample check:
- offline bundle delta check:

### Artifact pinning / rollback proof

- backup artifact pinned to deploy record:
  - `yes`
  - `no`
- release artifact pinned by immutable SHA/tag:
  - `yes`
  - `no`
- rollback target artifact identified:
- rollback rehearsal attempted:
  - `yes`
  - `no`
- rollback rehearsal result:
  - `pass`
  - `fail`
- post-rollback `/health/ready`:
- post-rollback sample read:
- post-rollback search status:

### Wisdom / offline verification checklist

- published wisdom sample size:
- QA sample size:
- verified fields checked:
  - `sourceUrl`
  - `sourceProvenance`
  - `reviewStatus`
  - `publishedAt`
- offline bundle checked:
  - `yes`
  - `no`
- offline bundle version before/after restore:
- offline delta route result:
  - `pass`
  - `fail`
- manifest vs DB entry count match:
  - `yes`
  - `no`
- deleted/tombstone sample checked:
  - `yes`
  - `no`

### Media consistency checklist

- media backup artifact used:
- media sample size:
- missing asset count:
- orphan asset count:
- mismatch rate:
- naming/path root verified:
- recovery action attempted:
- threshold exceeded:
  - `yes`
  - `no`

### Issues found

- issue 1:
- issue 2:

Mỗi issue phải ghi rõ:
- artifact hoặc sample liên quan
- `missing` hay `orphan`
- số lượng / tỷ lệ
- recovery path đã thử

### Fixes applied

- fix 1:
- fix 2:

### Follow-up items

- item 1:
- item 2:

## Minimum rule

- Ít nhất phải có `1` drill record thật trước first public launch.
- Nếu record gần nhất là `fail`, hệ không được gọi là `production-safe`.
- Nếu media consistency checklist vượt ngưỡng fail mà vẫn ghi `pass`, record đó không hợp lệ.
- Nếu wisdom/offline verification bị bỏ trống trong khi module này đã public, record đó không được coi là full restore evidence.
- Nếu `backup artifact` hoặc `release artifact` không pin rõ bằng id/SHA/tag, record đó không được coi là rollback proof đầy đủ.
